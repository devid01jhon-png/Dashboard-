/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Sliders, Trash2, Tag, Check } from 'lucide-react';
import { PimAttribute } from './pimTypes';

interface AttributesManagerProps {
  attributes: PimAttribute[];
  onAddAttribute: (attr: Omit<PimAttribute, 'id'>) => void;
  onDeleteAttribute: (id: string) => void;
  onAddValueToAttribute: (id: string, value: string) => void;
}

export default function AttributesManager({
  attributes,
  onAddAttribute,
  onDeleteAttribute,
  onAddValueToAttribute
}: AttributesManagerProps) {
  const [showAttrForm, setShowAttrForm] = useState(false);
  const [attrName, setAttrName] = useState('');
  const [initialValue, setInitialValue] = useState('');
  const [newValueMap, setNewValueMap] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attrName) return;
    const vals = initialValue ? initialValue.split(',').map(s => s.trim()).filter(Boolean) : [];
    onAddAttribute({
      name: attrName.charAt(0).toUpperCase() + attrName.slice(1),
      values: vals
    });
    setAttrName('');
    setInitialValue('');
    setShowAttrForm(false);
  };

  const handleAddValue = (id: string) => {
    const val = newValueMap[id];
    if (!val || !val.trim()) return;
    onAddValueToAttribute(id, val.trim());
    setNewValueMap(prev => ({ ...prev, [id]: '' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">System Global Attributes</h2>
          <p className="text-xs text-neutral-500 font-mono">Create dimensions for color, size, storage parameters to fuel multi-variant inventory.</p>
        </div>
        <button 
          onClick={() => setShowAttrForm(!showAttrForm)}
          className="flex items-center space-x-1.5 h-9 bg-neutral-900 text-white text-xs font-semibold px-4 rounded-lg hover:bg-neutral-800 transition shadow"
        >
          <Plus size={15} />
          <span>New Attribute Dimension</span>
        </button>
      </div>

      {showAttrForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-neutral-300 shadow-sm space-y-4 animate-in slide-in-from-top-3 duration-150">
          <div className="border-b pb-2">
            <span className="text-xs font-bold text-neutral-800 font-mono block">Declare Dynamic Material Property</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold block">PROPERTY NAME *</span>
              <input 
                type="text" 
                required 
                placeholder="e.g. RAM, Storage, Flavor, Material"
                value={attrName} 
                onChange={e => setAttrName(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans focus:border-indigo-500 outline-none" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 font-bold block">INITIAL VALUES (Comma Separated)</span>
              <input 
                type="text" 
                placeholder="e.g. 8GB, 16GB, 32GB"
                value={initialValue} 
                onChange={e => setInitialValue(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans focus:border-indigo-500 outline-none" 
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setShowAttrForm(false)} className="text-xs text-neutral-400 font-mono hover:text-neutral-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 font-bold text-xs hover:bg-indigo-700 text-white rounded font-mono shadow">Onboard Attribute</button>
          </div>
        </form>
      )}

      {/* Grid of Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attributes.map(attr => (
          <div key={attr.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-3 relative group">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-neutral-800 text-xs uppercase font-mono flex items-center space-x-1.5">
                <Sliders size={13} className="text-indigo-600 animate-pulse" />
                <span>{attr.name}</span>
              </h4>
              <button 
                onClick={() => onDeleteAttribute(attr.id)}
                className="text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                title="Delete Attribute"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* List Values */}
            <div className="flex flex-wrap gap-1.5 min-h-[50px] items-center">
              {attr.values.length === 0 ? (
                <span className="text-[11px] text-neutral-400 italic font-sans font-medium">No options declared. Add options below.</span>
              ) : (
                attr.values.map(val => (
                  <span key={val} className="text-[10px] bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 font-mono text-neutral-700 font-bold flex items-center space-x-1">
                    <span>{val}</span>
                  </span>
                ))
              )}
            </div>

            {/* Add Options Action */}
            <div className="pt-2 border-t flex space-x-2">
              <input 
                type="text" 
                placeholder="New Option"
                value={newValueMap[attr.id] || ''}
                onChange={e => setNewValueMap(prev => ({ ...prev, [attr.id]: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') handleAddValue(attr.id); }}
                className="flex-1 bg-neutral-50 px-2.5 py-1 text-xs border rounded font-mono outline-none focus:border-indigo-500" 
              />
              <button 
                onClick={() => handleAddValue(attr.id)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded transition shadow-sm shrink-0"
              >
                <Check size={14} className="stroke-[3]" />
              </button>
            </div>

          </div>
        ))}

        {attributes.length === 0 && (
          <div className="col-span-full py-16 text-center text-neutral-400 bg-white border border-dashed rounded-lg font-sans text-xs">
            No active global parameters found. Define one to enable variable product capabilities.
          </div>
        )}
      </div>
    </div>
  );
}
