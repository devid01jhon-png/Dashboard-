/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Tag, 
  Layers, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Check, 
  FileBox, 
  Scale, 
  Globe, 
  CheckCircle2, 
  X, 
  Percent, 
  BookmarkCheck, 
  Info 
} from 'lucide-react';
import { PimProduct, ProductVariantItem, ProductSpecification, MarketplaceConfig } from './pimTypes';
import { Vendor } from '../../types';

interface AddProductProps {
  vendors: Vendor[];
  categories: { id: string; name: string }[];
  subCategories: { id: string; categoryId: string; name: string }[];
  brands: { id: string; name: string }[];
  attributes: { id: string; name: string; values: string[] }[];
  onSaveProduct: (p: Omit<PimProduct, 'id' | 'currentStock'> & { id?: string; currentStock?: number }) => void;
  editingProduct?: PimProduct | null;
  onCancel: () => void;
}

export default function AddProduct({
  vendors,
  categories,
  subCategories,
  brands,
  attributes,
  onSaveProduct,
  editingProduct,
  onCancel
}: AddProductProps) {
  const [activeTab, setActiveTab] = useState('basic');

  // FORM STATES OR ORGANIZER
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [productType, setProductType] = useState<PimProduct['productType']>('Simple');
  const [unit, setUnit] = useState('Pcs');
  const [countryOfOrigin, setCountryOfOrigin] = useState('India');
  const [manufacturer, setManufacturer] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [partNumber, setPartNumber] = useState('');

  // Pricing
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [landingCost, setLandingCost] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [distributorPrice, setDistributorPrice] = useState(0);
  const [retailPrice, setRetailPrice] = useState(0);
  const [minSellingPrice, setMinSellingPrice] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);

  // Indian GST parameters
  const [gstApplicable, setGstApplicable] = useState<'Yes' | 'No'>('Yes');
  const [gstRate, setGstRate] = useState<0 | 5 | 12 | 18 | 28>(18);
  const [hsnCode, setHsnCode] = useState('');
  const [cessRate, setCessRate] = useState(0);
  const [inputTaxCredit, setInputTaxCredit] = useState(true);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [gstInclusive, setGstInclusive] = useState(false);

  // Physical boundaries
  const [weight, setWeight] = useState(0);
  const [length, setLength] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [packageWeight, setPackageWeight] = useState(0);

  // Inventory params
  const [trackInventory, setTrackInventory] = useState(true);
  const [minStock, setMinStock] = useState(5);
  const [maxStock, setMaxStock] = useState(500);
  const [reorderLevel, setReorderLevel] = useState(15);
  const [safetyStock, setSafetyStock] = useState(10);
  const [openingStock, setOpeningStock] = useState(0);
  const [openingValue, setOpeningValue] = useState(0);
  const [batchTracking, setBatchTracking] = useState(false);
  const [expiryTracking, setExpiryTracking] = useState(false);
  const [serialTracking, setSerialTracking] = useState(false);

  // Dynamic Specifications
  const [specs, setSpecs] = useState<ProductSpecification[]>([{ key: 'Material', value: 'Alloy Steel' }]);
  const [features, setFeatures] = useState<string[]>(['Heavy Duty Insulation']);
  const [featureInput, setFeatureInput] = useState('');

  // Descriptions
  const [shortDesc, setShortDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [packContents, setPackContents] = useState('');
  const [warranty, setWarranty] = useState('1 Year domestic warranty');
  const [careInstructions, setCareInstructions] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('7 Days easy replacements');
  const [replacementPolicy, setReplacementPolicy] = useState('Defective replacements allowed');

  // SEO details
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [urlSlug, setUrlSlug] = useState('');

  // Approval flow and Image
  const [approvalStatus, setApprovalStatus] = useState<PimProduct['approvalStatus']>('Draft');
  const [mainImageUrl, setMainImageUrl] = useState('');

  // -------------------------------------------------------------
  // VARIANTS COMPILER STATE
  // Selected attributes lookup mapping: {Color: ["Red", "Blue"], Size: ["L"]}
  const [checkedAttributes, setCheckedAttributes] = useState<Record<string, string[]>>({});
  const [generatedVariants, setGeneratedVariants] = useState<ProductVariantItem[]>([]);

  // Marketplace configurations mapping
  const [mktAmazon, setMktAmazon] = useState<MarketplaceConfig>({ enabled: false, sku: '', sellingPrice: 0, status: 'Inactive' });
  const [mktFlipkart, setMktFlipkart] = useState<MarketplaceConfig>({ enabled: false, sku: '', sellingPrice: 0, status: 'Inactive' });
  const [mktMeesho, setMktMeesho] = useState<MarketplaceConfig>({ enabled: false, sku: '', sellingPrice: 0, status: 'Inactive' });

  // -------------------------------------------------------------
  // Sync editing item if loaded
  useEffect(() => {
    if (editingProduct) {
      setSku(editingProduct.sku);
      setName(editingProduct.name);
      setShortName(editingProduct.shortName || '');
      setProductCode(editingProduct.productCode || '');
      setBarcode(editingProduct.barcode || '');
      setQrCode(editingProduct.qrCode || '');
      setVendorId(editingProduct.vendorId);
      setBrand(editingProduct.brand || '');
      setCategory(editingProduct.category);
      setSubCategory(editingProduct.subCategory || '');
      setProductType(editingProduct.productType);
      setUnit(editingProduct.unit || 'Pcs');
      setCountryOfOrigin(editingProduct.countryOfOrigin || 'India');
      setManufacturer(editingProduct.manufacturer || '');
      setModelNumber(editingProduct.modelNumber || '');
      setPartNumber(editingProduct.partNumber || '');

      setPurchasePrice(editingProduct.purchasePrice);
      setLandingCost(editingProduct.landingCost || editingProduct.purchasePrice * 1.05);
      setMrp(editingProduct.mrp || editingProduct.sellingPrice * 1.28);
      setSellingPrice(editingProduct.sellingPrice);
      setWholesalePrice(editingProduct.wholesalePrice || editingProduct.sellingPrice * 0.9);
      setDistributorPrice(editingProduct.distributorPrice || editingProduct.sellingPrice * 0.85);
      setRetailPrice(editingProduct.retailPrice || editingProduct.sellingPrice * 1.05);
      setMinSellingPrice(editingProduct.minSellingPrice || editingProduct.purchasePrice * 1.1);
      setMaxDiscount(editingProduct.maxDiscountPercentage || 25);

      setGstApplicable(editingProduct.gstApplicable || 'Yes');
      setGstRate(editingProduct.gstRate);
      setHsnCode(editingProduct.hsnCode);
      setCessRate(editingProduct.cessRate);
      setInputTaxCredit(editingProduct.inputTaxCredit !== false);
      setReverseCharge(editingProduct.reverseCharge === true);
      setGstInclusive(editingProduct.gstInclusive === true);

      setWeight(editingProduct.weight || 0);
      setLength(editingProduct.length || 0);
      setWidth(editingProduct.width || 0);
      setHeight(editingProduct.height || 0);
      setPackageWeight(editingProduct.packageWeight || 0);

      setTrackInventory(editingProduct.trackInventory !== false);
      setMinStock(editingProduct.minStockLevel || editingProduct.minStockLevel || 5);
      setMaxStock(editingProduct.maxStock || 1000);
      setReorderLevel(editingProduct.reorderLevel || 15);
      setSafetyStock(editingProduct.safetyStock || 10);
      setOpeningStock(editingProduct.openingStock || 0);
      setOpeningValue(editingProduct.openingValue || 0);
      setBatchTracking(editingProduct.batchTracking === true);
      setExpiryTracking(editingProduct.expiryTracking === true);
      setSerialTracking(editingProduct.serialTracking === true);

      setSpecs(editingProduct.specifications || [{ key: 'Material', value: 'Alloy Steel' }]);
      setFeatures(editingProduct.features || []);
      setShortDesc(editingProduct.shortDescription || '');
      setLongDesc(editingProduct.longDescription || '');
      setPackContents(editingProduct.packageContents || '');
      setWarranty(editingProduct.warranty || '1 Year domestic warranty');
      setCareInstructions(editingProduct.careInstructions || '');
      setReturnPolicy(editingProduct.returnPolicy || '7 Days easy replacements');
      setReplacementPolicy(editingProduct.replacementPolicy || '');

      setSeoTitle(editingProduct.seoTitle || '');
      setMetaDesc(editingProduct.metaDescription || '');
      setMetaKeywords(editingProduct.metaKeywords || '');
      setUrlSlug(editingProduct.urlSlug || '');

      setApprovalStatus(editingProduct.approvalStatus || 'Draft');
      setMainImageUrl(editingProduct.image || '');

      setGeneratedVariants(editingProduct.variantsList || []);

      if (editingProduct.marketplaces) {
        if (editingProduct.marketplaces.amazon) setMktAmazon(editingProduct.marketplaces.amazon);
        if (editingProduct.marketplaces.flipkart) setMktFlipkart(editingProduct.marketplaces.flipkart);
        if (editingProduct.marketplaces.meesho) setMktMeesho(editingProduct.marketplaces.meesho);
      }
    }
  }, [editingProduct]);

  // Handle URL automatic slug creation
  useEffect(() => {
    if (name && !editingProduct) {
      setUrlSlug(name.toLowerCase().replace(/[^a-z5-9]+/g, '-').replace(/(^-|-$)/g, ''));
      setSeoTitle(`${name} | TTGT Corporate Catalogue`);
    }
  }, [name]);

  // Auto Generate SKU code
  const handleAutoGenerateSKU = () => {
    const brandPrefix = brand ? brand.slice(0, 3).toUpperCase() : 'GEN';
    const catPrefix = category ? category.slice(0, 2).toUpperCase() : 'SK';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setSku(`${brandPrefix}-${catPrefix}-${randomSuffix}`);
  };

  // Add Spec Property
  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, key: string, val: string) => {
    const updated = [...specs];
    updated[index] = { key, value: val };
    setSpecs(updated);
  };

  const handleDeleteSpec = (index: number) => {
    setSpecs(specs.filter((_, idx) => idx !== index));
  };

  // Add bullet point features
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFeatures([...features, featureInput.trim()]);
    setFeatureInput('');
  };

  // -------------------------------------------------------------
  // VARIANTS COMPILING ENGINE
  const handleToggleAttributeVal = (attrName: string, val: string) => {
    setCheckedAttributes(prev => {
      const copy = { ...prev };
      if (!copy[attrName]) copy[attrName] = [];
      if (copy[attrName].includes(val)) {
        copy[attrName] = copy[attrName].filter(v => v !== val);
        if (copy[attrName].length === 0) delete copy[attrName];
      } else {
        copy[attrName] = [...copy[attrName], val];
      }
      return copy;
    });
  };

  // Cartesian product function to compile combinatorics
  const generateCombinations = () => {
    const keys = Object.keys(checkedAttributes);
    if (keys.length === 0) {
      alert('Please check at least one attribute lookup value to compile multiple variations.');
      return;
    }

    const combine = (index: number, currentCombo: Record<string, string>): any[] => {
      if (index === keys.length) {
        return [currentCombo];
      }
      const key = keys[index];
      const values = checkedAttributes[key];
      const results: any[] = [];
      values.forEach(val => {
        results.push(...combine(index + 1, { ...currentCombo, [key]: val }));
      });
      return results;
    };

    const combinations = combine(0, {});
    
    // Convert combinations to Variant Items
    const items: ProductVariantItem[] = combinations.map((combo, idx) => {
      const suffix = Object.values(combo).join('-').replaceAll(/\s/g, '').toUpperCase();
      const variantSku = `${sku || 'SKU'}-${suffix}-${idx + 101}`;
      return {
        id: `variant-${Date.now()}-${idx}`,
        sku: variantSku,
        barcode: `890${idx + 10001}934`,
        price: sellingPrice || 100,
        stock: 50,
        image: mainImageUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
        attributes: combo
      };
    });

    setGeneratedVariants(items);
  };

  const handleUpdateVariantItem = (id: string, field: keyof ProductVariantItem, val: any) => {
    setGeneratedVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: val } : v));
  };

  // -------------------------------------------------------------
  // SAVE / EXCISE EMISSION
  const handleSaveSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku || !name || !category || !vendorId || !hsnCode) {
      setActiveTab('basic');
      alert('* Validation Failure: Missing key corporate ledger parameters (SKU, Name, Category, Primary Vendor, HSN code).');
      return;
    }

    if (hsnCode.length !== 6 && hsnCode.length !== 8) {
      setActiveTab('pricing');
      alert('* Excised compliance: Hsn tariffs must compile exactly to 6 or 8 characters.');
      return;
    }

    const compiledMarkets: Record<string, MarketplaceConfig> = {};
    if (mktAmazon.enabled) compiledMarkets.amazon = mktAmazon;
    if (mktFlipkart.enabled) compiledMarkets.flipkart = mktFlipkart;
    if (mktMeesho.enabled) compiledMarkets.meesho = mktMeesho;

    onSaveProduct({
      id: editingProduct?.id,
      sku: sku.toUpperCase().trim(),
      name: name.trim(),
      shortName,
      productCode,
      barcode,
      qrCode,
      vendorId,
      brand,
      category,
      subCategory,
      productType,
      unit,
      countryOfOrigin,
      manufacturer,
      modelNumber,
      partNumber,
      serialNumber: partNumber ? `SN-${partNumber}` : '',

      purchasePrice,
      landingCost: landingCost || purchasePrice * 1.05,
      mrp: mrp || sellingPrice * 1.25,
      sellingPrice,
      wholesalePrice,
      distributorPrice,
      retailPrice,
      minSellingPrice,
      maxDiscountPercentage: maxDiscount,

      gstApplicable,
      gstRate,
      hsnCode,
      cessRate,
      inputTaxCredit,
      reverseCharge,
      gstInclusive,

      weight,
      length,
      width,
      height,
      packageWeight,

      trackInventory,
      minStockLevel: minStock,
      maxStock,
      reorderLevel,
      safetyStock,
      openingStock,
      openingValue: openingValue || (openingStock * purchasePrice),
      batchTracking,
      expiryTracking,
      serialTracking,

      variantsList: generatedVariants,
      galleryImages: editingProduct?.galleryImages || [mainImageUrl],
      videoUrl: '',
      imageAltText: `${name} | Excise Certified SKU`,
      
      marketplaces: compiledMarkets,

      shortDescription: shortDesc,
      longDescription: longDesc,
      specifications: specs.filter(s => s.key && s.value),
      features,
      packageContents: packContents,
      warranty,
      careInstructions,
      returnPolicy,
      replacementPolicy,

      seoTitle,
      metaDescription: metaDesc,
      metaKeywords,
      urlSlug,
      approvalStatus,
      currentStock: editingProduct?.currentStock !== undefined ? editingProduct.currentStock : openingStock || 100,
      status: 'Active',
      image: mainImageUrl || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-300 shadow-md overflow-hidden space-y-0.5">
      
      {/* MODULE STICKY TITLE */}
      <div className="bg-neutral-900 text-white p-4 flex justify-between items-center px-6">
        <div>
          <h2 className="text-sm font-extrabold uppercase font-mono tracking-wider flex items-center space-x-2">
            <BookmarkCheck size={16} className="text-amber-500" />
            <span>{editingProduct ? `Edit Master Catalog Records [SKU: ${editingProduct.sku}]` : 'Ingest Corporate SKU Master Profile'}</span>
          </h2>
          <span className="text-[10px] text-neutral-400 font-mono">Central corporate warehouse, GSTR mapping validation and tax index bindings.</span>
        </div>
        <div className="flex space-x-2">
          <button 
            type="button" 
            onClick={onCancel}
            className="text-xs bg-neutral-800 text-neutral-300 px-3.5 py-1.5 rounded hover:bg-neutral-750 font-mono"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* HORIZONTAL WORKFLOW TABS */}
      <div className="flex border-b font-mono text-[10.5px] font-bold select-none overflow-x-auto bg-neutral-50 border-neutral-100">
        {[
          { id: 'basic', label: '📂 Basic Information' },
          { id: 'pricing', label: '📊 Pricing & Indian GST' },
          { id: 'stock', label: '📦 Stock & Dimensions' },
          { id: 'details', label: '📝 Description & Specs' },
          { id: 'variants', label: '🧬 Attribute variations' },
          { id: 'marketplaces', label: '🛒 Store Channels' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 shrink-0 transition ${activeTab === tab.id ? 'bg-white text-indigo-750 border-b-2 border-indigo-500' : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN FORM CONTAINER */}
      <form onSubmit={handleSaveSubmitForm} className="p-6">
        
        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 bg-neutral-50 rounded-lg text-[10px] border flex gap-1.5 text-neutral-500 font-sans">
              <Info size={14} className="text-indigo-600 shrink-0" />
              <span>Fill out the basic profile identifiers. Standardize titles to help warehouse logistics staff navigate boxes easily.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Product Name *</span>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Cotton Polo Shirt" className="w-full bg-neutral-50 p-2 border rounded font-sans" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Short Name</span>
                <input type="text" value={shortName} onChange={e => setShortName(e.target.value)} placeholder="e.g. Cotton Polo" className="w-full bg-neutral-50 p-2 border rounded font-sans" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Product Code</span>
                <input type="text" value={productCode} onChange={e => setProductCode(e.target.value)} placeholder="e.g. POLO-929" className="w-full bg-neutral-50 p-2 border rounded font-mono" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Product SKU *</span>
                <div className="flex space-x-1.5">
                  <input required type="text" value={sku} onChange={e => setSku(e.target.value.toUpperCase())} placeholder="Auto generate or type..." className="w-full bg-neutral-50 p-2 border rounded font-mono uppercase font-black" />
                  <button type="button" onClick={handleAutoGenerateSKU} className="px-2.5 bg-neutral-900 text-white rounded hover:bg-neutral-800" title="Auto Generates unique value"><RefreshCw size={13} /></button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">EAN Barcode Code</span>
                <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="e.g. 89010302345" className="w-full bg-neutral-50 p-2 border rounded font-mono" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Primary Registered Vendor *</span>
                <select required value={vendorId} onChange={e => setVendorId(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded text-xs select-none">
                  <option value="">-- Choose Vendor ledger --</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.companyName} [State: {v.state}]</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Product Type (Classification) *</span>
                <select value={productType} onChange={e => setProductType(e.target.value as any)} className="w-full bg-neutral-50 p-2 border rounded text-xs">
                  <option value="Simple">Simple Products (Base item)</option>
                  <option value="Variable">Variable Products (Attribute models)</option>
                  <option value="Bundle">Bundle Products (Assembled packs)</option>
                  <option value="Combo">Combo Products (Promotional buy)</option>
                  <option value="Digital">Digital Products (Future Ready download)</option>
                  <option value="Service">Service Products (No stock bounds)</option>
                  <option value="Serialized">Serialized Products (Appliance appliances)</option>
                  <option value="Batch">Batch Products (Vitamins / Chemicals)</option>
                  <option value="Expiry">Expiry Products (FMCG commodities)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Category *</span>
                <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded text-xs">
                  <option value="">-- Choose Primary --</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Sub Category</span>
                <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded text-xs">
                  <option value="">-- Choose Segment --</option>
                  {subCategories.filter(s => s.name).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Brand Record</span>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded text-xs">
                  <option value="">-- Select Registered Brand --</option>
                  {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Commercial Unit of measure</span>
                <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded text-xs">
                  <option value="Pcs">Pcs (Pieces - standard)</option>
                  <option value="Kgs">Kgs (Kilograms)</option>
                  <option value="Mtrs">Mtrs (Meters)</option>
                  <option value="Box">Box (Carton lots)</option>
                  <option value="Doz">Doz (Dozens)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Country of Origin</span>
                <input type="text" value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Manufacturer</span>
                <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)} placeholder="Manufactured by..." className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Model Number</span>
                <input type="text" value={modelNumber} onChange={e => setModelNumber(e.target.value)} placeholder="e.g. M-2026W" className="w-full bg-neutral-50 p-2 border rounded font-mono" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Part Number / GTIN</span>
                <input type="text" value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="e.g. PT-949210" className="w-full bg-neutral-50 p-2 border rounded font-mono" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Main Image Graphic URL</span>
                <input type="text" value={mainImageUrl} onChange={e => setMainImageUrl(e.target.value)} placeholder="Paste graphic asset URL..." className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Central Quality clearance Level</span>
                <select value={approvalStatus} onChange={e => setApprovalStatus(e.target.value as any)} className="w-full bg-neutral-55 p-2 border border-neutral-300 rounded text-xs text-indigo-750 font-bold">
                  <option value="Draft">Draft Mode</option>
                  <option value="Submitted">Submit to Gate clearance board</option>
                  <option value="Approved">Approved / Cleared (Published)</option>
                  <option value="Rejected">Rejected State</option>
                  <option value="Archived">Archived State</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRICING & GST COMPLIANCE */}
        {activeTab === 'pricing' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-3.5 bg-neutral-50 rounded-xl border flex items-center justify-between font-mono text-[10px] text-neutral-500 leading-normal">
              <span className="font-sans flex gap-1.5"><Percent size={14} className="text-emerald-600" /> Specify margins matrices and excise tax parameters. Direct inclusive/exclusive pricing toggles are supported out-of-the-box.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Purchase Price (B2B Excl. GST) *</span>
                <input required type="number" value={purchasePrice || ''} onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Landed Cost (Freight / Handling)</span>
                <input type="number" value={landingCost || ''} onChange={e => setLandingCost(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Max Retail Price (MRP Inclusive of Tax) *</span>
                <input required type="number" value={mrp || ''} onChange={e => setMrp(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded font-bold" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Standard Selling B2B (Excl. Tax) *</span>
                <input required type="number" value={sellingPrice || ''} onChange={e => setSellingPrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded font-semibold text-emerald-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Wholesale Price (Bulk lots)</span>
                <input type="number" value={wholesalePrice || ''} onChange={e => setWholesalePrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Distributor Partner Price</span>
                <input type="number" value={distributorPrice || ''} onChange={e => setDistributorPrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded animate-pulse" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Retail Sales Counter Price</span>
                <input type="number" value={retailPrice || ''} onChange={e => setRetailPrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Floor price (Min Selling Limit)</span>
                <input type="number" value={minSellingPrice || ''} onChange={e => setMinSellingPrice(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded text-rose-600" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Max discount Clearance (%)</span>
                <input type="number" max={99} value={maxDiscount || ''} onChange={e => setMaxDiscount(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Indian GST Applicable</span>
                <select value={gstApplicable} onChange={e => setGstApplicable(e.target.value as any)} className="w-full bg-neutral-50 p-2 border rounded text-xs font-bold text-neutral-750">
                  <option value="Yes">Yes (Taxable Ingress)</option>
                  <option value="No">No (Exempted / Zero Rated)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">CGST+SGST Bracket *</span>
                <select value={gstRate} onChange={e => setGstRate(parseInt(e.target.value) as any)} className="w-full bg-neutral-50 p-2 border rounded text-xs select-none">
                  <option value="0">0% GST Bracket (Essential / Grain / Flour)</option>
                  <option value="5">5% GST Bracket (Apparel Yarn / raw Materials)</option>
                  <option value="12">12% GST Bracket (Corrugated / Parts)</option>
                  <option value="18">18% GST Bracket (Standard Electronics / Plastics)</option>
                  <option value="28">28% GST Bracket (Luxury fittings & accessories)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">8-Digit HSN Code Tariff *</span>
                <input required type="text" maxLength={8} value={hsnCode} onChange={e => setHsnCode(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 85444299" className="w-full bg-neutral-50 p-2 border rounded text-xs font-bold" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Saurashtra / Coal Compensation Cess (%)</span>
                <input type="number" value={cessRate || ''} onChange={e => setCessRate(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border col-span-2">
                <span className="text-[11px] text-neutral-600 font-sans">Eligible for Input Tax Credit (ITC)</span>
                <input type="checkbox" checked={inputTaxCredit} onChange={e => setInputTaxCredit(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border col-span-2">
                <span className="text-[11px] text-neutral-600 font-sans">Reverse Charge mechanism (RCM)</span>
                <input type="checkbox" checked={reverseCharge} onChange={e => setReverseCharge(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border col-span-2">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-800 font-sans font-bold block leading-none">Pricing inclusive of GST</span>
                  <span className="text-[9.5px] text-neutral-400 block font-normal leading-normal">Checking embeds tax calculations back into MRP.</span>
                </div>
                <input type="checkbox" checked={gstInclusive} onChange={e => setGstInclusive(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL DIMENSIONS & STOCK CONFIGS */}
        {activeTab === 'stock' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b">Courier Weight boundaries & Inward parameters</span>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Net Weight (Kgs)</span>
                <input type="number" step="0.001" value={weight || ''} onChange={e => setWeight(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Net Length (Cms)</span>
                <input type="number" value={length || ''} onChange={e => setLength(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Net Width (Cms)</span>
                <input type="number" value={width || ''} onChange={e => setWidth(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Net Height (Cms)</span>
                <input type="number" value={height || ''} onChange={e => setHeight(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Gross Package Weight (Kgs)</span>
                <input type="number" step="0.001" value={packageWeight || ''} onChange={e => setPackageWeight(parseFloat(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border md:col-span-3">
                <span className="text-[11px] text-neutral-605 font-sans">Active stock tracking logs enabled</span>
                <input type="checkbox" checked={trackInventory} onChange={e => setTrackInventory(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Min Trigger Stock</span>
                <input type="number" value={minStock || ''} onChange={e => setMinStock(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Max Cap Stock</span>
                <input type="number" value={maxStock || ''} onChange={e => setMaxStock(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Procurement Reorder level</span>
                <input type="number" value={reorderLevel || ''} onChange={e => setReorderLevel(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Safety stock level</span>
                <input type="number" value={safetyStock || ''} onChange={e => setSafetyStock(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Initial Inward stock (Opening)</span>
                <input type="number" value={openingStock || ''} onChange={e => setOpeningStock(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase font-mono">Opening Asset Valuation (INR)</span>
                <input type="number" value={openingValue || ''} onChange={e => setOpeningValue(parseInt(e.target.value) || 0)} className="w-full bg-neutral-50 p-2 border rounded" />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <span className="text-[11px] text-neutral-600 font-sans">Batch tracking logs (Yes/No)</span>
                <input type="checkbox" checked={batchTracking} onChange={e => setBatchTracking(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <span className="text-[11px] text-neutral-600 font-sans">Expiry warning tracking (FMCG)</span>
                <input type="checkbox" checked={expiryTracking} onChange={e => setExpiryTracking(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DESCRIPTIONS & KEY SPECIFICATIONS */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs font-mono">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Short Marketplace Description</span>
                <textarea rows={3} value={shortDesc} onChange={e => setShortDesc(e.target.value)} placeholder="A dynamic 2-sentence marketing teaser description..." className="w-full bg-neutral-50 p-2.5 border font-sans rounded" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Detailed Broad Description</span>
                <textarea rows={3} value={longDesc} onChange={e => setLongDesc(e.target.value)} placeholder="Full technical breakdown of specifications..." className="w-full bg-neutral-50 p-2.5 border font-sans rounded" />
              </div>
            </div>

            {/* DYNAMIC SPECS MATRIX TABLE */}
            <div className="p-4 bg-neutral-50 rounded-xl border space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[11px] font-bold text-neutral-850 uppercase">Technical Specifications Sheet</span>
                <button type="button" onClick={handleAddSpec} className="text-[10.5px] text-indigo-750 font-bold font-mono hover:underline flex items-center gap-1"><Plus size={12} /> Add Row</button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {specs.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <input type="text" value={item.key} onChange={e => handleUpdateSpec(index, e.target.value, item.value)} placeholder="Label key (e.g. Composition)" className="w-1/3 bg-white p-1.5 border rounded" />
                    <input type="text" value={item.value} onChange={e => handleUpdateSpec(index, item.key, e.target.value)} placeholder="Measurement value (e.g. 100% combed cotton)" className="flex-1 bg-white p-1.5 border rounded font-sans" />
                    <button type="button" onClick={() => handleDeleteSpec(index)} className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 rounded-full shrink-0"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPANDED MARKUPS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Package Contents list</span>
                <input type="text" value={packContents} onChange={e => setPackContents(e.target.value)} placeholder="e.g. 1 Conductor Cable, 2 Straps" className="w-full bg-neutral-50 p-2 border rounded font-sans" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Warranty Declarations</span>
                <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="e.g. 12 Months Domestic Replacement" className="w-full bg-neutral-50 p-2 border rounded font-sans" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block uppercase">Return & Replacement guidelines</span>
                <input type="text" value={returnPolicy} onChange={e => setReturnPolicy(e.target.value)} placeholder="e.g. Returns permitted only on damaged lots" className="w-full bg-neutral-50 p-2 border rounded font-sans" />
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: ATTRIBUTES COMBINATIONS MATRIX GENERATION */}
        {activeTab === 'variants' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-3.5 bg-neutral-50 rounded-xl border text-[10.5px] font-mono text-neutral-500 space-y-1.5">
              <span className="font-sans block font-bold text-neutral-850">🧬 Combinatorics Variants Matrix Compiler</span>
              <span>Select the relevant attribute properties below to dynamically compile clashing SKU sets inside the master record.</span>
            </div>

            {/* SELECTION GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded-xl bg-neutral-50/50">
              {attributes.map(attr => (
                <div key={attr.id} className="space-y-2 border-r last:border-none pr-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block border-b pb-1">{attr.name}</span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {attr.values.map(val => {
                      const isChecked = checkedAttributes[attr.name]?.includes(val);
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleToggleAttributeVal(attr.name, val)}
                          className={`text-[9.5px] font-mono px-2 py-0.5 rounded border font-semibold transition ${isChecked ? 'bg-indigo-650 border-indigo-700 text-white font-bold' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* COMPILE ENGINE COMPILER OUT */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={generateCombinations}
                className="py-2 px-5 bg-neutral-900 font-bold hover:bg-neutral-800 text-white rounded-lg shadow font-mono text-[11px]"
              >
                Compile Combinatorics matrix
              </button>
            </div>

            {/* MATRIX GENERATION MATRIX */}
            {generatedVariants.length > 0 && (
              <div className="border rounded-xl overflow-hidden bg-white mt-4">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-neutral-50 border-b text-[9px] text-[#94a3b8] font-bold">
                      <th className="py-2 px-3">Dynamic Variant Options</th>
                      <th className="py-2 px-2">Unique Sku Marker</th>
                      <th className="py-2 px-2">Ean Barcode</th>
                      <th className="py-2 px-2">Selling Cost</th>
                      <th className="py-2 px-2 text-center">Opening Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {generatedVariants.map(v => {
                      const desc = Object.entries(v.attributes).map(([k, val]) => `${k}:${val}`).join(' / ');
                      return (
                        <tr key={v.id} className="hover:bg-neutral-50 text-[11px]">
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-neutral-100 font-bold rounded uppercase text-[10px] text-neutral-700 border block truncate max-w-[150px]">{desc}</span>
                          </td>
                          <td className="py-3 px-2">
                            <input type="text" value={v.sku} onChange={e => handleUpdateVariantItem(v.id, 'sku', e.target.value.toUpperCase())} className="bg-neutral-50 px-2 py-1 rounded text-[10.5px] font-bold tracking-tight uppercase border" />
                          </td>
                          <td className="py-3 px-2">
                            <input type="text" value={v.barcode} onChange={e => handleUpdateVariantItem(v.id, 'barcode', e.target.value)} className="bg-neutral-50 px-2 py-1 rounded text-[10.5px] border" />
                          </td>
                          <td className="py-3 px-2">
                            <input type="number" value={v.price} onChange={e => handleUpdateVariantItem(v.id, 'price', parseFloat(e.target.value) || 0)} className="bg-neutral-55 px-2 py-1 rounded text-[10.5px] font-bold text-emerald-750 border w-24" />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <input type="number" value={v.stock} onChange={e => handleUpdateVariantItem(v.id, 'stock', parseInt(e.target.value) || 0)} className="bg-neutral-55 px-2 py-1 rounded text-[10.5px] border w-20 text-center" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: MERCHANT CHANNELS STORE */}
        {activeTab === 'marketplaces' && (
          <div className="space-y-6 animate-in fade-in duration-150 font-mono text-xs">
            <div className="p-3 bg-neutral-50 border rounded-lg text-[10.5px] text-neutral-500 font-sans">
              ℹ️ Define separate retail price tiers, specific marketplace descriptions and separate SKUs mapped exactly to retail registries.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* AMAZON */}
              <div className="border rounded-xl p-4 space-y-4 shadow-sm bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#f97316]">Amazon India Link</span>
                  <input type="checkbox" checked={mktAmazon.enabled} onChange={e => setMktAmazon({ ...mktAmazon, enabled: e.target.checked, sku: `${sku}-AZN`, sellingPrice: sellingPrice * 1.05 })} className="h-4 w-4 text-indigo-600 rounded" />
                </div>

                {mktAmazon.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Amazon Specific SKU Link</span>
                      <input type="text" value={mktAmazon.sku} onChange={e => setMktAmazon({ ...mktAmazon, sku: e.target.value })} className="w-full bg-white p-2 border rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Amazon Selling Price (INR)</span>
                      <input type="number" value={mktAmazon.sellingPrice} onChange={e => setMktAmazon({ ...mktAmazon, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 border border-emerald-500 text-emerald-800 font-bold rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Listing Status</span>
                      <select value={mktAmazon.status} onChange={e => setMktAmazon({ ...mktAmazon, status: e.target.value as any })} className="w-full bg-white p-2 border rounded">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* FLIPKART */}
              <div className="border rounded-xl p-4 space-y-4 shadow-sm bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-blue-600">Flipkart Portal Link</span>
                  <input type="checkbox" checked={mktFlipkart.enabled} onChange={e => setMktFlipkart({ ...mktFlipkart, enabled: e.target.checked, sku: `${sku}-FKP`, sellingPrice: sellingPrice * 1.02 })} className="h-4 w-4 text-indigo-600 rounded" />
                </div>

                {mktFlipkart.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Flipkart specific SKU Link</span>
                      <input type="text" value={mktFlipkart.sku} onChange={e => setMktFlipkart({ ...mktFlipkart, sku: e.target.value })} className="w-full bg-white p-2 border rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Flipkart Selling Price (INR)</span>
                      <input type="number" value={mktFlipkart.sellingPrice} onChange={e => setMktFlipkart({ ...mktFlipkart, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 border border-emerald-500 text-emerald-800 font-bold rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Listing Status</span>
                      <select value={mktFlipkart.status} onChange={e => setMktFlipkart({ ...mktFlipkart, status: e.target.value as any })} className="w-full bg-white p-2 border rounded">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* MEESHO */}
              <div className="border rounded-xl p-4 space-y-4 shadow-sm bg-neutral-50/50">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-[#ec4899]">Meesho Merchant link</span>
                  <input type="checkbox" checked={mktMeesho.enabled} onChange={e => setMktMeesho({ ...mktMeesho, enabled: e.target.checked, sku: `${sku}-MSH`, sellingPrice: sellingPrice * 0.98 })} className="h-4 w-4 text-indigo-600 rounded" />
                </div>

                {mktMeesho.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Meesho Specific SKU Link</span>
                      <input type="text" value={mktMeesho.sku} onChange={e => setMktMeesho({ ...mktMeesho, sku: e.target.value })} className="w-full bg-white p-2 border rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Meesho Selling Price (INR)</span>
                      <input type="number" value={mktMeesho.sellingPrice} onChange={e => setMktMeesho({ ...mktMeesho, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-white p-2 border border-emerald-500 text-emerald-800 font-bold rounded" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9.5px] text-neutral-450 block uppercase font-bold">Listing Status</span>
                      <select value={mktMeesho.status} onChange={e => setMktMeesho({ ...mktMeesho, status: e.target.value as any })} className="w-full bg-white p-2 border rounded">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* SAVE SUBMIT BAR */}
        <div className="flex justify-end space-x-3.5 border-t pt-5 mt-8 border-neutral-100 select-none">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold font-mono transition"
          >
            Abandon Changes
          </button>
          
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-750 font-bold text-white rounded-lg text-xs font-mono shadow-md"
          >
            {editingProduct ? 'Commit Master Updates' : 'Publish & Bind SKU Records'}
          </button>
        </div>

      </form>

    </div>
  );
}
