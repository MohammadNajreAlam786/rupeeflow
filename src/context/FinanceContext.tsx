// RupeeFlow Central Finance Context
// Handles persistent storage, pure state calculations, CRUD operations, and simulation commits.

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Transaction,
  Commitment,
  SavingsGoal,
  BudgetConfig,
  CalculatedFinancialState,
  DecisionSimulationInput,
} from '../types/finance';
import {
  DEFAULT_BUDGET_CONFIG,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_SAVINGS_GOALS,
} from '../data/seedData';
import { calculateFinancialState } from '../engine/calculator';

const STORAGE_KEYS = {
  TRANSACTIONS: 'rf_transactions_v1',
  COMMITMENTS: 'rf_commitments_v1',
  GOALS: 'rf_goals_v1',
  CONFIG: 'rf_config_v1',
};

export type ActiveTab =
  | 'dashboard'
  | 'decisionLab'
  | 'transactions'
  | 'savings'
  | 'commitments'
  | 'insights';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface FinanceContextType {
  // Financial Data
  transactions: Transaction[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  config: BudgetConfig;
  financialState: CalculatedFinancialState;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Transaction CRUD
  addTransaction: (data: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Commitment Management
  addCommitment: (data: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  markCommitmentPaid: (id: string) => void;
  cancelCommitment: (id: string) => void;

  // Savings Goals Management
  addSavingsGoal: (data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => boolean;
  withdrawFromGoal: (id: string, amount: number) => boolean;

  // Decision Lab
  commitDecision: (decision: DecisionSimulationInput) => void;

  // Time & Budget Settings
  setCurrentDay: (day: number) => void;
  updateConfig: (updates: Partial<BudgetConfig>) => void;
  resetDemoData: () => void;

  // Notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize State from localStorage or Seed Data with safe fallback validation
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_COMMITMENTS;
    } catch {
      return INITIAL_COMMITMENTS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [config, setConfig] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.initialBudget === 'number'
        ? parsed
        : DEFAULT_BUDGET_CONFIG;
    } catch {
      return DEFAULT_BUDGET_CONFIG;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // 2. Persist to localStorage on mutation
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to persist transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(commitments));
    } catch (e) {
      console.error('Failed to persist commitments', e);
    }
  }, [commitments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to persist savings goals', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to persist config', e);
    }
  }, [config]);

  // 3. Centralized Deterministic Financial Calculation Engine
  const financialState = useMemo(() => {
    return calculateFinancialState(transactions, commitments, savingsGoals, config);
  }, [transactions, commitments, savingsGoals, config]);

  // Toast Helpers
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastNotification['type'] = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  }, [dismissToast]);

  // Transaction Actions
  const addTransaction = useCallback((data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(
      `Added ${data.type === 'expense' ? 'expense' : 'income'}: ${data.title} (₹${data.amount})`,
      'success'
    );
  }, [showToast]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Transaction updated successfully', 'success');
  }, [showToast]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction deleted', 'info');
  }, [showToast]);

  // Commitment Actions
  const addCommitment = useCallback((data: Omit<Commitment, 'id'>) => {
    const newCom: Commitment = {
      ...data,
      id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setCommitments((prev) => [...prev, newCom]);
    showToast(`Added ${data.type}: ${data.title} (₹${data.amount})`, 'success');
  }, [showToast]);

  const updateCommitment = useCallback((id: string, updates: Partial<Commitment>) => {
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast('Commitment updated', 'success');
  }, [showToast]);

  const deleteCommitment = useCallback((id: string) => {
    setCommitments((prev) => prev.filter((c) => c.id !== id));
    showToast('Commitment removed', 'info');
  }, [showToast]);

  const markCommitmentPaid = useCallback((id: string) => {
    const item = commitments.find((c) => c.id === id);
    if (!item || item.status === 'paid') return;

    // Update commitment status to paid
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'paid' as const } : c))
    );

    // Record as real expense transaction
    const paymentTx: Transaction = {
      id: `tx_pay_${item.id}_${Date.now()}`,
      title: `${item.title} (Bill Paid)`,
      amount: item.amount,
      type: 'expense',
      category: item.category,
      date: new Date().toISOString().split('T')[0],
      dayInPeriod: config.currentDay,
      notes: `Settled commitment: ${item.title}`,
    };
    setTransactions((prev) => [paymentTx, ...prev]);
    showToast(`Paid ₹${item.amount} for ${item.title}. Safe-to-spend updated!`, 'success');
  }, [commitments, config.currentDay, showToast]);

  const cancelCommitment = useCallback((id: string) => {
    const item = commitments.find((c) => c.id === id);
    if (!item) return;

    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'cancelled' as const } : c))
    );
    showToast(`Cancelled ${item.title}. Unreserved ₹${item.amount}!`, 'info');
  }, [commitments, showToast]);

  // Savings Goals Actions
  const addSavingsGoal = useCallback((data: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: `goal_${Date.now()}`,
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
    showToast(`New savings goal created: ${data.title}`, 'success');
  }, [showToast]);

  const updateSavingsGoal = useCallback((id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
    showToast('Goal updated', 'success');
  }, [showToast]);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    showToast('Savings goal deleted. Any locked funds returned to cash balance.', 'info');
  }, [showToast]);

  const contributeToGoal = useCallback((id: string, amount: number): boolean => {
    if (amount <= 0) return false;
    if (amount > financialState.availableCashBalance) {
      showToast(
        `Insufficient liquid cash! You have ₹${Math.round(
          financialState.availableCashBalance
        )} available.`,
        'error'
      );
      return false;
    }

    let reachedTarget = false;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updatedAmount = g.currentAmount + amount;
          if (updatedAmount >= g.targetAmount && g.currentAmount < g.targetAmount) {
            reachedTarget = true;
          }
          return { ...g, currentAmount: updatedAmount };
        }
        return g;
      })
    );

    if (reachedTarget) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback
      }
      showToast(`🎯 Hurray! You reached 100% of your savings goal!`, 'success');
    } else {
      showToast(`Added ₹${amount} to savings goal!`, 'success');
    }
    return true;
  }, [financialState.availableCashBalance, showToast]);

  const withdrawFromGoal = useCallback((id: string, amount: number): boolean => {
    if (amount <= 0) return false;
    const goal = savingsGoals.find((g) => g.id === id);
    if (!goal || goal.currentAmount < amount) {
      showToast('Cannot withdraw more than what is saved in this goal.', 'error');
      return false;
    }

    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: g.currentAmount - amount } : g))
    );
    showToast(`Withdrew ₹${amount} from goal back into liquid cash.`, 'info');
    return true;
  }, [savingsGoals, showToast]);

  // Decision Lab Commit Action
  const commitDecision = useCallback((decision: DecisionSimulationInput) => {
    const { type, title, amount, category, commitmentId, goalId } = decision;
    const numAmount = Number(amount);

    // Enforce amount validation at state-change layer for non-cancellation decisions
    if (type !== 'cancel_subscription') {
      if (isNaN(numAmount) || numAmount <= 0) {
        showToast('Decision amount must be greater than ₹0 to commit.', 'warning');
        return;
      }
    }

    if (type === 'discretionary_purchase' || type === 'unexpected_expense') {
      const newTx: Transaction = {
        id: `tx_dec_${Date.now()}`,
        title: title || (type === 'discretionary_purchase' ? 'Discretionary Purchase' : 'Unexpected Expense'),
        amount: numAmount,
        type: 'expense',
        category: category || (type === 'discretionary_purchase' ? 'shopping' : 'health'),
        date: new Date().toISOString().split('T')[0],
        dayInPeriod: config.currentDay,
        notes: `Committed via Decision Lab (${type})`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Decision Committed: -₹${numAmount} logged as expense.`, 'success');
    } else if (type === 'new_income') {
      const newTx: Transaction = {
        id: `tx_dec_${Date.now()}`,
        title: title || 'New Income',
        amount: numAmount,
        type: 'income',
        category: category || 'freelance',
        date: new Date().toISOString().split('T')[0],
        dayInPeriod: config.currentDay,
        notes: 'Committed via Decision Lab (new income)',
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`Decision Committed: +₹${numAmount} added to balance.`, 'success');
    } else if (type === 'cancel_subscription') {
      if (commitmentId) {
        cancelCommitment(commitmentId);
      } else {
        showToast('Please select a valid active subscription to cancel.', 'warning');
        return;
      }
    } else if (type === 'savings_contribution') {
      const targetGoalId = goalId || savingsGoals[0]?.id;
      if (targetGoalId) {
        contributeToGoal(targetGoalId, numAmount);
      } else {
        showToast('No active savings goals found to contribute to.', 'error');
      }
    }
  }, [cancelCommitment, config.currentDay, contributeToGoal, savingsGoals, showToast]);

  // Day & Config Settings
  const setCurrentDay = useCallback((day: number) => {
    const validDay = Math.min(30, Math.max(1, day));
    setConfig((prev) => ({ ...prev, currentDay: validDay }));
  }, []);

  const updateConfig = useCallback((updates: Partial<BudgetConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
    showToast('Budget configuration updated', 'info');
  }, [showToast]);

  const resetDemoData = useCallback(() => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCommitments(INITIAL_COMMITMENTS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setConfig(DEFAULT_BUDGET_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.COMMITMENTS);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
    showToast('Demo reset to initial ₹10,000 / 30-day baseline state!', 'success');
  }, [showToast]);

  const contextValue = useMemo<FinanceContextType>(() => ({
    transactions,
    commitments,
    savingsGoals,
    config,
    financialState,
    activeTab,
    setActiveTab,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    markCommitmentPaid,
    cancelCommitment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    withdrawFromGoal,
    commitDecision,
    setCurrentDay,
    updateConfig,
    resetDemoData,
    toasts,
    showToast,
    dismissToast,
  }), [
    transactions,
    commitments,
    savingsGoals,
    config,
    financialState,
    activeTab,
    toasts,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    markCommitmentPaid,
    cancelCommitment,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    contributeToGoal,
    withdrawFromGoal,
    commitDecision,
    setCurrentDay,
    updateConfig,
    resetDemoData,
    showToast,
    dismissToast,
  ]);

  return (
    <FinanceContext.Provider value={contextValue}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
