const SYMBOLS = {
  NIFTY: '%5ENSEI',
  SENSEX: '%5EBSESN',
};

const LIVE_QUERY = 'interval=1m&range=1d&includePrePost=false';
const CLOSE_QUERY = 'interval=1d&range=5d&includePrePost=false';

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

function parseChart(json) {
  const result = json?.chart?.result?.[0];
  if (!result) {
    throw new Error('Chart payload is missing result data');
  }

  const meta = result.meta ?? {};
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const timestamps = result.timestamp ?? [];
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
    throw new Error('Chart payload did not contain a usable close');
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

async function fetchChart(symbol, query) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?${query}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'VrittiMarketBot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Yahoo chart request failed (${response.status})`);
  }

  const json = await response.json();
  return parseChart(json);
}

async function fetchIndex(symbolKey) {
  const symbol = SYMBOLS[symbolKey];
  try {
    return await fetchChart(symbol, LIVE_QUERY);
  } catch {
    return fetchChart(symbol, CLOSE_QUERY);
  }
}

export default async function handler(_req, res) {
  try {
    const [nifty, sensex] = await Promise.all([fetchIndex('NIFTY'), fetchIndex('SENSEX')]);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json({
      source: 'Yahoo Finance',
      fetchedAt: new Date().toISOString(),
      nifty,
      sensex,
    });
  } catch (error) {
    res.status(502).json({
      error: 'Unable to fetch live market data',
      detail: error instanceof Error ? error.message : 'Unknown market fetch error',
    });
  }
}
