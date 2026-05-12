const SYMBOL_BASE = {
  RELIANCE: 2450,
  TCS: 3600,
  INFY: 1500,
  HDFCBANK: 1600,
  TATAMOTORS: 880,
  BAJFINANCE: 7000,
  WIPRO: 470,
  ICICIBANK: 1020,
  SBIN: 610,
  ADANIENT: 2800,
  ZOMATO: 160,
  HCLTECH: 1320,
  AXISBANK: 1010,
};

const TREND_MONTHS = [
  '2023-10',
  '2023-11',
  '2023-12',
  '2024-01',
  '2024-02',
  '2024-03',
  '2024-04',
  '2024-05',
  '2024-06',
];

function stableDelta(seed) {
  const s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

function monthPrice(base, symbol, monthIndex) {
  const wave = Math.sin((monthIndex + 1) * 0.95 + symbol.length) * 0.055;
  const drift = monthIndex * 0.012;
  const noise = (stableDelta((monthIndex + 1) * symbol.length) - 0.5) * 0.03;
  return Math.round(base * (1 + wave + drift + noise) * 100) / 100;
}

export const PRICE_HISTORY = Object.fromEntries(
  Object.entries(SYMBOL_BASE).map(([symbol, base]) => [
    symbol,
    Object.fromEntries(TREND_MONTHS.map((month, idx) => [month, monthPrice(base, symbol, idx)])),
  ])
);

export function getMonthKey(dateLike) {
  const d = new Date(dateLike);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
}

export function getPriceOnOrBefore(symbol, dateLike) {
  const monthKey = getMonthKey(dateLike);
  const monthSeries = PRICE_HISTORY[symbol];
  if (!monthSeries) return null;
  if (monthSeries[monthKey]) return monthSeries[monthKey];
  const months = Object.keys(monthSeries).sort();
  const fallback = months.filter((m) => m <= monthKey).pop();
  return fallback ? monthSeries[fallback] : monthSeries[months[0]];
}
