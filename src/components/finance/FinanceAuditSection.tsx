/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  HelpCircle, 
  Clock, 
  Activity, 
  BookMarked,
  KeyRound,
  FileLock
} from 'lucide-react';

export default function FinanceAuditSection() {
  const [locks, setLocks] = useState({
    voucherLock: true,
    fyLock: false,
    rlsStrict: true
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { timestamp: '2026-06-21 11:42:01', user: 'meera.iyer@ttgt.in', role: 'Chartered Accountant / Auditor', action: 'AUTHORIZED JOURNAL VOVCHER JV-2026-002', status: 'SUCCESS', ip: '103.45.210.14' },
    { timestamp: '2026-06-21 11:39:15', user: 'devid.jhon@ttgt.in', role: 'Chief Financial Officer (CFO)', action: 'RECONCILED HDFC BANK CURRENT REGISTER ACCORDINGLY', status: 'SUCCESS', ip: '103.45.210.15' },
    { timestamp: '2026-06-21 10:14:02', user: 'devid.jhon@ttgt.in', role: 'Chief Financial Officer (CFO)', action: 'POSTED DISBURSEMENT REMITTANCE ADVICE SET-26-0015', status: 'SUCCESS', ip: '103.45.210.15' },
    { timestamp: '2026-06-20 18:24:19', user: 'system_cron@ttgt.in', role: 'Automated DB Process', action: 'SYNCHRONISED GOVERNMENT SEC GSTR-2B ITC RECON PORTAL', status: 'SUCCESS', ip: 'internal-pod-39a' },
    { timestamp: '2026-06-20 09:12:45', user: 'meera.iyer@ttgt.in', role: 'Chartered Accountant / Auditor', action: 'MODIFIED COMPANY FISCAL YEAR SETTINGS TO 2026-27', status: 'SUCCESS', ip: '103.45.210.14' }
  ]);

  const toggleLockValue = (key: keyof typeof locks, labelName: string) => {
    const newVal = !locks[key];
    setLocks(prev => ({
      ...prev,
      [key]: newVal
    }));
    
    // Add to audit trail log
    const newLog = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'devid.jhon@ttgt.in',
      role: 'Chief Financial Officer (CFO)',
      action: `TOGGLED ${labelName.toUpperCase()} ADJUSTMENT STATUS TO: ${newVal ? 'LOCKED / STRICT' : 'UNLOCKED / BYPASS'}`,
      status: 'SUCCESS',
      ip: '103.45.210.15'
    };
    setAuditLogs([newLog, ...auditLogs]);
    alert(`${labelName} updated successfully! Status recorded completely inside immutable audit logging databases.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
      
      {/* VOUCHER LOCKS CONTROLLERS */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-205 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800">Immutable Audit Locks</h3>
          <p className="text-[10px] text-neutral-400 leading-tight">Restrict modifications of posted financial assets to comply with double entry audit standards.</p>
        </div>

        <div className="space-y-3">
          
          {/* Lock item 1 */}
          <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <strong className="block text-neutral-800 text-[11px]">Voucher Modification Lock</strong>
              <span className="text-[9px] text-neutral-400 block pt-0.5">Locks past journals & debit notes</span>
            </div>
            
            <button
              onClick={() => toggleLockValue('voucherLock', 'Voucher Modification Lock')}
              className={`p-1.5 px-3 rounded-lg font-bold border transition text-[10px] flex items-center space-x-1 ${locks.voucherLock ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-neutral-100 border-neutral-300 text-neutral-600'}`}
            >
              {locks.voucherLock ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{locks.voucherLock ? 'Strict Lock' : 'Enable Edit'}</span>
            </button>
          </div>

          {/* Lock item 2 */}
          <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <strong className="block text-neutral-800 text-[11px]">Financial Year (FY) Period Lock</strong>
              <span className="text-[9px] text-neutral-400 block pt-0.5">Bypasses past historical FY books</span>
            </div>
            
            <button
              onClick={() => toggleLockValue('fyLock', 'Financial Year period lock')}
              className={`p-1.5 px-3 rounded-lg font-bold border transition text-[10px] flex items-center space-x-1 ${locks.fyLock ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-neutral-100 border-neutral-300 text-neutral-600'}`}
            >
              {locks.fyLock ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{locks.fyLock ? 'FY Closed' : 'FY Active'}</span>
            </button>
          </div>

          {/* Lock item 3 */}
          <div className="p-4 bg-slate-50 border rounded-xl flex justify-between items-center">
            <div>
              <strong className="block text-neutral-800 text-[11px]">Row Level (RLS) PostgreSQL Log</strong>
              <span className="text-[9px] text-neutral-400 block pt-0.5">Enforce strict Supabase RLS checks</span>
            </div>
            
            <button
              onClick={() => toggleLockValue('rlsStrict', 'Postgres RLS Policy controls')}
              className={`p-1.5 px-3 rounded-lg font-bold border transition text-[10px] flex items-center space-x-1 ${locks.rlsStrict ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-neutral-100 border-neutral-300 text-neutral-600'}`}
            >
              {locks.rlsStrict ? <ShieldAlert size={12} /> : <Unlock size={12} />}
              <span>{locks.rlsStrict ? 'RLS Active' : 'Off-Audit'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* CORE SYSTEM OPERATIONS AUDIT LOG TRAIL */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs border-neutral-200 lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center border-b pb-3.5">
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1e293b]">PostgreSQL Immutable DB Transaction Audit Trails</h3>
            <p className="text-[10px] text-neutral-450">Active RLS access audit logging trails required for Indian MSME compliance files validation.</p>
          </div>
          
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center space-x-1">
            <Activity size={11} className="animate-pulse" />
            <span>Operational Log Active</span>
          </span>
        </div>

        {/* Audit Log Rows list */}
        <div className="space-y-2 max-h-[295px] overflow-y-auto pr-1">
          {auditLogs.map((log, idx) => (
            <div key={idx} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center text-[9px] text-neutral-400 font-bold">
                <span className="flex items-center space-x-1">
                  <Clock size={10} />
                  <span>{log.timestamp}</span>
                </span>
                <span>IP Core: {log.ip}</span>
              </div>
              
              <div className="flex justify-between items-start pt-0.5">
                <div className="leading-tight">
                  <strong className="block text-neutral-805 font-bold">{log.action}</strong>
                  <span className="text-[9px] text-neutral-400 block font-sans font-medium uppercase">{log.user} ({log.role})</span>
                </div>

                <span className="shrink-0 text-[8px] font-black bg-emerald-50 border border-emerald-300 text-emerald-700 px-1 py-0.5 rounded block">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
