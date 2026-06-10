import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const ui = Inter({ subsets: ['latin'], variable: '--font-ui' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'ZENITH — See your edge clearly.', template: '%s · ZENITH' },
  description:
    'ZENITH is a premium trading journal: log trades in seconds, see your edge in KPIs, equity curves and behavioral analytics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${ui.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
