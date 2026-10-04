'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  BarChart3,
  Settings,
  Plus,
  Zap,
  CheckCircle2,
  CloudOff,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';
import { useMoneyFlow } from '../lib/store';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Money Locations', href: '/accounts', icon: Wallet },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const { openTransactionModal, openQuickSpend, syncStatus, isLive, profile } = useMoneyFlow();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border w-64 p-5 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primaryAccent flex items-center justify-center text-white shadow-subtle group-hover:scale-105 transition-transform">
            <span className="font-semibold text-lg tracking-tight">M</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-primaryText leading-tight">MoneyFlow</h1>
            <p className="text-[11px] text-secondaryText font-medium">Personal Finance</p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-secondaryText hover:text-primaryText p-1.5 rounded-lg hover:bg-background"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Action CTAs */}
      <div className="pt-5 pb-3 space-y-2">
        <button
          onClick={() => openTransactionModal('DEBIT')}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primaryAccent hover:bg-primaryAccent-hover text-white text-sm font-medium rounded-btn shadow-subtle active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>

        <button
          onClick={openQuickSpend}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-background hover:bg-gray-100 text-primaryText text-xs font-medium rounded-btn border border-border/80 active:scale-[0.98] transition-all"
          title="3-Second Quick Expense"
        >
          <Zap className="w-3.5 h-3.5 text-warning" />
          <span>Quick Spend (3s)</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-btn text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primaryAccent-light text-primaryAccent font-semibold'
                  : 'text-secondaryText hover:text-primaryText hover:bg-background'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primaryAccent' : 'text-secondaryText'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sync Status Badge & Profile Footer */}
      <div className="pt-4 border-t border-border/60 space-y-3">
        {/* Sync Status Indicator */}
        <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-background border border-border/60">
          <div className="flex items-center gap-1.5">
            {syncStatus === 'SYNCED' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
            ) : syncStatus === 'SYNCING' ? (
              <RefreshCw className="w-3.5 h-3.5 text-primaryAccent animate-spin" />
            ) : syncStatus === 'OFFLINE' ? (
              <CloudOff className="w-3.5 h-3.5 text-negative" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-primaryAccent" />
            )}
            <span className="text-secondaryText text-[11px] font-medium">
              {syncStatus === 'SYNCED'
                ? 'Cloud Synced'
                : syncStatus === 'SYNCING'
                ? 'Syncing...'
                : syncStatus === 'OFFLINE'
                ? 'Offline'
                : 'Local Offline Engine'}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-secondaryText px-1.5 py-0.5 rounded bg-white border border-border">
            {isLive ? 'Supabase' : 'Offline'}
          </span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {profile.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primaryText truncate">{profile.full_name}</p>
            <p className="text-[11px] text-secondaryText truncate">{profile.email}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10 w-72 h-full shadow-modal">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
