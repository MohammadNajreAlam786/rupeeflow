import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
        let borderClass = 'border-cyan-500/40 bg-[#0F172A]/95 text-slate-100';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          borderClass = 'border-emerald-500/40 bg-[#0F172A]/95 text-slate-100 shadow-glow-emerald';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          borderClass = 'border-amber-500/40 bg-[#0F172A]/95 text-slate-100 shadow-glow-amber';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          borderClass = 'border-rose-500/40 bg-[#0F172A]/95 text-slate-100 shadow-glow-rose';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${borderClass}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
