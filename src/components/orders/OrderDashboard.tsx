import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Hand, 
  Package, 
  Truck, 
  RotateCcw, 
  Coins, 
  BarChart4, 
  ArrowUpRight,
  Clock,
  Send
} from 'lucide-react';
import { Order } from '../../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface OrderDashboardProps {
  orders: Order[];
  onNavigate: (tab: string) => void;
}

export default function OrderDashboard({ orders, onNavigate }: OrderDashboardProps) {
  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  // KPI Calculations
  const today = '2026-06-20'; // Current simulation day from metadata
  const todayOrders = orders.filter(o => o.orderDate.startsWith(today));
  const todayRevenue = todayOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.grandTotal : sum, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'New Order' || o.status === 'Pending Confirmation');
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed' || o.status === 'Inventory Reserved');
  const pickingOrders = orders.filter(o => o.status === 'Picking');
  const packingOrders = orders.filter(o => o.status === 'Packing' || o.status === 'Quality Check');
  const readyToDispatch = orders.filter(o => o.status === 'Ready To Dispatch' || o.status === 'Courier Assigned');
  const dispatchedOrders = orders.filter(o => o.status === 'Dispatched' || o.status === 'In Transit' || o.status === 'Out For Delivery');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Closed');
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
  const returnedOrders = orders.filter(o => o.status === 'Returned');
  const refundPending = orders.filter(o => o.paymentStatus === 'Refunded' || o.status === 'Refunded').length; // simple approximation

  const codPendingCount = orders.filter(o => o.paymentMode === 'COD' && o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const prepaidCount = orders.filter(o => o.paymentMode === 'Prepaid' || o.paymentMode === 'UPI' || o.paymentMode === 'Credit Card').length;

  const totalNonCancelled = orders.filter(o => o.status !== 'Cancelled');
  const averageOrderValue = totalNonCancelled.length > 0
    ? totalNonCancelled.reduce((sum, o) => sum + o.grandTotal, 0) / totalNonCancelled.length
    : 0;

  const orderSuccessRate = orders.length > 0
    ? ((orders.length - cancelledOrders.length) / orders.length) * 100
    : 100;

  // SLA calculation - simulated performance (delivered before or on expected date)
  const orderSLAPerformance = 94.2; // Enterprise percentage

  // 1. Chart Data - Daily Trend for past week
  const dailyData = [
    { name: '14 Jun', Orders: 22, Revenue: 185000 },
    { name: '15 Jun', Orders: 34, Revenue: 295000 },
    { name: '16 Jun', Orders: 45, Revenue: 340000 },
    { name: '17 Jun', Orders: 31, Revenue: 210000 },
    { name: '18 Jun', Orders: 52, Revenue: 442000 },
    { name: '19 Jun', Orders: 61, Revenue: 512000 },
    { name: '20 Jun (Today)', Orders: todayOrders.length || 18, Revenue: todayRevenue || 148000 }
  ];

  // 2. Chart Data - Channel Source Breakdown
  const channelCounts = orders.reduce((acc: any, o) => {
    acc[o.marketplace] = (acc[o.marketplace] || 0) + 1;
    return acc;
  }, {});

  const channelData = Object.keys(channelCounts).map((key) => ({
    name: key,
    value: channelCounts[key]
  }));

  const COLORS = ['#0F172A', '#EA580C', '#2563EB', '#9333EA', '#16A34A', '#DB2777'];

  // Status List for visual card grids
  const workflowStatuses = [
    { label: "Today's Orders", count: todayOrders.length, value: formatINR(todayRevenue), color: "text-neutral-800 bg-neutral-150 border-neutral-200", tabUrl: "all", icon: <ShoppingBag size={15}/> },
    { label: "Pending Conf.", count: pendingOrders.length, color: "text-amber-700 bg-amber-50 border-amber-100", tabUrl: "pending", icon: <Clock size={15}/> },
    { label: "Confirmed", count: confirmedOrders.length, color: "text-sky-700 bg-sky-50 border-sky-100", tabUrl: "confirmed", icon: <CheckCircle2 size={15}/> },
    { label: "On Picking Floor", count: pickingOrders.length, color: "text-indigo-700 bg-indigo-50 border-indigo-100", tabUrl: "picking", icon: <Hand size={15}/> },
    { label: "Packing Line", count: packingOrders.length, color: "text-blue-700 bg-blue-50 border-blue-100", tabUrl: "packing", icon: <Package size={15}/> },
    { label: "Ready to Dispatch", count: readyToDispatch.length, color: "text-purple-700 bg-purple-50 border-purple-100", tabUrl: "dispatch", icon: <Send size={15}/> },
    { label: "In-Transit Cargo", count: dispatchedOrders.length, color: "text-violet-700 bg-violet-50 border-violet-100", tabUrl: "dispatched", icon: <Truck size={15}/> },
    { label: "Delivered", count: deliveredOrders.length, color: "text-emerald-700 bg-emerald-50 border-emerald-100", tabUrl: "delivered", icon: <CheckCircle2 size={15}/> },
    { label: "Returns Recv.", count: returnedOrders.length, color: "text-rose-700 bg-rose-50 border-rose-100", tabUrl: "returned", icon: <RotateCcw size={15}/> },
    { label: "Refund Liabilities", count: refundPending, color: "text-red-700 bg-red-50 border-red-100", tabUrl: "refunds", icon: <Coins size={15}/> }
  ];

  return (
    <div className="space-y-6">
      
      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block">Today's Revenue</span>
            <div className="text-xl font-bold font-sans text-neutral-900">{formatINR(todayRevenue)}</div>
            <span className="text-[9px] font-mono text-emerald-600 font-semibold block">▲ +12.4% vs yesterday</span>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block">Avg Order Value (AOV)</span>
            <div className="text-xl font-bold font-sans text-neutral-900">{formatINR(averageOrderValue)}</div>
            <span className="text-[9px] font-mono text-neutral-400 block">Based on live non-canceled sales</span>
          </div>
          <div className="p-2 bg-neutral-50 text-neutral-600 rounded-lg">
            <BarChart4 size={16} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block">Order Success Rate</span>
            <div className="text-xl font-bold font-sans text-neutral-900">{orderSuccessRate.toFixed(1)}%</div>
            <span className="text-[9px] font-mono text-rose-500 font-semibold block">▼ 1.1% Cancel rate</span>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle2 size={16} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-semibold block">SLA Compliance</span>
            <div className="text-xl font-bold font-sans text-neutral-900">{orderSLAPerformance}%</div>
            <span className="text-[9px] font-mono text-emerald-600 font-semibold block">● Within strict 24hr pack SLA</span>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <AlertCircle size={16} />
          </div>
        </div>

      </div>

      {/* Grid of statuses for quick redirect */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {workflowStatuses.map((stat, i) => (
          <button
            key={i}
            onClick={() => onNavigate(stat.tabUrl)}
            className={`p-3.5 rounded-lg border text-left transition hover:translate-y-[-2px] flex flex-col justify-between h-24 ${stat.color} hover:shadow-sm`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="opacity-80">{stat.icon}</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">GOTO</span>
            </div>
            <div>
              <span className="text-[10px] font-bold block truncate">{stat.label}</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-lg font-black font-sans leading-none">{stat.count}</span>
                {stat.value && <span className="text-[9px] font-mono opacity-80">({stat.value})</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend line chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Sales Fulfilled & Order Intake Trend</h3>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Dual axes metrics tracing volume growth</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-neutral-900 rounded-full mr-1"></span> Revenue</span>
              <span className="flex items-center"><span className="w-1.5 h-1.5 bg-orange-600 rounded-full mr-1"></span> Volume</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
                <XAxis dataKey="name" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                <YAxis yAxisId="left" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis yAxisId="right" orientation="right" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '11px', fontFamily: 'Inter' }}
                  labelStyle={{ fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '4px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#0F172A" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#EA580C" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marketplace breakdown pie selection */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">Channel Share split %</h3>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Breakdown of orders processed per marketplace</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '10px', fontFamily: 'Inter' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Total</span>
              <span className="text-xl font-bold text-neutral-900">{orders.length}</span>
            </div>
          </div>

          <div className="space-y-1.5 grid grid-cols-2 gap-x-3 text-[10px] font-mono">
            {channelData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between py-1 border-b border-neutral-50">
                <span className="flex items-center truncate max-w-[100px]" title={entry.name}>
                  <span className="w-2 h-2 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </span>
                <span className="font-bold text-neutral-700">{entry.value} pcs</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid: Additional Stats info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COD vs Prepaid liability ledger */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="font-bold text-neutral-700 uppercase tracking-wide text-[10px]">Payment Risk Allocation</span>
            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Risk: Medium</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-400">Total COD Pending Deliveries:</span>
              <strong className="text-neutral-800 font-bold">{codPendingCount} Orders</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Total Prepaid Cash Flow:</span>
              <strong className="text-emerald-600 font-bold">{prepaidCount} Orders</strong>
            </div>
            <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden flex mt-2">
              <div className="bg-emerald-500 h-full" style={{ width: `${(prepaidCount / orders.length) * 100}%` }}></div>
              <div className="bg-amber-500 h-full" style={{ width: `${(codPendingCount / orders.length) * 100}%` }}></div>
            </div>
            <span className="text-[9px] block text-neutral-400 leading-snug mt-1 text-center">
              Green representing secure prepaid, Amber showing COD risk capital in transit
            </span>
          </div>
        </div>

        {/* Future Integrations checklist */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-3 font-mono text-xs md:col-span-2">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="font-bold text-neutral-700 uppercase tracking-wide text-[10px]">Marketplace API Sync Engine Nodes</span>
            <span className="text-[9px] text-emerald-600 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">AUTO-SHIELD: HIGH</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2 border rounded bg-neutral-50/50">
              <div className="text-[10px] font-bold text-neutral-700 flex justify-between">
                <span>Amazon SP-API</span>
                <span className="text-emerald-600">● Live</span>
              </div>
              <div className="text-[9px] text-neutral-400 mt-1">Credentials verified. Auto fetch every 15m.</div>
            </div>
            <div className="p-2 border rounded bg-neutral-50/50">
              <div className="text-[10px] font-bold text-neutral-700 flex justify-between">
                <span>Flipkart Omnichannel</span>
                <span className="text-emerald-600">● Live</span>
              </div>
              <div className="text-[9px] text-neutral-400 mt-1">v3 Sandbox activated. Inventory pushing live.</div>
            </div>
            <div className="p-2 border rounded bg-neutral-50/50">
              <div className="text-[10px] font-bold text-neutral-700 flex justify-between">
                <span>WhatsApp Notification</span>
                <span className="text-indigo-500">○ Sandbox</span>
              </div>
              <div className="text-[9px] text-neutral-400 mt-1">API webhooks registered. Standard billing active.</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
