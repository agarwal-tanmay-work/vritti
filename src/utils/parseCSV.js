import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .replace(/^\ufeff/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sanitizeFields(fields) {
  return (fields || []).map((f) => normalizeHeader(f));
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return NaN;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  const s = String(val).replace(/,/g, '').replace(/\s/g, '').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function parseDateStrict(value, rowIndex) {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Row ${rowIndex}: missing date value.`);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 19);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const epoch = Date.UTC(1899, 11, 30);
    const parsed = new Date(epoch + value * 86400000);
    return parsed.toISOString().slice(0, 19);
  }
  const raw = String(value).trim();
  const isoTry = new Date(raw);
  if (!Number.isNaN(isoTry.getTime()) && raw.length >= 8) {
    const y = isoTry.getFullYear();
    if (y >= 1990 && y <= 2100) return isoTry.toISOString().slice(0, 19);
  }
  const dmY = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (dmY) {
    let d = parseInt(dmY[1], 10);
    let m = parseInt(dmY[2], 10) - 1;
    let y = parseInt(dmY[3], 10);
    if (y < 100) y += 2000;
    const hh = dmY[4] !== undefined ? parseInt(dmY[4], 10) : 9;
    const mm = dmY[5] !== undefined ? parseInt(dmY[5], 10) : 15;
    const ss = dmY[6] !== undefined ? parseInt(dmY[6], 10) : 0;
    if (d >= 1 && d <= 31 && m >= 0 && m <= 11) {
      const parsed = new Date(y, m, d, hh, mm, ss);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 19);
    }
  }
  const ymd = raw.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const hh = ymd[4] !== undefined ? parseInt(ymd[4], 10) : 9;
    const mm = ymd[5] !== undefined ? parseInt(ymd[5], 10) : 15;
    const ss = ymd[6] !== undefined ? parseInt(ymd[6], 10) : 0;
    const parsed = new Date(y, m, d, hh, mm, ss);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 19);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Row ${rowIndex}: unrecognised date format "${value}".`);
  }
  return parsed.toISOString().slice(0, 19);
}

function validatePositiveNumber(num, label, rowIndex) {
  if (num === null || num === undefined || Number.isNaN(num)) {
    throw new Error(`Row ${rowIndex}: missing ${label}.`);
  }
  if (num <= 0) {
    throw new Error(`Row ${rowIndex}: invalid ${label} "${num}" (must be positive).`);
  }
}

const DATE_KEY_CANDIDATES = [
  'order_execution_time',
  'trade_date',
  'date',
  'order_timestamp',
  'time',
  'order_time',
  'trade_time',
  'execution_time',
  'datetime',
  'txn_date',
  'transaction_date',
  'fill_time',
  'exchange_timestamp',
  'execution_date',
  'order_date',
  'booked_date',
  'timestamp',
  'exchange_time',
];

function hasAnyKey(set, keys) {
  return keys.some((k) => set.has(k));
}

/** Returns 'tradeBook' | 'pnlStatement' | 'taxPnlTradewise' | 'unsupportedSummary' | null */
function tryDetectFormat(fieldNamesRaw) {
  const normalized = sanitizeFields(fieldNamesRaw);
  const set = new Set(normalized);

  const hasSymbol = hasAnyKey(set, ['symbol', 'tradingsymbol', 'trading_symbol', 'instrument', 'scrip']);
  const hasType = hasAnyKey(set, ['trade_type', 'transaction_type', 'txn_type', 'side', 'type', 'action']);
  const hasQty = hasAnyKey(set, ['quantity', 'qty', 'trade_quantity', 'filled_quantity', 'fill_qty']);
  const hasPrice = hasAnyKey(set, [
    'price',
    'average_price',
    'avg_price',
    'trade_price',
    'fill_price',
    'average',
    'average_trade_price',
    'avg_trade_price',
    'execution_price',
  ]);
  const hasDate = hasAnyKey(set, DATE_KEY_CANDIDATES);

  if (hasSymbol && hasType && hasQty && hasPrice && hasDate) {
    return 'tradeBook';
  }

  // Tax P&L Tradewise Exits format: Symbol, ISIN, Entry Date, Exit Date, Quantity, Buy Value, Sell Value, Profit
  const hasEntryDate = hasAnyKey(set, ['entry_date', 'entrydate']);
  const hasExitDate = hasAnyKey(set, ['exit_date', 'exitdate']);
  const hasBuyValue = hasAnyKey(set, ['buy_value', 'buyvalue']);
  const hasSellValue = hasAnyKey(set, ['sell_value', 'sellvalue']);
  const hasProfit = hasAnyKey(set, ['profit', 'pnl', 'realized_profit']);

  if (hasSymbol && hasEntryDate && hasExitDate && hasQty && hasBuyValue && hasSellValue) {
    return 'taxPnlTradewise';
  }

  const pnlQtyPrice =
    hasAnyKey(set, ['symbol', 'tradingsymbol']) &&
    (hasAnyKey(set, ['buy_quantity', 'buy_qty']) && hasAnyKey(set, ['sell_quantity', 'sell_qty'])) &&
    hasAnyKey(set, ['buy_price', 'avg_buy_price']) &&
    hasAnyKey(set, ['sell_price', 'avg_sell_price']);

  if (pnlQtyPrice) {
    return 'pnlStatement';
  }

  // Detect P&L summary reports (Account Head, Amount format)
  const hasAccountHead = hasAnyKey(set, ['account_head', 'accounthead', 'account']);
  const hasAmount = hasAnyKey(set, ['amount', 'value']);
  const hasCharges = hasAnyKey(set, ['charges', 'brokerage']);

  if (hasAccountHead && hasAmount && hasCharges) {
    return 'unsupportedSummary';
  }

  return null;
}

