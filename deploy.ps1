#Requires -Version 5.1
<#
.SYNOPSIS
    Do'ppi.ai frontendini doppiai.uz serveriga deploy qiladi.

.DESCRIPTION
    Loyihani build qiladi, dist/ ni arxivlab serverga yuboradi va saytni yangi
    versiyaga almashtiradi. Har bir deploy serverda alohida release papkasiga
    ochiladi, `current` symlink esa bitta harakatda yangisiga ko'chadi, shuning
    uchun sayt yarim yangilangan holatda qolmaydi.

    Oxirgi releaselar serverda saqlanib qoladi, xato bo'lsa -Rollback bilan
    darhol qaytarish mumkin.

    Almashtirishni serverdagi /usr/local/bin/doppiai-release bajaradi
    (manbasi: deploy/doppiai-release.sh). GitHub Actions ham aynan shu
    skriptni chaqiradi, shuning uchun qo'lda va CI deploy bir xil ishlaydi.

    Ulanish parolsiz — ~/.ssh/doppiai_gcp SSH kaliti orqali.

.PARAMETER SkipBuild
    Build bosqichini o'tkazib yuboradi va mavjud dist/ papkasini yuboradi.

.PARAMETER Rollback
    Deploy qilmaydi, oldingi releasega qaytaradi.

.EXAMPLE
    .\deploy.ps1
    To'liq deploy: build + yuklash + almashtirish + tekshirish.

.EXAMPLE
    .\deploy.ps1 -SkipBuild
    Qayta build qilmasdan, tayyor dist/ ni yuboradi.

.EXAMPLE
    .\deploy.ps1 -Rollback
    Oldingi releasega qaytaradi.
#>
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$Rollback
)

$ErrorActionPreference = "Stop"

# Windows PowerShell 5.1 eski .NET da TLS 1.2 ni o'zi yoqmasligi mumkin,
# server esa faqat TLS 1.2/1.3 qabul qiladi.
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

# ---------------------------------------------------------------- sozlamalar
$Server       = "doppiai@34.27.103.62"
$SshPort      = 8800
$SshKey       = Join-Path $env:USERPROFILE ".ssh\doppiai_gcp"
$RemoteRoot   = "/var/www/doppiai.uz"
$RemoteTmp    = "/tmp/doppiai-dist.tar.gz"
$SiteUrl      = "https://doppiai.uz"
$ReleaseCmd   = "/usr/local/bin/doppiai-release"
$ProjectDir   = $PSScriptRoot

# Build muhiti .github/workflows/ci-cd.yml bilan bir xil bo'lishi shart:
# bular berilmasa, masalan, email orqali kirish jimgina yoqilib qoladi.
$BuildEnv = @{
    VITE_API_BASE_URL          = "/api/v1"
    VITE_GOOGLE_OAUTH_URL      = "/api/v1/auth/oauth/google/authorize"
    VITE_EMAIL_AUTH_ENABLED    = "false"
    VITE_TELEGRAM_AUTH_ENABLED = "false"
}
# ---------------------------------------------------------------------------

$SshOpts = @(
    "-i", $SshKey,
    # -o Port ssh va scp uchun bir xil ishlaydi (-p / -P farqiga tushmaslik uchun).
    "-o", "Port=$SshPort",
    "-o", "IdentitiesOnly=yes",
    "-o", "BatchMode=yes",
    "-o", "StrictHostKeyChecking=accept-new",
    "-o", "ConnectTimeout=20"
)

function Write-Step { param([string]$Message) Write-Host "`n==> $Message" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Message) Write-Host "    $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "    $Message" -ForegroundColor DarkGray }
function Write-Warn { param([string]$Message) Write-Host "    $Message" -ForegroundColor Yellow }

function Stop-WithError {
    param([string]$Message)
    Write-Host "`n[XATO] $Message" -ForegroundColor Red
    exit 1
}

function Invoke-Remote {
    param([string]$Command, [string]$FailMessage)
    $output = ssh @SshOpts $Server $Command
    if ($LASTEXITCODE -ne 0) {
        if ($output) { Write-Host $output -ForegroundColor DarkYellow }
        Stop-WithError $FailMessage
    }
    return $output
}

