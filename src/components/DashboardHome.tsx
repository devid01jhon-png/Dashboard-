/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingCart, 
  Layers, 
  Users, 
  ArrowUpRight, 
  AlertTriangle,
  BadgeAlert,
  Coins,
  Warehouse,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Vendor, Product, Order, FinanceTransaction, AuditLog, NotificationItem } from '../types';

interface DashboardHomeProps {
  vendors: Vendor[];
  products: Product[];
  orders: Order[];
  transactions: FinanceTransaction[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  setCurrentTab: (tab: string) => void;
}

export default function DashboardHome({
  vendors,
  products,
  orders,
  transactions,
  auditLogs,
  notifications,
  setCurrentTab
}: DashboardHomeProps) {

  // Helper: Format standard currency INR using standard Indian numbering system
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Helper: Indian decimal formatting (12,34,567.00)
  const formatIndianNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  };

  // 1. Core aggregates
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.orderDate.startsWith('2026-06-20'));
  
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.grandTotal, 0);
  const todayProfit = todayOrders.reduce((acc, o) => acc + (o.grandTotal - o.totalBeforeTax * 0.7), 0); // Approximate COGS at 70% of base value

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const packedCount = orders.filter(o => o.status === 'Packed').length;
  const dispatchedCount = orders.filter(o => o.status === 'Dispatched').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;

  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  const activeVendors = vendors.filter(v => v.status === 'Active').length;
  const inactiveVendors = vendors.filter(v => v.status === 'Inactive').length;

  const inventoryValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);

  // 2. GST & TDS Metrics
  const gstLiability = transactions
    .filter(t => t.type === 'GST Liability')
    .reduce((acc, t) => acc + t.amount, 0);

  const itcClaimable = transactions
    .filter(t => t.type === 'ITC Claimed' || (t.type === 'Collection In' && t.taxAmount))
    .reduce((acc, t) => acc + (t.taxAmount || 0), 0);

  const tdsSummary = transactions
    .filter(t => t.type === 'TDS Liability' || t.tdsAmount)
    .reduce((acc, t) => acc + (t.tdsAmount || t.amount), 0);

  // 3. Recharts Datasets
  // Sales Performance Month-wise for FY 2026-2027
  const chartData = [
    { name: 'Apr', Revenue: 540000, Profit: 162000, GST_Paid: 97200 },
    { name: 'May', Revenue: 780000, Profit: 234000, GST_Paid: 140400 },
    { name: 'Jun', Revenue: 950000, Profit: 285500, GST_Paid: 171000 },
  ];

  // Warehouse Utilization Chart
  const warehouseData = [
    { name: 'Occupied slots', value: 4 },
    { name: 'Vacant bins', value: 3 },
  ];
  const COLORS = ['#f97316', '#e5e5e5'];

  // Indian State-wise sales distribution
  const stateDistribution = [
    { name: 'Maharashtra', value: 75 },
    { name: 'Delhi', value: 15 },
    { name: 'Karnataka', value: 10 }
  ];
  const STATE_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      
      {/* 1. Today's Critical Realtime Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Revenue */}
        <div id="stat-revenue" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue (MTD)</span>
              <span className="text-emerald-500 text-xs font-bold font-sans flex items-center bg-emerald-50/70 px-1.5 py-0.5 rounded leading-none">
                <TrendingUp size={11} className="mr-0.5" /> +14.2%
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
              {formatINR(todayRevenue || 55974)}
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full w-2/3 transition-all duration-500"></div>
          </div>
        </div>

        {/* Today's Profit */}
        <div id="stat-profit" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EBITDA Profits</span>
              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-sans">Calibrated</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
              {formatINR(todayProfit || 17820)}
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-1/2 transition-all duration-500"></div>
          </div>
        </div>

        {/* Total Stock Appraisal */}
        <div id="stat-inventory-value" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Inventory Assets</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">FIFO</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
              {formatINR(inventoryValue)}
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-3/5 transition-all duration-500"></div>
          </div>
        </div>

        {/* Active Vendors */}
        <div id="stat-vendors" className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Vendors</span>
              <span className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">Alerts Active</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 font-sans">
              {activeVendors} <span className="text-xs text-slate-400 font-medium">/ {vendors.length} Org</span>
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-4/5 transition-all duration-500"></div>
          </div>
        </div>

      </div>

      {/* 2. Order Pipeline Status Cards */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-3xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Live Order & Courier Dispatch Funnel</h3>
          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-mono font-bold px-2 py-0.5 rounded">AUTO SYNCHRONIZED</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <button onClick={() => setCurrentTab('orders')} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500 transition-all shadow-3xs cursor-pointer group hover:-translate-y-0.5 duration-150">
            <span className="text-amber-500 font-black block text-2xl font-sans">{pendingCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Inbound Queue</span>
          </button>
          
          <button onClick={() => setCurrentTab('orders')} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500 transition-all shadow-3xs cursor-pointer group hover:-translate-y-0.5 duration-150">
            <span className="text-indigo-500 font-black block text-2xl font-sans">{packedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Ready Package</span>
          </button>

          <button onClick={() => setCurrentTab('orders')} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500 transition-all shadow-3xs cursor-pointer group hover:-translate-y-0.5 duration-150">
            <span className="text-violet-500 font-black block text-2xl font-sans">{dispatchedCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">With Courier</span>
          </button>

          <button onClick={() => setCurrentTab('orders')} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500 transition-all shadow-3xs cursor-pointer group hover:-translate-y-0.5 duration-150">
            <span className="text-emerald-500 font-black block text-2xl font-sans">{deliveredCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Delivered OK</span>
          </button>

          <button onClick={() => setCurrentTab('orders')} className="bg-white p-4 rounded-xl border border-slate-200 text-left hover:border-indigo-500 transition-all shadow-3xs cursor-pointer group hover:-translate-y-0.5 duration-150">
            <span className="text-rose-500 font-black block text-2xl font-sans">{cancelledCount}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Cancelled/RTO</span>
          </button>

          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-left flex flex-col justify-between">
            <div className="flex items-center space-x-1.5 text-indigo-700 font-bold leading-none">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <span className="text-[10px] uppercase font-sans tracking-wider">Alert SKU</span>
            </div>
            <span className="text-xl font-extrabold text-indigo-950 mt-2 block font-sans">
              {lowStockProducts.length + outOfStockProducts.length} SKU
            </span>
          </div>

        </div>
      </div>

      {/* 3. Recharts Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales & Profit Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Operational Trend (GSTR-1 Realtime)</h3>
              <p className="text-xs text-slate-400 font-mono">Monthly Revenue, EBITDA margins & compiled GST filings</p>
            </div>
            <div className="flex space-x-3 text-xs font-mono font-medium">
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-indigo-500 mr-1.5" />Revenue</span>
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />Profit</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontStyle="italic" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => formatINR(value as number)} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Ratios */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1">State Demographics & Storage</h3>
            <p className="text-xs text-slate-400 font-mono mb-4">India state volumes & warehouse holdings</p>
          </div>

          <div className="flex items-center justify-around flex-1 py-4">
            {/* Pie 1: State Sales Volume */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">Sales Share</span>
              <PieChart width={100} height={100}>
                <Pie data={stateDistribution} cx={45} cy={45} innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                  {stateDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATE_COLORS[index % STATE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="mt-2 space-y-0.5 text-[9px] font-mono text-slate-500">
                <span className="flex items-center justify-center shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1" />MH (75%)</span>
                <span className="flex items-center justify-center shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1" />DL (15%)</span>
              </div>
            </div>

            {/* Pie 2: Warehouse grid occupancy */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wide">Bin Slots</span>
              <PieChart width={100} height={100}>
                <Pie data={warehouseData} cx={45} cy={45} innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value">
                  {warehouseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#6366f1', '#e2e8f0'][index % 2]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
              <div className="mt-2 text-[9px] font-mono text-slate-500 space-y-0.5">
                <span className="flex items-center justify-center"><span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mr-1" />Occupied (57%)</span>
                <span className="flex items-center justify-center"><span className="h-1.5 w-1.5 bg-slate-200 rounded-full mr-1" />Vacant</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. GST & TDS Ledger Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GST Filing Summary Board */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Receipt className="text-indigo-600" size={18} />
              <h3 className="text-sm font-extrabold text-slate-800">Tax Compliance Matrix (GST)</h3>
            </div>
            <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-mono font-bold uppercase">GSTR-3B Synced</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[10px] text-slate-500 font-sans font-medium block">Estimated Output</span>
              <span className="text-sm font-extrabold text-slate-800 block mt-1">{formatINR(gstLiability || 45890)}</span>
            </div>
            <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
              <span className="text-[10px] text-emerald-800 font-sans font-medium block">ITC Claimable</span>
              <span className="text-sm font-extrabold text-emerald-700 block mt-1">{formatINR(itcClaimable || 35620)}</span>
            </div>
            <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100">
              <span className="text-[10px] text-indigo-800 font-sans font-bold block">Net GST Payable</span>
              <span className="text-sm font-extrabold text-indigo-700 block mt-1">{formatINR((gstLiability - itcClaimable) || 12431)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between font-mono">
            <span>Next Filing Date (GSTR-1): <strong className="text-slate-700">11th July 2026</strong></span>
            <span>Status: <strong className="text-indigo-600">Pending Reconciliation</strong></span>
          </div>
        </div>

        {/* GST Status Dark styling from theme html */}
        <div className="bg-[#0f172a] text-white p-5 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white">✓</div>
              <span className="text-xs font-bold uppercase tracking-wider">Compliance Status</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">GSTIN Return GSTR-1</span>
                <span className="text-emerald-400 font-bold font-mono">FILED</span>
              </div>
              <div className="flex justify-between text-xs border-b border-slate-800/60 pb-1.5">
                <span className="text-slate-400">GSTR-3B Compliant</span>
                <span className="text-indigo-400 font-bold font-mono">VERIFIED</span>
              </div>
              <div className="flex justify-between text-xs pb-1.5">
                <span className="text-slate-400">TDS Deposition</span>
                <span className="text-emerald-400 font-bold font-mono font-sans">COMPLETED</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-2 font-mono">Portal Connection: Active</p>
        </div>

      </div>

      {/* 5. Bottom Roster: Recent Operations Log and System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent AuditLogs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-slate-800">Verified Audit Ledgers</h3>
            <button onClick={() => setCurrentTab('db-schema')} className="text-xs text-indigo-600 hover:underline font-mono font-bold uppercase">View DDL logs →</button>
          </div>

          <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 font-mono text-xs">
                  {log.userName.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.userName} ({log.role})</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded inline-block font-mono border border-slate-100 uppercase tracking-tight">
                    Action: {log.action}
                  </div>
                  <p className="text-slate-500 leading-relaxed mt-0.5 text-xs">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST / Stock Compliance Signals */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Compliance Warnings & Stockout Flags</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notifications.map((notif) => {
              const borderTheme = notif.type === 'error' 
                ? 'border-rose-100 bg-rose-50/50 text-rose-800' 
                : notif.type === 'warning'
                ? 'border-amber-100 bg-amber-50/20 text-amber-800'
                : 'border-indigo-100 bg-indigo-50/20 text-indigo-800';

              return (
                <div key={notif.id} className={`p-3.5 rounded-lg border flex items-start space-x-2.5 ${borderTheme}`}>
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  <div className="flex-1 text-xs">
                    <div className="font-bold flex justify-between">
                      {notif.title}
                      <span className="text-[9px] font-mono opacity-80">
                        {new Date(notif.timestamp).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="opacity-95 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
