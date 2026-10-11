import React from 'react';
import { RiskLevel, CommitmentStatus } from '../../types/finance';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'indigo' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const variantClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full tracking-wide ${sizeClasses} ${variantClasses[variant] || variantClasses.slate} ${className}`}
    >
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  if (risk === 'low') {
    return (
      <Badge variant="emerald">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Low Risk
      </Badge>
    );
  }
  if (risk === 'moderate') {
    return (
      <Badge variant="amber">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Moderate Risk
      </Badge>
    );
  }
  return (
    <Badge variant="rose">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
      High Risk
    </Badge>
  );
};

export const CommitmentStatusBadge: React.FC<{ status: CommitmentStatus }> = ({ status }) => {
  if (status === 'paid') {
    return <Badge variant="emerald" size="sm">Paid</Badge>;
  }
  if (status === 'cancelled') {
    return <Badge variant="slate" size="sm">Cancelled</Badge>;
  }
  return <Badge variant="amber" size="sm">Upcoming</Badge>;
};
