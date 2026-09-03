import type {Metadata} from 'next';
import './globals.css';
import { getSessionEmail } from '@/lib/auth/session';
import { AuthHeader } from '@/components/AuthHeader';

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const email = await getSessionEmail();

  return (
    <html lang="en">
      <body className="bg-slate-950">
        <AuthHeader email={email} />
        {children}
      </body>
    </html>
  );
}
