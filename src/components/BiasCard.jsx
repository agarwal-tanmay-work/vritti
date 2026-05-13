import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const MAX_AFFECTED_ROWS = 200;

/** Bias `instances` can be raw trades or nested objects from the analyser. */
function pickTradeShape(instance) {
  if (!instance || typeof instance !== 'object') return null;
  if (instance.revengeBuy) return instance.revengeBuy;
  if (instance.lossTrade) return instance.lossTrade;
  if (instance.after) return instance.after;
  if (instance.symbol && instance.date) return instance;
  return null;
}

function formatCellDate(dateStr) {
  if (!dateStr) return '—';
  const s = String(dateStr);
  return s.length >= 19 ? s.slice(0, 19).replace('T', ' ') : s;
}

export default function BiasCard({ name, bias, index }) {
  const [expanded, setExpanded] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = bias.score || 0;
    const step = Math.max(1, Math.floor(target / 20));
    const interval = window.setInterval(() => {
      current = Math.min(target, current + step);
      setDisplayScore(current);
      if (current >= target) {
        window.clearInterval(interval);
      }
    }, 25);
    return () => window.clearInterval(interval);
  }, [bias.score]);

  const displayName = {
    panicSelling: 'PANIC SELLING',
    fomoBuying: 'FOMO BUYING',
    lossAversion: 'LOSS AVERSION',
    overtrading: 'OVERTRADING',
    herdBehaviour: 'HERD BEHAVIOUR',
    revengeTrading: 'REVENGE TRADING',
    recencyBias: 'RECENCY BIAS',
    overconfidenceAfterWins: 'OVERCONFIDENCE AFTER WINS',
    sectorConcentration: 'SECTOR CONCENTRATION',
    sunkCostFallacy: 'SUNK COST FALLACY',
    calendarEffectBias: 'CALENDAR EFFECT BIAS',
    informationOverload: 'INFORMATION OVERLOAD',
    dispositionEffect: 'DISPOSITION EFFECT',
  }[name] || name.toUpperCase();

  const tradeRows = useMemo(() => {
    const raw = bias.instances || [];
    return raw
      .map((inst) => pickTradeShape(inst) || inst)
      .filter((t) => t && (t.symbol || t.tradingsymbol))
      .slice(0, MAX_AFFECTED_ROWS);
  }, [bias.instances]);

  return (
    <motion.div
      className="bias-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <div className="bias-header">
        <span className="bias-name">
          {displayName}
          <span className="bias-tooltip" aria-label={`About ${displayName}`}>ℹ
            <span className="bias-tooltip-text">{bias.glossary || bias.description}</span>
          </span>
          {bias.researchBadge ? <span className="research-badge">Research-backed</span> : null}
        </span>
        <span className={`severity-pill ${bias.className}`}>{bias.label}</span>
      </div>

      <div className="bias-bar-container">
        <div className="bias-bar-track">
          <motion.div
            className="bias-bar-fill"
            style={{
              background: `linear-gradient(90deg, var(--accent) 0%, var(--orange-strong) 100%)`,
              opacity: 0.95,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${bias.score}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          />
        </div>
        <span className="bias-score-num font-mono" style={{ color: bias.color }}>
          {displayScore}
        </span>
      </div>

      <p className="bias-description">{bias.description}</p>

      <a
        href={bias.varsityLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bias-varsity-link"
      >
        Learn about this bias on Varsity <ExternalLink size={11} style={{ marginLeft: 4, verticalAlign: 'middle' }} />
      </a>

      {bias.instances && bias.instances.length > 0 && (
        <>
          <button className="bias-expand-btn" onClick={() => setExpanded(!expanded)} aria-label={`Toggle ${displayName} affected trades`}>
            {expanded ? <ChevronUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> : <ChevronDown size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
            {expanded ? 'Hide' : 'Show'} affected trades (
            {bias.instances.length}
            {bias.instances.length > MAX_AFFECTED_ROWS ? ` · first ${MAX_AFFECTED_ROWS} shown` : ''}
            )
          </button>

          {expanded && (
            <motion.div
              className="bias-trades-motion"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.2 }}
            >
              <div className="bias-trades-scroll-hint">Scroll horizontally to see all columns</div>
              <div className="bias-trades-wrap">
                <table className="bias-trades-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Symbol</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tradeRows.map((t, i) => {
                      const sym = String(t.symbol || t.tradingsymbol || '—');
                      const typ = String(t.type || '—').toUpperCase();
                      const qty = t.qty ?? t.quantity ?? '—';
                      const price = t.price;
                      const pnl = t.pnl;
                      return (
                        <tr key={`${sym}-${i}-${t.date}`}>
                          <td>{formatCellDate(t.date)}</td>
                          <td>{sym}</td>
                          <td className={typ === 'BUY' ? 'bias-type-buy' : 'bias-type-sell'}>{typ}</td>
                          <td>{qty}</td>
                          <td>{price != null && price !== '' ? `₹${Number(price).toLocaleString('en-IN')}` : '—'}</td>
                          <td className={pnl > 0 ? 'bias-pnl-pos' : pnl < 0 ? 'bias-pnl-neg' : 'bias-pnl-neutral'}>
                            {pnl !== null && pnl !== undefined && pnl !== '' ? `₹${Number(pnl).toLocaleString('en-IN')}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
