const API_ENDPOINT = '/api/market';
const MARKET_CACHE_KEY = 'vritti-market-cache-v2';
const SYMBOLS = {
  NIFTY: '%5ENSEI',
  SENSEX: '%5EBSESN',
};
const LIVE_QUERY = 'interval=1m&range=1d&includePrePost=false';
const CLOSE_QUERY = 'interval=1d&range=5d&includePrePost=false';

function isBrowser() {
  return typeof window !== 'undefined';
}

function getLastValidPoint(values = []) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return { value, index };
    }
  }
  return null;
}

function getPreviousValidValue(values = [], startIndex) {
  for (let index = startIndex - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function deriveMarketState(meta) {
  if (meta.marketState) return meta.marketState;

  const regularPeriod = meta.currentTradingPeriod?.regular;
  const marketTime = meta.regularMarketTime;

  if (!regularPeriod || typeof marketTime !== 'number') {
    return 'UNKNOWN';
  }

  if (marketTime < regularPeriod.start) return 'PRE';
  if (marketTime > regularPeriod.end) return 'CLOSED';
  return 'REGULAR';
}

function parseYahooChartResult(json) {
  const result = json?.chart?.result?.[0];
  const meta = result?.meta ?? {};
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result?.timestamp ?? [];
  const latestPoint = getLastValidPoint(closes);
  const previousClose =
    meta.chartPreviousClose ??
    meta.previousClose ??
    (latestPoint ? getPreviousValidValue(closes, latestPoint.index) : null);
  const current =
    typeof meta.regularMarketPrice === 'number' && Number.isFinite(meta.regularMarketPrice)
      ? meta.regularMarketPrice
      : latestPoint?.value ?? null;

  if (typeof current !== 'number' || typeof previousClose !== 'number' || previousClose === 0) {
    return null;
  }

  const changePct = ((current - previousClose) / previousClose) * 100;
  const asOfTimestamp =
    meta.regularMarketTime ??
    (latestPoint && typeof timestamps[latestPoint.index] === 'number' ? timestamps[latestPoint.index] : null);

  return {
    value: Number(current.toFixed(2)),
    previousClose: Number(previousClose.toFixed(2)),
    change: Number(changePct.toFixed(2)),
    marketState: deriveMarketState(meta),
    asOf: asOfTimestamp ? new Date(asOfTimestamp * 1000).toISOString() : null,
  };
}

function isValidSnapshot(snapshot) {
  return Boolean(
    snapshot
      && snapshot.nifty
      && snapshot.sensex
      && typeof snapshot.nifty.value === 'number'
      && typeof snapshot.sensex.value === 'number'
  );
}

function readCache() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(MARKET_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(snapshot) {
  if (!isBrowser() || !isValidSnapshot(snapshot)) return;
  try {
    window.localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures.
  }
}

async function fetchFromServer() {
  const response = await fetch(API_ENDPOINT, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Market API failed (${response.status})`);
  }

  const json = await response.json();
  if (!isValidSnapshot(json)) {
    throw new Error('Market API returned an invalid payload');
  }

  return {
    ...json,
    fetchedAt: json.fetchedAt ?? new Date().toISOString(),
  };
}

async function fetchDirectChart(symbol, query) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?${query}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Yahoo chart request failed (${response.status})`);
  }

  const json = await response.json();
  return json;
}

async function fetchDirectIndex(symbolKey) {
  const symbol = SYMBOLS[symbolKey];
  try {
    const liveJson = await fetchDirectChart(symbol, LIVE_QUERY);
    const parsedLive = parseYahooChartResult(liveJson);
    if (parsedLive) {
      return parsedLive;
    }
  } catch {
    // Fall through to daily-close query.
  }

  const closeJson = await fetchDirectChart(symbol, CLOSE_QUERY);
  const parsedClose = parseYahooChartResult(closeJson);
  if (!parsedClose) {
    throw new Error(`Unable to parse ${symbolKey} market response`);
  }

  return parsedClose;
}

async function fetchDirectIndices() {
  const [nifty, sensex] = await Promise.all([fetchDirectIndex('NIFTY'), fetchDirectIndex('SENSEX')]);
  return {
    nifty,
    sensex,
    source: 'Yahoo Finance',
    fetchedAt: new Date().toISOString(),
  };
}

export function loadCachedIndices() {
  return readCache();
}

export async function fetchLiveIndices() {
  let snapshot;

  try {
    snapshot = await fetchFromServer();
  } catch (error) {
    if (!import.meta.env.DEV) {
      throw error;
    }
    snapshot = await fetchDirectIndices();
  }

  writeCache(snapshot);
  return snapshot;
}
