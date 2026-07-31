import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pull Hub',
  description: 'Rip packs. Pull graded cards.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-theme is set pre-hydration by the /redesign skin-switch script —
    // suppress the expected attribute mismatch (same pattern as next-themes).
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
