// RupeeFlow Decision Lab Simulation Engine
// Simulates what-if decisions in a pure, non-mutating sandbox.

import {
  Transaction,
  Commitment,
  SavingsGoal,
  BudgetConfig,
  DecisionSimulationInput,
  SimulationResult,
} from '../types/finance';
import { calculateFinancialState } from './calculator';
import { formatINR } from '../utils/formatters';

export function simulateFinancialDecision(
  input: DecisionSimulationInput,
  currentTransactions: Transaction[],
  currentCommitments: Commitment[],
  currentGoals: SavingsGoal[],
  config: BudgetConfig
): SimulationResult {
  const current = calculateFinancialState(
    currentTransactions,
    currentCommitments,
    currentGoals,
    config
  );

  // Clone lists for isolated hypothetical computation
  let simulatedTransactions = [...currentTransactions];
  let simulatedCommitments = [...currentCommitments];
  let simulatedGoals = [...currentGoals];

  const { type, title, amount, category, commitmentId, goalId } = input;
  const numAmount = Math.max(0, Number(amount) || 0);

  // Apply hypothetical mutation
  if (type === 'discretionary_purchase' || type === 'unexpected_expense') {
    simulatedTransactions.push({
      id: 'sim_tx_temp',
      title: title || (type === 'discretionary_purchase' ? 'Simulated Purchase' : 'Unexpected Expense'),
      amount: numAmount,
      type: 'expense',
      category: category || (type === 'discretionary_purchase' ? 'shopping' : 'health'),
      date: new Date().toISOString().split('T')[0],
      dayInPeriod: config.currentDay,
      isSimulated: true,
    });
  } else if (type === 'new_income') {
    simulatedTransactions.push({
      id: 'sim_tx_temp',
      title: title || 'Simulated Income',
      amount: numAmount,
      type: 'income',
      category: category || 'freelance',
      date: new Date().toISOString().split('T')[0],
      dayInPeriod: config.currentDay,
      isSimulated: true,
    });
  } else if (type === 'cancel_subscription') {
    if (commitmentId) {
      simulatedCommitments = simulatedCommitments.map((c) =>
        c.id === commitmentId ? { ...c, status: 'cancelled' as const } : c
      );
    }
  } else if (type === 'savings_contribution') {
    if (goalId) {
      simulatedGoals = simulatedGoals.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + numAmount } : g
      );
    } else if (simulatedGoals.length > 0) {
      // Allocate to first goal
      simulatedGoals = [
        { ...simulatedGoals[0], currentAmount: simulatedGoals[0].currentAmount + numAmount },
        ...simulatedGoals.slice(1),
      ];
    }
  }

  const simulated = calculateFinancialState(
    simulatedTransactions,
    simulatedCommitments,
    simulatedGoals,
    config
  );

  // Compute precise deltas
  const delta = {
    cashBalance: simulated.availableCashBalance - current.availableCashBalance,
    safeToSpend: simulated.safeToSpendAmount - current.safeToSpendAmount,
    dailyAllowance: simulated.dailyAllowance - current.dailyAllowance,
    healthScore: simulated.healthScore.overallScore - current.healthScore.overallScore,
    projectedEndBalance: simulated.forecast.projectedEndBalance - current.forecast.projectedEndBalance,
  };

  // Affordability analysis
  const commitmentsCovered = simulated.availableCashBalance >= simulated.reservedCommitments;
  const commitmentsRemainingShortfall = commitmentsCovered
    ? 0
    : simulated.reservedCommitments - simulated.availableCashBalance;
  const dailyAllowanceAboveMin = simulated.dailyAllowance >= config.minDailySurvivalBudget;
  const goalsImpacted = simulated.availableCashBalance < current.totalSavingsAllocated;

  const warnings: string[] = [];
  let impactVerdict: SimulationResult['impactVerdict'] = 'Manageable';

  if (simulated.availableCashBalance < 0) {
    impactVerdict = 'Critical Alert';
    warnings.push(
      `CRITICAL DEFICIT: This decision drives your wallet into the negative by ${formatINR(
        Math.abs(simulated.availableCashBalance)
      )}.`
    );
  } else if (!commitmentsCovered) {
    impactVerdict = 'Critical Alert';
    warnings.push(
      `BILL DEFAULT RISK: You won't have enough liquid cash to pay all reserved bills. Shortfall: ${formatINR(
        commitmentsRemainingShortfall
      )}.`
    );
  } else if (simulated.safeToSpendAmount <= 0) {
    impactVerdict = 'Risky';
    warnings.push(
      `Zero safe-to-spend buffer remaining. Every extra rupee spent will jeopardize your upcoming bills.`
    );
  } else if (!dailyAllowanceAboveMin && delta.dailyAllowance < 0) {
    impactVerdict = 'Risky';
    warnings.push(
      `Daily allowance drops to ${formatINR(simulated.dailyAllowance)}/day, beneath your ${formatINR(
        config.minDailySurvivalBudget
      )}/day survival threshold.`
    );
  } else if (delta.healthScore >= 0 && (type === 'new_income' || type === 'cancel_subscription')) {
    impactVerdict = 'Positive';
  } else if (delta.safeToSpend < 0) {
    impactVerdict = 'Manageable';
  }

  // Generate clear natural language explanation
  let explanation = '';
  const daysLeft = current.daysRemaining;

  if (type === 'discretionary_purchase' || type === 'unexpected_expense') {
    const isUnplanned = type === 'unexpected_expense';
    const descType = isUnplanned ? 'unexpected expense' : 'discretionary purchase';

    if (simulated.availableCashBalance < 0) {
      explanation = `Committing this ${formatINR(numAmount)} ${descType} immediately exceeds your total funds by ${formatINR(
        Math.abs(simulated.availableCashBalance)
      )}. Your daily allowance falls to ₹0/day and your health score plunges by ${Math.abs(
        delta.healthScore
      )} points.`;
    } else if (!commitmentsCovered) {
      explanation = `This ${formatINR(numAmount)} expense leaves you with only ${formatINR(
        simulated.availableCashBalance
      )}, which is insufficient to honor your ${formatINR(
        simulated.reservedCommitments
      )} in upcoming mandatory bills. You will have a ${formatINR(commitmentsRemainingShortfall)} shortfall.`;
    } else {
      explanation = `Spending ${formatINR(numAmount)} reduces your safe-to-spend pool from ${formatINR(
        current.safeToSpendAmount
      )} to ${formatINR(simulated.safeToSpendAmount)}. Over the remaining ${daysLeft} days, your daily allowance shifts from ${formatINR(
        current.dailyAllowance
      )}/day to ${formatINR(simulated.dailyAllowance)}/day (${formatINR(delta.dailyAllowance)}/day). All ${formatINR(
        simulated.reservedCommitments
      )} in upcoming bills remain 100% reserved.`;
    }
  } else if (type === 'new_income') {
    explanation = `Adding ${formatINR(numAmount)} in income expands your cash balance to ${formatINR(
      simulated.availableCashBalance
    )} and boosts your daily allowance by +${formatINR(
      delta.dailyAllowance
    )}/day (reaching ${formatINR(simulated.dailyAllowance)}/day). Your financial health improves by +${
      delta.healthScore
    } points.`;
  } else if (type === 'cancel_subscription') {
    const freedAmount = Math.abs(delta.safeToSpend);
    if (freedAmount > 0) {
      explanation = `Cancelling this subscription frees up ${formatINR(
        freedAmount
      )} in reserved funds. Your safe-to-spend capacity increases, adding +${formatINR(
        delta.dailyAllowance
      )}/day to your daily budget for the rest of the period.`;
    } else {
      explanation = `Please select an active recurring subscription to simulate the impact of unreserving its monthly charge.`;
    }
  } else if (type === 'savings_contribution') {
    explanation = `Transferring ${formatINR(numAmount)} to your savings locks it safely away from impulsive spending. Your liquid daily allowance tightens by ${formatINR(
      Math.abs(delta.dailyAllowance)
    )}/day, but your savings resilience score increases, protecting your long-term goal.`;
  }

  return {
    current,
    simulated,
    delta,
    explanation,
    impactVerdict,
    warnings,
    affordabilityChecks: {
      commitmentsCovered,
      commitmentsRemainingShortfall,
      dailyAllowanceAboveMin,
      goalsImpacted,
    },
  };
}
