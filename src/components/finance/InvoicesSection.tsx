/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ChevronDown,
  Percent,
  QrCode,
  Check,
  Building,
  Upload,
  Signature
} from 'lucide-react';
import { Order, Vendor, CompanySettings } from '../../types';

interface InvoicesSectionProps {
  orders: Order[];
  vendors: Vendor[];
  companySettings: CompanySettings;
  addSalesInvoice: (order: Order) => void;
  addPurchaseInvoice: (invoice: any) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
}

export default function InvoicesSection({
  orders,
  vendors,
  companySettings,
  addSalesInvoice,
  addPurchaseInvoice,
  updateOrderStatus
}: InvoicesSectionProps) {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'credit' | 'debit'>('sales');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sales Dialog
  const [showAddSales, setShowAddSales] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Purchase Invoice Fields
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [purchaseVendorId, setPurchaseVendorId] = useState('');
  const [purchaseInvNo, setPurchaseInvNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseBaseAmount, setPurchaseBaseAmount] = useState(0);
  const [purchaseGstRate, setPurchaseGstRate] = useState<5|12|18|28>(18);
  const [purchaseFile, setPurchaseFile] = useState<string>('');
  
  // Simulated Notes databases for Credit/Debit notes
  const [creditNotes, setCreditNotes] = useState<any[]>([
    { id: 'CN-2026-001', date: '2026-06-12', refInv: 'TTGT-2627-0102', party: 'Delhi Tech Emporium', sum: 2500, tax: 450, reason: 'Damaged shipment return adjustment', approvedBy: 'Meera Iyer' },
    { id: 'CN-2026-002', date: '2026-06-18', refInv: 'TTGT-2627-0103', party: 'Indore Electronics World', sum: 1500, tax: 270, reason: 'Rate diff adjustment', approvedBy: 'Meera Iyer' }
  ]);
  const [debitNotes, setDebitNotes] = useState<any[]>([
    { id: 'DN-2026-001', date: '2026-06-14', refInv: 'VCH-2026-940', party: 'Kalyani Electronics Component Hub', sum: 4500, tax: 810, reason: 'Short delivery debit to supplier', approvedBy: 'Devid Jhon' }
  ]);

  const [shownCNAdd, setShownCNAdd] = useState(false);
  const [shownDNAdd, setShownDNAdd] = useState(false);

  // New Note states
  const [noteRefInv, setNoteRefInv] = useState('');
  const [noteParty, setNoteParty] = useState('');
  const [noteSum, setNoteSum] = useState(0);
  const [noteReason, setNoteReason] = useState('');

  // Handle Dynamic Digital Signature Loading
  const [digitallySigned, setDigitallySigned] = useState<Record<string, boolean>>({});

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateDynamicGst = (base: number, rate: number, isLocal: boolean) => {
    const totalTax = base * (rate / 105); // Standard split representation
    if (isLocal) {
      return {
        cgst: totalTax / 2,
        sgst: totalTax / 2,
        igst: 0,
        totalTax
      };
    } else {
      return {
        cgst: 0,
        sgst: 0,
        igst: totalTax,
        totalTax
      };
    }
  };

  // Printable Invoice Generation & Drawer Modal
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Order | null>(null);

  const triggerDigitalSign = (invId: string) => {
    setDigitallySigned(prev => ({
      ...prev,
      [invId]: true
    }));
    alert(`Digital signature verified and attached to ${invId} successfully inside auditing trails!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => { setActiveTab('sales'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'sales' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <FileText size={14} />
          <span>Sales Invoices (GST-1)</span>
        </button>
        <button
          onClick={() => { setActiveTab('purchases'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'purchases' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <Building size={14} />
          <span>Purchase Invoices (GSTR-2B)</span>
        </button>
        <button
          onClick={() => { setActiveTab('credit'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'credit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <Percent size={14} />
          <span>Credit Notes (Sales Ret.)</span>
        </button>
        <button
          onClick={() => { setActiveTab('debit'); setSearchQuery(''); }}
          className={`py-3 px-6 text-xs uppercase tracking-wider font-mono font-bold flex items-center space-x-2 border-b-2 transition ${activeTab === 'debit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}
        >
          <Percent size={14} />
          <span>Debit Notes (Purch Ret.)</span>
        </button>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-neutral-400" size={16} />
          <input
            type="text"
            placeholder={`Search ${activeTab} records...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-indigo-500 text-neutral-800 font-mono"
          />
        </div>

        {/* Dynamic New Creation Button */}
        {activeTab === 'sales' && (
          <div className="flex space-x-2">
            <span className="text-[11px] text-neutral-400 self-center font-mono italic">Invoices are auto-compiled on packed orders.</span>
          </div>
        )}

        {activeTab === 'purchases' && (
          <button
            onClick={() => setShowAddPurchase(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-mono rounded-lg text-white text-xs font-bold transition"
          >
            <Plus size={14} />
            <span>Upload Purchase Bill</span>
          </button>
        )}

        {activeTab === 'credit' && (
          <button
            onClick={() => setShownCNAdd(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 font-mono rounded-lg text-white text-xs font-bold transition"
          >
            <Plus size={14} />
            <span>Issue Credit Note</span>
          </button>
        )}

        {activeTab === 'debit' && (
          <button
            onClick={() => setShownDNAdd(true)}
            className="flex items-center space-x-1 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 font-mono rounded-lg text-white text-xs font-bold transition"
          >
            <Plus size={14} />
            <span>Issue Debit Note</span>
          </button>
        )}
      </div>

      {/* SALES TAB COMPONENT */}
      {activeTab === 'sales' && (
        <div className="bg-white border rounded-xl shadow-xs overflow-hidden border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-neutral-50 text-[10px] text-neutral-400 font-mono uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4 font-bold">Invoice Ref / Date</th>
                  <th className="py-3 px-4 font-bold">Party / GSTIN</th>
                  <th className="py-3 px-4 font-bold">Place of Supply</th>
                  <th className="py-3 px-4 font-bold text-center">Taxes (CGST/SGST/IGST)</th>
                  <th className="py-3 px-4 font-bold text-right">Grand Total</th>
                  <th className="py-3 px-4 font-bold text-center">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {orders
                  .filter(o => o.invoiceNumber)
                  .filter(o => 
                    o.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.customerGstin?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(order => {
                    const isLocal = order.customerState === 'Maharashtra';
                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/50 transition">
                        <td className="py-3.5 px-4">
                          <strong className="block text-neutral-800 font-mono">{order.invoiceNumber}</strong>
                          <span className="text-[10px] text-neutral-400 block font-mono">{new Date(order.invoiceDate || order.orderDate).toLocaleDateString('en-IN')}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className="text-neutral-850 block">{order.customerName}</span>
                          <span className="text-[9px] text-neutral-400 font-medium block">{order.customerGstin || 'B2C UNREGISTERED'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-neutral-700 font-mono">{order.customerState}</span>
                          <span className="text-[9px] text-neutral-400 block font-mono">Pin: {order.shippingPinCode}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono space-y-0.5">
                          {isLocal ? (
                            <div className="text-[10px]">
                              <span className="block text-indigo-600">CGST (9%): {formatINR(order.totalCgst)}</span>
                              <span className="block text-indigo-600">SGST (9%): {formatINR(order.totalSgst)}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600">IGST (18%): {formatINR(order.totalIgst)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-neutral-850">
                          {formatINR(order.grandTotal)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                            {order.paymentStatus === 'Paid' ? 'GST Paid / Settled' : 'Payment Awaited'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setViewInvoiceModal(order)}
                              title="Print Invoice"
                              className="p-1 px-2 border rounded hover:border-neutral-400 text-[10px] uppercase font-mono font-bold flex items-center space-x-1"
                            >
                              <Printer size={10} />
                              <span>Print / PDF</span>
                            </button>
                            <button
                              onClick={() => triggerDigitalSign(order.invoiceNumber!)}
                              className={`p-1 rounded text-[10px] font-mono font-bold ${digitallySigned[order.id] || order.paymentStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-500 hover:bg-neutral-100'}`}
                            >
                              <Signature size={12} className="inline mr-0.5" /> 
                              {digitallySigned[order.id] || order.paymentStatus === 'Paid' ? 'Signed' : 'Sign'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PURCHASES TAB */}
      {activeTab === 'purchases' && (
        <div className="bg-white border rounded-xl shadow-xs overflow-hidden border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-neutral-50 text-[10px] text-neutral-400 font-mono uppercase tracking-wider border-b">
                <tr>
                  <th className="py-3 px-4 font-bold">Purchase Ref / Invoice Date</th>
                  <th className="py-3 px-4 font-bold">Supplier Vendor Details</th>
                  <th className="py-3 px-4 font-bold">Input Tax Credit (ITC) status</th>
                  <th className="py-3 px-4 font-bold text-right">Invoice Value</th>
                  <th className="py-3 px-4 font-bold text-center">Attachment</th>
                  <th className="py-3 px-4 font-bold text-center">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {vendors.flatMap(v => {
                  return [
                    { id: `${v.id}-inv1`, invNo: `PUR-${v.companyName.slice(0,3).toUpperCase()}-1842`, date: '2026-06-02', base: v.ledgerBalance * 0.85, status: 'Reconciled' },
                    { id: `${v.id}-inv2`, invNo: `PUR-${v.companyName.slice(0,3).toUpperCase()}-9401`, date: '2026-06-15', base: v.ledgerBalance * 0.15, status: 'Reconciled' }
                  ].filter(inv => inv.base > 0).map(pInv => {
                    const taxDetails = calculateDynamicGst(pInv.base, 18, v.state === 'Maharashtra');
                    return (
                      <tr key={pInv.id} className="hover:bg-neutral-50/50 transition">
                        <td className="py-3.5 px-4">
                          <strong className="block text-neutral-800 font-mono">{pInv.invNo}</strong>
                          <span className="text-[10px] text-neutral-400 block font-mono">Invoice Date: {pInv.date}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className="text-neutral-850 block">{v.companyName}</span>
                          <span className="text-[9px] text-emerald-600 block">GSTIN: {v.gstin} ({v.state})</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">ITC Auto-matched (GSTR-2B)</span>
                          </div>
                          <span className="text-[9px] block text-neutral-400 text-left">CGST+SGST/IGST paid: {formatINR(taxDetails.totalTax)}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-neutral-800">
                          {formatINR(pInv.base + taxDetails.totalTax)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold px-2 py-1 rounded font-mono cursor-pointer border flex items-center justify-center space-x-1 w-max mx-auto">
                            <Upload size={10} />
                            <span>PDF Attached</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700">
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREDIT NOTES */}
      {activeTab === 'credit' && (
        <div className="bg-white border rounded-xl shadow-xs overflow-hidden border-neutral-200">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-neutral-50 text-[10px] text-neutral-400 font-mono uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4 font-bold">Credit Note ID</th>
                <th className="py-3 px-4 font-bold">Reference Sales Invoice</th>
                <th className="py-3 px-4 font-bold">Customer Name</th>
                <th className="py-3 px-4 font-bold text-right font-mono">Tax Amount Adjusted</th>
                <th className="py-3 px-4 font-bold text-right font-mono">Grand Total</th>
                <th className="py-3 px-4 font-bold">Audit Remarks / Authority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-150">
              {creditNotes.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition font-mono">
                  <td className="py-3.5 px-4 font-bold text-neutral-800">{item.id}</td>
                  <td className="py-3.5 px-4 text-neutral-500">{item.refInv}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-neutral-800">{item.party}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-indigo-600">{formatINR(item.tax)}</td>
                  <td className="py-3.5 px-4 text-right font-black text-rose-600">-{formatINR(item.sum)}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] block text-neutral-700 font-sans leading-tight">{item.reason}</span>
                    <span className="text-[8px] bg-neutral-100 px-1 py-0.5 rounded text-neutral-500 font-bold uppercase mt-0.5 block w-max">AUDITED BY: {item.approvedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DEBIT NOTES */}
      {activeTab === 'debit' && (
        <div className="bg-white border rounded-xl shadow-xs overflow-hidden border-neutral-200">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-neutral-50 text-[10px] text-neutral-400 font-mono uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4 font-bold">Debit Note ID</th>
                <th className="py-3 px-4 font-bold">Reference Purchase Invoice</th>
                <th className="py-3 px-4 font-bold">Vendor Name</th>
                <th className="py-3 px-4 font-bold text-right font-mono">Tax Recovered</th>
                <th className="py-3 px-4 font-bold text-right font-mono">Grand Total</th>
                <th className="py-3 px-4 font-bold">Adjustment Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-150">
              {debitNotes.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50/50 transition font-mono">
                  <td className="py-3.5 px-4 font-bold text-neutral-800">{item.id}</td>
                  <td className="py-3.5 px-4 text-neutral-500">{item.refInv}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-neutral-800">{item.party}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{formatINR(item.tax)}</td>
                  <td className="py-3.5 px-4 text-right font-black text-indigo-600">+{formatINR(item.sum)}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] block text-neutral-700 font-sans leading-tight">{item.reason}</span>
                    <span className="text-[8px] bg-neutral-100 px-1 py-0.5 rounded text-neutral-500 font-bold uppercase mt-0.5 block w-max">AUTHORIZED BY: {item.approvedBy}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* POPUP MODAL: PURCHASE UPLOADER FORM */}
      {showAddPurchase && (
        <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if(!purchaseInvNo || !purchaseVendorId || purchaseBaseAmount <= 0) {
                alert('All required fields must be supplied!');
                return;
              }
              const matchedVendor = vendors.find(v => v.id === purchaseVendorId);
              if (matchedVendor) {
                alert(`Successfully posted purchase invoice ${purchaseInvNo} for ${matchedVendor.companyName}. Tax details have been compiled in dynamic GSTR-2B tables!`);
                setShowAddPurchase(false);
                // Clear state
                setPurchaseInvNo('');
                setPurchaseBaseAmount(0);
                setPurchaseVendorId('');
              }
            }}
            className="bg-white rounded-xl shadow-xl w-full max-w-xl border border-neutral-300 p-6 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-neutral-800">E-Invoice Registration & KYC matching</h3>
              <button type="button" onClick={() => setShowAddPurchase(false)} className="text-neutral-400 hover:text-neutral-600 text-xs font-mono">Close</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">SELECT SUPPLIER VENDOR *</label>
                <select
                  required
                  value={purchaseVendorId}
                  onChange={(e) => setPurchaseVendorId(e.target.value)}
                  className="w-full bg-neutral-50 border p-2 rounded"
                >
                  <option value="">-- Choose Vendor with PAN identity --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.companyName} (GSTIN: {v.gstin})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">INVOICE SERIAL NUMBER *</label>
                <input
                  type="text"
                  placeholder="e.g. INV/2026/0492"
                  value={purchaseInvNo}
                  onChange={(e) => setPurchaseInvNo(e.target.value)}
                  className="w-full bg-neutral-50 border p-2 rounded uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">INVOICE DATE *</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-neutral-50 border p-2 rounded text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">BASE TAXABLE VALUE (INR) *</label>
                <input
                  type="number"
                  placeholder="85400"
                  value={purchaseBaseAmount || ''}
                  onChange={(e) => setPurchaseBaseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-50 border p-2 rounded"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">GST TAX BRACKET</label>
                <select
                  value={purchaseGstRate}
                  onChange={(e) => setPurchaseGstRate(parseInt(e.target.value) as any)}
                  className="w-full bg-neutral-50 border p-2 rounded font-sans"
                >
                  <option value="5">5% (Yarn rate)</option>
                  <option value="12">12% (Boxes)</option>
                  <option value="18">18% (Standard Hub)</option>
                  <option value="28">28% (Luxury items)</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">UPLOAD COMPLYING ORIGINAL Bill (SIMULATION)</label>
                <div className="border border-dashed p-4 rounded-lg text-center bg-neutral-50 hover:bg-neutral-100 cursor-pointer text-xs text-neutral-500 font-sans">
                  <span>ℹ️ Drag & drop or click file attachments. Maximum size 5MB (PDF format preferred)</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-neutral-900 border border-neutral-850 hover:bg-neutral-850 font-bold text-white font-mono rounded"
            >
              Verify, Post and Match ITC claim
            </button>
          </form>
        </div>
      )}

      {/* POPUP MODAL: ISSUE CREDIT NOTE */}
      {shownCNAdd && (
        <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center z-50 p-4 font-mono text-xs">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if(!noteParty || !noteRefInv || noteSum <= 0) {
                alert('All adjustments fields are required!');
                return;
              }
              const newCN = {
                id: `CN-2026-00${creditNotes.length + 1}`,
                date: new Date().toISOString().split('T')[0],
                refInv: noteRefInv,
                party: noteParty,
                sum: noteSum,
                tax: noteSum * 0.18,
                reason: noteReason,
                approvedBy: 'Devid Jhon'
              };
              setCreditNotes([newCN, ...creditNotes]);
              alert(`Credit Note ${newCN.id} has been registered and adjustments posted to General Ledger!`);
              setShownCNAdd(false);
              setNoteParty('');
              setNoteRefInv('');
              setNoteSum(0);
              setNoteReason('');
            }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">Issue Credit Note Ledger Correction</h3>
              <button type="button" onClick={() => setShownCNAdd(false)} className="text-neutral-400">Close</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">CUSTOMER / PARTY *</label>
                <input type="text" className="w-full bg-neutral-50 border p-2 rounded" placeholder="Delhi Tech Emporium" value={noteParty} onChange={(e) => setNoteParty(e.target.value)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">REFERENCE SALES INVOICE ID *</label>
                <input type="text" className="w-full bg-neutral-50 border p-2 rounded uppercase" placeholder="TTGT-2627-0103" value={noteRefInv} onChange={(e) => setNoteRefInv(e.target.value)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">GRAND TOTAL VALUE ADJUSTMENT (INR) *</label>
                <input type="number" className="w-full bg-neutral-50 border p-2 rounded" placeholder="1000" value={noteSum || ''} onChange={(e) => setNoteSum(parseFloat(e.target.value) || 0)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">AUDIT JUSTIFICATION REMARKS *</label>
                <textarea className="w-full bg-neutral-50 border p-2 rounded h-20" placeholder="e.g. Sales return or rebate adjustments" value={noteReason} onChange={(e) => setNoteReason(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="w-full py-2 bg-neutral-900 text-white font-bold rounded">Authorise Credit Adjustments</button>
          </form>
        </div>
      )}

      {/* POPUP MODAL: ISSUE DEBIT NOTE */}
      {shownDNAdd && (
        <div className="fixed inset-0 bg-neutral-900/60 flex items-center justify-center z-50 p-4 font-mono text-xs">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if(!noteParty || !noteRefInv || noteSum <= 0) {
                alert('All adjustments fields are required!');
                return;
              }
              const newDN = {
                id: `DN-2026-00${debitNotes.length + 1}`,
                date: new Date().toISOString().split('T')[0],
                refInv: noteRefInv,
                party: noteParty,
                sum: noteSum,
                tax: noteSum * 0.18,
                reason: noteReason,
                approvedBy: 'Meera Iyer'
              };
              setDebitNotes([newDN, ...debitNotes]);
              alert(`Debit Note ${newDN.id} has been registered and adjustments posted to General Ledger!`);
              setShownDNAdd(false);
              setNoteParty('');
              setNoteRefInv('');
              setNoteSum(0);
              setNoteReason('');
            }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">Issue Debit Note Ledger Correction</h3>
              <button type="button" onClick={() => setShownDNAdd(false)} className="text-neutral-400">Close</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">SUPPLIER / VENDOR PARTY *</label>
                <input type="text" className="w-full bg-neutral-50 border p-2 rounded" placeholder="Kalyani Electronics Component Hub" value={noteParty} onChange={(e) => setNoteParty(e.target.value)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">REFERENCE PURCHASE INVOICE ID *</label>
                <input type="text" className="w-full bg-neutral-50 border p-2 rounded uppercase" placeholder="PO-2026-0034" value={noteRefInv} onChange={(e) => setNoteRefInv(e.target.value)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">GRAND TOTAL VALUE ADJUSTMENT (INR) *</label>
                <input type="number" className="w-full bg-neutral-50 border p-2 rounded" placeholder="1000" value={noteSum || ''} onChange={(e) => setNoteSum(parseFloat(e.target.value) || 0)} required />
              </div>
              <div>
                <label className="text-[9px] font-bold text-neutral-400 block pb-1">AUDIT JUSTIFICATION REMARKS *</label>
                <textarea className="w-full bg-neutral-50 border p-2 rounded h-20" placeholder="e.g. Rate difference or damaged component debit to vendor" value={noteReason} onChange={(e) => setNoteReason(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="w-full py-2 bg-neutral-900 text-white font-bold rounded">Authorise Debit Adjustments</button>
          </form>
        </div>
      )}

      {/* DETAILED PRINTABLE INVOICE DRAWER MODAL */}
      {viewInvoiceModal && (
        <div className="fixed inset-0 bg-neutral-900/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-neutral-300 p-8 space-y-6 animate-in slide-in-from-bottom-12">
            
            {/* Modal Controllers */}
            <div className="flex justify-between items-center border-b pb-3 no-print">
              <span className="text-xs font-mono text-neutral-400 uppercase">Interactive B2B Invoice PDF Sheet</span>
              <div className="flex space-x-2 font-mono">
                <button onClick={() => window.print()} className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded flex items-center space-x-1 border">
                  <Printer size={12} />
                  <span>Interactive Print</span>
                </button>
                <button onClick={() => setViewInvoiceModal(null)} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded">
                  Dismiss
                </button>
              </div>
            </div>

            {/* PRINT-READY CORE LAYOUT */}
            <div className="space-y-6 printable-invoice text-neutral-850 p-2">
              
              {/* Header Box */}
              <div className="flex justify-between items-start border-b-2 border-neutral-800 pb-4">
                <div>
                  <h1 className="text-lg font-black font-sans uppercase tracking-tight text-neutral-900">{companySettings.companyName}</h1>
                  <span className="text-[10px] text-neutral-500 font-mono italic block">Enterprise B2B tax invoice</span>
                  <p className="text-[11px] text-neutral-600 font-mono mt-1 whitespace-pre-line leading-relaxed">
                    {companySettings.addressLines}, {companySettings.city}, {companySettings.state} - {companySettings.pinCode}
                    <br />PAN: {companySettings.pan} | CIN: {companySettings.cin}
                    <br />GSTIN: <span className="font-bold underline text-neutral-900">{companySettings.gstin}</span>
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold font-sans text-rose-600 uppercase">GST INVOICE</h2>
                  <div className="text-[11px] font-mono mt-1 space-y-0.5">
                    <div>Invoice No: <strong className="text-neutral-800 font-black text-xs">{viewInvoiceModal.invoiceNumber}</strong></div>
                    <div>Invoice Date: <strong className="text-neutral-800">{new Date(viewInvoiceModal.invoiceDate || viewInvoiceModal.orderDate).toLocaleDateString('en-IN')}</strong></div>
                    <div>Due Date: <strong className="text-neutral-850">30 Days (Accrual)</strong></div>
                  </div>
                </div>
              </div>

              {/* Billed To / Shipped To Bilateral Grid */}
              <div className="grid grid-cols-2 gap-6 text-[11px] font-mono border-b pb-4 leading-relaxed">
                <div className="border-r pr-6">
                  <span className="text-[9px] font-bold text-neutral-400 block uppercase tracking-wider pb-1">BILLED TO (BUYER)</span>
                  <strong className="text-sm font-sans text-neutral-850 block">{viewInvoiceModal.customerName}</strong>
                  <p className="text-neutral-600 text-[10px]">
                    Shipping Address: {viewInvoiceModal.shippingAddress}
                    <br />Deliver State: <strong className="text-neutral-850">{viewInvoiceModal.customerState} (PIN: {viewInvoiceModal.shippingPinCode})</strong>
                    <br />Buyer GSTIN: <strong>{viewInvoiceModal.customerGstin || 'B2C (UNREGISTERED)'}</strong>
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 block uppercase tracking-wider pb-1">SENDER ENTITY SETTLEMENT</span>
                  <strong className="text-neutral-850 block">Place of Supply: {viewInvoiceModal.customerState}</strong>
                  <p className="text-neutral-500 mt-1 text-[10px]">
                    Bank Name: {companySettings.bankName}
                    <br />Account Number: {companySettings.accountNumber}
                    <br />IFSC Code: {companySettings.ifscCode}
                    <br />UPI ID: {companySettings.upiId}
                  </p>
                </div>
              </div>

              {/* Items Summary Table */}
              <table className="w-full text-left font-mono text-[11px] border-collapse">
                <thead>
                  <tr className="bg-neutral-900 text-white font-bold text-[10px] uppercase">
                    <th className="py-2 px-3">SKU & HSN Description</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Rate (INR)</th>
                    <th className="py-2 px-3 text-right">Tax Rate (%)</th>
                    <th className="py-2 px-3 text-center">CGST / SGST Splits (Local)</th>
                    <th className="py-2 px-3 text-right">Line Total (Incl. Tax)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {viewInvoiceModal.items.map(item => {
                    const isLocal = viewInvoiceModal.customerState === 'Maharashtra';
                    return (
                      <tr key={item.id} className="text-neutral-800">
                        <td className="py-2.5 px-3">
                          <strong className="block text-neutral-900 font-sans">{item.productName}</strong>
                          <span className="text-[9px] text-neutral-400">SKU: {item.sku} | HSN Code: {item.hsnCode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">{item.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right">{item.gstRate}%</td>
                        <td className="py-2.5 px-3 text-center space-y-0.5 text-[10px]">
                          {isLocal ? (
                            <div>
                              <span className="block text-neutral-500">CGST ({(item.gstRate / 2).toFixed(1)}%): ₹{item.cgstAmount ? item.cgstAmount.toFixed(1) : (item.subtotal * (item.gstRate / 200)).toFixed(1)}</span>
                              <span className="block text-neutral-500">SGST ({(item.gstRate / 2).toFixed(1)}%): ₹{item.sgstAmount ? item.sgstAmount.toFixed(1) : (item.subtotal * (item.gstRate / 200)).toFixed(1)}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-600 block">IGST ({item.gstRate}%): ₹{item.igstAmount ? item.igstAmount.toFixed(1) : (item.subtotal * (item.gstRate / 100)).toFixed(1)}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-neutral-900">
                          {formatINR(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Subtotal / Taxes grid & QR Digitising */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed font-mono mt-4 pt-4 border-t">
                
                {/* QR Code & Sign Panel */}
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center space-x-3.5">
                  <div className="p-2 bg-white rounded border">
                    <QrCode size={45} className="text-neutral-800" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold block text-neutral-800 uppercase tracking-wide">Government IRN QR ready</span>
                    <p className="text-[9px] text-neutral-400 pt-0.5">Scans instantly on GST E-Way Bill portals for verification audits.</p>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="space-y-1.5 text-right font-bold">
                  <div className="text-neutral-500 flex justify-between">
                    <span>Taxable Base Subtotal:</span>
                    <span>{formatINR(viewInvoiceModal.totalBeforeTax)}</span>
                  </div>
                  <div className="text-neutral-500 border-b pb-1.5 flex justify-between text-[10px]">
                    <span>Output Combined GST (CGST+SGST/IGST):</span>
                    <span>{formatINR(viewInvoiceModal.totalTax)}</span>
                  </div>
                  <div className="text-neutral-900 text-sm flex justify-between pt-1 font-black">
                    <span>INVOICE GRAND TOTAL:</span>
                    <span>{formatINR(viewInvoiceModal.grandTotal)}</span>
                  </div>
                  <span className="text-[9px] block text-neutral-400 pt-1 italic font-normal">Amount in Words: Rupee {viewInvoiceModal.grandTotal.toLocaleString('en-IN')} Only</span>
                </div>
              </div>

              {/* Bottom Authority signature box */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-[10px] font-mono font-semibold">
                <div>
                  <span className="text-[8px] text-neutral-400 block uppercase">Terms & Audit Declarations</span>
                  <p className="text-neutral-500 leading-tight">
                    1. We declare that this invoice shows the actual price of the goods described.
                    <br />2. Delay payments attract interest liability of 18% per annum under MSME guidelines.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-between items-end">
                  <span className="text-[8px] text-neutral-400 uppercase block">AUTHORIZED DIGITAL SIGNATURE</span>
                  {digitallySigned[viewInvoiceModal.invoiceNumber!] || viewInvoiceModal.paymentStatus === 'Paid' ? (
                    <div className="text-center pt-2 text-emerald-600">
                      <CheckCircle2 size={24} className="mx-auto" />
                      <span className="text-[8px] block font-bold tracking-widest uppercase">TTGT AUTHORISED SIG CERTIFIED</span>
                    </div>
                  ) : (
                    <div className="border p-2 px-3 border-dashed rounded text-neutral-400 text-center hover:bg-neutral-50 cursor-pointer text-[9px]" onClick={() => triggerDigitalSign(viewInvoiceModal.invoiceNumber!)}>
                      <span>Click to digitally sign</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
