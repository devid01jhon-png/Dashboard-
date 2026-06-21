import React, { useState } from 'react';
import { 
  RotateCcw, 
  Coins, 
  Repeat, 
  Check, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  FileSpreadsheet 
} from 'lucide-react';
import { Order, OrderReturn, OrderRefund, OrderExchange, Product } from '../../types';

interface OrderReturnsRefundsProps {
  orders: Order[];
  products: Product[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  tabRole: 'returns' | 'refunds' | 'exchanges';
}

export default function OrderReturnsRefunds({
  orders,
  products,
  updateOrderStatus,
  tabRole
}: OrderReturnsRefundsProps) {
  // Shared States (mock dbs in localStorage loaded)
  const [returnsList, setReturnsList] = useState<OrderReturn[]>(() => {
    const saved = localStorage.getItem('ttgt_returns_db');
    if (saved) return JSON.parse(saved);
    // Seed standard return
    return [
      {
        id: 'RET-101',
        orderId: 'SO-20260620-1001',
        returnRequestNo: 'RMA948203',
        reason: 'Incorrect unit size delivered',
        pickupAddress: 'Gala 4, Sector 7, Vashi Industrial Area, Maharashtra',
        pickupPinCode: '400703',
        returnedQuantity: 2,
        status: 'Requested',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1050).toISOString()
      }
    ];
  });

