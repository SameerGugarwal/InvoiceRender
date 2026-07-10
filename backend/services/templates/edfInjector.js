import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectEDF(payload) {
  const rawHtml = getRawTemplateHTML('edf');
  
  console.log("--- [DEBUG] INCOMING PAYLOAD TO INJECTOR ---");
  console.log(JSON.stringify(payload, null, 2));

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
  return template(injectionContext);
}
