const LAST_ANALYSIS_KEY = 'vritti:last-analysis';
const SCORE_HISTORY_KEY = 'vritti:score-history';

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function saveAnalysis(analysis) {
  const store = getSessionStorage();
  const payload = { ...analysis, savedAt: new Date().toISOString() };
  if (!store) return;
  store.setItem(LAST_ANALYSIS_KEY, JSON.stringify(payload));
  const existing = getScoreHistory();
  const next = [...existing, { score: analysis.behaviourScore, date: payload.savedAt }].slice(-20);
  store.setItem(SCORE_HISTORY_KEY, JSON.stringify(next));
}

export function loadAnalysis() {
  const store = getSessionStorage();
  if (!store) return null;
  const raw = store.getItem(LAST_ANALYSIS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getScoreHistory() {
  const store = getSessionStorage();
  if (!store) return [];
  try {
    return JSON.parse(store.getItem(SCORE_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}
