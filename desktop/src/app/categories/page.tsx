'use client';

import React, { useState } from 'react';
import { Tag, Plus, X } from 'lucide-react';
import { useMoneyFlow } from '../../lib/store';
import { CategoryType } from '../../types/moneyflow';

export default function CategoriesPage() {
  const { categories, addCategory } = useMoneyFlow();

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('EXPENSE');
  const [color, setColor] = useState('#EA580C');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    '#EA580C',
    '#DB2777',
    '#0284C7',
    '#D97706',
    '#DC2626',
    '#9333EA',
    '#16A34A',
    '#2563EB',
    '#6B7280',
  ];

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addCategory({
        name: name.trim(),
        type,
        color,
      });
      setIsModalOpen(false);
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    activeTab === 'EXPENSE'
      ? c.type === 'EXPENSE' || c.type === 'BOTH'
      : c.type === 'INCOME' || c.type === 'BOTH'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primaryText">Categories</h1>
          <p className="text-xs text-secondaryText">Organize your Money In and Money Out movements</p>
        </div>

        <button
          onClick={() => {
            setType(activeTab);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primaryAccent hover:bg-primaryAccent-hover text-white text-xs font-semibold rounded-btn shadow-subtle active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1 bg-surface rounded-xl border border-border w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'EXPENSE'
              ? 'bg-negative-light text-negative border border-red-200 shadow-sm'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Money Out Categories
        </button>
        <button
          onClick={() => setActiveTab('INCOME')}
          className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'INCOME'
              ? 'bg-positive-light text-positive border border-green-200 shadow-sm'
              : 'text-secondaryText hover:text-primaryText'
          }`}
        >
          Money In Categories
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCategories.map(cat => (
          <div
            key={cat.id}
            className="p-4 bg-surface rounded-card border border-border shadow-card flex items-center gap-3.5 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
              style={{ backgroundColor: cat.color || '#2563EB' }}
            >
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-primaryText truncate">{cat.name}</h3>
              <p className="text-[10px] text-secondaryText uppercase tracking-wider">
                {cat.is_default ? 'System Default' : 'Custom'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-modal border border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-primaryText">New Category</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-secondaryText hover:text-primaryText"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pets, Coffee, Investments"
                  className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">Applies To</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 text-sm bg-background rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primaryAccent/30"
                >
                  <option value="EXPENSE">Money Out (Spending)</option>
                  <option value="INCOME">Money In (Earnings)</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>

              {/* Color Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-primaryText">Color Tag</label>
                <div className="flex flex-wrap gap-2">
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
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
