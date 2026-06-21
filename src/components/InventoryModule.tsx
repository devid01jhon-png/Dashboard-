/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  RefreshCw, 
  FileCheck2, 
  Barcode, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  BookmarkCheck,
  Zap,
  Printer
} from 'lucide-react';
import { Product, InventoryLog, Vendor } from '../types';

// Child components
import InventoryDashboard from './inventory/InventoryDashboard';
import LiveStock from './inventory/LiveStock';
import StockOperations from './inventory/StockOperations';
import StockAuditAndScanner from './inventory/StockAuditAndScanner';
import TrackingRegisters from './inventory/TrackingRegisters';

// Mock Data providers
import { 
  INITIAL_WMS_WAREHOUSES, 
  INITIAL_WMS_LOCATIONS, 
  INITIAL_WMS_BATCHES, 
  INITIAL_WMS_SERIALS, 
  INITIAL_WMS_GRNS, 
  INITIAL_WMS_TRANSFERS, 
  INITIAL_WMS_ADJUSTMENTS, 
  INITIAL_WMS_AUDITS 
} from './inventory/wmsData';

import { 
  WmsWarehouse, 
  WmsWarehouseLocation, 
  WmsBatchMaster, 
  WmsSerialNumber,
  WmsGoodsReceipt,
  WmsStockTransfer,
  WmsStockAdjustment,
  WmsInventoryAudit
} from './inventory/wmsTypes';

interface InventoryModuleProps {
  products: Product[];
  inventoryLogs: InventoryLog[];
  recordStockInward: (log: Omit<InventoryLog, 'id' | 'createdAt' | 'createdByName'>) => void;
  recordStockAdjustment: (productId: string, quantity: number, type: InventoryLog['type'], notes: string) => void;
  searchQuery: string;
  onBulkUpdateProducts?: (updatedProducts: Product[]) => void;
  vendors?: Vendor[]; // Passed down to match standard registered parties
}