# index.html ichidagi asosiy JS bundle nomini ajratib oladi (masalan index-BFTAELfG.js).
# Deploydan keyin serverda aynan shu fayl ko'rsatilayotganini tekshirish uchun ishlatiladi.
function Get-BundleName {
    param([string]$Html)
    $match = [regex]::Match($Html, 'assets/(index-[A-Za-z0-9_-]+\.js)')
    if ($match.Success) { return $match.Groups[1].Value }
    return $null
}

function Get-Page {
    param([string]$Url)
    try {
        return Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -Headers @{ "Cache-Control" = "no-cache" }
    } catch {
        Stop-WithError "Sayt javob bermayapti ($Url): $($_.Exception.Message)`nQaytarish uchun: .\deploy.ps1 -Rollback"
    }
}

Write-Host ""
Write-Host "  Do'ppi.ai deploy -> doppiai.uz" -ForegroundColor White
Write-Host "  ------------------------------" -ForegroundColor DarkGray

# --------------------------------------------------------------- tekshiruvlar
if (-not (Test-Path $SshKey)) {
    $keyHelp = @(
        "SSH kaliti topilmadi: $SshKey",
        "doppiai@34.27.103.62 (port $SshPort) uchun maxfiy kalitni shu manzilga saqlang va",
        "faqat o'zingizga o'qish huquqini qoldiring:",
        '  icacls "$env:USERPROFILE\.ssh\doppiai_gcp" /inheritance:r /grant:r "$($env:USERNAME):(R)"'
    ) -join [Environment]::NewLine
    Stop-WithError $keyHelp
}

Write-Step "Serverga ulanish tekshirilmoqda"
$null = Invoke-Remote "echo ok" "Serverga ulanib bo'lmadi. Internet aloqasini va SSH kalitni tekshiring."
Write-Ok "Ulanish muvaffaqiyatli ($Server)"
$null = Invoke-Remote "test -x $ReleaseCmd" "Serverda $ReleaseCmd o'rnatilmagan. O'rnatish tartibi: README.md -> Deployment."

# ------------------------------------------------------------------- rollback
if ($Rollback) {
    Write-Step "Oldingi releasega qaytarilmoqda"

    $restored = Invoke-Remote "$ReleaseCmd rollback" "Qaytarish muvaffaqiyatsiz. Serverda saqlangan oldingi release topilmadi."
    Write-Ok "Release tiklandi ($restored)"

    $check = Get-Page $SiteUrl
    Write-Ok "Sayt javob bermoqda: HTTP $($check.StatusCode)"

    Write-Host "`n  Qaytarish tugadi. $SiteUrl" -ForegroundColor Green
    Write-Info "Yana bir marta -Rollback ishlatsangiz, avvalgi holatga qaytadi."
    Write-Host ""
    exit 0
}

# --------------------------------------------------------------- release nomi
# Commit va vaqt birga: bir commitni qayta deploy qilish hozir efirda turgan
# papkani ustidan yozmaydi.
Push-Location $ProjectDir
try {
    $commit = git rev-parse --short=12 HEAD
    if ($LASTEXITCODE -ne 0 -or -not $commit) { Stop-WithError "git commit aniqlanmadi." }
    $dirty = git status --porcelain
} finally {
    Pop-Location
}

$release = "$($commit.Trim())-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if ($dirty) {
    $release = "$release-dirty"
    Write-Warn "Diqqat: commit qilinmagan o'zgarishlar bor, ular ham deploy bo'ladi."
}
Write-Info "Release: $release"

# ---------------------------------------------------------------------- build
$distDir = Join-Path $ProjectDir "dist"

