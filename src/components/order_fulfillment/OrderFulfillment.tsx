/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Check, 
  MapPin, 
  Printer, 
  Truck, 
  Boxes, 
  Compass, 
  Barcode, 
  Sliders, 
  Cpu, 
  UserPlus
} from 'lucide-react';
import { Order, Product } from '../../types';
import { WmsDispatchLog } from '../inventory/wmsTypes';

interface OrderFulfillmentProps {
  orders: Order[];
  products: Product[];
  dispatches: WmsDispatchLog[];
  onCommitDispatch: (log: WmsDispatchLog) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export default function OrderFulfillment({
  orders,
  products,
  dispatches,
  onCommitDispatch,
  onUpdateOrderStatus
}: OrderFulfillmentProps) {
  // Navigation Tabs: Picking, Packing, Dispatch
  const [activeFulfillmentTab, setActiveFulfillmentTab] = useState<'pick' | 'pack' | 'dispatch'>('pick');

  // Active Pick Order state
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Pick checklist checkpoints state (checkbox logs)
  const [pickedItemIds, setPickedItemIds] = useState<string[]>([]);

  // Packing specifications state
  const [packageLength, setPackageLength] = useState(30);
  const [packageWidth, setPackageWidth] = useState(20);
  const [packageHeight, setPackageHeight] = useState(15);
  const [packageWeight, setPackageWeight] = useState(1.5);
  const [isPackedCorrect, setIsPackedCorrect] = useState(false);

  // Dispatch parameters state
  const [courierPartner, setCourierPartner] = useState('Delhivery B2B express');
  const [vehicleNo, setVehicleNo] = useState('MH-04-EY-9002');
  const [driverName, setDriverName] = useState('Raju Srivastav');
  const [driverContact, setDriverContact] = useState('+91 97654 32100');
  const [ewayBillNo, setEwayBillNo] = useState('');

  // Volumetric Weight Calculations (L * W * H / 5000 standard)
  const calculatedVolumetricWeight = parseFloat(((packageLength * packageWidth * packageHeight) / 5000).toFixed(2));
  const chargeableWeight = Math.max(packageWeight, calculatedVolumetricWeight);

  // Handle Pick completion
  const handleCompletePicking = () => {
    if (!selectedOrderId) return;
    onUpdateOrderStatus(selectedOrderId, 'Picked');
    alert(`✓ Picking checklist completed for Order ${selectedOrderId}. Cargo routed to packaging terminal.`);
    
    // Reset pick checklists
    setPickedItemIds([]);
    setActiveFulfillmentTab('pack'); // advance to packing
  };

  // Handle Packing completion
  const handleCompletePacking = () => {
    if (!selectedOrderId) return;
    setIsPackedCorrect(true);
    onUpdateOrderStatus(selectedOrderId, 'Packed');
    alert(`✓ Box dimension logs registered! Volumetric chargeable weight: ${chargeableWeight} Kg. Shipping slip generated.`);
    setActiveFulfillmentTab('dispatch'); // advance to dispatch
  };

  // Handle Dispatch submit (with Delhivery/e-Way configuration)
  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    const matchedOrd = orders.find(o => o.id === selectedOrderId)!;
    
    // Generate e-Way bill if goods value > ₹50,000 index (statutory limit in India)
    const orderTotal = matchedOrd.items.reduce((acc, i) => acc + i.subtotal, 0);
    const requiresEwayBill = orderTotal > 50000;
    const generatedEway = ewayBillNo || (requiresEwayBill ? `29${Math.floor(1000000000 + Math.random() * 9000000000)}` : '');

    if (requiresEwayBill && !generatedEway) {
      alert('Mandatory Rule: CGST e-Way Bill registration mandatory for invoice amounts exceeding ₹50,000 INR.');
      return;
    }

    const newDispatch: WmsDispatchLog = {
      id: `DISP-B2B-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: selectedOrderId,
      customerName: matchedOrd.customerName,
      dispatchDate: new Date().toISOString(),
      courierPartner,
      trackingNumber: `AWB${Math.floor(100000000 + Math.random() * 900000005)}`,
      vehicleDetails: vehicleNo,
      driverName,
      driverContact,
      packageWeightKg: chargeableWeight,
      dimensionsCm: `${packageLength}x${packageWidth}x${packageHeight}`,
      ewayBillNumber: generatedEway || undefined,
      status: 'Dispatched'
    };

    onCommitDispatch(newDispatch);
    onUpdateOrderStatus(selectedOrderId, 'Dispatched'); // completes full loop
    alert(`🚀 Dispatch completed! Courier cargo loaded onto vehicle: ${newDispatch.vehicleDetails}.\nStatus set to shipped.`);
    
    // Reset
    setSelectedOrderId('');
    setIsPackedCorrect(false);
  };

  return (
    <div className="space-y-6">
      
      {/* TABS SELECTORS */}
      <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-mono font-bold select-none max-w-md">
        <button
          onClick={() => { setActiveFulfillmentTab('pick'); setPickedItemIds([]); }}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${activeFulfillmentTab === 'pick' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          ⛏️ Active Picking
        </button>
        <button
          onClick={() => setActiveFulfillmentTab('pack')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${activeFulfillmentTab === 'pack' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          📦 Bubble-Wrap Packing
        </button>
        <button
          onClick={() => { setActiveFulfillmentTab('dispatch'); }}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${activeFulfillmentTab === 'dispatch' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          🚛 Courier Dispatch
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* VIEW 1: ACTIVE PIPELINE ORDERS */}
        <div className="lg:col-span-5 bg-white border p-5 rounded-2xl shadow-sm space-y-4">
          <h5 className="font-bold text-xs font-mono uppercase text-neutral-800 border-b pb-2">Orders pipeline</h5>
          
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {orders.filter(o => o.status !== 'Delivered').length === 0 ? (
              <div className="text-center py-10 font-sans text-xs text-neutral-400 italic">
                ✓ All active marketplace orders processed.
              </div>
            ) : (
              orders.filter(o => o.status !== 'Delivered').map(o => {
                const isSelected = selectedOrderId === o.id;
                
                // Colors layout code relative to status stage
                const orderVal = o.items.reduce((acc, i) => acc + i.subtotal, 0);

                return (
                  <div
                    key={o.id}
                    onClick={() => { setSelectedOrderId(o.id); setPickedItemIds([]); }}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition space-y-2 ${isSelected ? 'bg-indigo-50/20 border-indigo-600' : 'bg-neutral-50/50 border-neutral-200 hover:bg-neutral-50'}`}
                  >
                    <div className="flex justify-between items-center border-b pb-1 font-mono text-[10px]">
                      <span className="font-bold text-neutral-850">{o.id}</span>
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-black">{o.status}</span>
                    </div>
                    <div className="text-xs leading-normal font-sans text-neutral-750">
                      <strong>{o.customerName}</strong>
                      <div className="text-[10px] text-neutral-400 font-mono mt-0.5">Value: ₹{orderVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })} • State: {o.customerState}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* VIEW 2: LOGISTIC ACTIONS */}
        <div className="lg:col-span-7 bg-white border p-5 rounded-2xl shadow-sm space-y-4 text-xs font-sans">
          
          {/* A. PICKING OPERATION SHEETS */}
          {activeFulfillmentTab === 'pick' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2 flex-wrap gap-2">
                <h5 className="font-black text-xs font-mono uppercase text-neutral-800">Checklist pick guidelines</h5>
                {activeOrder && (
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded block">PICK ROUTE PREPARED (FIFO)</span>
                )}
              </div>

              {!activeOrder ? (
                <div className="text-center py-14 text-neutral-400 italic">
                  Select a pending B2B customer order from the pipeline tracking list.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-50 border rounded-xl leading-normal space-y-1">
                    <div>Shipping Address: <strong className="text-neutral-850 font-bold">{activeOrder.shippingAddress}, {activeOrder.customerState}</strong></div>
                    <div className="text-[10.5px] text-neutral-400 font-mono">Channel: {activeOrder.marketplace} | ID: {activeOrder.marketplaceOrderId}</div>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-mono block">Line items checklist</span>
                    
                    {activeOrder.items.map(item => {
                      const isChecked = pickedItemIds.includes(item.id);

                      return (
                        <div key={item.id} className="p-3 bg-neutral-50/50 border rounded-xl flex items-center justify-between font-mono text-xs select-none">
                          <div className="space-y-1 font-sans">
                            <strong className="text-neutral-850 font-mono block font-bold text-[12px]">{item.sku}</strong>
                            <span className="text-[11px] text-neutral-500 block leading-tight">{item.productName}</span>
                            <span className="text-[10px] text-indigo-700 block font-mono">Suggested Slot: Aisle A-1-S1 (BOM Central)</span>
                          </div>
                          
                          <div className="flex items-center space-x-4 shrink-0 text-right">
                            <strong className="text-neutral-900 text-sm">{item.quantity} U</strong>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setPickedItemIds(p => [...p, item.id]);
                                else setPickedItemIds(p => p.filter(it => it !== item.id));
                              }}
                              className="rounded border-neutral-300 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pickedItemIds.length === activeOrder.items.length && (
                    <button
                      onClick={handleCompletePicking}
                      className="w-full py-2 bg-neutral-900 border hover:bg-neutral-850 text-white font-mono font-bold uppercase rounded-xl tracking-wide transition text-xs select-none"
                    >
                      Verify items & route to packaging deck
                    </button>
                  )}

                </div>
              )}
            </div>
          )}

          {/* B. BUBBLE WRAP PACKAGING ACTIONS */}
          {activeFulfillmentTab === 'pack' && (
            <div className="space-y-4">
              <h5 className="font-bold text-xs font-mono uppercase text-neutral-800 border-b pb-2">Double-Wall Carton Packaging Registry</h5>

              {!activeOrder ? (
                <div className="text-center py-14 text-neutral-400 italic">Select an active order.</div>
              ) : (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-neutral-50 border rounded-xl font-sans leading-normal">
                    <span>Active Package target: <strong className="font-mono text-neutral-850">{activeOrder.id}</strong> (Client: {activeOrder.customerName})</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Carton length (Cm)</label>
                      <input
                        type="number"
                        value={packageLength}
                        onChange={(e) => setPackageLength(parseInt(e.target.value) || 10)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Carton width (Cm)</label>
                      <input
                        type="number"
                        value={packageWidth}
                        onChange={(e) => setPackageWidth(parseInt(e.target.value) || 10)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Carton height (Cm)</label>
                      <input
                        type="number"
                        value={packageHeight}
                        onChange={(e) => setPackageHeight(parseInt(e.target.value) || 10)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Actual Gross Weight (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(parseFloat(e.target.value) || 0.5)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Volumetric calculation Cradle */}
                  <div className="bg-neutral-50 border border-neutral-250 p-4 rounded-xl space-y-1 font-mono text-xs">
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider block">B2B Cargo Volumetric sizing (Delhivery density match)</span>
                    <div className="flex justify-between items-center text-neutral-700">
                      <span>Volumetric Weight:</span>
                      <strong>{calculatedVolumetricWeight} Kg</strong>
                    </div>
                    <div className="flex justify-between items-center text-neutral-700">
                      <span>Actual Weight:</span>
                      <strong>{packageWeight} Kg</strong>
                    </div>
                    <div className="border-t border-dashed pt-1.5 flex justify-between font-bold text-neutral-900">
                      <span>Billable Chargeable Weight:</span>
                      <span className="text-indigo-700">{chargeableWeight} Kg</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePacking}
                    className="w-full py-2 bg-neutral-900 border hover:bg-neutral-850 text-white font-mono font-bold uppercase rounded-xl tracking-wide text-xs"
                  >
                    Register weight logs & generate shipping slips
                  </button>
                </div>
              )}
            </div>
          )}

          {/* C. COURIER DISPATCH OPERATIONS */}
          {activeFulfillmentTab === 'dispatch' && (
            <form onSubmit={handleExecuteDispatch} className="space-y-4">
              <h5 className="font-bold text-xs font-mono uppercase text-neutral-800 border-b pb-2">Outward vehicle dispatches & SLA dispatch</h5>

              {!activeOrder ? (
                <div className="text-center py-14 text-neutral-400 italic">Please select order.</div>
              ) : (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 bg-neutral-50 border rounded-xl font-sans leading-normal space-y-0.5">
                    <div>Dispatch target: <strong className="font-mono text-neutral-800">{activeOrder.id}</strong> (Ship: {activeOrder.customerName}, Value: ₹{activeOrder.items.reduce((acc, i) => acc + i.subtotal, 0).toLocaleString()})</div>
                    {activeOrder.items.reduce((acc, i) => acc + i.subtotal, 0) > 50000 && (
                      <span className="text-rose-600 block text-[10px] font-black uppercase">⚠️ GST LAW: INVOICE EXCEEDS ₹50,000 INR. MANDATORY DIGITAL e-WAY BILL REQUIRED!</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Courier Cargo Partner</label>
                      <select
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      >
                        <option value="Delhivery B2B express">Delhivery B2B cargo express</option>
                        <option value="Blue Dart Aviation DHL">Blue Dart Aviation DHL cargo</option>
                        <option value="Gati KWE Logistics">Gati KWE surface cargo</option>
                        <option value="Direct dedicated tempo">Custom local tempo truck</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Mandatory GST e-way bill number</label>
                      <input
                        type="text"
                        placeholder="12 digit statutory number"
                        value={ewayBillNo}
                        onChange={(e) => setEwayBillNo(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                        required={activeOrder.items.reduce((acc, i) => acc + i.subtotal, 0) > 50000}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Vehicle code / registration no</label>
                      <input
                        type="text"
                        placeholder="e.g. MH-43-AG-2931"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-neutral-450 uppercase">Driver designation name</label>
                      <input
                        type="text"
                        placeholder="Sanjay Dutt"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-neutral-900 border hover:bg-neutral-850 text-white font-mono font-bold uppercase rounded-xl tracking-wide text-xs"
                  >
                    Commit Outward shipment & generate Delhivery cargo label
                  </button>
                </div>
              )}
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
