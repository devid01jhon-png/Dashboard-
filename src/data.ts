/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CompanySettings, Vendor, Product, InventoryLog, WarehouseLocation, Order, FinanceTransaction, Employee, AuditLog, NotificationItem, UserRole } from './types';

export const INITIAL_COMPANY: CompanySettings = {
  companyName: 'TTGT Solutions Private Limited',
  companyType: 'Private Limited',
  gstin: '27AAPTT3241R1ZM', // 27 = Maharashtra
  pan: 'AAPTT3241R',
  cin: 'U72900MH2026PTC394123',
  tan: 'MUMT04932B',
  msmeType: 'Medium',
  udyamRegistration: 'UDYAM-MH-19-0012345',
  email: 'ops@ttgtsolutions.com',
  phone: '+91 22 4930 2000',
  addressLines: 'B-Wing, Suite 804, Lodha Supremus, Kanjurmarg East',
  state: 'Maharashtra',
  city: 'Mumbai',
  pinCode: '400042',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200049281234',
  ifscCode: 'HDFC0000080',
  upiId: 'ttgt@okhdfcbank',
  digitalSignatureUrl: 'verified_sig_ttgt_auth.png'
};

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-1',
    companyName: 'Kalyani Electronics Component Hub',
    contactName: 'Ananth Kalyani',
    email: 'contact@kalyanielectronics.in',
    phone: '+91 98450 12345',
    pan: 'APKPK8934L',
    gstin: '29APKPK8934L1Z3', // 29 = Karnataka
    state: 'Karnataka',
    city: 'Bangalore',
    address: '42, SP Road, Electronic District',
    pinCode: '560002',
    msmeCategory: 'Micro',
    status: 'Active',
    ledgerBalance: 325400.00,
    tdsApplicable: true,
    tdsSection: '194J',
    tdsRate: 10,
    bankAccount: '10045938291',
    ifsc: 'SBIN0004532',
    createdBy: 'system',
    createdAt: '2026-04-10T11:00:00-07:00'
  },
  {
    id: 'vendor-2',
    companyName: 'Vardhman Textiles & Yarn Ltd',
    contactName: 'Nitin Oswal',
    email: 'b2b@vardhmanyarns.com',
    phone: '+91 161 240 5000',
    pan: 'AABCV2011M',
    gstin: '03AABCV2011M1Z8', // 03 = Punjab
    state: 'Punjab',
    city: 'Ludhiana',
    address: 'Industrial Area-A, Chandigarh Road',
    pinCode: '141010',
    msmeCategory: 'None',
    status: 'Active',
    ledgerBalance: 1245000.00,
    tdsApplicable: true,
    tdsSection: '194Q',
    tdsRate: 0.1,
    bankAccount: '0543200908123',
    ifsc: 'ICIC0000543',
    createdBy: 'system',
    createdAt: '2026-03-15T09:30:00-07:00'
  },
  {
    id: 'vendor-3',
    companyName: 'Apex Packaging Logistics',
    contactName: 'Rajesh Solanki',
    email: 'info@apexpack.co.in',
    phone: '+91 22 2845 9000',
    pan: 'AAMFA5567D',
    gstin: '27AAMFA5567D2Z2', // 27 = Maharashtra (Local)
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'Gala No 14, Phase 2, MIDC, Andheri East',
    pinCode: '400093',
    msmeCategory: 'Medium',
    status: 'Active',
    ledgerBalance: 84300.00,
    tdsApplicable: true,
    tdsSection: '194C',
    tdsRate: 2,
    bankAccount: '9200200421234',
    ifsc: 'UTIB0000293',
    createdBy: 'system',
    createdAt: '2026-05-02T14:45:00-07:00'
  },
  {
    id: 'vendor-4',
    companyName: 'Rajesh Plastics & Moulds',
    contactName: 'Harish Patel',
    email: 'sales@rajeshplastics.com',
    phone: '+91 79 2583 4000',
    pan: 'ABDPP0921A',
    gstin: '24ABDPP0921A1Z9', // 24 = Gujarat
    state: 'Gujarat',
    city: 'Ahmedabad',
    address: 'Phase-IV, GIDC Vatva',
    pinCode: '382445',
    msmeCategory: 'Small',
    status: 'Inactive',
    ledgerBalance: 0.00,
    tdsApplicable: false,
    tdsSection: 'None',
    tdsRate: 0,
    bankAccount: '04840200001045',
    ifsc: 'BARB0VatvaX',
    createdBy: 'system',
    createdAt: '2026-01-20T10:15:00-07:00'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'EL-HDMI-10M',
    name: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)',
    category: 'Electronics Accessories',
    hsnCode: '85444299', // HSN standard for insulated copper conductor cables
    gstRate: 18,
    cessRate: 0,
    purchasePrice: 420.00,
    sellingPrice: 850.00,
    minStockLevel: 50,
    currentStock: 195,
    status: 'Active',
    vendorId: 'vendor-1',
    image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80'
  },
  {
    id: 'prod-2',
    sku: 'PK-BOX-12X12',
    name: 'Eco-Friendly Heavy Duty Double Wall Kraft Box 12x12x12 Inches',
    category: 'Packaging Materials',
    hsnCode: '48191000', // Cartons, boxes, cases of corrugated paper/board
    gstRate: 12,
    cessRate: 0,
    purchasePrice: 28.00,
    sellingPrice: 52.00,
    minStockLevel: 300,
    currentStock: 940,
    status: 'Active',
    vendorId: 'vendor-3',
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80'
  },
  {
    id: 'prod-3',
    sku: 'PL-CAB-TIE-500',
    name: 'Industrial Nylon Cable Ties 400mm White (Pack of 500)',
    category: 'Plastics & Closures',
    hsnCode: '39269099', // Other articles of plastics
    gstRate: 18,
    cessRate: 0,
    purchasePrice: 150.00,
    sellingPrice: 310.00,
    minStockLevel: 60,
    currentStock: 45, // Alert: Low Stock
    status: 'Active',
    vendorId: 'vendor-4',
    image: 'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=400&q=80'
  },
  {
    id: 'prod-4',
    sku: 'TX-POLY-THREAD',
    name: 'Premium Polyester High Tensile Sewing Thread Cone - 5000 Meters',
    category: 'Textiles & Threads',
    hsnCode: '54011000', // Sewing thread of synthetic filaments
    gstRate: 5,
    cessRate: 0,
    purchasePrice: 85.00,
    sellingPrice: 145.00,
    minStockLevel: 100,
    currentStock: 0, // Out of Stock
    status: 'Active',
    vendorId: 'vendor-2',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80'
  },
  {
    id: 'prod-5',
    sku: 'EL-USB-HUB-7P',
    name: '7-Port USB 3.0 Powered Hub with Individual Switches',
    category: 'Electronics Accessories',
    hsnCode: '84718000', // HSN standard for computer hub connectors
    gstRate: 18,
    cessRate: 0,
    purchasePrice: 650.00,
    sellingPrice: 1250.00,
    minStockLevel: 25,
    currentStock: 14, // Alert: Low Stock
    status: 'Active',
    vendorId: 'vendor-1',
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&q=80'
  }
];

