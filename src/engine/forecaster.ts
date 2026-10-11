// RupeeFlow 30-Day Budget Forecast Engine
// Extrapolates spending patterns, incorporates known upcoming commitments, and projects end-of-period cash balance.

import { ForecastMetrics } from '../types/finance';

interface ForecasterInput {
  currentDay: number;
  totalDays: number;
  initialBudget: number;
  totalExpenses: number;
  availableCashBalance: number;
  reservedCommitments: number;
}

export function calculateBudgetForecast(input: ForecasterInput): ForecastMetrics {
  const {
    currentDay,
    totalDays,
    initialBudget,
    totalExpenses,
    availableCashBalance,
    reservedCommitments,
  } = input;

  const daysElapsed = Math.max(1, currentDay);
  const daysRemaining = Math.max(1, totalDays - currentDay + 1);

  // Velocity: actual average spending per elapsed day
  const burnRatePerDay = totalExpenses / daysElapsed;
  const idealBurnRatePerDay = initialBudget / totalDays; // ~ ₹333.33/day for ₹10,000 / 30

  // Projected future discretionary spending based on historical velocity
  const projectedFutureDiscretionary = Math.round(burnRatePerDay * Math.max(0, daysRemaining - 1));
  const projectedUpcomingCommitments = reservedCommitments;

  // Projected end balance = current available cash minus projected future discretionary spends minus unpaid bills
  const projectedEndBalance = Math.round(
    availableCashBalance - projectedFutureDiscretionary - projectedUpcomingCommitments
  );

  const projectedDeficit = projectedEndBalance < 0 ? Math.abs(projectedEndBalance) : 0;

  // Calculate runout day if heading toward a deficit
  let estimatedRunoutDay: number | null = null;
  if (projectedEndBalance < 0) {
    const dailyTotalDrain = burnRatePerDay + (reservedCommitments / daysRemaining);
    if (dailyTotalDrain > 0 && availableCashBalance > 0) {
      const daysUntilDepletion = availableCashBalance / dailyTotalDrain;
      estimatedRunoutDay = Math.min(totalDays, Math.max(currentDay, Math.floor(currentDay + daysUntilDepletion)));
    } else {
      estimatedRunoutDay = currentDay;
    }
  }

  // Trajectory classification
  let trajectoryLabel: ForecastMetrics['trajectoryLabel'] = 'On Track';
  if (projectedEndBalance >= 1200) {
    trajectoryLabel = 'Surplus';
  } else if (projectedEndBalance >= 200) {
    trajectoryLabel = 'On Track';
  } else if (projectedEndBalance >= 0) {
    trajectoryLabel = 'Tight';
  } else {
    trajectoryLabel = 'Critical Shortfall';
  }

  const assumptions = [
    `Historical burn rate of ₹${Math.round(burnRatePerDay)}/day continues through Day ${totalDays}.`,
    `All ${reservedCommitments > 0 ? `₹${reservedCommitments} of ` : ''}unpaid scheduled commitments will be paid in full before due dates.`,
    'Savings goal allocations remain locked and are not liquidated.',
    'No unpredicted emergency spikes or external income beyond existing transactions.',
  ];

  return {
    currentDay,
    totalDays,
    daysRemaining,
    burnRatePerDay: Math.round(burnRatePerDay),
    idealBurnRatePerDay: Math.round(idealBurnRatePerDay),
    projectedSpendingNextDays: projectedFutureDiscretionary,
    projectedUpcomingCommitments,
    projectedEndBalance,
    projectedDeficit,
    estimatedRunoutDay,
    trajectoryLabel,
    assumptions,
  };
}
