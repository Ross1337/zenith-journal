'use client';

const WORDS = ['EDGE', 'DISCIPLINE', 'PERFORMANCE', 'R-MULTIPLES', 'DRAWDOWN', 'WIN RATE', 'EXPECTANCY', 'EDGE', 'DISCIPLINE', 'PERFORMANCE', 'R-MULTIPLES', 'DRAWDOWN', 'WIN RATE', 'EXPECTANCY'];

export function Marquee() {
  return (
    <div className="overflow-hidden border-y border-edge-subtle py-4">
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { display: flex; width: max-content; animation: marquee 40s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span
            key={i}
            className="mx-4 text-[13px] font-semibold uppercase tracking-[0.25em]"
            style={{
              color: i % 3 === 2 ? '#F2B544' : i % 3 === 0 ? 'transparent' : '#A8B0C4',
              WebkitTextStroke: i % 3 === 0 ? '1px #1E2330' : undefined,
            }}
          >
            {w} ·
          </span>
        ))}
      </div>
    </div>
  );
}
