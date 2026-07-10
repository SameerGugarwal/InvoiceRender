import puppeteer from 'puppeteer';
import { puppeteerLaunchArgs, pdfRenderOptions, viewportOptions } from '../config/puppeteerConfig.js';

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
