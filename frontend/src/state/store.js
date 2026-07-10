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
  // Nicosia Specific
  nic_account_ref: '',
  nic_tariff: '',
};

export const appState = { ...defaultState };

const savedState = localStorage.getItem('invoiceRenderState');
if (savedState) {
  try {
    Object.assign(appState, JSON.parse(savedState));
  } catch (e) {
    console.error('Failed to parse local storage state', e);
  }
}

export const DUMMY_DATA = {
  edf: {
    customer_name: 'Jean-Pierre Dupont',
    customer_street: '12 Rue de la République',
    customer_city: 'Lyon',
    customer_postal: '69002',
    invoice_number: 'FA-2024-0847291',
    invoice_date: '15/03/2024',
    billing_start: '01/01/2024',
    billing_end: '28/02/2024',
    due_date: '15/04/2024',
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
  kenya_power: {
    customer_name: 'John Kamau Mwangi',
    customer_street: 'P.O. Box 30099',
    customer_city: 'Nairobi',
    customer_postal: '00100',
    invoice_number: 'KP-2024-1183746',
    invoice_date: '20/03/2024',
    billing_start: '01/02/2024',
    billing_end: '28/02/2024',
    due_date: '20/04/2024',
    previous_balance: '1250.00',
    payments_received: '1250.00',
    vat_rate: '16',
    vat_amount: '384.00',
    total_due: '2784.00',
    meter_number: 'A3-14-07652',
    meter_reading_date: '28/02/2024',
    previous_reading: '45230',
    current_reading: '45890',
    consumption_units: '660 kWh',
    kp_account_number: '0123456789',
    kp_tariff: 'Domestic',
  },
  nicosia: {
    customer_name: 'Αντρέας Παπαδόπουλος',
    customer_street: 'Λεωφόρος Αρχιεπισκόπου Μακαρίου 45',
    customer_city: 'Λευκωσία',
    customer_postal: '1065',
    invoice_number: 'WBN-2024-00583',
    invoice_date: '10/03/2024',
    billing_start: '01/01/2024',
    billing_end: '28/02/2024',
    due_date: '10/04/2024',
    previous_balance: '0.00',
    payments_received: '0.00',
    vat_rate: '19',
    vat_amount: '8.74',
    total_due: '54.74',
    meter_number: 'WM-2024-08491',
    meter_reading_date: '28/02/2024',
    previous_reading: '12045',
    current_reading: '12089',
    consumption_units: '44 m³',
    nic_account_ref: '8941/7/17588/0/0',
    nic_tariff: 'T1-Residential',
  },
};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function updateState(key, value) {
  appState[key] = value;
  localStorage.setItem('invoiceRenderState', JSON.stringify(appState));
  listeners.forEach(listener => listener(appState));
}

export function getState() {
  return appState;
}
