/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  WAREHOUSE_MANAGER = 'Warehouse Manager',
  INVENTORY_MANAGER = 'Inventory Manager',
  PACKING_STAFF = 'Packing Staff',
  CUSTOMER_SUPPORT = 'Customer Support',
  FINANCE = 'Finance',
  VENDOR = 'Vendor',
  READ_ONLY = 'Read Only'
}

export interface PermissionSet {
  viewDashboard: boolean;
  manageVendors: boolean;
  manageProducts: boolean;
  manageInventory: boolean;
  warehouseOperations: boolean;
  manageOrders: boolean;
  manageFinance: boolean;
  manageEmployees: boolean;
  useAICenter: boolean;
  editSettings: boolean;
}

export interface CompanySettings {
  companyName: string;
  companyType: 'Private Limited' | 'Public Limited' | 'Partnership' | 'Proprietorship';
  gstin: string;
  pan: string;
  cin: string;
  tan: string;
  msmeType: 'Micro' | 'Small' | 'Medium' | 'None';
  udyamRegistration: string;
  email: string;
  phone: string;
  addressLines: string;
  state: string;
  city: string;
  pinCode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  digitalSignatureUrl?: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  state: string;
  city: string;
  address: string;
  pinCode: string;
  msmeCategory: 'Micro' | 'Small' | 'Medium' | 'None';
  status: 'Active' | 'Inactive';
  ledgerBalance: number;
  tdsApplicable: boolean;
  tdsSection: '194C' | '194J' | '194Q' | 'None';
  tdsRate: number; // percentage
  bankAccount: string;
  ifsc: string;
  createdBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  hsnCode: string; // 6 or 8 digits standard
  gstRate: 0 | 5 | 12 | 18 | 28;
  cessRate: number; // standard cess if any
  purchasePrice: number;
  sellingPrice: number;
  minStockLevel: number;
  currentStock: number;
  status: 'Active' | 'Inactive';
  vendorId: string;
  image?: string;

  // Extra PIM descriptors (optional)
  shortName?: string;
  productCode?: string;
  barcode?: string;
  qrCode?: string;
  brand?: string;
  subCategory?: string;
  productType?: string;
  unit?: string;
  countryOfOrigin?: string;
  manufacturer?: string;
  modelNumber?: string;
  partNumber?: string;
  serialNumber?: string;

  purchasePriceTaxExcluded?: boolean;
  landingCost?: number;
  mrp?: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  retailPrice?: number;
  minSellingPrice?: number;
  maxDiscountPercentage?: number;

  gstApplicable?: string;
  inputTaxCredit?: boolean;
  reverseCharge?: boolean;
  gstInclusive?: boolean;

  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  packageWeight?: number;

  trackInventory?: boolean;
  maxStock?: number;
  reorderLevel?: number;
  safetyStock?: number;
  openingStock?: number;
  openingValue?: number;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  serialTracking?: boolean;

  variantsList?: any[];
  galleryImages?: string[];
  videoUrl?: string;
  imageAltText?: string;

  marketplaces?: any;

  shortDescription?: string;
  longDescription?: string;
  specifications?: any[];
  features?: string[];
  packageContents?: string;
  warranty?: string;
  careInstructions?: string;
  returnPolicy?: string;
  replacementPolicy?: string;

  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlSlug?: string;
  approvalStatus?: string;
  approvalRemarks?: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  type: 'Inward' | 'Outward' | 'Audit Adjustment' | 'Damaged';
  quantity: number;
  batchNumber: string;
  expiryDate?: string;
  referenceId: string; // Purchase Order or Sales Order or AWB
  notes: string;
  createdByName: string;
  createdAt: string;
}

export interface WarehouseLocation {
  id: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  currentProductId?: string;
  maxCapacity: number;
  isOccupied: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  hsnCode: string;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  subtotal: number;
}

