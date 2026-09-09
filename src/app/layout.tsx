import type {Metadata} from 'next';
import './globals.css';
import { getSessionEmail } from '@/lib/auth/session';
import { AuthHeader } from '@/components/AuthHeader';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Manomay Analytics | Power BI Viewer',
  description: 'Manomay Analytics - Executive Power BI Dashboard Viewer.',
  openGraph: {
    title: 'Manomay Analytics - Power BI Dashboard Viewer',
    description: 'Executive Power BI Dashboard Viewer.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    // favicon.ico is auto-detected from public/favicon.ico by Next.js — no entry needed here.
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const email = await getSessionEmail();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AuthHeader email={email} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
