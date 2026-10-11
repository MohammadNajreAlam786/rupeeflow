import React, { useState, lazy, Suspense } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionModal } from './components/transactions/TransactionModal';

// Secondary views code-split via React.lazy to optimize initial bundle weight
const DecisionLabView = lazy(() =>
  import('./components/decisionLab/DecisionLabView').then((m) => ({ default: m.DecisionLabView }))
);
const TransactionsView = lazy(() =>
  import('./components/transactions/TransactionsView').then((m) => ({ default: m.TransactionsView }))
);
const SavingsGoalsView = lazy(() =>
  import('./components/savings/SavingsGoalsView').then((m) => ({ default: m.SavingsGoalsView }))
);
const CommitmentsView = lazy(() =>
  import('./components/commitments/CommitmentsView').then((m) => ({ default: m.CommitmentsView }))
);
const InsightsView = lazy(() =>
  import('./components/insights/InsightsView').then((m) => ({ default: m.InsightsView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[380px] text-slate-400">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      <span className="text-xs font-medium text-slate-400">Loading view...</span>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { activeTab, config, addTransaction } = useFinance();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#090D16] text-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenAddTransaction={() => setIsAddTransactionOpen(true)} />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <DashboardView onOpenAddTransaction={() => setIsAddTransactionOpen(true)} />
            )}
            <Suspense fallback={<ViewLoadingFallback />}>
              {activeTab === 'decisionLab' && <DecisionLabView />}
              {activeTab === 'transactions' && <TransactionsView />}
              {activeTab === 'savings' && <SavingsGoalsView />}
              {activeTab === 'commitments' && <CommitmentsView />}
              {activeTab === 'insights' && <InsightsView />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSubmit={addTransaction}
        currentDay={config.currentDay}
      />

      {/* Global Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}

export default App;
