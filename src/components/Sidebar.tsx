/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Layers, 
  Warehouse, 
  ShoppingCart, 
  UserSquare2, 
  IndianRupee, 
  BarChart3, 
  PhoneCall, 
  UserCog, 
  Settings, 
  Cpu, 
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { UserRole, PermissionSet } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  pendingOrdersCount: number;
  lowStockCount: number;
  userRole: UserRole;
  permissions: PermissionSet;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  isCollapsed,
  setIsCollapsed,
  pendingOrdersCount,
  lowStockCount,
  userRole,
  permissions
}: SidebarProps) {

  // Map tabs to icons, labels, permissions checks, and badges
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permitted: true },
    { id: 'vendors', label: 'Vendors', icon: Users, permitted: permissions.manageVendors },
    { id: 'products', label: 'Products', icon: ShoppingBag, permitted: permissions.manageProducts },
    { id: 'inventory', label: 'Inventory', icon: Layers, permitted: permissions.manageInventory, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500' },
    { id: 'warehouse', label: 'Warehouse', icon: Warehouse, permitted: permissions.warehouseOperations },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, permitted: permissions.manageOrders, badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'customers', label: 'Customers', icon: UserSquare2, permitted: true },
    { id: 'finance', label: 'Finance & Taxes', icon: IndianRupee, permitted: permissions.manageFinance },
    { id: 'reports', label: 'Reports', icon: BarChart3, permitted: permissions.manageFinance },
    { id: 'crm', label: 'CRM', icon: PhoneCall, permitted: true },
    { id: 'employees', label: 'Employees', icon: UserCog, permitted: permissions.manageEmployees },
    { id: 'ai-center', label: 'AI Center', icon: Cpu, permitted: permissions.useAICenter },
    { id: 'db-schema', label: 'Database Schema', icon: Database, permitted: true },
    { id: 'settings', label: 'Settings', icon: Settings, permitted: permissions.editSettings },
  ];

  return (
    <div 
      id="sidebar-container"
      className={`relative h-screen bg-[#0f172a] border-r border-slate-800 text-slate-300 flex flex-col transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-indigo-500 flex items-center justify-center font-black text-white text-base tracking-wide shadow-sm">
              T
            </div>
            <div>
              <span className="font-bold text-white text-sm block tracking-wide uppercase">TTGT Solutions</span>
              <span className="text-[10px] text-slate-500 block -mt-0.5 font-mono uppercase tracking-widest">ERP Core Suite</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 mx-auto rounded bg-indigo-500 flex items-center justify-center font-black text-white text-base shadow-sm">
            T
          </div>
        )}
        
        {/* Collapse Toggle */}
        <button
          id="toggle-sidebar-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 shadow-md focus:outline-none transition-all"
        >
          {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Role Indicator Info */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 p-3.5">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
            <ShieldCheck size={16} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Access Clearance</span>
              <span className="text-xs font-semibold text-indigo-400 block truncate font-mono uppercase tracking-wide">{userRole}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          if (!item.permitted) return null;
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              id={`nav-btn-${item.id}`}
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center rounded-md px-3 py-2 transition-all duration-150 group font-sans relative ${
                isActive 
                  ? 'bg-indigo-600/20 text-white font-medium border-l-2 border-indigo-500 rounded-l-none pl-2.5' 
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <div className={`flex items-center justify-center ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
              </div>
              {!isCollapsed && (
                <span className="text-[13px] flex-1 text-left tracking-wide">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full leading-none ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-1 right-2 h-2 w-2 rounded-full ring-2 ring-slate-900 bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Meta Controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white italic">
            JD
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden">
              <span className="text-xs font-semibold text-white block">Jai Dev</span>
              <span className="text-[9px] text-slate-500 block truncate font-mono">SUPER ADMIN</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
