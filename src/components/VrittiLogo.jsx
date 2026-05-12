import { useId } from 'react';

export function VrittiLogo({ size = 32 }) {
  const gid = useId().replace(/:/g, '');
  const gradId = `logoGrad-${gid}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="40" height="40" rx="8" fill="#1a1a1a" />
        <rect width="40" height="40" rx="8" fill={`url(#${gradId})`} opacity="0.3" />
        <rect x="12" y="10" width="3" height="20" rx="1.5" fill="#E85D26" />
        <rect x="10" y="14" width="7" height="8" rx="1" fill="#E85D26" opacity="0.7" />
        <rect x="25" y="8" width="3" height="24" rx="1.5" fill="#E85D26" opacity="0.5" />
        <rect x="23" y="16" width="7" height="8" rx="1" fill="#E85D26" opacity="0.3" />
        <path d="M15 20 Q18 14 20 20 Q22 26 25 20" stroke="#E85D26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#E85D26" />
            <stop offset="100%" stopColor="#0d0d0d" />
          </linearGradient>
        </defs>
      </svg>
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          fontSize: size * 0.55,
          color: '#ffffff',
          letterSpacing: '0.5px',
        }}
      >
        vritti
      </span>
    </div>
  );
}
