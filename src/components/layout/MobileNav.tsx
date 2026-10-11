import React from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  Receipt,
  PiggyBank,
  CalendarClock,
  TrendingUp,
} from 'lucide-react';
import { useFinance, ActiveTab } from '../../context/FinanceContext';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'decisionLab', label: 'Simulate', icon: FlaskConical },
    { id: 'transactions', label: 'Ledger', icon: Receipt },
    { id: 'savings', label: 'Goals', icon: PiggyBank },
    { id: 'commitments', label: 'Bills', icon: CalendarClock },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all relative ${
              isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-emerald-400 absolute top-1 right-2" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
