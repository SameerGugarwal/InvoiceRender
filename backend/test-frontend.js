import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Go to the local dev server
  await page.goto('http://localhost:5173');
  
  // Wait for the app to load
  await page.waitForSelector('#customer_name');
  
  // Type a new name
  await page.type('#customer_name', 'TEST NAME');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 500));
  
  // Select a template
  await page.click('.template-card[data-template="edf"]');
  
  // Intercept network requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('/api/generate-pdf')) {
      console.log('Request Payload:', request.postData());
      request.abort();
    } else {
      request.continue();
    }
  });
  
  // Click generate
  await page.click('#generate-btn');
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
