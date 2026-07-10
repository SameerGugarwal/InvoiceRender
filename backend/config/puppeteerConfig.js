import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Finds a Chrome binary inside a Puppeteer cache directory
 * (layout: <cache>/chrome/<platform-version>/chrome-<platform>/chrome)
 */
function findChromeInCache(cacheDir) {
  try {
    const chromeRoot = path.join(cacheDir, 'chrome');
    for (const version of fs.readdirSync(chromeRoot)) {
      const versionDir = path.join(chromeRoot, version);
      for (const sub of fs.readdirSync(versionDir)) {
        const candidates = [
          path.join(versionDir, sub, 'chrome'),
          path.join(versionDir, sub, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing'),
        ];
        for (const candidate of candidates) {
          if (fs.existsSync(candidate)) return candidate;
        }
      }
    }
  } catch {
    // cache dir missing or unreadable — try the next one
  }
  return undefined;
}

function resolveExecutablePath() {
  // 1. Explicit paths, but only if they actually exist on this machine
  const explicit = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome-stable',
  ].filter(Boolean);

  for (const p of explicit) {
    if (fs.existsSync(p)) return p;
  }

  // 2. Browsers installed via `npx puppeteer browsers install chrome`
  const cacheDirs = [
    process.env.PUPPETEER_CACHE_DIR,
    path.resolve(__dirname, '..', '.cache', 'puppeteer'), // project-local (render-build.sh)
    process.env.HOME ? path.join(process.env.HOME, '.cache', 'puppeteer') : undefined,
  ].filter(Boolean);

  for (const dir of cacheDirs) {
    const found = findChromeInCache(dir);
    if (found) return found;
  }

  // 3. Let Puppeteer resolve its own bundled browser
  return undefined;
}

const executablePath = resolveExecutablePath();
console.log(`[Puppeteer] Using Chrome executable: ${executablePath || '(puppeteer default)'}`);

export const puppeteerLaunchArgs = {
  headless: true,
  executablePath,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
  ],
};

export const pdfRenderOptions = {
  format: 'A4',
  printBackground: true,
  margin: {
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
};

export const viewportOptions = {
  width: 794,
  height: 1123,
  deviceScaleFactor: 2,
};
