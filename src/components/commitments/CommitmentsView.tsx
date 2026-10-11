import React, { useState, useMemo } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  XCircle,
  Lock,
  Edit2,
  Trash2,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Commitment, CommitmentStatus } from '../../types/finance';
import { CommitmentModal } from './CommitmentModal';
import { CommitmentStatusBadge } from '../common/Badge';
import { formatINR, CATEGORY_MAP, formatDate } from '../../utils/formatters';

export const CommitmentsView: React.FC = () => {
  const {
    commitments,
    financialState,
    config,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    markCommitmentPaid,
    cancelCommitment,
  } = useFinance();

  const [statusFilter, setStatusFilter] = useState<'all' | CommitmentStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  // Filter commitments
  const filteredCommitments = useMemo(() => {
    return commitments
      .filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => a.dueDayInPeriod - b.dueDayInPeriod);
  }, [commitments, statusFilter]);

  const upcomingCount = commitments.filter((c) => c.status === 'upcoming').length;
  const paidCount = commitments.filter((c) => c.status === 'paid').length;

  const handleEdit = (com: Commitment) => {
    setEditingCommitment(com);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete commitment "${title}"?`)) {
      deleteCommitment(id);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0F172A] to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <CalendarClock className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Mandatory Commitments & Subscriptions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Upcoming bills are reserved against your liquid balance to calculate your genuine
            safe-to-spend allowance. Cancelling unused subscriptions immediately unfreezes discretionary cash.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCommitment(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-glow-indigo transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Reserved for Upcoming Bills</span>
          <div className="text-2xl font-bold font-mono-num text-indigo-400 mt-1">
            {formatINR(financialState.reservedCommitments)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {upcomingCount} pending payments locked from safe-to-spend
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Settled Bills This Period</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-400 mt-1">
            {formatINR(financialState.paidCommitments)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {paidCount} bills successfully paid and logged in ledger
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F172A] border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Bill Coverage Rating</span>
          <div className="text-2xl font-bold font-mono-num text-cyan-400 mt-1">
            {financialState.healthScore.components.commitmentCoverage.score} / 25 pts
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {financialState.healthScore.components.commitmentCoverage.label}
          </p>
        </div>
      </div>

      {/* Accounting Invariant Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">RupeeFlow Accounting Rule:</strong> Safe-to-Spend (
          {formatINR(financialState.safeToSpendAmount)}) = Available Cash ({formatINR(financialState.availableCashBalance)}) - Unpaid
          Commitments ({formatINR(financialState.reservedCommitments)}). Marking a bill as paid automatically creates an expense
          transaction in your ledger, un-reserves the commitment, and maintains complete mathematical harmony with zero double-counting.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            statusFilter === 'all'
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All ({commitments.length})
        </button>
        <button
          onClick={() => setStatusFilter('upcoming')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            statusFilter === 'upcoming'
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            statusFilter === 'paid'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Paid ({paidCount})
        </button>
        <button
          onClick={() => setStatusFilter('cancelled')}
          className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
            statusFilter === 'cancelled'
              ? 'bg-slate-700 border-slate-600 text-white'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Commitments Table */}
      <div className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800 shadow-xl overflow-hidden">
        {filteredCommitments.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No commitments match this status filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-3 font-medium">Due Timeline</th>
                  <th className="py-3 px-3 font-medium">Commitment</th>
                  <th className="py-3 px-3 font-medium">Type</th>
                  <th className="py-3 px-3 font-medium">Status</th>
                  <th className="py-3 px-3 font-medium text-right">Amount</th>
                  <th className="py-3 px-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono-num">
                {filteredCommitments.map((com) => {
                  const meta = CATEGORY_MAP[com.category] || CATEGORY_MAP.other;
                  const isUpcoming = com.status === 'upcoming';
                  const daysLeft = com.dueDayInPeriod - config.currentDay;

                  return (
                    <tr
                      key={com.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Timeline */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex flex-col font-sans">
                          <span className="font-mono-num font-semibold text-white">
                            Day {com.dueDayInPeriod}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(com.dueDate)}
                          </span>
                        </div>
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-sans font-medium text-white block text-xs sm:text-sm">
                              {com.title}
                            </span>
                            {com.notes && (
                              <span className="font-sans text-[11px] text-slate-400 line-clamp-1">
                                {com.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-sans">
                        <span className="text-slate-300 capitalize text-xs">
                          {com.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-sans">
                        <CommitmentStatusBadge status={com.status} />
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right font-bold text-sm text-white whitespace-nowrap">
                        {formatINR(com.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          {isUpcoming && (
                            <>
                              <button
                                onClick={() => markCommitmentPaid(com.id)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors flex items-center gap-1"
                                title="Mark as paid now"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </button>
                              <button
                                onClick={() => cancelCommitment(com.id)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-colors flex items-center gap-1"
                                title="Cancel subscription to free up money"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEdit(com)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(com.id, com.title)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete"
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

      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCommitment(null);
        }}
        onSubmit={(data) => {
          if (editingCommitment) {
            updateCommitment(editingCommitment.id, data);
          } else {
            addCommitment(data);
          }
        }}
        initialData={editingCommitment}
        currentDay={config.currentDay}
      />
    </div>
  );
};