function detectFormat(fieldNamesRaw) {
  const fmt = tryDetectFormat(fieldNamesRaw);
  if (!fmt) {
    const hint = (fieldNamesRaw || []).slice(0, 12).join(', ');
    throw new Error(
      `Unsupported file format. Expected Zerodha Trade Book (symbol, BUY/SELL, qty, price, time), Tax P&L Tradewise Exits, or P&L export. `
      + `Columns seen: ${hint || '(none)'}.`
    );
  }
  if (fmt === 'unsupportedSummary') {
    throw new Error(
      'This file appears to be a P&L summary report (charges, realized P&L, account heads). '
      + 'Vritti requires individual trade data for behavioral analysis. '
      + 'Please use: (1) Trade Book export from Kite → Orders → Tradebook, or (2) Tax P&L report with "Tradewise Exits" sheet.'
    );
  }
  return fmt;
}

function mapKeysCaseInsensitive(row) {
  const mapped = {};
  Object.entries(row || {}).forEach(([key, value]) => {
    mapped[normalizeHeader(key)] = value;
  });
  return mapped;
}

/** Drop trailing blank cells (common in XLSX ranges). */
function trimTrailingEmptyCells(row) {
  if (!row || !row.length) return [];
  const a = [...row];
  while (
    a.length > 0
    && (a[a.length - 1] === '' || a[a.length - 1] == null || String(a[a.length - 1]).trim() === '')
  ) {
    a.pop();
  }
  return a;
}

/**
 * Zerodha tradebook XLSX files include title rows; the real header is often row 10–20.
 * Scan a 2D matrix (from Papa header:false or XLSX sheet_to_json header:1) for a header row.
 */
function findHeaderMatrix(matrix, maxScan = 150) {
  if (!matrix || !matrix.length) return null;
  const n = Math.min(maxScan, matrix.length);
  for (let i = 0; i < n; i += 1) {
    const raw = matrix[i];
    if (!raw || !raw.length) continue;
    const cells = trimTrailingEmptyCells(raw);
    const fields = cells.map((c) => String(c ?? '').replace(/^\ufeff/g, '').trim());
    if (fields.length < 4 || fields.some((f) => !f)) continue;
    const fmt = tryDetectFormat(fields);
    if (!fmt) continue;

    const rows = [];
    for (let r = i + 1; r < matrix.length; r += 1) {
      const dataRow = matrix[r];
      if (!dataRow) continue;
      const obj = {};
      let any = false;
      for (let j = 0; j < fields.length; j += 1) {
        const key = fields[j];
        const v = dataRow[j];
        if (v !== undefined && v !== null && String(v).trim() !== '') any = true;
        obj[key] = v === undefined || v === null ? '' : v;
      }
      if (any) rows.push(obj);
    }
    if (rows.length) return { fields, rows, format: fmt, headerRowIndex: i };
  }
  return null;
}

