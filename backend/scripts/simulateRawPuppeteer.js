import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jsdom from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawHtml = fs.readFileSync(path.resolve(__dirname, '../../doc/templets/EDF Electricity Bill.html'), 'utf8');

const { JSDOM } = jsdom;
const dom = new JSDOM(rawHtml, { runScripts: "dangerously" });
setTimeout(() => {
    const html = dom.window.document.documentElement.outerHTML;
    console.log("Includes {{customer.fullName}}?", html.includes('{{customer.fullName}}'));
    console.log("Includes Titulaire?", html.includes('Titulaire'));
}, 2000);
