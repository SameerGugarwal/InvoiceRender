const fs = require('fs');
const path = require('path');

function replaceAndRemoveReact(filePath, replacements) {
    let html = fs.readFileSync(filePath, 'utf8');
    const match = html.match(/(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/);
    if (match) {
        let templateStr = JSON.parse(match[2].trim());
        
        // Remove scripts
        templateStr = templateStr.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Do replacements
        for (const { search, replace } of replacements) {
            templateStr = templateStr.split(search).join(replace);
        }
        
        const newHtml = html.substring(0, match.index) + 
                        match[1] + 
                        JSON.stringify(templateStr) + 
                        match[3] + 
                        html.substring(match.index + match[0].length);
        
        fs.writeFileSync(filePath, newHtml, 'utf8');
        console.log(`Successfully updated ${filePath}`);
    } else {
        console.log(`No match found in ${filePath}`);
    }
}

// Kenya Power replacements
const kpReplacements = [
  { search: 'DATTATRAY BHISE', replace: '{{customer.fullName}}' },
  { search: 'KAJABI APARTMENTS UNIT A1', replace: '{{customer.street}}' },
  { search: 'MAKUTANO, NANYUKI 10400', replace: '{{customer.city}}, {{customer.postalCode}}' },
  { search: '107211JL4204791', replace: '{{billing.invoiceNumber}}' },
  { search: '01/06/2026', replace: '{{billing.issueDate}}' },
  { search: '15/06/2026', replace: '{{billing.dueDate}}' },
  { search: '01/06/2026 - 30/06/2026', replace: '{{billing.periodStart}} - {{billing.periodEnd}}' },
  { search: '1,829.57', replace: '{{financials.totalAmountDue}}' },
  { search: '14904278', replace: '{{kenyaSpecific.accountNumber}}' },
  { search: 'DC-Lifeline', replace: '{{kenyaSpecific.tariff}}' },
  { search: 'A3-14-07652', replace: '{{meter.number}}' },
  { search: '43961', replace: '{{meter.previousReading}}' },
  { search: '45045', replace: '{{meter.currentReading}}' },
  { search: '1064', replace: '{{meter.consumptionUnits}}' },
];

replaceAndRemoveReact('../../doc/templets/Kenya Power Bill.html', kpReplacements);
replaceAndRemoveReact('../../backend/templates/Kenya Power Bill.html', kpReplacements);

// Nicosia replacements
const nicReplacements = [
  { search: 'CHRISTIANA GEORGIOU*', replace: '{{customer.fullName}}' },
  { search: 'PAVLOU LIASIDI 22A', replace: '{{customer.street}}' },
  { search: '2331 LAKATAMIA -CYPRUS', replace: '{{customer.postalCode}} {{customer.city}}' },
  { search: '13/12 - 13/02', replace: '{{billing.periodStart}} - {{billing.periodEnd}}' },
  { search: '0708941 2415942 0', replace: '{{nicosiaSpecific.accountRef}}' },
  { search: '2415942', replace: '{{billing.invoiceNumber}}' },
  { search: '8941', replace: '{{nicosiaSpecific.tariff}}' }
];

replaceAndRemoveReact('../../doc/templets/Water Board Nicosia Bill.html', nicReplacements);
replaceAndRemoveReact('../../backend/templates/Water Board Nicosia Bill.html', nicReplacements);
