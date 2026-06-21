/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WmsWarehouse {
  id: string;
  name: string;
  code: string;
  type: 'Central' | 'Regional' | 'Spoke' | 'Cold Storage' | 'Direct-to-Retail';
  isPrimary: boolean;
  address: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string; // India
  managerName: string;
  contactNumber: string;
  email: string;
  totalCapacitySqFt: number;
  currentUtilizationPercent: number;
  gpsCoordinates: string;
  workingHours: string;
  status: 'Active' | 'Inactive';
}

export interface WmsWarehouseLocation {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  zone: string; // e.g., 'Zone A - Electronics'
  aisle: string; // e.g., '01'
  rack: string;  // e.g., 'R3'
  shelf: string; // e.g., 'S2'
  bin: string;   // e.g., 'B1'
  isOccupied: boolean;
  maxWeightCapacityKg: number;
  currentProductId?: string;
  currentQuantity?: number;
}

export interface WmsBatchMaster {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  sku: string;
  manufacturingDate: string;
  expiryDate: string;
  lotNumber: string;
  supplierBatchNumber: string;
  status: 'Released' | 'Quarantined' | 'Expired' | 'Under Inspection';
  quantity: number;
  warehouseId: string;
  stateOfOrigin: string; // GST related
}

export interface WmsSerialNumber {
  id: string;
  serialNumber: string;
  imei?: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber?: string;
  warehouseId: string;
  locationLabel: string; // e.g., A-1-1-A
  warrantyExpiryDate?: string;
  status: 'In Stock' | 'Allocated' | 'Dispatched' | 'Returned' | 'Damaged';
  createdAt: string;
}

export interface WmsGoodsReceipt {
  id: string; // GRN-2026-XXXX
  grnDate: string;
  vendorId: string;
  vendorName: string;
  poNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  productId: string;
  productName: string;
  sku: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalValue: number;
  remarks: string;
  isPutAwayCommitted: boolean;
  assignedLocation?: string; // Put-away location
  batchNumber: string;
  expiryDate?: string;
  serialNumbers?: string[];
}

export interface WmsStockTransfer {
  id: string; // ST-2026-XXXX
  transferDate: string;
  productId: string;
  productName: string;
  sku: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  fromLocation: string; // e.g., A-1-1-A
  toLocation: string; // e.g., B-2-3-C
  quantity: number;
  batchNumber?: string;
  serialNumbers?: string[];
  requestedBy: string;
  approvedBy?: string;
  status: 'Pending Approval' | 'Approved' | 'In Transit' | 'Received' | 'Rejected';
  remarks: string;
}

export interface WmsStockAdjustment {
  id: string; // SA-2026-XXXX
  adjustmentDate: string;
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  locationLabel: string;
  batchNumber?: string;
  serialNumbers?: string[];
  adjustmentType: 'Increase' | 'Decrease' | 'Damage' | 'Lost' | 'Found' | 'Correction';
  quantity: number; // always positive in quantity, logic does math
  reasonCode: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  remarks: string;
}

export interface WmsInventoryAudit {
  id: string; // AUD-2026-XXXX
  auditDate: string;
  warehouseId: string;
  warehouseName: string;
  auditorName: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  totalSkusAudited: number;
  discrepanciesFound: number;
  notes: string;
  items: WmsInventoryAuditItem[];
}

export interface WmsInventoryAuditItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  locationLabel: string;
  batchNumber?: string;
  systemQuantity: number;
  physicalQuantity: number;
  discrepancyQuantity: number;
  adjustmentStatus: 'No Action' | 'Pending Adjustment' | 'Adjusted';
}

export interface WmsDispatchLog {
  id: string; // DISP-2026-XXXX
  orderId: string;
  customerName: string;
  dispatchDate: string;
  courierPartner: string;
  trackingNumber: string;
  vehicleDetails?: string;
  driverName?: string;
  driverContact?: string;
  packageWeightKg: number;
  dimensionsCm: string; // e.g. 30x20x15
  ewayBillNumber?: string;
  status: 'Dispatched' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Returned';
  remarks?: string;
}
