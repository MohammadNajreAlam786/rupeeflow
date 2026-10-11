// RupeeFlow Centralized Financial Engine
// Single source of truth calculation engine for all metrics, balance reconciliations, and invariants.

import {
  Transaction,
  Commitment,
  SavingsGoal,
  BudgetConfig,
  CalculatedFinancialState,
} from '../types/finance';
import { calculateFinancialHealthScore } from './healthScore';
import { calculateBudgetForecast } from './forecaster';

export function calculateFinancialState(
  transactions: Transaction[],
  commitments: Commitment[],
  savingsGoals: SavingsGoal[],
  config: BudgetConfig
): CalculatedFinancialState {
  const {
    initialBudget = 10000,
    budgetPeriodDays = 30,
    currentDay = 12,
    minDailySurvivalBudget = 150,
  } = config;

  // 1. Calculate Income & Expenses
  const additionalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = initialBudget + additionalIncome;

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Savings Allocations (Allocated funds reduce liquid cash so they aren't accidentally spent)
  const totalSavingsAllocated = savingsGoals.reduce(
    (sum, g) => sum + Math.max(0, g.currentAmount),
    0
  );

  // 3. Available Cash Balance
  // Actual liquid cash in wallet/bank right now
  const availableCashBalance = totalIncome - totalExpenses - totalSavingsAllocated;

  // 4. Remaining Budget
  // Total spending capacity before hitting initial ₹10k+income budget ceiling (excluding savings lock)
  const remainingBudget = totalIncome - totalExpenses;

  // 5. Commitments Accounting
  // Active upcoming (unpaid) commitments that MUST be honored in this period
  const reservedCommitments = commitments
    .filter((c) => c.status === 'upcoming')
    .reduce((sum, c) => sum + c.amount, 0);

  const paidCommitments = commitments
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // 6. Safe-to-Spend Amount
  // Liquid cash minus reserved essential upcoming bills.
  // This is the true uncommitted discretionary pool for the rest of the month!
  const safeToSpendAmount = availableCashBalance - reservedCommitments;

  // 7. Days and Daily Allowance
  const daysRemaining = Math.max(1, budgetPeriodDays - currentDay + 1);
  const dailyAllowance = safeToSpendAmount > 0 ? safeToSpendAmount / daysRemaining : 0;

  // 8. Deficit Check
  const isDeficit = safeToSpendAmount < 0 || availableCashBalance < 0;
  const deficitAmount = isDeficit
    ? Math.abs(Math.min(availableCashBalance, safeToSpendAmount))
    : 0;

  // 9. Financial Health Score (0 - 100)
  const healthScore = calculateFinancialHealthScore({
    totalIncome,
    totalExpenses,
    availableCashBalance,
    reservedCommitments,
    safeToSpendAmount,
    totalSavingsAllocated,
    currentDay,
    totalDays: budgetPeriodDays,
    dailyAllowance,
    minDailySurvivalBudget,
  });

  // 10. Forecast Metrics
  const forecast = calculateBudgetForecast({
    currentDay,
    totalDays: budgetPeriodDays,
    initialBudget,
    totalExpenses,
    availableCashBalance,
    reservedCommitments,
  });

  return {
    initialBudget,
    totalIncome,
    totalExpenses,
    totalSavingsAllocated,
    availableCashBalance,
    remainingBudget,
    reservedCommitments,
    paidCommitments,
    safeToSpendAmount,
    currentDay,
    daysRemaining,
    dailyAllowance,
    healthScore,
    forecast,
    isDeficit,
    deficitAmount,
  };
}
