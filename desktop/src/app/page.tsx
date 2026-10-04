'use client';

import React from 'react';
import Link from 'next/link';
import {
  Plus,
  Minus,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useMoneyFlow } from '../lib/store';
import { formatCurrency } from '../lib/calculations';

export default function DashboardPage() {
  const {
    currency,
    totalBalance,
    periodSummary,
    accounts,
    transactions,
    categoryExpenses,
    balanceTrend,
    openTransactionModal,
    requestDelete,
  } = useMoneyFlow();

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Top 5 spending categories
  const topCategories = categoryExpenses.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Hero Balance */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-secondaryText mb-1">
            Your Money
          </p>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-primaryText tracking-tight tabular-nums">
              {formatCurrency(totalBalance, currency)}
            </h1>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs font-semibold">
            <span className="text-positive flex items-center gap-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              +{formatCurrency(periodSummary.totalIncome, currency)} received
            </span>
            <span className="text-negative flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              -{formatCurrency(periodSummary.totalExpense, currency)} spent
            </span>
          </div>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openTransactionModal('CREDIT')}
            className="flex items-center gap-2 px-4 py-2.5 bg-positive hover:bg-green-700 text-white text-xs font-semibold rounded-btn shadow-subtle active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Money In</span>
          </button>

          <button
            onClick={() => openTransactionModal('DEBIT')}
            className="flex items-center gap-2 px-4 py-2.5 bg-negative hover:bg-red-700 text-white text-xs font-semibold rounded-btn shadow-subtle active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4" />
            <span>Money Out</span>
          </button>

          <button
            onClick={() => openTransactionModal('TRANSFER')}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-gray-50 text-primaryText text-xs font-semibold rounded-btn border border-border shadow-subtle active:scale-95 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-primaryAccent" />
            <span>Move Money</span>
          </button>
        </div>
      </div>

      {/* 2. Money Locations (Accounts) Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-primaryAccent" />
            <span>Money Locations</span>
          </h2>
          <Link
            href="/accounts"
            className="text-xs font-medium text-primaryAccent hover:underline flex items-center gap-0.5"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className="p-4 bg-surface rounded-card border border-border shadow-card flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm"
                  style={{ backgroundColor: acc.color || '#2563EB' }}
                >
                  {acc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-primaryText">{acc.name}</h3>
                  <p className="text-[11px] text-secondaryText capitalize">{acc.type.toLowerCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primaryText tabular-nums">
                  {formatCurrency(acc.current_balance ?? acc.opening_balance, currency)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Analytics Charts: Balance Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Trend Area Chart */}
        <div className="lg:col-span-2 p-5 bg-surface rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primaryAccent" />
                <span>Balance Trend (30 Days)</span>
              </h3>
              <p className="text-[11px] text-secondaryText">Cumulative personal net balance history</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={str => str.slice(5)}
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-surface p-2.5 rounded-lg border border-border shadow-modal text-xs">
                          <p className="text-secondaryText font-medium">{data.date}</p>
                          <p className="text-primaryText font-bold mt-0.5">
                            Balance: {formatCurrency(data.balance, currency)}
                          </p>
                          {data.income > 0 && (
                            <p className="text-positive text-[11px]">+{formatCurrency(data.income, currency)} in</p>
                          )}
                          {data.expense > 0 && (
                            <p className="text-negative text-[11px]">-{formatCurrency(data.expense, currency)} out</p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#balanceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut / List */}
        <div className="p-5 bg-surface rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-negative" />
              <span>Spending by Category</span>
            </h3>
            <span className="text-[11px] text-secondaryText">This Month</span>
          </div>

          {topCategories.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4 text-secondaryText text-xs">
              <p>No expenses recorded this month yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-36 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topCategories}
                      dataKey="amount"
                      nameKey="categoryName"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={3}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val, currency), 'Spent']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {topCategories.map(cat => (
                  <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-primaryText font-medium">{cat.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-secondaryText text-[11px]">{cat.percentage}%</span>
                      <span className="font-semibold text-primaryText tabular-nums">
                        {formatCurrency(cat.amount, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Recent Activity Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-secondaryText" />
            <span>Recent Activity</span>
          </h2>
          <Link
            href="/transactions"
            className="text-xs font-medium text-primaryAccent hover:underline flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 bg-surface rounded-card border border-border text-center space-y-2">
            <p className="text-sm font-semibold text-primaryText">Nothing here yet</p>
            <p className="text-xs text-secondaryText">Start tracking your money in seconds.</p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => openTransactionModal('CREDIT')}
                className="px-3 py-1.5 bg-positive text-white text-xs font-medium rounded-lg"
              >
                + Money In
              </button>
              <button
                onClick={() => openTransactionModal('DEBIT')}
                className="px-3 py-1.5 bg-negative text-white text-xs font-medium rounded-lg"
              >
                - Money Out
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-card border border-border divide-y divide-border/60 shadow-card overflow-hidden">
            {recentTransactions.map(tx => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  className="p-4 flex items-center justify-between hover:bg-background/60 transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCredit
                          ? 'bg-positive-light text-positive border border-green-200'
                          : 'bg-negative-light text-negative border border-red-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primaryText">
                        {tx.source_or_merchant || tx.description || 'Activity'}
                      </p>
                      <p className="text-[11px] text-secondaryText">
                        {tx.transaction_date} • {isCredit ? 'Money In' : 'Money Out'}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isCredit ? 'text-positive' : 'text-primaryText'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </span>
                    <button
                      onClick={() =>
                        requestDelete({
                          id: tx.id,
                          type: 'transaction',
                          title: formatCurrency(tx.amount, currency),
                        })
                      }
                      className="opacity-0 group-hover:opacity-100 text-secondaryText hover:text-negative text-xs p-1 rounded transition-opacity"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
