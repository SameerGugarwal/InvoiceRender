import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { puppeteerLaunchArgs, pdfRenderOptions, viewportOptions } from '../config/puppeteerConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Project root: two levels up from backend/services/
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch(puppeteerLaunchArgs);
    // Restart browser if it gets disconnected
    browserInstance.on('disconnected', () => {
      console.log('[Puppeteer] Browser disconnected, clearing instance.');
      browserInstance = null;
    });
  }
  return browserInstance;
}

export async function generatePDF(dynamicHtml) {
  const browser = await getBrowser();
  let page = null;

  try {
    page = await browser.newPage();
    await page.setViewport(viewportOptions);

    console.log('[Puppeteer] Setting dynamic HTML content...');
    
    // Inject a <base> tag so relative image paths (e.g. doc/LOGOS/...) resolve
    // against the project root. page.setContent() has no implicit base URL.
    const baseHref = pathToFileURL(PROJECT_ROOT + '/').href;
    if (dynamicHtml.includes('<head>')) {
      dynamicHtml = dynamicHtml.replace('<head>', `<head>\n<base href="${baseHref}">`);
    } else if (dynamicHtml.includes('<HEAD>')) {
      dynamicHtml = dynamicHtml.replace('<HEAD>', `<HEAD>\n<base href="${baseHref}">`);
    }

    // 2. Pass dynamic HTML directly to Puppeteer
    await page.setContent(dynamicHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for the bundle to unpack (our injected script will do the text replacement)
    await page.waitForFunction(() => {
      const loading = document.getElementById('__bundler_loading');
      const thumbnail = document.getElementById('__bundler_thumbnail');
      return !loading && !thumbnail;
    }, { timeout: 15000 }).catch(() => {
      console.log('[Puppeteer] Bundle unpack timeout - proceeding');
    });

    // Give the injected script's setTimeout a moment to fire and the DOM to settle
    await new Promise(resolve => setTimeout(resolve, 500));

    // Scale content down so bills authored wider than A4 (794x1123px @96dpi) fit the page width
    const { contentWidth, contentHeight } = await page.evaluate(() => ({
      contentWidth: document.documentElement.scrollWidth,
      contentHeight: document.documentElement.scrollHeight,
    }));
    let scale = Math.min(1, 794 / contentWidth);
    // If the content barely overflows one page (<6%), shrink it slightly to avoid
    // pushing a sliver onto a nearly empty trailing page
    const scaledHeight = contentHeight * scale;
    if (scaledHeight > 1123 && scaledHeight <= 1123 * 1.06) {
      scale = Math.min(scale, 1123 / contentHeight);
    }
    scale = Math.max(0.1, scale);

    // 4. Generate PDF with exact settings
    const pdfBuffer = await page.pdf({ ...pdfRenderOptions, scale });

    console.log('[Puppeteer] PDF generated successfully (' + pdfBuffer.length + ' bytes)');
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) {
      await page.close();
    }
  }
}
