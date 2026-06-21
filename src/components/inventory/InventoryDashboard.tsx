/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Layers, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  FileCheck2, 
  Activity, 
  Clock, 
  DollarSign, 
  Zap, 
  ShieldAlert,
  BarChart4
} from 'lucide-react';
import { Product } from '../../types';
import { WmsBatchMaster, WmsGoodsReceipt, WmsStockTransfer } from './wmsTypes';

interface InventoryDashboardProps {
  products: Product[];
  batches: WmsBatchMaster[];
  grns: WmsGoodsReceipt[];
  transfers: WmsStockTransfer[];
}

export default function InventoryDashboard({
  products,
  batches,
  grns,
  transfers
}: InventoryDashboardProps) {
  // calculations
  const totalStockQty = products.reduce((acc, p) => acc + p.currentStock, 0);
  
  // Simulated partition values for enterpise WMS standards
  const totalStockVal = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  const allocatedStock = Math.round(totalStockQty * 0.12); // reserved for pending orders
  const reservedStock = Math.round(totalStockQty * 0.05);  // buffer safety allocation
  const damagedStock = batches.filter(b => b.status === 'Quarantined').reduce((acc, b) => acc + b.quantity, 0);
  const returnedStock = Math.round(totalStockQty * 0.02);  // RTO (return-to-origin) stock in-check
  const availableStock = Math.max(0, totalStockQty - allocatedStock - reservedStock - damagedStock);

  // Expired checks
  const expiredStock = batches.filter(b => {
    return new Date(b.expiryDate) < new Date();
  }).reduce((acc, b) => acc + b.quantity, 0);

  // Status arrays
  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  // Movements tracker
  const todayIn = grns.filter(g => {
    const isToday = new Date(g.grnDate).toDateString() === new Date().toDateString();
    return isToday;
  }).reduce((acc, g) => acc + g.acceptedQuantity, 0);

  // Dynamic Movement logs
  const todayOut = 25; // Simulated Sales Dispatch units for the current date
  const todayTransfers = transfers.filter(t => {
    const isToday = new Date(t.transferDate).toDateString() === new Date().toDateString();
    return isToday;
  }).reduce((acc, t) => acc + t.quantity, 0);

  // Reorder suggestion count
  const reorderTriggerCount = products.filter(p => p.currentStock <= p.minStockLevel).length;

  // Analytical classification (ABC Analysis)
  // Fast: CurrentStock is high and moving, Slow: Stock is moderate, Dead: Stock is empty/unmoved
  const fastMoving = products.filter(p => p.sellingPrice > 200 && p.currentStock > 30);
  const slowMoving = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const deadStock = products.filter(p => p.currentStock > 100 && p.purchasePrice > 100 && !batches.some(b => b.productId === p.id && new Date(b.manufacturingDate) > new Date(Date.now() - 90 * 24 * 3600 * 1000)));

  // Indian currency formatting
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: TOP EXECUTIVE PANELS -- GRID 4x */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock Volume */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">BOM/BLR Core Ledger Volume</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-neutral-900">{totalStockQty.toLocaleString()}</span>
              <span className="text-xs text-neutral-400 font-bold uppercase font-mono">Units</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-snug">Continuous GSTR register stock tally</p>
          </div>
          <div className="p-3.5 bg-neutral-100 text-neutral-600 rounded-xl group-hover:bg-neutral-900 group-hover:text-white transition duration-300">
            <Layers size={18} />
          </div>
        </div>

        {/* Real-time Inventory Value */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">GSTR Assets Valuation</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-neutral-900">{formatINR(totalStockVal)}</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-snug">Measured at net weighted cost price</p>
          </div>
          <div className="p-3.5 bg-neutral-100 text-indigo-600 rounded-xl group-hover:bg-neutral-900 group-hover:text-white transition duration-300">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-600 tracking-wider block">Under Buffer Limit</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-amber-650">{lowStockProducts.length}</span>
              <span className="text-xs font-mono text-amber-500 font-bold uppercase">SKUs</span>
            </div>
            <p className="text-[10px] text-amber-700 font-mono">Requires immediate indentation</p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Out of Stock Depletion */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex items-start justify-between relative overflow-hidden group">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-rose-600 tracking-wider block">Absolute Depletion</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-rose-650">{outOfStockProducts.length}</span>
              <span className="text-xs font-mono text-rose-500 font-bold uppercase">SKUs</span>
            </div>
            <p className="text-[10px] text-rose-700 font-mono">Sales channels de-synchronized</p>
          </div>
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert size={18} />
          </div>
        </div>

      </div>

      {/* SECTION 2: WMS STOCK PHYSICAL PARTITION CARDS -- GRID 6x */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Available Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">1. Available Free</span>
          <strong className="text-lg font-black font-mono text-neutral-800 block">{availableStock.toLocaleString()}</strong>
          <span className="text-[9px] text-emerald-600 font-mono font-semibold block">● Ready for sale</span>
        </div>

        {/* Allocated Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">2. Assigned Order</span>
          <strong className="text-lg font-black font-mono text-neutral-800 block">{allocatedStock.toLocaleString()}</strong>
          <span className="text-[9px] text-amber-600 font-mono font-semibold block">● Allocated to Packing</span>
        </div>

        {/* Reserved Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">3. Safety Reserve</span>
          <strong className="text-lg font-black font-mono text-neutral-800 block">{reservedStock.toLocaleString()}</strong>
          <span className="text-[9px] text-indigo-600 font-mono font-semibold block">● Channels safety buffer</span>
        </div>

        {/* Damaged Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">4. Quarantined QA</span>
          <strong className="text-lg font-black font-mono text-neutral-800 block">{damagedStock.toLocaleString()}</strong>
          <span className="text-[9px] text-rose-500 font-mono font-semibold block">● QC Quarantine block</span>
        </div>

        {/* Returned Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider block">5. RTO Transit In</span>
          <strong className="text-lg font-black font-mono text-neutral-800 block">{returnedStock.toLocaleString()}</strong>
          <span className="text-[9px] text-blue-600 font-mono font-semibold block">● Inspecting returned seals</span>
        </div>

        {/* Expired Stock */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-1">
          <span className="text-[9px] font-mono text-rose-400 uppercase font-bold tracking-wider block">6. Obsolete / Expired</span>
          <strong className="text-lg font-black font-mono text-rose-600 block">{expiredStock.toLocaleString()}</strong>
          <span className="text-[9px] text-rose-500 font-mono font-semibold block">☠️ Discard/Write-off pile</span>
        </div>

      </div>

      {/* SECTION 3: DAILY OPERATIONS TRAFFIC & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Traffic Monitoring */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono flex items-center space-x-1.5 animate-pulse">
              <Activity size={14} className="text-emerald-500" />
              <span>Live Movements Gate Tracker (Today's Ledger)</span>
            </h4>
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Terminal synchronized</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-neutral-50 p-4 rounded-lg flex items-center space-x-3.5">
              <div className="text-emerald-600 p-2 bg-emerald-100/50 rounded-lg shrink-0">
                <ArrowDownCircle size={22} />
              </div>
              <div>
                <span className="text-[9px] block text-neutral-400 font-mono uppercase font-black">Gate Inbound (GRN)</span>
                <strong className="text-xl font-bold font-mono text-neutral-800 block mt-0.5">+{todayIn} Units</strong>
                <span className="text-[9px] block text-neutral-400 mt-0.5">Approved via dock bays</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg flex items-center space-x-3.5">
              <div className="text-rose-600 p-2 bg-rose-100/50 rounded-lg shrink-0">
                <ArrowUpCircle size={22} />
              </div>
              <div>
                <span className="text-[9px] block text-neutral-400 font-mono uppercase font-black">Gate Outbound (AWB)</span>
                <strong className="text-xl font-bold font-mono text-neutral-800 block mt-0.5">-{todayOut} Units</strong>
                <span className="text-[9px] block text-neutral-400 mt-0.5"> दिल्लीवेरी/BlueDart cargo</span>
              </div>
            </div>

            <div className="bg-neutral-50 p-4 rounded-lg flex items-center space-x-3.5">
              <div className="text-indigo-600 p-2 bg-indigo-100/50 rounded-lg shrink-0">
                <RefreshCw size={20} className="animate-spin-slow" />
              </div>
              <div>
                <span className="text-[9px] block text-neutral-400 font-mono uppercase font-black">Inter-Warehouse</span>
                <strong className="text-xl font-bold font-mono text-neutral-800 block mt-0.5">{todayTransfers} Units</strong>
                <span className="text-[9px] block text-neutral-400 mt-0.5">In-transit stock transfers</span>
              </div>
            </div>

          </div>

          {/* Quick aging display visual bar charts using grid layout */}
          <div className="space-y-3 pt-3">
            <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 font-mono block">Inventory Assets Aging Distribution (FIFO buckets)</span>
            
            <div className="space-y-2">
              {/* Buckets */}
              {[
                { label: '0-30 Days (Fast Cycle)', pct: 64, count: '1360 U', color: 'bg-emerald-500', desc: 'Fresh local procurements' },
                { label: '31-90 Days (Normal Cycle)', pct: 24, count: '510 U', color: 'bg-indigo-500', desc: 'Standard safety inventory buffers' },
                { label: '91-180 Days (Slow Cycle)', pct: 8, count: '170 U', color: 'bg-amber-500', desc: 'Nylon cable ties stock blocks' },
                { label: 'Over 180 Days (Stagnant)', pct: 4, count: '85 U', color: 'bg-rose-500', desc: 'Obsolete packaging registers' }
              ].map((bucket, idx) => (
                <div key={idx} className="flex items-center text-xs space-x-3">
                  <span className="w-44 truncate text-[11px] font-mono text-neutral-600">{bucket.label}</span>
                  <div className="flex-1 bg-neutral-100 h-2.5 rounded-full overflow-hidden relative">
                    <div className={`${bucket.color} h-full rounded-full transition-all`} style={{ width: `${bucket.pct}%` }} />
                  </div>
                  <span className="w-16 font-mono font-bold text-right text-neutral-800">{bucket.count}</span>
                  <span className="w-10 text-right text-neutral-400 font-mono">({bucket.pct}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic ABC Analysis / Speed Monitors */}
        <div className="lg:col-span-4 bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono flex items-center space-x-1.5">
              <Zap size={14} className="text-yellow-500 animate-bounce" />
              <span>ABC Velocity Categorization</span>
            </h4>
            <span className="text-[8px] bg-neutral-100 px-1.5 rounded font-mono text-neutral-500">Live IQ</span>
          </div>

          <div className="space-y-4">
            
            {/* FAST */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                  CLASS A (Fast Moving)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{fastMoving.length} Products</span>
              </div>
              <ul className="text-[11px] text-neutral-600 space-y-1 list-disc list-inside bg-neutral-50 p-2 rounded">
                {fastMoving.slice(0, 2).map((p, idx) => (
                  <li key={idx} className="truncate">{p.sku} - {p.name.split(' ').slice(0, 4).join(' ')}</li>
                ))}
                {fastMoving.length === 0 && <span className="italic text-neutral-400">No matching SKUs</span>}
              </ul>
            </div>

            {/* SLOW */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                  CLASS B (Slow Moving)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{slowMoving.length} Products</span>
              </div>
              <ul className="text-[11px] text-neutral-600 space-y-1 list-disc list-inside bg-neutral-50 p-2 rounded">
                {slowMoving.slice(0, 2).map((p, idx) => (
                  <li key={idx} className="truncate">{p.sku} - {p.name.split(' ').slice(0, 4).join(' ')}</li>
                ))}
                {slowMoving.length === 0 && <span className="italic text-neutral-400">No matching SKUs</span>}
              </ul>
            </div>

            {/* DEAD */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="inline-flex items-center font-bold text-neutral-800 bg-neutral-150 px-2 py-0.5 rounded text-[10px]">
                  CLASS C (Stagnant/Dead)
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{deadStock.length} Products</span>
              </div>
              <ul className="text-[11px] text-neutral-500 space-y-1 list-disc list-inside bg-neutral-50 p-2 rounded">
                <li>PK-BOX-12X12 - Heavy corrugated stockpile</li>
                {deadStock.length > 1 && <li>+ {deadStock.length - 1} un-retrieved stock logs</li>}
              </ul>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
