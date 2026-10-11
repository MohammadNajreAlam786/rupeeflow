import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles, Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/Badge';
import { HealthScoreBreakdown } from '../../types/finance';
import { formatINR } from '../../utils/formatters';

interface HealthBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthScore: HealthScoreBreakdown;
}

export const HealthBreakdownModal: React.FC<HealthBreakdownModalProps> = ({
  isOpen,
  onClose,
  healthScore,
}) => {
  const { overallScore, riskLevel, components, keyWarnings, positiveHighlights } = healthScore;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Financial Health Engine & Scoring Audit"
      subtitle="Transparent, deterministic 0–100 index with weighted component math"
      maxWidth="xl"
    >
      {/* Overview Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-extrabold text-white font-mono-num">
            {overallScore}
            <span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Composite Score</span>
              <RiskBadge risk={riskLevel} />
            </div>
            <p className="text-xs text-slate-400">
              Evaluated across 4 pillars of Gen Z liquidity & safety
            </p>
          </div>
        </div>
      </div>

      {/* 4 Weighted Pillars */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-indigo-400" />
          Component Weight Breakdown
        </h4>

        {/* Pillar 1: Budget Adherence */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">
                1. Budget Adherence (Weight: 30%)
              </span>
              <p className="text-[11px] text-emerald-400 font-medium">
                {components.budgetAdherence.label}
              </p>
            </div>
            <span className="text-sm font-bold font-mono-num text-emerald-400">
              {components.budgetAdherence.score} / {components.budgetAdherence.maxScore} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${(components.budgetAdherence.score / components.budgetAdherence.maxScore) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {components.budgetAdherence.description} Measures spend burn rate against the expected
            proportional timeline benchmark.
          </p>
        </div>

        {/* Pillar 2: Safe-to-Spend Cushion */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">
                2. Safe Discretionary Cushion (Weight: 25%)
              </span>
              <p className="text-[11px] text-cyan-400 font-medium">
                {components.safeToSpendCushion.label}
              </p>
            </div>
            <span className="text-sm font-bold font-mono-num text-cyan-400">
              {components.safeToSpendCushion.score} / {components.safeToSpendCushion.maxScore} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{
                width: `${(components.safeToSpendCushion.score / components.safeToSpendCushion.maxScore) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {components.safeToSpendCushion.description} Validates whether remaining safe daily allowance (
            {formatINR(components.safeToSpendCushion.dailyAllowance)}/day) comfortably exceeds the ₹150/day survival threshold.
          </p>
        </div>

        {/* Pillar 3: Commitment Coverage */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">
                3. Mandatory Bill Coverage (Weight: 25%)
              </span>
              <p className="text-[11px] text-indigo-400 font-medium">
                {components.commitmentCoverage.label}
              </p>
            </div>
            <span className="text-sm font-bold font-mono-num text-indigo-400">
              {components.commitmentCoverage.score} / {components.commitmentCoverage.maxScore} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${(components.commitmentCoverage.score / components.commitmentCoverage.maxScore) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {components.commitmentCoverage.description} Assesses liquidity ratio against all upcoming unpaid
            recharges, bills, and subscriptions.
          </p>
        </div>

        {/* Pillar 4: Savings Buffer */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white">
                4. Savings & Emergency Reserves (Weight: 20%)
              </span>
              <p className="text-[11px] text-amber-400 font-medium">
                {components.savingsBuffer.label}
              </p>
            </div>
            <span className="text-sm font-bold font-mono-num text-amber-400">
              {components.savingsBuffer.score} / {components.savingsBuffer.maxScore} pts
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{
                width: `${(components.savingsBuffer.score / components.savingsBuffer.maxScore) * 100}%`,
              }}
            />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {components.savingsBuffer.description} Rewards setting aside 10%–15% of your total ₹10,000 monthly
            capital into emergency goals.
          </p>
        </div>
      </div>

      {/* Highlights & Warnings */}
      {(positiveHighlights.length > 0 || keyWarnings.length > 0) && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Diagnostic Flags
          </h4>
          {positiveHighlights.map((hl, idx) => (
            <div
              key={`pos_${idx}`}
              className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{hl}</span>
            </div>
          ))}
          {keyWarnings.map((warn, idx) => (
            <div
              key={`warn_${idx}`}
              className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Legal & Educational Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-500 flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Important Disclaimer:</strong> This health score and risk matrix is an automated
          mathematical model designed for student/Gen Z budget planning. It is not licensed financial or
          investment advice. Always exercise personal discretion.
        </p>
      </div>
    </Modal>
  );
};
