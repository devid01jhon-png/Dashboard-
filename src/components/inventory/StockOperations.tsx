/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  SlidersHorizontal, 
  Plus, 
  Check, 
  X,
  FileCheck2,
  Lock,
  Compass,
  AlertTriangle,
  BookmarkCheck,
  Zap,
  Printer
} from 'lucide-react';
import { Product, Vendor } from '../../types';
import { 
  WmsWarehouse, 
  WmsWarehouseLocation, 
  WmsStockTransfer, 
  WmsStockAdjustment, 
  WmsGoodsReceipt,
  WmsBatchMaster
} from './wmsTypes';

interface StockOperationsProps {
  products: Product[];
  vendors: Vendor[];
  warehouses: WmsWarehouse[];
  locations: WmsWarehouseLocation[];
  batches: WmsBatchMaster[];
  transfers: WmsStockTransfer[];
  adjustments: WmsStockAdjustment[];
  grns: WmsGoodsReceipt[];
  onCommitTransfer: (transfer: WmsStockTransfer) => void;
  onCommitAdjustment: (adjustment: WmsStockAdjustment) => void;
  onCommitGrn: (grn: WmsGoodsReceipt) => void;
  onApproveTransfer: (id: string, adminEmail: string) => void;
  onApproveAdjustment: (id: string, adminEmail: string) => void;
}

