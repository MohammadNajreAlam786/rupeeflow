// RupeeFlow Deterministic Financial Health Score Engine
// 0 - 100 score with documented, auditable components and risk levels.
// NOTE: Disclaimer - This algorithm is a deterministic personal finance model and does not constitute registered financial advice.

import { HealthScoreBreakdown, RiskLevel } from '../types/finance';

interface HealthScoreInput {
  totalIncome: number;
  totalExpenses: number;
  availableCashBalance: number;
  reservedCommitments: number;
  safeToSpendAmount: number;
  totalSavingsAllocated: number;
  currentDay: number;
  totalDays: number;
  dailyAllowance: number;
  minDailySurvivalBudget: number;
}

export function calculateFinancialHealthScore(input: HealthScoreInput): HealthScoreBreakdown {
  const {
    totalIncome,
    totalExpenses,
    availableCashBalance,
    reservedCommitments,
    safeToSpendAmount,
    totalSavingsAllocated,
    currentDay,
    totalDays,
    dailyAllowance,
    minDailySurvivalBudget,
  } = input;

  const keyWarnings: string[] = [];
  const positiveHighlights: string[] = [];

  // 1. Budget Adherence (Weight: 30%)
  // Measures spending pace relative to days elapsed in the 30-day cycle.
  const expectedPaceRatio = currentDay / totalDays;
  const expectedSpendAtCurrentDay = totalIncome * expectedPaceRatio;
  const actualSpendRatio = expectedSpendAtCurrentDay > 0 ? totalExpenses / expectedSpendAtCurrentDay : 1;

  let budgetScore = 0;
  let budgetLabel = '';
  let budgetDesc = '';

  if (actualSpendRatio <= 0.85) {
    budgetScore = 30;
    budgetLabel = 'Under Budget (Exceptional)';
    budgetDesc = `You've spent ${Math.round(actualSpendRatio * 100)}% of your expected day-${currentDay} allocation. Great pacing!`;
    positiveHighlights.push('Pacing well below daily benchmark');
  } else if (actualSpendRatio <= 1.0) {
    budgetScore = 26;
    budgetLabel = 'On Track (Optimal)';
    budgetDesc = `Spending is aligned with expected pace for Day ${currentDay} of ${totalDays}.`;
    positiveHighlights.push('Spending pace perfectly on schedule');
  } else if (actualSpendRatio <= 1.2) {
    budgetScore = 18;
    budgetLabel = 'Mild Overspending';
    budgetDesc = `Spent ${(actualSpendRatio * 100).toFixed(0)}% of expected benchmark for day ${currentDay}. Slow down discretionary spends.`;
    keyWarnings.push('Spending is slightly ahead of expected 30-day velocity');
  } else if (actualSpendRatio <= 1.5) {
    budgetScore = 10;
    budgetLabel = 'Accelerated Burn Rate';
    budgetDesc = `Significant overspending (${(actualSpendRatio * 100).toFixed(0)}% of benchmark). High risk of month-end crunch.`;
    keyWarnings.push('High spending velocity: running out of budget before month end');
  } else {
    budgetScore = 4;
    budgetLabel = 'Critical Overrun';
    budgetDesc = `Budget severely depleted for Day ${currentDay}. Immediate austerity needed.`;
    keyWarnings.push('Budget severely exhausted relative to days remaining');
  }

  // 2. Safe-to-Spend Cushion & Daily Allowance (Weight: 25%)
  // Evaluates whether daily allowance can comfortably sustain lifestyle vs minimum survival threshold.
  let safeScore = 0;
  let safeLabel = '';
  let safeDesc = '';

  if (safeToSpendAmount <= 0) {
    safeScore = 0;
    safeLabel = 'Safe-to-Spend Deficit';
    safeDesc = 'All available cash is already locked for bills or in deficit. Zero safe discretionary spending.';
    keyWarnings.push('Zero safe-to-spend: future commitments exceed available cash');
  } else if (dailyAllowance >= minDailySurvivalBudget * 2.2) {
    safeScore = 25;
    safeLabel = 'Abundant Cushion';
    safeDesc = `Safe daily allowance is ₹${Math.round(dailyAllowance)}/day, more than 2x your ₹${minDailySurvivalBudget}/day baseline.`;
    positiveHighlights.push(`Robust ₹${Math.round(dailyAllowance)}/day discretionary cushion`);
  } else if (dailyAllowance >= minDailySurvivalBudget * 1.5) {
    safeScore = 20;
    safeLabel = 'Comfortable Allowance';
    safeDesc = `Safe daily allowance is ₹${Math.round(dailyAllowance)}/day, providing a healthy breathing room.`;
    positiveHighlights.push('Comfortable daily discretionary margin');
  } else if (dailyAllowance >= minDailySurvivalBudget) {
    safeScore = 14;
    safeLabel = 'Adequate Allowance';
    safeDesc = `Safe daily allowance is ₹${Math.round(dailyAllowance)}/day, just above your ₹${minDailySurvivalBudget} minimum baseline.`;
  } else if (dailyAllowance > 0) {
    safeScore = 6;
    safeLabel = 'Squeezed Allowance';
    safeDesc = `Allowance is ₹${Math.round(dailyAllowance)}/day, falling below your ₹${minDailySurvivalBudget}/day survival floor.`;
    keyWarnings.push(`Daily allowance is restricted below ₹${minDailySurvivalBudget}/day floor`);
  } else {
    safeScore = 0;
    safeLabel = 'Exhausted Allowance';
    safeDesc = 'No daily allowance remaining.';
    keyWarnings.push('No discretionary spending room left');
  }

  // 3. Commitment Coverage (Weight: 25%)
  // Can available cash comfortably honor all upcoming unpaid commitments (rent share, Wi-Fi, recharge)?
  let commitmentScore = 0;
  let commitmentLabel = '';
  let commitmentDesc = '';
  const coverageRatio = reservedCommitments > 0 ? availableCashBalance / reservedCommitments : 2.5;

  if (reservedCommitments === 0) {
    commitmentScore = 25;
    commitmentLabel = 'Fully Covered (No Pending Bills)';
    commitmentDesc = 'All monthly subscriptions and bills for this period are settled.';
    positiveHighlights.push('All period commitments settled or zero pending');
  } else if (availableCashBalance < reservedCommitments) {
    commitmentScore = Math.max(0, Math.round((availableCashBalance / reservedCommitments) * 10));
    commitmentLabel = 'Bill Default Risk';
    commitmentDesc = `Available cash (₹${Math.round(availableCashBalance)}) cannot cover upcoming bills (₹${reservedCommitments}). Shortfall of ₹${Math.round(reservedCommitments - availableCashBalance)}.`;
    keyWarnings.push(`Bill shortfall: ₹${Math.round(reservedCommitments - availableCashBalance)} required to avoid unpaid bills`);
  } else if (coverageRatio >= 2.0) {
    commitmentScore = 25;
    commitmentLabel = 'Rock-Solid Bill Reserve (200%+)';
    commitmentDesc = `Available cash covers upcoming commitments ${coverageRatio.toFixed(1)}x over.`;
    positiveHighlights.push('Upcoming commitments 100% secured with healthy buffer');
  } else if (coverageRatio >= 1.3) {
    commitmentScore = 21;
    commitmentLabel = 'Fully Secured (130%+)';
    commitmentDesc = `Upcoming commitments are fully reserved with a moderate buffer.`;
    positiveHighlights.push('All upcoming commitments fully covered');
  } else {
    commitmentScore = 15;
    commitmentLabel = 'Barely Covered (Tight Buffer)';
    commitmentDesc = 'Upcoming bills can be paid, but will consume almost all remaining cash.';
    keyWarnings.push('Upcoming bills will absorb nearly all remaining cash');
  }

  // 4. Savings & Emergency Buffer (Weight: 20%)
  // Gen Z rule: having ₹1,000 - ₹1,500 safely set aside from a ₹10,000 budget builds true resilience.
  let savingsScore = 0;
  let savingsLabel = '';
  let savingsDesc = '';
  const savingsTargetBaseline = totalIncome * 0.12; // 12% target baseline (₹1,200)

  if (totalSavingsAllocated >= savingsTargetBaseline * 1.25) {
    savingsScore = 20;
    savingsLabel = 'Supercharged Reserves';
    savingsDesc = `₹${Math.round(totalSavingsAllocated)} safely tucked into goals (over ${(savingsTargetBaseline * 1.25).toFixed(0)} target).`;
    positiveHighlights.push(`Exceptional savings cushion: ₹${Math.round(totalSavingsAllocated)} reserved`);
  } else if (totalSavingsAllocated >= savingsTargetBaseline) {
    savingsScore = 17;
    savingsLabel = 'Target Met (12%+ Saved)';
    savingsDesc = `₹${Math.round(totalSavingsAllocated)} in goals achieves the 10-12% Gen Z savings milestone.`;
    positiveHighlights.push('Target 10%+ savings milestone maintained');
  } else if (totalSavingsAllocated >= 500) {
    savingsScore = 12;
    savingsLabel = 'Moderate Cushion';
    savingsDesc = `₹${Math.round(totalSavingsAllocated)} saved. Good start, aim for ₹1,200 for maximum score.`;
  } else if (totalSavingsAllocated > 0) {
    savingsScore = 7;
    savingsLabel = 'Minimal Reserves';
    savingsDesc = `₹${Math.round(totalSavingsAllocated)} in goals. Limited defense against emergencies.`;
    keyWarnings.push('Low emergency buffer: less than ₹500 saved');
  } else {
    savingsScore = 2;
    savingsLabel = 'Zero Savings';
    savingsDesc = 'No funds allocated to savings goals or emergency reserves.';
    keyWarnings.push('Zero emergency savings allocated');
  }

  const overallScore = Math.min(100, Math.max(0, budgetScore + safeScore + commitmentScore + savingsScore));

  let riskLevel: RiskLevel = 'low';
  if (overallScore < 50 || availableCashBalance <= 0 || safeToSpendAmount < 0) {
    riskLevel = 'high';
  } else if (overallScore < 75) {
    riskLevel = 'moderate';
  } else {
    riskLevel = 'low';
  }

  return {
    overallScore,
    riskLevel,
    components: {
      budgetAdherence: {
        score: budgetScore,
        maxScore: 30,
        ratio: actualSpendRatio,
        label: budgetLabel,
        description: budgetDesc,
      },
      safeToSpendCushion: {
        score: safeScore,
        maxScore: 25,
        dailyAllowance,
        label: safeLabel,
        description: safeDesc,
      },
      commitmentCoverage: {
        score: commitmentScore,
        maxScore: 25,
        coverageRatio,
        label: commitmentLabel,
        description: commitmentDesc,
      },
      savingsBuffer: {
        score: savingsScore,
        maxScore: 20,
        savedAmount: totalSavingsAllocated,
        label: savingsLabel,
        description: savingsDesc,
      },
    },
    keyWarnings,
    positiveHighlights,
  };
}