function computeCompletedAndOpen(trades) {
  const buysBySymbol = {};
  const completed = [];
  const openPositions = [];

  trades
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((trade) => {
      if (trade.type === 'BUY') {
        if (!buysBySymbol[trade.symbol]) buysBySymbol[trade.symbol] = [];
        buysBySymbol[trade.symbol].push({ ...trade, remainingQty: trade.qty });
        return;
      }

      let remainingSellQty = trade.qty;
      const buyQueue = buysBySymbol[trade.symbol] || [];
      while (remainingSellQty > 0 && buyQueue.length > 0) {
        const buyLeg = buyQueue[0];
        const matchedQty = Math.min(remainingSellQty, buyLeg.remainingQty);
        const buyDate = new Date(buyLeg.date);
        const sellDate = new Date(trade.date);
        const holdingDays = Math.max(1, Math.round((sellDate - buyDate) / 86400000));
        const pnl = (trade.price - buyLeg.price) * matchedQty;
        completed.push({
          id: `${trade.id}-${completed.length + 1}`,
          date: trade.date,
          symbol: trade.symbol,
          type: 'SELL',
          qty: matchedQty,
          price: trade.price,
          pnl: Math.round(pnl * 100) / 100,
          holdingDays,
          buyDate: buyLeg.date,
          buyPrice: buyLeg.price,
          sellDate: trade.date,
          sellPrice: trade.price,
        });
        buyLeg.remainingQty -= matchedQty;
        remainingSellQty -= matchedQty;
        if (buyLeg.remainingQty <= 0) buyQueue.shift();
      }
    });

  Object.entries(buysBySymbol).forEach(([symbol, legs]) => {
    legs.forEach((buyLeg) => {
      if (buyLeg.remainingQty > 0) {
        openPositions.push({
          id: `open-${buyLeg.id}`,
          date: buyLeg.date,
          symbol,
          type: 'BUY',
          qty: buyLeg.remainingQty,
          price: buyLeg.price,
          pnl: null,
          holdingDays: null,
        });
      }
    });
  });

  return { completedTrades: completed, openPositions };
}

function normalizeTradeType(raw) {
  const t = String(raw || '').trim().toUpperCase();
  if (t === 'B' || t === 'BUY') return 'BUY';
  if (t === 'S' || t === 'SELL') return 'SELL';
  return t;
}