export default function StockOperations({
  products,
  vendors,
  warehouses,
  locations,
  batches,
  transfers,
  adjustments,
  grns,
  onCommitTransfer,
  onCommitAdjustment,
  onCommitGrn,
  onApproveTransfer,
  onApproveAdjustment
}: StockOperationsProps) {
  // Operational Tab state inside operations
  const [activeSubTab, setActiveSubTab] = useState<'inward' | 'outward' | 'transfer' | 'adjust' | 'approvals'>('inward');

  // Forms states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState(10);
  const [selectedBatch, setSelectedBatch] = useState('');
  
  // Tab-specific form trackers
  // Inward Case
  const [inwardSource, setInwardSource] = useState<'Purchase Receipt' | 'Vendor Return' | 'Customer Return' | 'Opening Stock' | 'Manual Entry'>('Purchase Receipt');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [poNo, setPoNo] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Transfer Case
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [fromLocationLabel, setFromLocationLabel] = useState('');
  const [toLocationLabel, setToLocationLabel] = useState('');

  // Adjustment Case
  const [adjType, setAdjType] = useState<'Increase' | 'Decrease' | 'Damage' | 'Lost' | 'Found' | 'Correction'>('Correction');
  const [adjReason, setAdjReason] = useState('Found during physical inventory count');

  // GST Calculation help
  const activeProduct = products.find(p => p.id === selectedProductId);
  const calculatedTaxVal = activeProduct ? (activeProduct.purchasePrice * selectedQty) : 0;
  const standardGstVal = activeProduct ? parseFloat(((calculatedTaxVal * activeProduct.gstRate) / 100).toFixed(2)) : 0;

  // Handle GRN Onboarding Submit
  const handleInwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || selectedQty <= 0) {
      alert('Kindly choose a valid Catalog Product and specify custom quantity.');
      return;
    }

    const matchedProd = products.find(p => p.id === selectedProductId)!;
    const matchedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

    // Build the Goods Receipt Document (GRN) under GSTR standards
    const newGrn: WmsGoodsReceipt = {
      id: `GRN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      grnDate: new Date().toISOString(),
      vendorId: matchedVendor.id,
      vendorName: matchedVendor.companyName,
      poNumber: poNo || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNumber: invoiceNo || `INV-IN-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceDate: new Date().toISOString().slice(0, 10),
      productId: selectedProductId,
      productName: matchedProd.name,
      sku: matchedProd.sku,
      receivedQuantity: selectedQty,
      acceptedQuantity: selectedQty,
      rejectedQuantity: 0,
      taxableValue: calculatedTaxVal,
      gstRate: matchedProd.gstRate,
      cgstAmount: matchedVendor.state === 'Maharashtra' ? parseFloat((standardGstVal / 2).toFixed(2)) : 0,
      sgstAmount: matchedVendor.state === 'Maharashtra' ? parseFloat((standardGstVal / 2).toFixed(2)) : 0,
      igstAmount: matchedVendor.state !== 'Maharashtra' ? standardGstVal : 0,
      totalValue: calculatedTaxVal + standardGstVal,
      remarks: remarks || `Standard corporate stock inward. Log source: ${inwardSource}`,
      isPutAwayCommitted: false,
      batchNumber: selectedBatch || `BAT-IN-${matchedProd.sku}-${Date.now().toString().slice(-4)}`
    };

    onCommitGrn(newGrn);
    alert(`GRN Successfully Generated: ${newGrn.id}\nStock level incremented by ${selectedQty} units under central ledger.`);
    resetForm();
  };

  // Handle Transfer creation (Requires Approval if between different Warehouses)
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || selectedQty <= 0 || !fromWarehouseId || !toWarehouseId) {
      alert('Please specify Product, Quantity, Source Warehouse, and Target Warehouse.');
      return;
    }

    const matchedProd = products.find(p => p.id === selectedProductId)!;
    const fromWh = warehouses.find(w => w.id === fromWarehouseId)!;
    const toWh = warehouses.find(w => w.id === toWarehouseId)!;

    // Build the Stock Transfer item
    const newTransfer: WmsStockTransfer = {
      id: `ST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      transferDate: new Date().toISOString(),
      productId: selectedProductId,
      productName: matchedProd.name,
      sku: matchedProd.sku,
      fromWarehouseId,
      fromWarehouseName: fromWh.code,
      toWarehouseId,
      toWarehouseName: toWh.code,
      fromLocation: fromLocationLabel || 'Bin A-1',
      toLocation: toLocationLabel || 'Bin B-1',
      quantity: selectedQty,
      requestedBy: 'devid01jhon@gmail.com',
      status: fromWarehouseId === toWarehouseId ? 'Received' : 'Pending Approval', // Intra-warehouse fits direct receive, Inter-warehouse needs manager signoff
      remarks: remarks || 'Standard stock shifting.'
    };

    onCommitTransfer(newTransfer);
    const msg = fromWarehouseId === toWarehouseId 
      ? `Stock Shift completed direct for intra-warehouse bin grid layout.` 
      : `Inter-warehouse transfer logged: ${newTransfer.id} (Routing to manager approval queue).`;
    alert(msg);
    resetForm();
  };

  // Handle Stock adjustment
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || selectedQty <= 0) {
      alert('Please choose catalog SKU and specified quantity.');
      return;
    }

    const matchedProd = products.find(p => p.id === selectedProductId)!;
    const primaryWH = warehouses[0];

    const newAdj: WmsStockAdjustment = {
      id: `SA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      adjustmentDate: new Date().toISOString(),
      productId: selectedProductId,
      productName: matchedProd.name,
      sku: matchedProd.sku,
      warehouseId: primaryWH.id,
      warehouseName: primaryWH.code,
      locationLabel: 'BOM-Aisle-01',
      adjustmentType: adjType,
      quantity: selectedQty,
      reasonCode: adjReason,
      requestedBy: 'devid01jhon@gmail.com',
      status: 'Pending Approval', // Requires senior audit confirmation
      remarks: remarks || `WMS discrepancy audit action.`
    };

    onCommitAdjustment(newAdj);
    alert(`Audit Adjustment filed: ${newAdj.id}.\nQueued for WMS Supervisor/Tax Auditor confirmation.`);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProductId('');
    setSelectedQty(10);
    setSelectedBatch('');
    setPoNo('');
    setInvoiceNo('');
    setRemarks('');
    setFromWarehouseId('');
    setToWarehouseId('');
    setFromLocationLabel('');
    setToLocationLabel('');
  };

  return (
    <div className="space-y-6">
      
      {/* OPERATION TAB SELECTORS */}
      <div className="flex border-b border-neutral-200 gap-4 text-xs font-mono font-bold uppercase select-none">
        {[
          { id: 'inward', label: '📥 Stock Inward (GRN)', icon: <ArrowDownLeft size={13} /> },
          { id: 'transfer', label: '↕️ Stock Transfer', icon: <RefreshCw size={13} /> },
          { id: 'adjust', label: '⚖️ Physical Adjustment', icon: <SlidersHorizontal size={13} /> },
          { id: 'approvals', label: '🛡️ Supervisor Approvals', icon: <FileCheck2 size={13} />, badge: (transfers.filter(t => t.status === 'Pending Approval').length + adjustments.filter(a => a.status === 'Pending Approval').length) },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveSubTab(tab.id as any); resetForm(); }}
            className={`pb-2.5 px-1 border-b-2 transition duration-200 flex items-center space-x-1.5 ${activeSubTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-450 hover:text-neutral-850'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="bg-rose-500 text-white rounded-full px-1.5 text-[9px] font-mono leading-tight">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CORE FORM AREA */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
          
          {/* A. STOCK INWARD MODULE */}
          {activeSubTab === 'inward' && (
            <form onSubmit={handleInwardSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-800">Generate Goods Receipt Note (GRN)</h4>
                <p className="text-[11px] text-neutral-400">Perform statutory GSTR-2B compliance-checked physical cargo inward.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Inward Class</label>
                  <select
                    value={inwardSource}
                    onChange={(e) => setInwardSource(e.target.value as any)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Purchase Receipt">Purchase Receipt from Vendor</option>
                    <option value="Vendor Return">Vendor Return Rejected</option>
                    <option value="Customer Return">Customer Return (RTO)</option>
                    <option value="Opening Stock">Opening Stock Ingestion</option>
                    <option value="Manual Entry">Manual Operations Correction</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Supplier / Vendor Party *</label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Choose GSTIN Registered Vendor --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.companyName} (State: {v.state})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Material Catalog Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Select Material Catalog File --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Quantity *</label>
                    <input
                      type="number"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1 font-mono">
                    <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Batch Stamp ID</label>
                    <input
                      type="text"
                      placeholder="e.g. BAT-26JUN-01"
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Purchase Order (PO No)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-2026-0422"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">B2B TAX Invoice No</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-893"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Operational Inward Remarks</label>
                <input
                  type="text"
                  placeholder="Seals checked. MSME weight verified. Unloaded at bay-1."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              {/* STATUTORY TAX DISPLAY CRADLE */}
              {activeProduct && (
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-xs space-y-2 font-mono">
                  <span className="text-[9px] font-bold text-neutral-400 block uppercase">Indian Statutory GST Calculator</span>
                  <div className="grid grid-cols-2 gap-3 leading-snug">
                    <div>
                      <span className="text-neutral-400">Total Taxable Value:</span>
                      <strong className="block text-neutral-800">₹{calculatedTaxVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div>
                      <span className="text-neutral-400">GST Slab Rate ({activeProduct.gstRate}%):</span>
                      <strong className="block text-indigo-700">₹{standardGstVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-neutral-200 pt-2 flex justify-between font-bold text-sm text-neutral-900">
                    <span>Chargeable Grand Total (ITC Base):</span>
                    <span>₹{(calculatedTaxVal + standardGstVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition">
                Generate GRN & Update Inventory State
              </button>
            </form>
          )}

          {/* B. STOCK TRANSFER MODULE */}
          {activeSubTab === 'transfer' && (
            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-800">Initiate Warehouse Stock Shift (Bin/Warehouse)</h4>
                <p className="text-[11px] text-neutral-400 font-mono">Note: Shifting between distinct warehouse structures enforces supervisor sign-off.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Select Catalog Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Choose SKU --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Transfer Qty *</label>
                  <input
                    type="number"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Source Location (From) *</label>
                  <select
                    value={fromWarehouseId}
                    onChange={(e) => setFromWarehouseId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Select Source Warehouse Code --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} ({w.city})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Destination Location (To) *</label>
                  <select
                    value={toWarehouseId}
                    onChange={(e) => setToWarehouseId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Select Destination Warehouse Code --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} ({w.city})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Source Shelf / Bin (From Location)</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 01, Rack R2, Shelf S1"
                    value={fromLocationLabel}
                    onChange={(e) => setFromLocationLabel(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Target Shelf / Bin (To Location)</label>
                  <input
                    type="text"
                    placeholder="e.g. Aisle 02, Rack R1, Shelf S2"
                    value={toLocationLabel}
                    onChange={(e) => setToLocationLabel(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Internal Shifting Log Remarks</label>
                <input
                  type="text"
                  placeholder="Shifting raw copper wire stack to BLR regional assembly line."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition">
                Create Movement Transfer Invoice
              </button>
            </form>
          )}

          {/* C. STOCK ADJUSTMENT MODULE */}
          {activeSubTab === 'adjust' && (
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-800">Physical Discrepancy Audit Correction</h4>
                <p className="text-[11px] text-neutral-400">Increase or decrease quantities inside the central stock registry based on floor audit tallies.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Adjust Base Action *</label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Increase">Found / Surplus Stock Increase (+)</option>
                    <option value="Decrease">Shrinkage / Missing Decrease (-)</option>
                    <option value="Damage">Scrapped / Damaged Asset (-)</option>
                    <option value="Lost">Lost Stock Write-off (-)</option>
                    <option value="Correction">Post-audit Correction (+/-)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Target SKU Item *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} | {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 font-mono">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Adjust Quantities *</label>
                  <input
                    type="number"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Statutory Audit Code Reasons *</label>
                  <select
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Found during physical inventory count">Surplus: found in adjacent aisle bin slot</option>
                    <option value="Pilferage / Missing in Shelf count">Shrinkage: physical shelf deficit</option>
                    <option value="Forklift damaged writing off">Damage: forklift collision on rack shelf</option>
                    <option value="Operational error during shipping packing">Discrepancy: packing staff count error</option>
                  </select>
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase">Tax / Audit File Remarks</label>
                <input
                  type="text"
                  placeholder="Sealed box damaged by rain water leakage. Approved write-off write down."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition">
                Submit For Statutory Audit Sign-off
              </button>
            </form>
          )}

          {/* D. SUPERVISOR APPROVALS BOARD */}
          {activeSubTab === 'approvals' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-850">Warehouse supervisor authorization gateway</h4>
                <p className="text-[11px] text-neutral-400 font-mono">Verify and authorize Inter-Warehouse transfers, QC write-offs and statutory inventory adjustments.</p>
              </div>

              {/* Transfers list pending */}
              <div className="space-y-3">
                <span className="text-[10px] font-black tracking-wider text-neutral-500 font-mono block">Pending Stock Transfers ({transfers.filter(t => t.status === 'Pending Approval').length})</span>
                
                {transfers.filter(t => t.status === 'Pending Approval').length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-400 bg-neutral-50 border rounded-xl italic">
                    Zero stock transfers awaiting authorization.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {transfers.filter(t => t.status === 'Pending Approval').map(t => (
                      <div key={t.id} className="bg-neutral-50 border p-4 rounded-xl flex items-center justify-between text-xs font-mono">
                        <div className="space-y-1 max-w-lg">
                          <div className="flex items-center space-x-2">
                            <strong className="text-neutral-800 text-sm block">{t.id}</strong>
                            <span className="bg-amber-100 text-amber-850 text-[10px] px-1.5 rounded leading-none py-0.5 uppercase font-bold">Needs approval</span>
                          </div>
                          <p className="text-neutral-500 text-[11px] font-sans">
                            Shift <strong>{t.quantity} U</strong> of <strong>{t.sku} ({t.productName})</strong> from {t.fromWarehouseName} to {t.toWarehouseName}.
                          </p>
                          <span className="text-[10px] text-neutral-400 block">Requester: {t.requestedBy} • Remarks: {t.remarks}</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            id={`approve-transfer-${t.id}`}
                            onClick={() => onApproveTransfer(t.id, 'jai.dev@ttgtsolutions.com')}
                            className="p-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase transition"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adjustments list pending */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black tracking-wider text-neutral-500 font-mono block">Pending Adjustments / Write-offs ({adjustments.filter(a => a.status === 'Pending Approval').length})</span>
                
                {adjustments.filter(a => a.status === 'Pending Approval').length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-400 bg-neutral-50 border rounded-xl italic">
                    Zero physical count discrepancies outstanding.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {adjustments.filter(a => a.status === 'Pending Approval').map(a => (
                      <div key={a.id} className="bg-neutral-50 border p-4 rounded-xl flex items-center justify-between text-xs font-mono">
                        <div className="space-y-1 max-w-lg font-sans">
                          <div className="flex items-center space-x-2 font-mono">
                            <strong className="text-neutral-800 text-sm block">{a.id}</strong>
                            <span className="bg-orange-100 text-orange-850 text-[10px] px-1.5 rounded leading-none py-0.5 uppercase font-bold">Discrepancy</span>
                          </div>
                          <p className="text-neutral-500 text-[11px]">
                            Adjust register <strong>{a.adjustmentType}</strong> of <strong>{a.quantity} U</strong> for <strong>{a.sku} ({a.productName})</strong>.
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono block">Reason: "{a.reasonCode}" • Filed by: {a.requestedBy}</span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 font-mono">
                          <button
                            id={`approve-adjust-${a.id}`}
                            onClick={() => onApproveAdjustment(a.id, 'jai.dev@ttgtsolutions.com')}
                            className="p-1 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase transition"
                          >
                            Authorize
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* SIDE ACTIONS: OUTSTANDING ENTRES FEED */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-800 font-mono flex items-center space-x-2">
              <Zap size={14} className="text-indigo-600 animate-pulse" />
              <span>Inward GRN registers</span>
            </h5>
            <span className="text-[9px] font-mono text-neutral-400">Total: {grns.length}</span>
          </div>

          <div className="space-y-3.5 max-h-[420px] overflow-y-auto">
            {grns.map(g => (
              <div key={g.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-150 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-neutral-150 pb-1 font-mono">
                  <span className="font-bold text-neutral-800">{g.id}</span>
                  <span className="text-[10px] text-neutral-400">{new Date(g.grnDate).toLocaleDateString('en-IN')}</span>
                </div>
                <div className="leading-snug">
                  <span className="text-[10px] font-mono text-neutral-400 block font-bold leading-tight">Catalog SKU</span>
                  <span className="font-bold text-neutral-850 block">{g.sku}</span>
                  <span className="text-[11px] text-neutral-500 block truncate">{g.productName}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-neutral-500">
                  <span>Accepted: <strong>{g.acceptedQuantity} Pcs</strong></span>
                  <span className="text-emerald-700">Valuation: ₹{g.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
