import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, RadarChart, PolarGrid, PolarAngleAxis,
  Radar, Legend, Line, BarChart, Bar, XAxis, YAxis, ScatterChart, Scatter, CartesianGrid,
} from 'recharts';
import BehaviourScore from '../components/BehaviourScore';
import BehaviourPhilosophy from '../components/BehaviourPhilosophy';
import BiasCard from '../components/BiasCard';
import NudgeFeed from '../components/NudgeFeed';
import TradeTimeline from '../components/TradeTimeline';
import HoldingTable from '../components/HoldingTable';

const biasOrder = [
  'panicSelling', 'fomoBuying', 'lossAversion', 'overtrading', 'herdBehaviour',
  'revengeTrading', 'recencyBias', 'overconfidenceAfterWins', 'sectorConcentration',
  'sunkCostFallacy', 'calendarEffectBias', 'informationOverload', 'dispositionEffect',
];

const chartTheme = {
  grid: '#e8edf3',
  axis: '#6b7280',
  tooltipBg: '#ffffff',
  tooltipBorder: '#d7e0ea',
  blue: '#387ed1',
  green: '#4caf50',
  orange: '#ffb347',
  orangeStrong: '#f59e0b',
  red: '#df514c',
  gold: '#d4a017',
};

export default function Dashboard({ analysis }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    document.title = 'Vritti - Know Your Trading Mind';
  }, []);
  const [radarProfile, setRadarProfile] = useState({ mine: true, ideal: true, top10: false });
  const [displayBehaviourScore, setDisplayBehaviourScore] = useState(0);
  const [displayCounterfactual, setDisplayCounterfactual] = useState(0);
  const [displayTradeCount, setDisplayTradeCount] = useState(0);
  const matrixData = analysis?.matrixPoints || [];

  useEffect(() => {
    const els = document.querySelectorAll('.dashboard .reveal');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [analysis]);

  useEffect(() => {
    if (!analysis) return undefined;
    const targetScore = analysis.behaviourScore || 0;
    const targetImprovement = analysis.counterfactual?.improvement || 0;
    const totalTrades = analysis.totalTrades || 0;
    const stepScore = Math.max(1, Math.floor(targetScore / 35));
    const stepImprovement = Math.max(1, Math.floor(targetImprovement / 40));
    const stepTrades = Math.max(1, Math.floor(totalTrades / 35));
    let currentScore = 0;
    let currentImprovement = 0;
    let currentTrades = 0;

    const interval = window.setInterval(() => {
      let updated = false;
      if (currentScore < targetScore) {
        currentScore = Math.min(targetScore, currentScore + stepScore);
        updated = true;
      }
      if (currentImprovement < targetImprovement) {
        currentImprovement = Math.min(targetImprovement, currentImprovement + stepImprovement);
        updated = true;
      }
      if (currentTrades < totalTrades) {
        currentTrades = Math.min(totalTrades, currentTrades + stepTrades);
        updated = true;
      }
      setDisplayBehaviourScore(currentScore);
      setDisplayCounterfactual(currentImprovement);
      setDisplayTradeCount(currentTrades);
      if (!updated) {
        window.clearInterval(interval);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [analysis]);

  if (!analysis) {
    const score = params.get('score');
    const worst = params.get('worst');
    if (score) {
      return (
        <div className="page-container empty-state">
          <h2>Shared Vritti Snapshot</h2>
          <p>Behaviour score: {score} | Top bias: {worst || 'N/A'}</p>
          <button className="btn-primary" onClick={() => navigate('/analyse')}>Run your own analysis →</button>
        </div>
      );
    }
    return (
      <div className="page-container empty-state">
        <h2>No analysis data yet</h2>
        <p>
          Upload your trade history or try sample data to see your bias report.
        </p>
        <button className="btn-primary" onClick={() => navigate('/analyse')}>
          Go to Analyse →
        </button>
      </div>
    );
  }

  const isDemoData = String(analysis.sourceLabel || '').toUpperCase().includes('SAMPLE');

  return (
    <div className="page-container premium-page dashboard">
      {/* Dashboard Header */}
      <motion.div
        className="dash-header premium-header"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2>BEHAVIOUR REPORT FOR {analysis.sourceLabel || 'YOUR TRADES'}</h2>
        <div className="dash-meta">
          <span>Analysis Period: {analysis.analysisPeriod}</span>
          <span>|</span>
          <span>{displayTradeCount} Trades</span>
        </div>
      </motion.div>

      <div className="card-no-hover premium-panel report-source-card">
        <p>
          <strong>Data source:</strong> {isDemoData ? 'Demo dataset (synthetic example)' : 'Your uploaded Zerodha export'}.
          {isDemoData ? ' Upload your own file on Analyse page for your real report.' : ' This report is computed from your uploaded trades.'}
        </p>
      </div>

      <div className="dashboard-philosophy-block">
        <BehaviourPhilosophy />
      </div>

      {/* Section 1: Behaviour Score */}
      <div className="section reveal">
        <div className="section-eyebrow">SUMMARY</div>
        <h2 className="section-heading dashboard-section-title">Behaviour Overview</h2>
        <div className="dash-kpi-grid">
          <motion.div className="kpi-tile" whileHover={{ y: -3 }}>
            <p className="kpi-label">Behaviour Score</p>
            <p className="kpi-value">{displayBehaviourScore}</p>
          </motion.div>
          <motion.div className="kpi-tile" whileHover={{ y: -3 }}>
            <p className="kpi-label">Worst Bias</p>
            <p className="kpi-value kpi-small">{analysis.worstBias}</p>
          </motion.div>
          <motion.div className="kpi-tile" whileHover={{ y: -3 }}>
            <p className="kpi-label">Counterfactual Upside</p>
            <p className="kpi-value">₹{displayCounterfactual.toLocaleString('en-IN')}</p>
          </motion.div>
        </div>
        <BehaviourScore
          score={analysis.behaviourScore}
          totalTrades={analysis.totalTrades}
          analysisPeriod={analysis.analysisPeriod}
          biasCount={Object.keys(analysis.biases || {}).length}
        />
        <div className="card-no-hover premium-panel counterfactual-panel">
          <h3>Counterfactual Engine</h3>
          <p>{analysis.counterfactual?.narrative}</p>
          <p className="counterfactual-copy">
            If you had traded without these biases, your portfolio would be approximately{' '}
            <strong className="counterfactual-highlight">
              ₹{analysis.counterfactual?.improvement?.toLocaleString('en-IN') || 0} better off
            </strong>{' '}
            in this rules based replay. This is not a forecast of future performance.
          </p>
          <div className="counterfactual-actions">
            <button className="btn-secondary" onClick={() => window.open('/report', '_blank')}>Export Report</button>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <div className="section-eyebrow">BIASES</div>
          <h2>Bias Breakdown</h2>
          <p>{Object.keys(analysis.biases || {}).length} behavioural biases detected and scored.</p>
        </div>
        <div className="bias-grid">
          {biasOrder.map((key, i) => (
            <BiasCard key={key} name={key} bias={analysis.biases[key]} index={i} />
          ))}
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <div className="section-eyebrow">NUDGES</div>
          <h2>Your Nudge Feed</h2>
          <p>Plain-English warnings based on your actual patterns.</p>
        </div>
        <NudgeFeed nudges={analysis.nudges} />
      </div>

      <div className="section reveal">
        <div className="section-header">
          <h2>Trade Timeline</h2>
          <p>Monthly breakdown of winning vs losing trades.</p>
        </div>
        <div className="card-no-hover premium-panel">
          <TradeTimeline data={analysis.timelineData} />
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <h2>Holding Time Asymmetry</h2>
          <p>Winners vs losers holding pattern.</p>
        </div>
        <HoldingTable
          avgWinnerHold={analysis.avgWinnerHold}
          avgLoserHold={analysis.avgLoserHold}
          holdRatio={analysis.holdRatio}
        />
        <div className="card-no-hover premium-panel chart-surface chart-spaced">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(analysis.matrixPoints || []).slice(0, 40)}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="symbol" hide stroke={chartTheme.axis} />
              <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }} />
              <Bar dataKey="holdingDays" fill={chartTheme.blue} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <h2>Trade Quality Matrix</h2>
          <p>Short vs long hold, profit vs loss.</p>
        </div>
        <div className="card-no-hover premium-panel">
          <div className="matrix-grid">
            <div>Quick Wins ({analysis.quadrantCounts?.quickWins || 0})</div>
            <div>Patient Wins ({analysis.quadrantCounts?.patientWins || 0})</div>
            <div>Panic Sells ({analysis.quadrantCounts?.panicSells || 0})</div>
            <div>Bagholding ({analysis.quadrantCounts?.bagholding || 0})</div>
          </div>
          <div className="chart-surface chart-top-gap">
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid stroke={chartTheme.grid} />
              <XAxis type="number" dataKey="x" name="Holding Days" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="PnL" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }} formatter={(value, name) => [value, name]} />
              <Scatter data={matrixData} fill={chartTheme.orangeStrong} opacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <h2>Best vs Worst 3 Trades</h2>
        </div>
        <div className="split-columns">
          <div className="card-no-hover premium-panel">
            <h3>Top 3</h3>
            {(analysis.bestTrades || []).map((t) => <p key={`${t.symbol}-${t.date}`}>{t.symbol} · +₹{Math.round(t.pnl)} · {t.holdingDays} days</p>)}
          </div>
          <div className="card-no-hover premium-panel">
            <h3>Bottom 3</h3>
            {(analysis.worstTrades || []).map((t) => <p key={`${t.symbol}-${t.date}`}>{t.symbol} · ₹{Math.round(t.pnl)} · {t.holdingDays} days</p>)}
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header"><h2>Monthly P&L Waterfall</h2></div>
        <div className="card-no-hover premium-panel chart-surface">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analysis.monthlyWaterfall || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }} />
              <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
                {(analysis.monthlyWaterfall || []).map((entry) => (
                  <Cell key={entry.month} fill={entry.pnl >= 0 ? chartTheme.green : chartTheme.red} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="cumulative" stroke={chartTheme.blue} strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header"><h2>Bias Radar Chart</h2></div>
        <div className="card-no-hover premium-panel chart-surface">
          <div className="chart-toggle-row">
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, mine: !p.mine }))}>My Profile</button>
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, ideal: !p.ideal }))}>Ideal</button>
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, top10: !p.top10 }))}>Top 10%</button>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={analysis.radarData || []}>
              <PolarGrid stroke={chartTheme.grid} />
              <PolarAngleAxis dataKey="bias" tick={{ fill: chartTheme.axis, fontSize: 11 }} />
              {radarProfile.mine ? <Radar name="My Profile" dataKey="mine" stroke={chartTheme.blue} fill={chartTheme.blue} fillOpacity={0.18} /> : null}
              {radarProfile.ideal ? <Radar name="Ideal Trader" dataKey="ideal" stroke={chartTheme.green} fillOpacity={0} /> : null}
              {radarProfile.top10 ? <Radar name="Top 10%" dataKey="top10" stroke={chartTheme.gold} fillOpacity={0} /> : null}
              <Legend wrapperStyle={{ color: chartTheme.axis, fontSize: 12 }} />
              <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="split-columns">
          <div className="card-no-hover premium-panel">
            <h3>Worst Trading Day</h3>
            {analysis.worstDay ? <p>{analysis.worstDay.date}: ₹{Math.round(analysis.worstDay.pnl)} across {analysis.worstDay.trades} trades.</p> : <p>No data.</p>}
          </div>
          <div className="card-no-hover premium-panel">
            <h3>Best Trading Day</h3>
            {analysis.bestDay ? <p>{analysis.bestDay.date}: +₹{Math.round(analysis.bestDay.pnl)} across {analysis.bestDay.trades} trades.</p> : <p>No data.</p>}
          </div>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <div className="section-eyebrow">ALLOCATION</div>
          <h2>Sector Concentration</h2>
          <p>
            Your top three sectors represent{' '}
            <strong>{analysis.topThreeSectorPct ?? 0}%</strong> of traded value (illustrative breakdown from your file).
          </p>
        </div>
        <div className="card-no-hover premium-panel chart-surface">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={analysis.sectorBreakdown || []} dataKey="value" nameKey="sector" outerRadius={100} label={(x) => `${x.sector} ${x.pct}%`} labelLine={{ stroke: chartTheme.axis }}>
                {(analysis.sectorBreakdown || []).map((entry, i) => (
                  <Cell key={entry.sector} fill={[chartTheme.blue, chartTheme.orangeStrong, chartTheme.green, '#7c3aed', '#14b8a6', '#ef4444'][i % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header">
          <h2>Information Overload</h2>
          <p>
            Unique symbols traded per month. Months with more than 8 different symbols are flagged — spreading attention across too many stocks at once is a recognised behavioural bias that reduces decision quality.
          </p>
        </div>
        <div className="card-no-hover premium-panel chart-surface">
          {(analysis.monthScatterData || []).length === 0 ? (
            <p style={{ color: '#6b7280', padding: '1.5rem 0', textAlign: 'center' }}>
              Not enough buy data to chart symbol spread by month. Upload a trade book with at least a few months of buys to see this chart.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analysis.monthScatterData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="month" stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} />
                <YAxis stroke={chartTheme.axis} tick={{ fill: chartTheme.axis, fontSize: 11 }} label={{ value: 'Unique Symbols', angle: -90, position: 'insideLeft', fill: chartTheme.axis, fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: chartTheme.tooltipBg, border: `1px solid ${chartTheme.tooltipBorder}`, borderRadius: 8, color: '#1f2937' }}
                  formatter={(value) => [`${value} symbols`, 'Unique Symbols']}
                />
                <Bar dataKey="uniqueSymbols" radius={[3, 3, 0, 0]}>
                  {(analysis.monthScatterData || []).map((x) => (
                    <Cell key={x.month} fill={x.uniqueSymbols > 8 ? chartTheme.orangeStrong : chartTheme.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.75rem' }}>
            🟠 Orange bars = months with &gt;8 unique symbols traded (flagged as overload risk)
          </p>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header"><h2>Bias Interaction</h2></div>
        <div className="card-no-hover premium-panel">
          {(analysis.biasInteractions || []).map((b) => (
            <p key={`${b.from}-${b.to}`}><strong>{b.from}</strong> ↔ <strong>{b.to}</strong>: {b.text}</p>
          ))}
        </div>
      </div>

      <motion.div
        className="section"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="varsity-cta">
          <p>
            The best next step isn't a better stock. It is a better understanding of yourself.
          </p>
          <a
            href="https://zerodha.com/varsity/module/trading-psychology/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Study Trading Psychology on Varsity
            <ExternalLink size={14} />
          </a>
        </div>
      </motion.div>
    </div>
  );
}
