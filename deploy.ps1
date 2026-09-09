#Requires -Version 5.1
<#
.SYNOPSIS
    Do'ppi.ai landing sahifasini doppiai.uz serveriga deploy qiladi.

.DESCRIPTION
    Loyihani build qiladi, dist/ ni arxivlab serverga yuboradi va
    saytni yangi versiyaga almashtiradi. Eski versiya serverda
    saqlanib qoladi, shuning uchun xato bo'lsa darhol qaytarish mumkin.

    Ulanish parolsiz — ~/.ssh/doppiai_deploy SSH kaliti orqali.

.PARAMETER SkipBuild
    Build bosqichini o'tkazib yuboradi va mavjud dist/ papkasini yuboradi.

.PARAMETER Rollback
    Deploy qilmaydi, oldingi versiyani qaytaradi.

.EXAMPLE
    .\deploy.ps1
    To'liq deploy: build + yuklash + almashtirish + tekshirish.

.EXAMPLE
    .\deploy.ps1 -SkipBuild
    Qayta build qilmasdan, tayyor dist/ ni yuboradi.

.EXAMPLE
    .\deploy.ps1 -Rollback
    Oldingi versiyaga qaytaradi.
#>
[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$Rollback
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------- sozlamalar
$Server     = "root@169.58.183.151"
$SshKey     = Join-Path $env:USERPROFILE ".ssh\doppiai_deploy"
$RemoteRoot = "/var/www/doppiai.uz"
$RemoteTmp  = "/tmp/doppiai-dist.tar.gz"
$SiteUrl    = "https://doppiai.uz"
$ProjectDir = $PSScriptRoot
# ---------------------------------------------------------------------------

$SshOpts = @(
    "-i", $SshKey,
    "-o", "IdentitiesOnly=yes",
    "-o", "BatchMode=yes",
    "-o", "StrictHostKeyChecking=accept-new",
    "-o", "ConnectTimeout=20"
)

function Write-Step { param([string]$Message) Write-Host "`n==> $Message" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Message) Write-Host "    $Message" -ForegroundColor Green }
function Write-Info { param([string]$Message) Write-Host "    $Message" -ForegroundColor DarkGray }

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

Write-Host ""
Write-Host "  Do'ppi.ai deploy -> doppiai.uz" -ForegroundColor White
Write-Host "  ------------------------------" -ForegroundColor DarkGray

# --------------------------------------------------------------- tekshiruvlar
if (-not (Test-Path $SshKey)) {
    $keyHelp = @(
        "SSH kaliti topilmadi: $SshKey",
        'Kalitni qayta yaratish uchun:',
        '  ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\doppiai_deploy" -N ''""'' -C "doppiai-deploy"',
        'So''ng ochiq kalitni serverga qo''shing:',
        '  type "$env:USERPROFILE\.ssh\doppiai_deploy.pub" | ssh root@169.58.183.151 "cat >> /root/.ssh/authorized_keys"'
    ) -join [Environment]::NewLine
    Stop-WithError $keyHelp
}

Write-Step "Serverga ulanish tekshirilmoqda"
$null = Invoke-Remote "echo ok" "Serverga ulanib bo'lmadi. Internet aloqasini va SSH kalitni tekshiring."
Write-Ok "Ulanish muvaffaqiyatli ($Server)"

# ------------------------------------------------------------------- rollback
if ($Rollback) {
    Write-Step "Oldingi versiyaga qaytarilmoqda"

    $rollbackCmd = @(
        "test -d '$RemoteRoot.prev'",
        "rm -rf '$RemoteRoot.swap'",
        "mv '$RemoteRoot' '$RemoteRoot.swap'",
        "mv '$RemoteRoot.prev' '$RemoteRoot'",
        "mv '$RemoteRoot.swap' '$RemoteRoot.prev'"
    ) -join " && "

    $null = Invoke-Remote $rollbackCmd "Qaytarish muvaffaqiyatsiz. Serverda saqlangan oldingi versiya ($RemoteRoot.prev) topilmadi."
    Write-Ok "Oldingi versiya tiklandi"

    try {
        $check = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 30 -Headers @{ "Cache-Control" = "no-cache" }
        Write-Ok "Sayt javob bermoqda: HTTP $($check.StatusCode)"
    } catch {
        Stop-WithError "Sayt javob bermayapti: $($_.Exception.Message)"
    }

    Write-Host "`n  Qaytarish tugadi. $SiteUrl" -ForegroundColor Green
    Write-Info "Yana bir marta -Rollback ishlatsangiz, avvalgi holatga qaytadi."
    Write-Host ""
    exit 0
}

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
Write-Ok "Yuklandi"

# ---------------------------------------------------------------- almashtirish
# Yangi versiya avval alohida papkaga ochiladi, keyingina joriy papka bilan
# almashtiriladi. Shu sabab sayt yarim yangilangan holatda qolmaydi.
Write-Step "Sayt yangi versiyaga almashtirilmoqda"

$deployCmd = @(
    "rm -rf '$RemoteRoot.new'",
    "mkdir -p '$RemoteRoot.new'",
    "tar -xzf '$RemoteTmp' -C '$RemoteRoot.new'",
    "test -f '$RemoteRoot.new/index.html'",
    "chown -R www-data:www-data '$RemoteRoot.new'",
    "find '$RemoteRoot.new' -type d -exec chmod 755 {} +",
    "find '$RemoteRoot.new' -type f -exec chmod 644 {} +",
    "rm -rf '$RemoteRoot.prev'",
    "if [ -d '$RemoteRoot' ]; then mv '$RemoteRoot' '$RemoteRoot.prev'; fi",
    "mv '$RemoteRoot.new' '$RemoteRoot'",
    "rm -f '$RemoteTmp'"
) -join " && "

$null = Invoke-Remote $deployCmd "Serverda almashtirish muvaffaqiyatsiz. Sayt eski versiyada qoldi."
Write-Ok "Fayllar o'rnatildi ($RemoteRoot)"

Remove-Item $tarPath -Force -ErrorAction SilentlyContinue

# ------------------------------------------------------------------ tekshirish
Write-Step "Natija tekshirilmoqda"

try {
    $response = Invoke-WebRequest -Uri $SiteUrl -UseBasicParsing -TimeoutSec 30 -Headers @{ "Cache-Control" = "no-cache" }
} catch {
    Stop-WithError "Sayt javob bermayapti: $($_.Exception.Message)`nQaytarish uchun: .\deploy.ps1 -Rollback"
}

if ($response.StatusCode -ne 200) {
    Stop-WithError "Sayt HTTP $($response.StatusCode) qaytardi.`nQaytarish uchun: .\deploy.ps1 -Rollback"
}
Write-Ok "HTTP $($response.StatusCode) — sayt ochilmoqda"

$liveBundle = Get-BundleName $response.Content
if ($localBundle -and $liveBundle) {
    if ($localBundle -eq $liveBundle) {
        Write-Ok "Eng oxirgi versiya efirda ($liveBundle)"
    } else {
        Write-Host "    [OGOHLANTIRISH] Serverdagi versiya mos kelmadi." -ForegroundColor Yellow
        Write-Host "    Kutilgan: $localBundle / Serverda: $liveBundle" -ForegroundColor Yellow
        Write-Host "    Brauzer keshi bo'lishi mumkin — Ctrl+F5 bilan tekshiring." -ForegroundColor Yellow
    }
}

Write-Host "`n  Deploy muvaffaqiyatli tugadi -> $SiteUrl" -ForegroundColor Green
Write-Info "Muammo bo'lsa qaytarish: .\deploy.ps1 -Rollback"
Write-Host ""
