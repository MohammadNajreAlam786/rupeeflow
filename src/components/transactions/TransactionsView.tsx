import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType } from '../../types/finance';
import { TransactionModal } from './TransactionModal';
import { formatINR, CATEGORY_MAP, formatDate } from '../../utils/formatters';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    config,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinance();

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc'>('day_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(q);
          const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          if (!matchTitle && !matchNotes) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'day_desc') return b.dayInPeriod - a.dayInPeriod;
        if (sortBy === 'day_asc') return a.dayInPeriod - b.dayInPeriod;
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchQuery, typeFilter, categoryFilter, sortBy]);

  // Totals in current filtered view
  const totalInflow = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(`Delete transaction "${title}"? This will recalculate all cash metrics.`)) {
      deleteTransaction(id);
    }
  };

  const handleModalSubmit = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
    } else {
      addTransaction(data);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner with Stats & CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Inflow</span>
            <div className="text-xl font-bold font-mono-num text-emerald-400 mt-1">
              +{formatINR(totalInflow)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        {/* Total Outflow */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Total Outflow</span>
            <div className="text-xl font-bold font-mono-num text-rose-400 mt-1">
              -{formatINR(totalOutflow)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Net Flow & Record CTA */}
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Recorded Transactions</span>
            <div className="text-xl font-bold font-mono-num text-white mt-1">
              {filteredTransactions.length} items
            </div>
          </div>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-glow-emerald transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="transaction-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search transactions, notes, or merchants"
            placeholder="Search transactions, notes, merchants..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800" role="group" aria-label="Filter transactions by type">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'expense'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === 'income'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Sort Selector */}
          <select
            id="transaction-sort-select"
            aria-label="Sort transactions by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'day_desc' | 'day_asc' | 'amount_desc' | 'amount_asc')}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
          >
            <option value="day_desc">Day: Latest First</option>
            <option value="day_asc">Day: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Transactions List Table */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No transactions found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records for your current filters. Try searching for something else or add a new transaction.
            </p>
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl"
            >
              Record First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3 font-medium">Timeline</th>
                  <th className="py-3 px-3 font-medium">Description</th>
                  <th className="py-3 px-3 font-medium">Category</th>
                  <th className="py-3 px-3 font-medium text-right">Amount</th>
                  <th className="py-3 px-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const meta = CATEGORY_MAP[tx.category] || CATEGORY_MAP.other;
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Timeline Day & Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono-num font-semibold text-white">
                            Day {tx.dayInPeriod}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(tx.date)}
                          </span>
                        </div>
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isExpense
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                            }`}
                          >
                            {isExpense ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-slate-200 block text-xs sm:text-sm">
                              {tx.title}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono-num font-bold text-sm">
                        <span className={isExpense ? 'text-slate-100' : 'text-emerald-400'}>
                          {isExpense ? '-' : '+'}
                          {formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tx.id, tx.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingTransaction}
        currentDay={config.currentDay}
      />
    </div>
  );
};