if ($SkipBuild) {
    Write-Step "Build o'tkazib yuborildi (-SkipBuild)"
    if (-not (Test-Path (Join-Path $distDir "index.html"))) {
        Stop-WithError "dist/index.html topilmadi. -SkipBuild ni olib tashlab qayta ishga tushiring."
    }
    Write-Info "Mavjud dist/ papkasi ishlatilmoqda"
} else {
    Write-Step "Loyiha build qilinmoqda"

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        Stop-WithError "pnpm topilmadi. O'rnatish uchun: npm install -g pnpm@9.15.2"
    }

    Push-Location $ProjectDir
    try {
        if (Test-Path $distDir) { Remove-Item $distDir -Recurse -Force }
        foreach ($name in $BuildEnv.Keys) { Set-Item -Path "env:$name" -Value $BuildEnv[$name] }
        pnpm build
        if ($LASTEXITCODE -ne 0) { Stop-WithError "Build muvaffaqiyatsiz tugadi. Yuqoridagi xatolarni tuzating." }
    } finally {
        Pop-Location
    }

    if (-not (Test-Path (Join-Path $distDir "index.html"))) {
        Stop-WithError "Build tugadi, lekin dist/index.html yaratilmadi."
    }
    Write-Ok "Build tayyor"
}

$localHtml   = Get-Content (Join-Path $distDir "index.html") -Raw
$localBundle = Get-BundleName $localHtml
$distSize    = [math]::Round(((Get-ChildItem $distDir -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 2)
Write-Info "dist/ hajmi: $distSize MB"

# -------------------------------------------------------------------- arxivlash
Write-Step "Arxiv tayyorlanmoqda"
$tarPath = Join-Path $env:TEMP "doppiai-dist.tar.gz"
if (Test-Path $tarPath) { Remove-Item $tarPath -Force }

tar -czf $tarPath -C $distDir .
if ($LASTEXITCODE -ne 0) { Stop-WithError "Arxiv yaratilmadi (tar xatosi)." }

$tarSize = [math]::Round(((Get-Item $tarPath).Length / 1MB), 2)
Write-Ok "Arxiv tayyor: $tarSize MB"

# --------------------------------------------------------------------- yuklash
Write-Step "Serverga yuklanmoqda"
scp @SshOpts $tarPath "${Server}:$RemoteTmp"
if ($LASTEXITCODE -ne 0) { Stop-WithError "Fayl serverga yuklanmadi." }
Remove-Item $tarPath -Force -ErrorAction SilentlyContinue
Write-Ok "Yuklandi"

# ---------------------------------------------------------------- almashtirish
Write-Step "Sayt yangi releasega almashtirilmoqda"
$null = Invoke-Remote "$ReleaseCmd activate '$release' < '$RemoteTmp'; status=`$?; rm -f '$RemoteTmp'; exit `$status" "Serverda almashtirish muvaffaqiyatsiz. Sayt eski releaseda qoldi."
Write-Ok "Release o'rnatildi ($RemoteRoot/releases/$release)"

# ------------------------------------------------------------------ tekshirish
Write-Step "Natija tekshirilmoqda"

$response = Get-Page $SiteUrl
if ($response.StatusCode -ne 200) {
    Stop-WithError "Sayt HTTP $($response.StatusCode) qaytardi.`nQaytarish uchun: .\deploy.ps1 -Rollback"
}
Write-Ok "HTTP $($response.StatusCode) — sayt ochilmoqda"

# Ichki sahifalar nginx dagi SPA fallback orqali ochiladi; u buzilsa faqat
# bosh sahifa ishlab, qolganlari 404 beradi.
$null = Get-Page "$SiteUrl/login"
Write-Ok "Ichki sahifalar ochilmoqda (/login)"

$liveBundle = Get-BundleName $response.Content
if ($localBundle -and $liveBundle) {
    if ($localBundle -eq $liveBundle) {
        Write-Ok "Eng oxirgi versiya efirda ($liveBundle)"
    } else {
        Write-Warn "[OGOHLANTIRISH] Serverdagi versiya mos kelmadi."
        Write-Warn "Kutilgan: $localBundle / Serverda: $liveBundle"
        Write-Warn "Brauzer keshi bo'lishi mumkin — Ctrl+F5 bilan tekshiring."
    }
}

Write-Host "`n  Deploy muvaffaqiyatli tugadi -> $SiteUrl" -ForegroundColor Green
Write-Info "Muammo bo'lsa qaytarish: .\deploy.ps1 -Rollback"
Write-Host ""
