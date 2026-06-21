/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Barcode, 
  QrCode, 
  Camera, 
  Check, 
  Settings2, 
  TrendingUp, 
  Plus, 
  Search,
  ScanLine,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  ClipboardCheck,
  Printer
} from 'lucide-react';
import { Product } from '../../types';
import { WmsInventoryAudit, WmsInventoryAuditItem } from './wmsTypes';

interface StockAuditAndScannerProps {
  products: Product[];
  audits: WmsInventoryAudit[];
  onCommitAudit: (audit: WmsInventoryAudit) => void;
}

export default function StockAuditAndScanner({
  products,
  audits,
  onCommitAudit
}: StockAuditAndScannerProps) {
  // Tabs: Scanner vs Audit Session
  const [activeTab, setActiveTab] = useState<'scanner' | 'audit'>('scanner');

  // Scanner Simulator States
  const [scanQuery, setScanQuery] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Audit Session States
  const [newAuditNotes, setNewAuditNotes] = useState('Quarterly compliance stock check');
  const [auditItemsList, setAuditItemsList] = useState<WmsInventoryAuditItem[]>([
    { id: 'aud-t-1', productId: 'prod-1', productName: 'HDMI Cable 10M', sku: 'EL-HDMI-10M', locationLabel: '01-R1-S1-B1', systemQuantity: 120, physicalQuantity: 120, discrepancyQuantity: 0, adjustmentStatus: 'No Action' },
    { id: 'aud-t-2', productId: 'prod-2', productName: 'Kraft Box 12x12', sku: 'PK-BOX-12X12', locationLabel: '02-R1-S1-B1', systemQuantity: 940, physicalQuantity: 938, discrepancyQuantity: -2, adjustmentStatus: 'Pending Adjustment' }
  ]);

  // Handle Scanner Simulation
  const handleInitiateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanQuery) return;
    
    setIsScanning(true);
    setMatchedProduct(null);
    setFeedbackMsg('');

    setTimeout(() => {
      setIsScanning(false);
      const queryStr = scanQuery.toUpperCase();
      const match = products.find(p => p.sku === queryStr || p.hsnCode === queryStr || p.id === queryStr);

      if (match) {
        setMatchedProduct(match);
        setFeedbackMsg(`✓ SUCCESS: Decoded standard 128 barcode match for ${match.sku}`);
      } else {
        // Find by name slice keyword
        const softMatch = products.find(p => p.name.toLowerCase().includes(queryStr.toLowerCase()));
        if (softMatch) {
          setMatchedProduct(softMatch);
          setFeedbackMsg(`✓ SUCCESS: Soft match resolved for key SKU ${softMatch.sku}`);
        } else {
          setFeedbackMsg('✗ DECODE FAILED: GS1 symbology not resolved in active database registers.');
        }
      }
    }, 850);
  };

  // Quick select scan
  const triggerFastScanMatch = (p: Product) => {
    setScanQuery(p.sku);
    setIsScanning(true);
    setMatchedProduct(null);
    setTimeout(() => {
      setIsScanning(false);
      setMatchedProduct(p);
      setFeedbackMsg(`✓ SUCCESS: Instant RFID/Barcode latch for SKU ${p.sku}`);
    }, 400);
  };

  // Adjust physical count inside audit
  const handlePhysicalCountChange = (id: string, count: number) => {
    setAuditItemsList(prev => prev.map(item => {
      if (item.id === id) {
        const discrep = count - item.systemQuantity;
        return {
          ...item,
          physicalQuantity: count,
          discrepancyQuantity: discrep,
          adjustmentStatus: discrep === 0 ? 'No Action' : 'Pending Adjustment'
        };
      }
      return item;
    }));
  };

  // Commit complete audit cycle
  const handleSubmitAuditSession = () => {
    const discrepancies = auditItemsList.filter(item => item.discrepancyQuantity !== 0).length;
    const newAuditDoc: WmsInventoryAudit = {
      id: `AUD-Q1-${Math.floor(100 + Math.random() * 900)}`,
      auditDate: new Date().toISOString(),
      warehouseId: 'wh-1',
      warehouseName: 'BOM-MAIN-01',
      auditorName: 'Aniket Shinde (Auditor)',
      status: 'Completed',
      totalSkusAudited: auditItemsList.length,
      discrepanciesFound: discrepancies,
      notes: newAuditNotes,
      items: auditItemsList
    };

    onCommitAudit(newAuditDoc as any);
    alert(`Statutory Auditor report signed! Document Ref: ${newAuditDoc.id}\nAdjustments posted to supervisor stack.`);
    
    // Reset audit session container
    setAuditItemsList([
      { id: 'aud-t-3', productId: 'prod-3', productName: 'Nylon Cable Ties', sku: 'PL-CAB-TIE-500', locationLabel: '03-R1-S1-B1', systemQuantity: 45, physicalQuantity: 45, discrepancyQuantity: 0, adjustmentStatus: 'No Action' }
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* TABS DECK */}
      <div className="flex bg-neutral-150 p-1 rounded-xl text-xs font-mono font-bold select-none max-w-sm">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${activeTab === 'scanner' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          🔍 BARCODE SCANNER
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-1.5 rounded-lg text-center transition ${activeTab === 'audit' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
        >
          📋 STOCKS AUDITING
        </button>
      </div>

      {/* VIEW PANEL FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* VIEW COLUMN 1: INTERACTIVE PANEL */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
          
          {/* A. BARCODE SCANNER SIMULATION */}
          {activeTab === 'scanner' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-800">Laser-Decoder Symbology Terminal</h4>
                <p className="text-[11px] text-neutral-400">Scan packaging labels to lookup bin locations, tax codes, and batch parameters.</p>
              </div>

              {/* Glowing Simulator frame */}
              <div className="border border-neutral-350 bg-neutral-950 p-6 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center space-y-4 min-h-[220px]">
                {/* Scan HUD graphics */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.92),_rgba(10,13,20,0.98))]" />
                
                {/* Horizontal scanner red beam animation */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-1.5 bg-rose-500/80 shadow-[0_0_15px_#f43f5e] animate-bounce top-1/2 z-20" />
                )}

                <div className="relative text-center space-y-2 z-10 w-full max-w-md">
                  <ScanLine size={32} className={`mx-auto ${isScanning ? 'text-rose-500' : 'text-neutral-450 animate-pulse'}`} />
                  <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 block">WMS Laser Latching Hub</span>
                  
                  {/* Mock Camera aperture feed */}
                  <div className="h-2 rounded bg-neutral-900 border border-neutral-800 w-full overflow-hidden">
                    <div className={`h-full bg-emerald-500/80 w-1/3 transition-all ${isScanning ? 'w-full duration-1000' : ''}`} />
                  </div>

                  <form onSubmit={handleInitiateScan} className="flex space-x-2 pt-2 select-none">
                    <input
                      type="text"
                      placeholder="Input Barcode/SKU code..."
                      value={scanQuery}
                      onChange={(e) => setScanQuery(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-emerald-450 font-mono outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isScanning}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] font-bold uppercase rounded"
                    >
                      {isScanning ? 'DECODING...' : 'AIM DISPATCH'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Decode responses */}
              {feedbackMsg && (
                <div className={`p-3 rounded-lg border text-xs font-mono font-bold uppercase tracking-wide leading-relaxed p-3.5 ${
                  feedbackMsg.startsWith('✓') 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {feedbackMsg}
                </div>
              )}

              {/* Matched product layout parameter sheets */}
              {matchedProduct && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3 animate-in fade-in duration-200 text-xs">
                  <div className="flex justify-between items-start border-b border-neutral-200 pb-2">
                    <div>
                      <span className="font-mono text-neutral-400 block pb-0.5">Resolved catalog code:</span>
                      <strong className="text-sm font-black font-mono text-neutral-850 uppercase">{matchedProduct.sku}</strong>
                    </div>
                    <span className="bg-neutral-900 text-white rounded font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide">Category: {matchedProduct.category}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-snug">
                    <div>
                      <span className="text-neutral-405 font-mono block">Product Material:</span>
                      <span className="text-neutral-900 font-semibold">{matchedProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-405 font-mono block">Accounting Coordinates (HSN/GST):</span>
                      <strong className="font-mono">HSN: {matchedProduct.hsnCode} • GST: {matchedProduct.gstRate}%</strong>
                    </div>
                    <div>
                      <span className="text-neutral-420 font-mono block">Physically Stacked Stock:</span>
                      <strong className="text-neutral-800 text-sm font-mono">{matchedProduct.currentStock.toLocaleString()} Units</strong>
                    </div>
                    <div>
                      <span className="text-neutral-420 font-mono block">Weighted Standard Cost:</span>
                      <span className="font-mono text-indigo-700 font-bold">₹{matchedProduct.purchasePrice.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
                    </div>
                  </div>
                  
                  {/* Simulated Action shortcuts */}
                  <div className="pt-2 border-t flex space-x-2 font-mono text-[10px]">
                    <button onClick={() => alert(`Spooling thermal label sticker for ${matchedProduct.sku}`)} className="flex items-center space-x-1 border px-2.5 py-1 rounded bg-white hover:bg-neutral-100">
                      <Barcode size={12} />
                      <span>Print sticker</span>
                    </button>
                    <button onClick={() => triggerFastScanMatch(matchedProduct)} className="flex items-center space-x-1 border px-2.5 py-1 rounded bg-white hover:bg-neutral-100">
                      <QrCode size={12} />
                      <span>Re-read RFID</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Shortcuts trigger feed */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider font-mono block">Shortcuts: Quick Scan Catalog Items</span>
                <div className="flex flex-wrap gap-1.5 select-none font-mono text-[10px]">
                  {products.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => triggerFastScanMatch(p)}
                      className="bg-neutral-50 hover:bg-neutral-150 border px-3 py-1 rounded-lg text-neutral-750 font-bold"
                    >
                      ⚡ {p.sku}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* B. STOCKS AUDITING MODULE */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-neutral-800">Physical Stock Count Audit Controller</h4>
                <p className="text-[11px] text-neutral-400">Authorize verification sequences on local shelves to maintain correct book registries.</p>
              </div>

              <div className="space-y-2.5 font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Audit Sheet Remarks / Title</span>
                  <input
                    type="text"
                    value={newAuditNotes}
                    onChange={(e) => setNewAuditNotes(e.target.value)}
                    className="w-full bg-neutral-50 border p-2 rounded-xl text-xs font-sans text-neutral-850"
                  />
                </div>

                <div className="bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-150 flex items-center justify-between text-[11px] text-neutral-600 font-sans leading-normal">
                  <span>ℹ️ Audit utilizes system figures snapshot. Direct write-down adjustments will automatically generate upon closing.</span>
                </div>
              </div>

              {/* Items grid for audit verification */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-black uppercase text-neutral-450 tracking-wider font-mono block">Auditing items list</span>
                
                <div className="space-y-2.5">
                  {auditItemsList.map(item => {
                    const isMismatch = item.discrepancyQuantity !== 0;

                    return (
                      <div key={item.id} className="p-3.5 border rounded-xl bg-white text-xs space-y-2">
                        <div className="flex justify-between items-center font-mono">
                          <div>
                            <strong className="text-neutral-800 text-sm">{item.sku}</strong>
                            <span className="text-[10px] text-neutral-400 block">Bin Spot: {item.locationLabel}</span>
                          </div>
                          {isMismatch && (
                            <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                              DISCREPANCY: {item.discrepancyQuantity > 0 ? `+${item.discrepancyQuantity}` : item.discrepancyQuantity}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1 border-t border-dashed">
                          <div>
                            <span className="text-neutral-500 block">Material: {item.productName}</span>
                          </div>

                          <div className="flex items-center space-x-4 font-mono select-none">
                            <div>
                              <span className="text-neutral-400">System Qty:</span>
                              <strong className="ml-1 text-neutral-800">{item.systemQuantity} U</strong>
                            </div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-neutral-400">Counted:</span>
                              <input
                                type="number"
                                value={item.physicalQuantity}
                                onChange={(e) => handlePhysicalCountChange(item.id, parseInt(e.target.value) || 0)}
                                className="w-16 bg-neutral-50 border text-center font-bold text-indigo-700 rounded p-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmitAuditSession}
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition pt-2.5"
              >
                Sign & Close Audit Verification Session
              </button>
            </div>
          )}

        </div>

        {/* VIEW COLUMN 2: SUMMARY SIDEBAR LIST */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-800 font-mono flex items-center space-x-2">
              <ClipboardCheck size={14} className="text-indigo-600" />
              <span>Audit History Log</span>
            </h5>
            <span className="text-[9px] font-mono text-neutral-400">Closed: {audits.length}</span>
          </div>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
            {audits.map(aud => (
              <div key={aud.id} className="p-3 bg-neutral-50 rounded-xl border space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center border-b pb-1 font-mono text-[10px]">
                  <span className="font-bold text-neutral-850">{aud.id}</span>
                  <span className="text-neutral-400">{new Date(aud.auditDate).toLocaleDateString()}</span>
                </div>
                <div className="leading-snug">
                  <span className="text-[10px] font-mono text-neutral-400 block font-bold leading-none">Auditor Profile</span>
                  <span className="font-bold text-neutral-850 block">{aud.auditorName}</span>
                </div>
                <div className="flex justify-between font-mono text-[10px] text-neutral-500 pt-1">
                  <span>Counted: <strong>{aud.totalSkusAudited} SKUs</strong></span>
                  <span className={aud.discrepanciesFound > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    Diffs: {aud.discrepanciesFound} SKUs
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
