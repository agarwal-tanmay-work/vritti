import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LINES = [
  'Initialising analysis...',
  'Parsing Zerodha format...',
  'Running FIFO trade matching...',
  'Detecting 13 behavioural biases...',
  'Computing counterfactual engine...',
  'Building visual dashboard metrics...',
  'Building your report...',
];

export default function LoadingTerminal({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines(prev => {
        if (prev >= LINES.length) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="terminal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="terminal-content">
        <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 11, letterSpacing: 2 }}>
          VRITTI ANALYSIS ENGINE v1.0
        </div>
        {LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} className={`terminal-line ${i === visibleLines - 1 ? 'active' : ''}`}>
            <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{'>'}</span>
            {line}
            {i === visibleLines - 1 && <span className="terminal-cursor" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
