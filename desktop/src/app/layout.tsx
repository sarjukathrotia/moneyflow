'use client';

import React, { useState } from 'react';
import './globals.css';
import { MoneyFlowProvider } from '../lib/store';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { TransactionModal } from '../components/TransactionModal';
import { QuickSpendModal } from '../components/QuickSpendModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>MoneyFlow — Personal Money Tracker</title>
        <meta
          name="description"
          content="Simple, beautiful digital personal money diary and financial dashboard for desktop and mobile."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MoneyFlow" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-background text-primaryText antialiased">
        <MoneyFlowProvider>
          <div className="flex min-h-screen">
            <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0">
              <TopNav onOpenMobileMenu={() => setMobileMenuOpen(true)} />
              <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>

          {/* Interactive Modals */}
          <TransactionModal />
          <QuickSpendModal />
          <DeleteConfirmModal />
        </MoneyFlowProvider>
      </body>
    </html>
  );
}
