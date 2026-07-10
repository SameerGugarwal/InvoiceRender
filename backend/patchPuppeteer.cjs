const fs = require('fs');
const filePath = 'config/puppeteerConfig.js';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',",
  "executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined),"
);

fs.writeFileSync(filePath, content);
