/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Search, 
  Compass, 
  Workflow, 
  ShieldCheck, 
  FileCode2,
  Table
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../dbSchema';

export default function DbschemaModule() {
  const [copied, setCopied] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'Tables' | 'FullSQL'>('Tables');
  const [searchTable, setSearchTable] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABLE_SCHEMAS = [
    {
      name: 'audit_logs',
      description: 'Records comprehensive structural log traces of authorized actions, IP sources, and transacting employees.',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY' },
        { name: 'user_email', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'user_name', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'role', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'action', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'details', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'ip_address', type: 'TEXT', constraint: 'Nullable' },
        { name: 'timestamp', type: 'TIMESTAMPTZ', constraint: 'DEFAULT now()' }
      ]
    },
    {
      name: 'vendors',
      description: 'Stores business vendors registers, MSME classifications, bank accounts, and active tax deductions guidelines.',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY' },
        { name: 'company_name', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'gstin', type: 'TEXT', constraint: 'UNIQUE, checked length (14-16)' },
        { name: 'pan', type: 'TEXT', constraint: 'checked length (10)' },
        { name: 'msme_category', type: 'ENUM(\'Micro\', \'Small\', \'Medium\', \'None\')', constraint: 'DEFAULT None' },
        { name: 'tds_applicable', type: 'BOOLEAN', constraint: 'DEFAULT false' },
        { name: 'tds_section', type: 'ENUM(\'194C\', \'194J\', \'194Q\', \'None\')', constraint: 'DEFAULT None' },
        { name: 'ledger_balance', type: 'NUMERIC(15,2)', constraint: 'DEFAULT 0.00' }
      ]
    },
    {
      name: 'products',
      description: 'Catalogs B2B SKU materials bound to excise tariff classifications and HSN tax codes.',
      columns: [
        { name: 'id', type: 'UUID', constraint: 'PRIMARY KEY' },
        { name: 'sku', type: 'TEXT', constraint: 'UNIQUE, NOT NULL' },
        { name: 'name', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'hsn_code', type: 'TEXT', constraint: 'checked length (6, 8)' },
        { name: 'gst_rate', type: 'NUMERIC(5,2)', constraint: '0, 5, 12, 18, 28%' },
        { name: 'purchase_price', type: 'NUMERIC(15,2)', constraint: 'NOT NULL' },
        { name: 'selling_price', type: 'NUMERIC(15,2)', constraint: 'NOT NULL' },
        { name: 'vendor_id', type: 'UUID', constraint: 'FOREIGN KEY REFERENCES vendors(id)' }
      ]
    },
    {
      name: 'orders',
      description: 'Logs multi-channel e-commerce and direct B2B billing records, compiled taxes, and shipping AWBs.',
      columns: [
        { name: 'id', type: 'TEXT', constraint: 'PRIMARY KEY (SO-YYYYMMDD-XXXX)' },
        { name: 'customer_name', type: 'TEXT', constraint: 'NOT NULL' },
        { name: 'customer_gstin', type: 'TEXT', constraint: 'checked length (15) Nullable' },
        { name: 'total_before_tax', type: 'NUMERIC(15,2)', constraint: 'NOT NULL' },
        { name: 'total_cgst', type: 'NUMERIC(15,2)', constraint: 'DEFAULT 0.00' },
        { name: 'total_sgst', type: 'NUMERIC(15,2)', constraint: 'DEFAULT 0.00' },
        { name: 'total_igst', type: 'NUMERIC(15,2)', constraint: 'DEFAULT 0.00' },
        { name: 'grand_total', type: 'NUMERIC(15,2)', constraint: 'NOT NULL' },
        { name: 'eway_bill_number', type: 'TEXT', constraint: 'Nullable' }
      ]
    }
  ];

  const filteredTables = TABLE_SCHEMAS.filter(t => t.name.toLowerCase().includes(searchTable.toLowerCase()));

  return (
    <div className="space-y-6">

      {/* Intro Header */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-bold text-neutral-800 text-sm flex items-center space-x-1.5">
            <Database className="text-orange-500" size={17} />
            <span>PostgreSQL & Supabase Architecture Core</span>
          </h3>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">Normalized relationship schema files, speed indexes and Row Level Security (RLS) policies.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex border rounded-lg overflow-hidden font-mono text-xs">
          <button
            onClick={() => setActiveSchemaTab('Tables')}
            className={`px-3 py-1.5 font-bold transition ${activeSchemaTab === 'Tables' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}
          >
            Structural Dictionary View
          </button>
          <button
            onClick={() => setActiveSchemaTab('FullSQL')}
            className={`px-3 py-1.5 font-bold transition ${activeSchemaTab === 'FullSQL' ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-550 hover:bg-neutral-100'}`}
          >
            Copy Full SQL Script
          </button>
        </div>
      </div>

      {/* Render tabs */}
      {activeSchemaTab === 'Tables' ? (
        <div className="space-y-6 select-text">
          
          {/* Lookup search */}
          <div className="max-w-md relative flex items-center bg-white p-2 rounded-lg border border-neutral-200">
            <div className="absolute left-3 text-neutral-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Search table definitions (e.g. vendors, order)..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="w-full pl-9 bg-neutral-100/50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-800 py-1 rounded outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTables.map((table) => (
              <div key={table.name} className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm hover:border-neutral-350 transition">
                <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                  <div className="flex items-center space-x-1.5 font-bold text-neutral-800 text-xs font-mono lowercase">
                    <Table size={14} className="text-orange-500 shrink-0" />
                    <span>Table: {table.name}</span>
                  </div>
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded font-mono uppercase border border-sky-100">RLS Active</span>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-neutral-500 leading-snug font-sans">{table.description}</p>
                  
                  {/* Columns definitions list */}
                  <div className="space-y-1.5 font-mono text-[11px] bg-neutral-50 p-3 rounded-lg border border-neutral-100 max-h-40 overflow-y-auto">
                    {table.columns.map((col, idx) => (
                      <div key={idx} className="flex justify-between items-baseline border-b border-neutral-200/50 pb-1 last:border-0 last:pb-0">
                        <span className="text-neutral-800 font-bold">{col.name}</span>
                        <div className="space-x-3 text-right">
                          <span className="text-neutral-500 italic">{col.type}</span>
                          <span className="text-orange-700 text-[10px] font-bold">{col.constraint}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden text-neutral-300 relative shadow-inner">
          <div className="flex justify-between items-center border-b border-neutral-800 px-4 py-3 select-none">
            <span className="text-xs font-bold text-neutral-400 font-mono flex items-center">
              <FileCode2 size={14} className="mr-1.5 text-orange-500" />
              supabase_schema_registry.sql
            </span>
            <button
              id="copy-sql-btn"
              onClick={handleCopy}
              className="bg-neutral-800 text-white hover:bg-neutral-700 text-xs font-bold px-4 py-1.5 rounded transition flex items-center space-x-1"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span>DDL Script Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Grab Full SQL Script</span>
                </>
              )}
            </button>
          </div>

          {/* DDL display box */}
          <pre className="p-5 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed text-neutral-300 shadow-inner select-text">
            <code>
              {SUPABASE_SQL_SCHEMA}
            </code>
          </pre>
        </div>
      )}

    </div>
  );
}
