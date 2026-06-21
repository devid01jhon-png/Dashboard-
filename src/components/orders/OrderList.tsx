import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  FileCheck, 
  Printer, 
  FileCode, 
  Download, 
  Plus, 
  X, 
  Eye, 
  FileText, 
  Percent, 
  Coins, 
  CheckCircle,
  Truck, 
  AlertTriangle 
} from 'lucide-react';
import { Order, Product, CompanySettings } from '../../types';

interface OrderListProps {
  orders: Order[];
  products: Product[];
  companySettings: CompanySettings;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrderShipping: (id: string, carrier: Order['courierPartner'], awb: string, eway?: string) => void;
  onAddManualOrder: (newOrder: Order) => void;
  searchQuery: string;
  onPrintInvoice: (order: Order) => void;
  filterStatusPre?: string;
}

export default function OrderList({
  orders,
  products,
  companySettings,
  updateOrderStatus,
  updateOrderShipping,
  onAddManualOrder,
  searchQuery: globalSearch,
  onPrintInvoice,
  filterStatusPre = 'All'
}: OrderListProps) {
  // Filters State
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [filterMarketplace, setFilterMarketplace] = useState('All');
  const [filterStatus, setFilterStatus] = useState(filterStatusPre);
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterWarehouse, setFilterWarehouse] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterType, setFilterType] = useState('All'); // Retail vs B2B

  // Selected Order for side drawer lookup
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  // Bulk operation selection state
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Manual Add Order Flow
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustState, setNewCustState] = useState('Maharashtra');
  const [newShipAddress, setNewShipAddress] = useState('');
  const [newShipPin, setNewShipPin] = useState('');
  const [newPayMode, setNewPayMode] = useState<Order['paymentMode']>('Prepaid');
  const [newWarehouse, setNewWarehouse] = useState('Warehouse Alpha');
  const [newPriority, setNewPriority] = useState<Order['priority']>('Medium');
  const [newSource, setNewSource] = useState<Order['marketplace']>('Direct Channel');

  // Manual Order Lines State
  const [orderLines, setOrderLines] = useState<Array<{
    product: Product;
    quantity: number;
    customPrice?: number;
    discountPercent: number;
  }>>([]);

  const [activeSelectedProductId, setActiveSelectedProductId] = useState('');
  const [activeSelectedQty, setActiveSelectedQty] = useState(1);
  const [activeSelectedDiscount, setActiveSelectedDiscount] = useState(0);

  // Verification Flags
  const [mobileError, setMobileError] = useState('');
  const [pinError, setPinError] = useState('');
  const [gstinError, setGstinError] = useState('');

  const formatINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(num);
  };

  // Indian Address list check
  const stateList = [
    'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
    'West Bengal', 'Haryana', 'Andhra Pradesh', 'Telangana', 'Uttar Pradesh',
    'Rajasthan', 'Kerala', 'Madhya Pradesh', 'Punjab', 'Bihar'
  ];

  // HSN list lookup logic or mapping
  const getProductHsnAndGst = (prod: Product) => {
    return {
      hsn: prod.hsnCode || '85444299',
      gst: prod.gstRate || 18
    };
  };

  // Line calculations helper
  const handleAddLine = () => {
    const p = products.find(prod => prod.id === activeSelectedProductId);
    if (!p) return;

    // Check duplicate
    if (orderLines.some(l => l.product.id === p.id)) {
      alert('Product already added to line entries. Modify quantity or delete to recreate.');
      return;
    }

    setOrderLines([...orderLines, {
      product: p,
      quantity: activeSelectedQty,
      discountPercent: activeSelectedDiscount
    }]);

    setActiveSelectedProductId('');
    setActiveSelectedQty(1);
    setActiveSelectedDiscount(0);
  };

  const handleRemoveLine = (idx: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== idx));
  };

  // Live total estimates
  const computeTotals = () => {
    let rawTaxableTotal = 0;
    let computedCgstSum = 0;
    let computedSgstSum = 0;
    let computedIgstSum = 0;
    let computedTaxSum = 0;

    const lineItemsComputed = orderLines.map((line, i) => {
      const { gst, hsn } = getProductHsnAndGst(line.product);
      const baseVal = line.customPrice || line.product.sellingPrice;
      const totalAmountBeforeDiscount = baseVal * line.quantity;
      const discountAmt = totalAmountBeforeDiscount * (line.discountPercent / 100);
      const netTaxableVal = totalAmountBeforeDiscount - discountAmt;

      // GST is inclusive or exclusive? Standard simple model: exclusive
      const taxVal = netTaxableVal * (gst / 100);
      const subTotalVal = netTaxableVal + taxVal;

      rawTaxableTotal += netTaxableVal;
      computedTaxSum += taxVal;

      let lineCgst = 0;
      let lineSgst = 0;
      let lineIgst = 0;

      if (newCustState === companySettings.state) {
        lineCgst = taxVal / 2;
        lineSgst = taxVal / 2;
        computedCgstSum += lineCgst;
        computedSgstSum += lineSgst;
      } else {
        lineIgst = taxVal;
        computedIgstSum += lineIgst;
      }

      return {
        id: `item-${Date.now()}-${i}`,
        productId: line.product.id,
        productName: line.product.name,
        sku: line.product.sku,
        quantity: line.quantity,
        unitPrice: baseVal,
        hsnCode: hsn,
        gstRate: gst,
        cgstAmount: lineCgst,
        sgstAmount: lineSgst,
        igstAmount: lineIgst,
        totalTax: taxVal,
        subtotal: subTotalVal
      };
    });

    const tentativeGrand = rawTaxableTotal + computedTaxSum;
    const finalGrand = Math.round(tentativeGrand);
    const roundingDiff = finalGrand - tentativeGrand;

    return {
      items: lineItemsComputed,
      totalBeforeTax: Math.round(rawTaxableTotal * 100) / 100,
      totalCgst: Math.round(computedCgstSum * 100) / 100,
      totalSgst: Math.round(computedSgstSum * 100) / 100,
      totalIgst: Math.round(computedIgstSum * 100) / 100,
      totalTax: Math.round(computedTaxSum * 100) / 100,
      totalRounding: Math.round(roundingDiff * 100) / 100,
      grandTotal: finalGrand
    };
  };

  // Validate on submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mobile validation (10 digit, starts 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(newCustMobile)) {
      setMobileError('Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9.');
      return;
    } else {
      setMobileError('');
    }

    // 2. PIN Code validation (6 digit)
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(newShipPin)) {
      setPinError('Indian postal PIN codes must be exactly 6 numeric digits.');
      return;
    } else {
      setPinError('');
    }

    // 3. GSTIN validation check (if business)
    if (newCustGstin) {
      const gstinRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
      if (!gstinRegex.test(newCustGstin.toUpperCase())) {
        setGstinError('Invalid Indian GSTIN syntax (Standard format 15 alphanumeric characters e.g. 27AEEFB4928A1Z7).');
        return;
      } else {
        setGstinError('');
      }
    }

    if (orderLines.length === 0) {
      alert('Cannot create an empty enterprise order. Please append at least 1 product line item.');
      return;
    }

    // Compute final items
    const ledger = computeTotals();

    // Generate Custom IDs
    const newOrderId = `SO-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrderEntity: Order = {
      id: newOrderId,
      customerName: newCustName,
      customerMobile: newCustMobile,
      customerEmail: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      customerGstin: newCustGstin ? newCustGstin.toUpperCase() : undefined,
      customerState: newCustState,
      shippingAddress: newShipAddress,
      shippingPinCode: newShipPin,
      billingAddress: newShipAddress, // default billing same
      billingPinCode: newShipPin,

      marketplace: newSource,
      marketplaceOrderId: `${newOrderId}-MKT`,
      items: ledger.items,

      totalBeforeTax: ledger.totalBeforeTax,
      totalCgst: ledger.totalCgst,
      totalSgst: ledger.totalSgst,
      totalIgst: ledger.totalIgst,
      totalTax: ledger.totalTax,
      totalRounding: ledger.totalRounding,
      grandTotal: ledger.grandTotal,

      orderDate: new Date().toISOString(),
      status: 'New Order', // starts at New Order stage per workflow rules
      warehouse: newWarehouse,
      priority: newPriority,
      paymentMode: newPayMode,
      paymentStatus: newPayMode === 'COD' ? 'Pending' : 'Paid',
      expectedDeliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isBusinessOrder: !!newCustGstin
    };

    onAddManualOrder(newOrderEntity);
    alert(`🎉 Enterprise Order ${newOrderId} successfully committed to system database.\nAssigned to fulfillment routing pipeline.`);
    
    // Reset modal
    setShowAddModal(false);
    setNewCustName('');
    setNewCustMobile('');
    setNewCustEmail('');
    setNewCustGstin('');
    setNewShipAddress('');
    setNewShipPin('');
    setOrderLines([]);
  };

  const totals = computeTotals();

  // Search filter matching
  const matchesSearch = (o: Order) => {
    const s = (localSearchQuery || globalSearch).toLowerCase();
    if (!s) return true;

    const skuMatch = o.items.some(item => item.sku.toLowerCase().includes(s));
    const barcodeMatch = o.items.some(item => item.hsnCode.toLowerCase().includes(s)); // fallback hsn
    const searchString = `${o.id} ${o.marketplaceOrderId} ${o.customerName} ${o.customerMobile || ''} ${o.awbNumber || ''} ${o.warehouse || ''}`.toLowerCase();
    
    return searchString.includes(s) || skuMatch || barcodeMatch;
  };

  const matchesFilters = (o: Order) => {
    const matchMkt = filterMarketplace === 'All' || o.marketplace === filterMarketplace;
    
    let matchStatus = true;
    if (filterStatus !== 'All') {
      if (filterStatus === 'Pending') {
        matchStatus = o.status === 'Pending' || o.status === 'New Order' || o.status === 'Pending Confirmation';
      } else if (filterStatus === 'Confirmed') {
        matchStatus = o.status === 'Confirmed' || o.status === 'Inventory Reserved';
      } else if (filterStatus === 'Picking') {
        matchStatus = o.status === 'Picking';
      } else if (filterStatus === 'Packing') {
        matchStatus = o.status === 'Packing' || o.status === 'Quality Check';
      } else if (filterStatus === 'Ready To Dispatch') {
        matchStatus = o.status === 'Ready To Dispatch' || o.status === 'Courier Assigned';
      } else if (filterStatus === 'Dispatched') {
        matchStatus = o.status === 'Dispatched' || o.status === 'In Transit' || o.status === 'Out For Delivery';
      } else if (filterStatus === 'Delivered') {
        matchStatus = o.status === 'Delivered' || o.status === 'Closed';
      } else {
        matchStatus = o.status === filterStatus;
      }
    }

    const matchPay = filterPayment === 'All' || o.paymentMode === filterPayment || o.paymentStatus === filterPayment;
    const matchWr = filterWarehouse === 'All' || o.warehouse === filterWarehouse;
    const matchPri = filterPriority === 'All' || o.priority === filterPriority;
    
    const matchType = filterType === 'All' 
      || (filterType === 'B2B' && !!o.customerGstin)
      || (filterType === 'B2C' && !o.customerGstin);

    return matchMkt && matchStatus && matchPay && matchWr && matchPri && matchType;
  };

  const finalFiltered = orders.filter(o => matchesSearch(o) && matchesFilters(o));

  // Selection Checkboxes
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === finalFiltered.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(finalFiltered.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(oId => oId !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  // Bulk executions
  const handleBulkConfirm = () => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach(id => updateOrderStatus(id, 'Confirmed'));
    alert(`Bulk Confirmed ${selectedOrderIds.length} orders successfully.`);
    setSelectedOrderIds([]);
  };

  const handleBulkDispatch = () => {
    if (selectedOrderIds.length === 0) return;
    selectedOrderIds.forEach(id => updateOrderStatus(id, 'Dispatched'));
    alert(`Bulk Dispatched ${selectedOrderIds.length} orders cargo to courier hub.`);
    setSelectedOrderIds([]);
  };

  const handleBulkLabels = () => {
    if (selectedOrderIds.length === 0) return;
    alert(`PDF manifest compilation initialized! Printed ${selectedOrderIds.length} thermal labels.`);
  };

  return (
    <div className="space-y-6">

      {/* Control Actions / Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-neutral-400" size={14} />
          <input
            type="text"
            placeholder="Search details by Order No, Customer, SKU, Phone or Tracking..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-250 rounded-lg pl-9 pr-4 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-neutral-800"
          />
        </div>

        {/* Buttons / Add New Order Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-neutral-900 hover:bg-neutral-850 text-white font-semibold font-sans px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition whitespace-nowrap"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Create Manual Order</span>
          </button>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `TTGT_OMS_EXPORT_${Date.now()}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold font-mono border px-3 py-2 rounded-lg text-xs flex items-center space-x-1.5 transition whitespace-nowrap"
          >
            <Download size={13} />
            <span>JSON Exporter</span>
          </button>
        </div>

      </div>

      {/* Advanced Filters Block */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm grid grid-cols-2 sm:grid-cols-6 gap-3">
        
        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Marketplace</label>
          <select
            value={filterMarketplace}
            onChange={(e) => setFilterMarketplace(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All channels</option>
            <option value="Amazon India">Amazon India</option>
            <option value="Flipkart">Flipkart</option>
            <option value="Meesho">Meesho</option>
            <option value="Myntra">Myntra</option>
            <option value="Direct Channel">B2B Direct</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Fulfillment Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Stages</option>
            <option value="Pending">Pending / New</option>
            <option value="Confirmed">Confirmed / Reserved</option>
            <option value="Picking">Picking Stage</option>
            <option value="Packing">Packing / QC</option>
            <option value="Ready To Dispatch">Ready Dispatch</option>
            <option value="Dispatched">Courier In Transit</option>
            <option value="Delivered">Delivered Active</option>
            <option value="Cancelled">Cancelled Void</option>
            <option value="Returned">Returned Cargo</option>
            <option value="Refunded">Refund Settled</option>
            <option value="Closed">Closed Loop</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Payment Method</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All methods</option>
            <option value="Prepaid">Prepaid</option>
            <option value="COD">COD (Delhivery/etc)</option>
            <option value="UPI">UPI QR Node</option>
            <option value="Paid">Paid Status</option>
            <option value="Pending">Pending Unpaid</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Warehouse Node</label>
          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Warehouses</option>
            <option value="Warehouse Alpha">Warehouse Alpha</option>
            <option value="Warehouse Beta">Warehouse Beta</option>
            <option value="Mumbai Docklands">Mumbai Docklands</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Priority SLA</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All SLA levels</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium SLA</option>
            <option value="High">High 24h SLA</option>
            <option value="Urgent">Urgent Next-Flight</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-mono text-neutral-400 font-bold block mb-1">Tax Classification</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded px-2 py-1 text-xs font-mono focus:outline-none"
          >
            <option value="All">All Orders</option>
            <option value="B2B">B2B (With GSTIN)</option>
            <option value="B2C">B2C (Retail Direct)</option>
          </select>
        </div>

      </div>

      {/* Bulk Action Panel (Active when items checked) */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-neutral-900 text-white p-3.5 rounded-xl border border-neutral-800 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="w-2.5 h-2.5 bg-orange-600 rounded-full animate-ping"></span>
            <span>Batch operations selected: <strong>{selectedOrderIds.length} orders</strong></span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkConfirm}
              className="bg-neutral-850 hover:bg-neutral-800 text-white px-2.5 py-1 rounded border border-neutral-700 text-[10px] font-mono leading-none"
            >
              Bulk Confirm Run
            </button>
            <button
              onClick={handleBulkDispatch}
              className="bg-neutral-850 hover:bg-neutral-800 text-white px-2.5 py-1 rounded border border-neutral-700 text-[10px] font-mono leading-none"
            >
              Bulk Manifest Handover
            </button>
            <button
              onClick={handleBulkLabels}
              className="bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1 rounded text-[10px] font-bold font-mono leading-none"
            >
              Bulk Print Thermal Labels
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="text-neutral-400 hover:text-white px-1"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Orders Pipeline Master Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-wider border-b">
                <th className="py-3 px-3 text-center select-none w-10">
                  <input
                    type="checkbox"
                    checked={finalFiltered.length > 0 && selectedOrderIds.length === finalFiltered.length}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"
                  />
                </th>
                <th className="py-3 px-3">Order ID & Source</th>
                <th className="py-3 px-3">Customer Entity</th>
                <th className="py-3 px-3">Fulfillment Node</th>
                <th className="py-3 px-3 text-right">Invoice grandTotal</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Payment Info</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {finalFiltered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-neutral-400 font-sans italic">
                    No enterprise order accounts match selected criteria. Use manual form to populate orders.
                  </td>
                </tr>
              ) : (
                finalFiltered.map((order) => {
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition">
                      <td className="py-4 px-3 text-center select-none">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-neutral-300 text-neutral-800 focus:ring-neutral-800"
                        />
                      </td>

                      <td className="py-4 px-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <strong className="text-neutral-800 font-mono text-[13px]">{order.id}</strong>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                              order.priority === 'Urgent' ? 'bg-red-100 text-red-800 animate-pulse' :
                              order.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {order.priority || 'Medium'}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono leading-none block">
                            Ch: <strong>{order.marketplace}</strong>
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <div>
                          <p className="font-semibold text-neutral-800 text-xs">{order.customerName}</p>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5 max-w-[170px] truncate" title={order.customerEmail}>
                            {order.customerMobile || 'No Phone'} | {order.customerState}
                          </p>
                          {order.customerGstin && (
                            <span className="text-[8px] font-mono bg-blue-50 text-blue-700 px-1 border border-blue-100 rounded mt-1 inline-block">
                              GSTIN: {order.customerGstin}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-3 font-mono">
                        <div className="text-[11px] text-neutral-700">{order.warehouse || 'Warehouse Alpha'}</div>
                        <span className="text-[9px] text-neutral-400 block mt-0.5">{itemsCount} units logged</span>
                      </td>

                      <td className="py-4 px-3 text-right font-mono font-bold text-neutral-800 text-[12px]">
                        {formatINR(order.grandTotal)}
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase font-mono ${
                          order.status === 'New Order' || order.status === 'Pending' ? 'bg-amber-100 text-amber-800 border' :
                          order.status === 'Confirmed' ? 'bg-sky-100 text-sky-800 border' :
                          order.status === 'Picking' ? 'bg-indigo-100 text-indigo-800 animate-pulse' :
                          order.status === 'Packing' ? 'bg-blue-100 text-blue-800 border' :
                          order.status === 'Quality Check' ? 'bg-teal-100 text-teal-800 border' :
                          order.status === 'Ready To Dispatch' ? 'bg-purple-100 text-purple-800 border' :
                          order.status === 'Dispatched' ? 'bg-violet-100 text-violet-800 border' :
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center space-y-1 font-mono text-[10px]">
                        <div className="font-semibold">{order.paymentMode || 'Prepaid'}</div>
                        <span className={`text-[9px] px-1 rounded block max-w-max mx-auto font-bold ${
                          order.paymentStatus === 'Paid' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                        }`}>
                          {order.paymentStatus || 'Paid'}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            title="Inspect Order File"
                            onClick={() => setInspectedOrder(order)}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            title="Print Statutory Invoice"
                            onClick={() => onPrintInvoice(order)}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded transition"
                          >
                            <Printer size={12} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Inspect Drawer look up */}
      {inspectedOrder && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 font-sans overflow-y-auto space-y-6 flex flex-col justify-between">
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold block">Consignment Docket File</span>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-neutral-900 font-mono">{inspectedOrder.id}</h2>
                    <span className="text-xs bg-orange-100 text-orange-850 px-2 py-0.5 rounded font-bold font-mono">
                      {inspectedOrder.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectedOrder(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-800 bg-neutral-50 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status details quick buttons */}
              <div className="bg-neutral-50 p-3 rounded-lg border flex flex-col space-y-2">
                <span className="text-[9px] uppercase font-mono text-neutral-400 font-bold block">Status Transition Control Node</span>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {inspectedOrder.status === 'New Order' && (
                    <button
                      onClick={() => { updateOrderStatus(inspectedOrder.id, 'Confirmed'); setInspectedOrder(prev => prev ? {...prev, status: 'Confirmed'} : null); }}
                      className="bg-neutral-900 hover:bg-neutral-850 text-white px-2.5 py-1.5 rounded font-bold"
                    >
                      Confirm Order
                    </button>
                  )}
                  {inspectedOrder.status === 'Confirmed' && (
                    <button
                      onClick={() => { updateOrderStatus(inspectedOrder.id, 'Picking'); setInspectedOrder(prev => prev ? {...prev, status: 'Picking'} : null); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded font-bold"
                    >
                      Allocate Picking
                    </button>
                  )}
                  {inspectedOrder.status === 'Ready To Dispatch' && (
                    <button
                      onClick={() => { updateOrderStatus(inspectedOrder.id, 'Dispatched'); setInspectedOrder(prev => prev ? {...prev, status: 'Dispatched'} : null); }}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-2.5 py-1.5 rounded font-bold"
                    >
                      Dispatch Cargo
                    </button>
                  )}
                  {inspectedOrder.status !== 'Cancelled' && inspectedOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => { updateOrderStatus(inspectedOrder.id, 'Cancelled'); setInspectedOrder(prev => prev ? {...prev, status: 'Cancelled'} : null); }}
                      className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-2.5 py-1.5 rounded border border-rose-200"
                    >
                      Cancel Order
                    </button>
                  )}
                  <button
                    onClick={() => { onPrintInvoice(inspectedOrder); }}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded border"
                  >
                    View Invoice
                  </button>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">Entity Name</span>
                  <strong className="text-neutral-800">{inspectedOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">Mobile Number</span>
                  <strong className="text-neutral-800">{inspectedOrder.customerMobile || 'NA'}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">Source Origin</span>
                  <strong className="text-neutral-800">{inspectedOrder.marketplace}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">GST Classification</span>
                  <strong className="text-neutral-800">{inspectedOrder.customerGstin ? `B2B: ${inspectedOrder.customerGstin}` : 'B2C Retail Unregistered'}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">Shipping Address</span>
                  <p className="text-neutral-700 leading-snug mt-0.5">{inspectedOrder.shippingAddress}, PIN {inspectedOrder.shippingPinCode}</p>
                </div>
                <div>
                  <span className="text-neutral-400 block font-mono text-[9px] uppercase">Expected Delivery</span>
                  <strong className="text-neutral-850 font-mono">{inspectedOrder.expectedDeliveryDate || 'T+3 days standard'}</strong>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono uppercase text-neutral-400 tracking-wider">Line Items Bundle</span>
                <div className="border rounded-lg overflow-hidden divide-y text-xs font-mono">
                  {inspectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-neutral-50/50 flex justify-between items-center">
                      <div>
                        <div className="font-semibold font-sans text-neutral-800 text-[11px] max-w-[280px] truncate" title={item.productName}>
                          {item.productName}
                        </div>
                        <span className="text-[9px] text-neutral-400">SKU: {item.sku} | HSN: {item.hsnCode}</span>
                      </div>
                      <div className="text-right">
                        <strong className="text-neutral-800">{item.quantity} units</strong>
                        <span className="text-[10px] block text-neutral-400">@{formatINR(item.unitPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial calculations */}
              <div className="bg-neutral-50 p-4 border rounded-xl font-mono text-xs space-y-2">
                <div className="flex justify-between text-neutral-500">
                  <span>Taxable Base Value:</span>
                  <span>{formatINR(inspectedOrder.totalBeforeTax)}</span>
                </div>
                {inspectedOrder.customerState === companySettings.state ? (
                  <>
                    <div className="flex justify-between text-neutral-400">
                      <span>Add Central CGST Amount:</span>
                      <span>{formatINR(inspectedOrder.totalCgst)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Add State SGST Amount:</span>
                      <span>{formatINR(inspectedOrder.totalSgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-neutral-400">
                    <span>Add Integrated IGST Amount:</span>
                    <span>{formatINR(inspectedOrder.totalIgst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500 border-b pb-1.5 mb-1">
                  <span>Gross Tax Amount ({inspectedOrder.items[0]?.gstRate || 18}% average):</span>
                  <span>{formatINR(inspectedOrder.totalTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-sm">
                  <span>Rupee Rounded Grand Total:</span>
                  <span className="text-orange-600">{formatINR(inspectedOrder.grandTotal)}</span>
                </div>
              </div>

            </div>

            <div className="border-t pt-4 text-center select-none text-[10px] text-neutral-400 font-mono">
              Marketplace Direct Sync token: 1Z85493032AF9E9B
            </div>

          </div>
        </div>
      )}

      {/* Manual Creation Overlay Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 font-sans border text-left flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">OMS Manual Order Form</h3>
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Compliant with CGST, SGST, IGST rules, pincode, and mobile validations</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shree Sai Logistics Ltd"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Indian Mobile *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. 9821034928"
                    value={newCustMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewCustMobile(val);
                      if (val.length === 10 && !/^[6-9]\d{9}$/.test(val)) {
                        setMobileError('Invalid Prefix. Must start with 6-9.');
                      } else {
                        setMobileError('');
                      }
                    }}
                    className={`w-full bg-neutral-50 border ${mobileError ? 'border-rose-500':'border-neutral-250'} rounded px-2.5 py-1.5 text-xs outline-none`}
                  />
                  {mobileError && <span className="text-[8px] font-mono text-rose-600 block mt-0.5">{mobileError}</span>}
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. ops@saishree.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Place of Supply (State) *</label>
                  <select
                    value={newCustState}
                    onChange={(e) => setNewCustState(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2 py-1.5 text-xs font-mono outline-none"
                  >
                    {stateList.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">GSTIN Number (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 27AEEFB4928A1Z7"
                    value={newCustGstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewCustGstin(val);
                      if (val.length === 15 && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(val)) {
                        setGstinError('Invalid Indian GSTIN syntax.');
                      } else {
                        setGstinError('');
                      }
                    }}
                    className={`w-full bg-neutral-50 border ${gstinError ? 'border-rose-500' : 'border-neutral-200'} rounded px-2.5 py-1.5 text-xs outline-none`}
                  />
                  {gstinError && <span className="text-[8px] font-mono text-rose-600 block mt-0.5">{gstinError}</span>}
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Order Source *</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2 py-1.5 text-xs font-mono outline-none"
                  >
                    <option value="Direct Channel">B2B Wholesale (Direct)</option>
                    <option value="Amazon India">Amazon Private Client</option>
                    <option value="Meesho">Meesho Retail</option>
                    <option value="Flipkart">Flipkart Wholesale</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Shipping Full Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gala 502, Sector 2, APMC Market, Turbhe"
                    value={newShipAddress}
                    onChange={(e) => setNewShipAddress(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Indian PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 400705"
                    value={newShipPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setNewShipPin(val);
                      if (val.length === 6 && !/^\d{6}$/.test(val)) {
                        setPinError('Invalid Code.');
                      } else {
                        setPinError('');
                      }
                    }}
                    className={`w-full bg-neutral-50 border ${pinError ? 'border-rose-500':'border-neutral-250'} rounded px-2.5 py-1.5 text-xs outline-none`}
                  />
                  {pinError && <span className="text-[8px] font-mono text-rose-600 block mt-0.5">{pinError}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Payment Channel *</label>
                  <select
                    value={newPayMode}
                    onChange={(e) => setNewPayMode(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2 py-1.5 text-xs font-mono outline-none"
                  >
                    <option value="Prepaid">Prepaid Credit Engine</option>
                    <option value="COD">COD Delhivery Handover</option>
                    <option value="UPI">UPI Digital Payment Portal</option>
                    <option value="Cash">In Hand Counter Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">SLA Priority *</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2 py-1.5 text-xs font-mono outline-none"
                  >
                    <option value="Low">Low - Economy</option>
                    <option value="Medium">Medium - Regular SLA</option>
                    <option value="High">High - 24 hour routing</option>
                    <option value="Urgent">Urgent - Direct Air Cargo</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[9px] uppercase font-mono text-neutral-450 font-bold block mb-1">Warehouse Allocation *</label>
                  <select
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-2 py-1.5 text-xs font-mono outline-none"
                  >
                    <option value="Warehouse Alpha">Warehouse Alpha (Maharashtra Hub)</option>
                    <option value="Warehouse Beta">Warehouse Beta (NCR Hub)</option>
                    <option value="Mumbai Docklands">Mumbai Docklands Custom Block</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Line Entry Add */}
              <div className="bg-neutral-50 p-4 border rounded-xl space-y-3">
                <span className="text-[10px] font-bold font-mono uppercase text-neutral-400 block pb-1 border-b">Add Itemized Ledger Line</span>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-0.5">Select Catalog Product</label>
                    <select
                      value={activeSelectedProductId}
                      onChange={(e) => setActiveSelectedProductId(e.target.value)}
                      className="w-full bg-white border rounded px-2 py-1 text-xs outline-none"
                    >
                      <option value="">-- Choose dynamic product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.sku} | {p.name.substring(0, 50)}... (Stock: {p.currentStock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-0.5">Order Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={activeSelectedQty}
                      onChange={(e) => setActiveSelectedQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border rounded px-2 py-1 text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-0.5">Discount %</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={activeSelectedDiscount}
                        onChange={(e) => setActiveSelectedDiscount(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-full bg-white border rounded px-2 py-1 text-xs outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      className="bg-neutral-800 hover:bg-neutral-900 text-white font-bold text-xs px-3.5 rounded shrink-0 h-8 self-end"
                    >
                      Append
                    </button>
                  </div>
                </div>

                {/* Show currently added lines */}
                {orderLines.length > 0 && (
                  <div className="border rounded bg-white overflow-hidden divide-y text-xs font-mono mt-3">
                    <table className="w-full text-left">
                      <thead className="bg-[#FAF9F6] text-[8px] uppercase tracking-wider text-neutral-400">
                        <tr>
                          <th className="p-1 px-2">Line Product</th>
                          <th className="p-1 px-2 text-right">Qty</th>
                          <th className="p-1 px-2 text-right">Rate</th>
                          <th className="p-1 px-2 text-right">GST %</th>
                          <th className="p-1 px-2 text-right">Discount</th>
                          <th className="p-1 px-2 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-[10px]">
                        {orderLines.map((line, idx) => {
                          const { gst } = getProductHsnAndGst(line.product);
                          return (
                            <tr key={idx} className="hover:bg-neutral-50">
                              <td className="p-1.5 px-2 font-sans font-semibold text-neutral-800">
                                {line.product.name}
                              </td>
                              <td className="p-1.5 px-2 text-right font-bold">{line.quantity}</td>
                              <td className="p-1.5 px-2 text-right">₹{line.product.sellingPrice}</td>
                              <td className="p-1.5 px-2 text-right font-bold">{gst}%</td>
                              <td className="p-1.5 px-2 text-right text-rose-500 font-bold">{line.discountPercent}%</td>
                              <td className="p-1.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLine(idx)}
                                  className="text-stone-400 hover:text-stone-900"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Ledger Summary */}
              {orderLines.length > 0 && (
                <div className="bg-neutral-900 text-white p-4 rounded-xl font-mono text-xs space-y-2">
                  <div className="flex justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-neutral-500">Taxable amount Excl. GST:</span>
                    <span>{formatINR(totals.totalBeforeTax)}</span>
                  </div>
                  {newCustState === companySettings.state ? (
                    <div className="flex justify-between text-neutral-500">
                      <span>Add CGST (9% Central):</span>
                      <span>{formatINR(totals.totalCgst)}</span>
                    </div>
                  ) : null}
                  {newCustState === companySettings.state ? (
                    <div className="flex justify-between text-neutral-500 border-b border-neutral-800 pb-1.5">
                      <span>Add SGST (9% State / UT):</span>
                      <span>{formatINR(totals.totalSgst)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-neutral-500 border-b border-neutral-800 pb-1.5">
                      <span>Add IGST (18% Integrated Inter-state):</span>
                      <span>{formatINR(totals.totalIgst)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-amber-500">
                    <span>Rounded Grand value payable:</span>
                    <span>{formatINR(totals.grandTotal)}</span>
                  </div>
                </div>
              )}

              {/* Form Actions Footer */}
              <div className="flex justify-end gap-2 border-t pt-4 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-neutral-100 px-4 py-2 rounded-lg text-xs hover:bg-neutral-200"
                >
                  Cancel Form
                </button>
                <button
                  type="submit"
                  className="bg-neutral-900 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-neutral-850"
                >
                  Submit Order Account
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
