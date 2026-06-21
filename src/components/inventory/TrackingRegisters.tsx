/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BadgeAlert, 
  Calendar, 
  Check, 
  Clock, 
  Eye, 
  Lock, 
  RefreshCw, 
  ShieldAlert, 
  Slash, 
  Sliders, 
  SortAsc,
  UserCheck,
  Package,
  ArrowRight,
  TrendingDown,
  Printer
} from 'lucide-react';
import { Product, Vendor } from '../../types';
import { WmsBatchMaster, WmsSerialNumber } from './wmsTypes';

interface TrackingRegistersProps {
  products: Product[];
  vendors: Vendor[];
  batches: WmsBatchMaster[];
  serialNumbers: WmsSerialNumber[];
  onUpdateBatchStatus: (id: string, newStatus: WmsBatchMaster['status']) => void;
  onRegisterSerial: (newSerial: WmsSerialNumber) => void;
  onGeneratePOIndent: (productId: string, qty: number) => void;
}

export default function TrackingRegisters({
  products,
  vendors,
  batches,
  serialNumbers,
  onUpdateBatchStatus,
  onRegisterSerial,
  onGeneratePOIndent
}: TrackingRegistersProps) {
  // Registers sub-tabs
  const [activeTab, setActiveTab] = useState<'batch' | 'serial' | 'expiry' | 'reorder'>('batch');

  // Serialization generator inputs
  const [newSrNo, setNewSrNo] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Filtering lists
  const nearExpiryBatches = batches.filter(b => {
    const daysLeft = Math.floor((new Date(b.expiryDate).getTime() - Date.now()) / (24 * 3600 * 1000));
    return b.status !== 'Expired' && daysLeft < 180; // Expiring inside 6 months
  });

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStockLevel);

  // Serial Registration submit
  const handleSerialRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !newSrNo) {
      alert('Kindly choose product and input valid Serial alphanumeric string.');
      return;
    }

    const matchedProd = products.find(p => p.id === selectedProductId)!;
    const newSerialObj: WmsSerialNumber = {
      id: `sno-${Date.now()}`,
      serialNumber: newSrNo.toUpperCase(),
      productId: selectedProductId,
      productName: matchedProd.name,
      sku: matchedProd.sku,
      warehouseId: 'wh-1',
      locationLabel: 'BOM-Aisle-01',
      status: 'In Stock',
      createdAt: new Date().toISOString()
    };

    onRegisterSerial(newSerialObj);
    alert(`Success: Registered serial key ${newSerialObj.serialNumber} into active registry.`);
    setNewSrNo('');
  };

  return (
    <div className="space-y-6">
      
      {/* REGISTER REGLATORS TABS */}
      <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-mono font-bold select-none max-w-lg">
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'batch' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          📦 BATCH MANAGEMENT
        </button>
        <button
          onClick={() => setActiveTab('serial')}
          className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'serial' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          🔢 SERIAL LOGS
        </button>
        <button
          onClick={() => setActiveTab('expiry')}
          className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'expiry' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          ⏳ EXPIRED (FEFO)
        </button>
        <button
          onClick={() => setActiveTab('reorder')}
          className={`flex-1 py-2 rounded-lg text-center transition ${activeTab === 'reorder' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          🚨 SAFETY BUFFER
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
        
        {/* A. BATCH MANAGEMENT */}
        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="text-sm font-bold text-neutral-850">Regulatory Batch Ledger Registers</h4>
                <p className="text-[11px] text-neutral-400">Track raw materials production lots, manufacturing datelines and compliance release status.</p>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{batches.length} active lots</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-150 text-[10px] font-mono text-neutral-400 uppercase">
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Product SKU</th>
                    <th className="p-3">Mfg / Expiry</th>
                    <th className="p-3">Supplier Lot Ref</th>
                    <th className="p-3">Lot Status</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3 text-right">Quarantine actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-600 font-sans">
                  {batches.map(b => (
                    <tr key={b.id} className="hover:bg-neutral-50/20">
                      <td className="p-3 font-mono font-bold text-neutral-850">{b.batchNumber}</td>
                      <td className="p-3 font-mono leading-tight">
                        <strong>{b.sku}</strong>
                        <span className="text-[10px] text-neutral-400 block truncate max-w-xs">{b.productName}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div>Mfg: {b.manufacturingDate}</div>
                        <div className="text-neutral-405 mt-0.5">Exp: {b.expiryDate}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">{b.supplierBatchNumber}</td>
                      <td className="p-3 leading-none">
                        {b.status === 'Released' ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-100">RELEASED</span>
                        ) : b.status === 'Quarantined' ? (
                          <span className="bg-rose-50 text-rose-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-rose-100">QUARANTINED</span>
                        ) : (
                          <span className="bg-amber-50 text-amber-850 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-amber-100">{b.status}</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-neutral-800">{b.quantity} Box</td>
                      <td className="p-3 text-right font-mono">
                        <select
                          id={`batch-status-${b.id}`}
                          value={b.status}
                          onChange={(e) => onUpdateBatchStatus(b.id, e.target.value as any)}
                          className="bg-neutral-50 border rounded px-2 py-1 text-[10px] focus:outline-none focus:border-neutral-900"
                        >
                          <option value="Released">Release ✔️</option>
                          <option value="Quarantined">Quarantine 🚨</option>
                          <option value="Under Inspection">Inspect 🔍</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* B. SERIAL REGISTER MANAGEMENT */}
        {activeTab === 'serial' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3">
              <div>
                <h4 className="text-sm font-bold text-neutral-850">Individual Serial Key tracking registry</h4>
                <p className="text-[11px] text-neutral-400">Register and check specific warranties on individual devices (IMEI/Router standards).</p>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{serialNumbers.length} tracking nodes</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <form onSubmit={handleSerialRegister} className="bg-neutral-55 border p-4 rounded-xl space-y-3 font-mono text-xs">
                <span className="text-[10px] font-bold text-neutral-500 block uppercase">Manual Serial Provisioning</span>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 block font-bold">Catalog SKU</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-white border rounded p-1.5 font-mono"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-neutral-400 block font-bold">Serial alphanumeric code</label>
                  <input
                    type="text"
                    placeholder="SR-HDMI-932-XYZ"
                    value={newSrNo}
                    onChange={(e) => setNewSrNo(e.target.value)}
                    className="w-full bg-white border rounded p-1.5 font-mono"
                    required
                  />
                </div>

                <button type="submit" className="w-full py-1.5 bg-neutral-900 text-white font-bold rounded uppercase text-[10px]">
                  Register Serial Key ID
                </button>
              </form>

              <div className="lg:col-span-2 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b text-[10px] font-mono text-neutral-400 uppercase">
                      <th className="p-3">Serial ID</th>
                      <th className="p-3">SKU & Label Name</th>
                      <th className="p-3">Physical Location</th>
                      <th className="p-3">Registry Warranty Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-neutral-600 font-mono">
                    {serialNumbers.map(s => (
                      <tr key={s.id} className="hover:bg-neutral-50/20">
                        <td className="p-3 font-bold text-neutral-850">{s.serialNumber}</td>
                        <td className="p-3 text-[11px] font-sans">
                          <strong>{s.sku}</strong>
                          <span className="text-[10px] text-neutral-400 block truncate max-w-xs">{s.productName}</span>
                        </td>
                        <td className="p-3 text-[11px]">{s.locationLabel || 'Central Loading Bay'}</td>
                        <td className="p-3 leading-none">
                          <span className="inline-flex font-bold px-2 py-0.5 rounded text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700">
                            {s.status}
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

        {/* C. EXPIRY MANAGEMENT (FEFO BUCKETS) */}
        {activeTab === 'expiry' && (
          <div className="space-y-4">
            <div className="space-y-1 border-b pb-2">
              <h4 className="text-sm font-bold text-neutral-850">First-Expired, First-Out (FEFO) safety monitor</h4>
              <p className="text-[11px] text-neutral-400">Minimize write-down liabilities on expiring raw polymer materials and packed components prior to blockdates.</p>
            </div>

            {nearExpiryBatches.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 italic text-xs bg-neutral-50 rounded-xl">
                Zero active batch material lots within expiry warnings thresholds (180 days limit).
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearExpiryBatches.map(b => {
                  const daysLeft = Math.floor((new Date(b.expiryDate).getTime() - Date.now()) / (24 * 3600 * 1000));
                  const percentLeft = Math.max(0, Math.min(100, Math.round((daysLeft / 365) * 100)));

                  return (
                    <div key={b.id} className="bg-stone-50 border border-neutral-250 p-4 rounded-xl space-y-3 text-xs flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start font-mono">
                          <strong className="text-stone-900 text-sm">{b.batchNumber}</strong>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${daysLeft < 90 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800'}`}>
                            {daysLeft} days remaining
                          </span>
                        </div>
                        <p className="text-neutral-500 font-sans">
                          Product: <strong>{b.sku}</strong> - {b.productName}
                        </p>
                        <span className="text-[10px] font-mono text-neutral-400 block">Warehouse Logged: BOM-MAIN-01  • Exp Date: {b.expiryDate}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-[10px] font-mono text-stone-550 justify-between">
                          <span>Expiry safety gauge:</span>
                          <strong>{percentLeft}% cycle</strong>
                        </div>
                        <div className="bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${daysLeft < 90 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${percentLeft}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-2 font-mono text-[10px] pt-1 border-t border-stone-200 select-none">
                        <button
                          onClick={() => {
                            onUpdateBatchStatus(b.id, 'Quarantined');
                            alert(`Batch ${b.batchNumber} locked from outward order pipelines.`);
                          }}
                          className="flex-1 py-1 bg-neutral-900 text-white rounded text-center hover:bg-neutral-800 uppercase font-black"
                        >
                          Trigger quarantine
                        </button>
                        <button
                          onClick={() => alert(`Creating clearance sale catalog campaign for ${b.sku}`)}
                          className="flex-1 py-1 bg-stone-200 text-stone-800 rounded text-center hover:bg-stone-300 uppercase font-bold"
                        >
                          Discount promo Run
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* D. SAFETY REORDER ALERTS */}
        {activeTab === 'reorder' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h4 className="text-sm font-bold text-neutral-850">Safety Buffer depletion warnings (Procuring planner)</h4>
              <p className="text-[11px] text-neutral-400">Automatic procurement suggestions triggered by live ledger shelf stock falling below minimum limit boundaries.</p>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 italic text-xs bg-neutral-50 rounded-xl">
                All SKUs correctly structured with safety buffer compliance levels.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map(p => {
                  const vend = vendors.find(v => v.id === p.vendorId);
                  const recommendQty = Math.max(50, p.minStockLevel * 3 - p.currentStock);

                  return (
                    <div key={p.id} className="bg-red-50/20 border border-red-150 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <strong className="text-neutral-800 font-mono text-[13px]">{p.sku}</strong>
                          <span className="text-[9px] bg-red-100 text-red-800 border border-red-200 rounded px-1.5 font-bold font-mono">DEPLETED</span>
                        </div>
                        <p className="font-sans text-neutral-500 leading-snug">
                          {p.name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-450 leading-none">
                          <span>Vendor Party: <strong>{vend?.companyName || 'Apex Pack'}</strong></span>
                          <span>Min Threshold: {p.minStockLevel} U</span>
                          <span>In Stock: <strong className="text-rose-600">{p.currentStock} U</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 font-mono text-[11px]">
                        <div className="text-right hidden sm:block">
                          <span className="text-neutral-405 block text-[10px]">Indenting proposal:</span>
                          <strong className="text-neutral-800 block">{recommendQty} Pcs</strong>
                        </div>
                        <button
                          id={`generate-po-indent-${p.id}`}
                          onClick={() => onGeneratePOIndent(p.id, recommendQty)}
                          className="px-3.5 py-1.5 bg-neutral-900 border hover:bg-neutral-850 text-white rounded-lg text-xs font-bold uppercase transition"
                        >
                          Generate PO Indent
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
