/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Barcode, 
  Printer, 
  Settings, 
  Search, 
  Tag, 
  BookOpen, 
  Download, 
  AlertCircle 
} from 'lucide-react';
import { PimProduct } from './pimTypes';

interface BarcodeManagerProps {
  products: PimProduct[];
}

export default function BarcodeManager({
  products
}: BarcodeManagerProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [includeSellingPrice, setIncludeSellingPrice] = useState(true);
  const [includeGstAndHsn, setIncludeGstAndHsn] = useState(true);
  const [includeBrand, setIncludeBrand] = useState(true);
  const [labelQuantity, setLabelQuantity] = useState(24);
  const [barcodeScannerInput, setBarcodeScannerInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<PimProduct | null>(null);
  const [scanError, setScanError] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Generate mock EAN barcode sequence safely
  const generateMockBarcode = (sku: string) => {
    let code = '890'; // India prefix (GS1 compliant country code for India)
    const normalized = sku.replaceAll(/[^a-zA-Z0-9]/g, '');
    const mid = normalized.slice(0, 9).padEnd(9, '0');
    let raw = code + mid;
    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(raw[i]);
      sum += (i % 2 === 0) ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return raw + checkDigit;
  };

  const handleScannerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(false);
    setScannedProduct(null);

    const match = products.find(p => {
      const bcode = generateMockBarcode(p.sku);
      return p.sku.toLowerCase() === barcodeScannerInput.trim().toLowerCase() || bcode === barcodeScannerInput.trim();
    });

    if (match) {
      setScannedProduct(match);
      setBarcodeScannerInput('');
    } else {
      setScanError(true);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:py-0 print:space-y-0">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b pb-3 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center space-x-2">
            <Barcode size={24} className="text-slate-800" />
            <span>GS1 Ready Retail Barcoding Suite</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono">Design, print, and emulate hardware scanning for Indian retail store registers and packaging.</p>
        </div>
        <div className="flex space-x-2 text-xs font-mono">
          <button 
            onClick={handleTriggerPrint}
            className="flex items-center space-x-1.5 h-9 bg-neutral-900 text-white px-4 rounded-lg hover:bg-neutral-800 transition shadow"
            disabled={!selectedProduct}
          >
            <Printer size={15} />
            <span>Spool Label Sheet</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* DESIGN CONTROLLER PANEL */}
        <div className="lg:col-span-4 space-y-5 print:hidden">
          
          {/* Label selector card */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b">Sticker Label Selection</span>
            
            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">TARGET SKUS CATALOGUE</span>
                <select 
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-neutral-50 p-2 border rounded font-sans border-neutral-220 text-xs focus:border-indigo-500 outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>[{p.sku}] {p.name.slice(0, 48)}...</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">LABEL MATRIX SHEET QUANTITY</span>
                <input 
                  type="number" 
                  min={1} 
                  max={120} 
                  value={labelQuantity}
                  onChange={e => setLabelQuantity(parseInt(e.target.value) || 24)}
                  className="w-full bg-neutral-50 p-2 border rounded focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sticker layout toggles */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <span className="text-[10px] font-mono font-bold text-[#94a3b8] uppercase block pb-1 border-b">Template Customizer</span>
            <div className="space-y-3 font-mono text-xs">
              
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <span className="text-[11px] text-neutral-600 font-sans">Print MRP & Commercial Pricing</span>
                <input 
                  type="checkbox" 
                  checked={includeSellingPrice} 
                  onChange={e => setIncludeSellingPrice(e.target.checked)} 
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <span className="text-[11px] text-neutral-600 font-sans">Print HSN Code & GST Bracket</span>
                <input 
                  type="checkbox" 
                  checked={includeGstAndHsn} 
                  onChange={e => setIncludeGstAndHsn(e.target.checked)} 
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <span className="text-[11px] text-neutral-600 font-sans">Print Trademark / Brand Owner</span>
                <input 
                  type="checkbox" 
                  checked={includeBrand} 
                  onChange={e => setIncludeBrand(e.target.checked)} 
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>

            </div>
          </div>

          {/* Scanner emulator */}
          <div className="bg-[#1e293b] text-neutral-300 p-5 rounded-xl space-y-4 shadow-md">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block pb-1 border-b border-slate-700">Hardware Scanning Emulator</span>
            
            <form onSubmit={handleScannerSearch} className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Scan / Input SKU or Barcode..."
                value={barcodeScannerInput}
                onChange={e => setBarcodeScannerInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 text-xs font-mono">Look</button>
            </form>

            {scanError && (
              <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 border border-rose-900 rounded">
                <AlertCircle size={14} className="shrink-0" />
                <span>SKU/Barcode matches zero database records.</span>
              </div>
            )}

            {scannedProduct && (
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2.5 text-xs animate-in fade-in duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-indigo-500/15 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase font-mono">Found SKU</span>
                    <h4 className="font-bold text-white text-xs mt-1 leading-tight">{scannedProduct.name}</h4>
                  </div>
                  <button onClick={() => setScannedProduct(null)} className="text-[10px] text-slate-500 hover:text-slate-350">Clear</button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-800 pt-2">
                  <div>
                    <span className="text-slate-500 block">TARIFF REF</span>
                    <strong className="text-slate-300">HSN {scannedProduct.hsnCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST / CESS</span>
                    <strong className="text-slate-300">{scannedProduct.gstRate}% GST</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SELLING RATE</span>
                    <strong className="text-emerald-400">₹{scannedProduct.sellingPrice}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LEDGER STOCK</span>
                    <strong className="text-indigo-400">{scannedProduct.currentStock} Units</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* PRINT/TEMPLATE RENDER AREA */}
        <div className="lg:col-span-8 bg-neutral-50 p-6 rounded-xl border border-neutral-200 shadow-inner flex flex-col justify-start print:bg-white print:p-0 print:border-none print:shadow-none">
          
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-2.5 border-b mb-5 print:hidden">Live Label Spool Sheet</span>

          {selectedProduct ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono select-none print:gap-1.5 print:grid-cols-4">
              {Array.from({ length: labelQuantity }).map((_, index) => {
                const bVal = generateMockBarcode(selectedProduct.sku);
                return (
                  <div key={index} className="bg-white border-2 border-dashed border-neutral-300 p-2.5 rounded-lg flex flex-col items-center justify-between text-center space-y-1.5 shadow-sm print:shadow-none print:border-neutral-500 print:rounded-none">
                    
                    {includeBrand && selectedProduct.brand && (
                      <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wide line-clamp-1">{selectedProduct.brand}</span>
                    )}

                    <span className="text-[11px] font-sans font-extrabold text-neutral-850 line-clamp-1 leading-tight">{selectedProduct.name}</span>
                    <span className="text-[10px] font-bold text-indigo-700">{selectedProduct.sku}</span>

                    {/* FAKE VECTOR BARCODE BARS */}
                    <div className="w-full flex-col flex items-center bg-white px-2 py-1 select-none pointer-events-none">
                      <div className="flex h-7 items-stretch w-full justify-center space-x-[1px] bg-white">
                        {Array.from({ length: 48 }).map((_, bIdx) => {
                          const isStroke = (bIdx * 17) % 7 > 2;
                          return (
                            <div 
                              key={bIdx} 
                              className={`w-[2px] h-full ${isStroke ? 'bg-black' : 'bg-transparent'}`} 
                            />
                          );
                        })}
                      </div>
                      <span className="text-[9px] font-mono tracking-[1.5px] text-neutral-700 mt-1 font-bold">{bVal}</span>
                    </div>

                    {/* METRIC TAGS */}
                    <div className="w-full grid grid-cols-2 border-t pt-1.5 text-[9px] gap-1.5 leading-none">
                      {includeSellingPrice && (
                        <div className="text-center col-span-2 pb-0.5">
                          <span className="text-[8px] text-neutral-400 block uppercase font-medium">Retail MRP Inclusive of All Taxes:</span>
                          <strong className="text-xs text-neutral-800 font-extrabold font-sans">₹{(selectedProduct.mrp || selectedProduct.sellingPrice * 1.18).toFixed(2)}</strong>
                        </div>
                      )}
                      
                      {includeGstAndHsn && (
                        <>
                          <div className="text-left font-bold text-neutral-600 block">HSN: {selectedProduct.hsnCode}</div>
                          <div className="text-right font-bold text-neutral-600 block">{selectedProduct.gstRate}% GST</div>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 text-neutral-400 text-xs">
              Select or register a product from your inventory matrix to access labels sheet.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
