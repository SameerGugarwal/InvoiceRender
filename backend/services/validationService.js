const DATE_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
const EDF_CLIENT_REGEX = /^\d{10}$/;
const EDF_PDL_REGEX = /^\d{14}$/;
const NICOSIA_REF_REGEX = /^\d{4}\/\d{1}\/\d{5}\/\d{1}\/\d{1}$/;

function requireFields(errors, obj, fields, label) {
  for (const field of fields) {
    const value = obj?.[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(`Missing required field: ${label}.${field}`);
    }
  }
}

function checkDate(errors, value, label) {
  if (value && !DATE_REGEX.test(String(value).trim())) {
    errors.push(`${label} must be DD/MM/YYYY`);
  }
}

/**
 * Server-side mirror of the frontend validation rules.
 * Returns an array of error messages (empty when the payload is valid).
 */
export function validatePayload(payload) {
  const errors = [];

  requireFields(errors, payload.customer, ['fullName', 'street', 'city', 'postalCode'], 'customer');
  requireFields(errors, payload.billing, ['invoiceNumber', 'issueDate', 'periodStart', 'periodEnd', 'dueDate'], 'billing');
  requireFields(errors, payload.financials, ['previousBalance', 'paymentsReceived', 'vatRate', 'vatAmount', 'totalAmountDue'], 'financials');

  checkDate(errors, payload.billing?.issueDate, 'billing.issueDate');
  checkDate(errors, payload.billing?.periodStart, 'billing.periodStart');
  checkDate(errors, payload.billing?.periodEnd, 'billing.periodEnd');
  checkDate(errors, payload.billing?.dueDate, 'billing.dueDate');

  const tmpl = payload.template_type;

  if (tmpl === 'edf') {
    requireFields(errors, payload.edfSpecific, ['clientNumber', 'accountNumber', 'pdlNumber', 'subscribedPower', 'tariffOption', 'readingType'], 'edfSpecific');
    const clientNumber = payload.edfSpecific?.clientNumber;
    if (clientNumber && !EDF_CLIENT_REGEX.test(String(clientNumber).trim())) {
      errors.push('EDF Client Number must be exactly 10 digits');
    }
    const pdlNumber = payload.edfSpecific?.pdlNumber;
    if (pdlNumber && !EDF_PDL_REGEX.test(String(pdlNumber).trim())) {
      errors.push('EDF PDL must be exactly 14 digits');
    }
  }

  if (tmpl === 'kenya_power' || tmpl === 'nicosia') {
    requireFields(errors, payload.meter, ['number', 'readingDate', 'previousReading', 'currentReading', 'consumptionUnits'], 'meter');
    checkDate(errors, payload.meter?.readingDate, 'meter.readingDate');
  }

  if (tmpl === 'kenya_power') {
    requireFields(errors, payload.kenyaSpecific, ['accountNumber', 'tariff'], 'kenyaSpecific');
  }

  if (tmpl === 'nicosia') {
    requireFields(errors, payload.nicosiaSpecific, ['accountRef', 'tariff'], 'nicosiaSpecific');
    const accountRef = payload.nicosiaSpecific?.accountRef;
    if (accountRef && !NICOSIA_REF_REGEX.test(String(accountRef).trim())) {
      errors.push('Nicosia Account Reference must match XXXX/X/XXXXX/X/X');
    }
  }

  return errors;
}
