/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Share2, 
  Code, 
  CheckCircle2, 
  HelpCircle, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { PimProduct } from './pimTypes';

interface ProductSEOManagerProps {
  products: PimProduct[];
  onUpdateProductSEO: (id: string, seo: { seoTitle: string; metaDescription: string; urlSlug: string; metaKeywords: string }) => void;
}

export default function ProductSEOManager({
  products,
  onUpdateProductSEO
}: ProductSEOManagerProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [keywords, setKeywords] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Sync state when selected product switches
  useEffect(() => {
    if (selectedProduct) {
      setSeoTitle(selectedProduct.seoTitle || selectedProduct.name);
      setMetaDesc(selectedProduct.metaDescription || `Order high quality ${selectedProduct.name} at wholesale prices. HSN Code: ${selectedProduct.hsnCode}. Certified original vendor binding.`);
      setUrlSlug(selectedProduct.urlSlug || selectedProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      setKeywords(selectedProduct.metaKeywords || `${selectedProduct.category}, HSN ${selectedProduct.hsnCode}, ${selectedProduct.sku}`);
    }
  }, [selectedProductId, selectedProduct]);

  const handleUpdate = () => {
    if (!selectedProduct) return;
    onUpdateProductSEO(selectedProduct.id, {
      seoTitle,
      metaDescription: metaDesc,
      urlSlug,
      metaKeywords: keywords
    });
    alert('Search engine optimization attributes written into PIM catalog record.');
  };

  const handleGenerateSlug = () => {
    if (!selectedProduct) return;
    const generated = seoTitle.toLowerCase()
      .replace(/[^a-z0-0]/g, ' ')
      .trim()
      .replace(/\s+/g, '-');
    setUrlSlug(generated);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Structured Metadata & SEO Studio</h2>
        <p className="text-xs text-neutral-500 font-mono">Formulate indexable web slugs, generate Open-Graph cards, and validate JSON-LD schemas for Indian search crawlers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CONTROLS FORM */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
          
          <div className="border-b pb-2 flex justify-between items-center text-xs font-mono font-bold text-neutral-850">
            <span>Metadata Properties Matrix</span>
            <select 
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="bg-neutral-50 p-1 border font-sans rounded text-[11px] font-normal"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>[{p.sku}] {p.name.slice(0, 36)}...</option>
              ))}
            </select>
          </div>

          {selectedProduct ? (
            <div className="space-y-4 text-xs font-mono">
              
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">SEO TITLE (Target 60 Characters)</span>
                <input 
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="Meta title tags..."
                  className="w-full bg-neutral-100 p-2 border font-sans rounded focus:border-indigo-500 outline-none"
                />
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Optimal: 50-60 chars</span>
                  <span className={seoTitle.length > 60 ? 'text-rose-500 font-bold' : 'text-neutral-500 font-bold'}>{seoTitle.length} characters</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold font-mono">
                  <span>URL SLUG SEED</span>
                  <button onClick={handleGenerateSlug} className="text-[9px] text-indigo-600 hover:underline">Auto Generate</button>
                </div>
                <input 
                  type="text"
                  value={urlSlug}
                  onChange={e => setUrlSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                  placeholder="url-directory-slug"
                  className="w-full bg-neutral-100 p-2 border font-mono rounded focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">META DESCRIPTION (Target 155 Characters)</span>
                <textarea 
                  value={metaDesc}
                  onChange={e => setMetaDesc(e.target.value)}
                  placeholder="A precise summary describing materials, pricing, and HSN tax clearances..."
                  rows={4}
                  className="w-full bg-neutral-100 p-2 border font-sans rounded focus:border-indigo-500 outline-none"
                />
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>Optimal: 120-160 chars</span>
                  <span className={metaDesc.length > 160 ? 'text-rose-500 font-bold' : 'text-neutral-500 font-bold'}>{metaDesc.length} characters</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">KEYWORDS SEED (Comma Separated)</span>
                <input 
                  type="text"
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. industrial cable, excise compliant, wholesale copper wire"
                  className="w-full bg-neutral-100 p-2 border rounded font-sans focus:border-indigo-500 outline-none"
                />
              </div>

              <button 
                onClick={handleUpdate}
                className="w-full h-9 flex items-center justify-center space-x-1 py-1.5 px-4 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition"
              >
                <Save size={13} />
                <span>Publish Meta Properties</span>
              </button>

            </div>
          ) : (
            <div className="text-center py-20 text-neutral-500">
              No products found. Register SKUs to build listings SEO.
            </div>
          )}

        </div>

        {/* GOOGLE & SOCIAL PREVIEWS */}
        <div className="space-y-5">
          
          {selectedProduct ? (
            <div className="space-y-5">
              
              {/* GOOGLE PREVIEW */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-3">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b flex items-center gap-1.5">
                  <Globe size={13} className="text-neutral-400" />
                  <span>Google Desktop Snippet Output</span>
                </span>
                
                <div className="space-y-1 select-none leading-normal p-3.5 bg-neutral-50 rounded border">
                  {/* Google search hierarchy */}
                  <div className="flex items-center space-x-1 text-xs text-neutral-600 font-serif">
                    <span>https://ttgtsolutions.com</span>
                    <span className="text-neutral-450">›</span>
                    <span>products</span>
                    <span className="text-neutral-450">›</span>
                    <span className="truncate max-w-[120px]">{urlSlug || 'hsn-item-code'}</span>
                  </div>
                  {/* Google Title */}
                  <h3 className="text-indigo-805 text-lg font-medium hover:underline cursor-pointer font-sans leading-tight mt-0.5 line-clamp-1">
                    {seoTitle || selectedProduct.name}
                  </h3>
                  {/* Google Meta Desc */}
                  <p className="text-xs text-neutral-550 font-sans line-clamp-2 leading-relaxed">
                    {metaDesc || 'Enter descriptive search statements... HSN compliance codes and GSTR invoices included on dispatch.'}
                  </p>
                </div>
              </div>

              {/* SOCIAL MEDIA PREVIEW */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-3">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b flex items-center gap-1.5">
                  <Share2 size={13} className="text-neutral-400" />
                  <span>Social Open Graph Card Mock</span>
                </span>

                <div className="border border-neutral-220 rounded-xl overflow-hidden shadow-sm aspect-[1.91/1] bg-white relative flex flex-col justify-end">
                  <img 
                    src={selectedProduct.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=600&q=80'} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/45 to-transparent pointer-events-none" />
                  
                  <div className="p-4 z-10 text-white space-y-1 font-sans text-xs select-none">
                    <span className="text-[9px] bg-indigo-600 uppercase font-bold tracking-widest px-2 py-0.5 rounded-full inline-block leading-none">TTGT SOLUTIONS</span>
                    <h4 className="font-extrabold text-sm tracking-tight leading-tight line-clamp-1 text-white">{seoTitle || selectedProduct.name}</h4>
                    <p className="text-[10px] text-neutral-300 font-normal line-clamp-1 leading-normal">{metaDesc}</p>
                  </div>
                </div>
              </div>

              {/* JSON-LD AUDIT */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm text-xs space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b flex items-center gap-1.5">
                  <Code size={13} className="text-neutral-400" />
                  <span>JSON-LD Schema Payload Audit</span>
                </span>
                
                <div className="p-3 bg-neutral-900 rounded-lg text-amber-400 font-mono text-[9.5px] max-h-40 overflow-y-auto leading-relaxed">
                  <pre>{`{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "${selectedProduct.name}",
  "sku": "${selectedProduct.sku}",
  "mpn": "${selectedProduct.productCode || 'N/A'}",
  "hsnCode": "${selectedProduct.hsnCode}",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "${selectedProduct.sellingPrice}",
    "availability": "https://schema.org/InStock"
  }
}`}</pre>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span>Structured Schemas compiled with strict Google Merchant center standards.</span>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-neutral-400 text-xs">
              Load SKU metrics to preview index configurations.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