function pickFirstDate(r) {
  for (const k of DATE_KEY_CANDIDATES) {
    if (r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') return r[k];
  }
  return null;
}

function buildTradesFromTradeBook(rows) {
  const out = [];
  let seq = 0;
  rows.forEach((row, i) => {
    const r = mapKeysCaseInsensitive(row);
    const rowIndex = i + 2;
    const symbol = String(
      r.symbol || r.tradingsymbol || r.trading_symbol || r.instrument || r.scrip || ''
    ).trim().toUpperCase();
    const typeRaw = r.trade_type || r.transaction_type || r.txn_type || r.side || r.type || r.action;
    const type = normalizeTradeType(typeRaw);
    const qty = parseNumber(r.quantity ?? r.qty ?? r.trade_quantity ?? r.filled_quantity ?? r.fill_qty);
    const price = parseNumber(
      r.price ?? r.average_price ?? r.avg_price ?? r.trade_price ?? r.fill_price ?? r.average
        ?? r.average_trade_price ?? r.avg_trade_price ?? r.execution_price
    );
    const dateValue = pickFirstDate(r);
    if (!symbol) return;
    if (!['BUY', 'SELL'].includes(type)) return;
    try {
      validatePositiveNumber(qty, 'quantity', rowIndex);
      validatePositiveNumber(price, 'price', rowIndex);
    } catch {
      return;
    }
    let isoDate;
    try {
      isoDate = parseDateStrict(dateValue, rowIndex);
    } catch {
      return;
    }
    seq += 1;
    out.push({
      id: seq,
      date: isoDate,
      symbol,
      type,
      qty,
      price,
      pnl: null,
      holdingDays: null,
    });
  });
  if (!out.length) {
    throw new Error('No valid trade rows found. Check that symbol, BUY/SELL, quantity, price, and date columns are populated.');
  }
  return out;
}

function buildTradesFromTaxPnlTradewise(rows) {
  const trades = [];
  rows.forEach((row, i) => {
    const rowIndex = i + 2;
    const r = mapKeysCaseInsensitive(row);
    const symbol = String(r.symbol || r.tradingsymbol || '').trim().toUpperCase();
    if (!symbol) return;

    const entryDateRaw = r.entry_date ?? r.entrydate;
    const exitDateRaw = r.exit_date ?? r.exitdate;
    const qty = parseNumber(r.quantity ?? r.qty ?? 0);
    const buyValue = parseNumber(r.buy_value ?? r.buyvalue ?? 0);
    const sellValue = parseNumber(r.sell_value ?? r.sellvalue ?? 0);
    const profitRaw = r.profit ?? r.pnl ?? r.realized_profit ?? 0;

    if (!entryDateRaw || !exitDateRaw) return;
    if (qty <= 0) return;

    try {
      validatePositiveNumber(buyValue, 'Buy Value', rowIndex);
      validatePositiveNumber(sellValue, 'Sell Value', rowIndex);
    } catch {
      return;
    }

    const buyPrice = buyValue / qty;
    const sellPrice = sellValue / qty;
    const profit = parseNumber(profitRaw) || 0;

    let entryIsoDate, exitIsoDate;
    try {
      entryIsoDate = parseDateStrict(entryDateRaw, rowIndex);
      exitIsoDate = parseDateStrict(exitDateRaw, rowIndex);
    } catch {
      return;
    }

    const entryDate = new Date(entryIsoDate);
    const exitDate = new Date(exitIsoDate);
    const holdingDays = Math.max(1, Math.round((exitDate - entryDate) / 86400000));

    // Create BUY trade
    trades.push({
      id: `${i + 1}-B`,
      date: entryIsoDate,
      symbol,
      type: 'BUY',
      qty,
      price: buyPrice,
      pnl: null,
      holdingDays: null,
    });

    // Create SELL trade with P&L
    trades.push({
      id: `${i + 1}-S`,
      date: exitIsoDate,
      symbol,
      type: 'SELL',
      qty,
      price: sellPrice,
      pnl: Math.round(profit * 100) / 100,
      holdingDays,
      buyDate: entryIsoDate,
      buyPrice,
    });
  });

  if (!trades.length) {
    throw new Error('No valid trade rows found in Tax P&L Tradewise Exits sheet.');
  }
  return trades;
}

function buildTradesFromPnl(rows) {
  const trades = [];
  rows.forEach((row, i) => {
    const rowIndex = i + 2;
    const r = mapKeysCaseInsensitive(row);
    const symbol = String(r.symbol || r.tradingsymbol || '').trim().toUpperCase();
    if (!symbol) return;
    const buyQty = parseNumber(r.buy_quantity ?? r.buy_qty ?? 0);
    const sellQty = parseNumber(r.sell_quantity ?? r.sell_qty ?? 0);
    const buyPrice = parseNumber(r.buy_price ?? r.avg_buy_price ?? 0);
    const sellPrice = parseNumber(r.sell_price ?? r.avg_sell_price ?? 0);
    const baseDate = new Date(2024, 0, 1 + i);
    if (buyQty > 0) {
      validatePositiveNumber(buyPrice, 'Buy Price', rowIndex);
      trades.push({
        id: `${i + 1}-B`,
        date: new Date(baseDate).toISOString().slice(0, 19),
        symbol,
        type: 'BUY',
        qty: buyQty,
        price: buyPrice,
        pnl: null,
        holdingDays: null,
      });
    }
    if (sellQty > 0) {
      validatePositiveNumber(sellPrice, 'Sell Price', rowIndex);
      const sellDate = new Date(baseDate);
      sellDate.setDate(sellDate.getDate() + 7);
      const pnlRaw = r.realized_p_l
        ?? r.realized_pnl
        ?? r.realized_pl
        ?? r.pnl
        ?? r.profit
        ?? 0;
      trades.push({
        id: `${i + 1}-S`,
        date: sellDate.toISOString().slice(0, 19),
        symbol,
        type: 'SELL',
        qty: sellQty,
        price: sellPrice,
        pnl: parseNumber(pnlRaw) || 0,
        holdingDays: null,
      });
    }
  });
  return trades;
}

function extractRowsFromWorkbook(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buf = new Uint8Array(e.target.result);
        const workbook = XLSX.read(buf, { type: 'array', cellDates: true });
        const names = workbook.SheetNames || [];
        let lastErr = null;
        for (const sheetName of names) {
          const sheet = workbook.Sheets[sheetName];
          const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false });
          const found = findHeaderMatrix(matrix);
          if (found) {
            resolve({
              rows: found.rows,
              fields: found.fields,
              sheetName: sheetName || '',
              format: found.format,
            });
            return;
          }
          const rowsLegacy = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
          if (rowsLegacy.length) {
            const fields = Object.keys(rowsLegacy[0]).map((k) => String(k || '').replace(/^\ufeff/g, '').trim());
            const fmt = tryDetectFormat(fields);
            if (fmt) {
              resolve({ rows: rowsLegacy, fields, sheetName: sheetName || '', format: fmt });
              return;
            }
          }
          lastErr = new Error(`Sheet "${sheetName}" did not match Trade Book or P&L columns (no header row found in first ${100} lines).`);
        }
        reject(lastErr || new Error('Workbook has no usable trade data.'));
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read Excel file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseCSVFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected.'));
    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xls') || fileName.endsWith('.xlsx');
    if (!isCsv && !isExcel) {
      return reject(new Error('Invalid file type. Please upload a .csv, .xls, or .xlsx file.'));
    }
    if (file.size === 0) return reject(new Error('Empty file detected (0 bytes).'));
    if (file.size > 32 * 1024 * 1024) {
      return reject(new Error('File too large (max 32 MB). For very long histories, split by year or trim the export.'));
    }

    onProgress?.('✓ File received');

    const handleParsedRows = (fields, dataRows, preDetectedFormat = null) => {
      try {
        const cleanFields = (fields || []).map((f) => String(f || '').replace(/^\ufeff/g, '').trim());
        if (!cleanFields.length) throw new Error('File has no headers.');
        const format = preDetectedFormat || detectFormat(cleanFields);
        const formatName =
          format === 'tradeBook' ? 'Zerodha Trade Book' :
          format === 'taxPnlTradewise' ? 'Tax P&L Tradewise Exits' :
          'Zerodha P&L Statement';
        onProgress?.(`✓ Format detected: ${formatName}`);

        const filteredRows = (dataRows || []).filter((row) => {
          const r = mapKeysCaseInsensitive(row);
          const sym = String(r.symbol || r.tradingsymbol || r.instrument || '').trim();
          return sym.length > 0;
        });

        let trades;
        if (format === 'tradeBook') {
          trades = buildTradesFromTradeBook(filteredRows.length ? filteredRows : dataRows);
        } else if (format === 'taxPnlTradewise') {
          trades = buildTradesFromTaxPnlTradewise(filteredRows.length ? filteredRows : dataRows);
        } else {
          trades = buildTradesFromPnl(filteredRows.length ? filteredRows : dataRows);
        }

        if (trades.length <= 1) throw new Error('At least two trades are required for analysis.');
        onProgress?.(`✓ ${trades.length} trades found`);

        const { completedTrades, openPositions } = computeCompletedAndOpen(trades);
        if (!completedTrades.length) {
          throw new Error('No completed trades found. Bias analysis requires at least one completed BUY-SELL pair.');
        }

        onProgress?.(`✓ ${completedTrades.length} completed trades matched (BUY → SELL)`);
        onProgress?.(`✓ ${openPositions.length} open positions identified`);
        onProgress?.('✓ Running bias analysis...');
        onProgress?.('→ Generating your report');

        resolve({
          format,
          allTrades: trades,
          completedTrades,
          openPositions,
          sourceLabel: file.name.replace(/\.(csv|xls|xlsx)$/i, '').toUpperCase(),
        });
      } catch (error) {
        reject(error);
      }
    };

    if (isCsv) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
        delimitersToGuess: [',', '\t', '|', ';'],
        complete: (results) => {
          const matrix = results.data || [];
          const found = findHeaderMatrix(matrix);
          if (found) {
            handleParsedRows(found.fields, found.rows, found.format);
            return;
          }
          reject(new Error(
            'Could not find a Zerodha-style header row in this CSV. '
            + 'Use Kite → Orders → Tradebook → Download (CSV or Excel), or ensure the first block of rows includes columns: '
            + 'Symbol, Trade Type, Quantity, Price, and Order Execution Time (or Trade Date).'
          ));
        },
        error: (error) => reject(new Error(error?.message || 'Failed to parse CSV.')),
      });
      return;
    }

    extractRowsFromWorkbook(file)
      .then(({ fields, rows, format }) => handleParsedRows(fields, rows, format))
      .catch(reject);
  });
}
