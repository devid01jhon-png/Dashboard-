/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Download, Upload, ShieldCheck, Building, MapPin, 
  Percent, Briefcase, FileCheck2, Lock, ArrowUpRight, AlertCircle, 
  Settings, ThumbsUp, AlertTriangle, Clock, Trash2, Eye, FileText, 
  CheckCircle, HelpCircle, Activity, ChevronRight, Check, ChevronDown, ListFilter,
  TrendingUp, CreditCard, ShieldAlert, MessageSquare, PlusCircle, CheckCircle2
} from 'lucide-react';
import { Vendor } from '../types';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from 'recharts';

interface VendorsModuleProps {
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateVendorBalance: (id: string, amount: number) => void;
  deleteVendor: (id: string) => void;
  searchQuery: string;
}

// 1. Interfaces for comprehensive local state extensions
interface ExtendedVendorFields {
  legalName?: string;
  ownerName?: string;
  businessType?: string;
  gstRegType?: string;
  natureOfBusiness?: string;
  tan?: string;
  msmeNumber?: string;
  cin?: string;
  llpin?: string;
  udyamRegistration?: string;
  iecCode?: string;
  businessCategory?: string;
  businessSubcategory?: string;
  yearEstablished?: string;
  website?: string;
  alternatePhone?: string;
  warehouseAddress?: string;
  pickupAddress?: string;
  billingAddress?: string;
  district?: string;
  country?: string;
  mapLocation?: string;
  commissionPercent?: number;
  settlementCycle?: 'Weekly' | '15 Days' | 'Monthly' | 'Custom';
  minOrderValue?: number;
  maxOrderValue?: number;
  returnPolicy?: string;
  replacementPolicy?: string;
  warranty?: string;
  codAllowed?: boolean;
  prepaidAllowed?: boolean;
  activeMarketplaces?: string[];
}

interface VendorSettlement {
  id: string;
  vendorId: string;
  period: string;
  grossAmount: number;
  commission: number;
  igst: number;
  cgst: number;
  sgst: number;
  tds: number;
  netPayable: number;
  status: 'Processed' | 'Pending' | 'Hold';
  paymentRef: string;
  date: string;
}

interface VendorDoc {
  id: string;
  vendorId: string;
  type: string;
  fileName: string;
  expiryDate: string;
  verificationStatus: 'Pending' | 'Verified' | 'Flagged';
  approvalStatus: 'Approved' | 'Rejected' | 'Pending';
}

interface SupportTicket {
  id: string;
  vendorId: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Closed';
  createdAt: string;
}

interface InternalNote {
  id: string;
  vendorId: string;
  text: string;
  author: string;
  timestamp: string;
}

interface VendorActivity {
  id: string;
  vendorId: string;
  action: string;
  details: string;
  timestamp: string;
  performedBy: string;
}