export const INITIAL_INVENTORY_LOGS: InventoryLog[] = [
  {
    id: 'log-1',
    productId: 'prod-1',
    type: 'Inward',
    quantity: 200,
    batchNumber: 'BAT-EL-26MAY-01',
    expiryDate: undefined,
    referenceId: 'PO-2026-0034',
    notes: 'Standard warehouse stocking from Kalyani Hub. Verified HSN and GSTR-2A matching.',
    createdByName: 'Sunil Kumar (Inventory Admin)',
    createdAt: '2026-05-28T10:00:00-07:00'
  },
  {
    id: 'log-2',
    productId: 'prod-3',
    type: 'Outward',
    quantity: -15,
    batchNumber: 'BAT-PL-26APR-12',
    referenceId: 'SO-20260618-9382',
    notes: 'Fulfilled Amazon India merchant order.',
    createdByName: 'Aniket Shinde (Packing Lead)',
    createdAt: '2026-06-18T16:20:00-07:00'
  },
  {
    id: 'log-3',
    productId: 'prod-2',
    type: 'Inward',
    quantity: 1000,
    batchNumber: 'BAT-PK-26JUN-02',
    referenceId: 'PO-2026-0041',
    notes: 'Bulk purchase of boxing cartons. Locally procured inside Maharashtra (Apex Packaging), eligible for complete CGST/SGST Input Tax Credit.',
    createdByName: 'Sunil Kumar (Inventory Admin)',
    createdAt: '2026-06-12T11:45:00-07:00'
  },
  {
    id: 'log-4',
    productId: 'prod-5',
    type: 'Damaged',
    quantity: -2,
    batchNumber: 'BAT-EL-26FEB-09',
    referenceId: 'AUDIT-ADJ-921',
    notes: 'Found crushed during forklift operations in Aisle B. Stock written off.',
    createdByName: 'Sunil Kumar (Inventory Admin)',
    createdAt: '2026-06-14T09:15:00-07:00'
  }
];

