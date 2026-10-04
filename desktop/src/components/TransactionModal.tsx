'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Minus,
  ArrowRightLeft,
  Calendar,
  Tag,
  Wallet,
  FileText,
  Building,
} from 'lucide-react';
import { useMoneyFlow } from '../lib/store';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    transactionModalInitialType,
    editingTransaction,
    accounts,
    categories,
    addTransaction,
    updateTransaction,
    addTransfer,
  } = useMoneyFlow();

  const [activeTab, setActiveTab] = useState<'CREDIT' | 'DEBIT' | 'TRANSFER'>('DEBIT');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form when modal opens
  useEffect(() => {
    if (isTransactionModalOpen) {
      const today = new Date().toISOString().slice(0, 10);
      if (editingTransaction) {
        setActiveTab(editingTransaction.type);
        setAmount(String(editingTransaction.amount));
        setDescription(editingTransaction.source_or_merchant || editingTransaction.description || '');
        setAccountId(editingTransaction.account_id);
        setCategoryId(editingTransaction.category_id || '');
        setNote(editingTransaction.note || '');
        setDate(editingTransaction.transaction_date || today);
      } else {
        setActiveTab(transactionModalInitialType);
        setAmount('');
        setDescription('');
        setAccountId(accounts[0]?.id || '');
        setToAccountId(accounts[1]?.id || accounts[0]?.id || '');
        
        // Pick sensible initial category based on tab
        const defaultCat = categories.find(c =>
          transactionModalInitialType === 'CREDIT' ? c.type === 'INCOME' : c.type === 'EXPENSE'
        );
        setCategoryId(defaultCat?.id || '');
        setNote('');
        setDate(today);
      }
      setError('');

      // Autofocus amount input
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isTransactionModalOpen, editingTransaction, transactionModalInitialType, accounts, categories]);

  if (!isTransactionModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount.');
      amountInputRef.current?.focus();
      return;
    }

    if (activeTab === 'TRANSFER') {
      if (!accountId || !toAccountId) {
        setError('Please select both from and to accounts.');
        return;
      }
      if (accountId === toAccountId) {
        setError('Source and destination accounts must be different.');
        return;
      }
    } else {
      if (!accountId) {
        setError('Please select an account.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'TRANSFER') {
        await addTransfer({
          from_account_id: accountId,
          to_account_id: toAccountId,
          amount: numAmount,
          note: note.trim() || undefined,
          transaction_date: date,
        });
      } else {
        const payload = {
          account_id: accountId,
          type: activeTab,
          amount: numAmount,
          category_id: categoryId || undefined,
          description: description.trim() || (activeTab === 'CREDIT' ? 'Money In' : 'Money Out'),
          source_or_merchant: description.trim() || undefined,
          note: note.trim() || undefined,
          transaction_date: date,
        };

        if (editingTransaction) {
          await updateTransaction(editingTransaction.id, payload);
        } else {
          await addTransaction(payload);
        }
      }
      closeTransactionModal();
    } catch {
      setError('An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    activeTab === 'CREDIT'
      ? c.type === 'INCOME' || c.type === 'BOTH'
      : c.type === 'EXPENSE' || c.type === 'BOTH'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-modal border border-border overflow-hidden">
        {/* Modal Header & Tabs */}
        <div className="px-6 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-base font-bold text-primaryText">
              {editingTransaction ? 'Edit Activity' : 'Record Money Movement'}
            </h2>
            <button
              onClick={closeTransactionModal}
              className="p-1 rounded-lg text-secondaryText hover:text-primaryText hover:bg-background"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Activity Type Switcher */}
          {!editingTransaction && (
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-background border border-border/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('DEBIT');
                  const cat = categories.find(c => c.type === 'EXPENSE');
                  if (cat) setCategoryId(cat.id);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'DEBIT'
                    ? 'bg-surface text-negative shadow-sm border border-border/60'
                    : 'text-secondaryText hover:text-primaryText'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Money Out</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('CREDIT');
                  const cat = categories.find(c => c.type === 'INCOME');
                  if (cat) setCategoryId(cat.id);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'CREDIT'
                    ? 'bg-surface text-positive shadow-sm border border-border/60'
                    : 'text-secondaryText hover:text-primaryText'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Money In</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRANSFER')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'TRANSFER'
                    ? 'bg-surface text-primaryAccent shadow-sm border border-border/60'
                    : 'text-secondaryText hover:text-primaryText'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Move Money</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-negative-light border border-red-200 text-negative text-xs font-medium">
              {error}
            </div>
          )}

          {/* Big Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondaryText">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-2xl font-bold text-secondaryText">₹</span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 text-3xl font-extrabold text-primaryText bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 focus:border-primaryAccent tabular-nums"
                required
              />
            </div>
          </div>

          {/* Description / Source or Merchant */}
          {activeTab !== 'TRANSFER' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primaryText">
                {activeTab === 'CREDIT'
                  ? 'Where did this money come from?'
                  : 'Where did you spend it?'}
              </label>
              <div className="relative flex items-center">
                <Building className="absolute left-3 w-4 h-4 text-secondaryText" />
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={activeTab === 'CREDIT' ? 'e.g. Salary, Client payment, Gift' : 'e.g. Grocery, Restaurant, Utilities'}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 focus:border-primaryAccent"
                  required
                />
              </div>
            </div>
          )}

          {/* Transfer: From and To Accounts */}
          {activeTab === 'TRANSFER' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">From Money Location</label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (₹{acc.current_balance ?? acc.opening_balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">To Money Location</label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id} disabled={acc.id === accountId}>
                      {acc.name} (₹{acc.current_balance ?? acc.opening_balance})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-secondaryText" />
                  <span>Category</span>
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                >
                  <option value="">Uncategorized</option>
                  {filteredCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account / Money Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-secondaryText" />
                  <span>{activeTab === 'CREDIT' ? 'Deposit Into' : 'Paid From'}</span>
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  required
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primaryText flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-secondaryText" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-primaryText flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-secondaryText" />
                <span>Note (Optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional detail..."
                className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={closeTransactionModal}
              className="px-4 py-2 text-xs font-medium text-secondaryText hover:text-primaryText hover:bg-background rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-subtle active:scale-95 transition-all ${
                activeTab === 'CREDIT'
                  ? 'bg-positive hover:bg-green-700'
                  : activeTab === 'DEBIT'
                  ? 'bg-negative hover:bg-red-700'
                  : 'bg-primaryAccent hover:bg-primaryAccent-hover'
              }`}
            >
              {isSubmitting
                ? 'Saving...'
                : editingTransaction
                ? 'Update Activity'
                : activeTab === 'CREDIT'
                ? 'Save Money In'
                : activeTab === 'DEBIT'
                ? 'Save Money Out'
                : 'Move Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
