import { analyseTrader } from '../utils/analyseTrader';

self.onmessage = (event) => {
  const { trades, sourceLabel } = event.data || {};
  try {
    const result = analyseTrader(trades || []);
    self.postMessage({ ok: true, result: { ...result, sourceLabel } });
  } catch (error) {
    self.postMessage({ ok: false, error: error?.message || 'Worker analysis failed.' });
  }
};
