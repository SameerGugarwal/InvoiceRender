import Handlebars from 'handlebars';
import { getRawTemplateHTML } from '../templateService.js';

/**
 * Accepts the loose strings the form produces ("2784.00", "1 250,00", "660 kWh")
 * and returns a number, or null when there is nothing usable to parse.
 */
function toNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value).replace(/[^\d,.-]/g, '').trim();
  if (!cleaned) return null;
  const normalised = cleaned.includes(',') && !/,\d{3}(\D|$)/.test(cleaned)
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}

/** Kenya Power prints plain 2dp figures; the "Ksh" lives in the labels. */
function money(n) {
  return n === null ? '' : n.toFixed(2);
}

function addDays(dmy, days) {
  const [d, m, y] = String(dmy).split('/').map(Number);
  if (!d || !m || !y) return '';
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

// Kenya Power gives 14 days from the due date before disconnection.
const DISCONNECTION_NOTICE_DAYS = 14;

// The trend chart shows the six months ending with this bill's own period.
const TREND_MONTHS = 6;
const AXIS_DIVISIONS = 10;
const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Rounds an axis up to a readable maximum (1/2/2.5/5 x a power of ten) so the
 * ten gridlines land on round numbers instead of values like 630.
 */
function niceAxisMax(peak) {
  if (!peak || peak <= 0) return AXIS_DIVISIONS;
  const rawStep = peak / AXIS_DIVISIONS;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((c) => c >= rawStep);
  return step * AXIS_DIVISIONS;
}

function withThousands(n) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/** The month labels for the six months ending on `dmy`, oldest first. */
function trailingMonths(dmy) {
  const [, m, y] = String(dmy).split('/').map(Number);
  if (!m || !y) return [];
  const end = new Date(y, m - 1, 1);
  const out = [];
  for (let i = TREND_MONTHS - 1; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    out.push(MONTH_NAMES[d.getMonth()]);
  }
  return out;
}

/**
 * Builds the consumption trend from the history the user supplied, aligned to
 * the six months ending with this bill. The axis is scaled to the real figures
 * rather than a fixed 100,000, so the chart agrees with the consumption the rest
 * of the bill reports. Months without history render as an empty slot instead of
 * an invented bar.
 */
function buildTrend(history, periodEnd, currentUnits) {
  const months = trailingMonths(periodEnd);
  if (!months.length) return null;

  let values = String(history || '')
    .split(',')
    .map((v) => toNumber(v))
    .filter((v) => v !== null);

  // Fall back to plotting just this bill's own consumption.
  if (!values.length) values = currentUnits === null ? [] : [currentUnits];
  values = values.slice(-TREND_MONTHS);

  // Align to the most recent months; older months without data stay blank.
  const padded = Array(Math.max(0, TREND_MONTHS - values.length)).fill(null).concat(values);

  const peak = Math.max(...padded.filter((v) => v !== null), 0);
  const axisMax = niceAxisMax(peak);

  return {
    axis: Array.from({ length: AXIS_DIVISIONS + 1 },
      (_, i) => withThousands((axisMax / AXIS_DIVISIONS) * (AXIS_DIVISIONS - i))),
    bars: padded.map((value, i) => ({
      label: months[i],
      height: value === null ? 0 : Math.round((value / axisMax) * 100),
    })),
  };
}

export function injectKenyaPower(payload) {
  const total = toNumber(payload.financials?.totalAmountDue);
  const vatAmount = toNumber(payload.financials?.vatAmount);
  const previousBalance = toNumber(payload.financials?.previousBalance);
  const paymentsReceived = toNumber(payload.financials?.paymentsReceived);
  const units = toNumber(payload.meter?.consumptionUnits);

  // The bill has to add up:
  //   monthly + broughtForward - appliedCredit = totalAmountDue
  // so the month's own charge is whatever is left once the carried balance and
  // any credit are taken out of the payable total.
  const monthlyTotal = total === null ? null
    : total - (previousBalance ?? 0) + (paymentsReceived ?? 0);

  // The single energy line carries the whole pre-tax charge, and its unit price
  // is derived from it, so "units x rate = amount" is true rather than decorative.
  const energyCost = monthlyTotal === null || vatAmount === null ? null : monthlyTotal - vatAmount;
  const unitRate = energyCost === null || !units ? null : energyCost / units;

  const dueDate = payload.billing?.dueDate;

  // The supply location is where the meter is — the customer's own address.
  const supplyLocation = [
    payload.customer?.street,
    [payload.customer?.city, payload.customer?.postalCode].filter(Boolean).join(' '),
  ].filter((part) => part && String(part).trim()).join(', ');

  const safePayload = {
    ...payload,
    kenya: {
      supplyLocation,
      maxAuthorizedLoad: payload.kenyaSpecific?.maxAuthorizedLoad ?? '',
      email: payload.kenyaSpecific?.email ?? '',
      trend: buildTrend(payload.kenyaSpecific?.consumptionHistory, payload.billing?.periodEnd, units),
      units: units === null ? '' : String(units),
      // 4dp keeps "units x rate" within a cent of the energy total (2dp would be
      // off by ~2 Ksh and read as a contradiction), and matches the per-kWh rate
      // precision this bill already used.
      unitRate: unitRate === null ? '' : unitRate.toFixed(4),
      energyCost: money(energyCost),
      vatRate: payload.financials?.vatRate ?? '',
      vatAmount: money(vatAmount),
      monthlyTotal: money(monthlyTotal),
      previousBalance: money(previousBalance),
      // Shown as a credit, so it always reads negative.
      appliedCredit: paymentsReceived === null ? '' : money(-Math.abs(paymentsReceived)),
      // Disconnection notice tracks the live due date instead of fixed dates.
      noticeFrom: dueDate ?? '',
      disconnectionDate: dueDate ? addDays(dueDate, DISCONNECTION_NOTICE_DAYS) : '',
    },
  };

  console.log(`[Kenya Injector] Derived block:\n${JSON.stringify(safePayload.kenya, null, 2)}`);

  const rawHtml = getRawTemplateHTML('kenya_power');
  const template = Handlebars.compile(rawHtml);
  return template(safePayload);
}
