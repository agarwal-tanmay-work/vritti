/**
 * Illustrative Nifty 50 daily % moves (vs previous close) for pattern nudges.
 * Not live data — deterministic series so offline analysis matches marketing copy style.
 */
const MS_PER_DAY = 86400000;

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = Math.imul(31, h) + s.charCodeAt(i);
  }
  return Math.abs(h);
}

function buildSeries() {
  const out = [];
  const start = new Date('2023-09-01T12:00:00Z');
  const end = new Date('2024-07-15T12:00:00Z');
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
    const d = new Date(t);
    const dow = d.getUTCDay();
    if (dow === 0 || dow === 6) continue;
    const key = d.toISOString().slice(0, 10);
    let pct = (hashStr(key) % 130) / 50 - 1.1;
    if (hashStr(`${key}-s`) % 14 === 0) pct -= 2.35;
    if (hashStr(`${key}-u`) % 31 === 0) pct += 1.4;
    out.push([key, Math.round(pct * 100) / 100]);
  }
  return out;
}

const ENTRIES = buildSeries();

export const NIFTY_BY_DATE = Object.fromEntries(ENTRIES);

export const NIFTY_ORDERED_DATES = ENTRIES.map((e) => e[0]);

/** First ~3 hours after 9:15 IST ≈ sell before 12:15 */
export function sellWithinFirstThreeSessionHours(dateStr) {
  const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return true;
  const h = d.getHours() + d.getMinutes() / 60;
  return h <= 12.25;
}

export function forwardSessionsNetReturn(startDateKey, sessionCount = 5) {
  const idx = NIFTY_ORDERED_DATES.indexOf(startDateKey);
  if (idx < 0) return null;
  let sum = 0;
  let n = 0;
  for (let j = idx + 1; j < NIFTY_ORDERED_DATES.length && n < sessionCount; j += 1) {
    sum += NIFTY_BY_DATE[NIFTY_ORDERED_DATES[j]] ?? 0;
    n += 1;
  }
  return n === 0 ? null : sum;
}

/**
 * Build homepage-style nudge from user sells + benchmark series.
 */
export function buildNiftyStressNudge(sellTrades) {
  const strict = [];
  const sameDay = [];
  sellTrades.forEach((s) => {
    if ((s.pnl ?? 0) >= 0) return;
    const day = s.date.slice(0, 10);
    const n = NIFTY_BY_DATE[day];
    if (n === undefined || n > -2) return;
    const fwd = forwardSessionsNetReturn(day, 5);
    if (fwd === null) return;
    const recovered = fwd > 0.35;
    sameDay.push({ recovered });
    if (sellWithinFirstThreeSessionHours(s.date)) strict.push({ recovered });
  });
  const events = strict.length > 0 ? strict : sameDay;
  if (events.length === 0) return null;
  const recovered = events.filter((e) => e.recovered).length;
  const windowLabel = strict.length > 0
    ? 'you sold within the first three hours of the session'
    : 'you also booked a losing sell that same day';
  return {
    title: `Nifty drawdown days vs your exits (${events.length} overlap${strict.length > 0 ? ', strict timing' : ', same-day sell'}).`,
    evidence: `When the illustrative Nifty series fell at least 2% and ${windowLabel}, the next five sessions were net positive for the benchmark in ${recovered} of ${events.length} case(s). Live index data is not used; this mirrors the “stress day exit” idea on your file.`,
  };
}
