const BASE_URL = import.meta.env.VITE_API_BASE_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://invoicerender.onrender.com');

function buildPayload(flatPayload) {
  return {
    template_type: flatPayload.template_type,
    customer: {
      fullName: flatPayload.customer_name,
      street: flatPayload.customer_street,
      city: flatPayload.customer_city,
      postalCode: flatPayload.customer_postal
    },
    billing: {
      invoiceNumber: flatPayload.invoice_number,
      issueDate: flatPayload.invoice_date,
      periodStart: flatPayload.billing_start,
      periodEnd: flatPayload.billing_end,
      dueDate: flatPayload.due_date
    },
    financials: {
      previousBalance: flatPayload.previous_balance,
      paymentsReceived: flatPayload.payments_received,
      vatRate: flatPayload.vat_rate,
      totalAmountDue: flatPayload.total_due,
      vatAmount: flatPayload.vat_amount
    },
    edfSpecific: {
      clientNumber: flatPayload.edf_client_number,
      accountNumber: flatPayload.edf_account_number,
      pdlNumber: flatPayload.edf_pdl,
      subscribedPower: flatPayload.edf_power,
      tariffOption: flatPayload.edf_tariff,
      readingType: flatPayload.edf_reading_type
    },
    meter: {
      number: flatPayload.meter_number,
      readingDate: flatPayload.meter_reading_date,
      previousReading: flatPayload.previous_reading,
      currentReading: flatPayload.current_reading,
      consumptionUnits: flatPayload.consumption_units
    },
    kenyaSpecific: {
      accountNumber: flatPayload.kp_account_number,
      tariff: flatPayload.kp_tariff,
      maxAuthorizedLoad: flatPayload.kp_load,
      email: flatPayload.kp_email,
      consumptionHistory: flatPayload.kp_history
    },
    nicosiaSpecific: {
      accountRef: flatPayload.nic_account_ref,
      tariff: flatPayload.nic_tariff
    },
    apostille: {
      country: flatPayload.apo_country,
      signedBy: flatPayload.apo_signedBy,
      capacity: flatPayload.apo_capacity,
      organization: flatPayload.apo_organization,
      location: flatPayload.apo_location,
      date: flatPayload.apo_date,
      certifiedBy: flatPayload.apo_certifiedBy,
      referenceNumber: flatPayload.apo_referenceNumber,
    },
    certificate: {
      translatorName: flatPayload.cert_translatorName,
      city: flatPayload.cert_city,
      country: flatPayload.cert_country,
      idNumber: flatPayload.cert_idNumber,
      company: flatPayload.cert_company,
      sourceLanguage: flatPayload.cert_sourceLanguage,
      targetLanguage: flatPayload.cert_targetLanguage,
      documentType: flatPayload.cert_documentType,
      customerName: flatPayload.cert_customerName,
      address: flatPayload.cert_address,
      phone: flatPayload.cert_phone,
      email: flatPayload.cert_email,
      translatorRole: flatPayload.cert_translatorRole,
      date: flatPayload.cert_date,
    }
  };
}

export async function generatePdfAPI(flatPayload) {
  const payload = buildPayload(flatPayload);

  console.log("FRONTEND STATE", flatPayload);
  console.log("PAYLOAD SENT TO BACKEND", payload);

  const response = await fetch(`${BASE_URL}/api/generate-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.blob();
}

export async function fetchPreviewHtmlAPI(flatPayload) {
  const payload = buildPayload(flatPayload);

  console.log("FRONTEND STATE", flatPayload);
  console.log("PAYLOAD SENT TO BACKEND", payload);

  const response = await fetch(`${BASE_URL}/api/preview-html`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to load template preview');
  }
  return response.text();
}
