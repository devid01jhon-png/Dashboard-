/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCog, 
  ShieldCheck, 
  Briefcase, 
  Settings, 
  Eye, 
  Check, 
  Plus, 
  Trash2,
  Lock,
  Compass
} from 'lucide-react';
import { Employee, UserRole, PermissionSet } from '../types';

interface EmployeesModuleProps {
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  deleteEmployee: (id: string) => void;
  rolePermissions: Record<UserRole, PermissionSet>;
  updateRolePermissions: (role: UserRole, permissionKey: keyof PermissionSet, enabled: boolean) => void;
}

export default function EmployeesModule({
  employees,
  addEmployee,
  deleteEmployee,
  rolePermissions,
  updateRolePermissions
}: EmployeesModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeSelectedRole, setActiveSelectedRole] = useState<UserRole>(UserRole.PACKING_STAFF);

  // Add Employee Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.READ_ONLY);
  const [dept, setDept] = useState('Logistics');
  const [pan, setPan] = useState('');
  const [uan, setUan] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pan) {
      alert('Kindly verify employee Name, PAN number and official email.');
      return;
    }

    if (pan.length !== 10) {
      alert('Official PAN requires 10 characters.');
      return;
    }

    addEmployee({
      name,
      email,
      role,
      status: 'Active',
      department: dept,
      uan: uan || undefined,
      pan: pan.toUpperCase()
    });

    // Reset Form
    setName('');
    setEmail('');
    setRole(UserRole.READ_ONLY);
    setDept('Logistics');
    setPan('');
    setUan('');
    setShowAddForm(false);
  };

  const currentPermissions = rolePermissions[activeSelectedRole];

  // Helper labels for the permissions list
  const permissionLabels: Record<keyof PermissionSet, string> = {
    viewDashboard: 'Compute general dashboard analytics & KPI charts',
    manageVendors: 'Audit digital vendors files & adjust ledger books balances',
    manageProducts: 'Register SKU materials & modify excise HSN codes',
    manageInventory: 'Track batch FIFO logs, process cargo inwards and damaged write-offs',
    warehouseOperations: 'Operate picking charts checklists & packing volumetric calculations',
    manageOrders: 'Process marketplace pipelines & generate printable B2B Tax Invoices',
    manageFinance: 'Monitor GST collections payables, TDS Section withholdings & filed returns',
    manageEmployees: 'Register staff workers & toggle security credentials',
    useAICenter: 'Communicate with simulated intelligence agents',
    editSettings: 'Modify corporate PAN, GSTIN, CIN & TAN numbers metadata'
  };

  return (
    <div className="space-y-6">

      {/* Employee listing table */}
      <div className="bg-white border rounded-xl overflow-hidden border-neutral-200 shadow-sm space-y-4 p-5">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-neutral-850 text-sm">SaaS Operational Employees Roster</h3>
            <p className="text-xs text-neutral-400 font-mono">Assigned corporate personnel with direct application binders.</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1 h-8 bg-neutral-900 text-white text-xs font-semibold px-3 rounded-lg hover:bg-neutral-850 transition font-mono"
          >
            <Plus size={13} />
            <span>Onboard Employee</span>
          </button>
        </div>

        {/* Add Employee Form Slide down */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono animate-in slide-in-from-top-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">Legal Name *</label>
              <input
                type="text"
                placeholder="Mayur Satwan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 focus:border-orange-500 border rounded outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">Official Official Email *</label>
              <input
                type="email"
                placeholder="mayur.s@ttgt.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 focus:border-orange-500 border rounded outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">Excise PAN Code *</label>
              <input
                type="text"
                maxLength={10}
                placeholder="AABCV2011M"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full bg-white px-2.5 py-1.5 focus:border-orange-500 border rounded outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">India EPF UAN (12 digits)</label>
              <input
                type="text"
                maxLength={12}
                placeholder="100948321045"
                value={uan}
                onChange={(e) => setUan(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white px-2.5 py-1.5 focus:border-orange-500 border rounded outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">Assigned Platform Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-white px-2.5 py-1.5 border rounded"
              >
                {Object.values(UserRole).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-neutral-500">Operational Department</label>
              <input
                type="text"
                placeholder="Corporate Accounts"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-white px-2.5 py-1.5 border rounded"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-1.5 rounded transition uppercase">
                Authorize Personnel Binding
              </button>
            </div>
          </form>
        )}

        {/* Employee Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-b">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">E-mail</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">PAN Details</th>
                <th className="py-2.5 px-3 font-mono">Provident UAN</th>
                <th className="py-2.5 px-3">Role Profile</th>
                <th className="py-2.5 px-3 text-center">Roster actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-neutral-50/50 transition">
                  <td className="py-3 px-3 font-semibold text-neutral-800">{emp.name}</td>
                  <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">{emp.email}</td>
                  <td className="py-3 px-3 text-neutral-500">{emp.department}</td>
                  <td className="py-3 px-3 font-mono uppercase text-neutral-500">{emp.pan}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-neutral-500">{emp.uan || <span className="text-neutral-350 italic">Not set</span>}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-50 text-sky-700 border border-sky-100 font-bold">
                      {emp.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className={`${emp.role === UserRole.SUPER_ADMIN ? 'opacity-40 cursor-not-allowed' : 'hover:bg-rose-50 text-rose-500'} p-1 rounded border border-neutral-100 transition`}
                      disabled={emp.role === UserRole.SUPER_ADMIN}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-based Feature Permission Toggles Matrix */}
      <div className="bg-white border rounded-xl overflow-hidden border-neutral-200 p-5 shadow-sm space-y-4">
        <div className="border-b pb-3 flex justify-between items-center flex-col sm:flex-row gap-2">
          <div>
            <h3 className="font-bold text-neutral-800 text-sm flex items-center space-x-1.5">
              <ShieldCheck className="text-emerald-500" size={17} />
              <span>Interactive Role & Security Permissions Configurator</span>
            </h3>
            <p className="text-xs text-neutral-400 font-mono">Simulate custom SaaS privileges. Choose a role profile and toggle permission markers write back.</p>
          </div>
          
          {/* Active Target Role choice */}
          <select
            value={activeSelectedRole}
            onChange={(e) => setActiveSelectedRole(e.target.value as UserRole)}
            className="bg-neutral-900 text-white font-mono rounded px-3 py-1.5 text-xs outline-none focus:border-orange-500"
          >
            {Object.values(UserRole).map(r => (
              <option key={r} value={r}>Privileges: {r}</option>
            ))}
          </select>
        </div>

        {/* Permissions checksheets rows */}
        <div className="space-y-3.5 max-h-96 overflow-y-auto">
          {Object.keys(currentPermissions).map((key) => {
            const typedKey = key as keyof PermissionSet;
            const isEnabled = currentPermissions[typedKey];
            const isReadLocked = activeSelectedRole === UserRole.SUPER_ADMIN; // Super Admin cannot be downgraded

            return (
              <div 
                key={key} 
                className={`p-3 rounded-lg border text-xs flex justify-between items-center transition ${
                  isEnabled 
                    ? 'border-emerald-100 bg-emerald-50/10' 
                    : 'border-neutral-200 bg-neutral-50/30'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-bold font-mono text-neutral-800 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-snug">{permissionLabels[typedKey]}</p>
                </div>

                <button
                  id={`perm-matrix-btn-${key}`}
                  disabled={isReadLocked}
                  onClick={() => updateRolePermissions(activeSelectedRole, typedKey, !isEnabled)}
                  className={`h-6 w-12 rounded-full p-0.5 transition-colors focus:outline-none relative flex items-center ${
                    isReadLocked ? 'cursor-not-allowed opacity-50' : ''
                  } ${isEnabled ? 'bg-emerald-500 justify-end' : 'bg-neutral-300 justify-start'}`}
                >
                  <span className="h-5 w-5 bg-white rounded-full block shadow" />
                </button>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
