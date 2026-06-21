/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Printer, 
  SlidersHorizontal,
  Layers, 
  AlertTriangle,
  Grid,
  CheckCircle2,
  Lock,
  ExternalLink,
  Barcode
} from 'lucide-react';
import { Product, Vendor } from '../../types';
import { WmsWarehouse, WmsWarehouseLocation, WmsBatchMaster } from './wmsTypes';

interface LiveStockProps {
  products: Product[];
  vendors: Vendor[];
  warehouses: WmsWarehouse[];
  locations: WmsWarehouseLocation[];
  batches: WmsBatchMaster[];
  onBulkUpdateStock: (updated: Product[]) => void;
  onBulkDelete: (ids: string[]) => void;
}

export default function LiveStock({
  products,
  vendors,
  warehouses,
  locations,
  batches,
  onBulkUpdateStock,
  onBulkDelete
}: LiveStockProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendorId, setSelectedVendorId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Checkboxes
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState(10);
  const [bulkAdjType, setBulkAdjType] = useState<'increase' | 'decrease'>('increase');

  // CSV Import simulation
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importCsvText, setImportCsvText] = useState(`sku,name,category,hsnCode,gstRate,purchasePrice,sellingPrice,qty\nEL-HDMI-5M,HDMI Cable premium,Electronics Accessories,85444299,18,300,600,150`);

  // Filter Categories
  const categoriesList = Array.from(new Set(products.map(p => p.category)));
  const brandList = ['Kraft Packs', 'EuroConductors', 'PolySeals Ltd', 'Generic'];

  // Master Filter computation
  const filteredProducts = products.filter(product => {
    // 1. Text searches matching Name / SKU / HSN
    const matchesQuery = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.hsnCode.includes(searchQuery);

    // 2. State filtering
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesVendor = selectedVendorId === 'all' || product.vendorId === selectedVendorId;
    const matchesBrand = selectedBrand === 'all' || 
      (selectedBrand === 'Generic' && !product.sku.startsWith('EL') && !product.sku.startsWith('PK')) ||
      (selectedBrand === 'EuroConductors' && product.sku.startsWith('EL')) ||
      (selectedBrand === 'Kraft Packs' && product.sku.startsWith('PK'));

    // 3. Stock Status filter
    let matchesStatus = true;
    if (selectedStatus === 'instock') matchesStatus = product.currentStock > product.minStockLevel;
    if (selectedStatus === 'lowstock') matchesStatus = product.currentStock > 0 && product.currentStock <= product.minStockLevel;
    if (selectedStatus === 'outstock') matchesStatus = product.currentStock === 0;

    // 4. Warehouse location match (Simulated slot location mapping)
    let matchesWarehouse = true;
    if (selectedWarehouseId !== 'all') {
      const isBOM = selectedWarehouseId === 'wh-1';
      // Simulating partition: EL/PK in BOM, Hub items elsewhere
      if (isBOM) {
        matchesWarehouse = product.sku.startsWith('EL') || product.sku.startsWith('PK') || product.sku.startsWith('PL');
      } else {
        matchesWarehouse = !product.sku.startsWith('PK');
      }
    }

    return matchesQuery && matchesCategory && matchesVendor && matchesBrand && matchesStatus && matchesWarehouse;
  });

  // Handle Multi Checkbox selections
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id]);
    } else {
      setSelectedProductIds(prev => prev.filter(item => item !== id));
    }
  };

  // Perform Simulated Exports to CSV
  const handleExportCSV = () => {
    const headers = 'SKU,Product Name,Category,HSN Code,GST Rate (%),Current Stock (Units),Purchase Price (INR),Asset Value (INR),Vendor,Status\n';
    const rows = filteredProducts.map(p => {
      const vendorName = vendors.find(v => v.id === p.vendorId)?.companyName || 'Unknown';
      const statusText = p.currentStock === 0 ? 'Out of Stock' : p.currentStock <= p.minStockLevel ? 'Low Stock' : 'In Stock';
      return `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}","${p.hsnCode}",${p.gstRate},${p.currentStock},${p.purchasePrice},${p.currentStock * p.purchasePrice},"${vendorName}","${statusText}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TTGT_Stock_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV parsing simulation triggered
  const handleImportCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const lines = importCsvText.split('\n');
      if (lines.length < 2) throw new Error('Missing rows in uploaded CSV dataset.');
      const newItems: Product[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',');
        if (cols.length < 8) continue;
        
        const [sku, name, category, hsn, gst, purchase, selling, qty] = cols;
        newItems.push({
          id: `imported-${Date.now()}-${i}`,
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          category: category.trim(),
          hsnCode: hsn.trim(),
          gstRate: (parseInt(gst) || 18) as any,
          cessRate: 0,
          purchasePrice: parseFloat(purchase) || 100,
          sellingPrice: parseFloat(selling) || 200,
          currentStock: parseInt(qty) || 50,
          minStockLevel: 25,
          status: 'Active',
          vendorId: vendors[0]?.id || 'vendor-1'
        });
      }

      onBulkUpdateStock([...products, ...newItems]);
      setShowImportPanel(false);
      alert(`Success: Integrated ${newItems.length} SKUs into active central ledger.`);
    } catch (err: any) {
      alert(`CSV Parser Error: ${err.message || 'Kindly verify columns: sku,name,category,hsnCode,gstRate,purchasePrice,sellingPrice,qty'}`);
    }
  };

  // Perform bulk updates (Soft level adjustment or bulk transfers)
  const handleExecuteBulkAdjustment = () => {
    if (selectedProductIds.length === 0) return;
    const multiplier = bulkAdjType === 'increase' ? 1 : -1;
    const modified = products.map(p => {
      if (selectedProductIds.includes(p.id)) {
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock + (bulkAdjustmentValue * multiplier))
        };
      }
      return p;
    });

    onBulkUpdateStock(modified);
    setShowBulkAdjustModal(false);
    setSelectedProductIds([]);
    alert(`Committed bulk quantities adjustment on ${selectedProductIds.length} checked ledger files.`);
  };

  // Execute Soft Delete simulation (marked inactive first)
  const handleBulkSoftDelete = () => {
    if (selectedProductIds.length === 0) return;
    const confirmVal = window.confirm(`Trigger corporate soft-delete (Archived marker) for ${selectedProductIds.length} checked SKUs?`);
    if (confirmVal) {
      onBulkDelete(selectedProductIds);
      setSelectedProductIds([]);
    }
  };

  // Bulk Print slips helper
  const handleBulkPrintLabels = () => {
    alert(`Triggering high-density barcode master queues for: ${selectedProductIds.length} SKUs.\nSpooling print buffers to TSC Barcode thermal printers.`);
  };

  return (
    <div className="space-y-4">
      
      {/* 1. FILTER CONTROLLER DECK */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={16} className="text-neutral-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800 font-mono">
              Live Stock Inventory Search Grid
            </h4>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-wrap items-center gap-2">
            
            <button
              id="import-csv-panel-btn"
              onClick={() => setShowImportPanel(!showImportPanel)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-dashed border-neutral-300 hover:border-neutral-800 text-neutral-600 hover:text-neutral-900 text-[11px] font-bold font-mono uppercase bg-neutral-50 rounded-lg transition"
            >
              <Upload size={13} />
              <span>Import Ledger</span>
            </button>

            <button
              id="export-stock-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center space-x-1 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-[11px] font-bold font-mono uppercase rounded-lg transition"
            >
              <Download size={13} />
              <span>Export CSV (All)</span>
            </button>

          </div>
        </div>

        {/* Dynamic CSV Import Drop drawer */}
        {showImportPanel && (
          <form onSubmit={handleImportCSVSubmit} className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-3 duration-200">
            <div className="flex justify-between items-center pb-1">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Bulk SKU CSV Ingestion Terminal</span>
              <button type="button" onClick={() => setShowImportPanel(false)} className="text-[10px] text-neutral-400 font-mono hover:underline">Close</button>
            </div>
            
            <textarea
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              rows={4}
              className="w-full bg-white p-2.5 font-mono text-[10px] text-neutral-700 border border-neutral-300 rounded outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-neutral-400 font-sans">Header layout needs exact: <code className="font-mono bg-neutral-200 px-1 rounded">sku,name,category,hsnCode,gstRate,purchasePrice,sellingPrice,qty</code></span>
              <button type="submit" className="px-4 py-1 bg-neutral-900 text-white rounded text-[11px] font-mono uppercase font-bold hover:bg-neutral-800">
                Commit Parse Ingestion
              </button>
            </div>
          </form>
        )}

        {/* INPUT AND SELECT DECK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Query search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-neutral-400" size={14} />
            <input
              id="stock-search-input"
              type="text"
              placeholder="Search SKU, HSN, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-2 text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 font-mono"
            />
          </div>

          {/* Warehouse */}
          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="px-2.5 py-2 text-xs text-neutral-850 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 font-mono"
          >
            <option value="all">🏢 All Warehouses (India)</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.code} - {wh.city}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-2 text-xs text-neutral-850 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900"
          >
            <option value="all">📂 Categories (Matrix)</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Vendor */}
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            className="px-2.5 py-2 text-xs text-neutral-850 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900 font-mono"
          >
            <option value="all">🤝 Filter by Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.companyName.substring(0,20)}...</option>
            ))}
          </select>

          {/* Brand */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-2 text-xs text-neutral-850 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900"
          >
            <option value="all">🏷️ Brand Matrix</option>
            {brandList.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Stock Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-2 text-xs text-neutral-850 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:bg-white focus:border-neutral-900"
          >
            <option value="all">📶 All Stock Statuses</option>
            <option value="instock">✔️ Safe Buffer (In Stock)</option>
            <option value="lowstock">⚠️ Low Stock Warnings</option>
            <option value="outstock">❌ Depleted / Out of Stock</option>
          </select>

        </div>
      </div>

      {/* 2. BULK OPERATIONS TRIGGER STRIP */}
      {selectedProductIds.length > 0 && (
        <div className="bg-neutral-900 text-white rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in slide-in-from-bottom-2 duration-150">
          <span className="text-[11px] font-mono text-neutral-300">
            Selected <strong>{selectedProductIds.length}</strong> material items for bulk enterprise actions.
          </span>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono select-none">
            
            <button
              onClick={() => setShowBulkAdjustModal(true)}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded text-white text-[10px] font-bold uppercase transition"
            >
              <SlidersHorizontal size={11} />
              <span>Bulk Adj. Qty</span>
            </button>

            <button
              onClick={handleBulkPrintLabels}
              className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-[10px] font-bold uppercase transition"
            >
              <Printer size={11} />
              <span>Bulk Label Print</span>
            </button>

            <button
              onClick={handleBulkSoftDelete}
              className="flex items-center space-x-1 px-3 py-1 bg-rose-700 hover:bg-rose-800 rounded text-white text-[10px] font-bold uppercase transition animate-pulse"
            >
              <Trash2 size={11} />
              <span>Soft Delete</span>
            </button>

            <button
              onClick={() => setSelectedProductIds([])}
              className="px-2 py-1 text-neutral-400 hover:text-white text-[10px] uppercase font-bold"
            >
              Cancel Selection
            </button>

          </div>
        </div>
      )}

      {/* Bulk adjustment modal overlay simulation */}
      {showBulkAdjustModal && (
        <div className="bg-neutral-950/20 border border-neutral-300 p-4 rounded-xl space-y-4 shadow-lg bg-orange-50 animate-in zoom-in-95 duration-100">
          <div className="flex justify-between items-center border-b border-orange-200 pb-1.5">
            <h5 className="text-xs font-bold font-mono text-orange-950 uppercase">Execute Direct Stock Adjustment</h5>
            <button onClick={() => setShowBulkAdjustModal(false)} className="text-[10px] text-neutral-400 hover:text-neutral-750">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold block">Type</span>
              <select
                value={bulkAdjType}
                onChange={(e) => setBulkAdjType(e.target.value as any)}
                className="w-full bg-white border rounded text-xs p-1.5 font-mono"
              >
                <option value="increase">Increase (+)</option>
                <option value="decrease">Decrease (-)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold block">Quantities</span>
              <input
                type="number"
                value={bulkAdjustmentValue}
                onChange={(e) => setBulkAdjustmentValue(parseInt(e.target.value) || 0)}
                className="w-full bg-white border rounded text-xs p-1.5 font-mono"
              />
            </div>
            <div className="space-y-1 flex items-end">
              <button
                onClick={handleExecuteBulkAdjustment}
                className="w-full py-1.5 bg-neutral-900 text-white rounded text-xs font-bold hover:bg-neutral-800 uppercase tracking-wide font-mono"
              >
                Commit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. STOCK LEDGER DATA TABLE */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-150 flex items-center justify-between bg-neutral-50/50">
          <span className="text-xs font-black font-mono text-neutral-800 uppercase tracking-wide">
            Enterprise Stock Ledger Register
          </span>
          <span className="text-[10px] text-neutral-400 font-mono uppercase">
            {filteredProducts.length} matching SKUs in pipeline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] font-mono text-neutral-400 uppercase tracking-wider select-none">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-indigo-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                </th>
                <th className="py-3 px-4">SKU & Graphic</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Tax Mapping (HSN/GST)</th>
                <th className="py-3 px-4">Physically Located</th>
                <th className="py-3 px-4">Ledger Stock</th>
                <th className="py-3 px-4">WMS Status</th>
                <th className="py-3 px-4 text-right">Valuation (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-600">
              {filteredProducts.map(p => {
                const isSelected = selectedProductIds.includes(p.id);
                
                // Helper state indicators
                const isOutOfStock = p.currentStock === 0;
                const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStockLevel;

                // Match layout location
                const binSlot = locations.find(l => l.currentProductId === p.id);
                const warehouseLoc = binSlot 
                  ? `${binSlot.warehouseCode} (Zone: ${binSlot.zone.split(' ')[1]}, Bin ${binSlot.aisle}-${binSlot.rack}-${binSlot.shelf}-${binSlot.bin})`
                  : 'Central Unassigned Loading Bay';

                // Indian formatting
                const assetValueVal = p.currentStock * p.purchasePrice;

                return (
                  <tr key={p.id} className={`hover:bg-neutral-50/40 transition duration-100 ${isSelected ? 'bg-indigo-50/20' : ''}`}>
                    <td className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                        className="rounded border-neutral-300 text-indigo-600 focus:ring-0 cursor-pointer h-3.5 w-3.5"
                      />
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=100&q=80'} 
                          alt={p.sku} 
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 object-cover rounded-lg border bg-neutral-100 shrink-0" 
                        />
                        <div>
                          <strong className="text-neutral-800 block text-[11px] leading-tight uppercase font-black">{p.sku}</strong>
                          <span className="text-[9px] text-neutral-400 tracking-wider">HSN: {p.hsnCode}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-neutral-750 font-normal leading-normal line-clamp-2">{p.name}</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px]">
                      <div className="text-neutral-700">GST: <strong>{p.gstRate}%</strong></div>
                      <div className="text-neutral-400 mt-0.5">Cess: {p.cessRate || 0}%</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-neutral-600 text-[11px] block">{warehouseLoc}</span>
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-neutral-900 font-mono text-[13px]">{p.currentStock.toLocaleString()}</strong>
                      <span className="text-[9px] text-neutral-400 block font-mono">Min limit: {p.minStockLevel}</span>
                    </td>

                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center font-bold font-mono px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-100">
                          DEPLETED
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center font-bold font-mono px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-100">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center font-bold font-mono px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                          IN STOCK
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-right font-bold text-neutral-800">
                      ₹{assetValueVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 p-4 text-center text-xs text-neutral-400 italic">
                    Zero registers matches selected search/filters configurations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
