// Renders the link-preview images in public/og/ from template.html, using the
// default-locale (uz) copy. Re-run after changing that copy:  pnpm og:images
//
// The PNGs are committed rather than built in CI, which has no browser.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import process from "node:process"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const uz = JSON.parse(readFileSync(join(root, "src/shared/config/i18n/uz.json"), "utf8"))
const outDir = join(root, "public/og")
const WIDTH = 1200
const HEIGHT = 630

const chrome =
  process.env.CHROME ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((path) => existsSync(path))
if (!chrome) throw new Error("Chrome not found; set CHROME to its executable")

const { services } = uz
// The title already says what the service is, so the footer line names its two
// headline capabilities instead.
const service = (key) => ({
  eyebrow: services[key].eyebrow,
  title: services[key].title,
  sub: services[key].features.items
    .slice(0, 2)
    .map((item) => item.title)
    .join(" · "),
})

// File names must match ogImage in src/shared/config/seoPages.ts.
const images = {
  home: {
    eyebrow: uz.hero.badge,
    title: uz.hero.titleTop,
    highlight: uz.hero.titleHighlight,
    sub: [services.voice.name, services.rag.name, services.video.name, "CRM"].join(" · "),
  },
  rag: service("rag"),
  voice: service("voice"),
  video: service("video"),
}

const pngSize = (file) => {
  const header = readFileSync(file).subarray(16, 24)
  return [header.readUInt32BE(0), header.readUInt32BE(4)]
}

mkdirSync(outDir, { recursive: true })
const template = pathToFileURL(join(root, "build/og/template.html"))

// A throwaway profile keeps Chrome from handing the job to a browser the user
// already has open, which returns before the file is written.
const profile = mkdtempSync(join(tmpdir(), "doppi-og-"))

try {
  for (const [name, copy] of Object.entries(images)) {
    const out = join(outDir, `${name}.png`)
    const url = new URL(template)
    for (const [key, value] of Object.entries(copy)) url.searchParams.set(key, value)

    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--disable-crash-reporter",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        `--window-size=${WIDTH},${HEIGHT}`,
        "--allow-file-access-from-files",
        "--virtual-time-budget=5000",
        `--user-data-dir=${profile}`,
        `--screenshot=${out}`,
        url.href,
      ],
      { stdio: "ignore" }
    )

    const [width, height] = pngSize(out)
    if (width !== WIDTH || height !== HEIGHT) {
      throw new Error(`${out} is ${width}x${height}, expected ${WIDTH}x${HEIGHT}`)
    }
    console.log(`public/og/${name}.png  ${width}x${height}`)
  }
} finally {
  // On Windows a lingering Chrome helper can still hold a file here; the
  // profile sits in the OS temp directory, so leaving it behind is harmless.
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch {
    console.warn(`could not remove ${profile}; it is safe to delete later`)
  }
}
