import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types/finance';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  initialData?: SavingsGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<SavingsGoal['category']>('emergency');
  const [color, setColor] = useState('#10B981');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTargetAmount(initialData.targetAmount);
      setCategory(initialData.category);
      setColor(initialData.color);
    } else {
      setTitle('');
      setTargetAmount('');
      setCategory('emergency');
      setColor('#10B981');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      setError('Target amount must be greater than ₹0.');
      return;
    }

    onSubmit({
      title: title.trim(),
      targetAmount: Number(targetAmount),
      category,
      targetDayInPeriod: 30,
      color,
    });
    onClose();
  };

  const COLOR_OPTIONS = ['#10B981', '#6366F1', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      subtitle="Lock money away from impulse buying and build resilience"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="goal-title" className="block text-xs font-medium text-slate-400 mb-1.5">
            Goal Name
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Emergency Rainy Fund, Goa Trip, Mechanical Keyboard"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="goal-target-amount" className="block text-xs font-medium text-slate-400 mb-1.5">
            Target Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₹
            </span>
            <input
              id="goal-target-amount"
              type="number"
              min="1"
              step="any"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 2000"
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num font-bold text-base focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="goal-category" className="block text-xs font-medium text-slate-400 mb-1.5">
            Category
          </label>
          <select
            id="goal-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as SavingsGoal['category'])}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="emergency">Emergency / Safety Cushion</option>
            <option value="travel">Travel & Trips</option>
            <option value="gadget">Tech & Hardware Upgrade</option>
            <option value="lifestyle">Lifestyle & Fashion</option>
            <option value="education">Certifications & Courses</option>
          </select>
        </div>

        <div>
          <span className="block text-xs font-medium text-slate-400 mb-1.5">
            Color Accent
          </span>
          <div className="flex items-center gap-3" role="group" aria-label="Color accent options">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                aria-pressed={color === c}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-glow-amber transition-all"
          >
            {initialData ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
