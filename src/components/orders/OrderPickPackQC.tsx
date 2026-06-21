import React, { useState } from 'react';
import { 
  Barcode, 
  Hand, 
  Package, 
  CheckSquare, 
  Printer, 
  ThumbsUp, 
  ThumbsDown, 
  ClipboardCheck, 
  AlertTriangle,
  User,
  ExternalLink
} from 'lucide-react';
import { Order, Product } from '../../types';

interface OrderPickPackQCProps {
  orders: Order[];
  products: Product[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderShipping: (id: string, carrier: Order['courierPartner'], awb: string, eway?: string) => void;
  activeFulfillmentTab: 'picking' | 'packing' | 'qc';
  onNavigateFulfillment: (tab: 'picking' | 'packing' | 'qc') => void;
}

export default function OrderPickPackQC({
  orders,
  products,
  updateOrderStatus,
  updateOrderShipping,
  activeFulfillmentTab,
  onNavigateFulfillment
}: OrderPickPackQCProps) {
  // Common states
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Picking States
  const [pickerName, setPickerName] = useState('Rajesh Nair');
  const [scannedBarcodes, setScannedBarcodes] = useState<string[]>([]);
  const [priorityPickMode, setPriorityPickMode] = useState(false);

  // Packing States
  const [packerName, setPackerName] = useState('Mayur Satwan');
  const [boxDimensions, setBoxDimensions] = useState({ length: 12, width: 12, height: 12 });
  const [boxWeight, setBoxWeight] = useState(0.85); // chargeable kg
  const [packingMaterial, setPackingMaterial] = useState('Heavy Duty Corrugated Box');
  const [checklistVerified, setChecklistVerified] = useState({
    itemsIntact: false,
    paddedProtection: false,
    invoiceCopied: false,
    sealedAirTape: false
  });

  // QC States
  const [qcInspector, setQcInspector] = useState('Aniket Shinde');
  const [qcChecks, setQcChecks] = useState({
    skuMatch: false,
    barcodeMatch: false,
    visualDamagePassed: false,
    packagingApproved: false
  });
  const [qcRemarks, setQcRemarks] = useState('');

  // Filtering orders depending on stages
  const getStageOrders = () => {
    if (activeFulfillmentTab === 'picking') {
      return orders.filter(o => o.status === 'Picking' || o.status === 'Confirmed' || o.status === 'Inventory Reserved');
    }
    if (activeFulfillmentTab === 'packing') {
      return orders.filter(o => o.status === 'Packing' || o.status === 'Picked');
    }
    if (activeFulfillmentTab === 'qc') {
      return orders.filter(o => o.status === 'Quality Check');
    }
    return [];
  };

  const currentStageOrders = getStageOrders();
  const activeOrder = orders.find(o => o.id === selectedOrderId);

  // Print packing slips
  const handlePrintPackingSlip = () => {
    if (!activeOrder) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Packing Slip - ${activeOrder.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 13px; }
            .header { border-bottom: 2px dashed black; padding-bottom: 10px; margin-bottom: 15px; }
            .item-table { width: 100%; border-collapse: collapse; }
            .item-table th, .item-table td { border-bottom: 1px dashed black; padding: 6px; text-align: left; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>TTGT STORAGE - WAREHOUSE PACKING SLIP</h2>
            <p><strong>Order Ref:</strong> ${activeOrder.id} | <strong>Source:</strong> ${activeOrder.marketplace}</p>
            <p><strong>Date:</strong> ${new Date(activeOrder.orderDate).toLocaleDateString('en-GB')}</p>
            <p><strong>Packer Assigned:</strong> ${packerName} | <strong>Weight:</strong> ${boxWeight} Kg</p>
          </div>
          <h3>SKUs checklist block:</h3>
          <table class="item-table">
            <thead>
              <tr><th>SKU</th><th>Description</th><th>Qty</th><th>Picked?</th></tr>
            </thead>
            <tbody>
              ${activeOrder.items.map(it => `
                <tr>
                  <td><strong>${it.sku}</strong></td>
                  <td>${it.productName}</td>
                  <td>${it.quantity}</td>
                  <td>[  ] Yes</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top:20px; font-size:10px;">Please cross-reference all product barcodes before wrapping. Return manifest to QC terminal.</p>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Run Auto Picking Selection
  const triggerAutoPick = () => {
    if (currentStageOrders.length === 0) return;
    const nextOrder = currentStageOrders[0];
    setSelectedOrderId(nextOrder.id);
    setScannedBarcodes([]);
    alert(`⚡ Picking pipeline has auto-selected matching order: ${nextOrder.id}.\nPlease coordinate pickup.`);
  };

  // Actions transitions
  const submitPick = () => {
    if (!activeOrder) return;
    
    // Simple bar validation check matches count of item types
    const totalItemTypes = activeOrder.items.length;
    if (scannedBarcodes.length < totalItemTypes) {
      alert(`⚠️ Validation fail: Please inspect & verify all ${totalItemTypes} distinct product lines before picking.`);
      return;
    }

    updateOrderStatus(activeOrder.id, 'Packing');
    alert(`✓ Master Picking completed for ${activeOrder.id}. Cargo routed to Packing terminal.`);
    setSelectedOrderId('');
    setScannedBarcodes([]);
  };

  const submitPack = () => {
    if (!activeOrder) return;
    if (!checklistVerified.itemsIntact || !checklistVerified.sealedAirTape || !checklistVerified.invoiceCopied) {
      alert('⚠️ Mandatory checklist categories unchecked! Verify weight, documents and tape seals first.');
      return;
    }

    updateOrderStatus(activeOrder.id, 'Quality Check');
    alert(`✓ Dimensions logged [${boxDimensions.length}x${boxDimensions.width}x${boxDimensions.height} cm]. Weight: ${boxWeight} Kg. Forwarding to physical QC Station.`);
    
    // Reset Check marks
    setChecklistVerified({
      itemsIntact: false,
      paddedProtection: false,
      invoiceCopied: false,
      sealedAirTape: false
    });
    setSelectedOrderId('');
  };

  const submitQC = (passed: boolean) => {
    if (!activeOrder) return;

    if (passed) {
      if (!qcChecks.skuMatch || !qcChecks.barcodeMatch || !qcChecks.visualDamagePassed) {
        alert('⚠️ Quality check items must be verified passed in order to authorize routing.');
        return;
      }
      updateOrderStatus(activeOrder.id, 'Ready To Dispatch');
      alert(`✓ QC PASSED for Order ${activeOrder.id}. Sealed cargo marked clean and dispatched to transport loading dock.`);
    } else {
      updateOrderStatus(activeOrder.id, 'Cancelled'); // or back to Pending
      alert(`❌ QC FAIL REGISTERED: Order ${activeOrder.id} logged damaged/mismatch and assigned back to replenishment workflow.`);
    }

    setQcChecks({
      skuMatch: false,
      barcodeMatch: false,
      visualDamagePassed: false,
      packagingApproved: false
    });
    setQcRemarks('');
    setSelectedOrderId('');
  };

  const handleBarcodeMockClick = (sku: string) => {
    if (!scannedBarcodes.includes(sku)) {
      setScannedBarcodes([...scannedBarcodes, sku]);
    }
  };

  return (
    <div className="space-y-6">

      {/* Workflow Selection Top Subbar */}
      <div className="flex bg-neutral-100 p-1.5 rounded-lg border max-w-max select-none">
        <button
          onClick={() => { onNavigateFulfillment('picking'); setSelectedOrderId(''); }}
          className={`px-4.5 py-1.5 rounded text-xs font-bold font-sans flex items-center space-x-2 transition ${
            activeFulfillmentTab === 'picking' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Hand size={13} />
          <span>Picking Floor ({orders.filter(o => o.status === 'Picking' || o.status === 'Confirmed').length})</span>
        </button>
        <button
          onClick={() => { onNavigateFulfillment('packing'); setSelectedOrderId(''); }}
          className={`px-4.5 py-1.5 rounded text-xs font-bold font-sans flex items-center space-x-2 transition ${
            activeFulfillmentTab === 'packing' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package size={13} />
          <span>Packing & Slips ({orders.filter(o => o.status === 'Packing' || o.status === 'Picked').length})</span>
        </button>
        <button
          onClick={() => { onNavigateFulfillment('qc'); setSelectedOrderId(''); }}
          className={`px-4.5 py-1.5 rounded text-xs font-bold font-sans flex items-center space-x-2 transition ${
            activeFulfillmentTab === 'qc' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <CheckSquare size={13} />
          <span>QC Inspection Unit ({orders.filter(o => o.status === 'Quality Check').length})</span>
        </button>
      </div>

      {/* Grid: Left pick lists selection, Right interactive control panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Master Pick lists index */}
        <div className="bg-white rounded-xl border p-4 space-y-4 shadow-sm flex flex-col justify-between h-[500px]">
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">Consignments Queue</span>
              <button
                onClick={triggerAutoPick}
                className="text-[10px] text-orange-650 bg-orange-50 font-bold px-2 py-0.5 rounded border border-orange-100 hover:bg-orange-100 transition"
              >
                Auto Route Order
              </button>
            </div>

            {currentStageOrders.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 italic">
                No orders waiting on this stage. Good job!
              </div>
            ) : (
              <div className="space-y-2">
                {currentStageOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => { setSelectedOrderId(o.id); setScannedBarcodes([]); }}
                    className={`w-full p-3 rounded-lg border text-left flex justify-between items-center transition ${
                      selectedOrderId === o.id ? 'bg-neutral-900 border-neutral-900 text-white' : 'hover:bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold block">{o.id}</span>
                      <span className={`text-[9px] font-bold block ${selectedOrderId === o.id ? 'text-neutral-300' : 'text-neutral-450'}`}>
                        {o.customerName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold text-center block ${
                        o.priority === 'Urgent' ? 'bg-rose-500 text-white animate-pulse' : 'bg-neutral-150 text-neutral-700'
                      }`}>
                        {o.priority || 'Medium'}
                      </span>
                      <span className="text-[9px] opacity-75 font-mono mt-1 block">
                        {o.items.reduce((sum, i) => sum + i.quantity, 0)} units
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="select-none text-[9px] text-neutral-400 font-mono pt-3 border-t text-center leading-normal">
            Realtime dock sync active on port 3000<br/>TTGT ERP Storage Management System
          </div>
        </div>

        {/* Action console depending on tabs */}
        <div className="lg:col-span-2">
          
          {!activeOrder ? (
            <div className="bg-[#FAF9F6] border border-dashed border-neutral-250 rounded-xl p-16 text-center text-xs text-neutral-400 font-sans h-full flex flex-col items-center justify-center">
              <ClipboardCheck size={32} className="text-neutral-300 mb-2" />
              <p className="font-semibold text-neutral-500">No consignment selected from left queue.</p>
              <p className="mt-1">Pick a docket to generate statutory picking sheets, package weights and QC lists.</p>
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-5 shadow-sm space-y-6">
              
              {/* Common Header Info */}
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <span className="text-[10px] tracking-wider uppercase font-mono text-neutral-400 font-bold block">Current Active Docket</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <h3 className="text-base font-bold font-mono text-neutral-900">{activeOrder.id}</h3>
                    <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-mono text-neutral-600 font-bold uppercase">
                      Channel: {activeOrder.marketplace}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-mono text-neutral-400 font-bold block">Assigned Picker/Packer</span>
                  <span className="text-xs font-bold text-neutral-800">{activeFulfillmentTab === 'picking' ? pickerName : packerName}</span>
                </div>
              </div>

              {/* Sub tab content: PICKING */}
              {activeFulfillmentTab === 'picking' && (
                <div className="space-y-5 text-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Assigned Ground Picker</label>
                      <select
                        value={pickerName}
                        onChange={(e) => setPickerName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 font-mono text-neutral-700"
                      >
                        <option value="Rajesh Nair">Rajesh Nair (Aisle A-C)</option>
                        <option value="Mayur Satwan">Mayur Satwan (Aisle D-F)</option>
                        <option value="Abhijit Roy">Abhijit Roy (Bulk Yard)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Pick Priority Routing</label>
                      <button
                        onClick={() => setPriorityPickMode(!priorityPickMode)}
                        className={`w-full py-1.5 rounded font-bold transition flex items-center justify-center space-x-1.5 ${
                          priorityPickMode ? 'bg-indigo-600 text-white' : 'bg-neutral-100 text-neutral-700 border'
                        }`}
                      >
                        <AlertTriangle size={13} />
                        <span>{priorityPickMode ? '⚡ Urgent SLA active' : 'Normal Wave Picking'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono uppercase text-neutral-400 block pb-1 border-b">
                      Aisle Barcode Verified Inventory Checklist ({scannedBarcodes.length}/{activeOrder.items.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
                      {activeOrder.items.map((line, idx) => {
                        const isVerified = scannedBarcodes.includes(line.sku);
                        return (
                          <div key={idx} className="flex justify-between items-center bg-[#FAF9F6] border border-neutral-200 rounded-lg p-2.5">
                            <div>
                              <strong className="text-neutral-800 font-sans block">{line.productName}</strong>
                              <span className="font-mono text-[9px] text-neutral-400 block mt-0.5">
                                SKU: {line.sku} | HSN: {line.hsnCode} | Aisle Shelf Placement: <strong>A3-L2</strong>
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="font-mono font-bold text-neutral-800 text-[11px] shrink-0">Qty: {line.quantity} pcs</span>
                              {isVerified ? (
                                <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-1.5 border border-emerald-100 rounded text-[9px] font-mono flex items-center">
                                  ✓ Verified
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleBarcodeMockClick(line.sku)}
                                  className="bg-neutral-900 text-white font-mono hover:bg-neutral-800 font-bold px-2 py-1 rounded text-[9px] flex items-center"
                                >
                                  <Barcode size={10} className="mr-1 shrink-0" />
                                  Scan Barcode
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-4 select-none">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId('')}
                      className="bg-neutral-100 px-4 py-2 rounded-lg text-xs hover:bg-neutral-200"
                    >
                      Dismiss Sheet
                    </button>
                    <button
                      type="button"
                      onClick={submitPick}
                      disabled={scannedBarcodes.length < activeOrder.items.length}
                      className={`font-semibold text-xs px-4 py-2 rounded-lg transition ${
                        scannedBarcodes.length === activeOrder.items.length
                          ? 'bg-neutral-900 hover:bg-neutral-850 text-white'
                          : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                    >
                      Complete Wave Pick
                    </button>
                  </div>

                </div>
              )}

              {/* Sub tab content: PACKING */}
              {activeFulfillmentTab === 'packing' && (
                <div className="space-y-5 text-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Fulfillment Packer Name</label>
                      <input
                        type="text"
                        value={packerName}
                        onChange={(e) => setPackerName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Sealing Material</label>
                      <select
                        value={packingMaterial}
                        onChange={(e) => setPackingMaterial(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 font-mono"
                      >
                        <option value="Heavy Duty Corrugated Box">Heavy Duty Corrugated Box (12x12x12)</option>
                        <option value="Tear-proof Poly Mailer Bag">Tear-proof Poly Mailer Bag</option>
                        <option value="Padded Bubble Wrap Wrap">Padded Bubble Wrap Warp</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Consignment Actual Weight (Kg)</label>
                      <input
                        type="number"
                        step={0.01}
                        value={boxWeight}
                        onChange={(e) => setBoxWeight(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1.5 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Box Length (Cm)</label>
                      <input
                        type="number"
                        value={boxDimensions.length}
                        onChange={(e) => setBoxDimensions({...boxDimensions, length: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Box Width (Cm)</label>
                      <input
                        type="number"
                        value={boxDimensions.width}
                        onChange={(e) => setBoxDimensions({...boxDimensions, width: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Box Height (Cm)</label>
                      <input
                        type="number"
                        value={boxDimensions.height}
                        onChange={(e) => setBoxDimensions({...boxDimensions, height: Math.max(1, parseInt(e.target.value) || 1)})}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Packing Check list */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border space-y-3 font-mono">
                    <span className="text-[10px] font-bold font-mono uppercase text-neutral-400 block pb-1 border-b">
                      Pre-dispatch Packing Compliance Check list
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] select-none text-neutral-700">
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={checklistVerified.itemsIntact}
                          onChange={(e) => setChecklistVerified({...checklistVerified, itemsIntact: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Physical Items count & SKU matches exactly</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={checklistVerified.paddedProtection}
                          onChange={(e) => setChecklistVerified({...checklistVerified, paddedProtection: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Padded thermo bubble/foam wraps added</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={checklistVerified.invoiceCopied}
                          onChange={(e) => setChecklistVerified({...checklistVerified, invoiceCopied: e.checked === undefined ? !checklistVerified.invoiceCopied : false})} // quick toggle mock
                          onClick={() => setChecklistVerified({...checklistVerified, invoiceCopied: !checklistVerified.invoiceCopied})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Tax Invoice original copied folded in envelope</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={checklistVerified.sealedAirTape}
                          onChange={(e) => setChecklistVerified({...checklistVerified, sealedAirTape: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Security safety tape sealed on all box slits</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t pt-4">
                    <button
                      type="button"
                      onClick={handlePrintPackingSlip}
                      className="bg-neutral-100 hover:bg-neutral-205 text-neutral-700 font-bold px-3 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition select-none"
                    >
                      <Printer size={13} />
                      <span>Print Wave Document Slip</span>
                    </button>
                    <div className="flex gap-2 select-none">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId('')}
                        className="bg-neutral-100 px-4 py-2 rounded-lg text-xs hover:bg-neutral-202"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={submitPack}
                        className="bg-neutral-900 hover:bg-neutral-850 text-white font-bold text-xs px-4 py-2 rounded-lg"
                      >
                        Sign packing & seal cargo
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Sub tab content: REGULAR QC STAGE */}
              {activeFulfillmentTab === 'qc' && (
                <div className="space-y-5 text-xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Fulfillment QC Inspector Signature</label>
                      <input
                        type="text"
                        value={qcInspector}
                        onChange={(e) => setQcInspector(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Defects Log Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Clean pass, zero visual defects"
                        value={qcRemarks}
                        onChange={(e) => setQcRemarks(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded px-2.5 py-1.5 outline-none"
                      />
                    </div>
                  </div>

                  {/* Checklist checks */}
                  <div className="bg-[#FAF9F6] p-4 border rounded-xl space-y-3 font-mono">
                    <span className="text-[10px] font-bold font-mono uppercase text-neutral-400 block pb-1 border-b">
                      Statutory QC Pass Requirements
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-neutral-700 select-none">
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={qcChecks.skuMatch}
                          onChange={(e) => setQcChecks({...qcChecks, skuMatch: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Physical SKU barcode match catalog standard</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={qcChecks.barcodeMatch}
                          onChange={(e) => setQcChecks({...qcChecks, barcodeMatch: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Serial/IMEI numbers logged (if applicable)</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={qcChecks.visualDamagePassed}
                          onChange={(e) => setQcChecks({...qcChecks, visualDamagePassed: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Zero physical product surface scratches or visual damage</span>
                      </label>
                      <label className="flex items-center space-x-2 border rounded p-2 bg-white cursor-pointer hover:bg-neutral-50">
                        <input
                          type="checkbox"
                          checked={qcChecks.packagingApproved}
                          onChange={(e) => setQcChecks({...qcChecks, packagingApproved: e.target.checked})}
                          className="rounded text-neutral-900 border-neutral-300 focus:ring-0"
                        />
                        <span>Wrapping verified, HSN address labels visible</span>
                      </label>
                    </div>
                  </div>

                  {/* QC pass fail triggers */}
                  <div className="flex justify-end gap-2 border-t pt-4 select-none">
                    <button
                      type="button"
                      onClick={() => submitQC(false)}
                      className="bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg text-xs hover:bg-rose-100 font-bold flex items-center space-x-1"
                    >
                      <ThumbsDown size={12} />
                      <span>Log Fail & Hold Cargo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => submitQC(true)}
                      className="bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-neutral-850 flex items-center space-x-1"
                    >
                      <ThumbsUp size={12} />
                      <span>Generate QC Pass & Forward</span>
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
