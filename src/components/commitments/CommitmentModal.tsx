import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Commitment, CommitmentType, ExpenseCategory } from '../../types/finance';
import { EXPENSE_CATEGORIES, CATEGORY_MAP } from '../../utils/formatters';

interface CommitmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Commitment, 'id'>) => void;
  initialData?: Commitment | null;
  currentDay: number;
}

export const CommitmentModal: React.FC<CommitmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentDay,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<CommitmentType>('subscription');
  const [category, setCategory] = useState<ExpenseCategory>('utilities_bills');
  const [dueDayInPeriod, setDueDayInPeriod] = useState<number>(currentDay + 5);
  const [autoRenew, setAutoRenew] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount);
      setType(initialData.type);
      setCategory(initialData.category);
      setDueDayInPeriod(initialData.dueDayInPeriod);
      setAutoRenew(initialData.autoRenew);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setType('subscription');
      setCategory('utilities_bills');
      setDueDayInPeriod(Math.min(30, currentDay + 5));
      setAutoRenew(true);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, currentDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title (e.g. WiFi bill or Spotify).');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than ₹0.');
      return;
    }

    const calculatedDueDate = `2026-10-${String(dueDayInPeriod).padStart(2, '0')}`;

    onSubmit({
      title: title.trim(),
      amount: Number(amount),
      type,
      category,
      dueDate: calculatedDueDate,
      dueDayInPeriod: Number(dueDayInPeriod),
      status: initialData ? initialData.status : 'upcoming',
      autoRenew,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Commitment' : 'Add Recurring Commitment / Bill'}
      subtitle="Ensure mandatory expenses are reserved ahead of time"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Commitment Nature
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('subscription')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                type === 'subscription'
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Recurring Subscription
            </button>
            <button
              type="button"
              onClick={() => setType('bill')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                type === 'bill'
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Scheduled Bill / Recharge
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Title / Provider
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Jio 5G Recharge, Spotify, Flat WiFi Share"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Amount Due (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₹
            </span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 399"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num font-bold text-base focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_MAP[cat]?.label || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Due on Day (1-30)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={dueDayInPeriod}
              onChange={(e) => setDueDayInPeriod(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Due before 15th to avoid late penalty"
            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

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
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-xl shadow-glow-indigo transition-all"
          >
            {initialData ? 'Save Changes' : 'Reserve Commitment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
