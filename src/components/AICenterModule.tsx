/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Terminal, 
  CheckCircle2, 
  Compass, 
  Activity, 
  ArrowRight,
  Calculator
} from 'lucide-react';

export default function AICenterModule() {
  const [activeQuery, setActiveQuery] = useState('');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const SUGGESTED_AGENTS = [
    {
      title: 'Audit Vardhman Yarn Ledgers',
      query: 'Check GSTR-2B Input Tax Credit discrepancies for Vardhman Textiles of the last quarter.',
      outcome: `### GSTR-2B Audit Report: Vardhman Yarns Ltd
**Excise status: MATCHED**
**Audit timestamp: 2026-06-21T04:41:45-07:00**

1. **Declared Output Tax Liability (Supplier GSTR-1):** 
   * ₹1,42,500 (CGST) + ₹1,42,500 (SGST) under HSN 54011000 (Yarn rate 5%)
2. **Recorded Purchase Vouchers (SaaS Ledgers):** 
   * Matches identically with Purchase Voucher PO-2026-0032.
3. **Difference:** ₹0.00 (Perfect Match)
4. **ITC Eligibility:**
   * Fully eligible, uploaded within limit rules. Reconciled in compiled GSTR-3B sheet.

**AI Action Advice:** No correction required. Ledger is green.`
    },
    {
      title: 'Analyze Delhivery Volumetric Splits',
      query: 'Calculate courier dimensional weight splits for recent North India packages to estimate freight savings.',
      outcome: `### Freight Optimizer Split: Delhivery vs. Blue Dart
**Route: Mumbai Hub (Western) ➔ Delhi/NCR (Northern)**

1. **Volumetric Weight Calculation:**
   * Package size: 30x30x30 cms = Volumetric index: 5.40 Kg (Chargeable Weight: 5.40 Kg).
2. **Carrier Rate split comparison:**
   * **Delhivery Surface:** Billing rate ₹450.00 flat (estimated transit: 96 hours).
   * **Blue Dart Air:** Billing rate ₹860.00 flat (estimated transit: 24 hours).
3. **EBITDA Savings Recommendation:**
   * For non-expedited orders (Amazon India reseller), select **Delhivery Surface** to claim an immediate ₹410.00 (47.6%) savings per carton parcel.

**Freight Action Advice:** Configured router settings to auto-allocate Delhivery for shipments < ₹25,000.`
    },
    {
      title: 'Validate HSN Taxonomy Errors',
      query: 'Scan products database for HSN digit mismatches under CBIC June guidelines.',
      outcome: `### CBIC HSN Code Sanitation Engine
**Scan target: All active catalog material SKUs**

1. **Sanitation Result:**
   * Found 0 fatal errors.
   * **Alert Flag (Warning):** SLA checklist items for 'TX-POLY-THREAD' (HSN: 54011000) has 8 digits. Under Indian budget definitions, businesses exceeding ₹5 Cr turnover require mandatory 6-digit or 8-digit HSN codes on tax invoices, so the SKU is perfectly aligned.
2. **Suggestion:**
   * Keep 8-digit HSN for B2B cross-border exports to map integrated system tariff rules cleanly.

**AI Action Advice:** Catalog sanitized with green flags.`
    }
  ];

  const handleAgentClick = (query: string, report: string) => {
    setLoading(true);
    setActiveQuery(query);
    setAiReport(null);

    // Simulate model inference time lapse
    setTimeout(() => {
      setAiReport(report);
      setLoading(false);
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuery) return;
    
    setLoading(true);
    setAiReport(null);

    setTimeout(() => {
      setAiReport(`### SaaS Automated Query Assessment 
**Query Registered:** "${activeQuery}"
*Diagnostic analysis finalized successfully at ${new Date().toLocaleTimeString('en-IN')}:*

1. **Indian Tax Verification:** Analyzed current accounting metrics including output GST liabilities against input ITC reserves.
2. **Audit Assurance:** Documented correct matching with Row Level Security credentials in active Postgres tables.
3. **Recommendation:** Proceed with monthly e-way bill reconciliation. Ledger balance verified as cohesive.
`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">

      {/* Hero Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-white space-y-4 shadow-xl relative overflow-hidden">
        
        {/* Glow ambient design */}
        <div className="absolute right-0 top-0 h-48 w-48 bg-orange-500 rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="flex items-start space-x-3">
          <div className="p-3 bg-neutral-800 text-orange-400 rounded-xl shrink-0 border border-neutral-700">
            <Cpu size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-orange-400 tracking-widest block">Automation & Auditing Central</span>
            <h2 className="text-lg font-bold tracking-tight text-white mt-1">TTGT AI Intelligent ERP Agent</h2>
            <p className="text-xs text-neutral-400 leading-snug max-w-xl mt-1.5">
              Powered by server-side deep checking processes. Run audits, check GSTIN compliance, verify MSME ledgers instantly, and review freight volumetric optimization scripts.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Checks Grid */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 block tracking-wider">Suggested Compliance Checkups</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SUGGESTED_AGENTS.map((agent, idx) => (
            <button
              key={idx}
              onClick={() => handleAgentClick(agent.query, agent.outcome)}
              className="bg-white p-4 rounded-xl border border-neutral-200 text-left hover:border-orange-500 hover:shadow transition duration-150 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Agent {idx + 1}</span>
                <h4 className="text-xs font-bold text-neutral-800">{agent.title}</h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">{agent.query}</p>
              </div>
              <span className="text-[10px] font-bold text-orange-600 font-mono flex items-center pt-2">
                Run Agent Audit <ArrowRight size={12} className="ml-1" />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt Command Console */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
        <label className="text-[10px] font-mono font-bold text-neutral-400 block uppercase tracking-wide">Command terminal prompt</label>
        
        <form onSubmit={handleCustomSubmit} className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Type custom prompt (e.g. Audit GST invoices of Shree Balaji or calculate net ITC payable)"
            value={activeQuery}
            onChange={(e) => setActiveQuery(e.target.value)}
            className="flex-1 bg-neutral-50 border border-neutral-200 focus:bg-white text-xs text-neutral-850 px-4 py-2.5 rounded-lg outline-none focus:border-orange-500 font-mono transition"
          />
          <button
            type="submit"
            className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-white font-mono text-xs font-bold px-5 rounded-lg transition shrink-0"
          >
            Audit Command
          </button>
        </form>

        {/* Loading Simulator */}
        {loading && (
          <div className="p-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-center space-y-3 animate-pulse">
            <Terminal className="mx-auto text-neutral-400 animate-spin" size={24} />
            <span className="text-xs text-neutral-500 font-mono block">Querying internal ledgers against Indian GST APIs...</span>
          </div>
        )}

        {/* Analytical Outcome displays */}
        {aiReport && !loading && (
          <div className="bg-neutral-900 text-neutral-300 p-6 rounded-xl border border-neutral-850 space-y-4 shadow-inner max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono flex items-center">
                <CheckCircle2 size={14} className="mr-1.5" />
                Audit Log Finalized Successfully
              </span>
              <span className="text-[9px] font-mono text-neutral-500 uppercase">SaaS Audit Ledger Match</span>
            </div>
            
            {/* Renders simulated markdown formatting easily */}
            <div className="text-xs whitespace-pre-wrap font-mono leading-relaxed space-y-2 select-text">
              {aiReport}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
