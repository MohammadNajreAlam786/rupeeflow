import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  availableCash: number;
  onContribute: (goalId: string, amount: number) => boolean;
  onWithdraw: (goalId: string, amount: number) => boolean;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  goal,
  availableCash,
  onContribute,
  onWithdraw,
}) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<number | ''>(250);
  const [error, setError] = useState('');

  if (!goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (mode === 'deposit') {
      if (num > availableCash) {
        setError(`Cannot deposit ${formatINR(num)}. Available cash is only ${formatINR(availableCash)}.`);
        return;
      }
      const ok = onContribute(goal.id, num);
      if (ok) onClose();
    } else {
      if (num > goal.currentAmount) {
        setError(`Cannot withdraw ${formatINR(num)}. Goal balance is only ${formatINR(goal.currentAmount)}.`);
        return;
      }
      const ok = onWithdraw(goal.id, num);
      if (ok) onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'deposit' ? 'Deposit Funds to' : 'Withdraw Funds from'} ${goal.title}`}
      subtitle={`Current Saved: ${formatINR(goal.currentAmount)} / Target: ${formatINR(goal.targetAmount)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Mode switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('deposit');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === 'deposit'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Deposit Money (+)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw');
              setError('');
            }}
            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
              mode === 'withdraw'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Withdraw to Cash (-)
          </button>
        </div>

        {/* Liquidity context note */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex justify-between">
          <span className="text-slate-400">Available Liquid Cash:</span>
          <span className="font-mono-num font-bold text-white">{formatINR(availableCash)}</span>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="contribute-amount" className="block text-xs font-medium text-slate-400 mb-1.5">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₹
            </span>
            <input
              id="contribute-amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num font-bold text-base focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 mt-2">
            {[100, 250, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-num transition-colors"
              >
                ₹{val}
              </button>
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
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-glow-emerald transition-all"
          >
            {mode === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
