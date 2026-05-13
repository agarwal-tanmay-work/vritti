import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VrittiLogo } from './VrittiLogo';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setMenuOpen(false);

  return (
    <motion.nav className="navbar" initial={{ y: -70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="navbar-inner">
        <Link to="/" className="nav-logo-link" aria-label="Go to home page" onClick={close}>
          <VrittiLogo size={28} />
        </Link>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><NavLink to="/" end onClick={close}>Home</NavLink></li>
          <li><NavLink to="/analyse" onClick={close}>Analyse</NavLink></li>
          <li><NavLink to="/dashboard" onClick={close}>Dashboard</NavLink></li>
          <li><NavLink to="/about" onClick={close}>About</NavLink></li>
        </ul>

        <button
          className="nav-cta-btn"
          onClick={() => { close(); navigate('/analyse'); }}
          aria-label="Analyse your trades"
        >
          Analyse Trades →
        </button>

        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle mobile menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu-overlay"
          >
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/analyse" onClick={close}>Analyse</NavLink>
            <NavLink to="/dashboard" onClick={close}>Dashboard</NavLink>
            <NavLink to="/about" onClick={close}>About</NavLink>
            <button
              className="nav-cta-btn mobile-cta"
              onClick={() => { close(); navigate('/analyse'); }}
            >
              Analyse Trades →
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.nav>
  );
}
