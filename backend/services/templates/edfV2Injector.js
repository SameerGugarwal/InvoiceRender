import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

/**
 * Accepts the loose money strings the form produces ("145.07", "1 234,56",
 * "€145.07") and returns a number, or null when there is nothing usable to
 * parse. Null is deliberate: it lets the caller leave a field blank rather than
 * print a confident "0,00 €" over missing data.
 */
function toAmount(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[^\d,.-]/g, '').trim();
  if (!cleaned) return null;
  // "1 234,56" / "1.234,56" -> comma is the decimal separator.
  const normalised = cleaned.includes(',') && !/,\d{3}(\D|$)/.test(cleaned)
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}

/** Formats to the French convention the reference bill uses: "1 234,56 €". */
function toEuro(amount) {
  if (amount === null) return '';
  return `${amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;
}

export function injectEDFv2(payload) {
  console.log('[EDF V2 Injector] Starting injection...');
  console.log(`[EDF V2 Injector] Incoming Payload:\n${JSON.stringify(payload, null, 2)}`);

  const totalTTC = toAmount(payload.financials?.totalAmountDue);
  const vatAmount = toAmount(payload.financials?.vatAmount);
  const paymentsReceived = toAmount(payload.financials?.paymentsReceived);

  // The bill shows a single electricity line, so its charge is the whole
  // pre-tax amount. Only derive it when both operands are present — guessing a
  // subtotal from a missing VAT figure would silently print a wrong number.
  const totalHT = totalTTC !== null && vatAmount !== null ? totalTTC - vatAmount : null;

  const readingType = String(payload.edfSpecific?.readingType || '').toLowerCase();

  const safePayload = {
    ...payload,
    edfV2: {
      totalHT: toEuro(totalHT),
      vatAmount: toEuro(vatAmount),
      totalTTC: toEuro(totalTTC),
      // Shown as a deduction, so it always reads negative on the bill.
      deduction: paymentsReceived === null ? '' : toEuro(-Math.abs(paymentsReceived)),
      // "Consumeracion sur index real" in the reference — "real" is the reading
      // type, so an estimated reading has to say so.
      readingLabel: readingType === 'estimated' ? 'estimé' : 'real',
      // Not carried by the payload; the reference prints literal placeholders.
      nextInvoiceDate: '00/00/0000',
      nextReadingDate: '00/00/0000',
    },
  };

  console.log(`[EDF V2 Injector] Computed edfV2 block:\n${JSON.stringify(safePayload.edfV2, null, 2)}`);

  try {
    const rawHtml = getRawTemplateHTML('edf_v2');
    const template = Handlebars.compile(rawHtml);
    const htmlContent = template(safePayload);
    console.log('[EDF V2 Injector] HTML successfully rendered.');
    return htmlContent;
  } catch (error) {
    console.error('[EDF V2 Injector] Injection failed:', error);
    throw error;
  }
}
