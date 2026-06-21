/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  HelpCircle, 
  Lock, 
  FileSpreadsheet, 
  TrendingUp,
  FolderLock
} from 'lucide-react';
import { FinanceTransaction } from '../../types';

interface BankReconciliationProps {
  transactions: FinanceTransaction[];
}

export default function BankReconciliationSection({ transactions }: BankReconciliationProps) {
  const [activeBank, setActiveBank] = useState<'hdfc' | 'icici' | 'sbi'>('hdfc');
  const [reconcilingList, setReconcilingList] = useState<any[]>([
    { id: 'TXN-902401', date: '2026-06-02', desc: 'Amazon Marketplace Order dispatches payout credit', amount: 125400, bankAmt: 125400, status: 'Matched', type: 'Credit' },
    { id: 'TXN-902402', date: '2026-06-03', desc: 'HDFC Corporate Card Monthly Utility Fees automated', amount: 1850, bankAmt: 1850, status: 'Matched', type: 'Debit' },
    { id: 'TXN-902403', date: '2026-06-12', desc: 'Disbursement settlement RTGS - Apex Logistics', amount: 87534, bankAmt: 0, status: 'Pending', type: 'Debit' },
    { id: 'TXN-902404', date: '2026-06-14', desc: 'Delhi Tech Emporium sales collection UPI', amount: 94500, bankAmt: 94350, status: 'Mismatch', type: 'Credit', reason: 'Tolerable Bank transaction charge discrepancy ₹150' },
    { id: 'TXN-902405', date: '2026-06-19', desc: 'Direct inward collection B2B - Vardhman corp credit', amount: 54900, bankAmt: 0, status: 'Pending', type: 'Credit' }
  ]);

  const [parsingStatement, setParsingStatement] = useState(false);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  const triggerUploadState = () => {
    setParsingStatement(true);
    setTimeout(() => {
      setReconcilingList(prev => prev.map(item => {
        if (item.status === 'Pending') {
          return { ...item, bankAmt: item.amount, status: 'Matched' };
        }
        return item;
      }));
      setParsingStatement(false);
      alert('MT940/CSV Bank Statement parsed completely! Auto-matched remaining outstanding transactions within the accounting ledger book guidelines.');
    }, 2000);
  };

  const handleManualReconcile = (id: string) => {
    setReconcilingList(prev => prev.map(item => {
      if (item.id === id) {
        alert(`Manually lock transaction ${item.id} matching balance levels!`);
        return { ...item, bankAmt: item.amount, status: 'Matched' };
      }
      return item;
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      
      {/* LEFT PANEL: CHOOSE BANK PROFILE & SUMMARY KPIs */}
      <div className="space-y-4">
        
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">Operational Accounts Register</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => setActiveBank('hdfc')}
              className={`p-3 w-full rounded-xl border text-left transition flex justify-between items-center ${activeBank === 'hdfc' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
            >
              <div className="flex items-center space-x-2">
                <Building2 size={16} />
                <div className="text-left leading-tight">
                  <strong className="block text-[11px]">HDFC CURRENT A/C</strong>
                  <span className="text-[9px] text-neutral-400 font-normal">A/c No: ...0948293</span>
                </div>
              </div>
              <strong className="block text-xs">{formatINR(24500000)}</strong>
            </button>

            <button
              onClick={() => setActiveBank('icici')}
              className={`p-3 w-full rounded-xl border text-left transition flex justify-between items-center ${activeBank === 'icici' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
            >
              <div className="flex items-center space-x-2">
                <Building2 size={16} />
                <div className="text-left leading-tight">
                  <strong className="block text-[11px]">ICICI ESCROW A/C</strong>
                  <span className="text-[9px] text-neutral-400 font-normal">A/c No: ...4901239</span>
                </div>
              </div>
              <strong className="block text-xs">{formatINR(4500000)}</strong>
            </button>

            <button
              onClick={() => setActiveBank('sbi')}
              className={`p-3 w-full rounded-xl border text-left transition flex justify-between items-center ${activeBank === 'sbi' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
            >
              <div className="flex items-center space-x-2">
                <Building2 size={16} />
                <div className="text-left leading-tight">
                  <strong className="block text-[11px]">SBI TAXATION POOL</strong>
                  <span className="text-[9px] text-neutral-400 font-normal">A/c No: ...9801284</span>
                </div>
              </div>
              <strong className="block text-xs">{formatINR(1200000)}</strong>
            </button>
          </div>
        </div>

        {/* RECON STATUS METRICS WHEEL */}
        <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
          <h4 className="font-bold text-xs uppercase text-neutral-700">Audit Status Score</h4>
          
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Total Book Ledger Transactions:</span>
              <strong className="text-neutral-800">{reconcilingList.length} Items</strong>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-neutral-400">Auto Reconciled (Matched):</span>
              <strong className="text-emerald-600">{reconcilingList.filter(i=>i.status==='Matched').length} Items</strong>
            </div>
            <div className="flex justify-between items-center pt-1 font-bold text-neutral-800">
              <span>Auditable Lock Tolerance:</span>
              <span>100% (INR Match)</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT WORKPLACE PANEL: STATEMENT UPLOADER & RECON GRID */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs border-neutral-200 lg:col-span-2 space-y-4">
        
        {/* Statement Uploader Box */}
        <div className="border border-dashed border-neutral-300 rounded-xl p-6 bg-slate-50 text-center space-y-2.5">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
            <Upload size={18} />
          </div>
          <div>
            <span className="block text-neutral-800 font-sans font-bold text-xs">Direct File uploads: MT940 / CSV statements</span>
            <p className="text-[10px] text-neutral-400 pt-0.5">Drop your bank statement file exported from Corporate Netbanking to run autolock.</p>
          </div>

          <button
            onClick={triggerUploadState}
            disabled={parsingStatement}
            className="px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold text-white rounded transition text-[11px]"
          >
            {parsingStatement ? 'Parsing netbank records... wait' : 'Feed Statement & Auto-Match Ledger'}
          </button>
        </div>

        {/* Reconciliation list matching matrix */}
        <div className="space-y-2">
          <div className="flex justify-between items-center pb-2">
            <strong className="text-neutral-800 uppercase text-[10px] tracking-wider block">Transactional Ledger Lock Matrix</strong>
            <span className="text-neutral-400 text-[10px]">Variance mismatch highlighted below.</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
            {reconcilingList.map(item => {
              const matches = item.status === 'Matched';
              const isMismatch = item.status === 'Mismatch';
              
              return (
                <div key={item.id} className="p-3 bg-white border rounded-xl flex justify-between items-stretch gap-4 hover:shadow-xs transition border-neutral-200">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center space-x-1.5">
                      <strong className="text-neutral-800">{item.id}</strong>
                      <span className="text-[10px] text-neutral-450">{item.date}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${item.type === 'Credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                        {item.type === 'Credit' ? 'INWARD' : 'OUTWARD'}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 leading-tight font-sans font-medium">{item.desc}</p>
                    {isMismatch && (
                      <span className="text-[9px] block text-amber-600 font-semibold bg-amber-50 px-1 py-0.5 rounded">⚠️ Reason: {item.reason}</span>
                    )}
                  </div>

                  <div className="flex flex-col justify-between items-end shrink-0">
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-400 block font-normal leading-tight">Ledger / Bank:</span>
                      <strong className="text-neutral-800 block">{formatINR(item.amount)}</strong>
                      <span className="text-[10px] text-neutral-400 block font-normal">{item.bankAmt > 0 ? formatINR(item.bankAmt) : 'Awaited'}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 pt-2">
                      {matches ? (
                        <div className="flex items-center space-x-1 text-emerald-600">
                          <CheckCircle2 size={12} />
                          <span className="text-[9px] font-bold uppercase">Locked Reconciled</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleManualReconcile(item.id)}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border text-[9px] font-bold rounded flex items-center space-x-0.5"
                        >
                          <Lock size={10} />
                          <span>Force Match</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
