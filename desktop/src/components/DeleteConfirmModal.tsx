'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useMoneyFlow } from '../lib/store';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteItem, confirmDelete, cancelDelete } = useMoneyFlow();

  if (!deleteItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-surface rounded-2xl shadow-modal border border-border p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-negative-light text-negative flex items-center justify-center mx-auto mb-4 border border-red-200">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-primaryText mb-1.5">Are you sure?</h3>
        <p className="text-xs text-secondaryText leading-relaxed mb-6">
          This will remove <span className="font-semibold text-primaryText">{deleteItem.title}</span> from your money history.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={cancelDelete}
            className="flex-1 py-2 px-3 text-xs font-semibold text-secondaryText hover:text-primaryText bg-background hover:bg-gray-100 rounded-lg border border-border transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-negative hover:bg-red-700 rounded-lg shadow-subtle active:scale-95 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
