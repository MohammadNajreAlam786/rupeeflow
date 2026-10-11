// Formatters and Category Metadata for RupeeFlow

import { Category, ExpenseCategory, IncomeCategory } from '../types/finance';

/**
 * Format number as Indian Rupee currency (e.g. ₹10,000 or ₹1,200.50)
 */
export function formatINR(amount: number, options?: { showDecimals?: boolean; showSign?: boolean }): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  const { showDecimals = false, showSign = false } = options || {};
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formattedNumber = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  if (isNegative) {
    return `-₹${formattedNumber}`;
  }

  if (showSign && amount > 0) {
    return `+₹${formattedNumber}`;
  }

  return `₹${formattedNumber}`;
}

/**
 * Compact Indian Rupee format (e.g., ₹10k, ₹1.5L)
 */
export function formatCompactINR(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${Math.round(abs)}`;
}

/**
 * Format date string (YYYY-MM-DD) into readable representation
 */
export function formatDate(dateStr: string, options?: { includeYear?: boolean }): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: options?.includeYear ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}

export interface CategoryMeta {
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: string;
}

export const CATEGORY_MAP: Record<Category, CategoryMeta> = {
  // Expenses
  food_dining: {
    label: 'Food & Dining',
    color: '#F97316',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    iconName: 'Utensils',
  },
  transport: {
    label: 'Transport & Commute',
    color: '#06B6D4',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    iconName: 'Car',
  },
  entertainment: {
    label: 'Entertainment & OTT',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    iconName: 'Film',
  },
  utilities_bills: {
    label: 'Utilities & Bills',
    color: '#3B82F6',
    badgeBg: 'bg-blue-500/10',
    badgeText: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    iconName: 'Zap',
  },
  shopping: {
    label: 'Shopping & Gear',
    color: '#EC4899',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    iconName: 'ShoppingBag',
  },
  education: {
    label: 'Education & Courses',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'BookOpen',
  },
  health: {
    label: 'Health & Pharmacy',
    color: '#EF4444',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    borderColor: 'border-red-500/30',
    iconName: 'HeartPulse',
  },
  personal_care: {
    label: 'Personal Care',
    color: '#14B8A6',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    iconName: 'Sparkles',
  },
  other: {
    label: 'Miscellaneous',
    color: '#64748B',
    badgeBg: 'bg-slate-500/10',
    badgeText: 'text-slate-400',
    borderColor: 'border-slate-500/30',
    iconName: 'HelpCircle',
  },
  // Income
  stipend: {
    label: 'Internship Stipend',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'Briefcase',
  },
  freelance: {
    label: 'Freelance & Side Gig',
    color: '#6366F1',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    iconName: 'Laptop',
  },
  allowance: {
    label: 'Parent Allowance',
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    iconName: 'Coins',
  },
  cashback: {
    label: 'Cashback & Rewards',
    color: '#06B6D4',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    iconName: 'Gift',
  },
  gift: {
    label: 'Gift',
    color: '#EC4899',
    badgeBg: 'bg-pink-500/10',
    badgeText: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    iconName: 'Sparkles',
  },
  other_income: {
    label: 'Other Income',
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    iconName: 'ArrowDownLeft',
  },
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'food_dining',
  'transport',
  'entertainment',
  'utilities_bills',
  'shopping',
  'education',
  'health',
  'personal_care',
  'other',
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'stipend',
  'freelance',
  'allowance',
  'cashback',
  'gift',
  'other_income',
];