  const [refundsList, setRefundsList] = useState<OrderRefund[]>(() => {
    const saved = localStorage.getItem('ttgt_refunds_db');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'REF-201',
        orderId: 'SO-20260620-1001',
        refundRequestNo: 'RFD110482',
        amount: 1700.00,
        method: 'Original Payment Mode',
        status: 'Pending Approval',
        reason: 'Customer requested cancellation during packing',
        requestedBy: 'operations@ttgt.com',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 65 * 1000).toISOString()
      }
    ];
  });

  const [exchangesList, setExchangesList] = useState<OrderExchange[]>(() => {
    const saved = localStorage.getItem('ttgt_exchanges_db');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Sync to local storage
  const syncReturns = (list: OrderReturn[]) => {
    setReturnsList(list);
    localStorage.setItem('ttgt_returns_db', JSON.stringify(list));
  };

  const syncRefunds = (list: OrderRefund[]) => {
    setRefundsList(list);
    localStorage.setItem('ttgt_refunds_db', JSON.stringify(list));
  };

  const syncExchanges = (list: OrderExchange[]) => {
    setExchangesList(list);
    localStorage.setItem('ttgt_exchanges_db', JSON.stringify(list));
  };

  // Form states to initiate workflows
  const [showForm, setShowForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [returnReason, setReturnReason] = useState('Damaged during transit');
  const [returnQty, setReturnQty] = useState(1);
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundMethod, setRefundMethod] = useState<OrderRefund['method']>('Original Payment Mode');
  const [exchangeSku, setExchangeSku] = useState('');

  // Conduct Return pickups / inspections
  const handleApproveReturnPickup = (retId: string) => {
    const updated = returnsList.map(r => {
      if (r.id === retId) {
        return { ...r, status: 'Pickup Scheduled' as const };
      }
      return r;
    });
    syncReturns(updated);
    alert('✓ Delhivery Return Pickup reverse allocation triggered. Shipping label docket transmitted to rider.');
  };

  const handleInspectRestockReturn = (retId: string, approved: boolean) => {
    const updated = returnsList.map(r => {
      if (r.id === retId) {
        return { 
          ...r, 
          status: approved ? 'Inspected & Restocked' as const : 'Rejected' as const,
          inspectionNotes: approved ? 'Item verified intact, added back to A5 inventory bins.' : 'Damaged shell, scrap heap write-off logged.'
        };
      }
      return r;
    });
    syncReturns(updated);
    
    // If restocked, update order status if needed
    const retItem = returnsList.find(r => r.id === retId);
    if (retItem) {
      updateOrderStatus(retItem.orderId, 'Returned');
    }

    alert(approved ? '✓ Cargo inspected! Restocked units successfully compiled under physical warehouse.' : '❌ Mismatch detected. Return request rejected.');
  };

  // Refunds approval
  const handleApproveRefund = (refId: string) => {
    const matched = refundsList.find(r => r.id === refId);
    if (!matched) return;

    // Simulate trigger transaction payout
    const updated = refundsList.map(r => {
      if (r.id === refId) {
        return { 
          ...r, 
          status: 'Refunded' as const, 
          referenceNo: `TX_INRE_REF_${Math.floor(10000000 + Math.random() * 90000000)}`,
          approvedBy: 'accounts_supervisor@ttgt.com'
        };
      }
      return r;
    });
    syncRefunds(updated);

    updateOrderStatus(matched.orderId, 'Refunded');
    alert(`✓ Refund verified & approved. Dispatched ₹${matched.amount} back via original channel gateway routing.`);
  };

  const handleCreateReturnRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = orders.find(o => o.id === selectedOrderId);
    if (!ord) return;

    const newRet: OrderReturn = {
      id: `RET-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: ord.id,
      returnRequestNo: `RMA${Math.floor(100000 + Math.random() * 900000)}`,
      reason: returnReason,
      pickupAddress: ord.shippingAddress,
      pickupPinCode: ord.shippingPinCode,
      returnedQuantity: returnQty,
      status: 'Requested',
      timestamp: new Date().toISOString()
    };

    syncReturns([newRet, ...returnsList]);
    updateOrderStatus(ord.id, 'Returned');
    setShowForm(false);
    alert(`✓ Return Reverse RMA ${newRet.returnRequestNo} registered for Order ${ord.id}. Ready for schedule.`);
  };

  const handleCreateRefundRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = orders.find(o => o.id === selectedOrderId);
    if (!ord) return;

    const newRef: OrderRefund = {
      id: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
      orderId: ord.id,
      refundRequestNo: `RFD${Math.floor(100000 + Math.random() * 900000)}`,
      amount: refundAmount || ord.grandTotal,
      method: refundMethod,
      status: 'Pending Approval',
      reason: returnReason,
      requestedBy: 'operations@ttgt.com',
      timestamp: new Date().toISOString()
    };

    syncRefunds([newRef, ...refundsList]);
    setShowForm(false);
    alert(`✓ Payout refund voucher ${newRef.refundRequestNo} logged at Finance verification portal.`);
  };

  const handleCreateExchangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const ord = orders.find(o => o.id === selectedOrderId);
    if (!ord) return;

    const newEx: OrderExchange = {
      id: `EX-${Math.floor(10000 + Math.random() * 90000)}`,
      originalOrderId: ord.id,
      exchangeOrderId: `SO-EX-${Math.floor(100000 + Math.random() * 900000)}`,
      replacementSku: exchangeSku || 'EL-HDMI-10M',
      replacementQuantity: returnQty,
      reason: returnReason,
      status: 'Pending Dispatch',
      timestamp: new Date().toISOString()
    };

    syncExchanges([newEx, ...exchangesList]);
    setShowForm(false);
    alert(`🔄 Exchange shipment assigned! Created new replacement delivery docket: ${newEx.exchangeOrderId}.`);
  };

  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  return (
    <div className="space-y-6">

      {/* Control row */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
        <div>
          <h3 className="font-bold text-neutral-800 text-sm uppercase font-mono tracking-wider">
            {tabRole === 'returns' ? 'RMA Returns Administration panel' : 
             tabRole === 'refunds' ? 'Fulfillment Ledger Refunds Board' : 'Exchange Cargo Linker'}
          </h3>
          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
            {tabRole === 'returns' ? 'Reverse pick-up logistics & ground restock inspector logs' : 
             tabRole === 'refunds' ? 'Payment gateway cash settlement & approval ledgers' : 'Cross-referenced original vs exchange orders'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-neutral-900 text-white font-sans text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1 hover:bg-neutral-850"
        >
          <span>Initiate {tabRole === 'returns' ? 'Return Workflow' : tabRole === 'refunds' ? 'Refund Voucher' : 'Sku Exchange'}</span>
        </button>
      </div>

      {/* Main listings list */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        
        {/* RETURNS DISPLAY */}
        {tabRole === 'returns' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                  <th className="py-3 px-4">RMA / Request No</th>
                  <th className="py-3 px-4">Original Order</th>
                  <th className="py-3 px-4">Return Reason</th>
                  <th className="py-3 px-4">Pickup Zipcode</th>
                  <th className="py-3 px-4 text-center">RMA Status</th>
                  <th className="py-3 px-4 text-center">Fulfill Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {returnsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-neutral-400 italic">No reverse RMA returns registered.</td>
                  </tr>
                ) : (
                  returnsList.map(ret => (
                    <tr key={ret.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800 text-xs">
                        {ret.returnRequestNo}
                      </td>
                      <td className="py-3 px-4 font-mono">{ret.orderId}</td>
                      <td className="py-3 px-4 leading-normal">{ret.reason} (Qty: {ret.returnedQuantity})</td>
                      <td className="py-3 px-4 font-mono">{ret.pickupPinCode}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                          ret.status === 'Requested' ? 'bg-blue-100 text-blue-800' :
                          ret.status === 'Pickup Scheduled' ? 'bg-amber-100 text-amber-800' :
                          ret.status === 'Inspected & Restocked' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-150 text-red-800'
                        }`}>
                          {ret.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center select-none">
                        <div className="flex justify-center items-center gap-1">
                          {ret.status === 'Requested' && (
                            <button
                              onClick={() => handleApproveReturnPickup(ret.id)}
                              className="bg-[#FAF9F6] border px-2 py-1 rounded text-[10px] font-mono font-bold hover:bg-neutral-100"
                            >
                              Dispatch Delhivery reverse
                            </button>
                          )}
                          {ret.status === 'Pickup Scheduled' && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleInspectRestockReturn(ret.id, true)}
                                className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-mono font-bold hover:bg-emerald-700"
                              >
                                QC Pass & Restock
                              </button>
                              <button
                                onClick={() => handleInspectRestockReturn(ret.id, false)}
                                className="bg-rose-50 text-rose-700 border px-1.5 py-1 rounded text-[10px] hover:bg-rose-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {ret.status === 'Inspected & Restocked' && (
                            <span className="text-[10px] text-emerald-600 font-bold font-mono">Restock Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REFUNDS DISPLAY */}
        {tabRole === 'refunds' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                  <th className="py-3 px-4">Refund Request ID</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4 text-right">Value (INR)</th>
                  <th className="py-3 px-4 font-mono">Channel / Method</th>
                  <th className="py-3 px-4 text-center">Approv. Status</th>
                  <th className="py-3 px-4 text-center">Fulfill Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {refundsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-neutral-400 italic">No refund ledgers registered.</td>
                  </tr>
                ) : (
                  refundsList.map(ref => (
                    <tr key={ref.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800 text-xs">
                        {ref.refundRequestNo}
                      </td>
                      <td className="py-3 px-4 font-mono">{ref.orderId}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{formatINR(ref.amount)}</td>
                      <td className="py-3 px-4 font-mono">{ref.method}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                          ref.status === 'Pending Approval' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center select-none">
                        {ref.status === 'Pending Approval' ? (
                          <button
                            onClick={() => handleApproveRefund(ref.id)}
                            className="bg-neutral-900 border hover:bg-neutral-850 text-white font-bold px-2.5 py-1 rounded text-[10px] font-mono"
                          >
                            Approve & Pay Out
                          </button>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-emerald-600 block font-bold font-mono">Paid</span>
                            <span className="text-[8px] font-mono text-neutral-400 block">{ref.referenceNo}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* EXCHANGES DISPLAY */}
        {tabRole === 'exchanges' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                  <th className="py-3 px-4">Exchange Link ID</th>
                  <th className="py-3 px-4">Original Order</th>
                  <th className="py-3 px-4">Replacement Order No</th>
                  <th className="py-3 px-4">SKU / Item Details</th>
                  <th className="py-3 px-4 text-center">Exchange Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {exchangesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-neutral-400 italic">No replacement exchanges active in this cycle.</td>
                  </tr>
                ) : (
                  exchangesList.map(exch => (
                    <tr key={exch.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800 text-xs">{exch.id}</td>
                      <td className="py-3 px-4 font-mono">{exch.originalOrderId}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{exch.exchangeOrderId}</td>
                      <td className="py-3 px-4 font-mono">{exch.replacementSku} (Qty: {exch.replacementQuantity})</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 font-mono uppercase">
                          {exch.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Dynamic Creation Drawer Modals depending on tabs */}
      {showForm && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border text-left">
            <div className="flex justify-between items-center border-b pb-3 mb-4 select-none">
              <span className="text-xs uppercase bg-neutral-100 text-neutral-650 px-2 py-0.5 rounded font-bold font-mono">
                Initiate {tabRole === 'returns' ? 'RMA Return' : tabRole === 'refunds' ? 'Payment Refund' : 'Catalog Replacement'}
              </span>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-700 bg-neutral-50 rounded-full p-1">
                <X size={15} />
              </button>
            </div>

            {/* RETURNS FORM */}
            {tabRole === 'returns' && (
              <form onSubmit={handleCreateReturnRequest} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Select Sales Invoice Order</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full border rounded p-2 text-xs bg-neutral-50 outline-none"
                  >
                    <option value="">-- Choose matching client --</option>
                    {orders.filter(o => o.status === 'Delivered').map(o => (
                      <option key={o.id} value={o.id}>{o.id} | {o.customerName} (₹{o.grandTotal})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">RMA Qty</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={returnQty}
                      onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                      className="w-full border rounded p-2 text-xs bg-neutral-50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">RMA Action Type</label>
                    <span className="w-full border rounded p-2 text-xs bg-neutral-150 block truncate leading-none pt-2.5">Reverse Delhivery</span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full border rounded p-2 text-xs bg-neutral-50"
                  >
                    <option value="Incorrect unit size delivered">Incorrect unit size delivered</option>
                    <option value="Physical package cracked/damaged during courier transit">Physical package cracked/damaged during transit</option>
                    <option value="Customer cancelled contract after delivery">Customer cancelled contract</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded text-xs font-bold font-sans">
                  Generate RMA Reverse Task
                </button>
              </form>
            )}

            {/* REFUNDS FORM */}
            {tabRole === 'refunds' && (
              <form onSubmit={handleCreateRefundRequest} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Select Order Target</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full border rounded p-2 text-xs bg-neutral-50 outline-none"
                  >
                    <option value="">-- Choose order account --</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} | {o.customerName} (₹{o.grandTotal})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Refund Amount (INR)</label>
                  <input
                    type="number"
                    value={refundAmount}
                    placeholder="Leave empty for full invoice refund value"
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded p-2 text-xs bg-neutral-50 text-neutral-700"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Reversal payout route</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full border rounded p-2 text-xs bg-neutral-50"
                  >
                    <option value="Original Payment Mode">Original Payment Mode (UPI Gateway)</option>
                    <option value="Bank Transfer">Bank Direct Transfer (NEFT/IMPS)</option>
                    <option value="Store Credit">Store Credit / Client Wallet Ledger</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded text-xs font-bold font-sans">
                  Submit Refund Verification Voucher
                </button>
              </form>
            )}

            {/* EXCHANGES FORM */}
            {tabRole === 'exchanges' && (
              <form onSubmit={handleCreateExchangeRequest} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Source Delivered Order ID</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    required
                    className="w-full border rounded p-2 text-xs bg-neutral-50"
                  >
                    <option value="">-- Choose delivered docket --</option>
                    {orders.filter(o => o.status === 'Delivered').map(o => (
                      <option key={o.id} value={o.id}>{o.id} | {o.customerName}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Replacement SKU</label>
                    <select
                      value={exchangeSku}
                      onChange={(e) => setExchangeSku(e.target.value)}
                      required
                      className="w-full border rounded p-2 text-xs bg-neutral-50"
                    >
                      <option value="">-- Choose catalog catalog --</option>
                      {products.map(p => <option key={p.id} value={p.sku}>{p.sku} | {p.name.substring(0, 20)}...</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={returnQty}
                      onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                      className="w-full border rounded p-2 text-xs bg-neutral-50"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded text-xs font-bold font-sans">
                  Validate Replacement Exchange Log
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
