/**
 * ZENITH brand mark — a star at its highest point above the horizon line.
 * Pure SVG, original geometry; scales with the `size` prop.
 */
export function ZenithMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      {/* Horizon */}
      <path d="M3 19h18" stroke="var(--z-border-strong)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Apex trajectory */}
      <path
        d="M5 19c0-7.5 3.5-13 7-13s7 5.5 7 13"
        stroke="var(--z-gold-subdued)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 3.2"
      />
      {/* The star at zenith */}
      <circle cx="12" cy="6" r="2.6" fill="var(--z-gold)" />
      <circle cx="12" cy="6" r="4.6" fill="var(--z-gold-glow)" />
    </svg>
  );
}