export const INITIAL_WAREHOUSE_LOCATIONS: WarehouseLocation[] = [
  { id: 'loc-1', aisle: 'A', rack: '1', shelf: '1', bin: 'A', currentProductId: 'prod-1', maxCapacity: 250, isOccupied: true },
  { id: 'loc-2', aisle: 'A', rack: '1', shelf: '1', bin: 'B', currentProductId: 'prod-5', maxCapacity: 100, isOccupied: true },
  { id: 'loc-3', aisle: 'A', rack: '2', shelf: '1', bin: 'A', currentProductId: undefined, maxCapacity: 200, isOccupied: false },
  { id: 'loc-4', aisle: 'B', rack: '1', shelf: '1', bin: 'A', currentProductId: 'prod-2', maxCapacity: 1000, isOccupied: true },
  { id: 'loc-5', aisle: 'B', rack: '1', shelf: '2', bin: 'B', currentProductId: undefined, maxCapacity: 500, isOccupied: false },
  { id: 'loc-6', aisle: 'C', rack: '3', shelf: '1', bin: 'A', currentProductId: 'prod-3', maxCapacity: 300, isOccupied: true },
  { id: 'loc-7', aisle: 'D', rack: '1', shelf: '1', bin: 'A', currentProductId: undefined, maxCapacity: 200, isOccupied: false }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SO-20260620-1001',
    customerName: 'Shree Balaji Retailers',
    customerGstin: '27AEEFB4928A1Z7', // Local Maharashtra (Inter-State or Intra-State? Intra-state!)
    customerState: 'Maharashtra',
    shippingAddress: 'Gala 4, Sector 7, Vashi Industrial Area',
    shippingPinCode: '400703',
    marketplace: 'Direct Channel',
    marketplaceOrderId: 'B2B-TX-94821',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)',
        sku: 'EL-HDMI-10M',
        quantity: 50,
        unitPrice: 850.00,
        hsnCode: '85444299',
        gstRate: 18,
        cgstAmount: 3825.00, // 50 * 850 = 42500. GST = 42500 * 18% = 7650. CGST = 3825, SGST = 3825, IGST = 0
        sgstAmount: 3825.00,
        igstAmount: 0.00,
        totalTax: 7650.00,
        subtotal: 50150.00
      },
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Eco-Friendly Heavy Duty Double Wall Kraft Box 12x12x12 Inches',
        sku: 'PK-BOX-12X12',
        quantity: 100,
        unitPrice: 52.00,
        hsnCode: '48191000',
        gstRate: 12,
        cgstAmount: 312.00, // 100 * 52 = 5200. GST = 5200 * 12% = 624. CGST = 312, SGST = 312, IGST = 0
        sgstAmount: 312.00,
        igstAmount: 0.00,
        totalTax: 624.00,
        subtotal: 5824.00
      }
    ],
    totalBeforeTax: 47700.00,
    totalCgst: 4137.00,
    totalSgst: 4137.00,
    totalIgst: 0.00,
    totalTax: 8274.00,
    totalRounding: 0.00,
    grandTotal: 55974.00,
    orderDate: '2026-06-20T10:30:00-07:00',
    status: 'Pending',
    assignedPicker: 'Rajesh Nair',
    assignedPacker: 'Mayur Satwan',
    courierPartner: 'DTDC',
    awbNumber: 'DTDC-493821045',
    ewayBillNumber: '141049382194', // Generated for values > Rs. 50,000 in Maharashtra
    invoiceNumber: 'TTGT-2627-0104',
    invoiceDate: '2026-06-20T11:00:00-07:00'
  },
  {
    id: 'SO-20260619-2002',
    customerName: 'Delhi Tech Emporium',
    customerGstin: '07ABCDF9934B1Z2', // 07 = Delhi (Inter-state from MH)
    customerState: 'Delhi',
    shippingAddress: 'Flat 204, Nehru Place Market IT Block',
    shippingPinCode: '110019',
    marketplace: 'Amazon India',
    marketplaceOrderId: '403-1294821-9842104',
    items: [
      {
        id: 'item-3',
        productId: 'prod-5',
        productName: '7-Port USB 3.0 Powered Hub with Individual Switches',
        sku: 'EL-USB-HUB-7P',
        quantity: 10,
        unitPrice: 1250.00,
        hsnCode: '84718000',
        gstRate: 18,
        cgstAmount: 0.00,
        sgstAmount: 0.00,
        igstAmount: 2250.00, // 10 * 1250 = 12500. GST = 2250 (Full IGST as inter-state)
        totalTax: 2250.00,
        subtotal: 14750.00
      }
    ],
    totalBeforeTax: 12500.00,
    totalCgst: 0.00,
    totalSgst: 0.00,
    totalIgst: 2250.00,
    totalTax: 2250.00,
    totalRounding: 0.00,
    grandTotal: 14750.00,
    orderDate: '2026-06-19T14:15:00-07:00',
    status: 'Packed',
    assignedPicker: 'Karan Patil',
    assignedPacker: 'Mayur Satwan',
    courierPartner: 'Delhivery',
    awbNumber: 'DELH-894109403',
    ewayBillNumber: '', // Not required as grand total < 50,000 (though some states differ, Delhi has limit 1 Lakh - MH is 50k, inter-state standard is 50k)
    invoiceNumber: 'TTGT-2627-0103',
    invoiceDate: '2026-06-19T15:00:00-07:00'
  },
  {
    id: 'SO-20260615-3004',
    customerName: 'Indore Electronics World',
    customerGstin: undefined, // Unregistered Retail Customer B2C
    customerState: 'Madhya Pradesh',
    shippingAddress: '42, MG Road, Opposite Treasure Island Mall',
    shippingPinCode: '452001',
    marketplace: 'Meesho',
    marketplaceOrderId: 'MEESH-ORD-9281045',
    items: [
      {
        id: 'item-4',
        productId: 'prod-1',
        productName: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)',
        sku: 'EL-HDMI-10M',
        quantity: 2,
        unitPrice: 850.00,
        hsnCode: '85444299',
        gstRate: 18,
        cgstAmount: 0.00,
        sgstAmount: 0.00,
        igstAmount: 306.00, // 1700 * 18% = 306
        totalTax: 306.00,
        subtotal: 2006.00
      }
    ],
    totalBeforeTax: 1700.00,
    totalCgst: 0.00,
    totalSgst: 0.00,
    totalIgst: 306.00,
    totalTax: 306.00,
    totalRounding: 0.00,
    grandTotal: 2006.00,
    orderDate: '2026-06-15T18:00:00-07:00',
    status: 'Dispatched',
    courierPartner: 'Blue Dart',
    awbNumber: 'BDART-4921094',
    invoiceNumber: 'TTGT-2627-0102',
    invoiceDate: '2026-06-15T19:30:00-07:00'
  }
];

