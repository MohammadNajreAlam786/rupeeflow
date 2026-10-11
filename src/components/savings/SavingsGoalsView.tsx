import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Calendar,
  Lock,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { GoalModal } from './GoalModal';
import { ContributeModal } from './ContributeModal';
import { formatINR } from '../../utils/formatters';

export const SavingsGoalsView: React.FC = () => {
  const {
    savingsGoals,
    financialState,
    config,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    withdrawFromGoal,
  } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGoalForFunds, setSelectedGoalForFunds] = useState<SavingsGoal | null>(null);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (
      window.confirm(
        `Delete goal "${title}"? Any funds currently saved in it will automatically return to your liquid cash balance.`
      )
    ) {
      deleteSavingsGoal(id);
    }
  };

  const handleOpenContribute = (goal: SavingsGoal) => {
    setSelectedGoalForFunds(goal);
    setIsContributeModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#0F172A] to-slate-900 border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <PiggyBank className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Savings & Emergency Piggybanks
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Locked savings shield your funds from impulsive spending. Every rupee allocated reduces your
            daily safe-to-spend allowance, protecting you against end-of-month broke days.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsGoalModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl shadow-glow-amber transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Saved Across Goals</span>
          <div className="text-2xl font-bold font-mono-num text-amber-400 mt-1">
            {formatINR(financialState.totalSavingsAllocated)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {Math.round((financialState.totalSavingsAllocated / financialState.totalIncome) * 100)}% of your ₹{financialState.totalIncome} budget
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Available Liquid Cash</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-400 mt-1">
            {formatINR(financialState.availableCashBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Eligible to deposit into goals anytime
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Savings Buffer Health Score</span>
          <div className="text-2xl font-bold font-mono-num text-indigo-400 mt-1">
            {financialState.healthScore.components.savingsBuffer.score} / 20 pts
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {financialState.healthScore.components.savingsBuffer.label}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const isComplete = goal.currentAmount >= goal.targetAmount;

          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-[#0F172A] border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Value */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold font-mono-num text-white">
                    {formatINR(goal.currentAmount)}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono-num">
                    Target: {formatINR(goal.targetAmount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                {/* Status / Percentage */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span className="font-semibold" style={{ color: goal.color }}>
                    {pct}% Funded
                  </span>
                  <span>{isComplete ? 'Goal Achieved! 🎉' : `${formatINR(remaining)} to go`}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleOpenContribute(goal)}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transfer Funds</span>
                </button>

                <button
                  onClick={() => contributeToGoal(goal.id, 250)}
                  disabled={financialState.availableCashBalance < 250}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    financialState.availableCashBalance >= 250
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                  title="Quick deposit ₹250"
                >
                  +₹250
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={(data) => {
          if (editingGoal) {
            updateSavingsGoal(editingGoal.id, data);
          } else {
            addSavingsGoal(data);
          }
        }}
        initialData={editingGoal}
      />

      {/* Contribute/Withdraw Modal */}
      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setSelectedGoalForFunds(null);
        }}
        goal={selectedGoalForFunds}
        availableCash={financialState.availableCashBalance}
        onContribute={contributeToGoal}
        onWithdraw={withdrawFromGoal}
      />
    </div>
  );
};