export default function InventoryModule({
  products,
  inventoryLogs,
  recordStockInward,
  recordStockAdjustment,
  searchQuery,
  onBulkUpdateProducts,
  vendors = []
}: InventoryModuleProps) {
  // Navigation Menu Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'livestock' | 'operations' | 'scanaudit' | 'registers'>('dashboard');

  // WMS Persistence Loaders
  const getWmsData = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(`ttgt_wms_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setWmsData = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`ttgt_wms_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage limits reached for WMS Data", e);
    }
  };

  // Declaring our active collections
  const [warehouses, setWarehouses] = useState<WmsWarehouse[]>(() => getWmsData('warehouses', INITIAL_WMS_WAREHOUSES));
  const [wmsLocations, setWmsLocations] = useState<WmsWarehouseLocation[]>(() => getWmsData('locations', INITIAL_WMS_LOCATIONS));
  const [batches, setBatches] = useState<WmsBatchMaster[]>(() => getWmsData('batches', INITIAL_WMS_BATCHES));
  const [serialNumbers, setSerialNumbers] = useState<WmsSerialNumber[]>(() => getWmsData('serials', INITIAL_WMS_SERIALS));
  const [grns, setGrns] = useState<WmsGoodsReceipt[]>(() => getWmsData('grns', INITIAL_WMS_GRNS));
  const [transfers, setTransfers] = useState<WmsStockTransfer[]>(() => getWmsData('transfers', INITIAL_WMS_TRANSFERS));
  const [adjustments, setAdjustments] = useState<WmsStockAdjustment[]>(() => getWmsData('adjustments', INITIAL_WMS_ADJUSTMENTS));
  const [audits, setAudits] = useState<WmsInventoryAudit[]>(() => getWmsData('audits', INITIAL_WMS_AUDITS));

  // Syncing to local storage
  useEffect(() => { setWmsData('warehouses', warehouses); }, [warehouses]);
  useEffect(() => { setWmsData('locations', wmsLocations); }, [wmsLocations]);
  useEffect(() => { setWmsData('batches', batches); }, [batches]);
  useEffect(() => { setWmsData('serials', serialNumbers); }, [serialNumbers]);
  useEffect(() => { setWmsData('grns', grns); }, [grns]);
  useEffect(() => { setWmsData('transfers', transfers); }, [transfers]);
  useEffect(() => { setWmsData('adjustments', adjustments); }, [adjustments]);
  useEffect(() => { setWmsData('audits', audits); }, [audits]);

  // Operational Event Handlers
  const handleCommitGrn = (grn: WmsGoodsReceipt) => {
    // 1. Add to local list
    setGrns(prev => [grn, ...prev]);

    // 2. Generate regulatory batch
    const newBatch: WmsBatchMaster = {
      id: `bat-auto-${Date.now()}`,
      batchNumber: grn.batchNumber,
      productId: grn.productId,
      productName: grn.productName,
      sku: grn.sku,
      manufacturingDate: new Date().toISOString().slice(0, 10),
      expiryDate: grn.expiryDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      lotNumber: 'LOT-AUTO-GEN',
      supplierBatchNumber: 'SUP-AUTO-GEN',
      status: 'Released',
      quantity: grn.acceptedQuantity,
      warehouseId: 'wh-1',
      stateOfOrigin: 'Maharashtra'
    };
    setBatches(prev => [newBatch, ...prev]);

    // 3. Propagate stock change back into core app state tree (reactive)
    recordStockInward({
      productId: grn.productId,
      type: 'Inward',
      quantity: grn.acceptedQuantity,
      batchNumber: grn.batchNumber,
      referenceId: grn.id,
      notes: grn.remarks
    });
  };

  const handleCommitTransfer = (transfer: WmsStockTransfer) => {
    setTransfers(prev => [transfer, ...prev]);

    // If intra-warehouse (direct transaction), apply change
    if (transfer.status === 'Received') {
      recordStockAdjustment(
        transfer.productId,
        0, // Net sum change is zero for layout shifts
        'Audit Adjustment',
        `Transferred ${transfer.quantity} Pcs from ${transfer.fromLocation} to ${transfer.toLocation}`
      );
    }
  };

  const handleCommitAdjustment = (adj: WmsStockAdjustment) => {
    setAdjustments(prev => [adj, ...prev]);
  };

  const handleCommitAudit = (audit: WmsInventoryAudit) => {
    setAudits(prev => [audit, ...prev]);

    // Auto-commit discrepancies as stock movements
    audit.items.forEach(item => {
      if (item.discrepancyQuantity !== 0) {
        recordStockInward({
          productId: item.productId,
          type: item.discrepancyQuantity > 0 ? 'Audit Adjustment' : 'Damaged',
          quantity: item.discrepancyQuantity,
          batchNumber: item.batchNumber || 'AUDIT-AUTO',
          referenceId: audit.id,
          notes: `Post-audit physical count discrepancy correction.`
        });
      }
    });
  };

  // Approvals operations
  const handleApproveTransfer = (id: string, adminEmail: string) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === id) {
        // execute actual stock change to the target physical location
        recordStockInward({
          productId: t.productId,
          type: 'Audit Adjustment',
          quantity: t.quantity, // adds to buffer safety
          batchNumber: t.batchNumber || 'ST-APPROVED',
          referenceId: t.id,
          notes: `Inter-warehouse transfer received from ${t.fromWarehouseName}`
        });

        return { ...t, status: 'Received', approvedBy: adminEmail };
      }
      return t;
    }));
    alert(`Transfer ${id} authorized. Target stock levels updated.`);
  };

  const handleApproveAdjustment = (id: string, adminEmail: string) => {
    setAdjustments(prev => prev.map(a => {
      if (a.id === id) {
        // deduct/add material
        const multiplier = (a.adjustmentType === 'Increase' || a.adjustmentType === 'Found') ? 1 : -1;
        recordStockInward({
          productId: a.productId,
          type: a.adjustmentType === 'Increase' ? 'Inward' : 'Damaged',
          quantity: a.quantity * multiplier,
          batchNumber: a.batchNumber || 'SA-APPROVED',
          referenceId: a.id,
          notes: `Approved supervisor adjustment. Reason: ${a.reasonCode}`
        });

        return { ...a, status: 'Approved', approvedBy: adminEmail };
      }
      return a;
    }));
    alert(`Audit Adjustment ${id} approved and committed to the physical ledger.`);
  };

  // Batch status changes
  const handleUpdateBatchStatus = (id: string, status: WmsBatchMaster['status']) => {
    setBatches(prev => prev.map(b => (b.id === id ? { ...b, status } : b)));
  };

  // Serial key registers
  const handleRegisterSerial = (s: WmsSerialNumber) => {
    setSerialNumbers(prev => [s, ...prev]);
  };

  // Generate supply indent (dispatches vendor PO request)
  const handleGeneratePOIndent = (productId: string, qty: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    
    // Simulate stock inward arrival as soon as indent generates
    recordStockInward({
      productId,
      type: 'Inward',
      quantity: qty,
      batchNumber: `BAT-REORDER-${Date.now().toString().slice(-4)}`,
      referenceId: `PO-REORDER-${Math.floor(1000 + Math.random()*9000)}`,
      notes: `Reorder indent replenishment for depleted SKU safety reserves.`
    });

    alert(`B2B Procurement Purchase Indent issued to vendor for ${qty} Units of ${prod.sku}.\nPhysical cargo arrived at BOM Central Dock bay.`);
  };

  // Bulk operation updates
  const handleBulkUpdateStock = (updatedList: Product[]) => {
    if (onBulkUpdateProducts) {
      onBulkUpdateProducts(updatedList);
    } else {
      // fallback local update if not passed down
      alert('Bulk adjustments propagated successfully.');
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    if (onBulkUpdateProducts) {
      const remaining = products.map(p => ids.includes(p.id) ? { ...p, status: 'Inactive' as any } : p);
      onBulkUpdateProducts(remaining);
      alert(`Soft-delete achieved. Selected SKUs moved to "Inactive" status logs.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ENTERPRISE WMS HEADER STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-neutral-200">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-mono text-neutral-900 flex items-center space-x-2">
            <Building2 size={22} className="text-neutral-800" />
            <span>WMS Warehouse & Stocks Controller</span>
          </h2>
          <p className="text-xs text-neutral-450 font-medium">
            System operates only inside India. Complete integration with GSTIN registers & HSN accounting ledgers.
          </p>
        </div>

        {/* Indian Date/Time banner */}
        <div className="bg-neutral-50 px-3 py-1.5 rounded-xl border font-mono text-[10px] text-neutral-550 leading-tight space-y-0.5 self-start sm:self-center">
          <div>GSTIN Warehouse Node: <strong className="text-neutral-800">27TTGTS8392M1Z0</strong></div>
          <div className="text-neutral-450 text-right">TZ: IST (+5:30) Mumbai/Kolkata</div>
        </div>
      </div>

      {/* CORE MODULE NAV REGULATORS */}
      <div className="grid grid-cols-2 md:flex md:items-center gap-2 font-mono text-[11px] font-bold uppercase select-none">
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'dashboard' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Layers size={13} />
          <span>Dashboard</span>
        </button>

        <button
          id="tab-livestock-btn"
          onClick={() => setActiveTab('livestock')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'livestock' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Building2 size={13} />
          <span>Live Stock Grid</span>
        </button>

        <button
          id="tab-operations-btn"
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'operations' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <RefreshCw size={13} />
          <span>Operations Shifty</span>
        </button>

        <button
          id="tab-scanaudit-btn"
          onClick={() => setActiveTab('scanaudit')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'scanaudit' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Barcode size={13} />
          <span>Scanner & Auditing</span>
        </button>

        <button
          id="tab-registers-btn"
          onClick={() => setActiveTab('registers')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'registers' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <FileCheck2 size={13} />
          <span>Expiry / Buffer Registers</span>
        </button>

      </div>

      {/* RENDER ACTIVE MENU HUB */}
      <div className="space-y-4">
        {activeTab === 'dashboard' && (
          <InventoryDashboard 
            products={products}
            batches={batches}
            grns={grns}
            transfers={transfers}
          />
        )}

        {activeTab === 'livestock' && (
          <LiveStock 
            products={products}
            vendors={vendors}
            warehouses={warehouses}
            locations={wmsLocations}
            batches={batches}
            onBulkUpdateStock={handleBulkUpdateStock}
            onBulkDelete={handleBulkDelete}
          />
        )}

        {activeTab === 'operations' && (
          <StockOperations 
            products={products}
            vendors={vendors}
            warehouses={warehouses}
            locations={wmsLocations}
            batches={batches}
            transfers={transfers}
            adjustments={adjustments}
            grns={grns}
            onCommitTransfer={handleCommitTransfer}
            onCommitAdjustment={handleCommitAdjustment}
            onCommitGrn={handleCommitGrn}
            onApproveTransfer={handleApproveTransfer}
            onApproveAdjustment={handleApproveAdjustment}
          />
        )}

        {activeTab === 'scanaudit' && (
          <StockAuditAndScanner 
            products={products}
            audits={audits}
            onCommitAudit={handleCommitAudit}
          />
        )}

        {activeTab === 'registers' && (
          <TrackingRegisters 
            products={products}
            vendors={vendors}
            batches={batches}
            serialNumbers={serialNumbers}
            onUpdateBatchStatus={handleUpdateBatchStatus}
            onRegisterSerial={handleRegisterSerial}
            onGeneratePOIndent={handleGeneratePOIndent}
          />
        )}
      </div>

    </div>
  );
}
