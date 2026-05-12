import { memo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      padding: '10px 14px',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12,
    }}>
      <div style={{ color: 'var(--text-primary)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

function TradeTimeline({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={300} aria-label="Monthly winning and losing trades timeline chart">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            wrapperStyle={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          />
          <Bar dataKey="wins" name="Winning Trades" fill="#00b386" radius={[2, 2, 0, 0]} barSize={28} />
          <Bar dataKey="losses" name="Losing Trades" fill="#E74C3C" radius={[2, 2, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export default memo(TradeTimeline);
