const fs = require('fs');

// Read the original bundled template
const rawHtml = fs.readFileSync('doc/templets/Water Board Nicosia Bill.html', 'utf8');

// Extract the template JSON which contains the unbundled HTML
const match = rawHtml.match(/<script type="__bundler\/template">(.*?)<\/script>/s);
if (!match) {
    throw new Error("Could not find __bundler/template");
}

let templateStr = JSON.parse(match[1]); // This is the unbundled HTML string

// Handlebars mappings
const replacements = {
  '{{customer.street}}': '{{customer.address}}',
  '{{customer.postalCode}} {{customer.city}}': '{{customer.city}}',
  '{{nicosiaSpecific.accountRef}}': '{{account.accountNo}}',
  '{{billing.periodStart}}': '{{billingPeriod.start}}',
  '{{billing.periodEnd}}': '{{billingPeriod.end}}',
  '{{nicosiaSpecific.tariff}}': '{{account.consumerNo}}',
  '{{meter.number}}': '{{meter.meterNo}}',
  '{{meter.currentReading}}': '{{meter.present}}',
  '{{meter.previousReading}}': '{{meter.previous}}',
  '{{meter.consumptionUnits}}': '{{meter.consumption}}',
  '{{financials.totalAmountDue}}': '{{financials.totalAmount}}',
  '{{billing.dueDate}}': '{{financials.dueDate}}'
};

for (const [oldVar, newVar] of Object.entries(replacements)) {
    templateStr = templateStr.split(oldVar).join(newVar);
}

// Add the style block
const styleBlock = `
<style>
.pdf-page {
    width: 820px;
    height: 1120px;
    page-break-after: always;
    position: relative;
    background: #ffffff;
    box-sizing: border-box;
    overflow: hidden;
    margin: 0 auto;
}
.page-pad { padding: 40px; }
</style>
`;
templateStr = templateStr.replace('</head>', styleBlock + '</head>');

// Wrap Page 1 with pdf-page (finding the outer div)
templateStr = templateStr.replace('<div style="display:flex; justify-content:center; padding:0; background:#ffffff;">', '<div class="pdf-page" style="display:flex; justify-content:center; padding:0; background:#ffffff;">');

const page2 = `
<!-- PAGE 2: Data Table -->
<div class="pdf-page page-pad" style="font-family: Arial, sans-serif;">
  <div style="color:#4a86c5; font-size:18px; font-weight:bold;">
    ΚΑΤΑΣΤΑΣΗ ΛΟΓΑΡΙΑΣΜΟΥ / STATEMENT OF ACCOUNT
  </div>
  <div style="border-bottom: 2px solid #4a86c5; margin-top: 8px; margin-bottom: 20px;"></div>
  
  <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;">
    <thead>
      <tr style="background-color: #edf3f8; color: #4a86c5; font-weight: bold; border-top: 2px solid #4a86c5;">
        <th style="padding: 12px 10px; text-align: left; width: 20%;">Ημερομηνία / Date</th>
        <th style="padding: 12px 10px; text-align: left; width: 35%;">Περιγραφή / Description</th>
        <th style="padding: 12px 10px; text-align: right; width: 15%;">Χρέωση / Debit (€)</th>
        <th style="padding: 12px 10px; text-align: right; width: 15%;">Πίστωση / Credit (€)</th>
        <th style="padding: 12px 10px; text-align: right; width: 15%;">Υπόλοιπο / Balance (€)</th>
      </tr>
    </thead>
    <tbody style="color: #111111;">
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea;">N/A</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea;">Υπόλοιπο Προηγ. Λογαριασμού / Previous Balance</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;"></td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;"></td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;">{{financials.previousBalance}}</td>
      </tr>
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea;">N/A</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea;">Τρέχων Λογαριασμός / Current Bill</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;">{{financials.currentBill}}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;"></td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #cbd8ea; text-align: right;">{{financials.totalAmountDue}}</td>
      </tr>
    </tbody>
  </table>
</div>
`;

const page3 = `
<!-- PAGE 3: Text/Certification -->
<div class="pdf-page page-pad" style="font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6; color: #111;">
  <div style="text-align: center; font-weight: bold; text-transform: uppercase; font-size: 18px; margin-bottom: 40px;">
    <span style="border-bottom: 2px solid #4a86c5;">CERTIFICATE OF TRANSLATION</span>
  </div>
  
  <p style="text-align: justify; margin-bottom: 20px;">
    I, the undersigned <b>John Doe</b>, a certified translator of <b>Generic Translation Services Ltd.</b>, holding ID number <b>00000000</b>, hereby certify that the attached document is a true and accurate English translation of the original Greek document issued by the Water Board of Nicosia.
  </p>

  <p style="text-align: justify; margin-bottom: 60px;">
    This translation has been prepared to the best of my knowledge and belief, ensuring that the contents match the original utility bill structure, including all line items and descriptive texts.
  </p>

  <div style="display: flex; justify-content: space-between; align-items: flex-end;">
    <div style="font-family: Arial, sans-serif; font-size: 13px;">
      Date: ___________________
    </div>
    <div style="text-align: center;">
      <div style="border: 1px dashed #ccc; width: 220px; height: 120px; display: flex; align-items: center; justify-content: center; color: #999; margin-bottom: 10px; font-family: Arial, sans-serif; font-size: 12px;">
        [Placeholder for Stamp]
      </div>
      <div style="border-top: 1px solid #111; padding-top: 5px; width: 220px; font-family: Arial, sans-serif; font-size: 13px;">
        Translator Signature
      </div>
    </div>
  </div>
</div>
`;

// Combine into one unbundled HTML file
let finalHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${styleBlock}
</head>
<body style="background: #e0e0e0; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
`;

// Extract the <x-dc> block from templateStr
const xdcMatch = templateStr.match(/<x-dc>(.*?)<\/x-dc>/s);
if (xdcMatch) {
    finalHtml += xdcMatch[1];
} else {
    // If no <x-dc> tags, just append the modified string
    finalHtml += templateStr.replace(/<html>.*?<body>/s, '').replace(/<\/body>.*?<\/html>/s, '');
}

finalHtml += `
${page2}
${page3}
</body>
</html>`;

fs.writeFileSync('doc/templets/nicosia_water_bill.html', finalHtml);
console.log('nicosia_water_bill.html updated!');
