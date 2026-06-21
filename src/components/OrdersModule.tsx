import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  Hand, 
  Package, 
  Truck, 
  Send, 
  CheckSquare, 
  XCircle, 
  RotateCcw, 
  DollarSign, 
  Repeat, 
  History, 
  FileText,
  Barcode,
  Printer,
  X,
  Workflow
} from 'lucide-react';
import { Order, Product, CompanySettings } from '../types';

// Importing sub-modules
import OrderDashboard from './orders/OrderDashboard';
import OrderList from './orders/OrderList';
import OrderPickPackQC from './orders/OrderPickPackQC';
import OrderReturnsRefunds from './orders/OrderReturnsRefunds';
import OrderTimelineAudit from './orders/OrderTimelineAudit';

interface OrdersModuleProps {
  orders: Order[];
  products: Product[];
  companySettings: CompanySettings;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderShipping: (id: string, carrier: Order['courierPartner'], awb: string, eway?: string) => void;
  searchQuery: string;
}

export default function OrdersModule({
  orders: parentOrders,
  products,
  companySettings,
  updateOrderStatus: parentUpdateStatus,
  updateOrderShipping: parentUpdateShipping,
  searchQuery
}: OrdersModuleProps) {
  
  // Track Active Sub-View of OMS
  const [activeOmsTab, setActiveOmsTab] = useState('dashboard');

  // Track manual orders added locally in OMS
  const [localOrders, setLocalOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('local_added_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Track Active selected Invoice overlay
  const [viewInvoiceOrder, setViewInvoiceOrder] = useState<Order | null>(null);

  // Merge parent static seed orders with local manually created B2B/B2C ones
  const combinedOrders = [...parentOrders, ...localOrders];

  // Helper inside OMS to add a manual order
  const handleAddManualOrder = (newOrder: Order) => {
    const updated = [newOrder, ...localOrders];
    setLocalOrders(updated);
    localStorage.setItem('local_added_orders', JSON.stringify(updated));
  };

  // Status update wrapper that supports either updating parent state or local state
  const handleUpdateOrderStatus = (id: string, status: Order['status']) => {
    // 1. Is it a parent order?
    if (parentOrders.some(o => o.id === id)) {
      parentUpdateStatus(id, status);
    } else {
      // 2. Otherwise update local state
      const updated = localOrders.map(o => {
        if (o.id === id) {
          let invNo = o.invoiceNumber;
          let invDate = o.invoiceDate;

          if (status === 'Packed' && !o.invoiceNumber) {
            invNo = 'TTGT-2627-' + Math.floor(1100 + Math.random() * 8800).toString();
            invDate = new Date().toISOString();
          }
          return { ...o, status, invoiceNumber: invNo, invoiceDate: invDate };
        }
        return o;
      });
      setLocalOrders(updated);
      localStorage.setItem('local_added_orders', JSON.stringify(updated));
    }
  };

  // Shipping details update wrapper
  const handleUpdateOrderShipping = (id: string, carrier: Order['courierPartner'], awb: string, eway?: string) => {
    if (parentOrders.some(o => o.id === id)) {
      parentUpdateShipping(id, carrier, awb, eway);
    } else {
      const updated = localOrders.map(o => {
        if (o.id === id) {
          return { ...o, courierPartner: carrier, awbNumber: awb, ewayBillNumber: eway };
        }
        return o;
      });
      setLocalOrders(updated);
      localStorage.setItem('local_added_orders', JSON.stringify(updated));
    }
  };

  // Counter helper for badges on nested sidebar
  const getBadgeCount = (statusKey: string) => {
    if (statusKey === 'all') return combinedOrders.length;
    if (statusKey === 'pending') {
      return combinedOrders.filter(o => o.status === 'Pending' || o.status === 'New Order' || o.status === 'Pending Confirmation').length;
    }
    if (statusKey === 'confirmed') {
      return combinedOrders.filter(o => o.status === 'Confirmed' || o.status === 'Inventory Reserved').length;
    }
    if (statusKey === 'picking') return combinedOrders.filter(o => o.status === 'Picking').length;
    if (statusKey === 'packing') return combinedOrders.filter(o => o.status === 'Packing' || o.status === 'Quality Check').length;
    if (statusKey === 'ready_to_dispatch') return combinedOrders.filter(o => o.status === 'Ready To Dispatch' || o.status === 'Courier Assigned').length;
    if (statusKey === 'dispatched') return combinedOrders.filter(o => o.status === 'Dispatched' || o.status === 'In Transit' || o.status === 'Out For Delivery').length;
    if (statusKey === 'delivered') return combinedOrders.filter(o => o.status === 'Delivered' || o.status === 'Closed').length;
    if (statusKey === 'cancelled') return combinedOrders.filter(o => o.status === 'Cancelled').length;
    return 0;
  };

  // Sidebar link details
  const omsSidebarLinks = [
    { id: 'dashboard', label: 'Order Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'All Orders', icon: Inbox, badge: getBadgeCount('all') },
    
    // Status folders
    { id: 'pending', label: 'Pending Orders', icon: Clock, badge: getBadgeCount('pending') },
    { id: 'confirmed', label: 'Confirmed Orders', icon: CheckCircle2, badge: getBadgeCount('confirmed') },
    { id: 'picking', label: 'Picking Unit', icon: Hand, badge: getBadgeCount('picking') },
    { id: 'packing', label: 'Packing Desk', icon: Package, badge: getBadgeCount('packing') },
    { id: 'ready_to_dispatch', label: 'Ready To Dispatch', icon: Send, badge: getBadgeCount('ready_to_dispatch') },
    { id: 'dispatched', label: 'Dispatched Transit', icon: Truck, badge: getBadgeCount('dispatched') },
    { id: 'delivered', label: 'Delivered Lock', icon: CheckSquare, badge: getBadgeCount('delivered') },
    { id: 'cancelled', label: 'Cancelled Void', icon: XCircle, badge: getBadgeCount('cancelled') },
    
    // Customer reversals
    { id: 'returned', label: 'Returned RMAs', icon: RotateCcw },
    { id: 'refunds', label: 'Refund ledgers', icon: DollarSign },
    { id: 'exchanges', label: 'Exchange Links', icon: Repeat },
    
    // Historical
    { id: 'timeline', label: 'Order Timeline', icon: History },
    { id: 'audit_logs', label: 'Order Audit Logs', icon: FileText }
  ];

  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      
      {/* Collapsible/Sticky Left Sub-Sidebar for OMS */}
      <div className="w-full lg:w-64 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm shrink-0 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="pb-3 border-b">
            <span className="text-[10px] font-black tracking-wider text-neutral-400 font-mono uppercase block">OMS Sub-Navigation</span>
            <h2 className="font-bold text-neutral-900 text-sm mt-0.5 font-sans">Enterprise Order Hub</h2>
          </div>

          <div className="space-y-1">
            {omsSidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeOmsTab === link.id;
              return (
                <button
                  key={link.id}
                  id={`oms-nav-${link.id}`}
                  onClick={() => setActiveOmsTab(link.id)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition group select-none ${
                    isActive 
                      ? 'bg-neutral-900 text-white' 
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon size={14} className={isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700'} />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                      isActive ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t select-none text-[10px] text-neutral-400 font-mono leading-relaxed">
          <Workflow size={12} className="text-orange-500 mb-1 inline" />
          <p>Local time: <strong>2026-06-20</strong></p>
          <p>Sync rate: <strong>API Handshake live</strong></p>
        </div>
      </div>

      {/* Main active sub-view layout panel */}
      <div className="flex-1 min-w-0">
        
        {activeOmsTab === 'dashboard' && (
          <OrderDashboard 
            orders={combinedOrders} 
            onNavigate={(tab) => setActiveOmsTab(tab)} 
          />
        )}

        {/* Status folder routings redirected to OrderList with appropriate status parameters */}
        {['all', 'pending', 'confirmed', 'ready_to_dispatch', 'dispatched', 'delivered', 'cancelled'].includes(activeOmsTab) && (
          <OrderList 
            orders={combinedOrders}
            products={products}
            companySettings={companySettings}
            updateOrderStatus={handleUpdateOrderStatus}
            updateOrderShipping={handleUpdateOrderShipping}
            onAddManualOrder={handleAddManualOrder}
            searchQuery={searchQuery}
            onPrintInvoice={(ord) => setViewInvoiceOrder(ord)}
            filterStatusPre={
              activeOmsTab === 'pending' ? 'Pending' :
              activeOmsTab === 'confirmed' ? 'Confirmed' :
              activeOmsTab === 'ready_to_dispatch' ? 'Ready To Dispatch' :
              activeOmsTab === 'dispatched' ? 'Dispatched' :
              activeOmsTab === 'delivered' ? 'Delivered' :
              activeOmsTab === 'cancelled' ? 'Cancelled' : 'All'
            }
          />
        )}

        {/* Handlers for Picking, Packing, and QC console tab views */}
        {['picking', 'packing', 'qc'].includes(activeOmsTab) && (
          <OrderPickPackQC 
            orders={combinedOrders}
            products={products}
            updateOrderStatus={handleUpdateOrderStatus}
            updateOrderShipping={handleUpdateOrderShipping}
            activeFulfillmentTab={activeOmsTab === 'picking' ? 'picking' : activeOmsTab === 'packing' ? 'packing' : 'qc'}
            onNavigateFulfillment={(tab) => setActiveOmsTab(tab)}
          />
        )}

        {/* Handlers for customer returns, refunds, and exchange list views */}
        {['returned', 'refunds', 'exchanges'].includes(activeOmsTab) && (
          <OrderReturnsRefunds 
            orders={combinedOrders}
            products={products}
            updateOrderStatus={handleUpdateOrderStatus}
            tabRole={activeOmsTab === 'returned' ? 'returns' : activeOmsTab === 'refunds' ? 'refunds' : 'exchanges'}
          />
        )}

        {/* Actions for timelines or auditor registers */}
        {['timeline', 'audit_logs'].includes(activeOmsTab) && (
          <OrderTimelineAudit 
            orders={combinedOrders}
            tabRole={activeOmsTab === 'timeline' ? 'timeline' : 'audit_logs'}
          />
        )}

      </div>

      {/* Renders tax printable GST compliant B2B Invoice overlay */}
      {viewInvoiceOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div id="tax-invoice-container" className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-8 font-sans border border-neutral-300 relative text-left">
            
            {/* Control Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-4 select-none">
              <span className="text-xs bg-orange-100 text-orange-850 font-bold px-2.5 py-1 rounded font-mono">Compliant GST Invoice Generator</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-850 flex items-center"
                >
                  <Printer size={13} className="mr-1.5" />
                  Print In House
                </button>
                <button
                  onClick={() => setViewInvoiceOrder(null)}
                  className="bg-neutral-100 text-neutral-600 text-xs px-3 py-2 rounded-lg hover:bg-neutral-200 font-semibold"
                >
                  Dismiss Invoice
                </button>
              </div>
            </div>

            {/* Statutory Compliant Tax Invoice Body */}
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="text-center">
                <h1 className="text-2xl font-black uppercase text-neutral-900 tracking-tight">Tax Invoice</h1>
                <p className="text-[10px] text-neutral-400 font-mono tracking-wide">[Issued under Rule 46 of CGST Rules, 2017]</p>
              </div>

              {/* Shipper & Consignee Ledger lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-t border-neutral-300 py-4 text-xs font-mono">
                
                {/* Shipper details */}
                <div className="space-y-1">
                  <span className="text-neutral-400 uppercase font-bold text-[10px] block">Shipper (Supplier Details)</span>
                  <strong className="text-sm font-sans font-bold text-neutral-900 block">{companySettings.companyName}</strong>
                  <p className="text-neutral-505 leading-snug">{companySettings.addressLines}, {companySettings.city}, {companySettings.state} - {companySettings.pinCode}</p>
                  <p className="text-neutral-800">GSTIN: <strong>{companySettings.gstin}</strong></p>
                  <p className="text-neutral-800">PAN: <strong>{companySettings.pan}</strong> | CIN: {companySettings.cin}</p>
                </div>
                
                {/* Customer Details */}
                <div className="space-y-1 border-l border-neutral-200 pl-6">
                  <span className="text-neutral-400 uppercase font-bold text-[10px] block">Consignee (Bill To / Ship To)</span>
                  <strong className="text-sm font-sans font-bold text-neutral-900 block">{viewInvoiceOrder.customerName}</strong>
                  <p className="text-neutral-505 leading-snug">{viewInvoiceOrder.shippingAddress}, PIN: {viewInvoiceOrder.shippingPinCode}</p>
                  <p className="text-neutral-800">Place of Supply State: <strong>{viewInvoiceOrder.customerState}</strong></p>
                  <p className="text-neutral-800">GSTIN: <strong>{viewInvoiceOrder.customerGstin || 'Unregistered Retail'}</strong></p>
                  {viewInvoiceOrder.customerMobile && <p className="text-neutral-800">Phone: <strong>{viewInvoiceOrder.customerMobile}</strong></p>}
                </div>

              </div>

              {/* Invoice Particulars Grid block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-[#FAF9F6] p-3 rounded-lg border">
                <div>
                  <span className="text-neutral-400 block">Invoice Number</span>
                  <strong className="text-neutral-800 font-sans">{viewInvoiceOrder.invoiceNumber || 'Draft Invoice'}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">Date of Issue</span>
                  <strong className="text-neutral-800">
                    {viewInvoiceOrder.invoiceDate ? new Date(viewInvoiceOrder.invoiceDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">AWB Transit Waybill No</span>
                  <strong className="text-neutral-800">{viewInvoiceOrder.awbNumber || 'Pending pickup assignment'}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block">e-Way Bill Reference No</span>
                  <strong className="text-neutral-800">{viewInvoiceOrder.ewayBillNumber || 'Exempt (&lt; 50k / intra)'}</strong>
                </div>
              </div>

              {/* Items calculations */}
              <div className="border border-neutral-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-600 border-b border-neutral-300 text-[10px] uppercase">
                      <th className="py-2 px-2 border-r border-neutral-300 w-8 text-center">No.</th>
                      <th className="py-2 px-2 border-r border-neutral-300">Description of SKU</th>
                      <th className="py-2 px-2 border-r border-neutral-300 w-16 text-center">HSN</th>
                      <th className="py-2 px-2 border-r border-neutral-300 w-12 text-right">Qty</th>
                      <th className="py-2 px-2 border-r border-neutral-300 w-20 text-right">Rate</th>
                      <th className="py-2 px-2 border-r border-neutral-300 w-14 text-right">GST %</th>
                      {viewInvoiceOrder.customerState === companySettings.state ? (
                        <>
                          <th className="py-2 px-2 border-r border-neutral-300 w-24 text-right">CGST Amt</th>
                          <th className="py-2 px-2 border-r border-neutral-300 w-24 text-right">SGST Amt</th>
                        </>
                      ) : (
                        <th className="py-2 px-2 border-r border-neutral-300 w-24 text-right">IGST Amt</th>
                      )}
                      <th className="py-2 px-2 text-right w-24">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {viewInvoiceOrder.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2 border-r border-neutral-300 text-center">{idx + 1}</td>
                        <td className="py-2 px-2 border-r border-neutral-300 font-sans font-semibold text-neutral-800 max-w-xs">{item.productName}</td>
                        <td className="py-2 px-2 border-r border-neutral-300 text-center">{item.hsnCode}</td>
                        <td className="py-2 px-2 border-r border-neutral-300 text-right font-bold">{item.quantity}</td>
                        <td className="py-2 px-2 border-r border-neutral-300 text-right">₹{item.unitPrice}</td>
                        <td className="py-2 px-2 border-r border-neutral-300 text-right">{item.gstRate}%</td>
                        {viewInvoiceOrder.customerState === companySettings.state ? (
                          <>
                            <td className="py-2 px-2 border-r border-neutral-300 text-right">₹{item.cgstAmount.toFixed(2)}</td>
                            <td className="py-2 px-2 border-r border-neutral-300 text-right">₹{item.sgstAmount.toFixed(2)}</td>
                          </>
                        ) : (
                          <td className="py-2 px-2 border-r border-neutral-300 text-right">₹{item.igstAmount.toFixed(2)}</td>
                        )}
                        <td className="py-2 px-2 text-right text-neutral-950 font-bold font-sans">
                          ₹{item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations ledger bottom block */}
              <div className="flex justify-between items-start pt-4 border-t border-dashed border-neutral-300 text-xs">
                
                {/* Declarations legal notes */}
                <div className="w-1/2 space-y-1.5 font-mono text-[10px] text-neutral-400">
                  <span className="font-bold uppercase text-neutral-600 block">Terms & declarations:</span>
                  <p>1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and absolute master-logged.</p>
                  <p>2. Governed under standard Maharashtra state jurisidictionary procedures.</p>
                  <p>3. Dynamic UPI matching active. Scan QR code to complete immediate payment reconciliation with zero delays.</p>
                </div>

                {/* Calculations ledger values */}
                <div className="w-96 font-mono text-xs space-y-2 border border-neutral-200 p-4 bg-neutral-50 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Taxable amount Excl. Tax:</span>
                    <strong className="text-neutral-700">₹{viewInvoiceOrder.totalBeforeTax.toFixed(2)}</strong>
                  </div>
                  {viewInvoiceOrder.customerState === companySettings.state ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Add Central CGST Amt:</span>
                        <strong className="text-neutral-700">₹{viewInvoiceOrder.totalCgst?.toFixed(2) || '0.00'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Add State SGST Amt:</span>
                        <strong className="text-neutral-700">₹{viewInvoiceOrder.totalSgst?.toFixed(2) || '0.00'}</strong>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Add Integrated IGST Amt:</span>
                      <strong className="text-neutral-700">₹{viewInvoiceOrder.totalIgst?.toFixed(2) || '0.00'}</strong>
                    </div>
                  )}
                  {viewInvoiceOrder.totalRounding !== 0 && (
                    <div className="flex justify-between text-[11px] text-neutral-450 border-t border-dashed pt-1.5">
                      <span>Rupee Adjustments Rounding:</span>
                      <span>₹{viewInvoiceOrder.totalRounding?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-neutral-900 text-sm font-sans">
                    <span className="text-orange-600 font-bold">Total Invoice Value (INR):</span>
                    <strong>{formatINR(viewInvoiceOrder.grandTotal)}</strong>
                  </div>
                </div>

              </div>

              {/* Bottom statutory qr and signer block */}
              <div className="flex justify-between items-end border-t border-neutral-300 pt-6 font-mono text-xs select-none">
                <div className="flex flex-col items-center p-3 bg-[#FAF9F6] border border-neutral-250 rounded">
                  <Barcode className="text-neutral-400 mb-1" size={32} />
                  <span className="text-[8px] text-neutral-450">Statutory GSTIN QR VERIFIED</span>
                </div>
                
                <div className="text-center font-bold text-neutral-600 w-64 space-y-2">
                  <div className="font-sans font-light italic text-orange-650 text-base border-b border-dashed border-neutral-300 pb-3">
                    [Digitally Authenticated Certificate]
                  </div>
                  <span className="text-[10px] uppercase text-neutral-400 block font-normal">Authorized signatory for {companySettings.companyName}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
