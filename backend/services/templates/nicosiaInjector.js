import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

export function injectNicosia(payload) {
  console.log(`[Nicosia Injector] Starting injection for Nicosia template...`);
  
  // Robust logging of incoming payload
  console.log(`[Nicosia Injector] Incoming Payload: \n${JSON.stringify(payload, null, 2)}`);

  // Strict mapping and explicit fallback values
  const parseConsumption = (str) => {
    if (!str) return "0";
    return str.replace(/[^\d]/g, '');
  };

  const safePayload = {
    flatPayload: payload,
    template_type: payload.template_type,
    customer: {
      fullName: payload.customer.fullName,
      address: payload.customer.street,
      city: payload.customer.city,
      postalCode: payload.customer.postalCode,
    },
    account: {
      accountNo: payload.nicosiaSpecific.accountRef,
      consumerNo: payload.nicosiaSpecific.accountRef,
      tariff: payload.nicosiaSpecific.tariff,
    },
    billing: {
      invoiceNumber: payload.billing.invoiceNumber,
      issueDate: payload.billing.issueDate,
    },
    billingPeriod: {
      start: payload.billing.periodStart,
      end: payload.billing.periodEnd,
      year: payload.billing.periodStart ? payload.billing.periodStart.split('/').pop() : new Date().getFullYear().toString(),
    },
    meter: {
      meterNo: payload.meter.number,
      number: payload.meter.number,
      present: payload.meter.currentReading,
      previous: payload.meter.previousReading,
      readingDate: payload.meter.readingDate,
      consumption: parseConsumption(payload.meter.consumptionUnits),
    },
    financials: {
      fixedCharge: "0.00",
      consumptionCharge: "0.00",
      sewerage: "0.00",
      previousBalance: payload.financials.previousBalance,
      paymentsReceived: payload.financials.paymentsReceived,
      vatRate: payload.financials.vatRate,
      vat: payload.financials.vatAmount,
      totalAmount: payload.financials.totalAmountDue,
      dueDate: payload.billing.dueDate,
    },
    apostille: {
      country: payload.apostille.country,
      signedBy: payload.apostille.signedBy,
      capacity: payload.apostille.capacity,
      organization: payload.apostille.organization,
      location: payload.apostille.location,
      date: payload.apostille.date,
      certifiedBy: payload.apostille.certifiedBy,
      referenceNumber: payload.apostille.referenceNumber,
      stampImage: payload.apostille.stampImage,
      signatureImage: payload.apostille.signatureImage,
    },
    certificate: {
      translatorName: payload.certificate.translatorName,
      city: payload.certificate.city,
      country: payload.certificate.country,
      idNumber: payload.certificate.idNumber,
      company: payload.certificate.company,
      sourceLanguage: payload.certificate.sourceLanguage,
      targetLanguage: payload.certificate.targetLanguage,
      documentType: payload.certificate.documentType,
      customerName: payload.certificate.customerName,
      address: payload.certificate.address,
      phone: payload.certificate.phone,
      email: payload.certificate.email,
      translatorRole: payload.certificate.translatorRole,
      date: payload.certificate.date,
      signatureImage: payload.certificate.signatureImage,
      circularStamp: payload.certificate.circularStamp,
      companySeal: payload.certificate.companySeal,
    }
  };

  console.log(`[Nicosia Injector] Safe payload mapped:\n${JSON.stringify(safePayload, null, 2)}`);

  try {
    const rawHtml = getRawTemplateHTML('nicosia');
    const template = Handlebars.compile(rawHtml);
    const htmlContent = template(safePayload);
    
    console.log(`[Nicosia Injector] HTML successfully rendered.`);
    return htmlContent;
  } catch (error) {
    console.error(`[Nicosia Injector] Error during HTML generation: ${error.message}`);
    throw error;
  }
}
