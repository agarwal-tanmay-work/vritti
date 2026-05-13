export function VrittiLogo({ size = 32 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M7 8H22L31 17V32H16L7 23V8Z" fill="#387ed1" />
        <path d="M22 8V17H31" fill="#7fb2f1" />
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
