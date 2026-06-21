/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../../types';

// Extend the basic Product from main types to add full PIM fields
export interface PimProduct extends Product {
  shortName?: string;
  productCode?: string;
  barcode?: string;
  qrCode?: string;
  brand?: string;
  subCategory?: string;
  productType: 'Simple' | 'Variable' | 'Bundle' | 'Combo' | 'Digital' | 'Service' | 'Serialized' | 'Batch' | 'Expiry';
  unit?: string;
  countryOfOrigin?: string;
  manufacturer?: string;
  modelNumber?: string;
  partNumber?: string;
  serialNumber?: string;

  // Expanded Pricing
  landingCost?: number;
  mrp?: number;
  wholesalePrice?: number;
  distributorPrice?: number;
  retailPrice?: number;
  minSellingPrice?: number;
  maxDiscountPercentage?: number;

  // Expanded GST compliance
  gstApplicable?: 'Yes' | 'No';
  reverseCharge?: boolean;
  inputTaxCredit?: boolean;
  gstInclusive?: boolean; // toggled inclusive/exclusive pricing

  // Product Physical Specs
  weight?: number; // kg
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  packageWeight?: number; // kg
  packageLength?: number; // cm
  packageWidth?: number; // cm
  packageHeight?: number; // cm

  // Enhanced Inventory
  trackInventory?: boolean;
  maxStock?: number;
  reorderLevel?: number;
  safetyStock?: number;
  openingStock?: number;
  openingValue?: number;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  serialTracking?: boolean;

  // Variants list (for Variable or Multi Variant Products)
  variantsList?: ProductVariantItem[];

  // Image assets
  galleryImages?: string[];
  videoUrl?: string;
  imageAltText?: string;

  // Marketplaces setup
  marketplaces?: Record<string, MarketplaceConfig>;

  // Descriptions
  shortDescription?: string;
  longDescription?: string;
  specifications?: ProductSpecification[];
  features?: string[];
  packageContents?: string;
  warranty?: string;
  careInstructions?: string;
  returnPolicy?: string;
  replacementPolicy?: string;

  // SEO meta
  seoTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlSlug?: string;

  // Approval status stage flow
  approvalStatus: 'Draft' | 'Submitted' | 'Pending Review' | 'Approved' | 'Rejected' | 'Archived';
  approvalRemarks?: string;

  // Tracking history
  historyLogs?: PimHistoryLog[];
}

export interface ProductVariantItem {
  id: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>; // e.g., { "Color": "Red", "Size": "XL" }
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface MarketplaceConfig {
  enabled: boolean;
  sku: string;
  sellingPrice: number;
  description?: string;
  image?: string;
  status: 'Active' | 'Inactive';
}

export interface PimHistoryLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
}

// Support definitions for metadata categories
export interface PimCategory {
  id: string;
  name: string;
  code: string; // classification code
  description?: string;
  hsnDefault?: string;
}

export interface PimSubCategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
}

export interface PimBrand {
  id: string;
  name: string;
  logo?: string;
  manufacturer?: string;
  country?: string;
  description?: string;
}

export interface PimAttribute {
  id: string;
  name: string;
  values: string[];
}
