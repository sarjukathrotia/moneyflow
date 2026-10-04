'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Minus,
  ArrowRightLeft,
  ArrowUpDown,
  Download,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { useMoneyFlow } from '../../lib/store';
import { formatCurrency } from '../../lib/calculations';
import { Transaction } from '../../types/moneyflow';

export default function TransactionsPage() {
  const {
    transactions,
    transfers,
    accounts,
    categories,
    currency,
    openTransactionModal,
    requestDelete,
    exportData,
  } = useMoneyFlow();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState<'ALL' | 'CREDIT' | 'DEBIT' | 'TRANSFER'>('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const accountMap = useMemo(() => new Map(accounts.map(a => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Combined list of transactions and transfers
  const combinedItems = useMemo(() => {
    type UnifiedItem = {
      id: string;
      itemType: 'TRANSACTION' | 'TRANSFER';
      date: string;
      description: string;
      merchantOrSource: string;
      accountName: string;
      toAccountName?: string;
      categoryName: string;
      categoryColor?: string;
      type: 'CREDIT' | 'DEBIT' | 'TRANSFER';
      amount: number;
      note?: string | null;
      rawTx?: Transaction;
    };

    const list: UnifiedItem[] = [];

    // Add transactions
    for (const tx of transactions) {
      const acc = accountMap.get(tx.account_id);
      const cat = tx.category_id ? categoryMap.get(tx.category_id) : null;
      list.push({
        id: tx.id,
        itemType: 'TRANSACTION',
        date: tx.transaction_date,
        description: tx.description || (tx.type === 'CREDIT' ? 'Money In' : 'Money Out'),
        merchantOrSource: tx.source_or_merchant || '',
        accountName: acc ? acc.name : 'Unknown Account',
        categoryName: cat ? cat.name : 'Uncategorized',
        categoryColor: cat?.color || '#6B7280',
        type: tx.type,
        amount: Number(tx.amount),
        note: tx.note,
        rawTx: tx,
      });
    }

    // Add transfers
    for (const tr of transfers) {
      const fromAcc = accountMap.get(tr.from_account_id);
      const toAcc = accountMap.get(tr.to_account_id);
      list.push({
        id: tr.id,
        itemType: 'TRANSFER',
        date: tr.transaction_date,
        description: `Move: ${fromAcc?.name || 'Account'} → ${toAcc?.name || 'Account'}`,
        merchantOrSource: 'Internal Transfer',
        accountName: fromAcc?.name || 'Account',
        toAccountName: toAcc?.name || 'Account',
        categoryName: 'Transfer',
        categoryColor: '#2563EB',
        type: 'TRANSFER',
        amount: Number(tr.amount),
        note: tr.note,
      });
    }

    // Filter
    let filtered = list;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        item =>
          item.description.toLowerCase().includes(q) ||
          item.merchantOrSource.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q) ||
          item.accountName.toLowerCase().includes(q) ||
          (item.note && item.note.toLowerCase().includes(q)) ||
          item.amount.toString().includes(q)
      );
    }

    if (selectedAccount !== 'ALL') {
      filtered = filtered.filter(
        item =>
          item.accountName === selectedAccount ||
          (item.toAccountName && item.toAccountName === selectedAccount)
      );
    }

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(item => item.categoryName === selectedCategory);
    }

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortOrder === 'newest') return b.date.localeCompare(a.date);
      if (sortOrder === 'oldest') return a.date.localeCompare(b.date);
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return filtered;
  }, [transactions, transfers, accountMap, categoryMap, searchQuery, selectedAccount, selectedCategory, selectedType, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primaryText">Transactions</h1>
          <p className="text-xs text-secondaryText">Chronological timeline and money records</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('csv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-surface hover:bg-gray-50 text-secondaryText hover:text-primaryText border border-border rounded-btn text-xs font-medium shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openTransactionModal('CREDIT')}
            className="flex items-center gap-1.5 px-3 py-2 bg-positive hover:bg-green-700 text-white rounded-btn text-xs font-semibold shadow-subtle transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Money In</span>
          </button>

          <button
            onClick={() => openTransactionModal('DEBIT')}
            className="flex items-center gap-1.5 px-3 py-2 bg-negative hover:bg-red-700 text-white rounded-btn text-xs font-semibold shadow-subtle transition-all"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Money Out</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 bg-surface rounded-card border border-border shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondaryText" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by merchant, description, note, or amount..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-secondaryText hover:text-primaryText"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-background border border-border rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-secondaryText" />
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as any)}
                className="bg-transparent text-primaryText font-medium focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                showFilters || selectedAccount !== 'ALL' || selectedCategory !== 'ALL' || selectedType !== 'ALL'
                  ? 'bg-primaryAccent-light text-primaryAccent border-primaryAccent/40'
                  : 'bg-background text-secondaryText hover:text-primaryText border-border'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Accordion */}
        {showFilters && (
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150">
            {/* Type Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-secondaryText mb-1">Activity Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
              >
                <option value="ALL">All Types</option>
                <option value="CREDIT">Money In (Income)</option>
                <option value="DEBIT">Money Out (Expense)</option>
                <option value="TRANSFER">Move Money (Transfer)</option>
              </select>
            </div>

            {/* Account Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-secondaryText mb-1">Money Location</label>
              <select
                value={selectedAccount}
                onChange={e => setSelectedAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
              >
                <option value="ALL">All Locations</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-secondaryText mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-background border border-border rounded-lg text-xs"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
        {combinedItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-base font-bold text-primaryText">No matching activity</p>
            <p className="text-xs text-secondaryText max-w-sm mx-auto">
              Try adjusting your search terms or filters to find what you are looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedAccount('ALL');
                setSelectedCategory('ALL');
                setSelectedType('ALL');
              }}
              className="text-xs text-primaryAccent font-medium hover:underline pt-2"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-background/50 text-[11px] font-bold text-secondaryText uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Merchant</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Money Location</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {combinedItems.map(item => {
                  const isCredit = item.type === 'CREDIT';
                  const isTransfer = item.type === 'TRANSFER';
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-background/50 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-secondaryText whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Description & Note */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-primaryText">
                          {item.merchantOrSource || item.description}
                        </div>
                        {item.note && (
                          <div className="text-[11px] text-secondaryText truncate max-w-xs">
                            {item.note}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-background border border-border/60">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.categoryColor }}
                          />
                          <span>{item.categoryName}</span>
                        </span>
                      </td>

                      {/* Money Location */}
                      <td className="py-3.5 px-4 font-medium text-primaryText whitespace-nowrap">
                        {isTransfer ? (
                          <span className="flex items-center gap-1 text-[11px] text-secondaryText">
                            <span>{item.accountName}</span>
                            <ArrowRightLeft className="w-3 h-3 text-primaryAccent" />
                            <span>{item.toAccountName}</span>
                          </span>
                        ) : (
                          item.accountName
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isCredit
                              ? 'bg-positive-light text-positive border border-green-200'
                              : isTransfer
                              ? 'bg-primaryAccent-light text-primaryAccent border border-blue-200'
                              : 'bg-negative-light text-negative border border-red-200'
                          }`}
                        >
                          {isCredit ? 'Money In' : isTransfer ? 'Move Money' : 'Money Out'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap tabular-nums">
                        <span
                          className={
                            isCredit
                              ? 'text-positive'
                              : isTransfer
                              ? 'text-primaryAccent'
                              : 'text-primaryText'
                          }
                        >
                          {isCredit ? '+' : isTransfer ? '' : '-'}
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.itemType === 'TRANSACTION' && item.rawTx && (
                            <button
                              onClick={() => openTransactionModal(item.type as any, item.rawTx)}
                              className="p-1 text-secondaryText hover:text-primaryText rounded hover:bg-background"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              requestDelete({
                                id: item.id,
                                type: item.itemType === 'TRANSACTION' ? 'transaction' : 'transfer',
                                title: formatCurrency(item.amount, currency),
                              })
                            }
                            className="p-1 text-secondaryText hover:text-negative rounded hover:bg-background"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
