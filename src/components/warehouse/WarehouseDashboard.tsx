/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  SlidersHorizontal, 
  CheckCircle2, 
  Truck, 
  TrendingUp, 
  Sparkles,
  Container,
  UserCheck2,
  CalendarDays,
  Compass
} from 'lucide-react';
import { WmsWarehouse, WmsWarehouseLocation } from '../inventory/wmsTypes';

interface WarehouseDashboardProps {
  warehouses: WmsWarehouse[];
  locations: WmsWarehouseLocation[];
}

export default function WarehouseDashboard({
  warehouses,
  locations
}: WarehouseDashboardProps) {
  // Analytical calculators
  const activeWhSize = warehouses.length;
  const averageUtilPercent = Math.round(warehouses.reduce((acc, w) => acc + w.currentUtilizationPercent, 0) / activeWhSize);
  const totalSlotsSize = locations.length;
  const occupiedSlotsSize = locations.filter(l => l.isOccupied).length;
  const occupiedSlotsPercent = Math.round((occupiedSlotsSize / (totalSlotsSize || 1)) * 100);

  // Selected warehouse floor map visual state
  const [selectedMappingWh, setSelectedMappingWh] = useState('wh-1');
  const mappingLocations = locations.filter(l => l.warehouseId === selectedMappingWh);

  // Warehouse specific calculations
  const currentWh = warehouses.find(w => w.id === selectedMappingWh) || warehouses[0];

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: TOP EXECUTIVE METASEGMENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Warehouses Count */}
        <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">India Network Nodes</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-neutral-900">{activeWhSize}</span>
              <span className="text-xs text-neutral-450 font-bold uppercase font-mono">Hubs</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-snug">Warehouse GSTIN registered centers</p>
          </div>
          <div className="p-3 bg-neutral-100 text-neutral-700 rounded-xl">
            <Building2 size={18} />
          </div>
        </div>

        {/* Global volumetric capacity */}
        <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">WMS Total Footprint</span>
            <div className="flex items-baseline space-x-2.5">
              <span className="text-2xl font-black font-mono text-neutral-900">
                {warehouses.reduce((acc, w) => acc + w.totalCapacitySqFt, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-neutral-450 font-bold font-mono">Sq. Ft</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-snug">Average Network utilization: <strong>{averageUtilPercent}%</strong></p>
          </div>
          <div className="p-3 bg-neutral-100 text-indigo-700 rounded-xl">
            <Container size={18} />
          </div>
        </div>

        {/* Locations slotted */}
        <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">Slotted Bin Clusters</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-neutral-900">{occupiedSlotsSize} / {totalSlotsSize}</span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-snug">Occupancy: <strong>{occupiedSlotsPercent}%</strong> allocation density</p>
          </div>
          <div className="p-3 bg-neutral-100 text-emerald-700 rounded-xl">
            <Layers size={18} />
          </div>
        </div>

        {/* Dispatch SLA */}
        <div className="bg-white border p-5 rounded-2xl shadow-sm flex items-start justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-wider block">Shipment SLA accuracy</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-mono text-neutral-900">99.8%</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold font-mono leading-snug">✓ Average pick speed: 4.2 mins</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
            <CheckCircle2 size={18} />
          </div>
        </div>

      </div>

      {/* SECTION 2: PHYSICAL INDUSTRIAL ZONE MAP -- HOVER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Floor Slot floor map */}
        <div className="lg:col-span-8 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono flex items-center space-x-2">
                <Compass size={14} className="text-indigo-600 animate-spin-slow" />
                <span>Spatial Bin-Slotting Floor Plan</span>
              </h4>
              <p className="text-[10px] text-neutral-400 font-sans">Visual representation of rack slots layout and live occupied status.</p>
            </div>

            <select
              value={selectedMappingWh}
              onChange={(e) => setSelectedMappingWh(e.target.value)}
              className="px-2 py-1 bg-neutral-50 border rounded-lg text-xs font-mono text-neutral-700 focus:outline-none"
            >
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.code} - {wh.city} floor</option>
              ))}
            </select>
          </div>

          {/* Graphical Rack Bays mock */}
          <div className="bg-neutral-900 text-white rounded-xl p-5 font-mono text-xs space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center text-[10px] text-neutral-450 pb-2 border-b border-neutral-850">
              <span>FACILITY ID: {currentWh.code}</span>
              <span className="text-emerald-400 block pb-0.5">● LIVE TELEMETRY</span>
            </div>

            {/* Layout grid containing sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Row Left section */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Aisle West Zone (Bays 1-5)</span>
                <div className="grid grid-cols-5 gap-2 select-none">
                  {mappingLocations.slice(0, 5).map(loc => (
                    <div
                      key={loc.id}
                      className={`h-11 rounded border flex flex-col justify-center items-center text-center p-1 cursor-pointer transition ${
                        loc.isOccupied 
                          ? 'bg-rose-950/80 border-rose-600/60 hover:bg-rose-900' 
                          : 'bg-emerald-950/40 border-emerald-700/65 hover:bg-emerald-900'
                      }`}
                    >
                      <strong className="text-[10px] block font-black text-white">{loc.aisle}-{loc.rack}</strong>
                      <span className="text-[9px] text-neutral-400 block mt-0.5 font-bold">Qty {loc.currentQuantity || 0}</span>
                    </div>
                  ))}
                  {/* Missing slots backup */}
                  {mappingLocations.slice(0, 5).length === 0 && (
                    <div className="col-span-5 text-center py-4 text-[10px] text-neutral-450 italic">Floor space in allocation planning.</div>
                  )}
                </div>
              </div>

              {/* Row Right section */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Aisle East Zone (Bays 6-10)</span>
                <div className="grid grid-cols-5 gap-2 select-none">
                  {mappingLocations.slice(5, 10).map(loc => (
                    <div
                      key={loc.id}
                      className={`h-11 rounded border flex flex-col justify-center items-center text-center p-1 cursor-pointer transition ${
                        loc.isOccupied 
                          ? 'bg-rose-950/80 border-rose-600/60 hover:bg-rose-900' 
                          : 'bg-emerald-950/30 border-emerald-700/50 hover:bg-emerald-900'
                      }`}
                    >
                      <strong className="text-[10px] block font-black text-white">{loc.aisle}-{loc.rack}</strong>
                      <span className="text-[9px] text-neutral-400 block mt-0.5 font-bold">Qty {loc.currentQuantity || 0}</span>
                    </div>
                  ))}
                  {mappingLocations.slice(5, 10).length === 0 && (
                    <div className="col-span-5 text-center py-4 text-[10px] text-neutral-450 italic">Bay unslotted. Available for pallet receiving.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Micro map indicators */}
            <div className="border-t border-neutral-850 pt-3 flex text-[10px] space-x-4 text-neutral-450">
              <span className="flex items-center space-x-1.5"><code className="h-2.5 w-2.5 bg-rose-950 border border-rose-500 rounded-sm" /> <span>Allocated / Occupied</span></span>
              <span className="flex items-center space-x-1.5"><code className="h-2.5 w-2.5 bg-emerald-950 border border-emerald-500 rounded-sm" /> <span>Empty / Available</span></span>
              <span className="flex items-center space-x-1.5"><code className="h-2.5 w-2.5 bg-yellow-950 border border-yellow-500 rounded-sm" /> <span>Quarantined QC</span></span>
            </div>

          </div>

        </div>

        {/* Operational Staff Metrics */}
        <div className="lg:col-span-4 bg-white border rounded-2xl p-5 shadow-sm space-y-4 font-sans text-xs">
          <div className="border-b pb-3 flex justify-between items-center">
            <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono flex items-center space-x-1.5">
              <UserCheck2 size={14} className="text-neutral-700" />
              <span>Staffing shift allocations</span>
            </h4>
            <span className="text-[9px] bg-indigo-50 px-2 py-0.5 rounded font-mono text-indigo-700">6 Active Crew</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Sunil Kumar', role: 'Inbound Dock Supervisor', status: 'Active Duty', task: 'Validating GSTR PO-0042 invoice' },
              { name: 'Aniket Shinde', role: 'Inventory Auditor', status: 'Active Duty', task: 'Performing physical count in Aisle C' },
              { name: 'Ramesh Gowda', role: 'WMS Dispatch Lead (BLR)', status: 'On Break', task: 'RTO parcel sorting' },
              { name: 'Vijay Shekhawat', role: 'MHE Forklift Driver', status: 'Active Duty', task: 'Putaway sequence for GRN-0041' }
            ].map((staff, idx) => (
              <div key={idx} className="p-3 bg-neutral-50 rounded-xl space-y-1">
                <div className="flex justify-between font-mono text-[11px] leading-tight font-black">
                  <span className="text-neutral-850">{staff.name}</span>
                  <span className="text-emerald-700 text-[10px]">● {staff.status}</span>
                </div>
                <div className="text-neutral-450 text-[10.5px]">{staff.role}</div>
                <div className="text-neutral-550 italic text-[10.5px] border-t border-dotted mt-1 pt-1 opacity-90 font-mono">Current: {staff.task}</div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
