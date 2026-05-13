import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, User } from 'lucide-react';
import { SAMPLE_TRADES } from '../data/sampleTrades';
import { parseCSVFile } from '../utils/parseCSV';
import LoadingTerminal from '../components/LoadingTerminal';

export default function Analyse({ onAnalysisComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressSteps, setProgressSteps] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'Vritti - Know Your Trading Mind';
  }, [location]);
  const workerRef = useRef(null);
  const autoSampleStarted = useRef(false);

  const runAnalysis = useCallback((trades, label, openPositions = []) => {
    setLoading(true);
    setError(null);
    window.__vritti_pending = { trades, label, openPositions };
  }, []);

  const handleLoadingComplete = useCallback(() => {
    const { trades, label, openPositions } = window.__vritti_pending || {};
    if (trades) {
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL('../workers/analyser.worker.js', import.meta.url), { type: 'module' });
      }
      workerRef.current.onmessage = (event) => {
        if (!event.data?.ok) {
          setError(event.data?.error || 'Analysis failed. Please check your data format.');
          setLoading(false);
          return;
        }
        const result = {
          ...event.data.result,
          sourceLabel: label,
          openPositions,
          parsedAt: new Date().toISOString(),
        };
        onAnalysisComplete(result);
        navigate('/dashboard');
      };
      workerRef.current.postMessage({ trades, sourceLabel: label });
    }
  }, [onAnalysisComplete, navigate]);

  const handleSampleData = useCallback(() => {
    runAnalysis(SAMPLE_TRADES, 'RAHUL DEMO DATASET');
  }, [runAnalysis]);

  useEffect(() => {
    if (autoSampleStarted.current || !location.state?.runSample) return;
    autoSampleStarted.current = true;
    navigate('.', { replace: true, state: {} });
    handleSampleData();
  }, [location.state, navigate, handleSampleData]);

  const parseCSV = useCallback(async (file) => {
    setProgressSteps([]);
    try {
      const parsed = await parseCSVFile(file, (step) => setProgressSteps((prev) => [...prev, step]));
      runAnalysis(parsed.completedTrades, parsed.sourceLabel, parsed.openPositions);
    } catch (err) {
      setError(err.message || "We couldn't parse this file. Please upload a valid Zerodha CSV or Excel export.");
    }
  }, [runAnalysis]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseCSV(file);
    else setError('Please upload a CSV or Excel file.');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) parseCSV(file);
  };

  const progressList = useMemo(() => progressSteps.slice(-7), [progressSteps]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return <LoadingTerminal onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="inner-page reveal">
      {/* Page glow */}
      <div className="page-glow" />

      <motion.div
        className="inner-page-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero */}
        <div className="inner-hero">
          <div className="section-eyebrow">STEP 01 UPLOAD</div>
          <h1 className="inner-h1">Analyse Your Trades</h1>
          <p className="inner-sub">
            Upload your Zerodha Kite trade book CSV and get your complete Behaviour Report in under 60 seconds.
            Every analysis runs entirely in your browser.
          </p>
        </div>

        {/* 3 stat pills */}
        <div className="stat-pills-row">
          <div className="stat-pill">
            <div className="stat-pill-label">INPUT</div>
            <div className="stat-pill-value">Kite CSV/XLS</div>
          </div>
          <div className="stat-pill">
            <div className="stat-pill-label">PRIVACY</div>
            <div className="stat-pill-value">Browser-Only</div>
          </div>
          <div className="stat-pill">
            <div className="stat-pill-label">OUTPUT</div>
            <div className="stat-pill-value">Behaviour Report</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-card">
            <h3>Parse Error</h3>
            <p>{error}</p>
            <p className="subtle-note">
              Check the expected format below.
            </p>
          </div>
        )}

        {/* Progress */}
        {progressList.length > 0 && !loading && (
          <div className="analyse-progress-card">
            <h3>Upload Progress</h3>
            {progressList.map((step, idx) => (
              <p key={`${step}-${idx}`}>{step}</p>
            ))}
          </div>
        )}

        {/* Upload Grid */}
        <div className="analyse-grid reveal">
          {/* Upload Zone */}
          <div className="analyse-card upload-card reveal">
            <div
              id="upload-dropzone"
              className={`upload-zone-new ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon"><UploadCloud size={44} /></div>
              <h3>Drop your Zerodha trade CSV here</h3>
              <p>or click to browse (.csv, .xls, .xlsx)</p>
              <a
                className="upload-link-new"
                href="https://support.zerodha.com/category/console/reports/other-queries/articles/where-can-i-see-all-the-trades-i-ve-taken-for-a-particular-period"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                How to export from Kite →
              </a>
              <p className="upload-privacy">Your data never leaves your browser. Zero servers. Zero tracking. Large tradebooks up to 32 MB are supported. Analysis runs in a background worker so the page stays responsive.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Demo Card */}
          <div className="analyse-card demo-card reveal">
            <div className="demo-card-inner">
              <div className="demo-avatar">
                <User size={28} />
              </div>
              <h3>Try with Rahul's Trades</h3>
              <p>
                Meet Rahul — a 28-year-old IT professional from Pune who's been trading on Kite for 9 months
                and thinks he's pretty good at it. He isn't. Run his demo data to see what Vritti finds.
              </p>
              <button id="demo-data-btn" className="btn-primary full-width" onClick={handleSampleData}>
                Analyse Rahul's Trades →
              </button>
              <p className="demo-meta">120 trades · 9 months · Zerodha Kite</p>
            </div>
          </div>
        </div>

        {/* Format Table */}
        <div className="analyse-card format-table-card reveal">
          <div className="section-eyebrow">SUPPORTED ZERODHA EXPORT FIELDS</div>
          <p className="format-desc">
            Vritti accepts Zerodha Trade Book and Tax P&amp;L files in CSV/XLS/XLSX.
            For Tax P&amp;L, use the Tradewise Exits sheet. Minimum required fields: <strong>symbol</strong>, <strong>trade_type</strong>,{' '}
            <strong>quantity</strong>, <strong>price</strong>, and a date column.
          </p>
          <div className="table-scroll">
            <table className="csv-table-new">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>SYMBOL</th>
                  <th>TYPE</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                  <th>P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2024-04-01</td><td>TATAMOTORS</td><td className="type-buy">BUY</td>
                  <td>50</td><td>920.50</td><td className="pnl-neutral">—</td>
                </tr>
                <tr>
                  <td>2024-04-05</td><td>TATAMOTORS</td><td className="type-sell">SELL</td>
                  <td>50</td><td>945.00</td><td className="pnl-gain">+1225.00</td>
                </tr>
                <tr>
                  <td>2024-04-10</td><td>HDFCBANK</td><td className="type-buy">BUY</td>
                  <td>25</td><td>1620.00</td><td className="pnl-neutral">—</td>
                </tr>
                <tr>
                  <td>2024-04-15</td><td>HDFCBANK</td><td className="type-sell">SELL</td>
                  <td>25</td><td>1585.00</td><td className="pnl-loss">-875.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
