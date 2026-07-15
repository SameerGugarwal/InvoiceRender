const defaultState = {
  template_type: '',
  // Global - Customer
  customer_name: '',
  customer_street: '',
  customer_city: '',
  customer_postal: '',
  // Global - Billing
  invoice_number: '',
  invoice_date: '',
  billing_start: '',
  billing_end: '',
  due_date: '',
  // Global - Financials
  previous_balance: '',
  payments_received: '',
  vat_rate: '',
  vat_amount: '',
  total_due: '',
  // Meter (Kenya Power + Nicosia)
  meter_number: '',
  meter_reading_date: '',
  previous_reading: '',
  current_reading: '',
  consumption_units: '',
  // EDF Specific
  edf_client_number: '',
  edf_account_number: '',
  edf_pdl: '',
  edf_power: '',
  edf_tariff: '',
  edf_reading_type: '',
  // Kenya Power Specific
  kp_account_number: '',
  kp_tariff: '',
  kp_load: '',
  kp_email: '',
  kp_history: '',
  // Nicosia Specific
  nic_account_ref: '',
  nic_tariff: '',
  // Apostille
  apo_country: '',
  apo_signedBy: '',
  apo_capacity: '',
  apo_organization: '',
  apo_location: '',
  apo_date: '',
  apo_certifiedBy: '',
  apo_referenceNumber: '',
  // Certificate
  cert_translatorName: '',
  cert_city: '',
  cert_country: '',
  cert_idNumber: '',
  cert_company: '',
  cert_sourceLanguage: '',
  cert_targetLanguage: '',
  cert_documentType: '',
  cert_customerName: '',
  cert_address: '',
  cert_phone: '',
  cert_email: '',
  cert_translatorRole: '',
  cert_date: '',
  // The day the auto dates were computed, so refreshAutoDates() can tell a
  // still-current default from one left over from a previous day.
  defaults_generated_on: '',
};

export const appState = { ...defaultState };

// A hard refresh should reset the form while a plain refresh keeps it. Browsers
// report both as navigation type "reload", so there is nothing to read on load:
// the shortcut has to be recorded on keydown (see markHardReload) and consumed
// here on the way back up. The timestamp keeps a flag that never got its reload
// from leaking into some later, unrelated one.
const HARD_RELOAD_KEY = '__invoiceRenderHardReload';

export function markHardReload() {
  sessionStorage.setItem(HARD_RELOAD_KEY, String(Date.now()));
}

function consumeHardReloadFlag() {
  const markedAt = sessionStorage.getItem(HARD_RELOAD_KEY);
  if (!markedAt) return false;
  sessionStorage.removeItem(HARD_RELOAD_KEY);
  return Date.now() - Number(markedAt) < 5000;
}

if (consumeHardReloadFlag()) {
  localStorage.removeItem('invoiceRenderState');
} else {
  const savedState = localStorage.getItem('invoiceRenderState');
  if (savedState) {
    try {
      Object.assign(appState, JSON.parse(savedState));
    } catch (e) {
      console.error('Failed to parse local storage state', e);
    }
  }
}

// ---------------------------------------------------------------------------
// Auto dates
//
// Every date on a bill is relative to the day it is generated, so none of them
// can be baked into TEMPLATE_DEFAULTS as literals — they would be stale the next
// day. They are recomputed from "today" whenever defaults are applied, on page
// load, and again right before generating.
// ---------------------------------------------------------------------------

// Issue the bill 10 days ago and give the customer 15 days from today to pay.
const ISSUE_OFFSET_DAYS = -10;
const DUE_OFFSET_DAYS = 15;
// A bill covers the 30 days up to its issue date.
const BILLING_PERIOD_DAYS = 30;

function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

