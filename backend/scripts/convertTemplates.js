import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLET_DIR = path.resolve(__dirname, '..', '..', 'doc', 'templets');

// Define exactly what hardcoded strings to replace in which files
const REPLACEMENTS = {
  'EDF Electricity Bill.html': [
    { search: '{{customer_name}}', replace: '{{customer.fullName}}' },
    { search: '{{customer_street}}', replace: '{{customer.street}}' },
    { search: '{{customer_postal}} {{customer_city}}', replace: '{{customer.postal}} {{customer.city}}' },
    { search: '{{invoice_number}}', replace: '{{billing.invoiceNumber}}' },
    { search: '{{invoice_date}}', replace: '{{billing.invoiceDate}}' },
    { search: '{{billing_start}}', replace: '{{billing.periodStart}}' },
    { search: '{{billing_end}}', replace: '{{billing.periodEnd}}' },
    { search: '{{due_date}}', replace: '{{billing.dueDate}}' },
    { search: '{{edf_client_number}}', replace: '{{edfSpecific.clientNumber}}' },
    { search: '{{edf_account_number}}', replace: '{{edfSpecific.accountNumber}}' },
    { search: '{{edf_pdl}}', replace: '{{edfSpecific.pdl}}' },
    { search: '{{edf_power}}', replace: '{{edfSpecific.power}}' },
    { search: '{{total_due}}', replace: '{{billing.totalDue}}' },
    // Fix missed fields:
    { search: 'LAPLAND</div>', replace: '{{customer.city}}</div>' },
    { search: 'TVA</span><span>32,48 €</span></div>', replace: 'TVA</span><span>{{billing.vatAmount}} €</span></div>' },
    { search: 'Option Heures Pleines / Heures Creuses <b>22H30-6H30</b>', replace: 'Option {{edfSpecific.tariff}}' }
  ],
  'Kenya Power Bill.html': [
    { search: '{{customer_name}}', replace: '{{customer.fullName}}' },
    { search: '{{customer_street}}', replace: '{{customer.street}}' },
    { search: '{{customer_city}}', replace: '{{customer.city}}' },
    { search: '{{customer_postal}}', replace: '{{customer.postal}}' },
    { search: '{{invoice_number}}', replace: '{{billing.invoiceNumber}}' },
    { search: '{{invoice_date}}', replace: '{{billing.invoiceDate}}' },
    { search: '{{billing_end}}', replace: '{{billing.periodEnd}}' },
    { search: '{{due_date}}', replace: '{{billing.dueDate}}' },
    { search: '{{kp_account_number}}', replace: '{{edfSpecific.accountNumber}}' },
    { search: '{{total_due}}', replace: '{{billing.totalDue}}' },
    { search: '{{previous_reading}}', replace: '{{meter.previousReading}}' },
    { search: '{{current_reading}}', replace: '{{meter.currentReading}}' },
    { search: '{{consumption_units}}', replace: '{{meter.consumptionUnits}}' }
  ],
  'Water Board Nicosia Bill.html': [
    { search: '{{customer_name}}', replace: '{{customer.fullName}}' },
    { search: '{{customer_street}}', replace: '{{customer.street}}' },
    { search: '{{customer_postal}} {{customer_city}}', replace: '{{customer.postal}} {{customer.city}}' },
    { search: '{{nic_account_ref}}', replace: '{{edfSpecific.accountNumber}}' },
    { search: '{{billing_start}} - {{billing_end}}', replace: '{{billing.periodStart}} - {{billing.periodEnd}}' },
    { search: '{{due_date}}', replace: '{{billing.dueDate}}' },
    { search: '{{meter_number}}', replace: '{{meter.number}}' },
    { search: '{{previous_reading}}', replace: '{{meter.previousReading}}' },
    { search: '{{current_reading}}', replace: '{{meter.currentReading}}' },
    { search: '{{consumption_units}}', replace: '{{meter.consumptionUnits}}' },
    { search: '{{total_due}}', replace: '{{billing.totalDue}}' }
  ]
};

function convertTemplates() {
  console.log('Starting template conversion...');

  for (const [filename, rules] of Object.entries(REPLACEMENTS)) {
    const filePath = path.join(TEMPLET_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARNING] File not found: ${filePath}`);
      continue;
    }

    let html = fs.readFileSync(filePath, 'utf8');
    let replacedCount = 0;

    for (const rule of rules) {
      // Global replacement (string -> regex)
      const regex = new RegExp(rule.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(html)) {
        html = html.replace(regex, rule.replace);
        replacedCount++;
        console.log(`[${filename}] Replaced '${rule.search}' with '${rule.replace}'`);
      }
    }

    if (replacedCount > 0) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`[SUCCESS] Updated ${filename} with ${replacedCount} dynamic bindings.`);
    } else {
      console.log(`[SKIP] No replacements made for ${filename}.`);
    }
  }
}

convertTemplates();
