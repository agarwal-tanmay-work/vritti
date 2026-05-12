export const TRENDING_DATES = {
  ADANIENT: ['2024-02-18', '2024-06-08'],
  ZOMATO: ['2024-02-14', '2024-04-20'],
  TATAMOTORS: ['2024-02-02'],
};

const SYMBOLS = [
  'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'BAJFINANCE', 'WIPRO',
  'ICICIBANK', 'SBIN', 'ADANIENT', 'ZOMATO', 'HCLTECH', 'AXISBANK',
];

const BASE_PRICE = {
  RELIANCE: 2480,
  TCS: 3780,
  INFY: 1520,
  HDFCBANK: 1630,
  TATAMOTORS: 930,
  BAJFINANCE: 7020,
  WIPRO: 470,
  ICICIBANK: 1030,
  SBIN: 610,
  ADANIENT: 2920,
  ZOMATO: 168,
  HCLTECH: 1320,
  AXISBANK: 990,
};

function makeDate(month, day, hour, minute = 0) {
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `2024-${m}-${d} ${h}:${mm}:00`;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

const trades = [];
let id = 1;

function pushTrade(date, symbol, type, qty, price, pnl = null, holdingDays = null) {
  trades.push({ id: id++, date, symbol, type, qty, price: round2(price), pnl, holdingDays });
}

function makePair({ buyDate, sellDate, symbol, qty, buyPrice, sellPrice }) {
  const holdingDays = Math.max(
    1,
    Math.round((new Date(sellDate).getTime() - new Date(buyDate).getTime()) / 86400000)
  );
  pushTrade(buyDate, symbol, 'BUY', qty, buyPrice, null, null);
  pushTrade(sellDate, symbol, 'SELL', qty, sellPrice, round2((sellPrice - buyPrice) * qty), holdingDays);
}

// Oct 2023 - Jan 2024: mostly quick wins then aggressive size after streak
makePair({ buyDate: '2023-10-03 09:20:00', sellDate: '2023-10-07 13:10:00', symbol: 'SBIN', qty: 25, buyPrice: 565, sellPrice: 582 });
makePair({ buyDate: '2023-10-09 09:35:00', sellDate: '2023-10-13 15:00:00', symbol: 'ICICIBANK', qty: 18, buyPrice: 1010, sellPrice: 1045 });
makePair({ buyDate: '2023-10-16 09:30:00', sellDate: '2023-10-20 14:25:00', symbol: 'TCS', qty: 6, buyPrice: 3620, sellPrice: 3700 });
makePair({ buyDate: '2023-10-23 09:40:00', sellDate: '2023-10-25 14:40:00', symbol: 'HDFCBANK', qty: 16, buyPrice: 1580, sellPrice: 1625 });
makePair({ buyDate: '2023-10-26 09:25:00', sellDate: '2023-10-31 13:45:00', symbol: 'RELIANCE', qty: 9, buyPrice: 2360, sellPrice: 2440 });

// Overconfidence after wins: larger losing trade
makePair({ buyDate: '2023-11-01 09:18:00', sellDate: '2023-11-07 13:50:00', symbol: 'SBIN', qty: 45, buyPrice: 598, sellPrice: 548 });

// Long-loss holding + sunk cost
pushTrade('2023-11-10 09:22:00', 'BAJFINANCE', 'BUY', 5, 7200, null, null);
pushTrade('2023-11-28 09:28:00', 'BAJFINANCE', 'BUY', 5, 6800, null, null);
pushTrade('2023-12-19 09:32:00', 'BAJFINANCE', 'BUY', 5, 6420, null, null);
pushTrade('2024-02-06 14:50:00', 'BAJFINANCE', 'SELL', 15, 6040, -7020, 88);

// Calendar effect and overtrading around year boundaries
makePair({ buyDate: '2023-12-29 10:05:00', sellDate: '2024-01-02 10:15:00', symbol: 'HCLTECH', qty: 12, buyPrice: 1340, sellPrice: 1312 });
makePair({ buyDate: '2024-01-02 10:30:00', sellDate: '2024-01-04 11:05:00', symbol: 'AXISBANK', qty: 18, buyPrice: 1020, sellPrice: 998 });
makePair({ buyDate: '2024-01-02 11:10:00', sellDate: '2024-01-05 13:00:00', symbol: 'INFY', qty: 14, buyPrice: 1560, sellPrice: 1518 });

// Build 52 completed trades over Oct-Jun (104 rows) + open positions to 120 rows.
for (let month = 1; month <= 6; month += 1) {
  for (let k = 0; k < 7; k += 1) {
    const symbol = SYMBOLS[(month * 3 + k) % SYMBOLS.length];
    const day = Math.min(26, 3 + (k * 3));
    const qty = symbol === 'ZOMATO' ? 90 : symbol === 'BAJFINANCE' ? 4 : 10 + ((k + month) % 12);
    const base = BASE_PRICE[symbol];
    const buyPrice = base * (1 + (((k + month) % 5) - 2) * 0.015);
    const isPanic = k % 6 === 0;
    const isFomo = ['TCS', 'INFY', 'RELIANCE', 'HDFCBANK'].includes(symbol) && k % 4 === 1;
    const hold = isPanic ? 2 : (k % 2 === 0 ? 9 : 24);
    const sellDay = Math.min(28, day + hold);
    const shock = isPanic ? -0.05 : (isFomo ? -0.03 : (k % 3 === 0 ? 0.025 : -0.012));
    const sellPrice = buyPrice * (1 + shock);
    const buyDate = makeDate(month, day, 9 + (k % 3), 10 + k);
    const sellDate = makeDate(month, sellDay, 14, 5 + k);
    makePair({ buyDate, sellDate, symbol, qty, buyPrice, sellPrice });

    // Revenge trade: immediate buy after losing sell within 48h
    if (shock < 0 && k % 3 === 0) {
      const revengeSymbol = SYMBOLS[(k + month + 5) % SYMBOLS.length];
      const revengePrice = BASE_PRICE[revengeSymbol] * 1.01;
      pushTrade(makeDate(month, Math.min(28, sellDay + 1), 10, 20), revengeSymbol, 'BUY', 8, revengePrice, null, null);
      pushTrade(
        makeDate(month, Math.min(28, sellDay + 9), 13, 45),
        revengeSymbol,
        'SELL',
        8,
        revengePrice * 0.97,
        round2(revengePrice * 8 * -0.03),
        8
      );
    }
  }
}

// Herd entries around trend windows
makePair({ buyDate: '2024-02-16 10:20:00', sellDate: '2024-03-05 14:10:00', symbol: 'ZOMATO', qty: 120, buyPrice: 188, sellPrice: 171 });
makePair({ buyDate: '2024-02-20 09:45:00', sellDate: '2024-03-12 15:00:00', symbol: 'ADANIENT', qty: 11, buyPrice: 3210, sellPrice: 2930 });
makePair({ buyDate: '2024-06-10 10:10:00', sellDate: '2024-06-24 14:30:00', symbol: 'ADANIENT', qty: 9, buyPrice: 3095, sellPrice: 2870 });

// Open positions for paper gains/losses and disposition effect approximation
pushTrade('2024-06-24 10:12:00', 'RELIANCE', 'BUY', 7, 3010, null, null);
pushTrade('2024-06-25 11:00:00', 'TCS', 'BUY', 4, 4010, null, null);
pushTrade('2024-06-25 11:10:00', 'INFY', 'BUY', 9, 1640, null, null);
pushTrade('2024-06-26 09:50:00', 'HDFCBANK', 'BUY', 11, 1760, null, null);
pushTrade('2024-06-27 10:30:00', 'WIPRO', 'BUY', 20, 495, null, null);
pushTrade('2024-06-27 10:45:00', 'BAJFINANCE', 'BUY', 3, 7360, null, null);

export const SAMPLE_TRADES = trades.slice(0, 120);
