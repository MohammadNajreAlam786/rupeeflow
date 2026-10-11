import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Transaction, TransactionType, Category } from '../../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_MAP } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction | null;
  currentDay: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentDay,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<Category>('food_dining');
  const [date, setDate] = useState('');
  const [dayInPeriod, setDayInPeriod] = useState<number>(currentDay);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount);
      setType(initialData.type);
      setCategory(initialData.category);
      setDate(initialData.date);
      setDayInPeriod(initialData.dayInPeriod);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('food_dining');
      setDate(new Date().toISOString().split('T')[0]);
      setDayInPeriod(currentDay);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, currentDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title or merchant name.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      date: date || new Date().toISOString().split('T')[0],
      dayInPeriod: Number(dayInPeriod) || currentDay,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
      subtitle="Keep your cash ledger accurate and up to date"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Type Picker */}
        <div>
          <span className="block text-xs font-medium text-slate-400 mb-1.5">
            Transaction Type
          </span>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Transaction Type">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('food_dining');
              }}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Expense Outflow (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('freelance');
              }}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Income Inflow (+)
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="tx-amount" className="block text-xs font-medium text-slate-400 mb-1.5">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₹
            </span>
            <input
              id="tx-amount"
              type="number"
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 350"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num font-bold text-base focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>
        </div>

        {/* Title / Merchant */}
        <div>
          <label htmlFor="tx-title" className="block text-xs font-medium text-slate-400 mb-1.5">
            Title / Description
          </label>
          <input
            id="tx-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Campus Cafeteria, Rapido ride, Zomato"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="tx-category" className="block text-xs font-medium text-slate-400 mb-1.5">
            Category
          </label>
          <select
            id="tx-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            {type === 'expense'
              ? EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_MAP[cat]?.label || cat}
                  </option>
                ))
              : INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_MAP[cat]?.label || cat}
                  </option>
                ))}
          </select>
        </div>

        {/* Date and Day in Period */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tx-date" className="block text-xs font-medium text-slate-400 mb-1.5">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="tx-day-in-period" className="block text-xs font-medium text-slate-400 mb-1.5">
              Day in 30d Period (1-30)
            </label>
            <input
              id="tx-day-in-period"
              type="number"
              min="1"
              max="30"
              value={dayInPeriod}
              onChange={(e) => setDayInPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="tx-notes" className="block text-xs font-medium text-slate-400 mb-1.5">
            Notes / Split Details (Optional)
          </label>
          <input
            id="tx-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Split with roommates, paid via UPI"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-glow-emerald transition-all"
          >
            {initialData ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
