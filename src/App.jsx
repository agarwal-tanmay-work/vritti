import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import Analyse from './pages/Analyse';
import About from './pages/About';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import ReportPrint from './pages/ReportPrint';
import NotFound from './pages/NotFound';
import { loadAnalysis, saveAnalysis } from './utils/storage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageFade({ children }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} style={{ animation: 'pageFadeIn 0.3s ease forwards' }}>
      {children}
    </div>
  );
}

function getInitialAnalysisState() {
  const restored = loadAnalysis();
  const restoreBanner = restored?.savedAt
    ? `Resumed your last report from this browser session (${new Date(restored.savedAt).toLocaleString('en-IN')}). Upload new trades to refresh.`
    : '';
  return { analysis: restored, restoreBanner };
}

function AppShell({ analysis, restoreBanner, onAnalysisComplete }) {
  const { pathname } = useLocation();
  const isPrintRoute = pathname === '/report';

  return (
    <>
      <ScrollToTop />
      {isPrintRoute ? null : <ScrollProgress />}
      {isPrintRoute ? null : <Navbar />}
      {!isPrintRoute && restoreBanner ? <div className="restore-banner">{restoreBanner}</div> : null}
      <PageFade>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyse" element={<Analyse onAnalysisComplete={onAnalysisComplete} />} />
          <Route path="/dashboard" element={<Dashboard analysis={analysis} />} />
          <Route path="/report" element={<ReportPrint analysis={analysis} />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageFade>
      {isPrintRoute ? null : <Footer />}
    </>
  );
}

export default function App() {
  const initialSession = getInitialAnalysisState();
  const [analysis, setAnalysis] = useState(() => initialSession.analysis);
  const [restoreBanner, setRestoreBanner] = useState(() => initialSession.restoreBanner);

  const handleAnalysisComplete = (result) => {
    setAnalysis(result);
    saveAnalysis(result);
    setRestoreBanner('');
  };

  useEffect(() => {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.transition = 'opacity 0.24s ease';
      window.setTimeout(() => {
        loader.style.display = 'none';
      }, 240);
    }
  }, []);

  return (
    <Router>
      <AppShell
        analysis={analysis}
        restoreBanner={restoreBanner}
        onAnalysisComplete={handleAnalysisComplete}
      />
    </Router>
  );
}
