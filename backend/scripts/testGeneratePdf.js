import fs from 'fs';
import { injectEDF } from '../services/templates/edfInjector.js';
import { generatePDF } from '../services/puppeteerService.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

async function testPdf() {
  const payload = {
    "template_type": "edf",
    "customer": {
      "fullName": "sameer gugarwal",
      "street": "Vit Vellore",
      "city": "VELLORE",
      "postalCode": "632014"
    },
    "billing": {
      "invoiceNumber": "FAC-2026-8943",
      "issueDate": "15/07/2026",
      "periodStart": "01/06/2026",
      "periodEnd": "30/06/2026",
      "dueDate": "29/07/2026"
    },
    "financials": {
      "previousBalance": "0.00",
      "paymentsReceived": "0.00",
      "vatRate": "20.0",
      "totalAmountDue": "87.00",
      "vatAmount": "14.50"
    },
    "edfSpecific": {
      "clientNumber": "0987654321",
      "accountNumber": "987654321",
      "pdlNumber": "12345678901234",
      "subscribedPower": "9 kVA",
      "tariffOption": "Base",
      "readingType": "Actual"
    }
  };

  const html = injectEDF(payload);
  const pdfBuffer = await generatePDF(html);
  fs.writeFileSync('test.pdf', pdfBuffer);

  const data = await pdfParse(pdfBuffer);
  console.log("PDF TEXT EXTRACTED:");
  console.log(data.text.includes('15/07/2026') ? "Found 15/07/2026!" : "Missing 15/07/2026");
  console.log(data.text.includes('{{billing.issueDate}}') ? "ERROR: Found Handlebars tag!" : "Good: No Handlebars tags.");
  
  process.exit(0);
}

testPdf();
