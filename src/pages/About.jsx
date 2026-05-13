import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const skills = [
  'Python',
  'Java',
  'C',
  'LangChain',
  'NLP',
  'Prompt Engineering',
  'N8N',
  'Git / GitHub',
  'Data Visualization',
  'Data Analysis',
  'Tableau',
  'Stock Market Trading',
  'Business Analytics',
  'E-Commerce',
  'React & Frontend',
  'Machine Learning',
  'AI / LLM Engineering',
];

const projects = [
  {
    symbol: 'VRITTI',
    entry: 'April 2026',
    strategy: 'Investor behaviour analytics using AI',
    status: 'LIVE',
  },
  {
    symbol: 'TEASER AI',
    entry: 'April 2026',
    strategy: 'Autonomous product demo video generation',
    status: 'BUILDING',
  },
  {
    symbol: 'BEACON AI',
    entry: 'Early 2026',
    strategy: 'Anonymous corruption reporting chatbot',
    status: 'LIVE',
  },
  {
    symbol: 'RETAILMIND AI',
    entry: 'Early 2026',
    strategy: 'Conversational analytics for D2C brands',
    status: 'BUILT',
  },
  {
    symbol: 'ATLAS',
    entry: 'Early 2026',
    strategy: 'Failure intelligence platform using LLMs + vectors',
    status: 'LIVE',
  },
];

function statusClass(status) {
  if (status === 'LIVE') return 'status-live';
  if (status === 'BUILDING') return 'status-building';
  if (status === 'BUILT') return 'status-delivered';
  return '';
}

