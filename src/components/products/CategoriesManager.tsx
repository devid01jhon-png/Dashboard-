/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, FolderKanban, Trash2, Edit2, Tag } from 'lucide-react';
import { PimCategory, PimSubCategory, PimProduct } from './pimTypes';

interface CategoryManagerProps {
  categories: PimCategory[];
  subCategories: PimSubCategory[];
  onAddCategory: (cat: Omit<PimCategory, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubCategory: (subCat: Omit<PimSubCategory, 'id'>) => void;
  onDeleteSubCategory: (id: string) => void;
  products: PimProduct[];
}

export default function CategoriesManager({
  categories,
  subCategories,
  onAddCategory,
  onDeleteCategory,
  onAddSubCategory,
  onDeleteSubCategory,
  products
}: CategoryManagerProps) {
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSubForm, setShowSubForm] = useState(false);

  // Category Form State
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catHsn, setCatHsn] = useState('');

  // SubCategory Form State
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subParentId, setSubParentId] = useState('');

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catCode) return;
    onAddCategory({
      name: catName,
      code: catCode.toUpperCase(),
      description: catDesc,
      hsnDefault: catHsn
    });
    setCatName('');
    setCatCode('');
    setCatDesc('');
    setCatHsn('');
    setShowCatForm(false);
  };

  const handleSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subParentId) return;
    onAddSubCategory({
      categoryId: subParentId,
      name: subName,
      description: subDesc
    });
    setSubName('');
    setSubDesc('');
    setSubParentId('');
    setShowSubForm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Category & Sub Category Classifications</h2>
        <p className="text-xs text-neutral-500 font-mono">Taxonomic segregation hierarchy mapping directly to Indian HSN GST codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PRIMARY CATEGORIES */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center space-x-2">
              <FolderKanban size={16} className="text-indigo-600" />
              <span>Primary Business Verticals</span>
            </h3>
            <button 
              onClick={() => { setShowCatForm(!showCatForm); setShowSubForm(false); }}
              className="flex items-center space-x-1 py-1 px-2.5 bg-neutral-900 text-white text-[11px] font-bold rounded-lg hover:bg-neutral-800 transition"
            >
              <Plus size={12} />
              <span>New Category</span>
            </button>
          </div>

          {showCatForm && (
            <form onSubmit={handleCatSubmit} className="p-4 bg-neutral-50 rounded-lg border border-neutral-220 space-y-3 animate-in slide-in-from-top-2 duration-150">
              <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block pb-1 border-b">Add Corporate Classification Code</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">CATEGORY NAME *</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Garments & Apparel"
                    value={catName} 
                    onChange={e => setCatName(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">SYSTEM CODE *</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. SEC-GAR"
                    value={catCode} 
                    onChange={e => setCatCode(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">DEFAULT HSN (6 or 8 digits)</span>
                  <input 
                    type="text" 
                    placeholder="e.g. 62052000"
                    maxLength={8}
                    value={catHsn} 
                    onChange={e => setCatHsn(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500 font-mono" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">SHORT DESCRIPTION</span>
                  <input 
                    type="text" 
                    placeholder="e.g. Woven fabrics and tailored apparel"
                    value={catDesc} 
                    onChange={e => setCatDesc(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowCatForm(false)} className="text-[11px] text-neutral-500 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded font-bold font-mono">Cancel</button>
                <button type="submit" className="text-[11px] text-white px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded font-bold font-mono shadow">Save Category</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100 uppercase text-[9px] font-bold">
                  <th className="py-2.5 px-2">Classification Code / Vertical</th>
                  <th className="py-2.5 px-2">Default HSN</th>
                  <th className="py-2.5 px-2 text-center">SKUs active</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {categories.map(cat => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  return (
                    <tr key={cat.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-2 font-sans">
                        <strong className="block text-neutral-800 font-bold">{cat.name}</strong>
                        <span className="text-[9px] font-mono text-neutral-400 bg-neutral-100 px-1 py-0.2 rounded uppercase mr-1">{cat.code}</span>
                        {cat.description && <span className="text-[10px] text-neutral-400 truncate max-w-xs">{cat.description}</span>}
                      </td>
                      <td className="py-3 px-2 text-neutral-700 font-bold">{cat.hsnDefault || 'Not Set'}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold">{productCount}</span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => onDeleteCategory(cat.id)}
                          className="text-rose-500 hover:text-rose-700 font-bold pl-2 cursor-pointer"
                          disabled={productCount > 0}
                          title={productCount > 0 ? "Cannot delete category containing active products" : "Delete category"}
                        >
                          <Trash2 size={13} className={productCount > 0 ? "opacity-30 cursor-not-allowed" : ""} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUB CATEGORIES DIRECTORY */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-neutral-800 text-sm flex items-center space-x-2">
              <Tag size={16} className="text-amber-500" />
              <span>Sub-Segments Classifications</span>
            </h3>
            <button 
              onClick={() => { setShowSubForm(!showSubForm); setShowCatForm(false); }}
              className="flex items-center space-x-1 py-1 px-2.5 bg-neutral-900 text-white text-[11px] font-bold rounded-lg hover:bg-neutral-800 transition"
              disabled={categories.length === 0}
            >
              <Plus size={12} />
              <span>New Sub Category</span>
            </button>
          </div>

          {showSubForm && (
            <form onSubmit={handleSubSubmit} className="p-4 bg-neutral-50 rounded-lg border border-neutral-220 space-y-3 animate-in slide-in-from-top-2 duration-150">
              <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block pb-1 border-b">Add Taxonomy Subordinate</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">SUB CATEGORY NAME *</span>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Men's Cotton Shirts"
                    value={subName} 
                    onChange={e => setSubName(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold block">PARENT CATEGORY *</span>
                  <select 
                    required
                    value={subParentId} 
                    onChange={e => setSubParentId(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] text-neutral-500 font-bold block">DESCRIPTION</span>
                  <input 
                    type="text" 
                    placeholder="Warp-knit, organic bio-washed cotton wear"
                    value={subDesc} 
                    onChange={e => setSubDesc(e.target.value)}
                    className="w-full bg-white p-2 border rounded text-neutral-800 outline-none focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowSubForm(false)} className="text-[11px] text-neutral-500 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded font-bold font-mono">Cancel</button>
                <button type="submit" className="text-[11px] text-white px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded font-bold font-mono shadow">Save Sub-segment</button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100 uppercase text-[9px] font-bold">
                  <th className="py-2.5 px-2">Sub Category Segment</th>
                  <th className="py-2.5 px-2">Parent Vertical</th>
                  <th className="py-2.5 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {subCategories.map(sub => {
                  const parent = categories.find(c => c.id === sub.categoryId);
                  return (
                    <tr key={sub.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-2 font-sans">
                        <strong className="block text-neutral-850 font-bold text-xs">{sub.name}</strong>
                        {sub.description && <span className="text-[10px] text-neutral-400 font-mono italic block">{sub.description}</span>}
                      </td>
                      <td className="py-3 px-2 text-neutral-600">
                        <span className="bg-neutral-100 font-mono px-2 py-0.5 rounded text-[10px]">
                          {parent ? parent.name : 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => onDeleteSubCategory(sub.id)}
                          className="text-rose-500 hover:text-rose-700 pl-2 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {subCategories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-neutral-400 bg-neutral-50 text-xs rounded-lg">
                      No sub-categories defined yet. Add subordinate segments above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
