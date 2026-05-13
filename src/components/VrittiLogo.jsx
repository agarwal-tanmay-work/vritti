export function VrittiLogo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="40" height="40" rx="8" fill="#387ed1"/>
        <text x="20" y="27" text-anchor="middle" fontSize="24" fill="#ffffff" fontFamily="Georgia, serif" fontWeight="700">ψ</text>
      </svg>
      <span
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '700',
          fontSize: size * 0.58,
          color: '#387ed1',
          letterSpacing: '0.03em',
          textTransform: 'lowercase',
        }}
      >
        vritti
      </span>
    </div>
  );
}
