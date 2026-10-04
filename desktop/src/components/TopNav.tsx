'use client';

import React from 'react';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ArrowRightLeft,
  Search,
} from 'lucide-react';
import { useMoneyFlow } from '../lib/store';
import { useRouter } from 'next/navigation';

export const TopNav: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const router = useRouter();
  const {
    selectedMonth,
    setSelectedMonth,
    openTransactionModal,
  } = useMoneyFlow();

  // Parse YYYY-MM into readable month name and year
  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-surface/90 backdrop-blur-md border-b border-border/70">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-secondaryText hover:text-primaryText rounded-lg hover:bg-background"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div
          onClick={() => router.push('/transactions')}
          className="cursor-pointer flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-background border border-border/80 w-full max-w-xs text-secondaryText hover:border-gray-400 text-xs transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-secondaryText" />
          <span className="flex-1 truncate">Search your money...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white rounded border border-border font-mono text-gray-400">
            /
          </kbd>
        </div>
      </div>

      {/* Center: Month Navigator */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-background border border-border/80 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-md text-secondaryText hover:text-primaryText hover:bg-white active:scale-95 transition-all"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold text-primaryText min-w-[110px] text-center">
          {formatMonthTitle(selectedMonth)}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-md text-secondaryText hover:text-primaryText hover:bg-white active:scale-95 transition-all"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => openTransactionModal('CREDIT')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-btn text-xs font-medium text-positive bg-positive-light hover:bg-green-100 border border-green-200 active:scale-95 transition-all"
          title="Record Money Received"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Money In</span>
        </button>

        <button
          onClick={() => openTransactionModal('DEBIT')}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-btn text-xs font-medium text-negative bg-negative-light hover:bg-red-100 border border-red-200 active:scale-95 transition-all"
          title="Record Expense"
        >
          <Minus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Money Out</span>
        </button>

        <button
          onClick={() => openTransactionModal('TRANSFER')}
          className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 rounded-btn text-xs font-medium text-primaryAccent bg-primaryAccent-light hover:bg-blue-100 border border-blue-200 active:scale-95 transition-all"
          title="Move Money Between Accounts"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Move Money</span>
        </button>
      </div>
    </header>
  );
};
