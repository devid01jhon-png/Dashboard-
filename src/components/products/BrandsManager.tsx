/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Ribbon, Trash2, Globe } from 'lucide-react';
import { PimBrand, PimProduct } from './pimTypes';

interface BrandsManagerProps {
  brands: PimBrand[];
  onAddBrand: (brand: Omit<PimBrand, 'id'>) => void;
  onDeleteBrand: (id: string) => void;
  products: PimProduct[];
}

export default function BrandsManager({
  brands,
  onAddBrand,
  onDeleteBrand,
  products
}: BrandsManagerProps) {
  const [showBrandForm, setShowBrandForm] = useState(false);
  
  // Brand States
  const [brandName, setBrandName] = useState('');
  const [brandMfg, setBrandMfg] = useState('');
  const [brandCountry, setBrandCountry] = useState('India');
  const [brandDesc, setBrandDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName) return;
    onAddBrand({
      name: brandName,
      logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100&q=80',
      manufacturer: brandMfg,
      country: brandCountry,
      description: brandDesc
    });
    setBrandName('');
    setBrandMfg('');
    setBrandCountry('India');
    setBrandDesc('');
    setShowBrandForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Brands Catalogue</h2>
          <p className="text-xs text-neutral-500 font-mono">Verify and bind product manufacturers, brand trademarks, and authorized distributors.</p>
        </div>
        <button 
          onClick={() => setShowBrandForm(!showBrandForm)}
          className="flex items-center space-x-1.5 h-9 bg-neutral-900 text-white text-xs font-semibold px-4 rounded-lg hover:bg-neutral-800 transition shadow"
        >
          <Plus size={15} />
          <span>Onboard New Brand</span>
        </button>
      </div>

      {showBrandForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-neutral-300 shadow-sm space-y-4 animate-in slide-in-from-top-3 duration-150">
          <div className="border-b pb-2">
            <span className="text-xs font-bold text-neutral-800 font-mono block">Brand Registry File Entry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold block">BRAND NAME *</span>
              <input 
                type="text" 
                required 
                placeholder="e.g. Tata Chem, Apple, OnePlus"
                value={brandName} 
                onChange={e => setBrandName(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold block">PARENT MANUFACTURER</span>
              <input 
                type="text" 
                placeholder="e.g. Tata Consumer Products Ltd"
                value={brandMfg} 
                onChange={e => setBrandMfg(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold block">COUNTRY OF ORIGIN</span>
              <input 
                type="text" 
                placeholder="India"
                value={brandCountry} 
                onChange={e => setBrandCountry(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans" 
              />
            </div>
            <div className="space-y-1 md:col-span-3">
              <span className="text-[10px] text-neutral-500 font-bold block">BRAND INTRODUCTORY LINE</span>
              <input 
                type="text" 
                placeholder="Leading manufacturer with focus on organic ingredients and materials..."
                value={brandDesc} 
                onChange={e => setBrandDesc(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans" 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowBrandForm(false)} className="text-xs text-neutral-400 font-mono hover:text-neutral-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 font-bold text-xs hover:bg-indigo-700 text-white rounded font-mono shadow">Onboard Brand</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100 uppercase text-[9px] font-bold">
              <th className="py-3 px-4">Brand / Mark</th>
              <th className="py-3 px-2">Manufacturer</th>
              <th className="py-3 px-2">Country of Origin</th>
              <th className="py-3 px-2 text-center">Catalogue SKUs</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {brands.map(brand => {
              const brandSkus = products.filter(p => p.brand === brand.name).length;
              return (
                <tr key={brand.id} className="hover:bg-neutral-50">
                  <td className="py-4 px-4 font-sans">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-neutral-100 rounded-full flex items-center justify-center border text-indigo-700 text-xs font-mono font-bold uppercase select-none">
                        {brand.name.slice(0, 2)}
                      </div>
                      <div>
                        <strong className="block text-neutral-850 font-bold text-sm tracking-tight">{brand.name}</strong>
                        {brand.description && <span className="text-[10px] text-neutral-400 block max-w-sm font-mono leading-tight">{brand.description}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-neutral-700">{brand.manufacturer || 'Direct Tradename'}</td>
                  <td className="py-4 px-2 text-neutral-700">
                    <div className="flex items-center space-x-1">
                      <Globe size={12} className="text-neutral-400" />
                      <span>{brand.country || 'India'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center">
                    <span className="px-2 py-0.5 bg-neutral-100 border text-neutral-700 rounded-full font-bold font-mono">
                      {brandSkus} items
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => onDeleteBrand(brand.id)}
                      className="text-rose-500 hover:text-rose-700 font-bold pl-2 cursor-pointer"
                      disabled={brandSkus > 0}
                      title={brandSkus > 0 ? "Cannot delete brand with active SKUs" : "Delete Brand"}
                    >
                      <Trash2 size={14} className={brandSkus > 0 ? "opacity-30 cursor-not-allowed" : ""} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {brands.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-neutral-400 bg-neutral-50 font-sans text-xs">
                  No brands on-boarded under current legal directory yet. Use the action panel above to register them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
