/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building,
  Layers, 
  Settings2, 
  Wrench, 
  Barcode, 
  ShieldCheck, 
  Image, 
  Globe, 
  History, 
  ClipboardList, 
  Plus, 
  TrendingUp, 
  Layers3, 
  LayoutDashboard,
  BookmarkCheck,
  Briefcase
} from 'lucide-react';
import { Product, Vendor } from '../types';
import { PimProduct, PimHistoryLog } from './products/pimTypes';

// Subcomponents imports
import ProductDashboard from './products/ProductDashboard';
import CategoriesManager from './products/CategoriesManager';
import BrandsManager from './products/BrandsManager';
import AttributesManager from './products/AttributesManager';
import SKUManager from './products/SKUManager';
import BarcodeManager from './products/BarcodeManager';
import ProductApproval from './products/ProductApproval';
import ProductImagesManager from './products/ProductImagesManager';
import ProductSEOManager from './products/ProductSEOManager';
import ProductHistoryManager from './products/ProductHistoryManager';
import ProductList from './products/ProductList';
import AddProduct from './products/AddProduct';

interface ProductsModuleProps {
  products: Product[];
  vendors: Vendor[];
  addProduct: (product: Omit<Product, 'id' | 'currentStock'>) => void;
  deleteProduct: (id: string) => void;
  searchQuery: string;
}

