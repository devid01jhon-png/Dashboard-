/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Coins, 
  Layers, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Calculator, 
  Plus,
  Compass,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCheck2,
  Lock,
  PieChart as PieIcon,
  HelpCircle
} from 'lucide-react';
import { FinanceTransaction, Vendor, Order, CompanySettings } from '../types';

// Finance Sub Sections Imports
import DashboardSection from './finance/DashboardSection';
import InvoicesSection from './finance/InvoicesSection';
import PaymentsReceiptsSection from './finance/PaymentsReceiptsSection';
import ExpenseSection from './finance/ExpenseSection';
import LedgerJournalSection from './finance/LedgerJournalSection';
import FinancialStatementsSection from './finance/FinancialStatementsSection';
import BankReconciliationSection from './finance/BankReconciliationSection';
import TaxComplianceSection from './finance/TaxComplianceSection';
import FinanceAuditSection from './finance/FinanceAuditSection';

interface FinanceModuleProps {
  transactions: FinanceTransaction[];
  vendors: Vendor[];
  orders: Order[];
  companySettings: CompanySettings;
  addTransaction: (tx: Omit<FinanceTransaction, 'id'>) => void;
  updateVendorBalance: (id: string, amount: number) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  searchQuery: string;
}

type FinanceTab = 
  | 'dashboard'
  | 'invoices'
  | 'payments'
  | 'expenses'
  | 'ledger'
  | 'statements'
  | 'reconciliation'
  | 'tax'
  | 'audit';

export default function FinanceModule({
  transactions,
  vendors,
  orders,
  companySettings,
  addTransaction,
  updateVendorBalance,
  updateOrderStatus,
  searchQuery
}: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<FinanceTab>('dashboard');

  return (
    <div className="space-y-6">
      
      {/* 1. SECTION TABS TOP SELECTION BAR */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs border-neutral-200">
        <span className="text-[10px] text-neutral-400 font-mono tracking-wider font-bold block pb-3">TTGT SOLUTIONS CORPORATE FINANCE GATEWAY</span>
        
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'dashboard' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Activity size={15} />
            <span>KPI Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'invoices' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <FileText size={15} />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'payments' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Coins size={15} />
            <span>Settlements</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'expenses' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <PieIcon size={15} />
            <span>Expenses</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'ledger' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Compass size={15} />
            <span>General Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('statements')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'statements' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Layers size={15} />
            <span>Reports (P&L)</span>
          </button>

          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'reconciliation' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <FileCheck2 size={15} />
            <span>Reconcile</span>
          </button>

          <button
            onClick={() => setActiveTab('tax')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'tax' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Building2 size={15} />
            <span>GST & Compliance</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-3 rounded-xl text-center text-xs font-bold font-mono tracking-tight border transition flex flex-col items-center justify-center space-y-1.5 ${activeTab === 'audit' ? 'bg-indigo-600 border-indigo-650 text-white shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-600'}`}
          >
            <Lock size={15} />
            <span>Audit Trail Logs</span>
          </button>

        </div>
      </div>

      {/* 2. DYNAMICALLY LOAD SELECTED COMPRESSED SUB COMPONENT */}
      <div className="animate-in fade-in duration-200">
        {activeTab === 'dashboard' && (
          <DashboardSection 
            transactions={transactions} 
            orders={orders}
            vendors={vendors}
            companySettings={companySettings}
            setCurrentSubTab={(sub) => {
              if (sub === 'gst' || sub === 'tds') {
                setActiveTab('tax');
              } else {
                setActiveTab('ledger');
              }
            }}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesSection 
            orders={orders} 
            vendors={vendors} 
            companySettings={companySettings} 
            addSalesInvoice={() => {}} 
            addPurchaseInvoice={() => {}} 
            updateOrderStatus={updateOrderStatus} 
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsReceiptsSection 
            vendors={vendors} 
            transactions={transactions} 
            addTransaction={addTransaction} 
            updateVendorBalance={updateVendorBalance} 
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseSection addTransaction={addTransaction} />
        )}

        {activeTab === 'ledger' && (
          <LedgerJournalSection 
            transactions={transactions} 
            vendors={vendors} 
            orders={orders} 
            addTransaction={addTransaction} 
          />
        )}

        {activeTab === 'statements' && (
          <FinancialStatementsSection orders={orders} transactions={transactions} />
        )}

        {activeTab === 'reconciliation' && (
          <BankReconciliationSection transactions={transactions} />
        )}

        {activeTab === 'tax' && (
          <TaxComplianceSection companySettings={companySettings} orders={orders} vendors={vendors} />
        )}

        {activeTab === 'audit' && (
          <FinanceAuditSection />
        )}
      </div>

    </div>
  );
}
