import puppeteer from 'puppeteer';
import fs from 'fs';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  const rawHtml = fs.readFileSync('../../doc/templets/EDF Electricity Bill.html', 'utf8');
  await page.setContent(rawHtml, { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const html = await page.content();
  console.log("Includes bundler thumbnail?", html.includes('__bundler_thumbnail'));
  console.log("Includes Jean Dupont?", html.includes('Jean Dupont'));
  
  await browser.close();
}

run();
