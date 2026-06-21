/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  Command, 
  Calendar, 
  Database, 
  Globe, 
  Check, 
  ShieldAlert
} from 'lucide-react';
import { UserRole, NotificationItem } from '../types';

interface NavbarProps {
  currentTab: string;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  onSearchQueryChange: (query: string) => void;
  searchQuery: string;
}

export default function Navbar({
  currentTab,
  userRole,
  setUserRole,
  notifications,
  markNotificationAsRead,
  onSearchQueryChange,
  searchQuery
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const rolesList = Object.values(UserRole);

  const tabLabels: Record<string, string> = {
    dashboard: 'Dashboard Home',
    vendors: 'Vendor Master Records',
    products: 'B2B Product Listing (HSN)',
    inventory: 'FIFO Inventory Register',
    warehouse: 'Warehouse Picking & Packing',
    orders: 'Marketplace Orders (B2B Tax Invoices)',
    customers: 'Customer Master Directory',
    finance: 'GST / TDS Auditing Office',
    reports: 'Enterprise Profit & Analytics',
    crm: 'CRM Lead Pipeline',
    employees: 'Employee Roster & Permissions',
    'ai-center': 'AI Smart Agent Hub',
    'db-schema': 'PostgreSQL DDL schema',
    settings: 'Company Profile & ERP config',
  };

  return (
    <div id="top-navbar" className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between z-20 shadow-xs relative shrink-0">
      
      {/* Left section: Breadcrumb & Workspace Metadata */}
      <div className="flex items-center space-x-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans">
            <span>HOME</span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-black">{currentTab}</span>
          </div>
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight leading-none mt-1">
            {tabLabels[currentTab] || 'Operational Master'}
          </h2>
        </div>

        {/* Indian Compliance Metadata */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-mono text-[10px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Calendar size={12} className="text-slate-400" />
            <span>FY: <strong className="text-slate-700">2026-27 (1 Apr - 31 Mar)</strong></span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center space-x-1.5">
            <Globe size={12} className="text-emerald-500" />
            <span>Region: <strong className="text-slate-700">India (Standard)</strong></span>
          </div>
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-6 relative">
        <div className="absolute left-3 text-slate-400">
          <Search size={14} className="pointer-events-none" />
        </div>
        <input
          id="global-search-input"
          type="text"
          placeholder="Search items, HSN, vendors, orders..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full pl-9 pr-10 py-1.5 bg-slate-100 hover:bg-slate-150 focus:bg-white text-xs text-slate-800 rounded-full border-none focus:ring-1.5 focus:ring-indigo-500 outline-none transition-all placeholder-slate-400 font-medium"
        />
        <div className="absolute right-3.5 flex items-center space-x-0.5 text-[9px] text-slate-400 bg-white px-1.5 rounded border border-slate-200 font-mono pointer-events-none font-medium">
          <Command size={8} />
          <span>K</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Switcher */}
      <div className="flex items-center space-x-3">
        
        {/* Sandbox Health Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-mono leading-none">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Compliance Certified</span>
        </div>

        {/* Role Simulator Selector */}
        <div className="relative">
          <button
            id="role-simulator-btn"
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center space-x-1 text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-800 transition-all shadow-xs"
          >
            <span>Role:</span>
            <span className="text-indigo-400 font-mono font-medium ml-1">{userRole}</span>
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-100">
              <div className="px-2 py-1.5 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono">
                Simulate Role Permissions
              </div>
              <div className="max-h-60 overflow-y-auto mt-1">
                {rolesList.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition flex items-center justify-between ${
                      userRole === r 
                        ? 'bg-indigo-50 font-bold text-indigo-600' 
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="font-mono">{r}</span>
                    {userRole === r && <Check size={14} className="text-indigo-600" />}
                  </button>
                ))}
              </div>
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 px-2 text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                <ShieldAlert size={10} className="text-amber-500 shrink-0" />
                <span>Simulating changes Tab layout access rules.</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon & Panel */}
        <div className="relative">
          <button
            id="notif-bar-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSelector(false);
            }}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 relative focus:outline-none border border-neutral-200"
          >
            <Bell size={18} />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-rose-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadNotifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-800 font-sans">Indian Compliance Alerts</h4>
                <span className="text-[10px] font-mono text-neutral-400">{unreadNotifications.length} active</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1 space-y-2 mt-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-400">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`text-left rounded-lg p-2 text-xs border cursor-pointer transition ${
                        notif.read 
                          ? 'bg-white border-neutral-100 text-neutral-500' 
                          : 'bg-orange-50/50 border-orange-100 text-neutral-800 font-medium'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{notif.title}</span>
                        {!notif.read && <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />}
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{notif.message}</p>
                      <span className="text-[9px] text-neutral-400 block mt-1.5 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
