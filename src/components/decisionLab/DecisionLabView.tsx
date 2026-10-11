import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Zap,
  DollarSign,
  CalendarX,
  PiggyBank,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  DecisionType,
  DecisionSimulationInput,
  Category,
} from '../../types/finance';
import { simulateFinancialDecision } from '../../engine/decisionSimulator';
import { formatINR, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_MAP } from '../../utils/formatters';

export const DecisionLabView: React.FC = () => {
  const {
    transactions,
    commitments,
    savingsGoals,
    config,
    commitDecision,
    showToast,
  } = useFinance();

  // Simulation Form State
  const [decisionType, setDecisionType] = useState<DecisionType>('discretionary_purchase');
  const [amount, setAmount] = useState<number>(1500);
  const [title, setTitle] = useState<string>('Weekend Concert & Dinner');
  const [selectedCategory, setSelectedCategory] = useState<Category>('shopping');
  const [selectedCommitmentId, setSelectedCommitmentId] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string | null>(null);

  // Active upcoming commitments eligible for cancellation
  const activeSubs = commitments.filter((c) => c.status === 'upcoming');

  // Realistic Gen Z Preset Scenarios
  const PRESETS = [
    {
      label: 'Concert Ticket (₹1,500)',
      type: 'discretionary_purchase' as DecisionType,
      amount: 1500,
      title: 'Weekend Music Concert Pass',
      category: 'entertainment' as Category,
    },
    {
      label: 'Freelance UI Gig (+₹3,000)',
      type: 'new_income' as DecisionType,
      amount: 3000,
      title: 'Freelance Landing Page Contract',
      category: 'freelance' as Category,
    },
    {
      label: 'Cancel Gym Pass (-₹800)',
      type: 'cancel_subscription' as DecisionType,
      amount: 800,
      title: 'Cancel Campus Gym Pass',
      category: 'health' as Category,
      commitmentId: activeSubs.find((c) => c.title.toLowerCase().includes('gym'))?.id || activeSubs[0]?.id || '',
    },
    {
      label: 'Emergency Screen Fix (₹1,800)',
      type: 'unexpected_expense' as DecisionType,
      amount: 1800,
      title: 'Smartphone Screen Glass Replacement',
      category: 'shopping' as Category,
    },
    {
      label: 'Save for Goa (+₹500)',
      type: 'savings_contribution' as DecisionType,
      amount: 500,
      title: 'Deposit to Goa Trip',
      goalId: savingsGoals[1]?.id || savingsGoals[0]?.id,
    },
  ];

  // Pure isolated simulation execution (never mutates persisted state!)
  const simulationInput: DecisionSimulationInput = useMemo(() => {
    return {
      type: decisionType,
      title,
      amount: Number(amount) || 0,
      category: selectedCategory,
      commitmentId: decisionType === 'cancel_subscription' ? (selectedCommitmentId || undefined) : undefined,
      goalId: decisionType === 'savings_contribution' ? (selectedGoalId || savingsGoals[0]?.id) : undefined,
    };
  }, [decisionType, title, amount, selectedCategory, selectedCommitmentId, selectedGoalId, savingsGoals]);

  const simulation = useMemo(() => {
    return simulateFinancialDecision(
      simulationInput,
      transactions,
      commitments,
      savingsGoals,
      config
    );
  }, [simulationInput, transactions, commitments, savingsGoals, config]);

  const { current, simulated, delta, explanation, impactVerdict, warnings, affordabilityChecks } = simulation;

  // Validation for committing decisions
  const isSubscriptionCancel = decisionType === 'cancel_subscription';
  const isSubscriptionValid = isSubscriptionCancel
    ? Boolean(selectedCommitmentId && activeSubs.some((s) => s.id === selectedCommitmentId))
    : true;
  const isAmountValid = isSubscriptionCancel
    ? isSubscriptionValid
    : typeof amount === 'number' && !isNaN(amount) && amount > 0;

  const validationMessage = useMemo(() => {
    if (isSubscriptionCancel && !selectedCommitmentId) {
      return 'Select an active subscription to calculate savings and commit cancellation.';
    }
    if (!isSubscriptionCancel && (!amount || amount <= 0)) {
      return 'Enter a positive amount greater than ₹0 to simulate and commit this decision.';
    }
    return null;
  }, [isSubscriptionCancel, selectedCommitmentId, amount]);

  // Handle Preset Click
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setSelectedPresetLabel(preset.label);
    setDecisionType(preset.type);
    setTitle(preset.title);
    if (preset.type === 'cancel_subscription') {
      const targetSub = activeSubs.find((c) => c.id === preset.commitmentId) || activeSubs[0];
      if (targetSub) {
        setSelectedCommitmentId(targetSub.id);
        setAmount(targetSub.amount);
        setTitle(`Cancel ${targetSub.title}`);
      } else {
        setSelectedCommitmentId('');
        setAmount(0);
      }
    } else {
      setAmount(preset.amount);
      if (preset.category) setSelectedCategory(preset.category);
      if (preset.goalId) setSelectedGoalId(preset.goalId);
    }
  };

  // Synchronized decision type switcher
  const handleSelectDecisionType = (type: DecisionType) => {
    setSelectedPresetLabel(null);
    setDecisionType(type);
    if (type === 'cancel_subscription') {
      if (selectedCommitmentId) {
        const found = activeSubs.find((s) => s.id === selectedCommitmentId);
        if (found) {
          setAmount(found.amount);
          setTitle(`Cancel ${found.title}`);
        }
      } else {
        setAmount(0);
        setTitle('Cancel Subscription');
      }
    } else if (type === 'savings_contribution') {
      if (!selectedGoalId && savingsGoals.length > 0) {
        setSelectedGoalId(savingsGoals[0].id);
      }
      if (amount <= 0) setAmount(500);
      setTitle('Deposit to Savings Goal');
    } else {
      if (amount <= 0) setAmount(1500);
      setTitle(type === 'new_income' ? 'Freelance Gig Contract' : 'Weekend Concert & Dinner');
    }
  };

  // Synchronized subscription select handler
  const handleSelectSubscription = (subId: string) => {
    setSelectedPresetLabel(null);
    setSelectedCommitmentId(subId);
    const found = activeSubs.find((c) => c.id === subId);
    if (found) {
      setAmount(found.amount);
      setTitle(`Cancel ${found.title}`);
    } else {
      setAmount(0);
      setTitle('Cancel Subscription');
    }
  };

  // Commit decision into live state
  const handleCommit = () => {
    if (!isAmountValid) return;
    commitDecision(simulationInput);
    // Reset to clean default state
    setDecisionType('discretionary_purchase');
    setAmount(1500);
    setTitle('Weekend Concert & Dinner');
    setSelectedCategory('shopping');
    setSelectedCommitmentId('');
    setSelectedGoalId('');
    setSelectedPresetLabel(null);
  };

  // Reset simulation sandbox to initial default state
  const handleResetSandbox = () => {
    setDecisionType('discretionary_purchase');
    setAmount(1500);
    setTitle('Weekend Concert & Dinner');
    setSelectedCategory('shopping');
    setSelectedCommitmentId('');
    setSelectedGoalId('');
    setSelectedPresetLabel(null);
    showToast('Decision Lab sandbox restored to default hypothetical scenario', 'info');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Simulation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-[#0F172A] to-purple-950/40 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <FlaskConical className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
                Hypothetical Decision Sandbox
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Test your financial moves risk-free. See real-time mathematical impacts on safe-to-spend, daily
              allowance, bill affordability, and financial health <em>before</em> spending a single rupee.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSandbox}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick Gen Z Scenarios:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map((preset, idx) => {
            const isSelected = selectedPresetLabel === preset.label;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all shadow-sm ${
                  isSelected
                    ? 'bg-indigo-600/25 border-indigo-400 text-white font-semibold ring-1 ring-indigo-400/40 shadow-glow-indigo'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Inputs vs Real-time Simulation Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Decision Parameters Configurator (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-5">
          <h3 className="text-base font-semibold text-white font-heading">
            1. Configure Hypothetical Decision
          </h3>

          {/* Decision Type Picker */}
          <div>
            <span id="decision-type-group-label" className="block text-xs font-medium text-slate-400 mb-2">
              Decision Category
            </span>
            <div role="group" aria-labelledby="decision-type-group-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectDecisionType('discretionary_purchase')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2 ${
                  decisionType === 'discretionary_purchase'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Discretionary Spend</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecisionType('unexpected_expense')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2 ${
                  decisionType === 'unexpected_expense'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Unexpected Emergency</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecisionType('new_income')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2 ${
                  decisionType === 'new_income'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>New Income / Gig</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecisionType('cancel_subscription')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2 ${
                  decisionType === 'cancel_subscription'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarX className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Cancel Subscription</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecisionType('savings_contribution')}
                className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2 sm:col-span-2 ${
                  decisionType === 'savings_contribution'
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <PiggyBank className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Lock into Savings Goal</span>
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="decision-amount-input" className="text-xs font-medium text-slate-400">
                Decision Amount (₹)
              </label>
              <span className="text-xs font-mono-num font-bold text-white">
                {formatINR(amount)}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-base font-semibold">
                ₹
              </span>
              <input
                id="decision-amount-input"
                type="number"
                min="0"
                step="50"
                value={amount}
                disabled={decisionType === 'cancel_subscription'}
                onChange={(e) => {
                  setSelectedPresetLabel(null);
                  setAmount(Math.max(0, Number(e.target.value)));
                }}
                className={`w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num font-bold text-lg focus:outline-none focus:border-indigo-500 transition-colors ${
                  decisionType === 'cancel_subscription' ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                placeholder="1500"
              />
            </div>

            {/* Quick Amount Adjust Steppers */}
            {decisionType !== 'cancel_subscription' ? (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[200, 500, 1000, 2000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      setSelectedPresetLabel(null);
                      setAmount((prev) => (prev || 0) + step);
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-num transition-colors"
                  >
                    +{step}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPresetLabel(null);
                    setAmount(500);
                  }}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1.5">
                Amount is automatically synchronized to the chosen subscription&apos;s cost.
              </p>
            )}
          </div>

          {/* Description Title */}
          <div>
            <label htmlFor="decision-title-input" className="block text-xs font-medium text-slate-400 mb-1.5">
              Decision Note / Context
            </label>
            <input
              id="decision-title-input"
              type="text"
              value={title}
              onChange={(e) => {
                setSelectedPresetLabel(null);
                setTitle(e.target.value);
              }}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="e.g. Weekend PVR movie or Swiggy treat"
            />
          </div>

          {/* Context-Specific Target Pickers */}
          {decisionType === 'cancel_subscription' && (
            <div>
              <label htmlFor="decision-subscription-select" className="block text-xs font-medium text-slate-400 mb-1.5">
                Select Active Subscription to Cancel
              </label>
              <select
                id="decision-subscription-select"
                value={selectedCommitmentId}
                onChange={(e) => handleSelectSubscription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose active subscription to cancel --</option>
                {activeSubs.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title} ({formatINR(sub.amount)}) — Due Day {sub.dueDayInPeriod}
                  </option>
                ))}
              </select>
            </div>
          )}

          {decisionType === 'savings_contribution' && (
            <div>
              <label htmlFor="decision-goal-select" className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Savings Goal
              </label>
              <select
                id="decision-goal-select"
                value={selectedGoalId}
                onChange={(e) => {
                  setSelectedPresetLabel(null);
                  setSelectedGoalId(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {savingsGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} (Currently {formatINR(g.currentAmount)} / {formatINR(g.targetAmount)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {(decisionType === 'discretionary_purchase' || decisionType === 'unexpected_expense') && (
            <div>
              <label htmlFor="decision-expense-category-select" className="block text-xs font-medium text-slate-400 mb-1.5">
                Expense Category
              </label>
              <select
                id="decision-expense-category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedPresetLabel(null);
                  setSelectedCategory(e.target.value as Category);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_MAP[cat]?.label || cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {decisionType === 'new_income' && (
            <div>
              <label htmlFor="decision-income-category-select" className="block text-xs font-medium text-slate-400 mb-1.5">
                Income Category
              </label>
              <select
                id="decision-income-category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedPresetLabel(null);
                  setSelectedCategory(e.target.value as Category);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {INCOME_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_MAP[cat]?.label || cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Column: Live Before-and-After Analysis Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Consequence Narrative & Verdict Card */}
          <div
            className={`p-6 rounded-2xl border transition-all ${
              impactVerdict === 'Critical Alert'
                ? 'bg-rose-950/30 border-rose-500/50 shadow-glow-rose'
                : impactVerdict === 'Risky'
                ? 'bg-amber-950/30 border-amber-500/50 shadow-glow-amber'
                : impactVerdict === 'Positive'
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-glow-emerald'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Deterministic Impact Analysis
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Preview Only • Ledger Unchanged
                </span>
              </div>

              {/* Verdict Pill */}
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                  impactVerdict === 'Critical Alert'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : impactVerdict === 'Risky'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : impactVerdict === 'Positive'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                }`}
              >
                {impactVerdict === 'Critical Alert' && <AlertCircle className="w-3.5 h-3.5" />}
                {impactVerdict === 'Risky' && <AlertTriangle className="w-3.5 h-3.5" />}
                {impactVerdict === 'Positive' && <TrendingUp className="w-3.5 h-3.5" />}
                {impactVerdict === 'Manageable' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {impactVerdict}
              </span>
            </div>

            {/* Clear Narrative Explanation */}
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {explanation}
            </p>

            {/* Specific Warning Callouts */}
            {warnings.length > 0 && (
              <div className="mt-4 space-y-2 pt-3 border-t border-slate-800">
                {warnings.map((warn, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs font-semibold text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Before vs After Metric Comparison Grid */}
          <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              2. Real-Time Before vs After Comparison
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-medium">Financial Metric</th>
                    <th className="py-2.5 font-medium">Current State</th>
                    <th className="py-2.5 font-medium text-center"></th>
                    <th className="py-2.5 font-medium">Hypothetical</th>
                    <th className="py-2.5 font-medium text-right">Net Impact (Delta)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono-num">
                  {/* Row 1: Available Cash Balance */}
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">
                      Available Cash
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatINR(current.availableCashBalance)}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td
                      className={`py-3 font-bold ${
                        simulated.availableCashBalance < 0 ? 'text-rose-400' : 'text-white'
                      }`}
                    >
                      {formatINR(simulated.availableCashBalance)}
                    </td>
                    <td
                      className={`py-3 font-bold text-right ${
                        delta.cashBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(delta.cashBalance, { showSign: true })}
                    </td>
                  </tr>

                  {/* Row 2: Safe-to-Spend Pool */}
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">
                      Safe-to-Spend Pool
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatINR(current.safeToSpendAmount)}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td
                      className={`py-3 font-bold ${
                        simulated.safeToSpendAmount < 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatINR(simulated.safeToSpendAmount)}
                    </td>
                    <td
                      className={`py-3 font-bold text-right ${
                        delta.safeToSpend >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(delta.safeToSpend, { showSign: true })}
                    </td>
                  </tr>

                  {/* Row 3: Daily Allowance */}
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">
                      Daily Allowance
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatINR(current.dailyAllowance)}/d
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td
                      className={`py-3 font-bold ${
                        simulated.dailyAllowance < config.minDailySurvivalBudget
                          ? 'text-amber-400'
                          : 'text-white'
                      }`}
                    >
                      {formatINR(simulated.dailyAllowance)}/d
                    </td>
                    <td
                      className={`py-3 font-bold text-right ${
                        delta.dailyAllowance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(delta.dailyAllowance, { showSign: true })}/d
                    </td>
                  </tr>

                  {/* Row 4: Health Score */}
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">
                      Financial Health Score
                    </td>
                    <td className="py-3 text-slate-400">
                      {current.healthScore.overallScore}/100
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td className="py-3 font-bold text-white">
                      {simulated.healthScore.overallScore}/100
                    </td>
                    <td
                      className={`py-3 font-bold text-right ${
                        delta.healthScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {delta.healthScore >= 0 ? `+${delta.healthScore}` : delta.healthScore} pts
                    </td>
                  </tr>

                  {/* Row 5: Projected End Balance */}
                  <tr>
                    <td className="py-3 font-sans font-medium text-slate-300">
                      Projected Month-End Cash
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatINR(current.forecast.projectedEndBalance)}
                    </td>
                    <td className="py-3 text-center text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                    </td>
                    <td
                      className={`py-3 font-bold ${
                        simulated.forecast.projectedEndBalance < 0
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {formatINR(simulated.forecast.projectedEndBalance)}
                    </td>
                    <td
                      className={`py-3 font-bold text-right ${
                        delta.projectedEndBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatINR(delta.projectedEndBalance, { showSign: true })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Affordability Checklist */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Safety & Affordability Check
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Check 1: Commitments */}
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  affordabilityChecks.commitmentsCovered
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {affordabilityChecks.commitmentsCovered ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>
                  {affordabilityChecks.commitmentsCovered
                    ? 'All Bills Covered'
                    : `Bills Shortfall (${formatINR(affordabilityChecks.commitmentsRemainingShortfall)})`}
                </span>
              </div>

              {/* Check 2: Minimum Survival Allowance */}
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                  affordabilityChecks.dailyAllowanceAboveMin
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                {affordabilityChecks.dailyAllowanceAboveMin ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  {affordabilityChecks.dailyAllowanceAboveMin
                    ? 'Above ₹150/d Baseline'
                    : 'Below Survival Baseline'}
                </span>
              </div>

              {/* Check 3: Savings Goals */}
              <div className="p-2.5 rounded-lg border bg-indigo-500/10 border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Goals Untouched</span>
              </div>
            </div>
          </div>

          {/* Action Execution Footer: Commit vs Cancel */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-white">Ready to enact this decision?</span>
              <p className="text-[11px] text-slate-400">
                Committing permanently records this in your active ledger or updates your commitments.
              </p>
              {validationMessage && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>{validationMessage}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetSandbox}
                className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel / Revert
              </button>

              <button
                type="button"
                onClick={handleCommit}
                disabled={!isAmountValid}
                className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isAmountValid
                    ? 'text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-glow-emerald cursor-pointer'
                    : 'text-slate-500 bg-slate-800 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
                aria-disabled={!isAmountValid}
              >
                <Check className="w-4 h-4" />
                <span>Commit Decision</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
