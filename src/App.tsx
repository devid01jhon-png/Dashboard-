/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Workflow } from 'lucide-react';
import { 
  UserRole, 
  PermissionSet, 
  CompanySettings, 
  Vendor, 
  Product, 
  InventoryLog, 
  WarehouseLocation, 
  Order, 
  FinanceTransaction, 
  Employee, 
  AuditLog, 
  NotificationItem 
} from './types';
import { 
  INITIAL_COMPANY, 
  INITIAL_VENDORS, 
  INITIAL_PRODUCTS, 
  INITIAL_INVENTORY_LOGS, 
  INITIAL_WAREHOUSE_LOCATIONS, 
  INITIAL_ORDERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_EMPLOYEES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data';

// Component Imports
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardHome from './components/DashboardHome';
import VendorsModule from './components/VendorsModule';
import ProductsModule from './components/ProductsModule';
import InventoryModule from './components/InventoryModule';
import WarehouseModule from './components/WarehouseModule';
import OrdersModule from './components/OrdersModule';
import FinanceModule from './components/FinanceModule';
import CRMAndCustomersModule from './components/CRMAndCustomersModule';
import EmployeesModule from './components/EmployeesModule';
import AICenterModule from './components/AICenterModule';
import DbschemaModule from './components/DbschemaModule';

// Default Role Permissions Matrix
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  [UserRole.SUPER_ADMIN]: {
    viewDashboard: true, manageVendors: true, manageProducts: true, manageInventory: true,
    warehouseOperations: true, manageOrders: true, manageFinance: true, manageEmployees: true,
    useAICenter: true, editSettings: true,
  },
  [UserRole.ADMIN]: {
    viewDashboard: true, manageVendors: true, manageProducts: true, manageInventory: true,
    warehouseOperations: true, manageOrders: true, manageFinance: true, manageEmployees: true,
    useAICenter: true, editSettings: true,
  },
  [UserRole.MANAGER]: {
    viewDashboard: true, manageVendors: true, manageProducts: true, manageInventory: true,
    warehouseOperations: true, manageOrders: true, manageFinance: true, manageEmployees: false,
    useAICenter: true, editSettings: false,
  },
  [UserRole.WAREHOUSE_MANAGER]: {
    viewDashboard: true, manageVendors: false, manageProducts: false, manageInventory: true,
    warehouseOperations: true, manageOrders: true, manageFinance: false, manageEmployees: false,
    useAICenter: true, editSettings: false,
  },
  [UserRole.INVENTORY_MANAGER]: {
    viewDashboard: true, manageVendors: true, manageProducts: true, manageInventory: true,
    warehouseOperations: false, manageOrders: false, manageFinance: false, manageEmployees: false,
    useAICenter: true, editSettings: false,
  },
  [UserRole.PACKING_STAFF]: {
    viewDashboard: false, manageVendors: false, manageProducts: false, manageInventory: false,
    warehouseOperations: true, manageOrders: true, manageFinance: false, manageEmployees: false,
    useAICenter: false, editSettings: false,
  },
  [UserRole.CUSTOMER_SUPPORT]: {
    viewDashboard: true, manageVendors: false, manageProducts: false, manageInventory: false,
    warehouseOperations: false, manageOrders: true, manageFinance: false, manageEmployees: false,
    useAICenter: true, editSettings: false,
  },
  [UserRole.FINANCE]: {
    viewDashboard: true, manageVendors: true, manageProducts: false, manageInventory: false,
    warehouseOperations: false, manageOrders: true, manageFinance: true, manageEmployees: false,
    useAICenter: true, editSettings: false,
  },
  [UserRole.VENDOR]: {
    viewDashboard: true, manageVendors: false, manageProducts: false, manageInventory: false,
    warehouseOperations: false, manageOrders: false, manageFinance: false, manageEmployees: false,
    useAICenter: false, editSettings: false,
  },
  [UserRole.READ_ONLY]: {
    viewDashboard: true, manageVendors: false, manageProducts: false, manageInventory: false,
    warehouseOperations: false, manageOrders: false, manageFinance: false, manageEmployees: false,
    useAICenter: false, editSettings: false,
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Core States Sync Loader helper
  const getLocalData = <T,>(key: string, defaultVal: T): T => {
    try {
      const stored = localStorage.getItem(`ttgt_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setLocalData = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`ttgt_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn("Storage limits reached", e);
    }
  };

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getLocalData('company', INITIAL_COMPANY));
  const [vendors, setVendors] = useState<Vendor[]>(() => getLocalData('vendors', INITIAL_VENDORS));
  const [products, setProducts] = useState<Product[]>(() => getLocalData('products', INITIAL_PRODUCTS));
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>(() => getLocalData('inventory_logs', INITIAL_INVENTORY_LOGS));
  const [locations, setLocations] = useState<WarehouseLocation[]>(() => getLocalData('locations', INITIAL_WAREHOUSE_LOCATIONS));
  const [orders, setOrders] = useState<Order[]>(() => getLocalData('orders', INITIAL_ORDERS));
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(() => getLocalData('transactions', INITIAL_TRANSACTIONS));
  const [employees, setEmployees] = useState<Employee[]>(() => getLocalData('employees', INITIAL_EMPLOYEES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getLocalData('audit_logs', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getLocalData('notifications', INITIAL_NOTIFICATIONS));

  // Role Simulator Settings
  const [userRole, setUserRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, PermissionSet>>(() => getLocalData('role_permissions', DEFAULT_ROLE_PERMISSIONS));

  // Auto save hook updates
  useEffect(() => { setLocalData('company', companySettings); }, [companySettings]);
  useEffect(() => { setLocalData('vendors', vendors); }, [vendors]);
  useEffect(() => { setLocalData('products', products); }, [products]);
  useEffect(() => { setLocalData('inventory_logs', inventoryLogs); }, [inventoryLogs]);
  useEffect(() => { setLocalData('locations', locations); }, [locations]);
  useEffect(() => { setLocalData('orders', orders); }, [orders]);
  useEffect(() => { setLocalData('transactions', transactions); }, [transactions]);
  useEffect(() => { setLocalData('employees', employees); }, [employees]);
  useEffect(() => { setLocalData('audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { setLocalData('notifications', notifications); }, [notifications]);
  useEffect(() => { setLocalData('role_permissions', rolePermissions); }, [rolePermissions]);

  // Adjust active tab if Simulated Role doesn't have permissions to view it
  useEffect(() => {
    const activePermSet = rolePermissions[userRole];
    if (currentTab === 'vendors' && !activePermSet.manageVendors) setCurrentTab('dashboard');
    if (currentTab === 'products' && !activePermSet.manageProducts) setCurrentTab('dashboard');
    if (currentTab === 'inventory' && !activePermSet.manageInventory) setCurrentTab('dashboard');
    if (currentTab === 'warehouse' && !activePermSet.warehouseOperations) setCurrentTab('dashboard');
    if (currentTab === 'orders' && !activePermSet.manageOrders) setCurrentTab('dashboard');
    if (currentTab === 'finance' && !activePermSet.manageFinance) setCurrentTab('dashboard');
    if (currentTab === 'reports' && !activePermSet.manageFinance) setCurrentTab('dashboard');
    if (currentTab === 'employees' && !activePermSet.manageEmployees) setCurrentTab('dashboard');
    if (currentTab === 'ai-center' && !activePermSet.useAICenter) setCurrentTab('dashboard');
    if (currentTab === 'settings' && !activePermSet.editSettings) setCurrentTab('dashboard');
  }, [userRole, rolePermissions, currentTab]);

  // Handle cross-module reactive events
  useEffect(() => {
    const handleOrderStatusEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ orderId: string; status: Order['status'] }>;
      if (customEvent.detail && customEvent.detail.orderId) {
        handleUpdateOrderStatus(customEvent.detail.orderId, customEvent.detail.status);
      }
    };
    window.addEventListener('ttgt_order_status_update', handleOrderStatusEvent);
    return () => window.removeEventListener('ttgt_order_status_update', handleOrderStatusEvent);
  }, []);

  // SYSTEM LOG HANDLER
  const createSystemLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userEmail: 'devid01jhon@gmail.com',
      userName: 'Devid Jhon',
      role: userRole,
      action,
      details,
      ipAddress: '103.241.12.98',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // HANDLER: Add Vendor
  const handleAddVendor = (newVendor: Omit<Vendor, 'id' | 'createdAt' | 'createdBy'>) => {
    const vendor: Vendor = {
      ...newVendor,
      id: `vendor-${Date.now()}`,
      createdBy: 'devid01jhon@gmail.com',
      createdAt: new Date().toISOString()
    };
    setVendors(prev => [vendor, ...prev]);
    createSystemLog('Onboard Vendor', `Authorized onboarding of company: ${vendor.companyName} (GSTIN: ${vendor.gstin})`);
  };

  // HANDLER: Adjust Vendor Ledger Payouts
  const handleUpdateVendorBalance = (id: string, amount: number) => {
    setVendors(prev => prev.map(v => {
      if (v.id === id) {
        const afterVal = v.ledgerBalance + amount;
        createSystemLog('Adjust Ledger', `Updated ledger accounts for ${v.companyName} by ₹${amount}. New: ₹${afterVal}`);
        return { ...v, ledgerBalance: afterVal };
      }
      return v;
    }));
  };

  const handleDeleteVendor = (id: string) => {
    const vendorMatch = vendors.find(v => v.id === id);
    setVendors(prev => prev.filter(v => v.id !== id));
    if (vendorMatch) {
      createSystemLog('Disconnect Vendor', `Severed integration with vendor company: ${vendorMatch.companyName}`);
    }
  };

  // HANDLER: Add Product SKU
  const handleAddProduct = (newProduct: Omit<Product, 'id' | 'currentStock'>) => {
    const product: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
      currentStock: 100 // Pre-stock with buffer
    };
    setProducts(prev => [product, ...prev]);
    createSystemLog('Register SKU', `Registered material catalog file for SKU: ${product.sku} under HSN ${product.hsnCode}`);
  };

  const handleDeleteProduct = (id: string) => {
    const pMatch = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (pMatch) {
      createSystemLog('Archive SKU', `Deleted material SKU catalog code: ${pMatch.sku}`);
    }
  };

  // HANDLER: Inward Stocks / Audits
  const handleRecordInward = (log: Omit<InventoryLog, 'id' | 'createdAt' | 'createdByName'>) => {
    const newLog: InventoryLog = {
      ...log,
      id: `log-${Date.now()}`,
      createdByName: 'Devid Jhon (Super Admin)',
      createdAt: new Date().toISOString()
    };
    
    // Update stock levels
    setProducts(prev => prev.map(p => {
      if (p.id === log.productId) {
        const upgradedStock = p.currentStock + log.quantity;
        return { ...p, currentStock: Math.max(0, upgradedStock) };
      }
      return p;
    }));

    setInventoryLogs(prev => [newLog, ...prev]);
    const prodName = products.find(p => p.id === log.productId)?.sku || '';
    createSystemLog('Process Cargo', `Logged ${log.type} adjustment for SKU: ${prodName} of units quantity: ${log.quantity} inside batch: ${log.batchNumber}`);
  };

  const handleRecordStockAdjustment = (productId: string, quantity: number, type: InventoryLog['type'], notes: string) => {
    handleRecordInward({
      productId,
      type,
      quantity,
      batchNumber: 'AUDIT-ADJ-' + Date.now().toString().slice(-4),
      referenceId: 'AUDIT',
      notes
    });
  };

  // HANDLER: Update warehouse rack occupant
  const handleUpdateLocationOccupant = (id: string, productId: string | undefined) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === id) {
        const prodMatch = products.find(p => p.id === productId);
        createSystemLog('Slot Alteration', `Modified shelf storage: Row ${loc.aisle}, Bin ${loc.bin} bound to material: ${prodMatch ? prodMatch.sku : 'Empty'}`);
        return { 
          ...loc, 
          currentProductId: productId, 
          isOccupied: productId !== undefined 
        };
      }
      return loc;
    }));
  };

  // HANDLER: Orders process management
  const handleUpdateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        createSystemLog('Order Funnel', `Advanced marketplace order ${o.id} progress to stage: ${status}`);
        
        let invNo = o.invoiceNumber;
        let invDate = o.invoiceDate;

        // Auto generate compliant tax invoices when items packed
        if (status === 'Packed' && !o.invoiceNumber) {
          invNo = 'TTGT-2627-' + Math.floor(1100 + Math.random() * 8800).toString();
          invDate = new Date().toISOString();

          // Deduct stock levels permanently when packing completes
          o.items.forEach(item => {
            setProducts(p => p.map(prod => {
              if (prod.id === item.productId) {
                return { ...prod, currentStock: Math.max(0, prod.currentStock - item.quantity) };
              }
              return prod;
            }));
          });
        }

        return { ...o, status, invoiceNumber: invNo, invoiceDate: invDate };
      }
      return o;
    }));
  };

  const handleUpdateOrderShipping = (id: string, carrier: Order['courierPartner'], awb: string, eway?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        createSystemLog('Transmit Courier', `Assigned DTDC transit barcode ${awb} under carrier: ${carrier}`);
        return { ...o, courierPartner: carrier, awbNumber: awb, ewayBillNumber: eway };
      }
      return o;
    }));
  };

  // HANDLER: Create Voucher Payouts
  const handleAddTransaction = (newTx: Omit<FinanceTransaction, 'id'>) => {
    const tx: FinanceTransaction = {
      ...newTx,
      id: `tx-${Date.now()}`
    };
    setTransactions(prev => [tx, ...prev]);
    createSystemLog('Voucher Entry', `Authorized voucher book keeping ref: ${tx.referenceNo} matching party: ${tx.partyName} of value ₹${tx.amount}`);
  };

  // HANDLER: Add corporate employee worker
  const handleAddEmployee = (newEmp: Omit<Employee, 'id'>) => {
    const emp: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}`
    };
    setEmployees(prev => [...prev, emp]);
    createSystemLog('Register Personnel', `Added worker authorization profiles for: ${emp.name} (${emp.role})`);
  };

  const handleDeleteEmployee = (id: string) => {
    const empMatch = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (empMatch) {
      createSystemLog('De-authorize Personnel', `Archived credentials for employee: ${empMatch.name}`);
    }
  };

  // HANDLER: Permissions toggler
  const handleUpdateRolePermissions = (role: UserRole, key: keyof PermissionSet, value: boolean) => {
    setRolePermissions(prev => {
      const upgrade = {
        ...prev,
        [role]: {
          ...prev[role],
          [key]: value
        }
      };
      createSystemLog('Security Privileges', `Modified security access for role: ${role}. Set property [${key}] to ${value}`);
      return upgrade;
    });
  };

  // Notification Reader
  const handleMarkNotifRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length;

  const activePerms = rolePermissions[userRole];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 font-sans text-neutral-800">
      
      {/* 1. COLLAPSIBLE SLEEK SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        userRole={userRole}
        permissions={activePerms}
      />

      {/* 2. CHUTE CONTAINER FOR TOP NAVBAR AND CORE MODULE VIEWS */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Navbar and Search Controllers */}
        <Navbar
          currentTab={currentTab}
          userRole={userRole}
          setUserRole={setUserRole}
          notifications={notifications}
          markNotificationAsRead={handleMarkNotifRead}
          onSearchQueryChange={setSearchQuery}
          searchQuery={searchQuery}
        />

        {/* 3. DYNAMIC MODULE LOADOUT AREA */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {currentTab === 'dashboard' && (
              <DashboardHome
                vendors={vendors}
                products={products}
                orders={orders}
                transactions={transactions}
                auditLogs={auditLogs}
                notifications={notifications}
                setCurrentTab={setCurrentTab}
              />
            )}

            {currentTab === 'vendors' && activePerms.manageVendors && (
              <VendorsModule
                vendors={vendors}
                addVendor={handleAddVendor}
                updateVendorBalance={handleUpdateVendorBalance}
                deleteVendor={handleDeleteVendor}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'products' && activePerms.manageProducts && (
              <ProductsModule
                products={products}
                vendors={vendors}
                addProduct={handleAddProduct}
                deleteProduct={handleDeleteProduct}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'inventory' && activePerms.manageInventory && (
              <InventoryModule
                products={products}
                inventoryLogs={inventoryLogs}
                recordStockInward={handleRecordInward}
                recordStockAdjustment={handleRecordStockAdjustment}
                searchQuery={searchQuery}
                onBulkUpdateProducts={setProducts}
                vendors={vendors}
              />
            )}

            {currentTab === 'warehouse' && activePerms.warehouseOperations && (
              <WarehouseModule
                locations={locations}
                products={products}
                orders={orders}
                updateLocationOccupant={handleUpdateLocationOccupant}
              />
            )}

            {currentTab === 'orders' && activePerms.manageOrders && (
              <OrdersModule
                orders={orders}
                products={products}
                companySettings={companySettings}
                updateOrderStatus={handleUpdateOrderStatus}
                updateOrderShipping={handleUpdateOrderShipping}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'customers' && (
              <CRMAndCustomersModule searchQuery={searchQuery} />
            )}

            {currentTab === 'finance' && activePerms.manageFinance && (
              <FinanceModule
                transactions={transactions}
                vendors={vendors}
                orders={orders}
                companySettings={companySettings}
                addTransaction={handleAddTransaction}
                updateVendorBalance={handleUpdateVendorBalance}
                updateOrderStatus={handleUpdateOrderStatus}
                searchQuery={searchQuery}
              />
            )}

            {currentTab === 'reports' && activePerms.manageFinance && (
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm text-center py-16 space-y-4">
                <Workflow className="mx-auto text-orange-500 animate-bounce" size={42} />
                <h3 className="text-sm font-bold text-neutral-800">GSTR-1, GSTR-3B & GSTR-2B Compliance Reports Center</h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                  Export complete transaction ledgers in CSV format, synchronize returns status directly to GST portal, or generate income tax withholding audit files in Excel format.
                </p>
                <div className="flex space-x-3 justify-center text-xs font-mono select-none">
                  <button onClick={() => alert('Downloaded GSTR-1 excel workbook')} className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg">Export GSTR-1</button>
                  <button onClick={() => alert('Downloaded GSTR-3B ledger sheets')} className="bg-neutral-100 text-neutral-700 px-4 py-1.5 rounded-lg border border-neutral-250">Export GSTR-3B</button>
                </div>
              </div>
            )}

            {currentTab === 'crm' && (
              <CRMAndCustomersModule searchQuery={searchQuery} />
            )}

            {currentTab === 'employees' && activePerms.manageEmployees && (
              <EmployeesModule
                employees={employees}
                addEmployee={handleAddEmployee}
                deleteEmployee={handleDeleteEmployee}
                rolePermissions={rolePermissions}
                updateRolePermissions={handleUpdateRolePermissions}
              />
            )}

            {currentTab === 'ai-center' && activePerms.useAICenter && (
              <AICenterModule />
            )}

            {currentTab === 'db-schema' && (
              <DbschemaModule />
            )}

            {currentTab === 'settings' && activePerms.editSettings && (
              <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                <div>
                  <h3 className="font-bold text-neutral-850 text-sm">Company Settings & Tax KYC Registers</h3>
                  <p className="text-xs text-neutral-400 font-mono mt-0.5">Define corporate PAN, GSITN CIN numbers to align legal compliance on printable B2B Invoices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">Company Legal Entity</span>
                    <input type="text" readOnly value={companySettings.companyName} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed uppercase" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">National PAN Identity</span>
                    <input type="text" readOnly value={companySettings.pan} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed font-mono uppercase" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">Primary GSTIN Code</span>
                    <input type="text" readOnly value={companySettings.gstin} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed font-mono uppercase" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">CIN Number (Ministry of Corporate Affairs)</span>
                    <input type="text" readOnly value={companySettings.cin} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed font-mono" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">TAN Withholding Account No</span>
                    <input type="text" readOnly value={companySettings.tan} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed font-mono" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 font-bold block">MSME Classification</span>
                    <input type="text" readOnly value={companySettings.msmeType} className="w-full bg-neutral-50 p-2 border rounded cursor-not-allowed" />
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg border flex items-center space-x-2 text-xs text-neutral-500 font-sans">
                  <span>ℹ️ Corporate parameters are locked under central KYC audits. Contact tech helpdesk for corrections.</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
