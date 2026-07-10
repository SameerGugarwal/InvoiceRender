import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jsdom from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payload = {
  template_type: "edf",
  customer: {
    fullName: "Jean Dupont",
    street: "12 Rue de la Paix",
    city: "Paris",
    postalCode: "75002"
  }
};

const rawHtml = fs.readFileSync(path.resolve(__dirname, '../../doc/templets/EDF Electricity Bill.html'), 'utf8');

const injectionContext = {
    customer: {
      fullName: payload?.customer?.fullName || "DEBUG: NAME_MISSING",
      street: payload?.customer?.street || "DEBUG: STREET_MISSING",
      city: payload?.customer?.city || "DEBUG: CITY_MISSING",
      postalCode: payload?.customer?.postalCode || "DEBUG: POSTAL_MISSING"
    }
  };

const template = Handlebars.compile(rawHtml);
const result = template(injectionContext);

const { JSDOM } = jsdom;
const dom = new JSDOM(result, { runScripts: "dangerously" });
setTimeout(() => {
    console.log(dom.window.document.documentElement.outerHTML.substring(0, 1000));
    console.log("DOM contains Jean Dupont?", dom.window.document.documentElement.outerHTML.includes('Jean Dupont'));
    console.log("DOM contains SANTA CLAUS?", dom.window.document.documentElement.outerHTML.includes('SANTA CLAUS'));
}, 2000);
