/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  Layers, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  Tag, 
  Archive, 
  Percent, 
  FileBox 
} from 'lucide-react';
import { PimProduct } from './pimTypes';
import { Vendor } from '../../types';

interface ProductDashboardProps {
  products: PimProduct[];
  vendors: Vendor[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  onNavigate: (tab: string) => void;
}

export default function ProductDashboard({
  products,
  vendors,
  categories,
  brands,
  onNavigate
}: ProductDashboardProps) {

  // Counts & Status breakdown
  const totalCount = products.length;
  const activeCount = products.filter(p => p.status === 'Active').length;
  const inactiveCount = products.filter(p => p.status === 'Inactive').length;
  
  const draftCount = products.filter(p => p.approvalStatus === 'Draft').length;
  const pendingCount = products.filter(p => p.approvalStatus === 'Pending Review' || p.approvalStatus === 'Submitted').length;
  const approvedCount = products.filter(p => p.approvalStatus === 'Approved').length;
  const rejectedCount = products.filter(p => p.approvalStatus === 'Rejected').length;

  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= (p.minStockLevel || 10)).length;

  // Inventory value calculation
  const totalValuation = products.reduce((acc, p) => {
    const cost = p.landingCost || p.purchasePrice || 0;
    return acc + (p.currentStock * cost);
  }, 0);

  // Distribution calculations
  const categorySummary: Record<string, number> = {};
  const brandSummary: Record<string, number> = {};
  const gstSummary: Record<string, number> = { '0': 0, '5': 0, '12': 0, '18': 0, '28': 0 };
  const hsnSummary: Record<string, number> = {};

  products.forEach(p => {
    // Categories
    const catName = p.category || 'Uncategorized';
    categorySummary[catName] = (categorySummary[catName] || 0) + 1;

    // Brands
    const brandName = p.brand || 'No Brand';
    brandSummary[brandName] = (brandSummary[brandName] || 0) + 1;

    // GST
    const rateStr = p.gstRate !== undefined ? p.gstRate.toString() : '18';
    if (rateStr in gstSummary) {
      gstSummary[rateStr] += 1;
    } else {
      gstSummary[rateStr] = (gstSummary[rateStr] || 0) + 1;
    }

    // HSN
    if (p.hsnCode) {
      hsnSummary[p.hsnCode] = (hsnSummary[p.hsnCode] || 0) + 1;
    }
  });

  // Sort and top sellers mock or actual based on stock sales representation
  const topSellingMock = [...products]
    .sort((a, b) => (b.mrp || b.sellingPrice) - (a.mrp || a.sellingPrice))
    .slice(0, 4);

