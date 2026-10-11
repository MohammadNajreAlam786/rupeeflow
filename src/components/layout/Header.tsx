import React from 'react';
import {
  FlaskConical,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

interface HeaderProps {
  onOpenAddTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction }) => {
  const {
    activeTab,
    setActiveTab,
    config,
    financialState,
    resetDemoData,
  } = useFinance();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Financial Command Center',
      subtitle: `Managing ₹${config.initialBudget.toLocaleString('en-IN')} 30-day budget • Day ${config.currentDay} of 30`,
    },
    decisionLab: {
      title: 'Decision Lab & What-If Sandbox',
      subtitle: 'Simulate purchases, bills & gig income before spending a single rupee',
    },
    transactions: {
      title: 'Cashflow & Transactions',
      subtitle: 'Track, categorize, and audit every inflow and outflow',
    },
    savingsGoals: {
      title: 'Savings & Emergency Reserves',
      subtitle: 'Shield funds from impulse buys and hit your milestones',
    },
    savings: {
      title: 'Savings & Emergency Reserves',
      subtitle: 'Shield funds from impulse buys and hit your milestones',
    },
    commitments: {
      title: 'Commitments & Subscriptions',
      subtitle: 'Never miss a mandatory recharge or split rent payment',
    },
    insights: {
      title: 'Financial Health & Forecast Insights',
      subtitle: 'Velocity audit, mathematical scoring, and end-of-period outlook',
    },
  };

  const currentMeta = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and breadcrumb */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {currentMeta.title}
            </h1>
            {activeTab === 'decisionLab' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Pure Sandbox
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{currentMeta.subtitle}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Safe Allowance Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400">Safe/Day:</span>
            <span className="text-xs font-mono-num font-bold text-emerald-400">
              {formatINR(financialState.dailyAllowance)}
            </span>
          </div>

          {/* Simulate Action (Visible unless already on Decision Lab) */}
          {activeTab !== 'decisionLab' && (
            <button
              onClick={() => setActiveTab('decisionLab')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 transition-all shadow-sm"
              title="Open What-If Decision Lab"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              <span>Simulate</span>
            </button>
          )}

          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all shadow-glow-emerald cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>

          {/* Reset Demo button on smaller screens */}
          <button
            onClick={() => {
              if (window.confirm('Reset all transactions, commitments, and goals to demo baseline?')) {
                resetDemoData();
              }
            }}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
