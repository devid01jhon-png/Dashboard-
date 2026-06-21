/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  TrendingUp, 
  Download, 
  PieChart as PieIcon, 
  Paperclip, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ExpenseSectionProps {
  addTransaction: (tx: any) => void;
}

export default function ExpenseSection({ addTransaction }: ExpenseSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([
    { id: 'EXP-10492', date: '2026-06-05', category: 'Salary', amount: 325000, description: 'May payroll disbursements for warehouse staff', approval: 'Approved', auditor: 'Meera Iyer', file: 'salary_sheet_may.pdf' },
    { id: 'EXP-10493', date: '2026-06-10', category: 'Rent', amount: 85000, description: 'Warehouse space rent suite Kanjurmarg', approval: 'Approved', auditor: 'Meera Iyer', file: 'rent_agreement_verified.pdf' },
    { id: 'EXP-10494', date: '2026-06-15', category: 'Marketing', amount: 45000, description: 'Amazon Sponsored ads optimization campaigns', approval: 'Pending Approval', auditor: 'Pending', file: 'amazon_payout_ads.png' },
    { id: 'EXP-10495', date: '2026-06-19', category: 'Courier Charges', amount: 24200, description: 'DTDC bulk logistics services invoice', approval: 'Approved', auditor: 'Meera Iyer', file: 'dtdc_inv_948.pdf' },
    { id: 'EXP-10496', date: '2026-06-20', category: 'Electricity', amount: 15400, description: 'MSEB commercial power supply units', approval: 'Pending Approval', auditor: 'Pending', file: 'mseb_bill_jun.pdf' }
  ]);

  // Add Item Fields
  const [newCat, setNewCat] = useState('Office Expenses');
  const [newAmt, setNewAmt] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [newFile, setNewFile] = useState<string>('');

  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Group Expenses by Category
  const expenseSummary = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(expenseSummary).map(key => ({
    name: key,
    value: expenseSummary[key]
  }));

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#6366f1'];

  const categoryLists = [
    'Office Expenses', 'Salary', 'Rent', 'Courier Charges', 'Packing Material',
    'Marketing', 'Software Subscription', 'Electricity', 'Internet', 'Travel', 'Miscellaneous'
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAmt <= 0 || !newDesc) {
      alert('Kindly outline a real amount and description details!');
      return;
    }

    const item = {
      id: `EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split('T')[0],
      category: newCat,
      amount: newAmt,
      description: newDesc,
      approval: 'Pending Approval',
      auditor: 'Pending',
      file: newFile ? 'attached_invoice_bill.pdf' : ''
    };

    setExpenses([item, ...expenses]);
    setShowAddForm(false);
    setNewAmt(0);
    setNewDesc('');
    setNewFile('');

    alert(`Corporate expense voucher ${item.id} submitted for auditing approval!`);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        alert(`Expense ${exp.id} approved! Deducting funds from cash accounts & recording in General Ledger ledger.`);
        // Record in transaction cashbook state
        addTransaction({
          date: new Date().toISOString().split('T')[0],
          referenceNo: exp.id,
          type: 'Payment Out',
          partyName: `Corporate Expense (${exp.category})`,
          amount: exp.amount,
          taxAmount: exp.amount * 0.18, // 18% Dynamic tax approximation
          description: exp.description,
          status: 'Paid'
        });
        return { ...exp, approval: 'Approved', auditor: 'Meera Iyer' };
      }
      return exp;
    }));
  };

  const handleRejectExpense = (id: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        alert(`Expense request ${exp.id} marked as Rejected.`);
        return { ...exp, approval: 'Rejected', auditor: 'Meera Iyer' };
      }
      return exp;
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Charts & Category summary */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-800">Operational Expenses Split</h3>
          <p className="text-[10px] text-neutral-400">Real-time category audit allocations.</p>
        </div>

        <div className="h-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((lbl, idx) => (
                  <Cell key={lbl.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => formatINR(Number(val))} contentStyle={{ fontSize: 11, fontFamily: 'monospace' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <span className="text-[9px] text-neutral-400 block uppercase font-mono leading-none">Gross Claims</span>
            <strong className="text-base text-neutral-800 font-mono tracking-tight font-black">
              {formatINR(expenses.reduce((acc, curr) => acc + curr.amount, 0))}
            </strong>
          </div>
        </div>

        <div className="divide-y max-h-52 overflow-y-auto pr-1">
          {pieData.map((item, idx) => (
            <div key={item.name} className="flex justify-between items-center py-2 text-[11px] font-mono">
              <div className="flex items-center space-x-1.5 font-bold">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-neutral-700">{item.name}</span>
              </div>
              <strong className="text-neutral-800">{formatINR(item.value)}</strong>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold block text-center font-mono text-xs text-white rounded transition uppercase"
        >
          File New Outflow Claim
        </button>
      </div>

      {/* EXPENSE TABLE FEED */}
      <div className="bg-white border rounded-2xl shadow-xs overflow-hidden border-neutral-200 lg:col-span-2 p-5 space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-800">Corporate Utility Expense Auditing</h3>
          <p className="text-[10px] text-neutral-400 font-mono">Approval workflow logs corresponding and matching corporate GSTIN claims.</p>
        </div>

        <div className="overflow-x-auto text-[11px] font-mono">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50 text-[9px] uppercase border-b text-neutral-400">
                <th className="py-2.5 px-3">Expense ID / Date</th>
                <th className="py-2.5 px-3">Category Allocation</th>
                <th className="py-2.5 px-3">Auditing Description Remarks</th>
                <th className="py-2.5 px-3 text-right">Value Details</th>
                <th className="py-2.5 px-3 text-center">Status / Approval</th>
                <th className="py-2.5 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {expenses.map(exp => {
                const isApproved = exp.approval === 'Approved';
                const isPending = exp.approval === 'Pending Approval';
                
                return (
                  <tr key={exp.id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-3.5 px-3">
                      <strong className="block text-neutral-800">{exp.id}</strong>
                      <span className="text-[9px] text-neutral-400 block">{exp.date}</span>
                    </td>
                    <td className="py-3.5 px-3 font-sans font-bold text-neutral-800">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 border text-[10px] text-neutral-700 block w-max">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-neutral-700 block leading-tight font-sans font-medium text-xs">{exp.description}</span>
                      {isApproved && (
                        <span className="text-[8px] text-neutral-400 mt-0.5 block uppercase">Authorised: {exp.auditor}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-black text-xs text-neutral-850">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isApproved ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-400/30 font-bold px-2 py-0.5 rounded uppercase">
                          Approved
                        </span>
                      ) : exp.approval === 'Rejected' ? (
                        <span className="text-[9px] bg-neutral-100 text-neutral-400 font-bold px-2 py-0.5 rounded uppercase">
                          Rejected
                        </span>
                      ) : (
                        <div className="flex flex-col space-y-1 items-center">
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold uppercase block w-max">
                            Pending Audit
                          </span>
                          <div className="flex space-x-1">
                            <button onClick={() => handleApproveExpense(exp.id)} className="p-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border rounded" title="Approve Claim">
                              <CheckCircle size={10} />
                            </button>
                            <button onClick={() => handleRejectExpense(exp.id)} className="p-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border rounded" title="Reject Claim">
                              <XCircle size={10} />
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {exp.file ? (
                        <span className="text-neutral-500 hover:text-neutral-800 cursor-pointer flex items-center justify-center space-x-0.5">
                          <Paperclip size={11} />
                          <span className="text-[9px] text-left underline font-medium block">View Bill</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic text-[10px]">No File</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: FILE OUTFLOW EXPENSE CLAIM */}
      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center z-50 p-4 font-mono text-xs">
          <form 
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">Add Operational Outflow Bill</h3>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-neutral-400 font-bold">Close</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">SELECT EXPENSE CATEGORY *</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full bg-neutral-50 border p-2 rounded"
                >
                  {categoryLists.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">VOUCHER OUTFLOW VALUE (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="2500"
                  value={newAmt || ''}
                  onChange={(e) => setNewAmt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border p-2 rounded font-bold"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">COMPREHENSIVE AUDIT DESCRIPTION *</label>
                <textarea
                  required
                  placeholder="e.g. Paid broadband subscription fees for offices development teams."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-neutral-50 border p-2 rounded h-20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">ATTACH PAYMENT SLIP / RECEIPT CERTIFICATE</label>
                <input
                  type="file"
                  onChange={(e) => setNewFile(e.target.value)}
                  className="w-full bg-neutral-100 p-2 rounded border text-[10px]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold text-white rounded transition uppercase"
            >
              Verify & Send to corporate accounts
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
