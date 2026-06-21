import React, { useState } from 'react';
import { 
  Clock, 
  History, 
  Activity, 
  Search, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';
import { Order, OrderTimelineEvent, OrderActivityLog } from '../../types';

interface OrderTimelineAuditProps {
  orders: Order[];
  tabRole: 'timeline' | 'audit_logs';
}

export default function OrderTimelineAudit({
  orders,
  tabRole
}: OrderTimelineAuditProps) {
  // Mock Data DB sync internally
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => orders[0]?.id || '');
  const [searchText, setSearchText] = useState('');

  // Sample static seed timelineevents mapped to order ID
  const defaultEvents: OrderTimelineEvent[] = [
    {
      id: 'e-1',
      orderId: 'SO-20260620-1001',
      title: 'Order Created',
      description: 'Customer Shree Balaji Retailers registered shopping cart via Direct Channel.',
      timestamp: '2026-06-20T10:30:00-07:00',
      status: 'New Order'
    },
    {
      id: 'e-2',
      orderId: 'SO-20260620-1001',
      title: 'Payment Received',
      description: 'UPI transaction confirmed. Reference RefNo: MB-85429104.',
      timestamp: '2026-06-20T10:31:14-07:00',
      status: 'Confirmed'
    },
    {
      id: 'e-3',
      orderId: 'SO-20260620-1001',
      title: 'Inventory Reserved',
      description: 'Allocated 50 units EL-HDMI-10M and 100 boxes PK-BOX-12X12 at Aisle A3 shelf L2.',
      timestamp: '2026-06-20T10:35:00-07:00',
      status: 'Inventory Reserved'
    },
    {
      id: 'e-4',
      orderId: 'SO-20260620-1001',
      title: 'Picking Started',
      description: 'Wave Sheet EWB-2025 assigned to warehouse picker Rajesh Nair.',
      timestamp: '2026-06-20T11:42:00-07:00',
      status: 'Picking'
    },
    {
      id: 'e-5',
      orderId: 'SO-20260620-1001',
      title: 'Packing Completed',
      description: 'Chargeable volumetric weight calculated: 0.85 Kg. Bubble wrapped inside custom 12x12 Kraft Box. Closed seal.',
      timestamp: '2026-06-21T02:00:22-07:00',
      status: 'Packed'
    },
    {
      id: 'e-6',
      orderId: 'SO-20260620-1001',
      title: 'Courier Assigned',
      description: 'Consignment signed under Delhivery. Tracking Number AWB984203194. Manifest compiled.',
      timestamp: '2026-06-21T03:32:00-07:00',
      status: 'Courier Assigned'
    }
  ];

  // System Audit Activity Trail logs
  const activityLogsList: OrderActivityLog[] = [
    {
      id: 'log-1',
      orderId: 'SO-20260620-1001',
      userEmail: 'devid01jhon@gmail.com',
      action: 'Committed New Order',
      details: 'Created statutory manual ledger of value ₹55,974.00, customer BALAJI RETAIL.',
      timestamp: '2026-06-21T21:40:02-07:00'
    },
    {
      id: 'log-2',
      orderId: 'SO-20260620-1001',
      userEmail: 'ops_packer_mumbai@ttgt.com',
      action: 'Completed Wave Pick Check',
      details: 'Validated barcodes of 50 HDMI wire bundles at picker panel A3.',
      timestamp: '2026-06-21T21:55:12-07:00'
    },
    {
      id: 'log-3',
      orderId: 'SO-20260620-1001',
      userEmail: 'aniket_qc@ttgt.com',
      action: 'Authorized QC Pass',
      details: 'Quality signature approved. Passed visual damage analysis.',
      timestamp: '2026-06-21T22:05:00-07:00'
    },
    {
      id: 'log-4',
      orderId: 'SO-20260620-1002',
      userEmail: 'devid01jhon@gmail.com',
      action: 'Modified Shipping Carrier',
      details: 'Altered carrier allocation from None to Blue Dart surface hub.',
      timestamp: '2026-06-21T22:15:22-07:00'
    },
    {
      id: 'log-5',
      orderId: 'SO-20260620-1003',
      userEmail: 'fiance_officer@ttgt.com',
      action: 'Approved Refund Request',
      details: 'Initiated original gateway reversal of ₹12,850.00 for target cancellation RMA.',
      timestamp: '2026-06-21T22:20:44-07:00'
    }
  ];

  // Specific selected Order's visual timeline
  const activeOrder = orders.find(o => o.id === selectedOrderId);
  
  // Create dynamic timeline logs depending on activeOrder status to simulate real workflow progress
  const getDynamicTimelineEvents = (): OrderTimelineEvent[] => {
    if (!activeOrder) return [];
    
    // Find default ones
    const matches = defaultEvents.filter(e => e.orderId === activeOrder.id);
    if (matches.length > 0) return matches;

    // Generate simulated stages based on current active order progress
    const items: OrderTimelineEvent[] = [
      {
        id: 'dyn-1',
        orderId: activeOrder.id,
        title: 'Order Registered',
        description: `Consignment entered system under ${activeOrder.marketplace}. Expected standard dispatch time block: T+24hr.`,
        timestamp: activeOrder.orderDate,
        status: 'New Order'
      }
    ];

    if (activeOrder.status !== 'New Order' && activeOrder.status !== 'Pending') {
      items.push({
        id: 'dyn-2',
        orderId: activeOrder.id,
        title: 'Payment Credited',
        description: `Secured payments clearance via mode: ${activeOrder.paymentMode}. Reference: TX_${activeOrder.id}_GWAY.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 10 * 60 * 1000).toISOString(),
        status: 'Confirmed'
      });
      items.push({
        id: 'dyn-3',
        orderId: activeOrder.id,
        title: 'Internal Inventory Allocation',
        description: `Waved physical stock levels at allocation node ${activeOrder.warehouse || 'Warehouse Alpha'}.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 30 * 60 * 1000).toISOString(),
        status: 'Inventory Reserved'
      });
    }

    if (activeOrder.status === 'Picking' || activeOrder.status === 'Packing' || activeOrder.status === 'Dispatched' || activeOrder.status === 'Delivered') {
      items.push({
        id: 'dyn-4',
        orderId: activeOrder.id,
        title: 'Wave Selection Picking Floor',
        description: `Assigned picker barcode checklist for aisle routing scans.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'Picking'
      });
    }

    if (activeOrder.status === 'Packing' || activeOrder.status === 'Dispatched' || activeOrder.status === 'Delivered') {
      items.push({
        id: 'dyn-5',
        orderId: activeOrder.id,
        title: 'QC Verified & Wrapped',
        description: `Safety sealed. Registered weight logs: 0.85 Kg, box: Corrugated. Signed.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'Packed'
      });
    }

    if (activeOrder.status === 'Dispatched' || activeOrder.status === 'Delivered') {
      items.push({
        id: 'dyn-6',
        orderId: activeOrder.id,
        title: 'Consignment Handover to Courier',
        description: `Dispatched to courier ${activeOrder.courierPartner || 'Delhivery'}. Waybill: ${activeOrder.awbNumber || 'AWB-PENDING-SYNC'}.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 6 * 60 * 60 * 1000).toISOString(),
        status: 'Dispatched'
      });
    }

    if (activeOrder.status === 'Delivered') {
      items.push({
        id: 'dyn-7',
        orderId: activeOrder.id,
        title: 'Successful Out of Lock Handover',
        description: `Proof of Delivery (POD) signature uploaded to local server. Marked delivered.`,
        timestamp: new Date(new Date(activeOrder.orderDate).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'Delivered'
      });
    }

    return items;
  };

  const currentTimelineEvents = getDynamicTimelineEvents();

  // Filter activity audit trail logs
  const finalFilteredLogs = activityLogsList.filter(log => {
    if (!searchText) return true;
    const s = searchText.toLowerCase();
    return log.orderId.toLowerCase().includes(s) || 
           log.userEmail.toLowerCase().includes(s) || 
           log.action.toLowerCase().includes(s) || 
           log.details.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">

      {/* TIMELINE OPTION VIEW */}
      {tabRole === 'timeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left panel select order */}
          <div className="bg-white rounded-xl border p-4 space-y-4 shadow-sm h-[450px] overflow-y-auto">
            <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block pb-1 border-b">
              Target Order accounts ({orders.length})
            </span>
            <div className="space-y-2">
              {orders.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`w-full p-2.5 rounded-lg border text-left font-mono text-xs block transition ${
                    selectedOrderId === o.id ? 'bg-neutral-900 text-white border-neutral-900' : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{o.id}</span>
                    <span className="opacity-75">{o.status}</span>
                  </div>
                  <span className="text-[10px] block opacity-80 mt-0.5 truncate font-sans font-semibold">{o.customerName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel visual vertical timeline */}
          <div className="md:col-span-2 bg-white rounded-xl border p-5 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-neutral-850 text-sm">Visual consignment pipeline status</h3>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Dual checklist traces of ground fulfillment logs</p>
            </div>

            {!activeOrder ? (
              <div className="text-center py-16 text-neutral-400 italic text-xs">
                Select an order account block on the left to trace historical activity logs.
              </div>
            ) : (
              <div className="space-y-6 pl-4 relative before:absolute before:left-[17px] before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-neutral-150">
                
                {currentTimelineEvents.map((event, i) => {
                  return (
                    <div key={event.id} className="relative pl-8 space-y-1 text-xs">
                      
                      {/* Timeline dot circle marker */}
                      <span className="absolute left-[-24px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-neutral-900 text-white">
                        <span className="w-1 h-1 rounded-full bg-white"></span>
                      </span>

                      <div className="flex justify-between items-baseline">
                        <strong className="text-neutral-800 text-xs font-bold font-sans">{event.title}</strong>
                        <span className="font-mono text-[9px] text-neutral-450 leading-none">
                          {new Date(event.timestamp).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-neutral-500 font-sans leading-relaxed text-[11px]">{event.description}</p>
                      
                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>
      )}

      {/* SECURITY AUDIT TRAIL LOGS */}
      {tabRole === 'audit_logs' && (
        <div className="space-y-4">
          
          {/* Header search audit */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-neutral-400" size={14} />
              <input
                type="text"
                placeholder="Filter audit entries by User Email, Action description, Order No..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-xs font-mono focus:outline-none"
              />
            </div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center space-x-1 select-none">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>Compliant secure legal block logs GSTR-1 ready</span>
            </div>
          </div>

          {/* Table index */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                    <th className="py-3 px-4">Audit Entry Hash</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Officer Operator</th>
                    <th className="py-3 px-4">Target Order</th>
                    <th className="py-3 px-4">Action Signature</th>
                    <th className="py-3 px-4">Log Details context</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {finalFilteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-sm text-neutral-400 italic">No security activity logs match search.</td>
                    </tr>
                  ) : (
                    finalFilteredLogs.map((log, i) => (
                      <tr key={log.id} className="hover:bg-neutral-50 font-mono text-[11px]">
                        <td className="py-3 px-4 font-bold text-neutral-400">#OM-A{i+11024}</td>
                        <td className="py-3 px-4 text-neutral-500">
                          {new Date(log.timestamp).toLocaleString('en-GB')}
                        </td>
                        <td className="py-3 px-4 font-sans font-semibold text-neutral-800">{log.userEmail}</td>
                        <td className="py-3 px-4 font-bold text-neutral-900">{log.orderId}</td>
                        <td className="py-3 px-4">
                          <span className="bg-neutral-100 text-neutral-850 px-1.5 py-0.5 border rounded text-[9px] font-black uppercase">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-neutral-600 max-w-sm truncate" title={log.details}>
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