export interface Order {
  id: string; // SO-2026-XXXX
  customerName: string;
  customerGstin?: string;
  customerState: string;
  shippingAddress: string;
  shippingPinCode: string;
  marketplace: 'Amazon India' | 'Flipkart' | 'Meesho' | 'Myntra' | 'Direct Channel';
  marketplaceOrderId: string;
  items: OrderItem[];
  totalBeforeTax: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  totalRounding: number;
  grandTotal: number;
  orderDate: string;
  status: 'New Order' | 'Pending Confirmation' | 'Confirmed' | 'Inventory Reserved' | 'Picking' | 'Packing' | 'Quality Check' | 'Ready To Dispatch' | 'Courier Assigned' | 'Dispatched' | 'In Transit' | 'Out For Delivery' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded' | 'Closed' | 'Pending' | 'Picked' | 'Packed';
  assignedPicker?: string;
  assignedPacker?: string;
  courierPartner?: 'Delhivery' | 'Blue Dart' | 'DTDC' | 'Amazon Shippable' | 'None';
  awbNumber?: string;
  ewayBillNumber?: string;
  invoiceNumber?: string;
  invoiceDate?: string;

  // OMS Enterprise properties
  customerMobile?: string;
  customerEmail?: string;
  billingAddress?: string;
  billingPinCode?: string;
  paymentMode?: 'COD' | 'Prepaid' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'Cash';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paymentReference?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  warehouse?: string;
  expectedDeliveryDate?: string;
  isBusinessOrder?: boolean;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  remarks?: string;
  timestamp: string;
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  mode: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionRef?: string;
  gateway?: string;
  timestamp: string;
}

export interface OrderRefund {
  id: string;
  orderId: string;
  refundRequestNo: string;
  amount: number;
  method: 'Bank Transfer' | 'Original Payment Mode' | 'Store Credit';
  status: 'Pending Approval' | 'Approved' | 'Refunded' | 'Rejected';
  referenceNo?: string;
  requestedBy: string;
  approvedBy?: string;
  reason: string;
  remarks?: string;
  timestamp: string;
}

export interface OrderReturn {
  id: string;
  orderId: string;
  returnRequestNo: string;
  reason: string;
  pickupAddress: string;
  pickupPinCode: string;
  returnedQuantity: number;
  status: 'Requested' | 'Pickup Scheduled' | 'Out for Return Pickup' | 'Received' | 'Inspected & Restocked' | 'Rejected';
  inspectionNotes?: string;
  restockedInWarehouse?: string;
  timestamp: string;
}

export interface OrderExchange {
  id: string;
  originalOrderId: string;
  exchangeOrderId: string;
  replacementSku: string;
  replacementQuantity: number;
  reason: string;
  status: 'Pending Dispatch' | 'Dispatched' | 'Completed';
  timestamp: string;
}

export interface ShippingDetails {
  id: string;
  orderId: string;
  courierPartner: string;
  trackingNumber?: string;
  shippingLabelUrl?: string;
  manifestNumber?: string;
  dispatchDate?: string;
  estimatedDelivery?: string;
  deliveryAttempts: number;
  lastAttemptNotes?: string;
}

export interface CourierAssignment {
  id: string;
  orderId: string;
  eligibleCouriers: string[];
  assignedCourier: string;
  costEstimate: number;
  slaDays: number;
  assignedTimestamp: string;
}

export interface PackingDetails {
  id: string;
  orderId: string;
  packerName: string;
  materialUsed: string;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  checklistVerified: boolean;
  timestamp: string;
}

export interface PickingDetails {
  id: string;
  orderId: string;
  pickerName: string;
  pickingListNo: string;
  itemsPickedCount: number;
  totalItemsCount: number;
  barcodeVerified: boolean;
  status: 'Not Started' | 'In Progress' | 'Completed';
  timestamp: string;
}

export interface QualityCheckRecord {
  id: string;
  orderId: string;
  inspectorName: string;
  productMatchVerified: boolean;
  barcodeVerified: boolean;
  imageVerified: boolean;
  packagingOk: boolean;
  status: 'Passed' | 'Failed';
  qcNotes?: string;
  timestamp: string;
}

export interface OrderActivityLog {
  id: string;
  orderId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  referenceNo: string; // e.g. Inv, Voucher
  type: 'Payment Out' | 'Collection In' | 'GST Liability' | 'ITC Claimed' | 'TDS Liability';
  partyName: string;
  gstin?: string;
  amount: number;
  taxAmount: number;
  tdsAmount?: number;
  tdsSection?: string;
  description: string;
  status: 'Draft' | 'Approved' | 'Paid' | 'Filed';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  department: string;
  uan?: string;
  pan: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}
