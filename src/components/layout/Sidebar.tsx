import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Receipt,
  PiggyBank,
  CalendarClock,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Calendar,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useFinance, ActiveTab } from '../../context/FinanceContext';
import { formatINR } from '../../utils/formatters';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    config,
    setCurrentDay,
    financialState,
    resetDemoData,
  } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'decisionLab', label: 'Decision Lab', icon: FlaskConical, badge: 'What-If' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'commitments', label: 'Commitments', icon: CalendarClock },
    { id: 'insights', label: 'Insights & Audit', icon: TrendingUp },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#0B0F19] border-r border-slate-800/80 p-4 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 px-3 py-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-glow-emerald shrink-0">
          <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
            <span className="font-heading font-extrabold text-xl text-emerald-400">₹</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold font-heading tracking-tight text-white m-0">
              RupeeFlow
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Gen Z Decision Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 px-3 mb-2 font-semibold">
          Finance Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Cycle Progress & Stepper */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cycle Timeline</span>
          </div>
          <span className="font-mono-num text-xs text-emerald-400 font-semibold">
            Day {config.currentDay} / 30
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="30"
          value={config.currentDay}
          onChange={(e) => setCurrentDay(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          title="Drag to simulate passing days in the 30-day cycle"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{financialState.daysRemaining} days left</span>
          <span className="text-slate-300 font-mono-num">
            {formatINR(financialState.dailyAllowance)}/day
          </span>
        </div>
      </div>

      {/* Deficit Alert Warning if applicable */}
      {financialState.isDeficit && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="leading-tight">
            Shortfall alert: {formatINR(financialState.deficitAmount)}
          </span>
        </div>
      )}

      {/* Footer & Reset Demo */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
        <button
          onClick={() => {
            if (window.confirm('Reset all transactions, commitments, and goals to demo baseline?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
          title="Restore seeded ₹10,000 baseline data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>

        <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-500">
          <span>PROMPT RUN Hackathon</span>
          <span className="flex items-center gap-1 text-emerald-500">
            <Sparkles className="w-2.5 h-2.5" /> Vibe Coded
          </span>
        </div>
      </div>
    </aside>
  );
};
