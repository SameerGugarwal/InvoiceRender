import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const payload = {
  template_type: "edf",
  customer: {
    fullName: "Jean Dupont",
    street: "12 Rue de la Paix",
    city: "Paris",
    postalCode: "75002"
  },
  billing: {
    invoiceNumber: "FAC-2026-8943",
    issueDate: "15/07/2026",
    periodStart: "01/06/2026",
    periodEnd: "30/06/2026",
    dueDate: "29/07/2026"
  },
  financials: {
    previousBalance: "0.00",
    paymentsReceived: "0.00",
    vatRate: "20.0",
    vatAmount: "14.50",
    totalAmountDue: "87.00"
  },
  edfSpecific: {
    clientNumber: "0123456789",
    accountNumber: "987654321",
    pdlNumber: "12345678901234",
    subscribedPower: "9 kVA",
    tariffOption: "Option Base",
    readingType: "Relevé"
  }
};

const rawHtml = fs.readFileSync(path.resolve(__dirname, '../../doc/templets/EDF Electricity Bill.html'), 'utf8');

const injectionContext = {
    customer: {
      fullName: payload?.customer?.fullName || "DEBUG: NAME_MISSING",
      street: payload?.customer?.street || "DEBUG: STREET_MISSING",
      city: payload?.customer?.city || "DEBUG: CITY_MISSING",
      postalCode: payload?.customer?.postalCode || "DEBUG: POSTAL_MISSING"
    },
    billing: {
      invoiceNumber: payload?.billing?.invoiceNumber || "DEBUG: INV_MISSING",
      issueDate: payload?.billing?.issueDate || "DEBUG: ISSUEDATE_MISSING",
      periodStart: payload?.billing?.periodStart || "DEBUG: PERIODSTART_MISSING",
      periodEnd: payload?.billing?.periodEnd || "DEBUG: PERIODEND_MISSING",
      dueDate: payload?.billing?.dueDate || "DEBUG: DUEDATE_MISSING"
    },
    financials: {
      previousBalance: payload?.financials?.previousBalance || "DEBUG: PREVBAL_MISSING",
      paymentsReceived: payload?.financials?.paymentsReceived || "DEBUG: PAYMENTS_MISSING",
      vatRate: payload?.financials?.vatRate || "DEBUG: VATRATE_MISSING",
      vatAmount: payload?.financials?.vatAmount || "DEBUG: VAT_MISSING",
      totalAmountDue: payload?.financials?.totalAmountDue || "DEBUG: TOTAL_MISSING"
    },
    edfSpecific: {
      clientNumber: payload?.edfSpecific?.clientNumber || "DEBUG: CLIENT_MISSING",
      accountNumber: payload?.edfSpecific?.accountNumber || "DEBUG: ACCT_MISSING",
      pdlNumber: payload?.edfSpecific?.pdlNumber || "DEBUG: PDL_MISSING",
      subscribedPower: payload?.edfSpecific?.subscribedPower || "DEBUG: POWER_MISSING",
      tariffOption: payload?.edfSpecific?.tariffOption || "DEBUG: TARIFF_MISSING",
      readingType: payload?.edfSpecific?.readingType || "DEBUG: READING_MISSING"
    }
  };

const template = Handlebars.compile(rawHtml);
const result = template(injectionContext);

console.log("Includes Jean Dupont?", result.includes('Jean Dupont'));
console.log("Includes {{customer.fullName}}?", result.includes('{{customer.fullName}}'));
