import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  Clock,
  Zap,
  PieChart,
  RefreshCw,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';

function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function countUp(el, target, duration = 1200) {
  if (!el) return;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const featureCards = [
  {
    icon: Brain,
    title: '13 Psychological Biases Detected',
    body: 'From panic selling and FOMO buying to revenge trading and the sunk cost fallacy, Vritti finds every pattern that\'s costing you money in your own trade data.',
  },
  {
    icon: BarChart3,
    title: 'Built for Zerodha Kite Users',
    body: 'Upload your Kite trade book CSV directly. Vritti auto-detects the format, matches your BUY-SELL pairs, and runs analysis in seconds. No account, no signup.',
  },
  {
    icon: Zap,
    title: 'Your Behaviour Score',
    body: 'Like a CIBIL score for your trading psychology. A single number from 0 to 100 that tells you how rationally you\'ve been trading and what to fix first.',
  },
  {
    icon: RefreshCw,
    title: 'Linked to Zerodha Varsity',
    body: 'Every bias Vritti detects links directly to the Zerodha Varsity module that explains it. Understand your mistake, then learn how to fix it for free.',
  },
];

const reportCards = [
  {
    icon: Brain,
    title: 'Panic Selling Detection',
    body: 'Identifies every trade where you sold at a loss within 3 days of entry during a market dip and calculates what holding would have cost you.',
  },
  {
    icon: TrendingUp,
    title: 'FOMO Buy Analysis',
    body: 'Finds every stock you bought after it had already run up significantly and shows you exactly where in the 30 day range you entered.',
  },
  {
    icon: Clock,
    title: 'Loss Aversion Score',
    body: 'Compares your average holding time for winners vs losers. Includes the Holding Time Asymmetry chart, the most visually striking thing in the report.',
  },
  {
    icon: Zap,
    title: 'Revenge Trading Tracker',
    body: 'Detects every BUY placed within 48 hours of a losing sell. Shows whether the revenge trade itself won or lost. (Spoiler: usually lost.)',
  },
  {
    icon: PieChart,
    title: 'Sector Concentration Map',
    body: 'Shows what % of your trades are concentrated in 2–3 sectors. Most Indian retail traders are 60–70% Banking + IT without realising it.',
  },
  {
    icon: RefreshCw,
    title: 'Counterfactual Engine',
    body: 'Calculates: "If you had traded without these biases, your portfolio would be ₹X better off." The number that changes how you see every future trade.',
  },
];

const faqs = [
  {
    q: 'What exactly is Vritti?',
    a: 'Vritti is a behavioural analysis tool for retail stock market investors. You upload your Zerodha trade book, and Vritti analyses every trade for 13 psychological biases including panic selling, FOMO buying, loss aversion, revenge trading, overconfidence, and more. It then gives you a Behaviour Score and a plain English report showing exactly what you keep doing wrong and when.',
  },
  {
    q: 'Why did you build this for Zerodha specifically?',
    a: 'Nithin Kamath once wrote that AI can\'t help retail investors make more money, but it can help them behave better. That one sentence is the entire reason Vritti exists. Zerodha is the only brokerage in India that actually cares about whether its users become better investors, not just more active ones. Vritti is built in that spirit.',
  },
  {
    q: 'How do I export my trades from Zerodha Kite?',
    a: 'Log in to Kite → go to Portfolio → P&L → select your date range → click Download. You\'ll get a CSV file. Drop that file directly into Vritti\'s Analyse page. The whole process takes under 30 seconds.',
  },
  {
    q: 'Does Vritti store my trade data anywhere?',
    a: 'No. Everything runs entirely in your browser. Your CSV file is never uploaded to any server. When you close the tab, the data is gone. This is a hard architectural decision. Vritti will never have a backend that touches your financial data.',
  },
  {
    q: 'Is this a trading signal tool? Will it tell me what to buy?',
    a: 'No — and this is intentional. Vritti does not predict markets, generate alpha, or give buy/sell signals. Nithin is right that no AI can reliably do this for retail investors. What Vritti does is help you understand your own behaviour so you stop making the same emotional mistakes repeatedly. Better behaviour compounds over time in ways that no stock tip ever will.',
  },
  {
    q: 'My Behaviour Score is 62. Is that good or bad?',
    a: 'Scores above 70 are healthy meaning you\'re making mostly rational decisions. Scores between 50 and 70 mean moderate bias activity that\'s costing you money but is fixable. Below 50 means your psychology is actively working against your portfolio, and the report will show you exactly which biases are the culprits. Most retail traders score between 45 and 65 on their first report.',
  },
  {
    q: "I'm a beginner. Is Vritti useful for me?",
    a: "Vritti is actually most valuable for beginners, because beginners haven't yet locked in bad habits that become hard to break. Every bias Vritti detects links directly to the free Zerodha Varsity module that explains it. Think of it as: Vritti finds your problem, Varsity teaches you to fix it.",
  },
  {
    q: 'Is Vritti affiliated with Zerodha?',
    a: 'No. Vritti is an independent project built by Tanmay Agarwal, a first-year Data Science and AI student at Masters Union, as a tribute to Zerodha\'s philosophy and as a demonstration of what AI should do for retail investors. This is not an official Zerodha product.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-open' : ''}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <ChevronDown size={18} className="faq-chevron" />
      </button>
      <div className="faq-answer">
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Vritti';
  }, [location]);
  const navigate = useNavigate();
  useReveal();

  const scoreRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          countUp(scoreRef.current, 62);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (scoreRef.current) observer.observe(scoreRef.current.closest('.score-anim-container') || scoreRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <section id="home" className="home-hero">
        <div className="hero-glow-orb" />
        <div className="hero-glow-orb-2" />
        <div className="home-hero-inner">
          <div className="hero-eyebrow">BUILT FOR ZERODHA KITE · INSPIRED BY NITHIN KAMATH</div>
          <h1 className="hero-h1">
            See The Trading<br />
            Mistakes You Keep<br />
            <span className="hero-h1-accent">Repeating</span>
          </h1>
          <p className="hero-sub">
            Vritti analyses your Zerodha trade history and reveals the 13 psychological biases quietly
            destroying your returns. Not market predictions. Not alpha. Just the truth about how you trade.
          </p>
          <div className="hero-actions">
            <button id="hero-cta-primary" className="btn-primary" onClick={() => navigate('/analyse')}>
              Analyse My Trades →
            </button>
          </div>
          <p className="hero-note">No account needed · Your data never leaves your browser · Zero servers</p>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="split-section">
          <div className="split-copy">
            <div className="section-eyebrow">THE PHILOSOPHY</div>
            <h2 className="section-heading">Built on What Nithin Actually Said</h2>
            <p className="split-body">
              Nithin Kamath once wrote that AI can&apos;t help retail investors make more money — but it can help
              them behave better. Vritti is the only tool built around that exact idea. We don&apos;t predict
              markets. We analyse your trades and show you the patterns you can&apos;t see yourself.
            </p>
          </div>
          <div className="split-visual">
            <div className="score-anim-container">
              <div className="score-ring-visual">
                <svg viewBox="0 0 120 120" width="160" height="160">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGradHome)" strokeWidth="8"
                    strokeDasharray="326.7" strokeDashoffset="124" strokeLinecap="round"
                    transform="rotate(-90 60 60)" />
                  <defs>
                    <linearGradient id="scoreGradHome" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E85D26" />
                      <stop offset="100%" stopColor="#F0B429" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-ring-number">
                  <span ref={scoreRef} className="score-count">62</span>
                  <span className="score-count-label">/100</span>
                </div>
              </div>
              <div className="score-pills-row">
                <span className="score-pill-small">Behaviour Score</span>
                <span className="score-pill-small score-pill-warn">Moderate Risk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-eyebrow centered">WHAT VRITTI DOES</div>
        <h2 className="section-heading centered">Stop Losing to Yourself.<br />Start Trading Like You Mean It.</h2>
        <div className="four-card-grid">
          {featureCards.map(({ icon: Icon, title, body }, i) => (
            <article key={title} className="feature-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="feature-card-icon"><Icon size={20} /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="section-eyebrow centered">DEEP DIVE</div>
        <h2 className="section-heading centered">What Vritti Shows You</h2>

        <div className="feature-row reveal">
          <div className="feature-row-visual left">
            <div className="holding-visual">
              <div className="holding-bar-label">Winners</div>
              <div className="holding-bar-track"><div className="holding-bar-fill green" style={{ width: '25%' }}>8d</div></div>
              <div className="holding-bar-label" style={{ marginTop: 12 }}>Losers</div>
              <div className="holding-bar-track"><div className="holding-bar-fill red" style={{ width: '80%' }}>41d</div></div>
            </div>
          </div>
          <div className="feature-row-copy">
            <h3>Your Holding Time Asymmetry</h3>
            <p>
              You cut your winners in 8 days and hold your losers for 41. Vritti shows this as a visual with green bars short and red bars long so you can&apos;t unsee it. This is loss aversion, and it&apos;s the most expensive bias in your portfolio.
            </p>
          </div>
        </div>

        <div className="feature-row reverse reveal">
          <div className="feature-row-copy">
            <h3>The Counterfactual: What If You Had No Biases?</h3>
            <p>
              Vritti re-runs your trade history assuming you traded without panic, without FOMO, without revenge. Then it shows you the difference in rupees. For most retail traders, the number is uncomfortable.
            </p>
          </div>
          <div className="feature-row-visual right">
            <div className="counterfactual-visual">
              <div className="cf-label">Actual P&L</div>
              <div className="cf-value loss">−₹18,400</div>
              <div className="cf-label" style={{ marginTop: 16 }}>Without Biases</div>
              <div className="cf-value gain">+₹32,100</div>
              <div className="cf-diff">Difference: <strong>₹50,500</strong></div>
            </div>
          </div>
        </div>

        <div className="feature-row reveal">
          <div className="feature-row-visual left">
            <div className="nudge-visual">
              <div className="nudge-card-preview">
                <div className="nudge-dot" />
                <p>&quot;Last 4 times Nifty fell 2%, you sold within 3 hours. It recovered every time.&quot;</p>
              </div>
              <div className="nudge-card-preview" style={{ opacity: 0.6 }}>
                <div className="nudge-dot" />
                <p>&quot;You&apos;ve entered INFY 3× after earnings gaps. Average return: −4.2%.&quot;</p>
              </div>
            </div>
          </div>
          <div className="feature-row-copy">
            <h3>The Nudge Feed</h3>
            <p>
              &quot;Last 4 times Nifty fell 2% in a day, you sold within 3 hours. The stock recovered every time.&quot; Plain English warnings based on your actual patterns so you catch yourself before you repeat the same mistake again.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section reveal">
        <div className="section-eyebrow centered">YOUR REPORT</div>
        <h2 className="section-heading centered">What&apos;s Inside Your Behaviour Report</h2>
        <p className="section-sub centered">Every report is generated from your actual Zerodha trade data. Nothing is estimated or assumed.</p>
        <div className="six-card-grid">
          {reportCards.map(({ icon: Icon, title, body }, i) => (
            <article key={title} className="report-card reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="report-card-icon"><Icon size={18} /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="home-section reveal">
        <div className="section-eyebrow centered">FAQ</div>
        <h2 className="section-heading centered">Common Questions</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <section className="home-cta-section reveal">
        <div className="home-cta-glow" />
        <div className="home-cta-inner">
          <h2>Know Your Trading Mind.<br />Before It Costs You More.</h2>
          <p>Upload your Zerodha trade book and get your complete Behaviour Report in under 60 seconds. Free. Private. No account needed.</p>
          <button id="home-cta-final" className="btn-primary" onClick={() => navigate('/analyse')}>
            Analyse My Trades →
          </button>
        </div>
      </section>
    </div>
  );
}
