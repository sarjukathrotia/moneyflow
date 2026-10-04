'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart as PieIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useMoneyFlow } from '../../lib/store';
import { formatCurrency } from '../../lib/calculations';

export default function ReportsPage() {
  const {
    currency,
    periodSummary,
    categoryExpenses,
    balanceTrend,
    selectedMonth,
    setSelectedMonth,
  } = useMoneyFlow();

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

  const comparisonData = [
    {
      name: formatMonthTitle(selectedMonth),
      'Money In': periodSummary.totalIncome,
      'Money Out': periodSummary.totalExpense,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primaryText">Financial Reports</h1>
          <p className="text-xs text-secondaryText">How much came in, how much went out, and how your balance changed</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-surface border border-border shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded text-secondaryText hover:text-primaryText hover:bg-background"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-primaryText px-2 min-w-[120px] text-center">
            {formatMonthTitle(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded text-secondaryText hover:text-primaryText hover:bg-background"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monthly Summary Breakdown Card (Prompt Section 34) */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-primaryText uppercase tracking-wider text-secondaryText">
          {formatMonthTitle(selectedMonth)} Money Summary
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {/* Starting Balance */}
          <div className="p-4 rounded-xl bg-background border border-border/80">
            <p className="text-[11px] font-semibold text-secondaryText">Starting Balance</p>
            <p className="text-lg font-bold text-primaryText mt-1 tabular-nums">
              {formatCurrency(periodSummary.startingBalance, currency)}
            </p>
          </div>

          {/* Money In */}
          <div className="p-4 rounded-xl bg-positive-light border border-green-200">
            <p className="text-[11px] font-semibold text-positive flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Money In</span>
            </p>
            <p className="text-lg font-bold text-positive mt-1 tabular-nums">
              +{formatCurrency(periodSummary.totalIncome, currency)}
            </p>
          </div>

          {/* Money Out */}
          <div className="p-4 rounded-xl bg-negative-light border border-red-200">
            <p className="text-[11px] font-semibold text-negative flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Money Out</span>
            </p>
            <p className="text-lg font-bold text-negative mt-1 tabular-nums">
              -{formatCurrency(periodSummary.totalExpense, currency)}
            </p>
          </div>

          {/* Ending Balance */}
          <div className="p-4 rounded-xl bg-primaryAccent-light border border-blue-200">
            <p className="text-[11px] font-semibold text-primaryAccent">Ending Balance</p>
            <p className="text-lg font-bold text-primaryAccent mt-1 tabular-nums">
              {formatCurrency(periodSummary.endingBalance, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Money In vs Money Out Bar Chart */}
        <div className="p-5 bg-surface rounded-card border border-border shadow-card space-y-4">
          <h3 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primaryAccent" />
            <span>Money In vs Money Out</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val, currency)}
                />
                <Legend />
                <Bar dataKey="Money In" fill="#16A34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Money Out" fill="#DC2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Over Time Line Chart */}
        <div className="p-5 bg-surface rounded-card border border-border shadow-card space-y-4">
          <h3 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primaryAccent" />
            <span>Balance Over Time (30 Days)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reportsBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
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
                        <div className="bg-surface p-2 rounded border border-border shadow-modal text-xs">
                          <p className="text-secondaryText font-medium">{data.date}</p>
                          <p className="text-primaryText font-bold">
                            Balance: {formatCurrency(data.balance, currency)}
                          </p>
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
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#reportsBalanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Where did I spend it? Spending by Category Table (Section 33) */}
      <div className="p-6 bg-surface rounded-card border border-border shadow-card space-y-4">
        <h3 className="text-sm font-bold text-primaryText flex items-center gap-1.5">
          <PieIcon className="w-4 h-4 text-negative" />
          <span>Where did I spend it? (Category Breakdown)</span>
        </h3>

        {categoryExpenses.length === 0 ? (
          <p className="text-xs text-secondaryText py-4 text-center">No spending records for this month.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/80 text-[11px] font-bold text-secondaryText uppercase tracking-wider">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Transactions</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3 text-right">Amount Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categoryExpenses.map(cat => (
                  <tr key={cat.categoryId} className="hover:bg-background/40">
                    <td className="py-3 px-3 font-semibold text-primaryText flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.categoryName}</span>
                    </td>
                    <td className="py-3 px-3 text-secondaryText">{cat.count} times</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 max-w-xs">
                        <div className="flex-1 h-2 bg-background rounded-full overflow-hidden border border-border/60">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-secondaryText">{cat.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-primaryText tabular-nums">
                      {formatCurrency(cat.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