export default function ProductsModule({
  products: initialProducts,
  vendors,
  addProduct,
  deleteProduct,
  searchQuery
}: ProductsModuleProps) {
  // PIM workspace inner active view
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<string>('dashboard');
  const [editingProduct, setEditingProduct] = useState<PimProduct | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Upgrade parent simple product schema dynamically to fit PIM Product interface
  const products: PimProduct[] = initialProducts.map(p => {
    const upgraded: PimProduct = {
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      hsnCode: p.hsnCode,
      gstRate: p.gstRate,
      cessRate: p.cessRate || 0,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
      currentStock: p.currentStock,
      status: p.status,
      vendorId: p.vendorId,
      image: p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
      
      // Default extra PIM properties to safeguard code
      shortName: p.shortName || p.name.split(' ').slice(0, 3).join(' '),
      productCode: p.productCode || p.sku.split('-')[1] || '',
      barcode: p.barcode || `890${p.id.replace(/\D/g, '').slice(-8).padEnd(8, '0')}7`,
      qrCode: p.qrCode || '',
      brand: p.brand || (p.sku.startsWith('TX') ? 'Kraft Packs' : p.sku.startsWith('EL') ? 'EuroConductors' : 'Generic'),
      subCategory: p.subCategory || 'General Goods',
      productType: (p.productType as any) || 'Simple',
      unit: p.unit || 'Pcs',
      countryOfOrigin: p.countryOfOrigin || 'India',
      manufacturer: p.manufacturer || 'TTGT Solutions Associated Manufacturing',
      modelNumber: p.modelNumber || 'MOD-2026',
      partNumber: p.partNumber || `PN-${p.sku}`,
      serialNumber: p.serialNumber || '',

      purchasePriceTaxExcluded: p.purchasePriceTaxExcluded !== false,
      landingCost: p.landingCost || p.purchasePrice * 1.05,
      mrp: p.mrp || p.sellingPrice * 1.25,
      wholesalePrice: p.wholesalePrice || p.sellingPrice * 0.9,
      distributorPrice: p.distributorPrice || p.sellingPrice * 0.85,
      retailPrice: p.retailPrice || p.sellingPrice * 1.05,
      minSellingPrice: p.minSellingPrice || p.purchasePrice * 1.1,
      maxDiscountPercentage: p.maxDiscountPercentage || 25,

      gstApplicable: (p.gstApplicable as any) || 'Yes',
      inputTaxCredit: p.inputTaxCredit !== false,
      reverseCharge: p.reverseCharge === true,
      gstInclusive: p.gstInclusive === true,

      weight: p.weight || 0.5,
      length: p.length || 15,
      width: p.width || 10,
      height: p.height || 5,
      packageWeight: p.packageWeight || 0.6,

      trackInventory: p.trackInventory !== false,
      minStockLevel: p.minStockLevel || 10,
      maxStock: p.maxStock || 1000,
      reorderLevel: p.reorderLevel || 20,
      safetyStock: p.safetyStock || 15,
      openingStock: p.openingStock || 100,
      openingValue: p.openingValue || (100 * p.purchasePrice),
      batchTracking: p.batchTracking === true,
      expiryTracking: p.expiryTracking === true,
      serialTracking: p.serialTracking === true,

      variantsList: p.variantsList || [],
      galleryImages: p.galleryImages || [p.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80'],
      videoUrl: p.videoUrl || '',
      imageAltText: p.imageAltText || `${p.name} cover`,

      marketplaces: p.marketplaces || {
        amazon: { enabled: true, sku: `${p.sku}-AMZ`, sellingPrice: p.sellingPrice * 1.05, status: 'Active' }
      },

      shortDescription: p.shortDescription || `Order genuine ${p.name}. Wholesale distribution options available.`,
      longDescription: p.longDescription || '',
      specifications: p.specifications || [{ key: 'Certificates', value: 'ISO 9001, GSTR Compliant' }],
      features: p.features || ['High Durability', 'Excise Checked'],
      packageContents: p.packageContents || '1 Unit Master SKU Packaging',
      warranty: p.warranty || '1 Year domestic warranty',
      careInstructions: p.careInstructions || '',
      returnPolicy: p.returnPolicy || '7 Days replacement protection',
      replacementPolicy: p.replacementPolicy || '',

      seoTitle: p.seoTitle || `${p.name} | Wholsale Supplier India`,
      metaDescription: p.metaDescription || '',
      metaKeywords: p.metaKeywords || '',
      urlSlug: p.urlSlug || '',
      approvalStatus: (p.approvalStatus as any) || 'Approved',
      approvalRemarks: p.approvalRemarks || ''
    };
    return upgraded;
  });

  // LOCAL MEMORY STATE FOR SCHEMAS CATALOGS
  const [categories, setCategories] = useState<{ id: string; name: string; defaultHsn: string; count: number }[]>(() => {
    const stored = localStorage.getItem('pim_categories');
    return stored ? JSON.parse(stored) : [
      { id: 'cat-1', name: 'Electronics Accessories', defaultHsn: '85444299', count: 2 },
      { id: 'cat-2', name: 'Packaging Materials', defaultHsn: '48191010', count: 1 },
      { id: 'cat-3', name: 'Plastics & Closures', defaultHsn: '39235010', count: 1 },
      { id: 'cat-4', name: 'Textiles & Threads', defaultHsn: '54011010', count: 1 }
    ];
  });

  const [brands, setBrands] = useState<{ id: string; name: string; manufacturer: string; coOrigin: string; activeSKUs: number }[]>(() => {
    const stored = localStorage.getItem('pim_brands');
    return stored ? JSON.parse(stored) : [
      { id: 'b-1', name: 'EuroConductors', manufacturer: 'ElectroTech Industries Gwalior', coOrigin: 'India', activeSKUs: 2 },
      { id: 'b-2', name: 'Kraft Packs', manufacturer: 'Kraft & Carton Boxes Jaipur', coOrigin: 'India', activeSKUs: 1 },
      { id: 'b-3', name: 'PolySeals Ltd', manufacturer: 'Pragati Polymers Noida', coOrigin: 'India', activeSKUs: 1 },
      { id: 'b-4', name: 'Generic', manufacturer: 'Unbranded Stock', coOrigin: 'India', activeSKUs: 1 }
    ];
  });

  const [attributes, setAttributes] = useState<{ id: string; name: string; values: string[] }[]>(() => {
    const stored = localStorage.getItem('pim_attributes');
    return stored ? JSON.parse(stored) : [
      { id: 'attr-1', name: 'Color', values: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'Silver', 'White'] },
      { id: 'attr-2', name: 'Size', values: ['Small', 'Medium', 'Large', 'XL', '5 Meters', '10 Meters'] },
      { id: 'attr-3', name: 'Packing Configuration', values: ['Standard Box', 'Bulk Spool', 'Retail Bundle'] }
    ];
  });

  const [historyLogs, setHistoryLogs] = useState<PimHistoryLog[]>(() => {
    const stored = localStorage.getItem('pim_history_logs');
    return stored ? JSON.parse(stored) : [
      { id: 'h-1', timestamp: new Date(Date.now() - 432000000).toISOString(), userEmail: 'devid01jhon@gmail.com', action: 'Onboard SKU', details: 'Initialized EuroConductors base wire profile.', oldValue: 'Empty', newValue: 'EL-HDMI-10M' },
      { id: 'h-2', timestamp: new Date(Date.now() - 345600000).toISOString(), userEmail: 'devid01jhon@gmail.com', action: 'Price Revision', details: 'Revised general trade pricing on B2C networks.', oldValue: '₹800', newValue: '₹850' },
      { id: 'h-3', timestamp: new Date(Date.now() - 172800000).toISOString(), userEmail: 'devid01jhon@gmail.com', action: 'GST Alteration', details: 'Tariff correction under GSTR notifications.', oldValue: '12%', newValue: '18%' }
    ];
  });

  useEffect(() => { localStorage.setItem('pim_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('pim_brands', JSON.stringify(brands)); }, [brands]);
  useEffect(() => { localStorage.setItem('pim_attributes', JSON.stringify(attributes)); }, [attributes]);
  useEffect(() => { localStorage.setItem('pim_history_logs', JSON.stringify(historyLogs)); }, [historyLogs]);

  const [subCategories, setSubCategories] = useState<any[]>(() => {
    const stored = localStorage.getItem('pim_subcategories');
    return stored ? JSON.parse(stored) : [
      { id: 'sub-1', categoryId: 'cat-1', name: 'HDMI Cables', description: 'High definition audio-video wires' },
      { id: 'sub-2', categoryId: 'cat-2', name: 'Corrugated Boxes', description: 'Duplex paper board materials' },
      { id: 'sub-3', categoryId: 'cat-3', name: 'Bottle Caps 28mm', description: 'PP security caps' }
    ];
  });

  useEffect(() => { localStorage.setItem('pim_subcategories', JSON.stringify(subCategories)); }, [subCategories]);

  const handleAddValueToAttribute = (id: string, val: string) => {
    setAttributes(prev => prev.map(a => a.id === id ? { ...a, values: [...a.values, val] } : a));
  };

  const addHistoryLog = (action: string, details: string, oldValue?: string, newValue?: string) => {
    const newLog: PimHistoryLog = {
      id: `h-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: 'devid01jhon@gmail.com',
      action,
      details,
      oldValue,
      newValue
    };
    setHistoryLogs(prev => [newLog, ...prev]);
  };

  const handleEditProduct = (p: PimProduct) => {
    setEditingProduct(p);
    setIsAddingNew(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsAddingNew(true);
  };

  const handleSaveProduct = (formData: Omit<PimProduct, 'id' | 'currentStock'> & { id?: string; currentStock?: number }) => {
    if (formData.id) {
      // Perform manual property matching back to parent model bindings
      const checkOriginal = products.find(p => p.id === formData.id);
      
      // Update local storage values in parent loop
      const parentAdapted: Product = {
        id: formData.id,
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        hsnCode: formData.hsnCode,
        gstRate: formData.gstRate,
        cessRate: formData.cessRate,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        currentStock: formData.currentStock !== undefined ? formData.currentStock : 100,
        status: formData.status,
        vendorId: formData.vendorId,
        image: formData.image,
        
        // Pass extra variables
        brand: formData.brand,
        subCategory: formData.subCategory,
        productType: formData.productType,
        unit: formData.unit,
        countryOfOrigin: formData.countryOfOrigin,
        manufacturer: formData.manufacturer,
        modelNumber: formData.modelNumber,
        partNumber: formData.partNumber,
        mrp: formData.mrp,
        variantsList: formData.variantsList,
        marketplaces: formData.marketplaces,
        specifications: formData.specifications,
        features: formData.features,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        urlSlug: formData.urlSlug,
        approvalStatus: formData.approvalStatus,
        approvalRemarks: formData.approvalRemarks
      } as any;

      // Mutate parent state
      deleteProduct(formData.id);
      addProduct(parentAdapted);

      addHistoryLog('Revised SKU', `Updated details for ${formData.name}`, checkOriginal?.sku, formData.sku);
    } else {
      const parentAdapted: Product = {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        hsnCode: formData.hsnCode,
        gstRate: formData.gstRate,
        cessRate: formData.cessRate || 0,
        purchasePrice: formData.purchasePrice,
        sellingPrice: formData.sellingPrice,
        vendorId: formData.vendorId,
        status: 'Active',
        image: formData.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
        
        brand: formData.brand,
        subCategory: formData.subCategory,
        productType: formData.productType,
        unit: formData.unit,
        countryOfOrigin: formData.countryOfOrigin,
        manufacturer: formData.manufacturer,
        modelNumber: formData.modelNumber,
        partNumber: formData.partNumber,
        mrp: formData.mrp,
        variantsList: formData.variantsList,
        marketplaces: formData.marketplaces,
        specifications: formData.specifications,
        features: formData.features,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        seoTitle: formData.seoTitle,
        metaDescription: formData.metaDescription,
        metaKeywords: formData.metaKeywords,
        urlSlug: formData.urlSlug,
        approvalStatus: formData.approvalStatus || 'Approved',
        approvalRemarks: formData.approvalRemarks
      } as any;

      addProduct(parentAdapted);
      addHistoryLog('Onboard SKU', `Ingested corporate SKU master: ${formData.name}`, 'Empty', formData.sku);
    }

    setIsAddingNew(false);
    setEditingProduct(null);
  };

  const handleBulkUpdate = (updatedList: PimProduct[]) => {
    // Delete missing and add new
    const originalNames = new Set(products.map(p => p.id));
    const finalNames = new Set(updatedList.map(p => p.id));

    // Clear deleted
    products.forEach(p => {
      if (!finalNames.has(p.id)) deleteProduct(p.id);
    });

    // Ingest updated
    updatedList.forEach(upd => {
      if (originalNames.has(upd.id)) deleteProduct(upd.id);
      
      addProduct({
        sku: upd.sku,
        name: upd.name,
        category: upd.category,
        hsnCode: upd.hsnCode,
        gstRate: upd.gstRate,
        cessRate: upd.cessRate,
        purchasePrice: upd.purchasePrice,
        sellingPrice: upd.sellingPrice,
        vendorId: upd.vendorId,
        status: upd.status,
        image: upd.image,
        brand: upd.brand,
        productType: upd.productType,
        mrp: upd.mrp,
        variantsList: upd.variantsList,
        marketplaces: upd.marketplaces,
        approvalStatus: upd.approvalStatus
      } as any);
    });

    addHistoryLog('Bulk Mutator', `Applied batch re-alignments to database registers.`, 'Pre-state', `${updatedList.length} items`);
  };

  const handleBulkUpdateSKUs = (skuMap: Record<string, string>) => {
    const updated = products.map(p => {
      if (skuMap[p.id]) {
        return { ...p, sku: skuMap[p.id] };
      }
      return p;
    });
    handleBulkUpdate(updated);
    addHistoryLog('SKU Re-formulation', `Enforced unified brand-prefixes to SKU variables.`, 'Legacy', 'Unified');
  };

  const handleTransitionStatus = (id: string, status: PimProduct['approvalStatus'], remark: string) => {
    const updated = products.map(p => {
      if (p.id === id) {
        addHistoryLog('Authorization Gateway', `SKU approval switched to: ${status}. Comment: ${remark}`, p.approvalStatus, status);
        return { ...p, approvalStatus: status, approvalRemarks: remark };
      }
      return p;
    });
    handleBulkUpdate(updated);
  };

  const handleUpdateProductImages = (id: string, mainImage: string, gallery: string[]) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, image: mainImage, galleryImages: gallery };
      }
      return p;
    });
    handleBulkUpdate(updated);
    addHistoryLog('Asset Upload', `Updated graphics assets on product: ${id}`, 'Legacy Graphic', 'CDN Vector');
  };

  const handleUpdateProductSEO = (id: string, seo: { seoTitle: string; metaDescription: string; urlSlug: string; metaKeywords: string }) => {
    const updated = products.map(p => {
      if (p.id === id) {
        return { ...p, ...seo };
      }
      return p;
    });
    handleBulkUpdate(updated);
    addHistoryLog('Content SEO', `Committed SEO indexing metadata parameters for product ID: ${id}`);
  };

  const pimCategories = categories.map(c => ({
    id: c.id,
    name: c.name,
    code: c.id.toUpperCase(),
    hsnDefault: c.defaultHsn,
    description: `Statutory default section for ${c.name}`
  }));

  const pimBrands = brands.map(b => ({
    id: b.id,
    name: b.name,
    manufacturer: b.manufacturer,
    country: b.coOrigin,
    description: `Approved catalog brand ${b.name}`
  }));

  return (
    <div className="space-y-6">
      
      {/* PIM BANNER */}
      <div className="bg-gradient-to-r from-neutral-900 to-indigo-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-wider flex items-center space-x-2">
            <ClipboardList size={26} className="text-amber-500" />
            <span>PIM (Product Information Management) Studio</span>
          </h1>
          <p className="text-xs text-indigo-200 font-mono leading-relaxed max-w-2xl">
            Centralized product catalogue registry for India. Synchronize tax codes, generate standard brand matrices, print packaging labels and control quality clearance gates.
          </p>
        </div>

        {!isAddingNew ? (
          <button
            onClick={handleCreateProduct}
            className="self-start md:self-auto flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition duration-150 shrink-0 shadow-md"
          >
            <Plus size={16} />
            <span>Ingest corporate SKU</span>
          </button>
        ) : (
          <button
            onClick={() => { setIsAddingNew(false); setEditingProduct(null); }}
            className="self-start md:self-auto flex items-center space-x-1 px-4 py-2 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition duration-150 shrink-0 shadow-md"
          >
            <span>Exit setup studio</span>
          </button>
        )}
      </div>

      {isAddingNew ? (
        <AddProduct
          vendors={vendors}
          categories={categories}
          subCategories={[
            { id: 'sc-1', categoryId: 'cat-1', name: 'HDMI Connectors' },
            { id: 'sc-2', categoryId: 'cat-1', name: 'Conductor Wires' },
            { id: 'sc-3', categoryId: 'cat-2', name: 'Corrugated cartons' },
            { id: 'sc-4', categoryId: 'cat-3', name: 'Poly caps' }
          ]}
          brands={brands}
          attributes={attributes}
          onSaveProduct={handleSaveProduct}
          editingProduct={editingProduct}
          onCancel={() => { setIsAddingNew(false); setEditingProduct(null); }}
        />
      ) : (
        <div className="space-y-6">
          
          {/* SEC-WORKPLACE SUB-TABS */}
          <div className="flex bg-white border border-neutral-200 p-1.5 rounded-2xl shadow-sm text-xs font-mono font-bold select-none overflow-x-auto gap-1">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: <LayoutDashboard size={13} /> },
              { id: 'catalog', label: '📋 SKU Directory', icon: <Layers3 size={13} /> },
              { id: 'categories', label: '📂 Category matrix', icon: <Layers size={13} /> },
              { id: 'brands', label: '🏷️ Brand registers', icon: <Briefcase size={13} /> },
              { id: 'attributes', label: '🧬 Attribute keys', icon: <Settings2 size={13} /> },
              { id: 'formulator', label: '⚙️ SKU Formulator', icon: <Wrench size={13} /> },
              { id: 'barcodes', label: '🏷️ Packaging Labels', icon: <Barcode size={13} /> },
              { id: 'approvals', label: '🛡️ Quality Gates', icon: <ShieldCheck size={13} /> },
              { id: 'gallery', label: '🖼️ Asset repo', icon: <Image size={13} /> },
              { id: 'seo', label: '🔍 Meta studio', icon: <Globe size={13} /> },
              { id: 'history', label: '📜 Change logs', icon: <History size={13} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl transition shrink-0 uppercase text-[10px] tracking-wide ${activeWorkspaceTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ACTIVE WINDOW FRAME */}
          <div className="animate-in fade-in duration-200">
            {activeWorkspaceTab === 'dashboard' && (
              <ProductDashboard 
                products={products} 
                vendors={vendors}
                categories={pimCategories}
                brands={pimBrands}
                onNavigate={(t) => setActiveWorkspaceTab(t)}
              />
            )}

            {activeWorkspaceTab === 'catalog' && (
              <ProductList
                products={products}
                vendors={vendors}
                categories={categories}
                brands={brands}
                onDeleteProduct={deleteProduct}
                onEditProduct={handleEditProduct}
                onBulkUpdate={handleBulkUpdate}
              />
            )}

            {activeWorkspaceTab === 'categories' && (
              <CategoriesManager
                categories={pimCategories}
                subCategories={subCategories}
                onAddCategory={newCat => {
                  const fresh = { id: `cat-${Date.now()}`, name: newCat.name, defaultHsn: newCat.hsnDefault || '85444299', count: 0 };
                  setCategories([...categories, fresh]);
                }}
                onDeleteCategory={id => setCategories(categories.filter(c => c.id !== id))}
                onAddSubCategory={newSub => {
                  const fresh = { id: `sub-${Date.now()}`, categoryId: newSub.categoryId, name: newSub.name, description: newSub.description };
                  setSubCategories([...subCategories, fresh]);
                }}
                onDeleteSubCategory={id => setSubCategories(subCategories.filter(s => s.id !== id))}
                products={products}
              />
            )}

            {activeWorkspaceTab === 'brands' && (
              <BrandsManager
                brands={pimBrands}
                onAddBrand={newBrand => {
                  const fresh = { id: `b-${Date.now()}`, name: newBrand.name, manufacturer: newBrand.manufacturer || 'Various', coOrigin: newBrand.country || 'India', activeSKUs: 0 };
                  setBrands([...brands, fresh]);
                }}
                onDeleteBrand={id => setBrands(brands.filter(b => b.id !== id))}
                products={products}
              />
            )}

            {activeWorkspaceTab === 'attributes' && (
              <AttributesManager
                attributes={attributes}
                onAddAttribute={newAttr => setAttributes([...attributes, { ...newAttr, id: `attr-${Date.now()}`, values: [] }])}
                onDeleteAttribute={id => setAttributes(attributes.filter(a => a.id !== id))}
                onAddValueToAttribute={handleAddValueToAttribute}
              />
            )}

            {activeWorkspaceTab === 'formulator' && (
              <SKUManager
                products={products}
                onBulkUpdateSKUs={handleBulkUpdateSKUs}
              />
            )}

            {activeWorkspaceTab === 'barcodes' && (
              <BarcodeManager products={products} />
            )}

            {activeWorkspaceTab === 'approvals' && (
              <ProductApproval
                products={products}
                onTransitionStatus={handleTransitionStatus}
              />
            )}

            {activeWorkspaceTab === 'gallery' && (
              <ProductImagesManager
                products={products}
                onUpdateProductImages={handleUpdateProductImages}
              />
            )}

            {activeWorkspaceTab === 'seo' && (
              <ProductSEOManager
                products={products}
                onUpdateProductSEO={handleUpdateProductSEO}
              />
            )}

            {activeWorkspaceTab === 'history' && (
              <ProductHistoryManager
                products={products}
                historyLogs={historyLogs}
                onClearHistory={() => setHistoryLogs([])}
              />
            )}
          </div>

        </div>
      )}

    </div>
  );
}
