import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'X Reply Drafter - Draft Viral Replies in One Click',
  description: 'AI-powered Chrome extension for crafting viral replies on X (Twitter). Save time, stay on brand, get more engagement.',
  openGraph: {
    title: 'X Reply Drafter',
    description: 'Draft viral replies on X in one click',
    images: [
      {
        url: 'https://x-reply-drafter.com/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
