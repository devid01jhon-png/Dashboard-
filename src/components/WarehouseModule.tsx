/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Map, 
  LayoutDashboard, 
  Boxes, 
  Truck, 
  Settings, 
  Compass, 
  HelpCircle 
} from 'lucide-react';
import { WarehouseLocation, Product, Order } from '../types';

// WMS imports
import { 
  WmsWarehouse, 
  WmsWarehouseLocation, 
  WmsGoodsReceipt, 
  WmsDispatchLog 
} from './inventory/wmsTypes';

import { 
  INITIAL_WMS_WAREHOUSES, 
  INITIAL_WMS_LOCATIONS, 
  INITIAL_WMS_GRNS 
} from './inventory/wmsData';

// Child components
import WarehouseDashboard from './warehouse/WarehouseDashboard';
import WarehouseStructure from './warehouse/WarehouseStructure';
import GoodsOperations from './warehouse/GoodsOperations';
import OrderFulfillment from './order_fulfillment/OrderFulfillment';

interface WarehouseModuleProps {
  locations: WarehouseLocation[]; // Raw locations passed from App
  products: Product[];
  orders: Order[];
  updateLocationOccupant: (id: string, productId: string | undefined) => void;
}

export default function WarehouseModule({
  locations: appLocations,
  products,
  orders,
  updateLocationOccupant
}: WarehouseModuleProps) {
  // Navigation Tabs inside Warehouse Hub
  const [activeTab, setActiveTab] = useState<'dashboard' | 'structure' | 'dock' | 'fulfillment'>('dashboard');

  // WMS Local Database Sync Chargers (Sharing with Inventory module)
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
      console.warn("Storage warning in WMS:", e);
    }
  };

  // State definitions matching Shared Database Registers
  const [warehouses, setWarehouses] = useState<WmsWarehouse[]>(() => getWmsData('warehouses', INITIAL_WMS_WAREHOUSES));
  const [locations, setLocations] = useState<WmsWarehouseLocation[]>(() => getWmsData('locations', INITIAL_WMS_LOCATIONS));
  const [grns, setGrns] = useState<WmsGoodsReceipt[]>(() => getWmsData('grns', INITIAL_WMS_GRNS));
  const [dispatches, setDispatches] = useState<WmsDispatchLog[]>(() => getWmsData('dispatches', []));

  // Sync state triggers
  useEffect(() => { setWmsData('warehouses', warehouses); }, [warehouses]);
  useEffect(() => { setWmsData('locations', locations); }, [locations]);
  useEffect(() => { setWmsData('grns', grns); }, [grns]);
  useEffect(() => { setWmsData('dispatches', dispatches); }, [dispatches]);

  // Operational events updates
  const handleAddWarehouse = (wh: WmsWarehouse) => {
    setWarehouses(prev => [...prev, wh]);
  };

  const handleAddLocation = (loc: WmsWarehouseLocation) => {
    setLocations(prev => [...prev, loc]);
  };

  const handleDeleteWarehouse = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  // Put-away assignment commits (completes GRN putaway cycle)
  const handleCommitPutAway = (grnId: string, locationId: string, quantity: number) => {
    // 1. Mark grn put-away as executed
    setGrns(prev => prev.map(g => g.id === grnId ? { ...g, isPutAwayCommitted: true } : g));

    // 2. Bind product code to local spatial coordinate slot
    setLocations(prev => prev.map(loc => {
      if (loc.id === locationId) {
        const matchingGrn = grns.find(g => g.id === grnId)!;
        return { 
          ...loc, 
          isOccupied: true, 
          currentProductId: matchingGrn.productId,
          currentQuantity: (loc.currentQuantity || 0) + quantity
        };
      }
      return loc;
    }));

    // 3. Propagate to App.tsx's simple location list to prevent visual de-sync in legacy panels
    const matchingGrn = grns.find(g => g.id === grnId);
    if (matchingGrn) {
      updateLocationOccupant(locationId, matchingGrn.productId);
    }
  };

  // Dispatch orders loader
  const handleCommitDispatch = (log: WmsDispatchLog) => {
    setDispatches(prev => [log, ...prev]);
  };

  // Synchronize orders tracking stages back into App.tsx layout
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    // App.tsx order parameters will update reactively via its custom status handlers
    const event = new CustomEvent('ttgt_order_status_update', { detail: { orderId, status } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">

      {/* TOP REGISTRATION DETAILS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-neutral-200">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-mono text-neutral-900 flex items-center space-x-2">
            <Building2 size={22} className="text-neutral-800" />
            <span>WMS Warehouse Logistics Hub</span>
          </h2>
          <p className="text-xs text-neutral-450 font-medium">
            Handles physical space allocation, e-Way bills dispatch processing, and Blue Dart Courier integrations.
          </p>
        </div>

        {/* GST State indicators */}
        <div className="bg-neutral-50 px-3 py-1.5 rounded-xl border font-mono text-[10px] text-neutral-550 leading-tight space-y-0.5 self-start sm:self-center">
          <div>Facility Area: <strong className="text-neutral-800">45,000 Sq. Ft Grid</strong></div>
          <div className="text-neutral-450 text-right">Zone: IND-WEST-MH (Mumbai Core)</div>
        </div>
      </div>

      {/* NAVIGATION TABS REGULATORS */}
      <div className="grid grid-cols-2 md:flex md:items-center gap-2 font-mono text-[11px] font-bold uppercase select-none">
        
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'dashboard' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <LayoutDashboard size={13} />
          <span>Dashboard</span>
        </button>

        <button
          id="btn-warehouse-structure-tab"
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'structure' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Map size={13} />
          <span>Physical Structures</span>
        </button>

        <button
          id="btn-warehouse-dock"
          onClick={() => setActiveTab('dock')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'dock' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Boxes size={13} />
          <span>GRN & Put-away</span>
        </button>

        <button
          id="btn-warehouse-fulfillment"
          onClick={() => setActiveTab('fulfillment')}
          className={`px-4 py-2 rounded-xl border transition flex items-center space-x-1.5 ${activeTab === 'fulfillment' ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50 border-neutral-200'}`}
        >
          <Truck size={13} />
          <span>Pick, Pack & Dispatch</span>
        </button>

      </div>

      {/* ACTIVE SCREEN PORTAL */}
      <div className="space-y-4">
        {activeTab === 'dashboard' && (
          <WarehouseDashboard 
            warehouses={warehouses}
            locations={locations}
          />
        )}

        {activeTab === 'structure' && (
          <WarehouseStructure 
            warehouses={warehouses}
            locations={locations}
            products={products}
            onAddWarehouse={handleAddWarehouse}
            onAddLocation={handleAddLocation}
            onDeleteWarehouse={handleDeleteWarehouse}
            onDeleteLocation={handleDeleteLocation}
          />
        )}

        {activeTab === 'dock' && (
          <GoodsOperations 
            grns={grns}
            locations={locations}
            products={products}
            onCommitPutAway={handleCommitPutAway}
          />
        )}

        {activeTab === 'fulfillment' && (
          <OrderFulfillment 
            orders={orders}
            products={products}
            dispatches={dispatches}
            onCommitDispatch={handleCommitDispatch}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </div>

    </div>
  );
}
