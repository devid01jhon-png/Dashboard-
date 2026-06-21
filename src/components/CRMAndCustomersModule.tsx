/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  IndianRupee, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  Search,
  Users2
} from 'lucide-react';

interface CRMAndCustomersModuleProps {
  searchQuery: string;
}

export default function CRMAndCustomersModule({ searchQuery }: CRMAndCustomersModuleProps) {
  const [showAddLead, setShowAddLead] = useState(false);
  
  // Static stateful customer master definitions
  const [customers, setCustomers] = useState([
    { id: 'cust-1', name: 'Shree Balaji Retailers', gstin: '27AEEFB4928A1Z7', state: 'Maharashtra', outstandingAmt: 12000, openedTickets: 0 },
    { id: 'cust-2', name: 'Delhi Tech Emporium', gstin: '07ABCDF9934B1Z2', state: 'Delhi', outstandingAmt: 0, openedTickets: 1 },
    { id: 'cust-3', name: 'Karnataka Component Dealers', gstin: '29AAACK8402G1Z0', state: 'Karnataka', outstandingAmt: 45000, openedTickets: 0 },
    { id: 'cust-4', name: 'West Bengal Yarn House', gstin: '19AAABP4929M1ZM', state: 'West Bengal', outstandingAmt: 110400, openedTickets: 2 }
  ]);

  // Lead Kanban Deck structures
  const [leads, setLeads] = useState([
    { id: 'lead-1', company: 'Chennai Electro Plastics Ltd', contact: 'Magesh Subramanyam', phone: '+91 44 2831 0212', estVal: 350000, stage: 'Negotiating' },
    { id: 'lead-2', company: 'Jaipur Textile Mills B2B', contact: 'Virendra Singh', phone: '+91 141 249 9005', estVal: 720000, stage: 'Prospect' },
    { id: 'lead-3', company: 'Pune Packing Aggregators', contact: 'Sanjay Deshmukh', phone: '+91 20 2542 9012', estVal: 180000, stage: 'Won' },
    { id: 'lead-4', company: 'Ludhiana Wool Sourcing Hub', contact: 'Karan Singhania', phone: '+91 161 244 5900', estVal: 1250000, stage: 'Lost' }
  ]);

  // Add Lead Form State
  const [leadCompany, setLeadCompany] = useState('');
  const [leadContact, setLeadContact] = useState('');
  const [leadVal, setLeadVal] = useState(100000);
  const [leadStage, setLeadStage] = useState<'Prospect' | 'Negotiating' | 'Won' | 'Lost'>('Prospect');

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadCompany || !leadContact) {
      alert('Kindly verify Lead Company name and Contact authority.');
      return;
    }

    setLeads([
      ...leads,
      {
        id: `lead-${Date.now()}`,
        company: leadCompany,
        contact: leadContact,
        phone: '+91 91111 92222',
        estVal: leadVal,
        stage: leadStage
      }
    ]);

    setLeadCompany('');
    setLeadContact('');
    setLeadVal(100000);
    setShowAddLead(false);
  };

  const updateLeadStage = (id: string, newStage: 'Prospect' | 'Negotiating' | 'Won' | 'Lost') => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, stage: newStage } : lead));
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* CRM B2B Sales Kanban funnel */}
      <div className="space-y-4">
        
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-neutral-200">
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">B2B CRM Leads Master Portal</h3>
            <p className="text-xs text-neutral-400 font-mono">Move deals across columns to update prospective order volumes.</p>
          </div>
          <button
            onClick={() => setShowAddLead(!showAddLead)}
            className="flex items-center space-x-1.5 h-8 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-3 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Onboard Commercial Lead</span>
          </button>
        </div>

        {showAddLead && (
          <form onSubmit={handleLeadSubmit} className="bg-white p-5 rounded-xl border border-neutral-300 shadow-md grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono animate-in slide-in-from-top-4">
            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Lead Enterprise *</label>
              <input
                type="text"
                placeholder="Chennai Electro Plastics"
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
                className="w-full bg-neutral-50 px-2.5 py-1.5 border rounded"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Contact Officer *</label>
              <input
                type="text"
                placeholder="Magesh Subramanyam"
                value={leadContact}
                onChange={(e) => setLeadContact(e.target.value)}
                className="w-full bg-neutral-50 px-2.5 py-1.5 border rounded"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Deal Appraisal (INR) *</label>
              <input
                type="number"
                value={leadVal}
                onChange={(e) => setLeadVal(parseInt(e.target.value) || 0)}
                className="w-full bg-neutral-50 px-2.5 py-1.5 border rounded"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded transition">
                Pin B2B ProspectCard
              </button>
            </div>
          </form>
        )}

        {/* 4 Pipeline Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Prospect */}
          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-3">
            <span className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block bg-white px-2.5 py-1 rounded border">
              1. Prospecting ({leads.filter(l => l.stage === 'Prospect').length})
            </span>
            <div className="space-y-2">
              {leads.filter(l => l.stage === 'Prospect').map(l => (
                <div key={l.id} className="bg-white p-3 rounded-lg border border-neutral-200 space-y-2 relative shadow-sm">
                  <span className="font-bold text-xs text-neutral-800 block">{l.company}</span>
                  <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{l.contact}</span>
                  <strong className="text-xs text-orange-600 font-mono block">₹{l.estVal.toLocaleString('en-IN')}</strong>
                  <button onClick={() => updateLeadStage(l.id, 'Negotiating')} className="w-full py-0.5 text-[9px] font-mono bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded">
                    Advance to Negotiate →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Negotiations */}
          <div className="bg-amber-50/20 p-3 rounded-xl border border-amber-100 space-y-3">
            <span className="text-[10px] font-bold font-mono text-amber-600 uppercase tracking-wider block bg-amber-50/50 px-2.5 py-1 rounded border border-amber-100">
              2. Negotiating ({leads.filter(l => l.stage === 'Negotiating').length})
            </span>
            <div className="space-y-2">
              {leads.filter(l => l.stage === 'Negotiating').map(l => (
                <div key={l.id} className="bg-white p-3 rounded-lg border border-neutral-200 space-y-2 shadow-sm">
                  <span className="font-bold text-xs text-neutral-800 block">{l.company}</span>
                  <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{l.contact}</span>
                  <strong className="text-xs text-orange-600 font-mono block">₹{l.estVal.toLocaleString('en-IN')}</strong>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => updateLeadStage(l.id, 'Prospect')} className="py-0.5 text-[9px] font-mono bg-neutral-100 text-neutral-400 rounded">← Back</button>
                    <button onClick={() => updateLeadStage(l.id, 'Won')} className="py-0.5 text-[9px] font-mono bg-emerald-600 text-white rounded font-bold uppercase">Deal Won</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deal Won */}
          <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100 space-y-3">
            <span className="text-[10px] font-bold font-mono text-emerald-600 uppercase tracking-wider block bg-emerald-50/50 px-2.5 py-1 rounded border border-emerald-100">
              3. Won Ledger ({leads.filter(l => l.stage === 'Won').length})
            </span>
            <div className="space-y-2">
              {leads.filter(l => l.stage === 'Won').map(l => (
                <div key={l.id} className="bg-white p-3 rounded-lg border border-neutral-200 border-l-4 border-l-emerald-500 space-y-1.5 shadow-sm">
                  <span className="font-bold text-xs text-neutral-850 block">{l.company}</span>
                  <span className="text-[10px] text-neutral-400 font-mono block">{l.contact}</span>
                  <strong className="text-xs text-emerald-600 font-mono block">₹{l.estVal.toLocaleString('en-IN')}</strong>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center justify-center font-mono uppercase">
                    <CheckCircle2 size={10} className="mr-0.5" /> Booked to Sales
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lost */}
          <div className="bg-rose-50/20 p-3 rounded-xl border border-rose-100 space-y-3">
            <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block bg-rose-50/50 px-2.5 py-1 rounded border border-rose-100">
              4. Disengaged ({leads.filter(l => l.stage === 'Lost').length})
            </span>
            <div className="space-y-2">
              {leads.filter(l => l.stage === 'Lost').map(l => (
                <div key={l.id} className="bg-white p-3 rounded-lg border border-neutral-200 opacity-60 space-y-1 shadow-sm">
                  <span className="font-bold text-xs text-neutral-800 block line-through">{l.company}</span>
                  <strong className="text-xs text-neutral-400 font-mono block">₹{l.estVal.toLocaleString('en-IN')}</strong>
                  <span className="text-[9px] text-neutral-400 block font-mono">Dormant Prospect</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Customer Master ledger directory */}
      <div className="bg-white border rounded-xl shadow-sm border-neutral-200 mt-6 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-neutral-50/50">
          <h3 className="font-bold text-neutral-850 text-sm">Client-Side Customer Master Records</h3>
          <span className="text-[10px] font-mono text-neutral-400 uppercase">National Distributor books</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                <th className="py-2.5 px-4">Consignee Name</th>
                <th className="py-2.5 px-4">VAT / GSTIN</th>
                <th className="py-2.5 px-4">State Territory</th>
                <th className="py-2.5 px-4 text-right">Outstanding balance (INR)</th>
                <th className="py-2.5 px-4 text-center">Opened Support Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-150 text-xs">
              {filteredCustomers.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-neutral-800">{c.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-neutral-700">{c.gstin}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center text-neutral-600 font-mono text-[11px]">
                      <MapPin size={12} className="mr-1 text-neutral-400" /> {c.state}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${c.outstandingAmt > 0 ? 'text-orange-600' : 'text-neutral-500'}`}>
                    ₹{c.outstandingAmt.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    {c.openedTickets > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-bold flex items-center justify-center w-max mx-auto">
                        <Clock size={11} className="mr-0.5" /> {c.openedTickets} active logs
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold flex items-center justify-center w-max mx-auto">
                        <CheckCircle2 size={11} className="mr-0.5" /> Clean tickets
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