export const INITIAL_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'tx-1',
    date: '2026-06-18',
    referenceNo: 'TTGT-2627-0103',
    type: 'Collection In',
    partyName: 'Delhi Tech Emporium',
    gstin: '07ABCDF9934B1Z2',
    amount: 14750.00,
    taxAmount: 2250.00,
    description: 'Received full credit payment for Hub shipments. GSTR-1 filed in GST portal.',
    status: 'Approved'
  },
  {
    id: 'tx-2',
    date: '2026-06-10',
    referenceNo: 'VCH-2026-940',
    type: 'Payment Out',
    partyName: 'Kalyani Electronics Component Hub',
    gstin: '29APKPK8934L1Z3',
    amount: 120000.00,
    taxAmount: 18305.00,
    tdsAmount: 12000.00, // Section 194J 10% on professional or technical hub services
    tdsSection: '194J',
    description: 'Settlement draft against May procurements. TDS deducted at 10% under Section 194J.',
    status: 'Paid'
  },
  {
    id: 'tx-3',
    date: '2026-06-20',
    referenceNo: 'GST-PAY-26JUN',
    type: 'GST Liability',
    partyName: 'Goods and Services Tax Portal',
    amount: 45890.00,
    taxAmount: 45890.00,
    description: 'Challan generation and payment for GSTR-3B filings of May 2026.',
    status: 'Filed'
  },
  {
    id: 'tx-4',
    date: '2026-06-15',
    referenceNo: 'TDS-CH-9432',
    type: 'TDS Liability',
    partyName: 'Income Tax Department (India)',
    amount: 22400.00,
    taxAmount: 0,
    description: 'Monthly deposits of tax deducted at source (TDS) under Section 194C, 194J and 194Q for May.',
    status: 'Filed'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Devid Jhon', email: 'devid01jhon@gmail.com', role: UserRole.SUPER_ADMIN, status: 'Active', department: 'Executive Management', pan: 'BJHPD1082K' },
  { id: 'emp-2', name: 'Meera Iyer', email: 'meera.i@ttgt.com', role: UserRole.FINANCE, status: 'Active', department: 'Corporate Accounts & Taxes', pan: 'AJFPI4923M' },
  { id: 'emp-3', name: 'Sunil Kumar', email: 'sunil.k@ttgt.com', role: UserRole.INVENTORY_MANAGER, status: 'Active', department: 'Supply Chain & Sourcing', pan: 'BSSPK9032A' },
  { id: 'emp-4', name: 'Mayur Satwan', email: 'mayur.s@ttgt.com', role: UserRole.PACKING_STAFF, status: 'Active', department: 'Warehouse Dispatch', pan: 'CZSPS4938D' },
  { id: 'emp-5', name: 'Karan Patil', email: 'karan.p@ttgt.com', role: UserRole.WAREHOUSE_MANAGER, status: 'Active', department: 'Logistics Facility', pan: 'AAKPP4955D' }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    userEmail: 'devid01jhon@gmail.com',
    userName: 'Devid Jhon',
    role: 'Super Admin',
    action: 'GST Return Sync',
    details: 'Initiated complete matching run of GSTR-2B Input Tax Credit logs with Vardhman Textiles ledger books. Matching accuracy 99.8%.',
    ipAddress: '103.241.12.98',
    timestamp: '2026-06-20T18:45:00-07:00'
  },
  {
    id: 'audit-2',
    userEmail: 'meera.i@ttgt.com',
    userName: 'Meera Iyer',
    role: 'Finance Auditor',
    action: 'Invoice Verification',
    details: 'Approved Tax Invoice TTGT-2627-0104 with correct HSN 85444299 and 4137.00/each local CGST + SGST splits.',
    ipAddress: '103.241.12.102',
    timestamp: '2026-06-20T11:05:00-07:00'
  },
  {
    id: 'audit-3',
    userEmail: 'mayur.s@ttgt.com',
    userName: 'Mayur Satwan',
    role: 'Packing Staff',
    action: 'Order Packing',
    details: 'Marked SO-20260619-2002 (Delhi Tech) packed and sealed in size PK-BOX-12X12 box with DTDC shipping labeling applied.',
    ipAddress: '192.168.10.42',
    timestamp: '2026-06-19T14:58:00-07:00'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert!',
    message: 'Nylon Cable Ties (39269099) count of 45 is below critical threshold of 60 items. Re-order immediately from Rajesh Plastics.',
    type: 'warning',
    timestamp: '2026-06-20T19:00:00-07:00',
    read: false
  },
  {
    id: 'notif-2',
    title: 'GST GSTR-3B Generated',
    message: 'Monthly tax summary of INR 45,890 ready for approval. Verification checklist with HSN summaries is synchronized.',
    type: 'success',
    timestamp: '2026-06-20T14:00:00-07:00',
    read: false
  },
  {
    id: 'notif-3',
    title: 'System Re-indexed',
    message: 'PostgreSQL DB performance tables synchronized. Triggers for modified timestamps active globally.',
    type: 'info',
    timestamp: '2026-06-20T08:00:00-07:00',
    read: true
  }
];