export default function About() {
  const location = useLocation();

  useEffect(() => {
    document.title = 'Vritti - Know Your Trading Mind';
  }, [location]);

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

  return (
    <div className="inner-page">
      <div className="page-glow" />

      <div className="inner-page-content">
        {/* HERO */}
        <motion.div
          className="about-hero reveal"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="about-hero-copy">
            <div className="section-eyebrow">THE BUILDER</div>
            <h1 className="inner-h1">Tanmay Agarwal</h1>
            <p className="inner-sub">Data Science & AI · Masters Union</p>
          </div>
          <div className="about-status-card">
            <div className="about-status-row">
              <span className="about-status-label">Status</span>
              <span className="about-status-value">Building · Learning · Shipping</span>
            </div>
          </div>
        </motion.div>

        {/* BIO */}
        <div className="about-bio-block reveal">
          <div className="about-bio-body">
            <p>
              I build actual products. An anonymous whistleblower platform. A failure intelligence system. A fully autonomous video generator. I trade on Zerodha Kite myself, which is why Vritti isn't hypothetical. Every bias it detects is one I've caught in my own trades.
            </p>
            <p className="about-body-spaced">
              I built Vritti because Nithin Kamath described exactly what AI should do for retail investors — help them behave better, not generate alpha — and nobody had built it yet. Vritti is that tool.
            </p>
          </div>
          <div className="about-bio-actions">
            <a
              href="https://github.com/agarwal-tanmay-work"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              id="about-github-link"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/tanmay-agarwal-959178368/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              id="about-linkedin-link"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* ABOUT VRITTI */}
        <div className="section reveal">
          <div className="section-eyebrow">ABOUT THE PRODUCT</div>
          <h2 className="section-heading">What is Vritti?</h2>
          <div className="zerodha-note-card">
            <div className="zerodha-note-body">
              <p>
                Vritti is a free, privacy-first behavioural analysis tool for retail stock market investors who trade on Zerodha Kite.
              </p>
              <p className="zerodha-note-paragraph">
                You upload your Zerodha trade book CSV — the same file you download from Kite's Portfolio → P&L section — and Vritti analyses every completed trade for 13 psychological biases: panic selling, FOMO buying, loss aversion, revenge trading, overtrading, herd behaviour, recency bias, overconfidence after wins, sector concentration, sunk cost fallacy, calendar effect bias, information overload, and disposition effect.
              </p>
              <p className="zerodha-note-paragraph">
                The output is a Behaviour Score (0–100), a plain-English breakdown of every bias found, a counterfactual showing what your portfolio would look like without those biases, and a Nudge Feed of personalised warnings based on your actual patterns.
              </p>
              <p className="zerodha-note-paragraph">
                Everything runs entirely in your browser. Your CSV is never uploaded to any server. When you close the tab, the data is gone. This is a hard architectural decision — Vritti will never have a backend that touches your financial data.
              </p>
              <p className="zerodha-note-paragraph">
                Vritti is not a trading signal tool. It does not predict markets, generate alpha, or give buy/sell tips. It is a mirror — one that shows you the behavioural patterns quietly costing you money, so you can fix them yourself.
              </p>
            </div>
          </div>
        </div>

        {/* NITHIN'S QUOTE */}
        <div className="section reveal">
          <div className="section-eyebrow">WHY I BUILT THIS</div>
          <h2 className="section-heading">Inspired by Nithin Kamath</h2>
          <div className="zerodha-note-card">
            <div className="zerodha-note-body">
              <p>
                "People keep asking me if AI can help them make money from trading. My honest answer is not really.
              </p>
              <p className="zerodha-note-paragraph">
                As long as there's a human in the loop, you're still dealing with the same creature driven by fear and greed, and that human will keep making the same mistakes. But beyond psychology, there's a bigger problem. There's no real informational edge left in markets. The odds are that everything is priced in. And even when it isn't, operating under that assumption is almost always a good idea.
              </p>
              <p className="zerodha-note-paragraph">
                The people actually making consistent money in markets are high-frequency trading firms, market makers, prop desks etc that have built infrastructural and data moats over years, with significant investment of time and capital. Those are real edges.
              </p>
              <p className="zerodha-note-paragraph">
                So, where does AI actually fit? It's a tool to help you behave better. Not to generate alpha.
              </p>
              <p className="zerodha-note-paragraph">
                What it can do is help you build and test strategies, then execute them systematically, removing emotion from the equation. That means fewer panic sells, less revenge trading, and more consistency. What it can't do is turn a bad strategy into a good one or create a magic money tree.
              </p>
              <p className="zerodha-note-paragraph">
                This is still an edge, just a different kind. AI can make you more disciplined, but not smarter. And if you think about where most trading losses actually come from, that distinction matters more than people realise."
              </p>
              <p className="zerodha-note-sig">— Nithin Kamath</p>
            </div>
          </div>
        </div>

        {/* SKILLS */}
        <div className="section reveal">
          <div className="section-eyebrow">PORTFOLIO HOLDINGS</div>
          <h2 className="section-heading">Skills</h2>
          <div className="skills-cloud">
            {skills.map((skill, i) => (
              <motion.div
                key={i}
                className="skill-chip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {skill}
              </motion.div>
            ))}
          </div>
          <div className="skills-summary">
            <span className="font-mono">Portfolio Value: Growing.</span>
            <span className="font-mono">Drawdown: Zero.</span>
          </div>
        </div>

        {/* PROJECTS */}
        <div className="section reveal">
          <div className="section-eyebrow">OPEN POSITIONS</div>
          <h2 className="section-heading">Projects</h2>
          <div className="projects-list">
            {projects.map((p, i) => (
              <motion.div
                key={i}
                className="project-card-new reveal"
                whileHover={{ x: 4 }}
                style={{ transitionDelay: `${i * 0.05}s` }}
              >
                <div className="project-card-left">
                <div className="project-symbol">{p.symbol}</div>
                <div className="project-meta-row">
                  <span className="project-meta-label">Entry:</span>
                  <span className="project-meta-val">{p.entry}</span>
                  <span className="project-meta-label project-meta-gap">Strategy:</span>
                  <span className="project-meta-val">{p.strategy}</span>
                </div>
              </div>
                <div className="project-card-right">
                  <span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ZERODHA NOTE */}
        <div className="zerodha-note-card reveal">
          <div className="zerodha-note-body">
            <p>
              "I didn't build Vritti to get a job. I built it because I believe in what
              Zerodha stands for. Zero barriers, financial literacy, and technology in
              service of ordinary investors."
            </p>
            <p className="zerodha-note-sig">Tanmay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
