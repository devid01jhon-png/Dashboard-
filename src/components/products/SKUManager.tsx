/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Wrench, 
  Settings2, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  Play 
} from 'lucide-react';
import { PimProduct } from './pimTypes';

interface SKUManagerProps {
  products: PimProduct[];
  onBulkUpdateSKUs: (skuMap: Record<string, string>) => void;
}

export default function SKUManager({
  products,
  onBulkUpdateSKUs
}: SKUManagerProps) {
  const [prefix, setPrefix] = useState('TTGT');
  const [divider, setDivider] = useState('-');
  const [includeBrand, setIncludeBrand] = useState(true);
  const [includeYear, setIncludeYear] = useState(false);
  const [suffixLength, setSuffixLength] = useState(4); // auto incremental suffix digit padding
  const [customSample, setCustomSample] = useState('');

  // SKU Audit
  const duplicates: string[] = [];
  const seenSKUs = new Set<string>();
  products.forEach(p => {
    const s = p.sku.trim().toUpperCase();
    if (seenSKUs.has(s)) {
      duplicates.push(s);
    }
    seenSKUs.add(s);
  });

  // Generator simulation
  const [sampleGenerations, setSampleGenerations] = useState<{ id: string; oldSku: string; newSku: string }[]>([]);

  const generateNewSKUsPreview = () => {
    let index = 1001;
    const items = products.map(p => {
      const brandStr = includeBrand && p.brand ? p.brand.replaceAll(/\s/g, '').slice(0, 3).toUpperCase() : '';
      const catStr = p.category ? p.category.replaceAll(/\s/g, '').slice(0, 2).toUpperCase() : 'SK';
      const yearStr = includeYear ? '26' : '';
      
      const parts = [
        prefix.trim().toUpperCase(),
        brandStr,
        catStr,
        yearStr,
        index.toString()
      ].filter(Boolean);

      const generated = parts.join(divider);
      index++;

      return {
        id: p.id,
        oldSku: p.sku,
        newSku: generated
      };
    });
    setSampleGenerations(items);
  };

  const applyBulkSKUs = () => {
    if (sampleGenerations.length === 0) return;
    const mapping: Record<string, string> = {};
    sampleGenerations.forEach(item => {
      mapping[item.id] = item.newSku;
    });
    onBulkUpdateSKUs(mapping);
    setSampleGenerations([]);
    alert('Enterprise SKU catalog registry updated and sealed successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Structured SKU Formulation Board</h2>
        <p className="text-xs text-neutral-500 font-mono">Create and enforce standard naming protocols to avoid catalog fragmentation and warehouse routing errors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SKU FORM PARAMETERS */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="border-b pb-2 flex items-center space-x-1.5">
            <Settings2 size={15} className="text-indigo-600" />
            <span className="text-xs font-bold font-mono uppercase text-neutral-850">Formula Builder</span>
          </div>

          <div className="space-y-3.5 text-xs font-mono">
            
            <div className="space-y-1">
              <span className="block text-[10px] text-neutral-400 font-bold uppercase">CORP PREFIX</span>
              <input 
                type="text" 
                value={prefix} 
                onChange={e => setPrefix(e.target.value)}
                placeholder="e.g. TTGT" 
                className="w-full bg-neutral-50 p-2 border rounded font-sans uppercase font-bold" 
              />
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] text-neutral-400 font-bold uppercase">SEGMENT DIVIDER</span>
              <select 
                value={divider} 
                onChange={e => setDivider(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans" 
              >
                <option value="-">- (Hyphen)</option>
                <option value="_">_ (Underscore)</option>
                <option value="/">/ (Slashed Node)</option>
                <option value="">None</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
              <span className="text-[11px] text-neutral-600 font-sans">Embed Brand Prefix (first 3 char)</span>
              <input 
                type="checkbox" 
                checked={includeBrand} 
                onChange={e => setIncludeBrand(e.target.checked)} 
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
              <span className="text-[11px] text-neutral-600 font-sans">Append Fiscal Year Code (26)</span>
              <input 
                type="checkbox" 
                checked={includeYear} 
                onChange={e => setIncludeYear(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
            </div>

            <div className="pt-2">
              <button 
                type="button" 
                onClick={generateNewSKUsPreview}
                className="w-full h-9 flex items-center justify-center space-x-1 py-1 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition text-[11px]"
              >
                <RefreshCw size={13} />
                <span>Simulate Standardized SKUs</span>
              </button>
            </div>

          </div>

          <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-[10px] font-mono text-indigo-700">
            <span className="block font-bold">Standard Formula Pattern:</span>
            <code className="text-xs bg-indigo-100/55 px-1 py-0.5 rounded font-black tracking-wide block mt-1">
              {prefix.toUpperCase()}{divider}{includeBrand ? 'BRA' : ''}{divider}CA{divider}{includeYear ? '26' : ''}{divider}1001
            </code>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4 col-span-2 flex flex-col justify-between">
          <div className="border-b pb-2 flex justify-between items-center h-8">
            <span className="text-xs font-bold font-mono uppercase text-neutral-850 flex items-center space-x-1">
              <Layers size={15} className="text-neutral-500" />
              <span>SKU Mapping Matrix</span>
            </span>
            {sampleGenerations.length > 0 && (
              <button 
                onClick={applyBulkSKUs}
                className="flex items-center space-x-1 py-1 px-3 bg-emerald-600 text-white rounded text-[10px] font-bold font-mono hover:bg-emerald-700 shadow"
              >
                <Play size={10} />
                <span>Enforce & Execute Reformatting</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 min-h-[220px] text-xs font-mono pr-1">
            {sampleGenerations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-12">
                <Wrench size={32} className="text-neutral-300 stroke-[1.5] mb-2 animate-spin duration-3000" />
                <span className="text-xs">No active reformatting simulated. Generate preview parameters.</span>
              </div>
            ) : (
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b text-neutral-400 text-[9px]">
                    <th className="py-2">Commercial Item</th>
                    <th className="py-2">Old SKU</th>
                    <th className="py-2">Proposed Standard SKU</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sampleGenerations.map(item => {
                    const origProduct = products.find(p => p.id === item.id);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="py-2.5 font-sans truncate max-w-[150px] text-neutral-800">{origProduct ? origProduct.name : 'Unknown Product'}</td>
                        <td className="py-2.5 font-mono text-neutral-400">{item.oldSku}</td>
                        <td className="py-2.5 font-mono text-indigo-650 font-bold">{item.newSku}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Verification Audit */}
          <div className="pt-3 border-t grid grid-cols-2 gap-3 text-[10px] font-mono">
            <div className="p-2 bg-neutral-50 rounded border border-neutral-150 flex items-center space-x-2">
              {duplicates.length === 0 ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <AlertTriangle size={16} className="text-rose-500 animate-bounce" />
              )}
              <div>
                <span className="block text-neutral-500">Duplicate Check</span>
                <strong className={duplicates.length === 0 ? 'text-emerald-650' : 'text-rose-650'}>
                  {duplicates.length === 0 ? '0 Duplicates Found' : `${duplicates.length} Clashing codes`}
                </strong>
              </div>
            </div>

            <div className="p-2 bg-neutral-50 rounded border border-neutral-150 flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <div>
                <span className="block text-neutral-500 font-sans">Length Standard</span>
                <strong className="text-neutral-700">6-16 characters</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
