/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Download, 
  CreditCard, 
  Coins, 
  ShieldCheck, 
  TrendingDown, 
  FileCheck2, 
  Printer, 
  Banknote,
  Percent,
  CheckCircle,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Vendor, FinanceTransaction } from '../../types';

interface PaymentsReceiptsSectionProps {
  vendors: Vendor[];
  transactions: FinanceTransaction[];
  addTransaction: (tx: any) => void;
  updateVendorBalance: (id: string, amount: number) => void;
}

export default function PaymentsReceiptsSection({
  vendors,
  transactions,
  addTransaction,
  updateVendorBalance
}: PaymentsReceiptsSectionProps) {
  const [activeTab, setActiveTab] = useState<'settlements' | 'payments' | 'receipts'>('settlements');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settlements form states
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [commissionPct, setCommissionPct] = useState(5);
  const [penaltyAmt, setPenaltyAmt] = useState(0);
  const [adjustments, setAdjustments] = useState(0);
  const [settlementHist, setSettlementHist] = useState<any[]>([
    { id: 'SET-26-0015', date: '2026-06-18', vendorName: 'Kalyani Electronics Component Hub', sales: 450000, commission: 22500, gst: 4050, tds: 4500, penalty: 0, adjust: -1200, net: 426350, status: 'Settled', ref: 'RTGS-HDFC-94819' },
    { id: 'SET-26-0016', date: '2026-06-19', vendorName: 'Apex Packaging Logistics', sales: 94000, commission: 4700, gst: 564, tds: 1880, penalty: 450, adjust: 0, net: 87534, status: 'Processing', ref: 'IMPS-ICICI-03912' }
  ]);

  // Outward / Inward payout forms
  const [payParty, setPayParty] = useState('');
  const [payAmt, setPayAmt] = useState(0);
  const [payMode, setPayMode] = useState<'NEFT'|'UPI'|'RTGS'|'Cheque'|'Cash'|'IMPS'>('NEFT');
  const [payRef, setPayRef] = useState('');
  const [payType, setPayType] = useState<Omit<FinanceTransaction['type'], 'GST Liability' | 'TDS Liability' | 'ITC Claimed'>>('Payment Out');

  const [pdfDrawer, setPdfDrawer] = useState<any | null>(null);

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateSettlement = (vendorId: string) => {
    const v = vendors.find(vendor => vendor.id === vendorId);
    if (!v) return null;

    const baseSales = v.ledgerBalance; // Gross sales generated
    const commission = (baseSales * commissionPct) / 100;
    const gstOnCommission = commission * 0.18; // 18% standard GST on corporate commissions
    const tdsDeducted = v.tdsApplicable ? (baseSales * (v.tdsRate / 100)) : 0;
    const netPayable = baseSales - commission - gstOnCommission - tdsDeducted - penaltyAmt + adjustments;

    return {
      vendor: v,
      sales: baseSales,
      commission,
      gst: gstOnCommission,
      tds: tdsDeducted,
      netPayable
    };
  };

  const currentCalc = calculateSettlement(selectedVendorId);

  const handlePostSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || !currentCalc) {
      alert('Kindly select a corporate supplier vendor first!');
      return;
    }

    const matchedVendor = vendors.find(v => v.id === selectedVendorId);
    if (!matchedVendor) return;

    const newSet = {
      id: `SET-26-00${settlementHist.length + 17}`,
      date: new Date().toISOString().split('T')[0],
      vendorName: matchedVendor.companyName,
      sales: currentCalc.sales,
      commission: currentCalc.commission,
      gst: currentCalc.gst,
      tds: currentCalc.tds,
      penalty: penaltyAmt,
      adjust: adjustments,
      net: currentCalc.netPayable,
      status: 'Settled',
      ref: `RTGS-MFR-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setSettlementHist([newSet, ...settlementHist]);
    // Synchronize transactions ledger
    addTransaction({
      date: newSet.date,
      referenceNo: newSet.id,
      type: 'Payment Out',
      partyName: matchedVendor.companyName,
      gstin: matchedVendor.gstin,
      amount: newSet.net,
      taxAmount: newSet.gst,
      tdsAmount: newSet.tds,
      tdsSection: matchedVendor.tdsSection,
      description: `Vendor automated settlement balance. Commission captured: ₹${newSet.commission.toFixed(1)} minus Section ${matchedVendor.tdsSection} TDS.`,
      status: 'Paid'
    });

    // Zero out vendor current balance
    updateVendorBalance(matchedVendor.id, -matchedVendor.ledgerBalance);

    alert(`Vendor settlement draft ${newSet.id} for ₹${newSet.net.toFixed(0)} disbursed successfully via automated bank mandate!`);
    setSelectedVendorId('');
    setPenaltyAmt(0);
    setAdjustments(0);
  };

  const handleCustomTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payParty || payAmt <= 0 || !payRef) {
      alert('All transactional clearance markers are required!');
      return;
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      referenceNo: payRef.toUpperCase(),
      type: payType,
      partyName: payParty,
      amount: payAmt,
      taxAmount: payAmt * 0.18,
      description: `Cleared cashbook entry via mode: ${payMode}. Ref code: ${payRef}`,
      status: 'Approved'
    });

    alert(`Successfully posted Cashbook voucher entry: ${payType} of value ₹${payAmt}!`);
    setPayParty('');
    setPayAmt(0);
    setPayRef('');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => { setActiveTab('settlements'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'settlements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <Coins size={14} />
          <span>Vendor Auditable Settlements</span>
        </button>
        <button
          onClick={() => { setActiveTab('payments'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'payments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <ArrowUpCircle size={14} className="text-rose-500" />
          <span>Outward Payments (Cashbook)</span>
        </button>
        <button
          onClick={() => { setActiveTab('receipts'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'receipts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <ArrowDownCircle size={14} className="text-emerald-500" />
          <span>Inward Receipts (Receivables)</span>
        </button>
      </div>

      {/* COMPONENT 1: VENDOR SETTLEMENTS ENGINE */}
      {activeTab === 'settlements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Dispatcher Settlement Calculation Workspace */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-700">Calculate Vendor Settlement Mandate</h3>
            
            <form onSubmit={handlePostSettlement} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block pb-1">SELECT VENDOR ENTITY</label>
                <select
                  required
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-white border p-2 rounded"
                >
                  <option value="">-- Choose Vendor with outstanding --</option>
                  {vendors.filter(v => v.ledgerBalance > 0).map(v => (
                    <option key={v.id} value={v.id}>{v.companyName} (Outstanding: ₹{v.ledgerBalance.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              {currentCalc && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-white rounded border space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Accrued Sales:</span>
                      <strong className="text-neutral-800">{formatINR(currentCalc.sales)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">TDS Withholding Rate:</span>
                      <strong className="text-neutral-800 text-rose-600">-{vendors.find(v => v.id === selectedVendorId)?.tdsRate}%</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-neutral-400 block pb-0.5">COMMISSION RATE (%)</label>
                      <input type="number" className="w-full bg-white border p-2 rounded" value={commissionPct} onChange={(e) => setCommissionPct(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-[9px] text-neutral-400 block pb-0.5">PENALTIES DEBIT (INR)</label>
                      <input type="number" className="w-full bg-white border p-2 rounded" value={penaltyAmt || ''} onChange={(e) => setPenaltyAmt(parseFloat(e.target.value) || 0)} placeholder="0" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-neutral-400 block pb-0.5">MANUAL BALANCE ADJUSTMENT (INR)</label>
                    <input type="number" className="w-full bg-white border p-2 rounded" value={adjustments || ''} onChange={(e) => setAdjustments(parseFloat(e.target.value) || 0)} placeholder="0" />
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-neutral-700">
                      <span>B2B Commission Fee:</span>
                      <span>{formatINR(currentCalc.commission)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-rose-600 border-b pb-1.5">
                      <span>GST (18%) + Sec TDS withheld:</span>
                      <span>{formatINR(currentCalc.gst + currentCalc.tds)}</span>
                    </div>
                    <div className="flex justify-between font-black text-indigo-700 pt-1 text-sm">
                      <span>NET REMITTANCE DUE:</span>
                      <span>{formatINR(currentCalc.netPayable)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full pt-2.5 pb-2 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold text-white text-xs rounded transition"
                  >
                    Authorize payout & zero ledger
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Settlements History Grid */}
          <div className="bg-white border rounded-2xl shadow-xs overflow-hidden border-neutral-200 lg:col-span-2 space-y-4 p-5">
            <div>
              <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-800">Remittance Clearance Settlement Ledger</h3>
              <p className="text-[10px] text-neutral-400">Historical corporate distributor payables.</p>
            </div>

            <div className="overflow-x-auto text-[11px] font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 text-[9px] uppercase border-b text-neutral-400">
                    <th className="py-2.5 px-3">Settlement Index</th>
                    <th className="py-2.5 px-3">Supplier Name</th>
                    <th className="py-2.5 px-3">Gross Sales</th>
                    <th className="py-2.5 px-3 text-center">GST + TDS Deducted</th>
                    <th className="py-2.5 px-3 text-right">Net Cleared</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {settlementHist.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50/50 transition">
                      <td className="py-3 px-3">
                        <strong className="block text-neutral-800">{item.id}</strong>
                        <span className="text-[9px] text-neutral-400 block">{item.date}</span>
                      </td>
                      <td className="py-3 px-3 font-sans font-bold text-neutral-800">
                        {item.vendorName}
                        <span className="block text-[8px] font-mono font-medium text-neutral-400 pt-0.5">Bank Ref: {item.ref}</span>
                      </td>
                      <td className="py-3 px-3">{formatINR(item.sales)}</td>
                      <td className="py-3 px-3 text-center text-rose-600 font-bold">{formatINR(item.gst + item.tds)}</td>
                      <td className="py-3 px-3 text-right font-black text-indigo-600">{formatINR(item.net)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase cursor-pointer" onClick={() => setPdfDrawer(item)}>
                          Payout PDF
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* OUTWARD PAYMENTS & INWARD RECEIPTS (CASHBOOK ENGINE) */}
      {(activeTab === 'payments' || activeTab === 'receipts') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Post Outward / Inward Transaction to Cashbook */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-750">
              {activeTab === 'payments' ? 'Issue Mandated Outward Cheque/Pay' : 'Record Inward Remittance Credit'}
            </h3>

            <form onSubmit={handleCustomTxSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 block pb-1">LEGAL CONTRA PARTY NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Airtel India Broadband"
                  value={payParty}
                  onChange={(e) => setPayParty(e.target.value)}
                  className="w-full bg-white border p-2 rounded text-neutral-800"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block pb-1">TRANSACTION VALUE (INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="15000"
                  value={payAmt || ''}
                  onChange={(e) => setPayAmt(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border p-2 rounded font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-neutral-400 block pb-0.5">PAYMENT MODE</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full bg-white border p-2 rounded"
                  >
                    <option value="NEFT">NEFT Transfer</option>
                    <option value="UPI">UPI Mandate</option>
                    <option value="RTGS">RTGS High-Value</option>
                    <option value="Cheque">Bank Demand Cheque</option>
                    <option value="Cash">Petty Cash In/Out</option>
                    <option value="IMPS">IMPS Immediate</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-neutral-400 block pb-0.5">VOUCHER ENTRY TYPE</label>
                  <select
                    value={payType as string}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full bg-white border p-2 rounded"
                  >
                    {activeTab === 'payments' ? (
                      <option value="Payment Out">Petty Payment Out</option>
                    ) : (
                      <option value="Collection In">Customer Receipt Credit</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 block pb-1">CLEARANCE REF BANCODE / CHEQUE NO *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-HDFC-0491823"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-white border p-2 rounded uppercase font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold text-white text-xs rounded transition uppercase"
              >
                Post dynamic cashbook voucher
              </button>
            </form>
          </div>

          {/* Cashbook Ledger Feed */}
          <div className="bg-white border rounded-2xl shadow-xs overflow-hidden border-neutral-200 lg:col-span-2 space-y-4 p-5">
            <div>
              <h3 className="font-bold text-xs uppercase font-mono tracking-widest text-neutral-800">
                {activeTab === 'payments' ? 'Outward Disbursements Audit History' : 'Inward Income/Receipt Collections'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">Dynamic cash tracking reconciled under company TAN audits.</p>
            </div>

            <div className="overflow-x-auto text-[11px] font-mono">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 text-[9px] uppercase border-b text-neutral-400">
                    <th className="py-2.5 px-3">Booking Date</th>
                    <th className="py-2.5 px-3">Remittance ID</th>
                    <th className="py-2.5 px-3">Contra / Party Details</th>
                    <th className="py-2.5 px-3 text-right">Value (INR)</th>
                    <th className="py-2.5 px-3 text-center">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {transactions
                    .filter(t => activeTab === 'payments' ? t.type === 'Payment Out' : t.type === 'Collection In')
                    .map(tx => (
                      <tr key={tx.id} className="hover:bg-neutral-50/50 transition">
                        <td className="py-3 px-3 text-neutral-500">{new Date(tx.date).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-3 font-bold text-neutral-800">{tx.referenceNo}</td>
                        <td className="py-3 px-3 font-sans font-bold text-neutral-800">
                          {tx.partyName}
                          <span className="block text-[9px] font-mono font-medium text-neutral-400 mt-0.5">{tx.description}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-black text-rose-600">{formatINR(tx.amount)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-1.5 py-0.5 ring-1 rounded text-[8px] ring-emerald-500/30 text-emerald-700 bg-emerald-50 font-bold uppercase">
                            RECONCILED
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* POPUP REMITTANCE SLIP PDF PREVIEW */}
      {pdfDrawer && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4 font-mono text-[11px]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border p-8 space-y-6 animate-in zoom-in-95 leading-relaxed text-neutral-800">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] text-neutral-400 uppercase">Interactive Remittance disbursement receipt</span>
              <button onClick={() => setPdfDrawer(null)} className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold rounded">Dismiss</button>
            </div>
            
            {/* Settlement Blueprint */}
            <div className="space-y-4 p-2 border">
              <div className="text-center space-y-1 py-2 border-b">
                <h2 className="text-sm font-black text-neutral-950 uppercase">REMITTANCE DISBURSEMENT ADVICE</h2>
                <p className="text-[10px] text-neutral-500">TTGT Solutions ERP Settlement Voucher | Generated on {pdfDrawer.date}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] text-neutral-400 block uppercase">PAYOR ENTITY</span>
                  <strong className="text-neutral-850">TTGT Solutions Private Limited</strong>
                  <p className="text-[10px] text-neutral-500 leading-tight">Lodha Supremus, Kanjurmarg, Mumbai</p>
                </div>
                <div>
                  <span className="text-[8px] text-neutral-400 block uppercase">PAYEE SUPPLIER</span>
                  <strong className="text-neutral-850">{pdfDrawer.vendorName}</strong>
                  <p className="text-[10px] text-neutral-500 leading-tight">KYC Audited and PAN matched</p>
                </div>
              </div>

              <table className="w-full text-left font-bold text-[10px] border mt-4">
                <thead className="bg-neutral-50 border-b">
                  <tr>
                    <th className="p-2">Description split index</th>
                    <th className="p-2 text-right">Value (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  <tr>
                    <td className="p-2 font-medium">B2B Base Sales Earned Outstanding</td>
                    <td className="p-2 text-right">{formatINR(pdfDrawer.sales)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">TTGT Corporate Sales Commission (Less)</td>
                    <td className="p-2 text-right text-rose-600">-{formatINR(pdfDrawer.commission)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">18% GST Fee on services</td>
                    <td className="p-2 text-right text-rose-600">-{formatINR(pdfDrawer.gst)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">Supplier Income Tax Withhold Section TDS (Less)</td>
                    <td className="p-2 text-right text-rose-600">-{formatINR(pdfDrawer.tds)}</td>
                  </tr>
                  {pdfDrawer.penalty > 0 && (
                    <tr>
                      <td className="p-2 font-medium">Material Shortfalls SLA Penalties</td>
                      <td className="p-2 text-right text-rose-600">-{formatINR(pdfDrawer.penalty)}</td>
                    </tr>
                  )}
                  <tr className="bg-indigo-50 font-black text-indigo-700">
                    <td className="p-2">NET BANK DISBURSEMENT SENT (RTGS)</td>
                    <td className="p-2 text-right">{formatINR(pdfDrawer.net)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-baseline pt-5 text-[9px] text-neutral-400">
                <span>UTR/Reference ID: <strong className="text-neutral-700">{pdfDrawer.ref}</strong></span>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest text-[8px]">Fund Cleared (HDFC)</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
