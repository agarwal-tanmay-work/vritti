import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Plugin to serve landing.html instead of index.html at root during local dev
function devRootRewrite() {
  return {
    name: 'dev-root-rewrite',
    configureServer(server) {
      // API Proxy for local development
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/market') {
          try {
            const SYMBOLS = { NIFTY: '%5ENSEI', SENSEX: '%5EBSESN' };
            const LIVE_QUERY = 'interval=1m&range=1d&includePrePost=false';
            const CLOSE_QUERY = 'interval=1d&range=5d&includePrePost=false';

            const fetchIndex = async (symbolKey) => {
              const symbol = SYMBOLS[symbolKey];
              const fetchChart = async (query) => {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?${query}`;
                const response = await fetch(url, { headers: { 'User-Agent': 'VrittiDevBot/1.0' } });
                if (!response.ok) throw new Error(`Yahoo failed: ${response.status}`);
                const json = await response.json();
                const result = json?.chart?.result?.[0];
                const meta = result?.meta ?? {};
                const closes = result?.indicators?.quote?.[0]?.close ?? [];
                const latest = closes.filter(v => typeof v === 'number').pop();
                const prev = meta.chartPreviousClose || meta.previousClose || latest;
                return {
                  value: Number(latest.toFixed(2)),
                  previousClose: Number(prev.toFixed(2)),
                  change: Number((((latest - prev) / prev) * 100).toFixed(2)),
                  marketState: meta.marketState || 'REGULAR',
                  asOf: new Date().toISOString()
                };
              };
              try { return await fetchChart(LIVE_QUERY); } 
              catch { return await fetchChart(CLOSE_QUERY); }
            };

            const [nifty, sensex] = await Promise.all([fetchIndex('NIFTY'), fetchIndex('SENSEX')]);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ source: 'Yahoo Finance (Local Proxy)', fetchedAt: new Date().toISOString(), nifty, sensex }));
          } catch (err) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Local market fetch failed', detail: err.message }));
          }
          return;
        }

        if (req.url === '/') {
          req.url = '/landing.html'
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    devRootRewrite()
  ],
  build: {
    checks: {
      pluginTimings: false,
    },
  },
})
