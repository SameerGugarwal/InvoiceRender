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

    // 4. Generate PDF with exact settings
    const pdfBuffer = await page.pdf(pdfRenderOptions);

    console.log('[Puppeteer] PDF generated successfully (' + pdfBuffer.length + ' bytes)');
    return Buffer.from(pdfBuffer);
  } finally {
    if (page) {
      await page.close();
    }
  }
}
