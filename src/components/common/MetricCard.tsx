import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'cyan' | 'indigo' | 'amber' | 'rose' | 'slate';
  delta?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  delta,
  highlight = false,
  onClick,
  className = '',
}) => {
  const iconVariantClasses = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
  };

  const highlightBorder = {
    emerald: 'border-emerald-500/40 shadow-glow-emerald',
    cyan: 'border-cyan-500/40',
    indigo: 'border-indigo-500/40 shadow-glow-indigo',
    amber: 'border-amber-500/40 shadow-glow-amber',
    rose: 'border-rose-500/40 shadow-glow-rose',
    slate: 'border-slate-700',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-[#0F172A]/90 border border-slate-800 transition-all duration-300 hover:border-slate-700 hover:translate-y-[-2px] group ${
        highlight ? highlightBorder[variant] : ''
      } ${onClick ? 'cursor-pointer hover:bg-slate-800/40' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-300 group-hover:scale-105 ${iconVariantClasses[variant]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2 flex-wrap">
        <h3 className="text-2xl sm:text-3xl font-bold text-white font-mono-num tracking-tight">
          {value}
        </h3>
        {delta && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              delta.isPositive
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {delta.value}
            {delta.label && <span className="opacity-75 font-normal ml-0.5">{delta.label}</span>}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
