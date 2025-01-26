import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { cn } from '@/lib/utils';
import { QueryProvider } from '@/components/query-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Jotion - Abhay Panchal',
  description: 'Created by Abhay Panchal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'antialiased min-h-screen')}>
        <QueryProvider>
          <Toaster />
          <Suspense fallback={'loading...'}>{children}</Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