export default function VendorsModule({
  vendors,
  addVendor,
  updateVendorBalance,
  deleteVendor,
  searchQuery: mainSearchQuery
}: VendorsModuleProps) {
  // Navigation & Core selection states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list' | 'add' | 'profile' | 'products' | 'orders' | 'inventory' | 'settlements' | 'documents' | 'performance' | 'support' | 'logs' | 'db_schema'>('dashboard');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [localSearch, setLocalSearch] = useState('');
  
  // Filtering states for main list
  const [filterState, setFilterState] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterMsme, setFilterMsme] = useState('All');

  // Interactive popup variables
  const [showInvoiceId, setShowInvoiceId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistence local states
  const [extendedData, setExtendedData] = useState<Record<string, ExtendedVendorFields>>({});
  const [settlements, setSettlements] = useState<VendorSettlement[]>([]);
  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [vendorLogs, setVendorLogs] = useState<VendorActivity[]>([]);

  // Trigger brief Toast messages
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync / Initialize mock relational tables
  useEffect(() => {
    // 1. Initial extended settings
    const storedExtended = localStorage.getItem('ttgt_ext_details');
    if (storedExtended) {
      setExtendedData(JSON.parse(storedExtended));
    } else {
      const initial: Record<string, ExtendedVendorFields> = {
        'vendor-1': {
          legalName: 'Kalyani Electronics Component Hub Private Limited',
          ownerName: 'Ananth Kalyani',
          businessType: 'Private Limited',
          gstRegType: 'Registered',
          natureOfBusiness: 'Manufacturer',
          tan: 'BLRK09812A',
          msmeNumber: 'UDYAM-KA-02-0051234',
          cin: 'U32109KA2015PTC078945',
          udyamRegistration: 'UDYAM-KA-02-0051234',
          businessCategory: 'Electronics accessories',
          businessSubcategory: 'Copper Conductors & HDMI',
          yearEstablished: '2015',
          website: 'www.kalyanielectronics.in',
          commissionPercent: 12,
          settlementCycle: 'Weekly',
          minOrderValue: 5000,
          maxOrderValue: 500000,
          activeMarketplaces: ['Amazon', 'Flipkart', 'Own Website'],
          warehouseAddress: 'Plot 4A, Bommasandra Industrial Area, Bangalore, Karnataka, 560099',
          pickupAddress: 'Gala 1, SP Road, Bangalore, Karnataka, 560002',
          billingAddress: '42, SP Road, Electronic District, Bangalore, 560002'
        },
        'vendor-2': {
          legalName: 'Vardhman Textiles & Yarn Limited',
          ownerName: 'Nitin Oswal',
          businessType: 'Private Limited',
          gstRegType: 'Registered',
          natureOfBusiness: 'Manufacturer',
          tan: 'LDHK11223F',
          msmeNumber: 'None',
          cin: 'U17111PB1973PLC003345',
          udyamRegistration: 'None',
          businessCategory: 'Apparels & Textile',
          businessSubcategory: 'Yarns & Combed Cotton',
          yearEstablished: '1973',
          website: 'www.vardhmanyarns.com',
          commissionPercent: 8,
          settlementCycle: 'Weekly',
          minOrderValue: 15000,
          maxOrderValue: 5000000,
          activeMarketplaces: ['Myntra', 'Ajio', 'Amazon'],
          warehouseAddress: 'Vardhman Logistics Hub, Ludhiana, Punjab, 141010',
          pickupAddress: 'Dispatched Bay 3, Chandigarh Road, Ludhiana, 141010',
          billingAddress: 'Industrial Area-A, Chandigarh Road, Ludhiana, Punjab'
        },
        'vendor-3': {
          legalName: 'Apex Packaging Solutions Partnership',
          ownerName: 'Rajesh Solanki',
          businessType: 'Partnership',
          gstRegType: 'Registered',
          natureOfBusiness: 'Service Provider',
          tan: 'MUMB04412W',
          msmeNumber: 'UDYAM-MH-19-0099412',
          cin: 'None',
          udyamRegistration: 'UDYAM-MH-19-0099412',
          businessCategory: 'Logistics Materials',
          businessSubcategory: 'Heavy Duty Box & Tapes',
          yearEstablished: '2018',
          website: 'www.apexpack.co.in',
          commissionPercent: 15,
          settlementCycle: '15 Days',
          minOrderValue: 2000,
          maxOrderValue: 200000,
          activeMarketplaces: ['Flipkart', 'Amazon'],
          warehouseAddress: 'MIDC Phase-II, Andheri East, Mumbai, 400093',
          pickupAddress: 'MIDC Phase-II, Andheri East, Mumbai, 400093',
          billingAddress: 'Gala No 14, Phase 2, MIDC, Andheri East, Mumbai, MH'
        }
      };
      setExtendedData(initial);
      localStorage.setItem('ttgt_ext_details', JSON.stringify(initial));
    }

    // 2. Initial Settlements
    const storedSettlements = localStorage.getItem('ttgt_ext_settlements');
    if (storedSettlements) {
      setSettlements(JSON.parse(storedSettlements));
    } else {
      const initSettle: VendorSettlement[] = [
        { id: 'SET-2026-901', vendorId: 'vendor-1', period: '01 Jun - 07 Jun 2026', grossAmount: 185000, commission: 22200, igst: 3996, cgst: 0, sgst: 0, tds: 1850, netPayable: 156954, status: 'Processed', paymentRef: 'NEFT-HDFCR520260608', date: '2026-06-08' },
        { id: 'SET-2026-902', vendorId: 'vendor-1', period: '08 Jun - 14 Jun 2026', grossAmount: 140000, commission: 16800, igst: 3024, cgst: 0, sgst: 0, tds: 1400, netPayable: 118776, status: 'Processed', paymentRef: 'NEFT-HDFCR520260615', date: '2026-06-15' },
        { id: 'SET-2026-903', vendorId: 'vendor-1', period: '15 Jun - 21 Jun 2026', grossAmount: 84500, commission: 10140, igst: 1825.2, cgst: 0, sgst: 0, tds: 845, netPayable: 71689.8, status: 'Pending', paymentRef: 'UPI-QUEUE-941', date: '2026-06-21' },
        { id: 'SET-2026-904', vendorId: 'vendor-2', period: '01 Jun - 15 Jun 2026', grossAmount: 940000, commission: 75200, igst: 13536, cgst: 0, sgst: 0, tds: 940, netPayable: 850324, status: 'Processed', paymentRef: 'RTGS-ICICIR4920112', date: '2026-06-16' },
        { id: 'SET-2026-905', vendorId: 'vendor-3', period: '01 Jun - 15 Jun 2026', grossAmount: 84300, commission: 12645, igst: 0, cgst: 1138.05, sgst: 1138.05, tds: 1686, netPayable: 67692.9, status: 'Processed', paymentRef: 'NEFT-UTIBR411225', date: '2026-06-17' }
      ];
      setSettlements(initSettle);
      localStorage.setItem('ttgt_ext_settlements', JSON.stringify(initSettle));
    }

    // 3. KYC Documents List
    const storedDocs = localStorage.getItem('ttgt_ext_docs');
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    } else {
      const initDocs: VendorDoc[] = [
        { id: 'd-1', vendorId: 'vendor-1', type: 'PAN Card', fileName: 'PAN_APKPK8934L.pdf', expiryDate: 'Permanent', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-2', vendorId: 'vendor-1', type: 'GST Certificate', fileName: 'GSTIN_29APKPK8934L.pdf', expiryDate: '2029-04-12', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-3', vendorId: 'vendor-1', type: 'Aadhaar Card', fileName: 'UIDAI_92281829.pdf', expiryDate: 'Permanent', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-4', vendorId: 'vendor-1', type: 'MSME Certificate', fileName: 'MSME_KA02_005.pdf', expiryDate: 'Permanent', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-5', vendorId: 'vendor-2', type: 'GST Certificate', fileName: 'Yarn_Vardhman_GST.pdf', expiryDate: '2030-01-01', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-6', vendorId: 'vendor-2', type: 'PAN Card', fileName: 'Vardhman_PAN_Corp.pdf', expiryDate: 'Permanent', verificationStatus: 'Verified', approvalStatus: 'Approved' },
        { id: 'd-7', vendorId: 'vendor-3', type: 'Trade License', fileName: 'Apex_Trade_26.pdf', expiryDate: '2027-03-31', verificationStatus: 'Pending', approvalStatus: 'Pending' }
      ];
      setDocuments(initDocs);
      localStorage.setItem('ttgt_ext_docs', JSON.stringify(initDocs));
    }

    // 4. Support tickets
    const storedTickets = localStorage.getItem('ttgt_ext_tickets');
    if (storedTickets) {
      setTickets(JSON.parse(storedTickets));
    } else {
      const initTickets: SupportTicket[] = [
        { id: 'TKT-101', vendorId: 'vendor-1', title: 'Input Tax Credit (ITC) mismatch in GSTR-2B dashboard', category: 'GST & Compliance', priority: 'High', status: 'In Progress', createdAt: '2026-06-18T10:15:00Z' },
        { id: 'TKT-102', vendorId: 'vendor-1', title: 'Late fee calculation disputed for delivery batch 924', category: 'Logistics', priority: 'Medium', status: 'Open', createdAt: '2026-06-20T14:02:00Z' },
        { id: 'TKT-103', vendorId: 'vendor-2', title: 'Requesting amendment of billing address on future POs', category: 'Profile Change', priority: 'Low', status: 'Closed', createdAt: '2026-06-11T09:00:00Z' }
      ];
      setTickets(initTickets);
      localStorage.setItem('ttgt_ext_tickets', JSON.stringify(initTickets));
    }

    // 5. Notes
    const storedNotes = localStorage.getItem('ttgt_ext_notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      const initNotes: InternalNote[] = [
        { id: 'n-1', vendorId: 'vendor-1', text: 'On-site audit completed. Certified modern automation systems and healthy labor standards compliance.', author: 'Jai Dev (Super Admin)', timestamp: '2026-06-14T11:20:00Z' },
        { id: 'n-2', vendorId: 'vendor-2', text: 'Exempt from basic industrial security deposits under long-term contract protocols.', author: 'Systems Compliance', timestamp: '2026-06-12T16:45:00Z' }
      ];
      setNotes(initNotes);
      localStorage.setItem('ttgt_ext_notes', JSON.stringify(initNotes));
    }

    // 6. Logs
    const storedLogs = localStorage.getItem('ttgt_ext_logs');
    if (storedLogs) {
      setVendorLogs(JSON.parse(storedLogs));
    } else {
      const initLogs: VendorActivity[] = [
        { id: 'l-1', vendorId: 'vendor-1', action: 'KYC Certified', details: 'Validated PAN (APKPK8934L) and active GSTR-1 matching state indices', timestamp: '2026-06-12T11:00:00Z', performedBy: 'Jai Dev' },
        { id: 'l-2', vendorId: 'vendor-1', action: 'Ledger Post', details: 'Settled ₹1,56,954 against outstanding weekly statement cycle', timestamp: '2026-06-15T15:30:00Z', performedBy: 'Operations FinNode' }
      ];
      setVendorLogs(initLogs);
      localStorage.setItem('ttgt_ext_logs', JSON.stringify(initLogs));
    }
  }, []);

  // Sync state helpers
  const saveExtended = (data: Record<string, ExtendedVendorFields>) => {
    setExtendedData(data);
    localStorage.setItem('ttgt_ext_details', JSON.stringify(data));
  };

  const saveSettlements = (data: VendorSettlement[]) => {
    setSettlements(data);
    localStorage.setItem('ttgt_ext_settlements', JSON.stringify(data));
  };

  const saveDocs = (data: VendorDoc[]) => {
    setDocuments(data);
    localStorage.setItem('ttgt_ext_docs', JSON.stringify(data));
  };

  const saveTickets = (data: SupportTicket[]) => {
    setTickets(data);
    localStorage.setItem('ttgt_ext_tickets', JSON.stringify(data));
  };

  const saveNotes = (data: InternalNote[]) => {
    setNotes(data);
    localStorage.setItem('ttgt_ext_notes', JSON.stringify(data));
  };

  const saveLogs = (data: VendorActivity[]) => {
    setVendorLogs(data);
    localStorage.setItem('ttgt_ext_logs', JSON.stringify(data));
  };

  // Keep a selected corporate profile set
  const currentSelectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0] || null;

  // Add Vendor Form States
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    pan: '',
    gstin: '',
    tan: '',
    msmeNumber: '',
    cin: '',
    llpin: '',
    udyamRegistration: '',
    iecCode: '',
    businessType: 'Proprietorship',
    gstRegType: 'Registered',
    natureOfBusiness: 'Manufacturer',
    businessCategory: 'FMCG',
    businessSubcategory: 'Packaged foods',
    yearEstablished: '2024',
    website: '',
    registeredAddress: '',
    warehouseAddress: '',
    pickupAddress: '',
    billingAddress: '',
    city: '',
    district: '',
    state: 'Maharashtra',
    pinCode: '',
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
    commissionPercent: 10,
    settlementCycle: 'Weekly' as 'Weekly' | '15 Days' | 'Monthly' | 'Custom',
    minOrderValue: 5000,
    maxOrderValue: 1000000,
    returnPolicy: '7 Days Returnable',
    replacementPolicy: '10 Days Placement Cover',
    warranty: '1 Year Brand Warranty',
    codAllowed: true,
    prepaidAllowed: true,
    marketplaces: [] as string[]
  });

  const indianStates = [
    { name: 'Maharashtra', code: '27' },
    { name: 'Delhi', code: '07' },
    { name: 'Karnataka', code: '29' },
    { name: 'Gujarat', code: '24' },
    { name: 'Punjab', code: '03' },
    { name: 'Tamil Nadu', code: '33' },
    { name: 'Uttar Pradesh', code: '09' },
    { name: 'West Bengal', code: '19' },
    { name: 'Telangana', code: '36' },
    { name: 'Haryana', code: '06' }
  ];

  const businessTypes = ['Private Limited', 'LLP', 'Partnership', 'Proprietorship', 'Individual Sellers', 'MSME Businesses'];
  const gstRegistrationTypes = ['Registered', 'Composition', 'Unregistered', 'SEZ Developer'];
  const natureOfBusinesses = ['Manufacturer', 'Wholesaler', 'Distributor', 'Retailer', 'Importer', 'Exporter', 'Service Provider'];
  const settlementCycles = ['Weekly', '15 Days', 'Monthly', 'Custom'];
  const marketplacesList = ['Amazon', 'Flipkart', 'Meesho', 'JioMart', 'Myntra', 'Ajio', 'Own Website'];

  // Form submission & validation
  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.pan || !formData.gstin) {
      triggerToast('Error: Please populate all mandatory registered records.');
      return;
    }
    if (formData.pan.length !== 10) {
      triggerToast('Error: PAN must be 10 characters (e.g. ABCDE1234F).');
      return;
    }
    if (formData.gstin.length !== 15) {
      triggerToast('Error: GSTIN must be exactly 15 characters.');
      return;
    }
    const statePrefix = indianStates.find(s => s.name === formData.state)?.code || '27';
    if (!formData.gstin.startsWith(statePrefix)) {
      triggerToast(`Verification Failed: GSTIN code prefix doesn't match chosen state (${formData.state} code is ${statePrefix}).`);
      return;
    }

    // Prepare core object for App.tsx state sync
    const coreId = `vendor-${Date.now()}`;
    addVendor({
      companyName: formData.companyName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      pan: formData.pan.toUpperCase(),
      gstin: formData.gstin.toUpperCase(),
      state: formData.state,
      city: formData.city,
      address: formData.registeredAddress,
      pinCode: formData.pinCode,
      msmeCategory: formData.msmeNumber ? 'Micro' : 'None',
      status: 'Active',
      ledgerBalance: 0,
      tdsApplicable: true,
      tdsSection: '194Q',
      tdsRate: 0.1,
      bankAccount: formData.accountNumber,
      ifsc: formData.ifsc.toUpperCase()
    });

    // Save extended variables in local storage extensions
    const updatedExtensions = {
      ...extendedData,
      [coreId]: {
        legalName: formData.companyName,
        ownerName: formData.contactName,
        businessType: formData.businessType,
        gstRegType: formData.gstRegType,
        natureOfBusiness: formData.natureOfBusiness,
        tan: formData.tan.toUpperCase(),
        msmeNumber: formData.msmeNumber,
        cin: formData.cin.toUpperCase(),
        llpin: formData.llpin.toUpperCase(),
        udyamRegistration: formData.udyamRegistration,
        iecCode: formData.iecCode.toUpperCase(),
        businessCategory: formData.businessCategory,
        businessSubcategory: formData.businessSubcategory,
        yearEstablished: formData.yearEstablished,
        website: formData.website,
        alternatePhone: formData.alternatePhone,
        warehouseAddress: formData.warehouseAddress,
        pickupAddress: formData.pickupAddress,
        billingAddress: formData.billingAddress,
        district: formData.district,
        country: 'India',
        mapLocation: '19.0760, 72.8777 (Mumbai Central Node)',
        commissionPercent: formData.commissionPercent,
        settlementCycle: formData.settlementCycle,
        minOrderValue: formData.minOrderValue,
        maxOrderValue: formData.maxOrderValue,
        returnPolicy: formData.returnPolicy,
        replacementPolicy: formData.replacementPolicy,
        warranty: formData.warranty,
        codAllowed: formData.codAllowed,
        prepaidAllowed: formData.prepaidAllowed,
        activeMarketplaces: formData.marketplaces
      }
    };
    saveExtended(updatedExtensions);

    // Bootstrap Documents
    const documentBoilerplate: VendorDoc[] = [
      { id: `doc-${Date.now()}-1`, vendorId: coreId, type: 'GST Certificate', fileName: `GSTIN_${coreId}.pdf`, expiryDate: '2031-12-31', verificationStatus: 'Pending', approvalStatus: 'Pending' },
      { id: `doc-${Date.now()}-2`, vendorId: coreId, type: 'PAN Card', fileName: `PAN_${coreId}.pdf`, expiryDate: 'Permanent', verificationStatus: 'Pending', approvalStatus: 'Pending' },
      { id: `doc-${Date.now()}-3`, vendorId: coreId, type: 'MSME Certificate', fileName: `UDYAM_${coreId}.pdf`, expiryDate: 'Permanent', verificationStatus: 'Pending', approvalStatus: 'Pending' }
    ];
    saveDocs([...documents, ...documentBoilerplate]);

    // Bootstrap performance log entry
    const initialLog: VendorActivity = {
      id: `l-${Date.now()}`,
      vendorId: coreId,
      action: 'Authorized Onboarding',
      details: 'Drafted full business compliance file and synchronized with tax invoice system',
      timestamp: new Date().toISOString(),
      performedBy: 'GST Consultant'
    };
    saveLogs([initialLog, ...vendorLogs]);

    triggerToast(`Success: Authorized onboarding of "${formData.companyName}".`);
    setSelectedVendorId(coreId);
    setActiveTab('profile');
    
    // Reset form data fields
    setFormData({
      companyName: '', contactName: '', email: '', phone: '', alternatePhone: '', pan: '', gstin: '', tan: '',
      msmeNumber: '', cin: '', llpin: '', udyamRegistration: '', iecCode: '', businessType: 'Proprietorship',
      gstRegType: 'Registered', natureOfBusiness: 'Manufacturer', businessCategory: 'FMCG',
      businessSubcategory: 'Packaged foods', yearEstablished: '2024', website: '', registeredAddress: '',
      warehouseAddress: '', pickupAddress: '', billingAddress: '', city: '', district: '', state: 'Maharashtra',
      pinCode: '', bankName: '', accountHolderName: '', accountNumber: '', ifsc: '', branch: '', upiId: '',
      commissionPercent: 10, settlementCycle: 'Weekly', minOrderValue: 5000, maxOrderValue: 1000000,
      returnPolicy: '7 Days Returnable', replacementPolicy: '10 Days Placement Cover', warranty: '1 Year Brand Warranty',
      codAllowed: true, prepaidAllowed: true, marketplaces: []
    });
  };

  // Support ticket generation state
  const [newTicketTitle, setNewTicketTitle] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Billing & Payout');
  const [newTicketPriority, setNewTicketPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleCreateSupportTicket = () => {
    if (!newTicketTitle || !currentSelectedVendor) return;
    const ticketId = `TKT-${Math.floor(2000 + Math.random() * 8000)}`;
    const newTkt: SupportTicket = {
      id: ticketId,
      vendorId: currentSelectedVendor.id,
      title: newTicketTitle,
      category: newTicketCategory,
      priority: newTicketPriority,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    saveTickets([newTkt, ...tickets]);
    
    const newActLog: VendorActivity = {
      id: `l-${Date.now()}`,
      vendorId: currentSelectedVendor.id,
      action: 'Ticket Raised',
      details: `Generated compliance query ticket: ${ticketId} - "${newTicketTitle}"`,
      timestamp: new Date().toISOString(),
      performedBy: 'Compliance Manager'
    };
    saveLogs([newActLog, ...vendorLogs]);

    triggerToast(`Raised ticket ${ticketId} for ${currentSelectedVendor.companyName}.`);
    setNewTicketTitle('');
  };

  // Add Internal Notes state
  const [newNote, setNewNote] = useState('');
  const handleAddNote = () => {
    if (!newNote || !currentSelectedVendor) return;
    const item: InternalNote = {
      id: `n-${Date.now()}`,
      vendorId: currentSelectedVendor.id,
      text: newNote,
      author: 'Jai Dev (Super Admin)',
      timestamp: new Date().toISOString()
    };
    saveNotes([item, ...notes]);
    setNewNote('');
    triggerToast('Added internal note secure registry log.');
  };

  // Vendor actions & Bulk operators
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  const toggleSelectBulk = (id: string) => {
    setSelectedBulkIds(p => p.includes(id) ? p.filter(v => v !== id) : [...p, id]);
  };
  const toggleSelectAllBulk = (filteredIds: string[]) => {
    if (selectedBulkIds.length === filteredIds.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(filteredIds);
    }
  };

  const handleBulkApprove = () => {
    const updated = documents.map(d => selectedBulkIds.includes(d.vendorId) ? { ...d, verificationStatus: 'Verified' as const, approvalStatus: 'Approved' as const } : d);
    saveDocs(updated);
    triggerToast(`Bulk compliance approved for ${selectedBulkIds.length} registered parties.`);
    setSelectedBulkIds([]);
  };

  const handleBulkBlock = () => {
    triggerToast(`Status indices blocked for ${selectedBulkIds.length} flagged entities.`);
    setSelectedBulkIds([]);
  };

  // Filter vendors logic
  const filteredVendorsList = vendors.filter(v => {
    const term = (mainSearchQuery || localSearch).toLowerCase();
    const matchSearch = v.companyName.toLowerCase().includes(term) ||
      v.contactName.toLowerCase().includes(term) ||
      v.gstin.toLowerCase().includes(term) ||
      v.city.toLowerCase().includes(term) ||
      v.pan.toLowerCase().includes(term);

    const ext = extendedData[v.id] || {};
    const matchState = filterState === 'All' || v.state === filterState;
    const matchType = filterType === 'All' || ext.businessType === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchMsme = filterMsme === 'All' || v.msmeCategory === filterMsme;

    return matchSearch && matchState && matchType && matchStatus && matchMsme;
  });

  // Calculate high-fidelity dashboard metrics
  const totalVendors = vendors.length;
  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
  const inactiveVendorsCount = vendors.filter(v => v.status !== 'Active').length;
  const pendingApprovalsCount = documents.filter(d => d.verificationStatus === 'Pending').length;
  const msmeRegisteredCount = vendors.filter(v => v.msmeCategory !== 'None').length;
  const gstVerifiedCount = documents.filter(d => d.type === 'GST Certificate' && d.approvalStatus === 'Approved').length;
  const totalSettlementsPaid = settlements.reduce((sum, s) => s.status === 'Processed' ? sum + s.grossAmount : sum, 0);
  const pendingSettlements = settlements.reduce((sum, s) => s.status === 'Pending' ? sum + s.grossAmount : sum, 0);

  // Growth & distribution charts
  const revenueTrendData = [
    { month: 'Jan', revenue: 420000, volume: 15 },
    { month: 'Feb', revenue: 580000, volume: 22 },
    { month: 'Mar', revenue: 740000, volume: 30 },
    { month: 'Apr', revenue: 950000, volume: 44 },
    { month: 'May', revenue: 1250000, volume: 61 },
    { month: 'Jun', revenue: 1530000, volume: 80 }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-10rem)]">
      
      {/* LEFT BLOCK: Submodule Navigation list */}
      <div className="w-full xl:w-64 bg-[#0f172a] text-slate-300 rounded-2xl border border-slate-800 p-4 shrink-0 shadow-lg flex flex-col gap-2">
        <div className="pb-3 border-b border-slate-800 mb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building size={16} className="text-indigo-400" />
            <span>Vendors Console</span>
          </h3>
          <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase block mt-1">MODULE SUITE</span>
        </div>

        {/* 12 Vendor Specific Tabs */}
        {[
          { id: 'dashboard', label: 'Vendor Dashboard', icon: Users, badge: activeVendorsCount },
          { id: 'list', label: 'Vendor List', icon: ListFilter },
          { id: 'add', label: 'Add Vendor', icon: PlusCircle, highlight: true },
          { id: 'profile', label: 'Vendor Profile (KYC)', icon: FileCheck2 },
          { id: 'products', label: 'Vendor Products', icon: Briefcase },
          { id: 'orders', label: 'Vendor Orders', icon: Eye },
          { id: 'inventory', label: 'Vendor Inventory', icon: Clock },
          { id: 'settlements', label: 'Vendor Settlements', icon: CreditCard, badge: pendingSettlements > 0 ? 'Review' : undefined },
          { id: 'documents', label: 'Vendor Documents', icon: FileText },
          { id: 'performance', label: 'Vendor Performance', icon: TrendingUp },
          { id: 'support', label: 'Vendor Support', icon: MessageSquare, badge: tickets.filter(t => t.status === 'Open').length },
          { id: 'logs', label: 'Vendor Activity Logs', icon: Activity },
          { id: 'db_schema', label: 'Supabase DB Schema', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== 'list' && tab.id !== 'add' && tab.id !== 'dashboard' && tab.id !== 'db_schema' && vendors.length > 0 && !selectedVendorId) {
                  setSelectedVendorId(vendors[0].id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all duration-150 font-sans group ${
                isActive 
                  ? 'bg-indigo-600 font-bold text-white shadow-md' 
                  : tab.highlight 
                  ? 'bg-indigo-950/40 text-indigo-300 hover:bg-slate-800/80 border border-indigo-900/40'
                  : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={14} className={isActive ? 'text-white' : tab.highlight ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RIGHT BLOCK: Selected subworkspace viewport */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-3xs flex flex-col gap-6 overflow-hidden min-h-[500px]">
        
        {/* Floating Custom Toast notifications */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-slate-100 border border-indigo-800 px-4 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <ShieldAlert size={16} className="text-indigo-400 animate-pulse" />
            <span className="text-xs font-mono font-bold">{toastMessage}</span>
          </div>
        )}

        {/* Global inspect bar: vendor selecting dropdown context mapping */}
        {activeTab !== 'dashboard' && activeTab !== 'list' && activeTab !== 'add' && activeTab !== 'db_schema' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Inspecting Party context</span>
              <h2 className="text-base font-bold text-slate-800">{currentSelectedVendor ? currentSelectedVendor.companyName : 'No Vendor Seed Loaded'}</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Switch Active Party:</span>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs px-2 px-3 py-1.5 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.companyName} ({v.state})</option>
                ))}
              </select>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 1: VENDOR DASHBOARD
            ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Header stats overview cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[
                { name: 'Total Vendors', value: totalVendors, sub: 'National registry', color: 'text-slate-900', bg: 'bg-white' },
                { name: 'Active Vendors (FY)', value: activeVendorsCount, sub: 'Legally vetted', color: 'text-emerald-600', bg: 'bg-emerald-50/55 border-emerald-100' },
                { name: 'MSME Registered', value: msmeRegisteredCount, sub: 'Udyam verified', color: 'text-indigo-600', bg: 'bg-indigo-50/50 border-indigo-100' },
                { name: 'GST Certificate Verified', value: gstVerifiedCount, sub: 'GSTR-1 compliant', color: 'text-sky-600', bg: 'bg-sky-50/50 border-sky-100' },
                { name: 'Pending Approvals', value: pendingApprovalsCount, sub: 'Review required', color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
              ].map((c, idx) => (
                <div key={idx} className={`p-4 rounded-xl border border-slate-200 ${c.bg} flex flex-col justify-between shadow-3xs`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">{c.name}</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-extrabold ${c.color}`}>{c.value}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">{c.sub}</span>
                </div>
              ))}
            </div>

            {/* Charts layouts area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-3xs">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">Monthly Growth Trend (FY 2026-27)</h3>
                    <p className="text-[11px] text-slate-400 font-mono italic">Value indexed in base Indian Rupees (INR)</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">GSTIN Verified</span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData}>
                      <defs>
                        <linearGradient id="dbRevGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontStyle="italic" />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip formatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(value as number)}`} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#dbRevGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Piechart state demographic */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Geographical Distribution</h3>
                  <p className="text-[10px] text-slate-400 font-mono italic">Active GST State Registrations</p>
                </div>

                <div className="h-44 flex items-center justify-center">
                  <PieChart width={160} height={160}>
                    <Pie 
                      data={[
                        { name: 'Maharashtra', value: 3 },
                        { name: 'Punjab', value: 1 },
                        { name: 'Karnataka', value: 1 },
                        { name: 'Delhi', value: 1 }
                      ]} 
                      cx={75} cy={75} innerRadius={35} outerRadius={55} paddingAngle={2} dataKey="value"
                    >
                      {['#6366f1', '#e2e8f0', '#34d399', '#f59e0b'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" />MH (45%)</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />PB (20%)</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />KA (20%)</div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />DL (15%)</div>
                </div>
              </div>
            </div>

            {/* Outstanding vendor tables summary */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Compliance Active Ledger Accounts</h3>
                <button onClick={() => setActiveTab('list')} className="text-xs text-indigo-600 hover:underline font-bold font-mono">View All Logins →</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse divide-y divide-slate-100">
                  <thead>
                    <tr className="text-slate-400 font-mono text-[10px] uppercase">
                      <th className="py-2.5">Company Legal Identity</th>
                      <th className="py-2.5">Contact Root</th>
                      <th className="py-2.5">GST Code</th>
                      <th className="py-2.5">Outstanding Balance</th>
                      <th className="py-2.5">TDS Rule Set</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendors.slice(0, 3).map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-bold text-slate-900">{v.companyName}</td>
                        <td className="py-3 text-slate-600">{v.contactName}</td>
                        <td className="py-3 font-mono text-slate-700">{v.gstin}</td>
                        <td className="py-3 font-bold font-mono">₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(v.ledgerBalance)}</td>
                        <td className="py-3 font-mono text-indigo-600 text-[10px]">{v.tdsApplicable ? `${v.tdsSection} (${v.tdsRate}%)` : 'Exempted'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 2: VENDOR LIST
            ========================================== */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Filter drawer bar control panel */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex flex-wrap gap-4 items-end justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">State Jurisdiction</span>
                  <select 
                    value={filterState} 
                    onChange={e => setFilterState(e.target.value)}
                    className="mt-1 bg-slate-50 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="All">All States</option>
                    <option value="Maharashtra">Maharashtra (MH-27)</option>
                    <option value="Delhi">Delhi (DL-07)</option>
                    <option value="Karnataka">Karnataka (KA-29)</option>
                    <option value="Gujarat">Gujarat (GJ-24)</option>
                    <option value="Punjab">Punjab (PB-03)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Business Type</span>
                  <select 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value)}
                    className="mt-1 bg-slate-50 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">MSME Status</span>
                  <select 
                    value={filterMsme} 
                    onChange={e => setFilterMsme(e.target.value)}
                    className="mt-1 bg-slate-50 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Classes</option>
                    <option value="Micro">Micro Enterprises</option>
                    <option value="Small">Small Enterprises</option>
                    <option value="Medium">Medium Enterprises</option>
                    <option value="None">Non-MSME</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">Active status</span>
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="mt-1 bg-slate-50 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
                  >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Local fast catalog search input */}
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Fast filtering: name, city, gstin..."
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                  className="w-full bg-slate-50 pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1.5 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Bulk compliance actions banner */}
            {selectedBulkIds.length > 0 && (
              <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 flex items-center justify-between animate-in slide-in-from-top-1 font-sans">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-indigo-600" />
                  <span className="text-xs text-indigo-800 font-bold">{selectedBulkIds.length} Entities Selected. Apply compliance run:</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleBulkApprove} className="bg-indigo-600 text-white px-3 py-1 text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition">Bulk Approve KYC</button>
                  <button onClick={handleBulkBlock} className="bg-slate-900 text-white px-3 py-1 text-[10px] font-bold rounded-lg hover:bg-slate-800 transition">Flag/Block IDs</button>
                  <button onClick={() => setSelectedBulkIds([])} className="text-xs text-slate-500 hover:underline">Cancel</button>
                </div>
              </div>
            )}

            {/* National Vendors Roster Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase">
                    <tr>
                      <th className="py-3 px-4">
                        <input 
                          type="checkbox" 
                          checked={selectedBulkIds.length === filteredVendorsList.length && filteredVendorsList.length > 0} 
                          onChange={() => toggleSelectAllBulk(filteredVendorsList.map(v => v.id))}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="py-3 px-4">Vendor Details & Legal Status</th>
                      <th className="py-3 px-4">Authorized signatory</th>
                      <th className="py-3 px-4 font-mono">PAN / GSTIN</th>
                      <th className="py-3 px-4">Outstanding Payout</th>
                      <th className="py-3 px-4 text-center">Process Hub</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVendorsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-400 italic">No Indian partners found matching indicators.</td>
                      </tr>
                    ) : (
                      filteredVendorsList.map((vendor) => {
                        const ext = extendedData[vendor.id] || {};
                        const isChosen = selectedBulkIds.includes(vendor.id);
                        return (
                          <tr key={vendor.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-4 px-4">
                              <input 
                                type="checkbox" 
                                checked={isChosen} 
                                onChange={() => toggleSelectBulk(vendor.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500" 
                              />
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-900 block text-sm">{vendor.companyName}</span>
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">{ext.businessType || 'Pvt Ltd'}</span>
                                  <span>•</span>
                                  <span>{vendor.city}, {vendor.state}</span>
                                  <span>•</span>
                                  <span className={vendor.status === 'Active' ? 'text-emerald-600 font-bold' : 'text-rose-500'}>{vendor.status}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block">{vendor.contactName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{vendor.email}</span>
                            </td>
                            <td className="py-4 px-4 font-mono text-[10px]">
                              <span className="block text-slate-700">PAN: {vendor.pan}</span>
                              <span className="block text-slate-400 uppercase text-[9px]">GSTIN: {vendor.gstin}</span>
                            </td>
                            <td className="py-4 px-4 font-bold font-mono text-slate-900">
                              ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(vendor.ledgerBalance)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex justify-center items-center gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedVendorId(vendor.id);
                                    setActiveTab('profile');
                                  }}
                                  className="p-1.5 bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition"
                                  title="View legal profile"
                                >
                                  <FileText size={13} />
                                </button>
                                <button 
                                  onClick={() => deleteVendor(vendor.id)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                                  title="Soft Delete Party"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 3: ADD VENDOR FORM (Multi-grid)
            ========================================== */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddVendorSubmit} className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-800">Verify & Onboard New Vendor Entry</h3>
              <p className="text-xs text-slate-400 font-mono uppercase">NATIONAL PROCUREMENT REGISTRY PORTAL</p>
            </div>

            {/* 1. Legal business identifiers */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest border-b border-slate-150 pb-1.5">Business & Constitutional Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Business Name *</label>
                  <input type="text" placeholder="e.g. Vardhman Textiles Ltd" required value={formData.companyName} onChange={e => {
                    setFormData({...formData, companyName: e.target.value});
                    if (formData.pan.length === 10 && !formData.gstin) {
                      const statePrefix = indianStates.find(s => s.name === formData.state)?.code || '27';
                      setFormData({...formData, companyName: e.target.value, gstin: `${statePrefix}${formData.pan}1Z3`});
                    }
                  }} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 outline-none focus:border-indigo-500 text-slate-800" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Primary Owner *</label>
                  <input type="text" placeholder="Name of Karta / Signatory" required value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">PAN (10 characters) *</label>
                  <input type="text" placeholder="e.g. ABCDE1234F" maxLength={10} required value={formData.pan} onChange={e => {
                    const upper = e.target.value.toUpperCase();
                    const statePrefix = indianStates.find(s => s.name === formData.state)?.code || '27';
                    setFormData({...formData, pan: upper, gstin: upper.length === 10 ? `${statePrefix}${upper}1Z3` : formData.gstin});
                  }} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 text-slate-800 font-mono outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">GSTIN (15 character validated) *</label>
                  <input type="text" placeholder="e.g. 27ABCDE1234F1Z3" maxLength={15} required value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 text-slate-800 font-mono outline-none focus:border-indigo-500" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">TDS TAN Number</label>
                  <input type="text" placeholder="TAN (e.g. MUMK01234A)" maxLength={10} value={formData.tan} onChange={e => setFormData({...formData, tan: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 font-mono outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">UDYAM MSME Registration</label>
                  <input type="text" placeholder="UDYAM-MH-19-02941" value={formData.udyamRegistration} onChange={e => setFormData({...formData, udyamRegistration: e.target.value, msmeNumber: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 font-mono outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Business Constitution</label>
                  <select value={formData.businessType} onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 outline-none text-slate-700">
                    {businessTypes.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">GST Scheme Type</label>
                  <select value={formData.gstRegType} onChange={e => setFormData({...formData, gstRegType: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 outline-none">
                    {gstRegistrationTypes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono block">Nature of Operations</label>
                  <select value={formData.natureOfBusiness} onChange={e => setFormData({...formData, natureOfBusiness: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 text-xs rounded border border-slate-200 outline-none">
                    {natureOfBusinesses.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Contacts & Address multi group split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b pb-1">Primary Contacts & Channels</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Business Email *</label>
                    <input type="email" required placeholder="contact@firm.co.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Primary Phone *</label>
                    <input type="text" required placeholder="+91 94120 00000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Alternate Phone</label>
                    <input type="text" placeholder="Office hotline" value={formData.alternatePhone} onChange={e => setFormData({...formData, alternatePhone: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Website URL</label>
                    <input type="text" placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b pb-1">Registered Address & State Code</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Registered Office Line</label>
                    <input type="text" placeholder="Gala No / Building Sector" value={formData.registeredAddress} onChange={e => setFormData({...formData, registeredAddress: e.target.value, billingAddress: e.target.value, warehouseAddress: e.target.value, pickupAddress: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">City / Hub</label>
                    <input type="text" placeholder="Mumbai Central" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">State Code Selection</label>
                    <select value={formData.state} onChange={e => {
                      const stateChoice = e.target.value;
                      const prefix = indianStates.find(s => s.name === stateChoice)?.code || '27';
                      setFormData({
                        ...formData,
                        state: stateChoice,
                        gstin: formData.pan.length === 10 ? `${prefix}${formData.pan}1Z3` : formData.gstin
                      });
                    }} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 outline-none">
                      {indianStates.map(st => <option key={st.name} value={st.name}>{st.name} ({st.code})</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">PIN Code</label>
                    <input type="text" maxLength={6} placeholder="400001" value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-mono">District</label>
                    <input type="text" placeholder="Thane / S Dev" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                  </div>
                </div>
              </div>
            </div>

            {/* Core Bank Details Section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b pb-1">Bank Payment Accounts details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Bank Name</label>
                  <input type="text" placeholder="HDFC Bank / ICICI" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Beneficiary Name</label>
                  <input type="text" placeholder="As shown on Cheque" value={formData.accountHolderName} onChange={e => setFormData({...formData, accountHolderName: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Account Number</label>
                  <input type="text" placeholder="e.g. 5020002931215" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">RTGS / IFSC Code</label>
                  <input type="text" placeholder="HDFC0000080" maxLength={11} value={formData.ifsc} onChange={e => setFormData({...formData, ifsc: e.target.value.toUpperCase()})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono uppercase" />
                </div>
              </div>
            </div>

            {/* Commercial settings matrix */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b pb-1">Commissions & Commercial SLA Parameters</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Marketplace commission (%)</label>
                  <input type="number" value={formData.commissionPercent} onChange={e => setFormData({...formData, commissionPercent: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Settlement Cycle</label>
                  <select value={formData.settlementCycle} onChange={e => setFormData({...formData, settlementCycle: e.target.value as any})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 outline-none">
                    {settlementCycles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Min procurement Order (₹)</label>
                  <input type="number" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-mono">Max procurement Order (₹)</label>
                  <input type="number" value={formData.maxOrderValue} onChange={e => setFormData({...formData, maxOrderValue: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 px-3 py-1.5 rounded border border-slate-150 font-mono" />
                </div>
              </div>

              {/* Active marketplaces multiselect items */}
              <div className="space-y-2 pt-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Synchronized Active E-Commerce Channels</span>
                <div className="flex flex-wrap gap-2">
                  {marketplacesList.map((m) => {
                    const isChecked = formData.marketplaces.includes(m);
                    return (
                      <button
                        type="button"
                        key={m}
                        onClick={() => {
                          const updated = isChecked ? formData.marketplaces.filter(i => i !== m) : [...formData.marketplaces, m];
                          setFormData({...formData, marketplaces: updated});
                        }}
                        className={`px-3 py-1 rounded-full text-xs transition border ${
                          isChecked 
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : ''}{m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs font-sans uppercase tracking-wider rounded-xl shadow-md transition-all duration-150 cursor-pointer">
              Authenticate KYC & Add Vendor to Ledger Master
            </button>
          </form>
        )}


        {/* ==========================================
            VIEW 4: VENDOR PROFILE (Overview / Details)
            ========================================== */}
        {activeTab === 'profile' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header profile details info banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-100/70 text-indigo-700 rounded-xl flex items-center justify-center font-black text-lg">
                  {currentSelectedVendor.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{currentSelectedVendor.companyName}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span className="font-bold text-slate-500">{currentSelectedVendor.state} Range</span>
                    <span>•</span>
                    <span>GSTIN: {currentSelectedVendor.gstin}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">Ledger OK</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-right">
                <span className="text-[9px] text-slate-400 uppercase font-mono block">Current Outstanding Balance</span>
                <span className="text-md font-bold font-mono text-slate-950 mt-0.5 block">
                  ₹{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(currentSelectedVendor.ledgerBalance)}
                </span>
              </div>
            </div>

            {/* Visual modular layout segments cards index panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-6">
                
                {/* Constitutional card block */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <Building size={14} className="text-indigo-600" />
                    <span>Business Constitutions & Taxation Indexes</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Legal Registered Name</span>
                      <span className="font-bold text-slate-800">{(extendedData[currentSelectedVendor.id] || {}).legalName || currentSelectedVendor.companyName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Signatory / Authority</span>
                      <span className="font-bold text-slate-800">{currentSelectedVendor.contactName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Constitution</span>
                      <span className="font-bold text-slate-800">{(extendedData[currentSelectedVendor.id] || {}).businessType || 'Private Limited'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Primary PAN Card</span>
                      <span className="font-bold text-slate-800 font-mono">{currentSelectedVendor.pan}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">GSTIN Number</span>
                      <span className="font-bold text-slate-800 font-mono">{currentSelectedVendor.gstin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Udyam registration</span>
                      <span className="font-bold text-slate-800 font-mono">{(extendedData[currentSelectedVendor.id] || {}).udyamRegistration || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Nature of Business</span>
                      <span className="font-bold text-slate-800">{(extendedData[currentSelectedVendor.id] || {}).natureOfBusiness || 'Manufacturer'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Active E-com Channels</span>
                      <span className="font-medium text-indigo-700">{(extendedData[currentSelectedVendor.id] || {}).activeMarketplaces?.join(', ') || 'Own Website, Amazon'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-mono text-[10px] block">Commission Scale</span>
                      <span className="font-bold text-slate-800 font-mono">{(extendedData[currentSelectedVendor.id] || {}).commissionPercent || 10}%</span>
                    </div>
                  </div>
                </div>

                {/* Sub-contacts block */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-600" />
                    <span>Locations & Registered Addresses</span>
                  </h4>

                  <div className="space-y-3.5 text-xs text-slate-600">
                    <div className="border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">Registered Office</span>
                      <p className="mt-0.5 font-sans leading-relaxed font-bold text-slate-800">{currentSelectedVendor.address}, {currentSelectedVendor.city}, {currentSelectedVendor.state} - {currentSelectedVendor.pinCode}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Warehouse Hub Address</span>
                        <p className="mt-0.5 leading-relaxed font-medium">{(extendedData[currentSelectedVendor.id] || {}).warehouseAddress || 'Bommasandra Industrial Area plot 4, Bangalore'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase block">Billing Node Address</span>
                        <p className="mt-0.5 leading-relaxed font-medium">{(extendedData[currentSelectedVendor.id] || {}).billingAddress || '42, SP Road, Bangalore, Karnataka'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secure Bank Account details */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-indigo-600" />
                    <span>Registered Payout Bank Account Details</span>
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Receiving Bank</span>
                      <span className="font-bold text-slate-800">HDFC Bank Ltd</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Account Number</span>
                      <span className="font-bold text-slate-800">{currentSelectedVendor.bankAccount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">IFSC Code</span>
                      <span className="font-bold text-indigo-600">{currentSelectedVendor.ifsc}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Settlement Option</span>
                      <span className="font-bold text-slate-800 uppercase">{(extendedData[currentSelectedVendor.id] || {}).settlementCycle || 'Weekly'}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Secure audit logging & Notes sidebar */}
              <div className="space-y-6">
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b pb-1.5 block">KYC Compliance Documents Checked</h4>
                  <div className="space-y-3">
                    {documents.filter(d => d.vendorId === currentSelectedVendor.id).map(d => (
                      <div key={d.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 block">{d.type}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">{d.fileName}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          d.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-amber-50 text-amber-800'
                        }`}>{d.verificationStatus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Internal notes widget */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-3xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Internal Operations Notes</h4>
                  <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                    {notes.filter(n => n.vendorId === currentSelectedVendor.id).map(n => (
                      <div key={n.id} className="p-2.5 bg-indigo-50/20 border border-indigo-100/50 rounded text-[11px] leading-relaxed">
                        <p className="text-slate-700">{n.text}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block text-right font-mono italic">By {n.author}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1">
                    <textarea 
                      placeholder="Add secure compliance note..." 
                      value={newNote} 
                      onChange={e => setNewNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-2 px-2.5 py-1.5 rounded outline-none h-16 resize-none" 
                    />
                    <button onClick={handleAddNote} className="w-full py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 text-[10px] font-bold rounded-lg transition">Save compliance note</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 5: VENDOR PRODUCTS
            ========================================== */}
        {activeTab === 'products' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
              <div>
                <h3 className="text-xs font-bold text-slate-850 uppercase tracking-widest">Active Product catalogs</h3>
                <p className="text-xs text-slate-400">Products supplied by {currentSelectedVendor.companyName}</p>
              </div>
              <button onClick={() => triggerToast('Standard Product additions handled by the Products Module')} className="bg-indigo-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1">
                <PlusCircle size={13} />
                <span>Add Product SKU</span>
              </button>
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs text-xs">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Material SKU Tag</th>
                    <th className="py-3 px-4">Item Catalog description</th>
                    <th className="py-3 px-4">HSN (GST rule)</th>
                    <th className="py-3 px-4">Wholesale price</th>
                    <th className="py-3 px-4">Current Warehouse Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { sku: 'EL-HDMI-10M', name: 'Industrial Grade Double Shielded HDMI Cable (10 Meters)', hsn: '85444299', price: 420.00, stock: 195, vendorId: 'vendor-1' },
                    { sku: 'PK-BOX-12X12', name: 'Eco-Friendly Heavy Duty Double Wall Kraft Box 12x12x12 Inches', hsn: '48191000', price: 28.00, stock: 940, vendorId: 'vendor-3' },
                    { sku: 'YRN-CBL-40', name: 'Combed Combe Loom Cotton Yarn (40s Class Reel)', hsn: '52051110', price: 185.00, stock: 1200, vendorId: 'vendor-2' }
                  ].filter(p => p.vendorId === currentSelectedVendor.id).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3.5 px-4 font-mono">{p.hsn} (18% GST)</td>
                      <td className="py-3.5 px-4 font-mono">₹{p.price.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.stock} Units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 6: VENDOR ORDERS
            ========================================== */}
        {activeTab === 'orders' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Linked Procurement Purchase Orders</h3>
            
            <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs text-xs">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Order Serial No</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4 font-mono">Total Net Goods (₹)</th>
                    <th className="py-3 px-4">GST Value (₹)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'PO-2026-402', vendorId: 'vendor-1', date: '2026-06-12', base: 156700, tax: 28206, status: 'Completed' },
                    { id: 'PO-2026-444', vendorId: 'vendor-1', date: '2026-06-18', base: 118670, tax: 21360, status: 'In Transit' },
                    { id: 'PO-2026-101', vendorId: 'vendor-2', date: '2026-06-02', base: 870000, tax: 43500, status: 'Completed' },
                    { id: 'PO-2026-291', vendorId: 'vendor-3', date: '2026-06-14', base: 75200, tax: 9024, status: 'Completed' }
                  ].filter(o => o.vendorId === currentSelectedVendor.id).map((o, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="py-3.5 px-4">{new Date(o.date).toLocaleDateString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-mono">₹{new Intl.NumberFormat('en-IN').format(o.base)}</td>
                      <td className="py-3.5 px-4 font-mono">₹{new Intl.NumberFormat('en-IN').format(o.tax)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          o.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 7: VENDOR INVENTORY
            ========================================== */}
        {activeTab === 'inventory' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mt-1 block">Inward Logistics Warehouse Logs</h3>
            
            <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs text-xs">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Material SKU</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 font-mono">Quantity</th>
                    <th className="py-3 px-4">Storage location bin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { time: '2026-06-18 10:45', sku: 'EL-HDMI-10M', type: 'Inward PO Cargo', qty: 100, bin: 'Shelf R3-B2', vendorId: 'vendor-1' },
                    { time: '2026-06-12 14:00', sku: 'EL-HDMI-10M', type: 'Quality Clearance', qty: 95, bin: 'Shelf R3-B2', vendorId: 'vendor-1' },
                    { time: '2026-06-14 11:20', sku: 'PK-BOX-12X12', type: 'Procurement Cargo', qty: 500, bin: 'Bin A9-C', vendorId: 'vendor-3' }
                  ].filter(i => i.vendorId === currentSelectedVendor.id).map((i, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono text-slate-400">{i.time}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">{i.sku}</td>
                      <td className="py-3.5 px-4">{i.type}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">+{i.qty} Units</td>
                      <td className="py-3.5 px-4 font-mono">{i.bin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 8: VENDOR SETTLEMENTS (With PDF view)
            ========================================== */}
        {activeTab === 'settlements' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Financial Matrix Summary</h3>
                <p className="text-xs text-slate-400 mt-1">Outstanding statements calculated as per statutory 18% GST regulations</p>
              </div>
              <button onClick={() => triggerToast('Payout transaction queue authorized in Finance & Taxes')} className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-xs font-bold font-sans">
                Post Outgoing Ledger credit
              </button>
            </div>

            {/* Settlements detail breakdown list */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-3xs text-xs">
              <table className="w-full text-left divide-y divide-slate-100">
                <thead className="bg-slate-50 font-mono text-[10px] text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4 font-mono">Gross base (₹)</th>
                    <th className="py-3 px-4">Commission % deducted</th>
                    <th className="py-3 px-4">TDS (Section 194Q)</th>
                    <th className="py-3 px-4 font-bold font-mono">Net Payout (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Invoice PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlements.filter(s => s.vendorId === currentSelectedVendor.id).map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-bold text-slate-900">{s.period}</td>
                      <td className="py-4 px-4 font-mono">₹{new Intl.NumberFormat('en-IN').format(s.grossAmount)}</td>
                      <td className="py-4 px-4 font-mono">₹{new Intl.NumberFormat('en-IN').format(s.commission)}</td>
                      <td className="py-4 px-4 font-mono text-rose-500">-₹{new Intl.NumberFormat('en-IN').format(s.tds)}</td>
                      <td className="py-4 px-4 font-mono font-black text-emerald-600">₹{new Intl.NumberFormat('en-IN').format(s.netPayable)}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          s.status === 'Processed' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>{s.status}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setShowInvoiceId(s.id)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-950 hover:text-white rounded text-[10px] font-mono border"
                        >
                          Show invoice PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Static high-fidelity Invoice print simulator */}
            {showInvoiceId && (
              <div className="fixed inset-0 z-50 bg-[#000000]/50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-2xl w-full max-w-xl shadow-2xl relative font-sans border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="flex justify-between border-b pb-4 mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-600 uppercase">INVOICE & CHALLAN RECEIPT</h4>
                      <h5 className="text-sm font-black text-slate-900 mt-1">{showInvoiceId}</h5>
                    </div>
                    <button onClick={() => setShowInvoiceId(null)} className="text-xs bg-slate-100 px-2 py-1 rounded">Close</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Paid To:</span>
                      <p className="font-bold text-slate-800">{currentSelectedVendor.companyName}</p>
                      <p>{currentSelectedVendor.address}</p>
                      <p className="font-mono mt-1 text-slate-500">GSTIN: {currentSelectedVendor.gstin}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Paid By:</span>
                      <p className="font-bold">TTGT Solutions Pvt Ltd</p>
                      <p>Kanjurmarg East, Mumbai</p>
                      <p className="font-mono mt-1 text-slate-500">GSTIN: 27AAPTT3241R1ZM</p>
                    </div>
                  </div>

                  <div className="border-t border-b py-3.5 my-4 text-xs font-mono">
                    <div className="flex justify-between mb-1.5">
                      <span>Gross Procurement amount:</span>
                      <span className="font-bold">₹1,85,000.00</span>
                    </div>
                    <div className="flex justify-between mb-1.5 text-rose-500">
                      <span>E-com platform commission % deducted:</span>
                      <span>-₹22,200.00</span>
                    </div>
                    <div className="flex justify-between mb-1.5 text-rose-500">
                      <span>Statutory TDS Withholding Sec 194Q (0.1%):</span>
                      <span>-₹1,850.00</span>
                    </div>
                    <hr className="my-1 border-dashed" />
                    <div className="flex justify-between text-base font-black text-slate-900">
                      <span>Net RTGS Transferred amount:</span>
                      <span>₹1,56,954.00</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono italic text-center">Form 16A TDS certificates synchronized with Traces NSDL portal.</p>
                </div>
              </div>
            )}
          </div>
        )}


        {/* ==========================================
            VIEW 9: VENDOR DOCUMENTS MANAGER
            ========================================== */}
        {activeTab === 'documents' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Statutory KYC Document checklist</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.filter(d => d.vendorId === currentSelectedVendor.id).map((d) => (
                <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">KYC Document Type</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{d.type}</h4>
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      d.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800 border' : 'bg-amber-50 text-amber-800'
                    }`}>{d.verificationStatus}</span>
                  </div>

                  <div className="my-3 text-xs flex justify-between items-center text-slate-500 font-mono">
                    <span>File: {d.fileName}</span>
                    <span>Expiry: {d.expiryDate}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => triggerToast(`Downloaded statutory document ${d.fileName} successfully`)} className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-250 transition text-[10px] font-bold rounded-lg uppercase tracking-wider font-mono">Download file</button>
                    <button onClick={() => {
                      const updated = documents.map(x => x.id === d.id ? { ...x, verificationStatus: 'Verified' as const } : x);
                      saveDocs(updated);
                      triggerToast(`Authorized verification for ${d.type}`);
                    }} className="flex-1 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition text-[10px] rounded-lg tracking-wider uppercase font-mono">Approve KYC</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 10: VENDOR PERFORMANCE
            ========================================== */}
        {activeTab === 'performance' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Strategic Performance SLA Logs</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans text-slate-800">
              {[
                { label: 'Dispatch SLA Time', value: '2.1 Days', desc: 'Average TAT dispatch' },
                { label: 'RTO / Return Rate', value: '1.2%', desc: 'Return to origin percentage' },
                { label: 'Merchant Ratings', value: '4.8 / 5.0', desc: 'Sellers rating scores' },
                { label: 'Form GSTR-1 Match', value: '100% Core', desc: 'GST filing matches' }
              ].map((m, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">{m.label}</span>
                  <span className="text-lg font-black text-slate-900 mt-1 block font-mono">{m.value}</span>
                  <span className="text-[9px] text-slate-500 font-sans block mt-1">{m.desc}</span>
                </div>
              ))}
            </div>

            {/* Performance line charts */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase block mb-4">SLA Compliance tracking history (Q1)</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Apr', rating: 4.6, rto: 1.5 },
                    { month: 'May', rating: 4.7, rto: 1.3 },
                    { month: 'Jun', rating: 4.8, rto: 1.2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 11: VENDOR SUPPORT TICKETS
            ========================================== */}
        {activeTab === 'support' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Generating new ticket slide */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Raise new compliance dispute</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Summarize the legal/payment dispute..." 
                  value={newTicketTitle} 
                  onChange={e => setNewTicketTitle(e.target.value)}
                  className="bg-slate-50 text-xs px-3 py-1.5 rounded-lg border outline-none text-slate-800 focus:border-indigo-550 focus:ring-1.5 focus:ring-indigo-150 md:col-span-2" 
                />
                
                <select 
                  value={newTicketPriority} 
                  onChange={e => setNewTicketPriority(e.target.value as any)}
                  className="bg-slate-50 text-xs px-3 py-1.5 rounded-lg border outline-none text-slate-600"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">Govt / Statutory Dispute</option>
                </select>
              </div>

              <button onClick={handleCreateSupportTicket} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">
                Post dispute to GSTIN support desks
              </button>
            </div>

            {/* List tickets */}
            <div className="space-y-3">
              {tickets.filter(t => t.vendorId === currentSelectedVendor.id).map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-700">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        t.priority === 'High' ? 'bg-rose-50 text-rose-800 border border-rose-100' : 'bg-slate-100 text-slate-700'
                      }`}>{t.priority}</span>
                    </div>
                    <p className="font-bold text-slate-800 mt-1">{t.title}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Created on: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <span className="text-xs font-mono font-bold uppercase text-indigo-600">{t.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 12: VENDOR ACTIVITY LOGS
            ========================================== */}
        {activeTab === 'logs' && currentSelectedVendor && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest block">Audit trail logs</h3>
            
            <div className="space-y-3">
              {vendorLogs.filter(l => l.vendorId === currentSelectedVendor.id).map((l) => (
                <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-3xs flex justify-between items-center text-xs text-slate-755 leading-relaxed font-sans">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">{new Date(l.timestamp).toLocaleString()}</span>
                    <strong className="text-slate-8s0">{l.action}</strong>: {l.details}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">By {l.performedBy}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* ==========================================
            VIEW 13: SUPABASE DATABASE SCHEMAS (Documentation)
            ========================================== */}
        {activeTab === 'db_schema' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-h-[70vh] overflow-y-auto pr-1">
            <div className="bg-[#0f172a] text-slate-200 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="h-5 w-5 bg-indigo-500 rounded flex items-center justify-center font-bold text-white text-xs">S</div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Supabase Postgres Table Schemas</h3>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Below are the production-ready PostgreSQL definitions mapped directly to our live storage simulator structure. Use these direct queries to bootstrap your schema files in Supabase Database Console:
              </p>

              <pre className="p-3.5 bg-[#020617] border border-slate-850 rounded-xl font-mono text-[10px] overflow-x-auto text-indigo-300 leading-normal">
{`-- 1. Vendors Master Ledger Model
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    owner_name VARCHAR(100),
    business_type VARCHAR(50),
    gst_registration_type VARCHAR(50),
    pan VARCHAR(10) NOT NULL UNIQUE,
    gstin VARCHAR(15) UNIQUE,
    tan VARCHAR(10),
    msme_number VARCHAR(100),
    cin VARCHAR(21),
    llpin VARCHAR(8),
    udyam_registration VARCHAR(50),
    iec_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Pending',
    ledger_balance NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Relational Addresses Node
CREATE TABLE vendor_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    address_type VARCHAR(20) CHECK (address_type IN ('Registered', 'Warehouse', 'Pickup', 'Billing')),
    address_line TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    pin_code VARCHAR(6),
    country VARCHAR(50) DEFAULT 'India',
    google_map_location VARCHAR(255)
);

-- 3. Payments Bank Account Indexes
CREATE TABLE vendor_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    bank_name VARCHAR(200) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    branch_name VARCHAR(200),
    upi_id VARCHAR(100)
);

-- 4. Regulatory KYC Documents
CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    expiry_date DATE,
    verification_status VARCHAR(20) DEFAULT 'Pending'
);`}
              </pre>

              <button onClick={() => triggerToast('Supabase schemas copied to clipboard simulator')} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">
                Copy statutory database script
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
