/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  WmsWarehouse, 
  WmsWarehouseLocation, 
  WmsBatchMaster, 
  WmsSerialNumber,
  WmsGoodsReceipt,
  WmsStockTransfer,
  WmsStockAdjustment,
  WmsInventoryAudit,
  WmsDispatchLog
} from './wmsTypes';

export const INITIAL_WMS_WAREHOUSES: WmsWarehouse[] = [
  {
    id: 'wh-1',
    name: 'TTGT Mumbai Central Fulfillment Logistics',
    code: 'BOM-MAIN-01',
    type: 'Central',
    isPrimary: true,
    address: 'Plot No. 12, Sector 2, MIDC Industrial Area, Kopar Khairane',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    pinCode: '400710',
    country: 'India',
    managerName: 'Sunil Kumar',
    contactNumber: '+91 98200 12345',
    email: 'bom01.ops@ttgtsolutions.com',
    totalCapacitySqFt: 55000,
    currentUtilizationPercent: 72,
    gpsCoordinates: '19.1034° N, 73.0125° E',
    workingHours: '09:00 AM - 08:30 PM (Mon-Sat)',
    status: 'Active'
  },
  {
    id: 'wh-2',
    name: 'TTGT Bangalore South Regional Logistics Hub',
    code: 'BLR-REG-02',
    type: 'Regional',
    isPrimary: false,
    address: 'Survey No. 45/2, Hoodi Village, Mahadevapura Outer Ring Road',
    city: 'Bengaluru',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    pinCode: '560048',
    country: 'India',
    managerName: 'Ramesh Gowda',
    contactNumber: '+91 99450 67890',
    email: 'blr02.ops@ttgtsolutions.com',
    totalCapacitySqFt: 35000,
    currentUtilizationPercent: 48,
    gpsCoordinates: '12.9912° N, 77.7121° E',
    workingHours: '08:30 AM - 07:00 PM (Mon-Sat)',
    status: 'Active'
  },
  {
    id: 'wh-3',
    name: 'TTGT National Capital Region Hub (Noida)',
    code: 'DEL-NCR-03',
    type: 'Spoke',
    isPrimary: false,
    address: 'C-56, Sector 63, Noida Phase II',
    city: 'Noida',
    district: 'Gautam Buddha Nagar',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    country: 'India',
    managerName: 'Arvind Tyagi',
    contactNumber: '+91 98110 54321',
    email: 'del03.ops@ttgtsolutions.com',
    totalCapacitySqFt: 22000,
    currentUtilizationPercent: 88,
    gpsCoordinates: '28.6214° N, 77.3812° E',
    workingHours: '24 Hours Operational',
    status: 'Active'
  }
];

