/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  FileDown, 
  FileUp, 
  SlidersHorizontal, 
  MoreVertical, 
  Edit3, 
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Tag,
  Briefcase
} from 'lucide-react';
import { PimProduct } from './pimTypes';
import { Vendor } from '../../types';

interface ProductListProps {
  products: PimProduct[];
  vendors: Vendor[];
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  onDeleteProduct: (id: string) => void;
  onEditProduct: (p: PimProduct) => void;
  onBulkUpdate: (updatedProducts: PimProduct[]) => void;
}

export default function ProductList({
  products,
  vendors,
  categories,
  brands,
  onDeleteProduct,
  onEditProduct,
  onBulkUpdate
}: ProductListProps) {
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterVendor, setFilterVendor] = useState('All');
  const [filterGst, setFilterGst] = useState('All');
  const [filterHsn, setFilterHsn] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterApproval, setFilterApproval] = useState('All');

  // Multi-select and bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [bulkVal, setBulkVal] = useState('');
  
  // Excel File Import Simulator
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // Filtering Logic
  const filtered = products.filter(p => {
    const sTerm = search.toLowerCase();
    const searchMatch = !search || 
      p.name.toLowerCase().includes(sTerm) ||
      p.sku.toLowerCase().includes(sTerm) ||
      (p.barcode && p.barcode.includes(sTerm)) ||
      (p.brand && p.brand.toLowerCase().includes(sTerm)) ||
      p.hsnCode.includes(sTerm);

    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchBrand = filterBrand === 'All' || p.brand === filterBrand;
    const matchVendor = filterVendor === 'All' || p.vendorId === filterVendor;
    const matchGst = filterGst === 'All' || p.gstRate.toString() === filterGst;
    const matchHsn = filterHsn === 'All' || p.hsnCode === filterHsn;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchType = filterType === 'All' || p.productType === filterType;
    const matchApproval = filterApproval === 'All' || p.approvalStatus === filterApproval;

    return searchMatch && matchCat && matchBrand && matchVendor && matchGst && matchHsn && matchStatus && matchType && matchApproval;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Operations Handlers
  const handleExecuteBulkAction = () => {
    if (selectedIds.length === 0) return;
    let desc = '';
    const updated = products.map(p => {
      if (!selectedIds.includes(p.id)) return p;
      
      const clone = { ...p };
      switch (bulkActionType) {
        case 'price':
          // Scale price value by percentage or set flat
          const percent = parseFloat(bulkVal);
          if (!isNaN(percent)) {
            clone.sellingPrice = Math.round(clone.sellingPrice * (1 + percent / 100));
            if (clone.mrp) clone.mrp = Math.round(clone.mrp * (1 + percent / 100));
          }
          break;
        case 'gst':
          const gRate = parseInt(bulkVal);
          if ([0, 5, 12, 18, 28].includes(gRate)) {
            clone.gstRate = gRate as any;
          }
          break;
        case 'hsn':
          if (bulkVal.length === 6 || bulkVal.length === 8) {
            clone.hsnCode = bulkVal;
          }
          break;
        case 'category':
          clone.category = bulkVal;
          break;
        case 'brand':
          clone.brand = bulkVal;
          break;
        case 'marketplace':
          // Enable for marketplace
          if (!clone.marketplaces) clone.marketplaces = {};
          clone.marketplaces[bulkVal] = {
            enabled: true,
            sku: `${clone.sku}-${bulkVal.toUpperCase()}`,
            sellingPrice: clone.sellingPrice * 1.05,
            status: 'Active'
          };
          break;
        case 'status':
          clone.status = bulkVal as any;
          break;
        default:
          break;
      }
      return clone;
    });

    onBulkUpdate(updated);
    setSelectedIds([]);
    setShowBulkPanel(false);
    alert(`Bulk update successfully executed on ${selectedIds.length} catalog items.`);
  };

  // BULK DELETE
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you absolutely sure you want to soft-delete ${selectedIds.length} selected SKUs?`)) {
      const remaining = products.filter(p => !selectedIds.includes(p.id));
      onBulkUpdate(remaining);
      setSelectedIds([]);
      alert(`Successfully deleted ${selectedIds.length} catalogue registers.`);
    }
  };

  // EXPORT SIMULATOR
  const triggerExport = (format: 'CSV' | 'XLSX') => {
    const columns = 'ID,SKU,Name,Category,Brand,HSN,GST_Rate,Purchase_Price,Selling_Price,Stock,Status\n';
    const rows = filtered.map(p => `"${p.id}","${p.sku}","${p.name}","${p.category}","${p.brand || ''}","${p.hsnCode}",${p.gstRate},${p.purchasePrice},${p.sellingPrice},${p.currentStock},"${p.status}"`).join('\n');
    
    const blob = new Blob([columns + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PIM_Ledger_Export_${Date.now()}.${format === 'CSV' ? 'csv' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // EXCEL IMPORT SIMULATOR
  const executeImportSimulation = () => {
    if (!importText.trim()) return;
    try {
      const parsed: any[] = JSON.parse(importText.trim());
      const added: PimProduct[] = parsed.map((item, idx) => ({
        id: `prod-imported-${Date.now()}-${idx}`,
        sku: item.sku?.toUpperCase() || `SKU-SIM-${idx}`,
        name: item.name || `Imported Cargo Ref ${idx}`,
        category: item.category || 'Electronics Accessories',
        brand: item.brand || 'Generic',
        hsnCode: item.hsnCode || '85444299',
        gstRate: item.gstRate || 18,
        cessRate: 0,
        purchasePrice: item.purchasePrice || 100,
        sellingPrice: item.sellingPrice || 180,
        minStockLevel: 20,
        currentStock: item.currentStock || 100,
        status: 'Active',
        productType: 'Simple',
        approvalStatus: 'Approved',
        vendorId: 'vendor-1'
      }));

      onBulkUpdate([...products, ...added]);
      setShowImportModal(false);
      setImportText('');
      alert(`Bulk Excel parsing completed! ${added.length} SKU directories ingested.`);
    } catch {
      alert('Formatting validation failed. Please make sure input structure is standard JSON array format.');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-200">
        
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-neutral-600">
          <button 
            onClick={() => triggerExport('CSV')}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-neutral-100 border hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg transition"
          >
            <FileDown size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => triggerExport('XLSX')}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-neutral-100 border hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg transition"
          >
            <FileDown size={14} />
            <span>Export worksheets</span>
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition"
          >
            <FileUp size={14} />
            <span>Import Worksheets</span>
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-3 text-xs font-mono animate-in slide-in-from-right-2 duration-150-all">
            <span className="text-neutral-500 font-bold bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-1 rounded">
              Selected {selectedIds.length} SKU items
            </span>
            <button 
              onClick={() => { setShowBulkPanel(!showBulkPanel); setBulkActionType(''); }}
              className="py-1.5 px-3 bg-neutral-900 font-bold text-white uppercase text-[10px] rounded hover:bg-neutral-800"
            >
              Bulk Action Options
            </button>
            <button 
              onClick={handleBulkDelete}
              className="p-1.5 text-rose-500 border border-rose-100 bg-rose-50/50 hover:bg-rose-100 rounded"
              title="Bulk Delete"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

      </div>

      {/* BULK ACTION CHUTE PANEL */}
      {showBulkPanel && selectedIds.length > 0 && (
        <div className="bg-neutral-900 text-white p-4 rounded-xl border space-y-3 animate-in slide-in-from-top-3 duration-250 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
            <span className="font-bold text-[10.5px] text-amber-500">DYNAMIC BULK CATALOG UPDATE CHUTE</span>
            <button onClick={() => setShowBulkPanel(false)} className="text-[10px] text-neutral-500 hover:text-white">Cancel</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[9.5px] text-neutral-400 block font-bold">MUTATION TYPE</span>
              <select 
                value={bulkActionType}
                onChange={e => { setBulkActionType(e.target.value); setBulkVal(''); }}
                className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs"
              >
                <option value="">-- Select Field --</option>
                <option value="price">Selling Prices Scaling (eg. +10%, -5%)</option>
                <option value="gst">GST Rate Tax Bracket</option>
                <option value="hsn">HSN Tariff Ingest (6/8 digits)</option>
                <option value="category">Assign Classification Vertical</option>
                <option value="brand">Assign Brand Register</option>
                <option value="marketplace">Publish to Marketplace</option>
                <option value="status">Scale Active Status</option>
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] text-neutral-400 block font-bold">MUTATION VALUE</span>
              
              {bulkActionType === 'gst' ? (
                <select value={bulkVal} onChange={e => setBulkVal(e.target.value)} className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs">
                  <option value="">-- Choose GST Bracket --</option>
                  <option value="0">0% GST Bracket</option>
                  <option value="5">5% GST Bracket</option>
                  <option value="12">12% GST Bracket</option>
                  <option value="18">18% GST Bracket</option>
                  <option value="28">28% GST Bracket</option>
                </select>
              ) : bulkActionType === 'category' ? (
                <select value={bulkVal} onChange={e => setBulkVal(e.target.value)} className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs">
                  <option value="">-- Choose Vertical --</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              ) : bulkActionType === 'brand' ? (
                <select value={bulkVal} onChange={e => setBulkVal(e.target.value)} className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs">
                  <option value="">-- Choose Brand --</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              ) : bulkActionType === 'marketplace' ? (
                <select value={bulkVal} onChange={e => setBulkVal(e.target.value)} className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs">
                  <option value="">-- Choose Marketplace --</option>
                  <option value="amazon">Amazon India</option>
                  <option value="flipkart">Flipkart</option>
                  <option value="meesho">Meesho</option>
                  <option value="jiomart">JioMart</option>
                  <option value="myntra">Myntra</option>
                </select>
              ) : bulkActionType === 'status' ? (
                <select value={bulkVal} onChange={e => setBulkVal(e.target.value)} className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs">
                  <option value="">-- Choose Status --</option>
                  <option value="Active">Active State</option>
                  <option value="Inactive">Inactive State</option>
                </select>
              ) : (
                <input 
                  type="text" 
                  value={bulkVal}
                  onChange={e => setBulkVal(e.target.value)}
                  placeholder={bulkActionType === 'price' ? 'e.g. +10 for +10% markup' : 'Inputs value...'}
                  className="w-full bg-neutral-800 text-white p-1.5 border border-neutral-700 rounded text-xs font-sans"
                  disabled={!bulkActionType}
                />
              )}
            </div>

            <div className="flex items-end">
              <button 
                onClick={handleExecuteBulkAction}
                className="w-full h-9 bg-indigo-650 hover:bg-indigo-700 font-bold text-white rounded font-mono shadow text-[11px]"
                disabled={!bulkActionType || !bulkVal}
              >
                Execute Bulk Mutator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
        
        {/* Row 1: Search and Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="md:col-span-2 flex items-center space-x-2 bg-neutral-50 px-3 py-1.5 border border-neutral-200 rounded-lg">
            <Search size={14} className="text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by SKU, Barcode, Product Name, Brand, HSN..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-sans"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Vertical classification</span>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-220">
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Brand markings</span>
            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-220">
              <option value="All">All Brands</option>
              {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Tax, Type, Flow status */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs font-mono pt-1">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Registered vendor</span>
            <select value={filterVendor} onChange={e => setFilterVendor(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-150">
              <option value="All">All Vendors</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">GST bracket</span>
            <select value={filterGst} onChange={e => setFilterGst(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-150">
              <option value="All">All GST Brackets</option>
              <option value="0">0% (Exempt)</option>
              <option value="5">5% (Textiles)</option>
              <option value="12">12% (Boxes)</option>
              <option value="18">18% (Electronics)</option>
              <option value="28">28% (Luxury)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Product Type</span>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-150">
              <option value="All">All Types</option>
              <option value="Simple">Simple Products</option>
              <option value="Variable">Variable Products</option>
              <option value="Bundle">Bundle Products</option>
              <option value="Service">Service Products</option>
              <option value="Serialized">Serialized Products</option>
              <option value="Batch">Batch Products</option>
              <option value="Expiry">Expiry Products</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Active Status</span>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-150">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1 col-span-2 md:col-span-1">
            <span className="text-[9px] text-neutral-450 font-bold block leading-none uppercase">Quality Gateway</span>
            <select value={filterApproval} onChange={e => setFilterApproval(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded border-neutral-150">
              <option value="All">All Clearance Levels</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>

      </div>

      {/* MAIN CATALOG TABLE */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100 uppercase text-[9px] font-bold">
              <th className="py-3 px-4 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
              </th>
              <th className="py-3 px-3">Item details</th>
              <th className="py-3 px-2">Type / Brand</th>
              <th className="py-3 px-2">Tariff specs</th>
              <th className="py-3 px-2">Wholesale cost</th>
              <th className="py-3 px-2">MRP Pricing</th>
              <th className="py-3 px-2 text-center">Clearance Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(p => {
              const vendor = vendors.find(v => v.id === p.vendorId);
              const isSelected = selectedIds.includes(p.id);
              return (
                <tr key={p.id} className={`hover:bg-neutral-50/75 transition-colors ${isSelected ? 'bg-indigo-50/20' : ''}`}>
                  <td className="py-3 px-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => toggleSelect(p.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                    />
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    <div className="flex items-center space-x-3 max-w-sm">
                      <img 
                        src={p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=100&q=80'} 
                        alt="" 
                        className="h-10 w-10 bg-neutral-100 rounded object-cover shrink-0 border border-neutral-100" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-500 px-1 rounded uppercase tracking-wider">{p.sku}</span>
                          <span className={`h-2 w-2 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-300'}`} title={p.status} />
                        </div>
                        <h4 className="font-bold text-neutral-850 text-xs truncate mt-0.5" title={p.name}>{p.name}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate">Vendor: {vendor ? vendor.companyName : 'Direct Ingestion'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-neutral-600 font-sans">
                    <div className="text-[11px] font-semibold text-neutral-750">{p.productType || 'Simple'}</div>
                    <span className="text-[9.5px] font-mono text-neutral-400 block uppercase leading-none mt-0.5">{p.brand || 'No Brand'}</span>
                  </td>
                  <td className="py-3.5 px-2 text-neutral-700">
                    <div className="flex items-center space-x-1">
                      <Briefcase size={12} className="text-neutral-400" />
                      <strong>HSN {p.hsnCode}</strong>
                    </div>
                    <span className="text-[10px] border border-orange-100 bg-orange-50 text-orange-700 px-1 rounded font-bold inline-block mt-0.5">{p.gstRate}% Tax</span>
                  </td>
                  <td className="py-3.5 px-2 font-mono text-neutral-700">
                    <div className="text-neutral-500 leading-none">Ex. GST:</div>
                    <strong className="text-xs text-neutral-800">₹{p.purchasePrice}</strong>
                  </td>
                  <td className="py-3.5 px-2 font-mono">
                    <div className="text-neutral-400 leading-none">Selling B2B:</div>
                    <strong className="text-xs text-emerald-600">₹{p.sellingPrice}</strong>
                    {p.mrp && <span className="block text-[9px] text-neutral-400 uppercase leading-none font-medium mt-0.5">MRP: ₹{p.mrp}</span>}
                  </td>
                  <td className="py-3.5 px-2 text-center font-mono">
                    <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${p.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : p.approvalStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {p.approvalStatus || 'Approved'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button 
                        onClick={() => onEditProduct(p)}
                        className="p-1 px-2 border rounded-md text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition"
                        title="Edit Details"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-1 px-2 border rounded-md text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition"
                        title="Delete SKU"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-neutral-400 bg-neutral-50 font-sans text-xs">
                  No active material SKU records matches those specific search query parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EXCEL IMPORT SIMULATOR MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-xl w-full border border-neutral-300 p-6 space-y-4 shadow-xl font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-extrabold text-sm uppercase text-neutral-800 flex items-center gap-1.5">
                <FileUp size={16} className="text-indigo-600" />
                <span>Bulk Spreadsheet Parser (Simulation Hub)</span>
              </span>
              <button onClick={() => setShowImportModal(false)} className="text-xs text-neutral-400 hover:text-neutral-600 font-bold">Close</button>
            </div>

            <div className="space-y-2 font-sans text-neutral-600 leading-relaxed text-[11px]">
              <p>
                To simulate importing products catalog worksheets directly from inventory folders, paste an array of product structures inside the panel below.
              </p>
              <div className="p-2.5 bg-neutral-50 border rounded-lg text-[10px] font-mono leading-none">
                {`[`} <br />
                {`  {"sku": "EL-HDMI-5M", "name": "4K Gold HDMI 5m", "category": "Electronics Accessories", "gstRate": 18, "hsnCode": "85444299", "purchasePrice": 210, "sellingPrice": 450, "currentStock": 350}`} <br />
                {`]`}
              </div>
            </div>

            <textarea 
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`Paste valid JSON workbook items...`}
              rows={6}
              className="w-full bg-neutral-55 border p-2.5 rounded font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />

            <div className="flex justify-end space-x-2 pt-1 border-t">
              <button 
                onClick={() => {
                  setImportText(JSON.stringify([
                    {
                      sku: "TX-POLY-REEL",
                      name: "Premium Polyester Industrial Reel - 1000m",
                      category: "Textiles & Threads",
                      gstRate: 5,
                      hsnCode: "54011000",
                      purchasePrice: 45.00,
                      sellingPrice: 95.00,
                      currentStock: 150
                    },
                    {
                      sku: "PL-CAP-GLA-50",
                      name: "Sleek Plastic Closures & Caps (Pack of 50)",
                      category: "Plastics & Closures",
                      gstRate: 18,
                      hsnCode: "39269099",
                      purchasePrice: 60.00,
                      sellingPrice: 130.00,
                      currentStock: 800
                    }
                  ], null, 2));
                }}
                className="text-[10px] px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded font-bold font-mono"
              >
                Load Template
              </button>
              <button 
                onClick={executeImportSimulation}
                className="px-4 py-1.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow"
                disabled={!importText}
              >
                Ingest Workbook
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
