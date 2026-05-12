import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="notfound-page">
      <div className="notfound-glow" />
      <div className="notfound-inner">
        <div className="section-eyebrow">ERROR</div>
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-body">
          This page doesn't exist. Maybe it got panic-sold before you arrived.
        </p>
        <button className="btn-primary" id="notfound-home-btn" onClick={() => navigate('/')}>
          Go Home →
        </button>
      </div>
    </div>
  );
}
