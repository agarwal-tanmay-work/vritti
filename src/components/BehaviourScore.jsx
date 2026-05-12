import { useEffect, useState, useId } from 'react';
import { motion } from 'framer-motion';
import { getScoreHistory } from '../utils/storage';

function getScoreColor(score) {
  if (score < 50) return 'var(--orange)';
  if (score <= 70) return 'var(--gold)';
  return 'var(--gain-green)';
}

export default function BehaviourScore({ score, totalTrades, analysisPeriod, biasCount = 13 }) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getScoreColor(score);
  const history = getScoreHistory();
  const lastScore = history.length > 1 ? history[history.length - 2].score : null;
  const gid = useId().replace(/:/g, '');
  const gradId = `scoreArc-${gid}`;

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(score / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [score]);

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = (displayScore / 100) * circumference;
  const dashOffset = circumference - progress;

  const periodMonths = analysisPeriod;

  return (
    <motion.div
      className="card-no-hover score-hero-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="score-hero">
        <div className="score-ring">
          <svg width="200" height="200" viewBox="0 0 200 200" role="meter" aria-valuenow={displayScore} aria-valuemin={0} aria-valuemax={100} aria-label="Behaviour score meter">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E85D26" />
                <stop offset="100%" stopColor="#F0B429" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="6"
            />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <div className="score-number" style={{ color }}>
            <span className="font-mono">{displayScore}</span>
          </div>
        </div>

        <div className="score-label">BEHAVIOUR SCORE</div>
        <div className="score-subtitle">Higher is better. 100 = perfectly rational trader.</div>
        <div className="score-cibil">Like a CIBIL score — but for your trading psychology.</div>

        <div className="score-pills">
          <span className="score-pill font-mono">{totalTrades} Trades Analysed</span>
          <span className="score-pill font-mono">{biasCount} Biases Detected</span>
          <span className="score-pill font-mono">{periodMonths}</span>
        </div>
        {lastScore !== null ? (
          <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            Your score last time: {lastScore}. Now: {score}. {score >= lastScore ? '↑ improving' : '↓ slipped'}
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
