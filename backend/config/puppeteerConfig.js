export const puppeteerLaunchArgs = {
  headless: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined),
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
