import type { Metadata } from 'next';
import './globals.css';

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: 'Phoenix Prep',
  description: 'Sales intelligence powered by Phoenix MCP',
  icons: {
    icon: '/hg-logo.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
