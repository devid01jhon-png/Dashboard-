/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Trash2, 
  Cpu, 
  SlidersHorizontal, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Container,
  Compass
} from 'lucide-react';
import { WmsWarehouse, WmsWarehouseLocation } from '../inventory/wmsTypes';
import { Product } from '../../types';

interface WarehouseStructureProps {
  warehouses: WmsWarehouse[];
  locations: WmsWarehouseLocation[];
  products: Product[];
  onAddWarehouse: (wh: WmsWarehouse) => void;
  onAddLocation: (loc: WmsWarehouseLocation) => void;
  onDeleteWarehouse: (id: string) => void;
  onDeleteLocation: (id: string) => void;
}

export default function WarehouseStructure({
  warehouses,
  locations,
  products,
  onAddWarehouse,
  onAddLocation,
  onDeleteWarehouse,
  onDeleteLocation
}: WarehouseStructureProps) {
  // Tabs: Warehouses vs Locations
  const [activeTab, setActiveTab] = useState<'hubs' | 'bins'>('hubs');

  // Form toggles
  const [showAddWh, setShowAddWh] = useState(false);
  const [showAddLoc, setShowAddLoc] = useState(false);

  // New WH Form states
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whType, setWhType] = useState<'Central' | 'Regional' | 'Spoke' | 'Cold Storage' | 'Direct-to-Retail'>('Regional');
  const [whAddress, setWhAddress] = useState('');
  const [whCity, setWhCity] = useState('');
  const [whState, setWhState] = useState('Maharashtra');
  const [whPin, setWhPin] = useState('');
  const [whManager, setWhManager] = useState('');
  const [whCapacity, setWhCapacity] = useState(15000);

  // New Loc Form states
  const [locWhId, setLocWhId] = useState('');
  const [locZone, setLocZone] = useState('Row A - General');
  const [locAisle, setLocAisle] = useState('01');
  const [locRack, setLocRack] = useState('R1');
  const [locShelf, setLocShelf] = useState('S1');
  const [locBin, setLocBin] = useState('A');
  const [locWeight, setLocWeight] = useState(500);

  // Handle WH Submit
  const handleWhSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName || !whCode || !whCity || !whPin) {
      alert('Kindly verify custom parameters.');
      return;
    }

    const newWh: WmsWarehouse = {
      id: `wh-${Date.now()}`,
      name: whName,
      code: whCode.toUpperCase(),
      type: whType,
      isPrimary: false,
      address: whAddress,
      city: whCity,
      district: whCity,
      state: whState,
      pinCode: whPin,
      country: 'India',
      managerName: whManager || 'Staff supervisor',
      contactNumber: '+91 91234 56789',
      email: `${whCode.toLowerCase()}.ops@ttgtsolutions.com`,
      totalCapacitySqFt: whCapacity,
      currentUtilizationPercent: 0,
      gpsCoordinates: '19.0760° N, 72.8777° E',
      workingHours: '09:00 AM - 07:00 PM',
      status: 'Active'
    };

    onAddWarehouse(newWh);
    setShowAddWh(false);
    
    // Reset Form
    setWhName('');
    setWhCode('');
    setWhAddress('');
    setWhCity('');
    setWhPin('');
    setWhManager('');
  };

  // Handle Location Submit
  const handleLocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locWhId || !locZone || !locAisle || !locRack || !locShelf || !locBin) {
      alert('Please select warehouse and specify location identifiers (Aisle-Rack-Shelf-Bin)');
      return;
    }

    const matchedWh = warehouses.find(wh => wh.id === locWhId)!;

    const newLoc: WmsWarehouseLocation = {
      id: `wloc-${Date.now()}`,
      warehouseId: locWhId,
      warehouseCode: matchedWh.code,
      zone: locZone,
      aisle: locAisle,
      rack: locRack,
      shelf: locShelf,
      bin: locBin,
      isOccupied: false,
      maxWeightCapacityKg: locWeight
    };

    onAddLocation(newLoc);
    setShowAddLoc(false);

    // Reset Form
    setLocZone('Row A - General');
    setLocAisle('01');
    setLocRack('R1');
    setLocShelf('S1');
    setLocBin('A');
  };

  return (
    <div className="space-y-6">
      
      {/* STRUCTURE SUB-TABS SELECTORS */}
      <div className="flex border-b border-neutral-200 gap-4 text-xs font-mono font-bold uppercase select-none">
        <button
          onClick={() => setActiveTab('hubs')}
          className={`pb-2.5 px-1 border-b-2 transition duration-200 ${activeTab === 'hubs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-450 hover:text-neutral-850'}`}
        >
          🏢 Registered Hubs ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('bins')}
          className={`pb-2.5 px-1 border-b-2 transition duration-200 ${activeTab === 'bins' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-neutral-450 hover:text-neutral-850'}`}
        >
          ⚙️ Location Slottings ({locations.length})
        </button>
      </div>

      {/* A. MANAGE WAREHOUSE HUBS */}
      {activeTab === 'hubs' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-4 border rounded-2xl">
            <div className="space-y-0.5">
              <strong className="text-xs font-bold uppercase font-mono tracking-wider text-neutral-800">GST Registration Center Masters</strong>
              <p className="text-[11px] text-neutral-400">Direct integration with Indian tax networks triggers accurate CGST/SGST allocation matrices on invoicing.</p>
            </div>
            
            <button
              onClick={() => setShowAddWh(!showAddWh)}
              className="px-4 py-1.5 bg-neutral-900 border hover:bg-neutral-850 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Create Warehouse Hub</span>
            </button>
          </div>

          {/* New WH form drawer */}
          {showAddWh && (
            <form onSubmit={whSubmit => handleWhSubmit(whSubmit)} className="bg-white p-5 rounded-2xl border border-neutral-300 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200 font-sans text-xs">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="font-bold text-neutral-700 font-mono text-[10px] uppercase">Onboard Physical Logistic Node</span>
                <button type="button" onClick={() => setShowAddWh(false)} className="text-neutral-400 font-mono">Cancel</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Warehouse Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. TTGT Ahmedabad Logistics Hub"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Hub Code (3 Letter Prefix)*</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. AMD"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Hub category type</label>
                  <select
                    value={whType}
                    onChange={(e) => setWhType(e.target.value as any)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  >
                    <option value="Central">Central Fulfillment Core</option>
                    <option value="Regional">Regional Assembly Hub</option>
                    <option value="Spoke">Spoke Retail node</option>
                    <option value="Cold Storage">Cold Storage Facility</option>
                    <option value="Direct-to-Retail">Direct-to-Retail Outload</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmedabad"
                    value={whCity}
                    onChange={(e) => setWhCity(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">GST State *</label>
                  <select
                    value={whState}
                    onChange={(e) => setWhState(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  >
                    {['Maharashtra', 'Karnataka', 'Gujarat', 'Uttar Pradesh', 'Tamil Nadu', 'Delhi', 'Haryana'].map(stName => (
                      <option key={stName} value={stName}>{stName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Postal PIN *</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 380001"
                      value={whPin}
                      onChange={(e) => setWhPin(e.target.value)}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Size (Sq Ft)</label>
                    <input
                      type="number"
                      value={whCapacity}
                      onChange={(e) => setWhCapacity(parseInt(e.target.value) || 5000)}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Hub corporate address</label>
                  <input
                    type="text"
                    placeholder="Gala No 5, Signature estate industrial park, Sarkhej"
                    value={whAddress}
                    onChange={(e) => setWhAddress(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Ops Manager Profile name</label>
                  <input
                    type="text"
                    placeholder="Aman Mehta"
                    value={whManager}
                    onChange={(e) => setWhManager(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>

              </div>

              <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-850 transition">
                Register Warehouse Hub Property
              </button>
            </form>
          )}

          {/* Cards list factories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map(wh => (
              <div key={wh.id} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden group">
                <span className="absolute top-0 right-0 p-2 bg-neutral-50 text-[10px] font-mono text-neutral-400 font-bold uppercase rounded-bl border-l border-b tracking-tight">{wh.type}</span>
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wide block">{wh.code}-MAIN</span>
                    <strong className="text-sm font-bold text-neutral-850 leading-tight block">{wh.name}</strong>
                  </div>
                  <p className="text-neutral-500 text-xs lines-clamp-2 leading-relaxed">{wh.address}, {wh.city}, {wh.state} - {wh.pinCode}</p>
                </div>

                <div className="space-y-2.5 pt-3 border-t">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-neutral-400">Manager:</span>
                    <strong className="text-neutral-700 font-mono">{wh.managerName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-neutral-400">Total footprint size:</span>
                    <strong className="text-neutral-700 font-mono">{wh.totalCapacitySqFt.toLocaleString()} Sq Ft</strong>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-neutral-450">
                      <span>Live allocation density:</span>
                      <strong>{wh.currentUtilizationPercent}%</strong>
                    </div>
                    <div className="bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-neutral-900 h-full rounded-full transition-all" style={{ width: `${wh.currentUtilizationPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Remove Warehouse option */}
                {!wh.isPrimary && (
                  <button
                    id={`delete-warehouse-${wh.id}`}
                    onClick={() => {
                      if (window.confirm(`Perform database truncation for warehouse ${wh.code}? Are you sure?`)) {
                        onDeleteWarehouse(wh.id);
                      }
                    }}
                    className="mt-2 text-rose-600 hover:text-rose-800 text-[10px] font-mono font-bold uppercase self-start"
                  >
                    Truncate property
                  </button>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      {/* B. MANAGE SLOTS LOCATIONS */}
      {activeTab === 'bins' && (
        <div className="space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50 p-4 border rounded-2xl">
            <div className="space-y-0.5">
              <strong className="text-xs font-bold uppercase font-mono tracking-wider text-neutral-800">Physical Stock Position Slotting</strong>
              <p className="text-[11px] text-neutral-400">Assign aisle sections, racks, shelves, and coordinate-bins inside active hubs.</p>
            </div>
            
            <button
              onClick={() => setShowAddLoc(!showAddLoc)}
              className="px-4 py-1.5 bg-neutral-900 border hover:bg-neutral-850 text-white rounded-xl text-xs font-mono font-bold uppercase transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Provision Slotting Coordinate</span>
            </button>
          </div>

          {/* New Location Form */}
          {showAddLoc && (
            <form onSubmit={locSubmit => handleLocSubmit(locSubmit)} className="bg-white p-5 rounded-2xl border border-neutral-300 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200 text-xs">
              <div className="border-b pb-2 flex justify-between items-center">
                <span className="font-bold text-neutral-700 font-mono text-[10px] uppercase">Provision shelf slot coordinate (WMS Matrix)</span>
                <button type="button" onClick={() => setShowAddLoc(false)} className="text-neutral-400 font-mono">Cancel</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono">
                
                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Target Warehouse property *</label>
                  <select
                    value={locWhId}
                    onChange={(e) => setLocWhId(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    required
                  >
                    <option value="">-- Choose Space --</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.code} - {wh.city}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Zone Category label *</label>
                  <select
                    value={locZone}
                    onChange={(e) => setLocZone(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  >
                    <option value="Row A - Raw Materials">Row A - Raw Materials</option>
                    <option value="Row B - Packaging">Row B - Packaging Corrugated</option>
                    <option value="Row C - Plastics">Row C - Plastics & Closures</option>
                    <option value="Row D - Apparel">Row D - Textiles & Yarn</option>
                    <option value="Row E - Electronics">Row E - High-Premium Electronics</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Aisle (2 Digit Prefix) *</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. 01"
                    value={locAisle}
                    onChange={(e) => setLocAisle(e.target.value)}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Rack Row (R Code) *</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. R3"
                    value={locRack}
                    onChange={(e) => setLocRack(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Shelf level (S Code) *</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="e.g. S1"
                    value={locShelf}
                    onChange={(e) => setLocShelf(e.target.value.toUpperCase())}
                    className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Coordinate Bin *</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="e.g. A"
                      value={locBin}
                      onChange={(e) => setLocBin(e.target.value.toUpperCase())}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1 font-sans">
                    <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Limit (Kg)</label>
                    <input
                      type="number"
                      value={locWeight}
                      onChange={(e) => setLocWeight(parseInt(e.target.value) || 500)}
                      className="w-full bg-neutral-50 px-3 py-2 border rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

              </div>

              <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-neutral-850 transition">
                Register Bin-Slot Coordinate Coordinates
              </button>
            </form>
          )}

          {/* Table display slots */}
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b text-[10px] font-mono text-neutral-400 uppercase">
                    <th className="p-3">Facility Node</th>
                    <th className="p-3">Zone Section</th>
                    <th className="p-3">Coordinates (Aisle/Rack/Shelf/Bin)</th>
                    <th className="p-3">Bind Item</th>
                    <th className="p-3">Occupancy Status</th>
                    <th className="p-3 font-sans text-right">Max weight limit</th>
                    <th className="p-3 text-right">Delete coordinate</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-600 font-mono">
                  {locations.map(loc => {
                    const mappedItemName = products.find(p => p.id === loc.currentProductId)?.sku || 'Empty shelf';

                    return (
                      <tr key={loc.id} className="hover:bg-neutral-50/20">
                        <td className="p-3 font-bold text-neutral-850">{loc.warehouseCode || 'Central Node'}</td>
                        <td className="p-3 font-sans text-[11px] text-neutral-500">{loc.zone}</td>
                        <td className="p-3 font-bold text-[11.5px] text-neutral-900">
                          {loc.aisle}-{loc.rack}-{loc.shelf}-{loc.bin}
                        </td>
                        <td className="p-3">
                          <span className={loc.isOccupied ? 'text-indigo-700 font-bold' : 'text-neutral-400 italic'}>
                            {mappedItemName}
                          </span>
                        </td>
                        <td className="p-3 leading-none">
                          {loc.isOccupied ? (
                            <span className="bg-rose-50 text-rose-700 font-bold text-[9px] px-2 py-0.5 rounded border border-rose-100">OCCUPIED</span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 font-bold text-[9px] px-2 py-0.5 rounded border border-emerald-100">AVAILABLE</span>
                          )}
                        </td>
                        <td className="p-3 text-right text-[11.5px] text-neutral-800">{loc.maxWeightCapacityKg || 500} Kg</td>
                        <td className="p-3 text-right">
                          <button
                            id={`delete-location-${loc.id}`}
                            onClick={() => {
                              if (window.confirm(`Sever coordinate slot ${loc.aisle}-${loc.rack}-${loc.shelf}-${loc.bin}?`)) {
                                onDeleteLocation(loc.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 shrink-0"
                          >
                            <Trash2 size={13} className="ml-auto" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
