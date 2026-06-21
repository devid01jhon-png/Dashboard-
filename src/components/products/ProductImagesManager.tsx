/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Image, 
  UploadCloud, 
  Trash2, 
  Activity, 
  Save, 
  Sparkles, 
  Grid, 
  Eye, 
  Lock 
} from 'lucide-react';
import { PimProduct } from './pimTypes';

interface ProductImagesManagerProps {
  products: PimProduct[];
  onUpdateProductImages: (id: string, mainImage: string, gallery: string[]) => void;
}

export default function ProductImagesManager({
  products,
  onUpdateProductImages
}: ProductImagesManagerProps) {
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [altTextMap, setAltTextMap] = useState<Record<string, string>>({});
  const [compressionMode, setCompressionMode] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Default mock fallback gallery
  const defaultGallery = [
    'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80',
    'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80',
    'https://images.unsplash.com/photo-1608613304899-ea8098577e38?w=400&q=80'
  ];

  const gallery = selectedProduct?.galleryImages || defaultGallery;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    if (!selectedProduct) return;
    setIsUploading(true);
    setTimeout(() => {
      const mockImgUrl = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80';
      const upgradedGallery = [...gallery, mockImgUrl];
      onUpdateProductImages(selectedProduct.id, selectedProduct.image || mockImgUrl, upgradedGallery);
      setIsUploading(false);
      alert('Media asset uploaded and synchronized with CDN servers successfully!');
    }, 1500);
  };

  const setAsMainImage = (url: string) => {
    if (!selectedProduct) return;
    onUpdateProductImages(selectedProduct.id, url, gallery);
  };

  const deletePhoto = (url: string) => {
    if (!selectedProduct) return;
    const remains = gallery.filter(g => g !== url);
    const main = selectedProduct.image === url ? (remains[0] || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80') : selectedProduct.image;
    onUpdateProductImages(selectedProduct.id, main || '', remains);
  };

  const handleSaveAlt = () => {
    alert('Accessibility ALT tags successfully committed to marketplace feeds.');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Enterprise Asset Repository</h2>
        <p className="text-xs text-neutral-500 font-mono">Manage media profiles, high-definition catalog graphics, and optimize vectors for India's mobile ecommerce grids.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CONTROLLER */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b">Selected Catalogue Item</span>
            <div className="space-y-3.5 text-xs font-mono">
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full bg-neutral-50 p-2 border rounded font-sans cursor-pointer focus:border-indigo-500 outline-none text-xs"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>[{p.sku}] {p.name.slice(0, 48)}...</option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset Compression config */}
          <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <div className="border-b pb-1.5 flex justify-between items-center text-[10px] font-mono font-bold text-neutral-400 uppercase">
              <span>Automatic Asset Engine</span>
              <Sparkles size={11} className="text-amber-500" />
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-neutral-800 font-semibold font-sans block">Smart Lossy Compression</span>
                  <span className="text-[9.5px] text-neutral-400 block leading-none">Minimizes image size up to 75% for fast 4G cell arrays.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={compressionMode} 
                  onChange={e => setCompressionMode(e.target.checked)} 
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                />
              </div>

              <div className="p-3 bg-neutral-50 border rounded-lg text-[10px] text-neutral-500 leading-normal font-sans">
                💡 <strong>SEO Best Practice</strong>: Flipkart and Amazon catalog indexing rank optimized WebP or JPEG formats under 150KB higher in listings search.
              </div>
            </div>
          </div>

          {/* Accessibility Tags Editor */}
          {selectedProduct && (
            <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase block pb-1 border-b">Product Accessibility Alt Tags</span>
              
              <div className="space-y-3.5 text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-[9.5px] text-neutral-500 block uppercase font-bold">ALT DESCRIPTIVE TAG</span>
                  <input 
                    type="text"
                    value={altTextMap[selectedProduct.id] || selectedProduct.imageAltText || `${selectedProduct.name} - Front View`}
                    onChange={e => setAltTextMap({ ...altTextMap, [selectedProduct.id]: e.target.value })}
                    placeholder="Describe specific graphics..."
                    className="w-full bg-neutral-50 p-2 border font-sans rounded focus:border-indigo-500 outline-none"
                  />
                </div>

                <button 
                  onClick={handleSaveAlt}
                  className="w-full h-8 flex items-center justify-center space-x-1 py-1 px-4 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 transition text-[10.5px]"
                >
                  <Save size={12} />
                  <span>Commit alt references</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* WORK/MEDIA GRID */}
        <div className="lg:col-span-8 space-y-5">
          
          {selectedProduct ? (
            <div className="space-y-6">
              
              {/* DRAG AND DROP AREA */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition ${dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100/50'}`}
              >
                {isUploading ? (
                  <div className="space-y-2 animate-pulse">
                    <Activity size={32} className="text-indigo-600 mx-auto animate-bounce" />
                    <span className="text-xs font-mono font-bold block text-indigo-700">CDN ASSET INGESTION ACTIVE...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud size={38} className="text-neutral-400 mx-auto stroke-[1.5]" />
                    <div className="text-xs">
                      <button onClick={simulateUpload} className="text-indigo-600 font-bold hover:underline">Click to upload assets</button>
                      <span className="text-neutral-500 font-sans"> or drag & drop graphic files here</span>
                    </div>
                    <span className="text-[9.5px] font-mono text-neutral-400 block uppercase">Compatible Formats: WEBP, JPG, PNG (Max 5MB)</span>
                  </div>
                )}
              </div>

              {/* MEDIA GRID LIST */}
              <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm space-y-4">
                <span className="text-xs font-bold font-mono uppercase text-neutral-850 block pb-2 border-b">Active Product Gallery</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* MAIN IMAGE CARD */}
                  <div className="relative rounded-lg overflow-hidden border-2 border-indigo-500 bg-neutral-50 aspect-square group shadow-sm">
                    <img 
                      src={selectedProduct.image || 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=400&q=80'} 
                      alt="" 
                      className="h-full w-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[8.5px] font-bold bg-indigo-600 text-white font-mono rounded tracking-wider uppercase">PRIMARY COVER</span>
                  </div>

                  {gallery.map((url, index) => {
                    const isCover = url === selectedProduct.image;
                    if (isCover) return null;
                    return (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 aspect-square group">
                        <img 
                          src={url} 
                          alt="" 
                          className="h-full w-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* HOVER ACTIONS OVERLAY */}
                        <div className="absolute inset-0 bg-neutral-900/60 flex flex-col justify-center items-center space-y-1.5 opacity-0 group-hover:opacity-100 transition duration-150">
                          <button 
                            onClick={() => setAsMainImage(url)}
                            className="bg-white hover:bg-neutral-100 text-neutral-800 text-[9px] font-bold py-1 px-2.5 rounded font-mono shadow flex items-center space-x-1"
                          >
                            <Eye size={10} />
                            <span>Set Cover</span>
                          </button>
                          <button 
                            onClick={() => deletePhoto(url)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold py-1 px-2.5 rounded font-mono shadow flex items-center space-x-1"
                          >
                            <Trash2 size={10} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center text-neutral-400 text-xs">
              Onboard products using SKU listings to upload promotional images or detailed graphics.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