  const recentlyAdded = [...products]
    .slice(-4)
    .reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">PIM Dashboard</h2>
          <p className="text-xs text-neutral-500 font-mono">Centralized monitoring of product models, GST classes and compliance states across India.</p>
        </div>
        <div className="bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span className="text-[11px] font-bold font-mono text-indigo-700">GSTIN ACTIVE MODE</span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Total SKUs</span>
            <Layers size={18} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-neutral-850 block">{totalCount}</span>
            <span className="text-[10px] text-neutral-500 font-mono">Across all branches</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-400">Approved</span>
            <CheckCircle size={18} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-emerald-600 block">{approvedCount}</span>
            <span className="text-[10px] text-emerald-500 font-semibold font-mono">{(approvedCount / (totalCount || 1) * 100).toFixed(0)}% compliant</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-400">Under Review</span>
            <AlertCircle size={18} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-amber-600 block">{pendingCount}</span>
            <span className="text-[10px] text-neutral-500 font-mono">{draftCount} drafts pending submission</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono text-neutral-400">Stock Alerts</span>
            <AlertCircle size={18} className="animate-pulse" />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-extrabold text-rose-600 block">{outOfStockCount + lowStockCount}</span>
            <div className="text-[10px] text-neutral-500 font-mono">
              <span className="text-rose-600 font-bold">{outOfStockCount} Out</span> • <span className="text-amber-600 font-bold">{lowStockCount} Low</span>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 text-white p-4 rounded-xl border border-neutral-800 shadow-md flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Stock Valuation</span>
            <DollarSign size={18} className="text-amber-500" />
          </div>
          <div className="mt-2.5">
            <span className="text-xl font-bold tracking-tight block">₹{totalValuation.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-neutral-400 font-mono">Cost valuation basis</span>
          </div>
        </div>

      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tax Brackets & HSN Summary */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-neutral-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Percent size={14} className="text-indigo-600" />
              <span>GST Compliance Spread</span>
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">Active SKUs</span>
          </div>

          <div className="space-y-3">
            {Object.entries(gstSummary).map(([rate, count]) => {
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              let label = 'Standard';
              if (rate === '0') label = 'Exempt';
              if (rate === '5') label = 'Textiles/Yarn';
              if (rate === '12') label = 'Packing/Spares';
              if (rate === '28') label = 'Luxury Class';

              return (
                <div key={rate} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-700 font-bold">{rate}% GST Bracket <span className="text-[10px] text-neutral-400 font-medium">({label})</span></span>
                    <span className="text-neutral-500 font-bold">{count} SKUs ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150 text-[10px] font-mono text-neutral-500 space-y-1">
            <span className="block font-bold text-neutral-700">HSN Tariff Distribution:</span>
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              {Object.entries(hsnSummary).slice(0, 4).map(([hsn, cnt]) => (
                <span key={hsn}>📌 HSN {hsn}: <strong>{cnt} SKUs</strong></span>
              ))}
              {Object.keys(hsnSummary).length > 4 && (
                <span className="col-span-2 text-neutral-400">+ {Object.keys(hsnSummary).length - 4} more HSN tariff lines</span>
              )}
            </div>
          </div>
        </div>

        {/* Categories & Brands distribution */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h3 className="font-bold text-neutral-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
                <FileBox size={14} className="text-indigo-600" />
                <span>Categories Allocation</span>
              </h3>
              <button onClick={() => onNavigate('categories')} className="text-[10px] text-indigo-600 hover:underline font-mono">Manage</button>
            </div>
            
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {Object.keys(categorySummary).length === 0 ? (
                <span className="text-xs text-neutral-400 italic block py-4 text-center">No categories registered yet.</span>
              ) : (
                Object.entries(categorySummary).map(([cat, count]) => {
                  const pct = (count / totalCount) * 100;
                  return (
                    <div key={cat} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-600 truncate max-w-[150px]">{cat}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600 font-bold">{count} SKUs</span>
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t pt-3 mt-4">
            <span className="text-[10px] font-mono font-bold uppercase block text-neutral-400 mb-2">Primary Brands Summary</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(brandSummary).map(([brand, count]) => (
                <span key={brand} className="text-[9px] bg-neutral-50 px-2 py-1 rounded-full border border-neutral-200 font-mono text-neutral-600">
                  {brand}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Master Catalog Approvals Workflow Status */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-neutral-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Archive size={14} className="text-indigo-600" />
              <span>Catalog State Gateways</span>
            </h3>
            <button onClick={() => onNavigate('product-approval')} className="text-[10px] text-indigo-600 hover:underline font-mono">Review Board</button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-150">
              <span className="text-lg font-bold text-neutral-600 block">{draftCount}</span>
              <span className="text-[9px] text-neutral-400 uppercase font-mono block font-bold">Drafts</span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
              <span className="text-lg font-bold text-amber-700 block animate-pulse">{pendingCount}</span>
              <span className="text-[9px] text-amber-500 uppercase font-mono block font-bold">Submitted</span>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
              <span className="text-lg font-bold text-indigo-700 block">{approvedCount}</span>
              <span className="text-[9px] text-indigo-500 uppercase font-mono block font-bold">Approved</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <span className="font-mono text-[10px] text-neutral-400 uppercase font-bold block">PIM System Clearance Status</span>
            <div className="p-3 bg-neutral-50 rounded-lg border flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 block leading-none">Compliant ERP Sync</span>
                <span className="font-bold text-neutral-800">Direct Gateway Ready</span>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded font-mono uppercase">100% ONLINE</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row with Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Valuation / High Ticket Products */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-neutral-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <TrendingUp size={14} className="text-emerald-500" />
              <span>Premium Core Products (Top MRP Value)</span>
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">PIM Sorted</span>
          </div>

          <div className="divide-y divide-neutral-100">
            {topSellingMock.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center space-x-3 min-w-0">
                  <img 
                    src={p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=100&q=80'} 
                    alt="" 
                    className="h-9 w-9 bg-neutral-50 rounded border object-cover shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono bg-neutral-100 px-1 py-0.2 rounded text-neutral-500 font-bold uppercase">{p.sku}</span>
                    <span className="block text-xs font-bold text-neutral-800 truncate">{p.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="block text-xs font-bold text-neutral-750">₹{(p.mrp || p.sellingPrice || 0).toLocaleString('en-IN')}</span>
                  <span className="text-[9px] text-neutral-400 uppercase font-sans">MRP Pricing</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Logged SKUs */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-neutral-800 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Building2 size={14} className="text-neutral-500" />
              <span>Recently Registered Catalogue Items</span>
            </h3>
            <button onClick={() => onNavigate('product-list')} className="text-[10px] text-indigo-600 hover:underline font-mono">View List</button>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentlyAdded.map(p => {
              const vendMatch = vendors.find(v => v.id === p.vendorId);
              return (
                <div key={p.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-7 w-7 rounded bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 text-[10px] font-bold text-indigo-700 font-mono">
                      SKU
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-neutral-800 truncate">{p.name}</span>
                      <span className="text-[9px] text-neutral-400 font-mono">Vendor: {vendMatch ? vendMatch.companyName : 'Direct System Binding'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">{p.gstRate}% GST</span>
                    <span className="block text-[9px] text-neutral-400 mt-1 uppercase font-semibold">HSN {p.hsnCode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
