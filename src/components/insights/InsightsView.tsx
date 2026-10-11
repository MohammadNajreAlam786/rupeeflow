import React, { useMemo } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { RiskBadge } from '../common/Badge';
import { formatINR, CATEGORY_MAP } from '../../utils/formatters';

export const InsightsView: React.FC = () => {
  const {
    transactions,
    commitments,
    config,
    financialState,
  } = useFinance();

  const { forecast, healthScore } = financialState;

  // 1. Category Breakdown Data for Pie Chart
  const categoryData = useMemo(() => {
    const expensesByCategory: Record<string, number> = {};

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return Object.entries(expensesByCategory)
      .map(([cat, amount]) => {
        const catKey = cat as keyof typeof CATEGORY_MAP;
        const meta = CATEGORY_MAP[catKey] || CATEGORY_MAP.other;
        return {
          name: meta.label,
          category: cat,
          value: amount,
          color: meta.color,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // 2. 30-Day Cumulative Spending Trajectory Data
  const trajectoryChartData = useMemo(() => {
    const totalDays = config.budgetPeriodDays;
    const currentDay = config.currentDay;
    const dailyTarget = config.initialBudget / totalDays; // ~333.33/day

    // Calculate actual cumulative spending per day up to currentDay
    const dailySpendMap: Record<number, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        dailySpendMap[t.dayInPeriod] = (dailySpendMap[t.dayInPeriod] || 0) + t.amount;
      });

    const data = [];
    let runningActual = 0;
    const currentVelocity = forecast.burnRatePerDay;

    for (let day = 1; day <= totalDays; day++) {
      const targetCumulative = Math.round(dailyTarget * day);

      if (day <= currentDay) {
        runningActual += dailySpendMap[day] || 0;
        data.push({
          day: `D${day}`,
          dayNum: day,
          targetPace: targetCumulative,
          actualSpend: runningActual,
          projectedSpend: null,
        });
      } else {
        // Project forward from currentDay's actual spend
        const daysAhead = day - currentDay;
        const projectedCumulative = Math.round(
          runningActual + (currentVelocity * daysAhead)
        );

        data.push({
          day: `D${day}`,
          dayNum: day,
          targetPace: targetCumulative,
          actualSpend: null,
          projectedSpend: projectedCumulative,
        });
      }
    }

    return data;
  }, [config, transactions, forecast]);

  // Top spending category
  const topCategory = categoryData[0];
  const topCategoryPct = topCategory
    ? Math.round((topCategory.value / Math.max(1, financialState.totalExpenses)) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* 30-Day Forecast Hero Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-[#0F172A] to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-heading text-white">
                  30-Day Budget Forecast & End-of-Period Balance
                </h3>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    forecast.trajectoryLabel === 'Surplus'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : forecast.trajectoryLabel === 'On Track'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : forecast.trajectoryLabel === 'Tight'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {forecast.trajectoryLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic projection modeling burn rate velocity and mandatory bill reservations
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Projected Day-30 Cash</span>
            <div
              className={`text-2xl font-bold font-mono-num ${
                forecast.projectedEndBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatINR(forecast.projectedEndBalance)}
            </div>
          </div>
        </div>

        {/* 3 Forecast Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Current Velocity</span>
            <div className="text-base font-bold font-mono-num text-white mt-0.5">
              {formatINR(forecast.burnRatePerDay)}/day
            </div>
            <p className="text-[11px] text-slate-500">
              vs ₹{forecast.idealBurnRatePerDay}/day ideal benchmark
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Upcoming Bill Liability</span>
            <div className="text-base font-bold font-mono-num text-indigo-400 mt-0.5">
              {formatINR(forecast.projectedUpcomingCommitments)}
            </div>
            <p className="text-[11px] text-slate-500">
              Mandatory scheduled outflow
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400">Runout / Depletion Day</span>
            <div className="text-base font-bold font-mono-num text-white mt-0.5">
              {forecast.estimatedRunoutDay ? `Day ${forecast.estimatedRunoutDay} (Warning)` : 'None (Sustained)'}
            </div>
            <p className="text-[11px] text-slate-500">
              {forecast.projectedEndBalance >= 0 ? 'Comfortably covers all 30 days' : 'Capital runs dry before month end!'}
            </p>
          </div>
        </div>

        {/* Forecast Assumptions Checklist */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Transparent Mathematical Assumptions:
          </span>
          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
            {forecast.assumptions.map((assump, i) => (
              <li key={i}>{assump}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cumulative Velocity vs Benchmark Area Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white font-heading">
                30-Day Spending Trajectory vs Benchmark
              </h3>
              <p className="text-xs text-slate-400">
                Solid line: Actual spend • Dashed line: Projected trajectory • White dashed: ₹333/day ideal pace
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#10B981" stop-opacity={0.35} />
                    <stop offset="95%" stop-color="#10B981" stop-opacity={0} />
                  </linearGradient>
                  <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stop-color="#6366F1" stop-opacity={0.35} />
                    <stop offset="95%" stop-color="#6366F1" stop-opacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748B"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white mb-1.5">{label}</p>
                          {payload.map((entry, i: number) => {
                            const val = typeof entry.value === 'number' ? entry.value : 0;
                            const color = typeof entry.color === 'string' ? entry.color : '#94A3B8';
                            return (
                              <div key={i} className="flex items-center justify-between gap-3">
                                <span className="text-slate-400" style={{ color }}>
                                  {String(entry.name || '')}:
                                </span>
                                <span className="font-mono-num font-bold text-white">
                                  {formatINR(val)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Target Linear Pace */}
                <Line
                  type="monotone"
                  dataKey="targetPace"
                  name="Ideal Target Pace"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
                {/* Actual Spending */}
                <Area
                  type="monotone"
                  dataKey="actualSpend"
                  name="Actual Spent"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGradient)"
                />
                {/* Projected Trajectory */}
                <Area
                  type="monotone"
                  dataKey="projectedSpend"
                  name="Projected Burn"
                  stroke="#6366F1"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#projectedGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white font-heading">
                Outflow by Category
              </h3>
              <span className="text-xs text-slate-400 font-mono-num">
                {categoryData.length} categories
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl shadow-xl text-xs space-y-0.5">
                            <span className="font-semibold text-white">{data.name}</span>
                            <div className="font-mono-num text-emerald-400 font-bold">
                              {formatINR(data.value)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {categoryData.map((cat, i) => {
              const pct = Math.round((cat.value / Math.max(1, financialState.totalExpenses)) * 100);
              return (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-300 line-clamp-1">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono-num shrink-0">
                    <span className="font-bold text-white">{formatINR(cat.value)}</span>
                    <span className="text-slate-500 text-[11px] w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Risk Indicators & Actionable Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Indicators Audit Card */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white font-heading">
                Financial Risk Matrix & Diagnostic Flags
              </h3>
            </div>
            <RiskBadge risk={healthScore.riskLevel} />
          </div>

          <div className="space-y-3">
            {healthScore.positiveHighlights.map((hl, i) => (
              <div
                key={`pos_${i}`}
                className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{hl}</span>
              </div>
            ))}

            {healthScore.keyWarnings.map((warn, i) => (
              <div
                key={`warn_${i}`}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{warn}</span>
              </div>
            ))}

            {healthScore.keyWarnings.length === 0 && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                Zero active hazard alerts. Your budget adheres to safe parameters!
              </div>
            )}
          </div>
        </div>

        {/* Actionable Tailored Recommendations */}
        <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white font-heading">
              Actionable Gen Z Optimization Steps
            </h3>
          </div>

          <div className="space-y-3">
            {topCategory && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-white">
                  Target Top Outflow: {topCategory.name} ({topCategoryPct}% of spend)
                </span>
                <p className="text-slate-400 leading-relaxed">
                  Trimming just 15% off your {topCategory.name} category saves ~{formatINR(topCategory.value * 0.15)},
                  which can elevate your daily allowance by +{formatINR((topCategory.value * 0.15) / financialState.daysRemaining)}/day!
                </p>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-white">
                Upcoming Subscription Review ({formatINR(financialState.reservedCommitments)} reserved)
              </span>
              <p className="text-slate-400 leading-relaxed">
                You have {commitments.filter((c) => c.status === 'upcoming').length} upcoming commitments.
                Cancelling an unused subscription in the Decision Lab instantly un-reserves cash and increases safe-to-spend.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-white">
                Emergency Savings Milestone
              </span>
              <p className="text-slate-400 leading-relaxed">
                Setting aside ₹1,200 (12% of your ₹10,000 budget) maximizes your savings resilience score to a full 20/20.
                You currently have {formatINR(financialState.totalSavingsAllocated)} locked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
