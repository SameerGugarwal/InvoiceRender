import { appState } from '../state/store.js';

export const VALIDATORS = {
  date: {
    regex: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    message: 'Must be DD/MM/YYYY format',
  },
  edf_client: {
    regex: /^\d{10}$/,
    message: 'Must be exactly 10 digits',
  },
  edf_pdl: {
    regex: /^\d{14}$/,
    message: 'Must be exactly 14 digits',
  },
  nicosia_ref: {
    regex: /^\d{4}\/\d{1}\/\d{5}\/\d{1}\/\d{1}$/,
    message: 'Must match format XXXX/X/XXXXX/X/X',
  },
};

export function validateField(input) {
  const validationType = input.dataset.validate;
  if (!validationType) return true;

  const value = input.value.trim();
  if (!value) {
    clearFieldError(input);
    return true; // Empty is ok during typing, checked at submit
  }

  const validator = VALIDATORS[validationType];
  if (!validator) return true;

  const isValid = validator.regex.test(value);
  if (!isValid) {
    showFieldError(input);
  } else {
    clearFieldError(input);
  }
  return isValid;
}

export function showFieldError(input) {
  input.classList.add('error');
  const errorEl = document.getElementById(input.id + '_error');
  if (errorEl) errorEl.classList.add('visible');
}

export function clearFieldError(input) {
  input.classList.remove('error');
  const errorEl = document.getElementById(input.id + '_error');
  if (errorEl) errorEl.classList.remove('visible');
}

export function validateAll() {
  const errors = [];

  if (!appState.template_type) {
    errors.push('Please select a template');
  }

  const globalFields = [
    'customer_name', 'customer_street', 'customer_city', 'customer_postal',
    'invoice_number', 'invoice_date', 'billing_start', 'billing_end', 'due_date',
    'previous_balance', 'payments_received', 'vat_rate', 'vat_amount', 'total_due',
  ];

  for (const field of globalFields) {
    if (!appState[field]?.trim()) {
      errors.push(`Missing required field: ${field.replace(/_/g, ' ')}`);
    }
  }

  const dateFields = ['invoice_date', 'billing_start', 'billing_end', 'due_date'];
  for (const field of dateFields) {
    const val = appState[field]?.trim();
    if (val && !VALIDATORS.date.regex.test(val)) {
      errors.push(`${field.replace(/_/g, ' ')} must be DD/MM/YYYY`);
    }
  }

  const tmpl = appState.template_type;

  if (tmpl === 'edf') {
    const edfFields = ['edf_client_number', 'edf_account_number', 'edf_pdl', 'edf_power', 'edf_tariff', 'edf_reading_type'];
    for (const field of edfFields) {
      if (!appState[field]?.trim()) errors.push(`Missing EDF field: ${field.replace(/edf_/g, '').replace(/_/g, ' ')}`);
    }
    if (appState.edf_client_number && !VALIDATORS.edf_client.regex.test(appState.edf_client_number)) {
      errors.push('EDF Client Number must be exactly 10 digits');
    }
    if (appState.edf_pdl && !VALIDATORS.edf_pdl.regex.test(appState.edf_pdl)) {
      errors.push('EDF PDL must be exactly 14 digits');
    }
  }

  if (tmpl === 'kenya_power' || tmpl === 'nicosia') {
    const meterFields = ['meter_number', 'meter_reading_date', 'previous_reading', 'current_reading', 'consumption_units'];
    for (const field of meterFields) {
      if (!appState[field]?.trim()) errors.push(`Missing meter field: ${field.replace(/_/g, ' ')}`);
    }
    if (appState.meter_reading_date && !VALIDATORS.date.regex.test(appState.meter_reading_date)) {
      errors.push('Meter reading date must be DD/MM/YYYY');
    }
  }

  if (tmpl === 'kenya_power') {
    if (!appState.kp_account_number?.trim()) errors.push('Missing Kenya Power Account Number');
    if (!appState.kp_tariff?.trim()) errors.push('Missing Kenya Power Tariff Category');
  }

  if (tmpl === 'nicosia') {
    if (!appState.nic_account_ref?.trim()) errors.push('Missing Nicosia Account Reference');
    if (!appState.nic_tariff?.trim()) errors.push('Missing Nicosia Tariff / Pricing Code');
    if (appState.nic_account_ref && !VALIDATORS.nicosia_ref.regex.test(appState.nic_account_ref)) {
      errors.push('Nicosia Account Reference must match XXXX/X/XXXXX/X/X');
    }
  }

  return errors;
}
