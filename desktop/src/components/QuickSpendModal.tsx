'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, ArrowRight } from 'lucide-react';
import { useMoneyFlow } from '../lib/store';

export const QuickSpendModal: React.FC = () => {
  const { isQuickSpendOpen, closeQuickSpend, accounts, categories, addTransaction } = useMoneyFlow();

  const [step, setStep] = useState<'amount' | 'merchant'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);
  const merchantRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickSpendOpen) {
      setStep('amount');
      setAmount('');
      setMerchant('');
      setTimeout(() => {
        amountRef.current?.focus();
      }, 100);
    }
  }, [isQuickSpendOpen]);

  useEffect(() => {
    if (step === 'merchant') {
      setTimeout(() => {
        merchantRef.current?.focus();
      }, 100);
    }
  }, [step]);

  if (!isQuickSpendOpen) return null;

  const handleAmountNext = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return;
    setStep('merchant');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0) return;

    setIsSubmitting(true);
    try {
      // Sensible defaults
      const defaultAccount = accounts[0]?.id || '';
      const defaultCategory = categories.find(c => c.type === 'EXPENSE')?.id || undefined;
      const today = new Date().toISOString().slice(0, 10);

      await addTransaction({
        account_id: defaultAccount,
        type: 'DEBIT',
        amount: val,
        category_id: defaultCategory,
        description: merchant.trim() || 'Quick Expense',
        source_or_merchant: merchant.trim() || 'Quick Expense',
        transaction_date: today,
      });

      closeQuickSpend();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-surface rounded-3xl shadow-modal border border-border p-6 text-center">
        <button
          onClick={closeQuickSpend}
          className="absolute top-4 right-4 p-1 rounded-full text-secondaryText hover:text-primaryText hover:bg-background"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-warning/10 text-warning text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Quick Spend (3 Seconds)</span>
        </div>

        {step === 'amount' ? (
          <form onSubmit={handleAmountNext} className="space-y-6">
            <div>
              <p className="text-xs text-secondaryText font-medium mb-2">How much did you spend?</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-extrabold text-secondaryText">₹</span>
                <input
                  ref={amountRef}
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-48 text-center text-4xl font-black text-primaryText bg-transparent focus:outline-none border-b-2 border-primaryAccent/50 focus:border-primaryAccent pb-1 tabular-nums"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full py-3 px-4 bg-primaryAccent hover:bg-primaryAccent-hover disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <p className="text-sm font-bold text-negative mb-1">₹{amount}</p>
              <p className="text-xs text-secondaryText font-medium mb-3">Where did you spend it?</p>
              <input
                ref={merchantRef}
                type="text"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                placeholder="e.g. Coffee, Supermarket, Taxi"
                className="w-full px-4 py-2.5 text-center text-base font-semibold text-primaryText bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30 focus:border-primaryAccent"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('amount')}
                className="py-2.5 px-4 text-xs font-medium text-secondaryText hover:text-primaryText rounded-xl hover:bg-background"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !merchant.trim()}
                className="flex-1 py-2.5 px-4 bg-negative hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm active:scale-95 transition-all shadow-subtle"
              >
                {isSubmitting ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
