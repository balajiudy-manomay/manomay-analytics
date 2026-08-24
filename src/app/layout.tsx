import type {Metadata} from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
