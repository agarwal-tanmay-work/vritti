import { motion } from 'framer-motion';

export default function HoldingTable({ avgWinnerHold, avgLoserHold, holdRatio }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="holding-compare">
        <div className="holding-box">
          <div className="label">Avg days you held winners</div>
          <div className="value font-mono" style={{ color: 'var(--gain-green)' }}>{avgWinnerHold}</div>
          <div className="unit">days</div>
        </div>
        <div className="holding-box">
          <div className="label">Avg days you held losers</div>
          <div className="value font-mono" style={{ color: 'var(--loss-red)' }}>{avgLoserHold}</div>
          <div className="unit">days</div>
        </div>
      </div>
      <p className="holding-insight">
        You cut your winners <strong style={{ color: 'var(--gold)' }}>{holdRatio}x</strong> faster than your losers.
        {holdRatio >= 2 && ' This is loss aversion in action.'}
      </p>
    </motion.div>
  );
}
