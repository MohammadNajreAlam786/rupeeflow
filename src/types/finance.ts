// Core Finance Types for RupeeFlow

export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = 
  | 'food_dining'
  | 'transport'
  | 'entertainment'
  | 'utilities_bills'
  | 'shopping'
  | 'education'
  | 'health'
  | 'personal_care'
  | 'other';

export type IncomeCategory = 
  | 'stipend'
  | 'freelance'
  | 'allowance'
  | 'cashback'
  | 'gift'
  | 'other_income';

export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // YYYY-MM-DD
  dayInPeriod: number; // 1 to 30
  notes?: string;
  isSimulated?: boolean;
}

export type CommitmentType = 'subscription' | 'bill';
export type CommitmentStatus = 'upcoming' | 'paid' | 'cancelled';

export interface Commitment {
  id: string;
  title: string;
  amount: number;
  type: CommitmentType;
  category: ExpenseCategory;
  dueDate: string; // YYYY-MM-DD
  dueDayInPeriod: number; // 1 to 30
  status: CommitmentStatus;
  autoRenew: boolean;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: 'emergency' | 'lifestyle' | 'gadget' | 'travel' | 'education';
  targetDayInPeriod: number;
  color: string;
  icon?: string;
}

export type DecisionType = 
  | 'discretionary_purchase'
  | 'unexpected_expense'
  | 'new_income'
  | 'cancel_subscription'
  | 'savings_contribution';

export interface DecisionSimulationInput {
  type: DecisionType;
  title: string;
  amount: number;
  category?: Category;
  commitmentId?: string; // for cancel_subscription
  goalId?: string; // for savings_contribution
  operationId?: string; // idempotency key for preventing duplicate execution
}

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface HealthScoreBreakdown {
  overallScore: number; // 0 - 100
  riskLevel: RiskLevel;
  components: {
    budgetAdherence: {
      score: number; // 0 - 30
      maxScore: 30;
      ratio: number;
      label: string;
      description: string;
    };
    safeToSpendCushion: {
      score: number; // 0 - 25
      maxScore: 25;
      dailyAllowance: number;
      label: string;
      description: string;
    };
    commitmentCoverage: {
      score: number; // 0 - 25
      maxScore: 25;
      coverageRatio: number;
      label: string;
      description: string;
    };
    savingsBuffer: {
      score: number; // 0 - 20
      maxScore: 20;
      savedAmount: number;
      label: string;
      description: string;
    };
  };
  keyWarnings: string[];
  positiveHighlights: string[];
}

export interface ForecastMetrics {
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  burnRatePerDay: number; // Actual average spent per day elapsed
  idealBurnRatePerDay: number; // Initial budget / 30 = ₹333.33/day
  projectedSpendingNextDays: number;
  projectedUpcomingCommitments: number;
  projectedEndBalance: number;
  projectedDeficit: number; // >0 if projectedEndBalance < 0
  estimatedRunoutDay: number | null; // Day when cash hits 0 if deficit projected
  trajectoryLabel: 'Surplus' | 'On Track' | 'Tight' | 'Critical Shortfall';
  assumptions: string[];
}

export interface CalculatedFinancialState {
  initialBudget: number; // Default ₹10,000
  totalIncome: number; // Initial budget + added income
  totalExpenses: number; // Total actual expenses spent
  totalSavingsAllocated: number; // Sum of currentAmount in savings goals
  availableCashBalance: number; // (Initial + Income) - Expenses - SavingsAllocated
  remainingBudget: number; // Initial Budget + Income - Expenses
  reservedCommitments: number; // Sum of unpaid active commitments due in period
  paidCommitments: number; // Sum of paid commitments
  safeToSpendAmount: number; // Available Cash - Reserved Commitments
  currentDay: number; // 1 to 30
  daysRemaining: number; // 30 - currentDay + 1
  dailyAllowance: number; // SafeToSpend / daysRemaining (or 0 if negative)
  healthScore: HealthScoreBreakdown;
  forecast: ForecastMetrics;
  isDeficit: boolean;
  deficitAmount: number;
}

export interface SimulationResult {
  current: CalculatedFinancialState;
  simulated: CalculatedFinancialState;
  delta: {
    cashBalance: number;
    safeToSpend: number;
    dailyAllowance: number;
    healthScore: number;
    projectedEndBalance: number;
  };
  explanation: string;
  impactVerdict: 'Positive' | 'Manageable' | 'Risky' | 'Critical Alert';
  warnings: string[];
  affordabilityChecks: {
    commitmentsCovered: boolean;
    commitmentsRemainingShortfall: number;
    dailyAllowanceAboveMin: boolean;
    goalsImpacted: boolean;
  };
}

export interface BudgetConfig {
  initialBudget: number;
  budgetPeriodDays: number;
  currentDay: number;
  minDailySurvivalBudget: number; // e.g. ₹150/day benchmark for survival
  periodStartDate: string; // e.g. 2026-10-01
}
