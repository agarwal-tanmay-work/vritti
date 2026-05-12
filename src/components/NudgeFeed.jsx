import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function NudgeFeed({ nudges }) {
  return (
    <div>
      {nudges.map((nudge, i) => (
        <motion.div
          key={i}
          className="nudge-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
        >
          <div className="nudge-icon">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="nudge-title">{nudge.title}</div>
            <div className="nudge-evidence">{nudge.evidence}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
