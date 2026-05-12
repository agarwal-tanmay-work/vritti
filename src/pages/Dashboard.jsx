import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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

export default function Dashboard({ analysis }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    document.title = 'Dashboard';
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
        <div className="page-container" style={{ textAlign: 'center', paddingTop: 120 }}>
          <h2 style={{ fontSize: 20, marginBottom: 12 }}>Shared Vritti Snapshot</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Behaviour score: {score} | Top bias: {worst || 'N/A'}</p>
          <button className="btn-primary" onClick={() => navigate('/analyse')}>Run your own analysis →</button>
        </div>
      );
    }
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 120 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>No analysis data yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Upload your trade history or try sample data to see your bias report.
        </p>
        <button className="btn-primary" onClick={() => navigate('/analyse')}>
          Go to Analyse →
        </button>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/dashboard?score=${analysis.behaviourScore}&worst=${analysis.worstBias}`;
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

      <div className="card-no-hover premium-panel" style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          <strong>Data source:</strong> {isDemoData ? 'Demo dataset (synthetic example)' : 'Your uploaded Zerodha export'}.
          {isDemoData ? ' Upload your own file on Analyse page for your real report.' : ' This report is computed from your uploaded trades.'}
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <BehaviourPhilosophy />
      </div>

      {/* Section 1: Behaviour Score */}
      <div className="section reveal">
        <div className="section-eyebrow">SUMMARY</div>
        <h2 className="section-heading" style={{ fontSize: 'clamp(22px, 3vw, 34px)', marginBottom: 20 }}>Behaviour Overview</h2>
        <div className="dash-kpi-grid">
          <motion.div className="kpi-tile" whileHover={{ y: -4, rotateX: 3 }}>
            <p className="kpi-label">Behaviour Score</p>
            <p className="kpi-value">{displayBehaviourScore}</p>
          </motion.div>
          <motion.div className="kpi-tile" whileHover={{ y: -4, rotateX: 3 }}>
            <p className="kpi-label">Worst Bias</p>
            <p className="kpi-value kpi-small">{analysis.worstBias}</p>
          </motion.div>
          <motion.div className="kpi-tile" whileHover={{ y: -4, rotateX: 3 }}>
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
        <div className="card-no-hover premium-panel" style={{ marginTop: 18 }}>
          <h3>Counterfactual Engine</h3>
          <p style={{ color: 'var(--text-secondary)' }}>{analysis.counterfactual?.narrative}</p>
          <p style={{ marginTop: 8 }}>
            If you had traded without these biases, your portfolio would be approximately{' '}
            <strong style={{ color: 'var(--gain-green)' }}>
              ₹{analysis.counterfactual?.improvement?.toLocaleString('en-IN') || 0} better off
            </strong>{' '}
            in this rules based replay. This is not a forecast of future performance.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
        <div className="card-no-hover premium-panel chart-surface" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={(analysis.matrixPoints || []).slice(0, 40)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="symbol" hide stroke="#555" />
              <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="holdingDays" fill="#E85D26" radius={[2,2,0,0]} />
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
          <div className="chart-surface" style={{ marginTop: 12 }}>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid stroke="#2a2a2a" />
              <XAxis type="number" dataKey="x" name="Holding Days" stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <YAxis type="number" dataKey="y" name="PnL" stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} formatter={(value, name) => [value, name]} />
              <Scatter data={matrixData} fill="#E85D26" opacity={0.8} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="pnl" radius={[2,2,0,0]}>
                {(analysis.monthlyWaterfall || []).map((entry) => (
                  <Cell key={entry.month} fill={entry.pnl >= 0 ? '#25C26E' : '#E74C3C'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="cumulative" stroke="#E85D26" strokeWidth={2} dot={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header"><h2>Bias Radar Chart</h2></div>
        <div className="card-no-hover premium-panel chart-surface">
          <div style={{ marginBottom: 12, display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, mine: !p.mine }))}>My Profile</button>
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, ideal: !p.ideal }))}>Ideal</button>
            <button className="btn-secondary" onClick={() => setRadarProfile((p) => ({ ...p, top10: !p.top10 }))}>Top 10%</button>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <RadarChart data={analysis.radarData || []}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis dataKey="bias" tick={{ fill: '#555', fontSize: 11 }} />
              {radarProfile.mine ? <Radar name="My Profile" dataKey="mine" stroke="#E85D26" fill="#E85D26" fillOpacity={0.25} /> : null}
              {radarProfile.ideal ? <Radar name="Ideal Trader" dataKey="ideal" stroke="#25C26E" fillOpacity={0} /> : null}
              {radarProfile.top10 ? <Radar name="Top 10%" dataKey="top10" stroke="#F0B429" fillOpacity={0} /> : null}
              <Legend wrapperStyle={{ color: '#A0A0A0', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
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
              <Pie data={analysis.sectorBreakdown || []} dataKey="value" nameKey="sector" outerRadius={100} label={(x) => `${x.sector} ${x.pct}%`} labelLine={{ stroke: '#555' }}>
                {(analysis.sectorBreakdown || []).map((entry, i) => (
                  <Cell key={entry.sector} fill={['#E85D26','#25C26E','#F0B429','#387ED1','#9B59B6','#1ABC9C'][i % 6]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section reveal">
        <div className="section-header"><h2>Information Overload</h2></div>
        <div className="card-no-hover premium-panel chart-surface">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analysis.monthScatterData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <YAxis stroke="#555" tick={{ fill: '#555', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="uniqueSymbols" radius={[2,2,0,0]}>
                {(analysis.monthScatterData || []).map((x) => (
                  <Cell key={x.month} fill={x.uniqueSymbols > 8 ? '#F0B429' : '#E85D26'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            href="https://zerodha.com/varsity/chapter/trading-biases/"
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
