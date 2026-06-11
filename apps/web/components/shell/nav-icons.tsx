/** Hand-drawn 18px stroke icons for the sidebar — consistent 1.6px weight. */
type IconProps = { className?: string };

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 18 18',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M2.5 10.5a6.5 6.5 0 0 1 13 0" />
      <path d="M9 10.5 12.2 7" />
      <path d="M2.5 14h13" />
    </svg>
  );
}

export function TradesIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M3 3v12h12" />
      <path d="M6 10.5 9 7l2.5 2L15 4.5" />
    </svg>
  );
}

export function JournalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 2.5h9.5v13H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5Z" />
      <path d="M6.5 6h4M6.5 9h4" />
    </svg>
  );
}

export function AnalyticsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 15V9M9 15V3M14 15v-4" />
    </svg>
  );
}

export function AccountsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="2.5" y="4.5" width="13" height="9" rx="1.5" />
      <path d="M2.5 8h13" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <circle cx="9" cy="9" r="2.2" />
      <path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M13.6 4.4l-1.4 1.4M5.8 12.2l-1.4 1.4" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <path d="M9 4v10M4 9h10" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden>
      <rect x="2.5" y="3.5" width="13" height="12" rx="1.5" />
      <path d="M2.5 7.5h13M6 2v3M12 2v3" />
      <path d="M5.5 11h2v2h-2zM8.5 11h2v2h-2z" strokeWidth="0" fill="currentColor" />
    </svg>
  );
}
