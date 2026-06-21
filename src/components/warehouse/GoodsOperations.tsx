/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowRight, 
  Boxes, 
  Check, 
  Layers, 
  MapPin, 
  ShieldCheck, 
  Trash2, 
  Workflow,
  Sparkles,
  ClipboardList,
  Compass
} from 'lucide-react';
import { WmsGoodsReceipt, WmsWarehouseLocation } from '../inventory/wmsTypes';
import { Product } from '../../types';

interface GoodsOperationsProps {
  grns: WmsGoodsReceipt[];
  locations: WmsWarehouseLocation[];
  products: Product[];
  onCommitPutAway: (grnId: string, locationId: string, quantity: number) => void;
}

export default function GoodsOperations({
  grns,
  locations,
  products,
  onCommitPutAway
}: GoodsOperationsProps) {
  // Navigation Tabs: Goods Receiving (GRN) vs Put-away
  const [activeTab, setActiveTab] = useState<'receiving' | 'putaway'>('receiving');

  // Filter pending put-aways
  const pendingPutawayGrns = grns.filter(g => !g.isPutAwayCommitted);

  // States for Put-away actions
  const [selectedGrnId, setSelectedGrnId] = useState('');
  const [chosenLocationId, setChosenLocationId] = useState('');

  const activeGrn = grns.find(g => g.id === selectedGrnId);

  // Compute suggested coordinates based on category match
  const suggestLocations = () => {
    if (!activeGrn) return [];
    
    // Sort locations favoring category tag zones or unallocated slots
    const prod = products.find(p => p.id === activeGrn.productId);
    const categoryQuery = prod ? prod.category.split(' ')[0].toLowerCase() : '';

    return locations.filter(loc => {
      // Return matches belonging to same warehouse and either empty or assigned to the same product code
      const rightWarehouse = loc.warehouseId === 'wh-1'; // simulated Mumbai Central bound
      const matchesCategory = loc.zone.toLowerCase().includes(categoryQuery);
      return rightWarehouse && (!loc.isOccupied || loc.currentProductId === activeGrn.productId);
    });
  };

  const suggestedSlots = suggestLocations();

  // Commit Put-away
  const handleExecutePutAway = () => {
    if (!selectedGrnId || !chosenLocationId) {
      alert('Kindly choose the GRN item and specify put-away location bay.');
      return;
    }

    const loc = locations.find(l => l.id === chosenLocationId)!;
    const locLabel = `${loc.aisle}-${loc.rack}-${loc.shelf}-${loc.bin}`;

    onCommitPutAway(selectedGrnId, chosenLocationId, activeGrn!.acceptedQuantity);
    alert(`✓ Put-away task completed: ${activeGrn!.sku} slotted securely in Bay ${locLabel}.`);
    
    // Reset selection
    setSelectedGrnId('');
    setChosenLocationId('');
  };

  return (
    <div className="space-y-6">
      
      {/* TABS SELECTORS */}
      <div className="flex border-b border-neutral-200 gap-4 text-xs font-mono font-bold uppercase select-none">
        <button
          onClick={() => setActiveTab('receiving')}
          className={`pb-2.5 px-1 border-b-2 transition duration-200 ${activeTab === 'receiving' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-450 hover:text-neutral-850'}`}
        >
          📂 Goods Receiving Logs
        </button>
        <button
          onClick={() => setActiveTab('putaway')}
          className={`pb-2.5 px-1 border-b-2 transition duration-200 ${activeTab === 'putaway' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-450 hover:text-neutral-850'}`}
        >
          💡 Intelligent Put-away ({pendingPutawayGrns.length})
        </button>
      </div>

      {/* A. GOODS RECEIVING LOGS */}
      {activeTab === 'receiving' && (
        <div className="space-y-4">
          <div className="bg-neutral-50 p-4 border rounded-2xl">
            <span className="text-[10px] sm:text-xs font-bold uppercase font-mono tracking-wider text-neutral-800">Static GRN records repository</span>
            <p className="text-[11px] text-neutral-400">View GSTR statutory parameters, e-way cargo logs, and transacted commercial parameters.</p>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b text-[10px] font-mono text-neutral-400 uppercase">
                    <th className="p-3">GRN ID/Date</th>
                    <th className="p-3">Registered Supplier</th>
                    <th className="p-3">Invoice & PO Keys</th>
                    <th className="p-3">SKU & Product Name</th>
                    <th className="p-3">Quantities Received</th>
                    <th className="p-3 text-right">Accounting Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-600">
                  {grns.map(g => (
                    <tr key={g.id} className="hover:bg-neutral-50/20">
                      <td className="p-3 font-mono">
                        <strong className="text-neutral-850 font-bold block">{g.id}</strong>
                        <span className="text-[10px] text-neutral-400 block">{new Date(g.grnDate).toLocaleDateString('en-IN')}</span>
                      </td>
                      <td className="p-3 font-sans font-semibold text-neutral-750">{g.vendorName}</td>
                      <td className="p-3 font-mono text-[10.5px]">
                        <div>Inv: {g.invoiceNumber}</div>
                        <div className="text-neutral-405 mt-0.5">PO: {g.poNumber}</div>
                      </td>
                      <td className="p-3 leading-tight max-w-xs">
                        <span className="font-mono font-bold block uppercase text-neutral-850">{g.sku}</span>
                        <span className="text-[10.5px] text-neutral-450 block truncate">{g.productName}</span>
                      </td>
                      <td className="p-3 font-mono">
                        <div className="text-neutral-850">Accepted: <strong>{g.acceptedQuantity} Pcs</strong></div>
                        {g.rejectedQuantity > 0 && (
                          <div className="text-rose-500 font-bold text-[10px] mt-0.5">Rejected: {g.rejectedQuantity} Pcs (Discrepancy)</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-neutral-850">
                        ₹{g.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* B. PUT-AWAY DOCK ALLOCATION */}
      {activeTab === 'putaway' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* GRNs list pending putaway */}
          <div className="lg:col-span-5 bg-white border p-5 rounded-2xl shadow-sm space-y-4">
            <h5 className="font-bold text-xs font-mono uppercase text-neutral-800 border-b pb-2">Unassigned cargo Dock bay</h5>
            
            {pendingPutawayGrns.length === 0 ? (
              <div className="text-center py-10 font-sans text-xs text-neutral-400 italic">
                ✓ All goods receipt orders completely put away on warehouse shelves.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {pendingPutawayGrns.map(g => {
                  const isSelected = selectedGrnId === g.id;

                  return (
                    <div
                      key={g.id}
                      onClick={() => { setSelectedGrnId(g.id); setChosenLocationId(''); }}
                      className={`p-3.5 rounded-xl border cursor-pointer select-none transition ${isSelected ? 'bg-indigo-50/20 border-indigo-600' : 'bg-neutral-50/55 border-neutral-200 hover:bg-neutral-50'}`}
                    >
                      <div className="flex justify-between items-center border-b pb-1 font-mono text-[10.5px]">
                        <span className="font-bold text-neutral-800">{g.id}</span>
                        <span className="text-neutral-450">Accepted: {g.acceptedQuantity} U</span>
                      </div>
                      <div className="pt-2 text-xs leading-snug">
                        <strong className="font-mono text-neutral-850 uppercase">{g.sku}</strong>
                        <p className="text-neutral-500 text-[10.5px] truncate">{g.productName}</p>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-1">Batch: {g.batchNumber}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location assign segment */}
          <div className="lg:col-span-7 bg-white border p-5 rounded-2xl shadow-sm space-y-4">
            <h5 className="font-bold text-xs font-mono uppercase text-neutral-800 border-b pb-2 flex items-center space-x-1.5">
              <Sparkles size={13} className="text-indigo-600 animate-pulse" />
              <span>Put-away slot layout assigner</span>
            </h5>

            {!activeGrn ? (
              <div className="text-center py-12 text-xs font-sans text-neutral-400 italic">
                Choose an incoming GRN cargo from the docket list to begin allocation.
              </div>
            ) : (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-3 bg-neutral-50 border rounded-xl leading-normal">
                  <span>Selected material SKU: <strong className="font-mono text-neutral-850">{activeGrn.sku}</strong> ({activeGrn.productName})</span>
                </div>

                {/* Suggested location blocks */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider font-mono block">WMS suggested storage shelves (Empty or match SKU)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto">
                    {suggestedSlots.map(loc => {
                      const isSelected = chosenLocationId === loc.id;
                      const locLabel = `${loc.aisle}-${loc.rack}-${loc.shelf}-${loc.bin}`;

                      return (
                        <div
                          key={loc.id}
                          onClick={() => setChosenLocationId(loc.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer select-none transition flex justify-between items-center ${
                            isSelected 
                              ? 'bg-emerald-50/25 border-emerald-600 text-emerald-900 font-bold' 
                              : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <div>
                            <strong className="font-mono block text-[13px]">{locLabel}</strong>
                            <span className="text-[10px] text-neutral-450 block truncate">{loc.zone}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">Limit: {loc.maxWeightCapacityKg}Kg</span>
                        </div>
                      );
                    })}

                    {suggestedSlots.length === 0 && (
                      <div className="col-span-2 text-center py-6 text-neutral-400 italic">
                        No optimal zone compartments resolved inside Mumbai facility. Pick empty coordinate manually under structural layout tab.
                      </div>
                    )}
                  </div>
                </div>

                {/* Execute Putaway */}
                {chosenLocationId && (
                  <button
                    onClick={handleExecutePutAway}
                    className="w-full py-2 bg-neutral-900 border hover:bg-neutral-850 text-white font-mono font-bold uppercase rounded-xl tracking-wide transition text-xs mt-2"
                  >
                    Commit cargo put-away location assignment
                  </button>
                )}

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
