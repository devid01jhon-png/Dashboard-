/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Tag, 
  IndianRupee, 
  ShieldAlert, 
  ArrowLeftRight, 
  Trash2,
  Database
} from 'lucide-react';
import { PimProduct, PimHistoryLog } from './pimTypes';

interface ProductHistoryManagerProps {
  products: PimProduct[];
  historyLogs: PimHistoryLog[];
  onClearHistory: () => void;
}

export default function ProductHistoryManager({
  products,
  historyLogs,
  onClearHistory
}: ProductHistoryManagerProps) {
  const [searchSKU, setSearchSKU] = useState('');
  const [filterAction, setFilterAction] = useState('All');

  const filteredLogs = historyLogs.filter(log => {
    const matchesSku = searchSKU ? log.details.toLowerCase().includes(searchSKU.toLowerCase()) || log.action.toLowerCase().includes(searchSKU.toLowerCase()) : true;
    const matchesAction = filterAction === 'All' || log.action === filterAction;
    return matchesSku && matchesAction;
  });

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'Price Revision':
      case 'Pricing Change':
        return <IndianRupee size={14} className="text-emerald-500" />;
      case 'GST Alteration':
      case 'Tax Revision':
        return <Database size={14} className="text-amber-500" />;
      case 'Authorization Gateway':
      case 'Approval Shift':
        return <ShieldAlert size={14} className="text-indigo-500" />;
      default:
        return <ArrowLeftRight size={14} className="text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center space-x-2">
            <History size={24} className="text-neutral-700" />
            <span>Material Ledger Audit Trail</span>
          </h2>
          <p className="text-xs text-neutral-500 font-mono">Immutable audit trail of pricing updates, GST class modifications, and catalog transitions, mapped to user signatures.</p>
        </div>
        <button 
          onClick={() => {
            if (window.confirm("Under ISO 27001, audit ledgers should not be truncated without management key clearance. Proceed?")) {
              onClearHistory();
            }
          }}
          className="text-[10.5px] font-mono text-rose-500 hover:text-rose-700 border border-neutral-220 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg flex items-center space-x-1"
        >
          <Trash2 size={13} />
          <span>Force Purge Audit Cache</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm text-xs font-mono">
        
        <div className="flex flex-1 items-center space-x-2.5">
          <Search size={14} className="text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search by SKU, action or changes details..."
            value={searchSKU}
            onChange={e => setSearchSKU(e.target.value)}
            className="flex-1 bg-neutral-50 px-3 py-1.5 border rounded outline-none focus:border-indigo-500" 
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter size={14} className="text-neutral-500" />
          <select 
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="bg-neutral-50 px-3 py-1.5 border rounded" 
          >
            <option value="All">All Movements</option>
            <option value="Onboard SKU">Onboard SKU</option>
            <option value="Price Revision">Price Revision</option>
            <option value="GST Alteration">GST Alteration</option>
            <option value="Authorization Gateway">Authorization Gateway</option>
            <option value="Marketplace Alteration">Marketplace Alteration</option>
          </select>
        </div>

      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-neutral-50 text-neutral-400 border-b border-neutral-100 uppercase text-[9px] font-bold">
              <th className="py-3 px-4">Event Date</th>
              <th className="py-3 px-2">Authority Sign</th>
              <th className="py-3 px-2">Action classification</th>
              <th className="py-3 px-4">Movement Description</th>
              <th className="py-3 px-2">Original value</th>
              <th className="py-3 px-4 text-right font-mono">Upgraded value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-neutral-50 font-mono text-[11px]">
                <td className="py-3.5 px-4 text-neutral-500">
                  {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </td>
                <td className="py-3.5 px-2">
                  <div className="font-sans">
                    <strong className="block text-neutral-800 text-[11.5px] leading-tight font-semibold">{log.userEmail.split('@')[0]}</strong>
                    <span className="text-[9.5px] text-neutral-400 font-mono italic">{log.userEmail}</span>
                  </div>
                </td>
                <td className="py-3.5 px-2">
                  <div className="flex items-center space-x-1.5">
                    {getLogIcon(log.action)}
                    <span className="font-bold text-neutral-700">{log.action}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-neutral-650 max-w-sm whitespace-pre-line leading-relaxed">
                  {log.details}
                </td>
                <td className="py-3.5 px-2 text-neutral-450 italic">
                  {log.oldValue || '—'}
                </td>
                <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">
                  {log.newValue || '▲ Complete'}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-neutral-400 font-sans text-xs bg-neutral-50">
                  No audit movements matched the search filters. Clear search fields.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
