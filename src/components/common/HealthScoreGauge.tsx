import React from 'react';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { HealthScoreBreakdown } from '../../types/finance';
import { RiskBadge } from './Badge';

interface HealthScoreGaugeProps {
  healthScore: HealthScoreBreakdown;
  onOpenBreakdown?: () => void;
  compact?: boolean;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  healthScore,
  onOpenBreakdown,
  compact = false,
}) => {
  const { overallScore, riskLevel, components } = healthScore;

  // Color schemes based on score
  let strokeColor = '#10B981'; // Emerald
  let bgGlow = 'rgba(16, 185, 129, 0.15)';
  let verdictTitle = 'Resilient & Thriving';

  if (overallScore < 50 || riskLevel === 'high') {
    strokeColor = '#EF4444'; // Rose
    bgGlow = 'rgba(239, 68, 68, 0.15)';
    verdictTitle = 'High Risk of Deficit';
  } else if (overallScore < 75 || riskLevel === 'moderate') {
    strokeColor = '#F59E0B'; // Amber
    bgGlow = 'rgba(245, 158, 11, 0.15)';
    verdictTitle = 'Caution & Vigilance';
  }

  // Circular gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenBreakdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenBreakdown?.();
          }
        }}
        aria-label={`Financial health score: ${overallScore} out of 100, risk level: ${riskLevel}. Click to view math audit.`}
        className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#1E293B"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke={strokeColor}
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 20}
              strokeDashoffset={2 * Math.PI * 20 - (overallScore / 100) * (2 * Math.PI * 20)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <span className="absolute font-bold text-xs text-white font-mono-num">
            {overallScore}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-white">Health Score</span>
            <RiskBadge risk={riskLevel} />
          </div>
          <span className="text-[11px] text-slate-400">{verdictTitle}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#131D31] border border-slate-800 shadow-xl overflow-hidden group">
      {/* Subtle background glow */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-70"
        style={{ backgroundColor: bgGlow }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white font-heading">
              Financial Health Score
            </h3>
            <RiskBadge risk={riskLevel} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic index computed from 4 core pillars
          </p>
        </div>
        {onOpenBreakdown && (
          <button
            onClick={onOpenBreakdown}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 p-1 rounded-md hover:bg-indigo-500/10 transition-colors"
            title="Inspect health score algorithm"
          >
            Details <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Radial Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke="#1E293B"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-white font-mono-num tracking-tight">
              {overallScore}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              / 100
            </span>
          </div>
        </div>

        {/* 4 Pillar Breakdown Bars */}
        <div className="flex-1 w-full space-y-2.5">
          {/* 1. Budget Adherence */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Budget Adherence (30%)</span>
              <span className="text-slate-200 font-mono-num font-semibold">
                {components.budgetAdherence.score}/30
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(components.budgetAdherence.score / 30) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 2. Safe Cushion */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Daily Cushion (25%)</span>
              <span className="text-slate-200 font-mono-num font-semibold">
                {components.safeToSpendCushion.score}/25
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(components.safeToSpendCushion.score / 25) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 3. Commitment Coverage */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Bill Coverage (25%)</span>
              <span className="text-slate-200 font-mono-num font-semibold">
                {components.commitmentCoverage.score}/25
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(components.commitmentCoverage.score / 25) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 4. Savings Buffer */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Savings Buffer (20%)</span>
              <span className="text-slate-200 font-mono-num font-semibold">
                {components.savingsBuffer.score}/20
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(components.savingsBuffer.score / 20) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimers & Advice notice */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          Deterministic financial simulation. Not professional advice.
        </span>
        {onOpenBreakdown && (
          <button
            onClick={onOpenBreakdown}
            className="text-emerald-400 hover:underline font-medium cursor-pointer"
          >
            Audit Math
          </button>
        )}
      </div>
    </div>
  );
};
