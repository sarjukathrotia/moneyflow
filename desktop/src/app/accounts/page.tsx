'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Building2,
  Smartphone,
  Banknote,
  CreditCard,
  Layers,
  Trash2,
  X,
} from 'lucide-react';
import { useMoneyFlow } from '../../lib/store';
import { formatCurrency } from '../../lib/calculations';
import { AccountType } from '../../types/moneyflow';

export default function MoneyLocationsPage() {
  const { accounts, currency, addAccount, requestDelete } = useMoneyFlow();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [openingBalance, setOpeningBalance] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = ['#2563EB', '#16A34A', '#7C3AED', '#EA580C', '#DB2777', '#0284C7', '#475569'];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addAccount({
        name: name.trim(),
        type,
        currency,
        opening_balance: parseFloat(openingBalance) || 0,
        color,
      });
      setIsModalOpen(false);
      setName('');
      setOpeningBalance('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'CASH':
        return Banknote;
      case 'BANK':
        return Building2;
      case 'UPI':
        return Smartphone;
      case 'CREDIT_CARD':
        return CreditCard;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primaryText">Money Locations</h1>
          <p className="text-xs text-secondaryText">Where your personal money physically exists</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primaryAccent hover:bg-primaryAccent-hover text-white text-xs font-semibold rounded-btn shadow-subtle active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Money Location</span>
        </button>
      </div>

      {/* Grid of Money Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => {
          const Icon = getAccountIcon(acc.type);
          return (
            <div
              key={acc.id}
              className="p-5 bg-surface rounded-card border border-border shadow-card flex flex-col justify-between space-y-4 hover:shadow-modal transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: acc.color || '#2563EB' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primaryText">{acc.name}</h3>
                    <span className="text-[11px] font-medium text-secondaryText uppercase tracking-wider">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    requestDelete({
                      id: acc.id,
                      type: 'account',
                      title: acc.name,
                    })
                  }
                  className="p-1 text-secondaryText hover:text-negative rounded hover:bg-background"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-secondaryText uppercase font-semibold">Current Balance</p>
                  <p className="text-xl font-extrabold text-primaryText tabular-nums">
                    {formatCurrency(acc.current_balance ?? acc.opening_balance, currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-secondaryText uppercase font-semibold">Opening Balance</p>
                  <p className="text-xs font-medium text-secondaryText tabular-nums">
                    {formatCurrency(acc.opening_balance, currency)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Money Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-surface rounded-2xl shadow-modal border border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-primaryText">Add Money Location</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-secondaryText hover:text-primaryText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Cash, ICICI Bank, Paytm Wallet"
                  className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-primaryText">Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  >
                    <option value="BANK">Bank Account</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="UPI">UPI / Digital</option>
                    <option value="WALLET">Digital Wallet</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="OTHER">Other Location</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-primaryText">Opening Balance (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={openingBalance}
                    onChange={e => setOpeningBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">Tag Color</label>
                <div className="flex items-center gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-110 ring-2 ring-offset-2 ring-primaryAccent' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-secondaryText hover:text-primaryText"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-4 py-2 bg-primaryAccent hover:bg-primaryAccent-hover disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-subtle transition-all"
                >
                  {isSubmitting ? 'Creating...' : 'Create Money Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