export const INITIAL_WMS_LOCATIONS: WmsWarehouseLocation[] = [
  // BOM Warehouse Locations
  { id: 'wloc-1', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row A - Raw Materials', aisle: '01', rack: 'R1', shelf: 'S1', bin: 'B1', isOccupied: true, maxWeightCapacityKg: 500, currentProductId: 'prod-1', currentQuantity: 120 },
  { id: 'wloc-2', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row A - Raw Materials', aisle: '01', rack: 'R1', shelf: 'S1', bin: 'B2', isOccupied: true, maxWeightCapacityKg: 500, currentProductId: 'prod-1', currentQuantity: 75 },
  { id: 'wloc-3', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row A - Raw Materials', aisle: '01', rack: 'R1', shelf: 'S2', bin: 'B1', isOccupied: false, maxWeightCapacityKg: 500 },
  { id: 'wloc-4', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row B - Packaging', aisle: '02', rack: 'R1', shelf: 'S1', bin: 'B1', isOccupied: true, maxWeightCapacityKg: 1000, currentProductId: 'prod-2', currentQuantity: 940 },
  { id: 'wloc-5', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row C - Plastics & Closures', aisle: '03', rack: 'R1', shelf: 'S1', bin: 'B1', isOccupied: true, maxWeightCapacityKg: 400, currentProductId: 'prod-3', currentQuantity: 45 },
  { id: 'wloc-6', warehouseId: 'wh-1', warehouseCode: 'BOM-MAIN-01', zone: 'Row D - Apparel', aisle: '04', rack: 'R2', shelf: 'S2', bin: 'B3', isOccupied: false, maxWeightCapacityKg: 300 },
  
  // BLR Warehouse Locations
  { id: 'wloc-7', warehouseId: 'wh-2', warehouseCode: 'BLR-REG-02', zone: 'Zone Alpha - Electronics', aisle: '11', rack: 'R2', shelf: 'S3', bin: 'B1', isOccupied: true, maxWeightCapacityKg: 600, currentProductId: 'prod-5', currentQuantity: 14 },
  { id: 'wloc-8', warehouseId: 'wh-2', warehouseCode: 'BLR-REG-02', zone: 'Zone Alpha - Electronics', aisle: '11', rack: 'R2', shelf: 'S3', bin: 'B2', isOccupied: false, maxWeightCapacityKg: 600 },
  { id: 'wloc-9', warehouseId: 'wh-2', warehouseCode: 'BLR-REG-02', zone: 'Zone Beta - Consumables', aisle: '12', rack: 'R1', shelf: 'S1', bin: 'B1', isOccupied: false, maxWeightCapacityKg: 350 },
  { id: 'wloc-10', warehouseId: 'wh-2', warehouseCode: 'BLR-REG-02', zone: 'Zone Beta - Consumables', aisle: '12', rack: 'R1', shelf: 'S2', bin: 'B2', isOccupied: false, maxWeightCapacityKg: 350 }
];

export const INITIAL_WMS_BATCHES: WmsBatchMaster[] = [
  {
    id: 'bat-1',
    batchNumber: 'BAT-EL-26MAY-01',
    productId: 'prod-1',
    productName: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)',
    sku: 'EL-HDMI-10M',
    manufacturingDate: '2026-05-10',
    expiryDate: '2029-05-10',
    lotNumber: 'LOT-BOM-9342',
    supplierBatchNumber: 'SUP-KAL-4011',
    status: 'Released',
    quantity: 120,
    warehouseId: 'wh-1',
    stateOfOrigin: 'Karnataka'
  },
  {
    id: 'bat-2',
    batchNumber: 'BAT-PK-26JUN-02',
    productId: 'prod-2',
    productName: 'Eco-Friendly Heavy Duty Double Wall Kraft Box 12x12x12 Inches',
    sku: 'PK-BOX-12X12',
    manufacturingDate: '2026-06-01',
    expiryDate: '2028-06-01',
    lotNumber: 'LOT-BOM-1422',
    supplierBatchNumber: 'SUP-APX-8311',
    status: 'Released',
    quantity: 940,
    warehouseId: 'wh-1',
    stateOfOrigin: 'Maharashtra'
  },
  {
    id: 'bat-3',
    batchNumber: 'BAT-PL-26APR-12',
    productId: 'prod-3',
    productName: 'Industrial Nylon Cable Ties 400mm White (Pack of 500)',
    sku: 'PL-CAB-TIE-500',
    manufacturingDate: '2026-04-12',
    expiryDate: '2027-04-12',
    lotNumber: 'LOT-BOM-0029',
    supplierBatchNumber: 'SUP-RAJ-7221',
    status: 'Released',
    quantity: 45,
    warehouseId: 'wh-1',
    stateOfOrigin: 'Gujarat'
  },
  {
    id: 'bat-4',
    batchNumber: 'BAT-EL-26FEB-09',
    productId: 'prod-5',
    productName: '7-Port USB 3.0 Powered Hub with Individual Switches',
    sku: 'EL-USB-HUB-7P',
    manufacturingDate: '2026-02-15',
    expiryDate: '2027-02-15', // Near Expiry/Expired
    lotNumber: 'LOT-BLR-8341',
    supplierBatchNumber: 'SUP-KAL-9002',
    status: 'Quarantined',
    quantity: 14,
    warehouseId: 'wh-2',
    stateOfOrigin: 'Karnataka'
  }
];

export const INITIAL_WMS_SERIALS: WmsSerialNumber[] = [
  { id: 'ser-1', serialNumber: 'SR-EL-HDMI-001', productId: 'prod-1', productName: 'HDMI Cable 10M', sku: 'EL-HDMI-10M', batchNumber: 'BAT-EL-26MAY-01', warehouseId: 'wh-1', locationLabel: '01-R1-S1-B1', status: 'In Stock', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'ser-2', serialNumber: 'SR-EL-HDMI-002', productId: 'prod-1', productName: 'HDMI Cable 10M', sku: 'EL-HDMI-10M', batchNumber: 'BAT-EL-26MAY-01', warehouseId: 'wh-1', locationLabel: '01-R1-S1-B1', status: 'In Stock', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'ser-3', serialNumber: 'SR-EL-HDMI-003', productId: 'prod-1', productName: 'HDMI Cable 10M', sku: 'EL-HDMI-10M', batchNumber: 'BAT-EL-26MAY-01', warehouseId: 'wh-1', locationLabel: '01-R1-S1-B2', status: 'In Stock', createdAt: '2026-05-28T10:00:00Z' },
  { id: 'ser-4', serialNumber: 'SR-EL-USB-7001', productId: 'prod-5', productName: '7-Port USB Hub', sku: 'EL-USB-HUB-7P', batchNumber: 'BAT-EL-26FEB-09', warehouseId: 'wh-2', locationLabel: '11-R2-S3-B1', status: 'In Stock', createdAt: '2026-06-12T11:45:00Z' },
  { id: 'ser-5', serialNumber: 'SR-EL-USB-7002', productId: 'prod-5', productName: '7-Port USB Hub', sku: 'EL-USB-HUB-7P', batchNumber: 'BAT-EL-26FEB-09', warehouseId: 'wh-2', locationLabel: '11-R2-S3-B1', status: 'Allocated', createdAt: '2026-06-12T11:45:00Z' }
];

export const INITIAL_WMS_GRNS: WmsGoodsReceipt[] = [
  {
    id: 'GRN-2026-0041',
    grnDate: '2026-06-12T11:45:00Z',
    vendorId: 'vendor-3',
    vendorName: 'Apex Packaging Logistics',
    poNumber: 'PO-2026-0038',
    invoiceNumber: 'INV-APX-831',
    invoiceDate: '2026-06-10',
    productId: 'prod-2',
    productName: 'Eco-Friendly Heavy Duty Double Wall Kraft Box 12x12x12 Inches',
    sku: 'PK-BOX-12X12',
    receivedQuantity: 1000,
    acceptedQuantity: 940,
    rejectedQuantity: 60, // Rejected due to water damage in transit
    taxableValue: 26320.00, // 940 * 28
    gstRate: 12,
    cgstAmount: 1579.20,
    sgstAmount: 1579.20,
    igstAmount: 0.00,
    totalValue: 29478.40,
    remarks: 'Water stain on lower stack pallets. Defective carton boxes quarantined.',
    isPutAwayCommitted: true,
    assignedLocation: '02-R1-S1-B1',
    batchNumber: 'BAT-PK-26JUN-02'
  },
  {
    id: 'GRN-2026-0042',
    grnDate: '2026-06-18T14:30:00Z',
    vendorId: 'vendor-1',
    vendorName: 'Kalyani Electronics Component Hub',
    poNumber: 'PO-2026-0039',
    invoiceNumber: 'INV-KAL-9011',
    invoiceDate: '2026-06-15',
    productId: 'prod-1',
    productName: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)',
    sku: 'EL-HDMI-10M',
    receivedQuantity: 80,
    acceptedQuantity: 80,
    rejectedQuantity: 0,
    taxableValue: 33600.00, // 80 * 420
    gstRate: 18,
    cgstAmount: 0.00,
    sgstAmount: 0.00,
    igstAmount: 6048.00, // Bangalore to Mumbai Inter-state
    totalValue: 39648.00,
    remarks: 'Sealed cartons received, high premium density copper rods.',
    isPutAwayCommitted: false,
    assignedLocation: '01-R1-S2-B1',
    batchNumber: 'BAT-EL-2026JUN-NEW'
  }
];

export const INITIAL_WMS_TRANSFERS: WmsStockTransfer[] = [
  {
    id: 'ST-20260615-001',
    transferDate: '2026-06-15T11:00:00Z',
    productId: 'prod-1',
    productName: 'HDMI Cable 10M',
    sku: 'EL-HDMI-10M',
    fromWarehouseId: 'wh-1',
    fromWarehouseName: 'BOM-MAIN-01',
    toWarehouseId: 'wh-2',
    toWarehouseName: 'BLR-REG-02',
    fromLocation: '01-R1-S1-B1',
    toLocation: '11-R2-S3-B2',
    quantity: 25,
    batchNumber: 'BAT-EL-26MAY-01',
    requestedBy: 'Sunil Kumar',
    approvedBy: 'Jai Dev',
    status: 'Received',
    remarks: 'Inter-warehouse stock replenishment via Delhivery Express.'
  },
  {
    id: 'ST-20260620-002',
    transferDate: '2026-06-20T17:30:00Z',
    productId: 'prod-3',
    productName: 'Cable Ties 400mm',
    sku: 'PL-CAB-TIE-500',
    fromWarehouseId: 'wh- wh-1',
    fromWarehouseName: 'BOM-MAIN-01',
    toWarehouseId: 'wh-3',
    toWarehouseName: 'DEL-NCR-03',
    fromLocation: '03-R1-S1-B1',
    toLocation: 'Pending Bin Assign',
    quantity: 10,
    batchNumber: 'BAT-PL-26APR-12',
    requestedBy: 'Sunil Kumar',
    status: 'Pending Approval',
    remarks: 'Noida server room dispatch request'
  }
];

export const INITIAL_WMS_ADJUSTMENTS: WmsStockAdjustment[] = [
  {
    id: 'SA-20260614-001',
    adjustmentDate: '2026-06-14T09:15:00Z',
    productId: 'prod-5',
    productName: '7-Port USB Hub',
    sku: 'EL-USB-HUB-7P',
    warehouseId: 'wh-1',
    warehouseName: 'BOM-MAIN-01',
    locationLabel: 'A-1-1-B',
    batchNumber: 'BAT-EL-26FEB-09',
    adjustmentType: 'Damage',
    quantity: 2,
    reasonCode: 'Forklift Crushed',
    requestedBy: 'Sunil Kumar',
    approvedBy: 'Jai Dev',
    status: 'Approved',
    remarks: 'Crushed writing off 2 damaged units'
  }
];

export const INITIAL_WMS_AUDITS: WmsInventoryAudit[] = [
  {
    id: 'AUD-20260619-01',
    auditDate: '2026-06-19T10:00:00Z',
    warehouseId: 'wh-1',
    warehouseName: 'BOM-MAIN-01',
    auditorName: 'Aniket Shinde',
    status: 'Completed',
    totalSkusAudited: 3,
    discrepanciesFound: 1,
    notes: 'Q1 general stock tally before financial audit close.',
    items: [
      { id: 'audi-1', productId: 'prod-1', productName: 'HDMI Cable 10M', sku: 'EL-HDMI-10M', locationLabel: '01-R1-S1-B1', batchNumber: 'BAT-EL-26MAY-01', systemQuantity: 120, physicalQuantity: 120, discrepancyQuantity: 0, adjustmentStatus: 'No Action' },
      { id: 'audi-2', productId: 'prod-2', productName: 'Kraft Box 12x12', sku: 'PK-BOX-12X12', locationLabel: '02-R1-S1-B1', batchNumber: 'BAT-PK-26JUN-02', systemQuantity: 940, physicalQuantity: 940, discrepancyQuantity: 0, adjustmentStatus: 'No Action' },
      { id: 'audi-3', productId: 'prod-3', productName: 'Cable Ties Pack', sku: 'PL-CAB-TIE-500', locationLabel: '03-R1-S1-B1', batchNumber: 'BAT-PL-26APR-12', systemQuantity: 42, physicalQuantity: 45, discrepancyQuantity: 3, adjustmentStatus: 'Adjusted' } // Found 3 loose packs
    ]
  }
];

export const INITIAL_WMS_DISPATCHES: WmsDispatchLog[] = [
  {
    id: 'DISP-20260620-1001',
    orderId: 'SO-20260620-1001',
    customerName: 'Shree Balaji Retailers',
    dispatchDate: '2026-06-20T16:00:00Z',
    courierPartner: 'Delhivery B2B cargo',
    trackingNumber: '74829302111',
    vehicleDetails: 'MH-43-AG-2931',
    driverName: 'Sanjay Dutt',
    driverContact: '+91 91234 56789',
    packageWeightKg: 42.5,
    dimensionsCm: '120x80x60',
    ewayBillNumber: '293810293122',
    status: 'Dispatched',
    remarks: 'Commercial vehicle gated out. Shipping invoice and e-Way bill generated.'
  }
];
