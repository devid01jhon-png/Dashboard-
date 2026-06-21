/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  CornerDownRight, 
  Filter, 
  ShieldAlert, 
  MessageSquare,
  BookmarkCheck
} from 'lucide-react';
import { PimProduct } from './pimTypes';

interface ProductApprovalProps {
  products: PimProduct[];
  onTransitionStatus: (id: string, status: PimProduct['approvalStatus'], remark: string) => void;
}

export default function ProductApproval({
  products,
  onTransitionStatus
}: ProductApprovalProps) {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<PimProduct | null>(null);
  const [reviewRemark, setReviewRemark] = useState('');

  const filtered = products.filter(p => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pending Action') return p.approvalStatus === 'Submitted' || p.approvalStatus === 'Pending Review';
    return p.approvalStatus === activeFilter;
  });

  const getStatusStyle = (status: PimProduct['approvalStatus']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Submitted':
      case 'Pending Review':
        return 'bg-amber-50 text-amber-750 border-amber-100';
      case 'Archived':
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  const submitStatusChange = (status: PimProduct['approvalStatus']) => {
    if (!selectedProduct) return;
    onTransitionStatus(selectedProduct.id, status, reviewRemark.trim() || 'Status changed during PIM panel review.');
    setReviewRemark('');
    setSelectedProduct(null);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Catalog Quality Gates Panel</h2>
        <p className="text-xs text-neutral-500 font-mono">Control material master registries, pricing approvals, and GST classification signs-off.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* APPROVAL LIST BOARD */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4 lg:col-span-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3.5 gap-2">
            <span className="text-xs font-bold font-mono uppercase text-neutral-850 flex items-center gap-1.5">
              <BookmarkCheck size={15} className="text-indigo-600" />
              <span>Catalog Submissions Board ({filtered.length})</span>
            </span>

            <div className="flex bg-neutral-50 p-1 rounded-lg border text-[10px] font-mono font-bold">
              {['All', 'Pending Action', 'Approved', 'Rejected', 'Draft'].map(filterItem => (
                <button
                  key={filterItem}
                  onClick={() => { setActiveFilter(filterItem); setSelectedProduct(null); }}
                  className={`px-3 py-1 rounded transition-colors ${activeFilter === filterItem ? 'bg-white text-indigo-750 shadow-sm border border-neutral-150' : 'text-neutral-500 hover:text-neutral-750'}`}
                >
                  {filterItem}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[480px]">
            {filtered.length === 0 ? (
              <div className="py-20 text-center text-neutral-400 font-sans text-xs">
                No catalog items requiring review match the selected status bracket.
              </div>
            ) : (
              filtered.map(p => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div 
                    key={p.id} 
                    onClick={() => setSelectedProduct(p)}
                    className={`flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer transition ${isSelected ? 'bg-indigo-50/50 border border-indigo-150 shadow-sm' : 'hover:bg-neutral-50'}`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <img 
                        src={p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=100&q=80'} 
                        alt="" 
                        className="h-10 w-10 rounded bg-neutral-50 border object-cover shrink-0" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] bg-neutral-100 font-mono text-neutral-500 font-bold px-1.5 py-0.2 rounded uppercase">{p.sku}</span>
                        <h4 className="font-bold text-neutral-800 text-xs truncate mt-0.5 leading-tight">{p.name}</h4>
                        <span className="text-[9px] text-neutral-450 font-mono block">MRP: ₹{p.mrp || p.sellingPrice} • GST Bracket: {p.gstRate}%</span>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className={`text-[10px] font-bold border rounded px-2.5 py-1 inline-block ${getStatusStyle(p.approvalStatus)}`}>
                        {p.approvalStatus}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* DECISION SIDEBAR */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="border-b pb-2 flex items-center space-x-1.5">
            <ShieldAlert size={15} className="text-indigo-600" />
            <span className="text-xs font-bold font-mono uppercase text-neutral-850">Review Sign-Off Board</span>
          </div>

          {selectedProduct ? (
            <div className="space-y-4.5 animate-in slide-in-from-right-3 duration-200">
              
              <div className="p-3 bg-neutral-50 rounded-lg border space-y-2 text-xs">
                <span className="text-[10.5px] uppercase font-mono font-bold text-neutral-400 block leading-none">Catalog under review</span>
                <strong className="block text-neutral-800 font-bold leading-tight font-sans">{selectedProduct.name}</strong>
                <div className="grid grid-cols-2 gap-1.5 text-[9.5px] font-mono border-t pt-2 mt-1">
                  <div>
                    <span className="text-neutral-400 block uppercase">Product Spec</span>
                    <strong className="text-neutral-600">{selectedProduct.productType} SKU</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block uppercase">Tariff (GST/HSN)</span>
                    <strong className="text-neutral-600">{selectedProduct.gstRate}% GST (HSN {selectedProduct.hsnCode})</strong>
                  </div>
                  <div className="col-span-2 mt-1 py-1 px-1.5 bg-neutral-100/60 rounded text-[9.5px]">
                    <span className="block font-bold">Landed Cost / selling Price:</span>
                    <span className="text-emerald-750 font-extrabold font-sans">₹{selectedProduct.purchasePrice}</span> to <span className="text-emerald-750 font-extrabold font-sans">₹{selectedProduct.sellingPrice}</span>
                  </div>
                </div>
              </div>

              {selectedProduct.approvalRemarks && (
                <div className="p-2.5 bg-indigo-50/40 rounded-lg border text-[10.5px] font-mono leading-relaxed text-indigo-700 flex gap-2">
                  <MessageSquare size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black uppercase text-[9px] text-indigo-400">Previous Gate Comment:</span>
                    <span>"{selectedProduct.approvalRemarks}"</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase block">GATE DECISION COMMENT *</span>
                <textarea 
                  value={reviewRemark}
                  onChange={e => setReviewRemark(e.target.value)}
                  placeholder="e.g. Cleared tariff assessment. Ready for Amazon & warehouse ingest."
                  rows={3}
                  className="w-full bg-neutral-50 p-2.5 border rounded text-xs text-neutral-800 focus:outline-indigo-500 focus:bg-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 pb-2">
                <button 
                  onClick={() => submitStatusChange('Approved')}
                  className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold rounded py-2 transition"
                >
                  Authorize Sign-Off
                </button>
                <button 
                  onClick={() => submitStatusChange('Rejected')}
                  className="w-full bg-rose-600 hover:bg-rose-750 text-white font-bold rounded py-2 transition"
                >
                  Block / Reject SKU
                </button>
              </div>

              <div className="border-t pt-3 flex justify-between text-[11px] font-mono text-neutral-500">
                <span>Advanced operations:</span>
                <button onClick={() => submitStatusChange('Archived')} className="text-indigo-600 hover:underline">Archive SKU Profile</button>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-neutral-400 text-xs">
              Select any SKU from the left listings pane to assess product catalogs, pricing limits and authorize clearance status.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
