import React, { useState } from 'react';
import {
  Wallet,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarClock,
  PiggyBank,
  AlertCircle,
  FlaskConical,
  Receipt,
  CheckCircle2,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { MetricCard } from '../common/MetricCard';
import { HealthScoreGauge } from '../common/HealthScoreGauge';
import { HealthBreakdownModal } from './HealthBreakdownModal';
import { formatINR, CATEGORY_MAP, formatDate } from '../../utils/formatters';

interface DashboardViewProps {
  onOpenAddTransaction: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAddTransaction }) => {
  const {
    financialState,
    config,
    transactions,
    commitments,
    savingsGoals,
    setActiveTab,
    markCommitmentPaid,
  } = useFinance();

  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);

  // Filter upcoming commitments due soon
  const upcomingCommitments = commitments
    .filter((c) => c.status === 'upcoming')
    .sort((a, b) => a.dueDayInPeriod - b.dueDayInPeriod)
    .slice(0, 3);

  // Filter recent live transactions
  const recentTransactions = transactions.slice(0, 5);

  // Percentages for stacked budget breakdown
  const spentPct = Math.min(100, (financialState.totalExpenses / financialState.totalIncome) * 100);
  const savingsPct = Math.min(100, (financialState.totalSavingsAllocated / financialState.totalIncome) * 100);
  const reservedPct = Math.min(100, (financialState.reservedCommitments / financialState.totalIncome) * 100);
  const safePct = Math.max(0, 100 - (spentPct + savingsPct + reservedPct));

  return (
    <div className="space-y-6 pb-12">
      {/* Deficit Alert Warning Banner if safe-to-spend is negative */}
      {financialState.isDeficit && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-300">
                Financial Shortfall Detected: {formatINR(financialState.deficitAmount)}
              </h4>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Your upcoming mandatory commitments exceed your available cash balance. Open Decision Lab
                to simulate cancelling non-essential subscriptions or adding emergency gig income.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('decisionLab')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-400 transition-colors shrink-0"
          >
            Solve in Decision Lab
          </button>
        </div>
      )}

      {/* Top Row: 4 Essential Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Cash Balance */}
        <MetricCard
          title="Available Cash Balance"
          value={formatINR(financialState.availableCashBalance)}
          subtitle={`Liquid funds in account after ₹${financialState.totalSavingsAllocated} locked into savings goals.`}
          icon={Wallet}
          variant="cyan"
          highlight
        />

        {/* 2. Safe-to-Spend Amount */}
        <MetricCard
          title="Safe-to-Spend Pool"
          value={formatINR(financialState.safeToSpendAmount)}
          subtitle={
            financialState.reservedCommitments > 0
              ? `Free cash after auto-reserving ₹${financialState.reservedCommitments.toLocaleString('en-IN')} in escrow for upcoming bills.`
              : 'Free discretionary cash with no pending bills reserved.'
          }
          icon={ShieldCheck}
          variant={financialState.safeToSpendAmount <= 0 ? 'rose' : 'emerald'}
          highlight
          delta={
            financialState.reservedCommitments > 0
              ? {
                  value: 'Escrow Protected',
                  isPositive: true,
                  label: `₹${financialState.reservedCommitments.toLocaleString('en-IN')} locked`,
                }
              : undefined
          }
        />

        {/* 3. Daily Allowance */}
        <MetricCard
          title="Daily Discretionary Allowance"
          value={`${formatINR(financialState.dailyAllowance)}/day`}
          subtitle={`Spread across remaining ${financialState.daysRemaining} days (Day ${config.currentDay} of 30) • Survival floor: ₹${config.minDailySurvivalBudget}/day.`}
          icon={Calendar}
          variant={
            financialState.dailyAllowance < config.minDailySurvivalBudget ? 'amber' : 'emerald'
          }
          delta={{
            value:
              financialState.dailyAllowance >= config.minDailySurvivalBudget
                ? 'Above Survival Floor'
                : 'Below Survival Floor',
            isPositive: financialState.dailyAllowance >= config.minDailySurvivalBudget,
            label: `(₹${config.minDailySurvivalBudget}/d min)`,
          }}
        />

        {/* 4. Reserved Commitments */}
        <MetricCard
          title="Reserved Bills & Subs"
          value={formatINR(financialState.reservedCommitments)}
          subtitle={`${commitments.filter((c) => c.status === 'upcoming').length} upcoming payments due this month.`}
          icon={Lock}
          variant="indigo"
          onClick={() => setActiveTab('commitments')}
        />
      </div>

      {/* Second Row: Budget Allocation Bar & Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Budget Progress & Stacked Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-white font-heading">
                  30-Day Capital Allocation Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  Total capital available: {formatINR(financialState.totalIncome)} (₹
                  {config.initialBudget.toLocaleString('en-IN')} base + {formatINR(financialState.totalIncome - config.initialBudget)} earned)
                </p>
              </div>
              <span className="text-xs font-mono-num font-semibold text-slate-300">
                Day {config.currentDay} of 30 ({financialState.daysRemaining} days left)
              </span>
            </div>

            {/* Stacked Multi-Segment Progress Bar */}
            <div className="w-full h-4 bg-slate-800 rounded-xl overflow-hidden flex p-0.5 border border-slate-700/50 mt-4">
              {/* Spent */}
              <div
                className="h-full bg-rose-500 rounded-l transition-all duration-500"
                style={{ width: `${spentPct}%` }}
                title={`Spent: ${formatINR(financialState.totalExpenses)} (${spentPct.toFixed(1)}%)`}
              />
              {/* Saved */}
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${savingsPct}%` }}
                title={`Saved: ${formatINR(financialState.totalSavingsAllocated)} (${savingsPct.toFixed(1)}%)`}
              />
              {/* Reserved */}
              <div
                className="h-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${reservedPct}%` }}
                title={`Reserved Bills: ${formatINR(financialState.reservedCommitments)} (${reservedPct.toFixed(1)}%)`}
              />
              {/* Safe to Spend */}
              <div
                className="h-full bg-emerald-500 rounded-r transition-all duration-500"
                style={{ width: `${safePct}%` }}
                title={`Safe to spend: ${formatINR(financialState.safeToSpendAmount)} (${safePct.toFixed(1)}%)`}
              />
            </div>

            {/* Legend / Key Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Spent to Date</span>
                </div>
                <span className="text-sm font-bold font-mono-num text-white mt-1">
                  {formatINR(financialState.totalExpenses)}
                </span>
                <span className="text-[10px] text-slate-400">{spentPct.toFixed(0)}% of total</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Locked in Goals</span>
                </div>
                <span className="text-sm font-bold font-mono-num text-white mt-1">
                  {formatINR(financialState.totalSavingsAllocated)}
                </span>
                <span className="text-[10px] text-slate-400">{savingsPct.toFixed(0)}% of total</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Reserved Bills</span>
                </div>
                <span className="text-sm font-bold font-mono-num text-white mt-1">
                  {formatINR(financialState.reservedCommitments)}
                </span>
                <span className="text-[10px] text-slate-400">{reservedPct.toFixed(0)}% of total</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Safe to Spend</span>
                </div>
                <span className="text-sm font-bold font-mono-num text-emerald-400 mt-1">
                  {formatINR(financialState.safeToSpendAmount)}
                </span>
                <span className="text-[10px] text-slate-400">{safePct.toFixed(0)}% free cushion</span>
              </div>
            </div>
          </div>

          {/* Quick Decision Lab CTA Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Contemplating a purchase or gig?</p>
                <p className="text-[11px] text-slate-400">
                  Test before spending: preview exact impacts on daily allowance and health score.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('decisionLab')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <span>Launch Decision Lab</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="flex flex-col">
          <HealthScoreGauge
            healthScore={financialState.healthScore}
            onOpenBreakdown={() => setIsHealthModalOpen(true)}
          />
        </div>
      </div>

      {/* Third Row: Upcoming Bills Due Soon + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Commitments & Bills */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-semibold text-white font-heading">
                Upcoming Mandatory Commitments
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('commitments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View All ({commitments.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingCommitments.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-900/50 rounded-xl">
                All bills for this period are settled! No upcoming commitments.
              </div>
            ) : (
              upcomingCommitments.map((com) => {
                const daysUntilDue = com.dueDayInPeriod - config.currentDay;
                const isUrgent = daysUntilDue <= 3;

                return (
                  <div
                    key={com.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white line-clamp-1">{com.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">
                            Due Day {com.dueDayInPeriod} ({formatDate(com.dueDate)})
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                              Due in {Math.max(0, daysUntilDue)}d
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold font-mono-num text-white">
                        {formatINR(com.amount)}
                      </span>
                      <button
                        onClick={() => markCommitmentPaid(com.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                        title="Mark paid and deduct from cash balance"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white font-heading">
                Recent Cashflow Ledger
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAddTransaction}
                className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
              >
                + Add
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                Full Ledger ({transactions.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const meta = CATEGORY_MAP[tx.category] || CATEGORY_MAP.other;
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isExpense
                          ? 'bg-rose-500/10 text-rose-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {isExpense ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white line-clamp-1">{tx.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>Day {tx.dayInPeriod}</span>
                        <span>•</span>
                        <span className={meta.badgeText}>{meta.label}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-bold font-mono-num shrink-0 ${
                      isExpense ? 'text-slate-200' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? `-` : `+`}
                    {formatINR(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fourth Row: Active Savings Goals Sneak Peek */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold text-white font-heading">
              Active Savings Milestones
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('savings')}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            Manage Goals ({savingsGoals.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

            return (
              <div
                key={goal.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white">{goal.title}</h4>
                  <span className="text-xs font-bold font-mono-num text-amber-400">
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono-num">
                  <span>{formatINR(goal.currentAmount)} saved</span>
                  <span>Target: {formatINR(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mathematical Breakdown Audit Modal */}
      <HealthBreakdownModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        healthScore={financialState.healthScore}
      />
    </div>
  );
};
