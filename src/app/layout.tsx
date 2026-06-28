import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'BrainrotGP — F1 Second Screen',
  description: 'Brainrot GP The unnecessary second-screen companion for Formula 1.',
  keywords:    ['Formula 1', 'F1', 'live timing', 'race data', 'second screen'],
  openGraph: {
    title:       'BrainrotGP',
    description: 'Brainrot GP The unnecessary second-screen companion for Formula 1.',
    type:        'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