/** The DD/MM/YYYY the form and validator expect. */
function formatDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Local YYYY-MM-DD, used to tell whether the auto dates were written today. */
function dayKey(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function computeDateDefaults(today = new Date()) {
  const issue = addDays(today, ISSUE_OFFSET_DAYS);
  return {
    invoice_date: formatDate(issue),
    due_date: formatDate(addDays(today, DUE_OFFSET_DAYS)),
    // The period ends the day the bill is issued.
    billing_end: formatDate(issue),
    billing_start: formatDate(addDays(issue, -BILLING_PERIOD_DAYS)),
    // The meter is read at the end of the period.
    meter_reading_date: formatDate(issue),
    // The document is certified the day it is produced.
    apo_date: formatDate(today),
    cert_date: formatDate(today),
  };
}

// Which auto dates each template actually shows.
const DATE_FIELDS = {
  edf: ['invoice_date', 'billing_start', 'billing_end', 'due_date'],
  edf_v2: ['invoice_date', 'billing_start', 'billing_end', 'due_date'],
  kenya_power: ['invoice_date', 'billing_start', 'billing_end', 'due_date', 'meter_reading_date'],
  nicosia: ['invoice_date', 'billing_start', 'billing_end', 'due_date', 'meter_reading_date', 'apo_date', 'cert_date'],
};

// ---------------------------------------------------------------------------
// Template defaults
//
// Everything the form needs to generate a bill without typing, so a user can
// change the name and hit generate. Dates are absent on purpose — they come from
// computeDateDefaults() at apply time. Amounts are internally consistent:
// total_due = (total_due - vat_amount) + vat_amount, and vat_amount matches
// vat_rate, because edf_v2 derives its pre-tax total by subtracting them.
// ---------------------------------------------------------------------------
const TEMPLATE_DEFAULTS_STATIC = {
  edf: {
    customer_name: 'Jean-Pierre Dupont',
    customer_street: '12 Rue de la République',
    customer_city: 'Lyon',
    customer_postal: '69002',
    invoice_number: 'FA-0847291',
    previous_balance: '0.00',
    payments_received: '0.00',
    vat_rate: '20',
    vat_amount: '24.18',
    total_due: '145.07',
    edf_client_number: '1234567890',
    edf_account_number: 'ACC-FR-9876543',
    edf_pdl: '12345678901234',
    edf_power: '9 kVA',
    edf_tariff: 'Base',
    edf_reading_type: 'Actual',
  },
  edf_v2: {
    // Mirrors the reference bill in doc/new-temp/EDF Electricity (1).pdf.
    customer_name: 'SANTA CLAUS',
    customer_street: 'LAPAND ST',
    customer_city: 'LAPAND',
    customer_postal: '00000',
    invoice_number: '00 000 000 000',
    previous_balance: '0.00',
    payments_received: '0.00',
    vat_rate: '20',
    vat_amount: '24.18',
    total_due: '145.07',
    edf_client_number: '1234567890',
    edf_account_number: '0 00 0 00 0000 0000',
    edf_pdl: '14889131824370',
    edf_power: '09 kVA',
    edf_tariff: 'Tarif Bleu',
    edf_reading_type: 'Actual',
  },
  kenya_power: {
    customer_name: 'John Kamau Mwangi',
    customer_street: 'P.O. Box 30099',
    customer_city: 'Nairobi',
    customer_postal: '00100',
    invoice_number: 'KP-1183746',
    previous_balance: '1250.00',
    payments_received: '1250.00',
    vat_rate: '16',
    vat_amount: '384.00',
    total_due: '2784.00',
    meter_number: 'A3-14-07652',
    previous_reading: '45230',
    current_reading: '45890',
    consumption_units: '660 kWh',
    kp_account_number: '0123456789',
    kp_tariff: 'Domestic',
    kp_load: '3',
    kp_email: 'john.mwangi@example.com',
    // Oldest first; the last figure is this bill's own consumption, so the
    // trend chart ends on the number the rest of the bill reports.
    kp_history: '520, 610, 700, 640, 580, 660',
  },
  nicosia: {
    // The Water Board of Nicosia only bills Nicosia, and Cyprus VAT is 19%.
    customer_name: 'Αντρέας Παπαδόπουλος',
    customer_street: 'Λεωφόρος Αρχιεπισκόπου Μακαρίου 45',
    customer_city: 'Λευκωσία',
    customer_postal: '1065',
    invoice_number: 'WBN-00583',
    previous_balance: '0.00',
    payments_received: '0.00',
    vat_rate: '19',
    vat_amount: '8.74',
    total_due: '54.74',
    meter_number: 'WM-08491',
    previous_reading: '12045',
    current_reading: '12089',
    consumption_units: '44 m³',
    nic_account_ref: '8941/7/17588/0/0',
    nic_tariff: 'T1-Residential',
    // Apostille — the issuing authority never changes.
    apo_country: 'Cyprus',
    apo_signedBy: 'Maria Ioannou',
    apo_capacity: 'Certifying Officer',
    apo_organization: 'Ministry of Justice',
    apo_location: 'Nicosia',
    apo_certifiedBy: 'George Georgiou',
    apo_referenceNumber: 'AP-12345',
    // Translation certificate — the translator and agency never change.
    cert_translatorName: 'Eleni Costa',
    cert_translatorRole: 'Sworn Translator',
    cert_city: 'Nicosia',
    cert_country: 'Cyprus',
    cert_idNumber: '123456',
    cert_company: 'Translation Services Ltd',
    cert_address: '123 Main St',
    cert_phone: '+357 22 123456',
    cert_email: 'info@translations.com.cy',
    cert_sourceLanguage: 'Greek',
    cert_targetLanguage: 'English',
    cert_documentType: 'Utility Bill',
    cert_customerName: 'Αντρέας Παπαδόπουλος',
  },
};

/** Every default for a template, with its dates resolved against `today`. */
export function getTemplateDefaults(templateType, today = new Date()) {
  const statics = TEMPLATE_DEFAULTS_STATIC[templateType];
  if (!statics) return null;

  const dates = computeDateDefaults(today);
  const values = { ...statics };
  (DATE_FIELDS[templateType] || []).forEach((field) => {
    values[field] = dates[field];
  });
  values.defaults_generated_on = dayKey(today);
  return values;
}

/**
 * Brings the auto dates up to date when the form was filled on an earlier day,
 * so a bill generated today never carries yesterday's dates. Only fields still
 * holding the value the rule produced back then are touched — anything the user
 * edited by hand is left alone. Returns the changed fields, or null.
 */
export function refreshAutoDates(today = new Date()) {
  const templateType = appState.template_type;
  const writtenOn = appState.defaults_generated_on;
  if (!templateType || !writtenOn || !DATE_FIELDS[templateType]) return null;

  const todayKey = dayKey(today);
  if (writtenOn === todayKey) return null;

  const wasComputed = computeDateDefaults(parseDayKey(writtenOn));
  const nowComputed = computeDateDefaults(today);

  const changed = {};
  DATE_FIELDS[templateType].forEach((field) => {
    if (appState[field] === wasComputed[field] && appState[field] !== nowComputed[field]) {
      changed[field] = nowComputed[field];
    }
  });
  changed.defaults_generated_on = todayKey;
  return changed;
}


const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function updateState(key, value) {
  appState[key] = value;
  localStorage.setItem('invoiceRenderState', JSON.stringify(appState));
  listeners.forEach(listener => listener(appState));
}

// Merge several fields at once, notifying listeners a single time.
export function updateStateBulk(values) {
  Object.assign(appState, values);
  localStorage.setItem('invoiceRenderState', JSON.stringify(appState));
  listeners.forEach(listener => listener(appState));
}

export function getState() {
  return appState;
}
