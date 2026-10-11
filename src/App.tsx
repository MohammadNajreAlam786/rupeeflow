import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { DecisionLabView } from './components/decisionLab/DecisionLabView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { SavingsGoalsView } from './components/savings/SavingsGoalsView';
import { CommitmentsView } from './components/commitments/CommitmentsView';
import { InsightsView } from './components/insights/InsightsView';
import { TransactionModal } from './components/transactions/TransactionModal';

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
          {activeTab === 'dashboard' && (
            <DashboardView onOpenAddTransaction={() => setIsAddTransactionOpen(true)} />
          )}
          {activeTab === 'decisionLab' && <DecisionLabView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'savings' && <SavingsGoalsView />}
          {activeTab === 'commitments' && <CommitmentsView />}
          {activeTab === 'insights' && <InsightsView />}
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
