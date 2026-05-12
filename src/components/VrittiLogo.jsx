export function VrittiLogo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect width="40" height="40" rx="8" fill="#1a1a1a" />
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fontSize="18"
          fill="#E85D26"
          fontFamily="Georgia, serif"
          fontWeight="700"
        >
          ψ
        </text>
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
