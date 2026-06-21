/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- TTGT Solutions ERP - Complete Production Ready PostgreSQL Schema
-- Targets: Supabase Auth, PostgreSQL, Row Level Security (RLS)
-- Optimized for Indian Taxation, Auditing, Warehouse Control, and Vendors
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enum Types
CREATE TYPE company_type_enum AS ENUM ('Private Limited', 'Public Limited', 'Partnership', 'Proprietorship');
CREATE TYPE msme_category_enum AS ENUM ('Micro', 'Small', 'Medium', 'None');
CREATE TYPE order_status_enum AS ENUM ('Pending', 'Picked', 'Packed', 'Dispatched', 'Delivered', 'Cancelled');
CREATE TYPE courier_partner_enum AS ENUM ('Delhivery', 'Blue Dart', 'DTDC', 'Amazon Shippable', 'None');
CREATE TYPE inventory_log_type AS ENUM ('Inward', 'Outward', 'Audit Adjustment', 'Damaged');
CREATE TYPE transaction_type_enum AS ENUM ('Payment Out', 'Collection In', 'GST Liability', 'ITC Claimed', 'TDS Liability');
CREATE TYPE tds_section_enum AS ENUM ('194C', '194J', '194Q', 'None');

-- 1. Create SYSTEM AUDIT LOGS table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for speedy audit searching
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_email ON audit_logs(user_email);

-- 2. Create COMPANY SETTINGS table (Strict Single Row)
CREATE TABLE company_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    company_name TEXT NOT NULL,
    company_type company_type_enum NOT NULL DEFAULT 'Private Limited',
    gstin TEXT NOT NULL CHECK (length(gstin) = 15),
    pan TEXT NOT NULL CHECK (length(pan) = 10),
    cin TEXT NOT NULL,
    tan TEXT NOT NULL DEFAULT '',
    msme_type msme_category_enum NOT NULL DEFAULT 'None',
    udyam_registration TEXT DEFAULT '',
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_lines TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    pin_code TEXT NOT NULL CHECK (length(pin_code) = 6),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    ifsc_code TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    digital_signature_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID
);

-- 3. Create VENDORS table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    pan TEXT NOT NULL CHECK (length(pan) = 10),
    gstin TEXT UNIQUE NOT NULL CHECK (length(gstin) = 15),
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    pin_code TEXT NOT NULL CHECK (length(pin_code) = 6),
    msme_category msme_category_enum NOT NULL DEFAULT 'None',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    ledger_balance NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    tds_applicable BOOLEAN DEFAULT FALSE NOT NULL,
    tds_section tds_section_enum DEFAULT 'None' NOT NULL,
    tds_rate NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    bank_account TEXT NOT NULL,
    ifsc TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

CREATE INDEX idx_vendors_gstin ON vendors(gstin) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendors_company ON vendors(company_name) WHERE deleted_at IS NULL;

-- 4. Create PRODUCTS table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    hsn_code TEXT NOT NULL CHECK (length(hsn_code) IN (6, 8)),
    gst_rate NUMERIC(5,2) NOT NULL CHECK (gst_rate IN (0.00, 5.00, 12.00, 18.00, 28.00)),
    cess_rate NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    purchase_price NUMERIC(15,2) NOT NULL,
    selling_price NUMERIC(15,2) NOT NULL,
    min_stock_level INTEGER DEFAULT 10 NOT NULL,
    current_stock INTEGER DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Inactive')),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_hsn ON products(hsn_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_vendor ON products(vendor_id) WHERE deleted_at IS NULL;

-- 5. Create INVENTORY LOGS table
CREATE TABLE inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type inventory_log_type NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity != 0),
    batch_number TEXT NOT NULL,
    expiry_date DATE,
    reference_id TEXT, -- Inv, Order No, AWB
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    created_by_name TEXT NOT NULL
);

CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_batch ON inventory_logs(batch_number);

-- 6. Create WAREHOUSE LOCATIONS table
CREATE TABLE warehouse_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aisle TEXT NOT NULL,
    rack TEXT NOT NULL,
    shelf TEXT NOT NULL,
    bin TEXT NOT NULL,
    current_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    max_capacity INTEGER NOT NULL DEFAULT 500,
    is_occupied BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(aisle, rack, shelf, bin)
);

CREATE INDEX idx_warehouse_locations_product ON warehouse_locations(current_product_id) WHERE is_occupied = TRUE;

-- 7. Create ORDERS table (Sales Orders)
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- Formatted: SO-YYYYMMDD-XXXX
    customer_name TEXT NOT NULL,
    customer_gstin TEXT CHECK (customer_gstin IS NULL OR length(customer_gstin) = 15),
    customer_state TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    shipping_pin_code TEXT NOT NULL CHECK (length(shipping_pin_code) = 6),
    marketplace TEXT NOT NULL DEFAULT 'Direct Channel',
    marketplace_order_id TEXT NOT NULL,
    total_before_tax NUMERIC(15,2) NOT NULL,
    total_cgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_sgst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_igst NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_tax NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_rounding NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15,2) NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'Pending',
    assigned_picker TEXT,
    assigned_packer TEXT,
    courier_partner courier_partner_enum DEFAULT 'None' NOT NULL,
    awb_number TEXT,
    eway_bill_number TEXT,
    invoice_number TEXT UNIQUE,
    invoice_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    updated_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_invoice ON orders(invoice_number) WHERE invoice_number IS NOT NULL;

-- 8. Create ORDER ITEMS table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(15,2) NOT NULL,
    hsn_code TEXT NOT NULL,
    gst_rate NUMERIC(5,2) NOT NULL,
    cgst_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_tax NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 9. Create FINANCE TRANSACTIONS table
CREATE TABLE finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    reference_no TEXT NOT NULL,
    type transaction_type_enum NOT NULL,
    party_name TEXT NOT NULL,
    gstin TEXT CHECK (gstin IS NULL OR length(gstin) = 15),
    amount NUMERIC(15,2) NOT NULL,
    tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    tds_amount NUMERIC(15,2) DEFAULT 0.00,
    tds_section TEXT DEFAULT 'None',
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Approved', 'Paid', 'Filed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_finance_transactions_date ON finance_transactions(date DESC);

-- 10. Create EMPLOYEES table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- Matched to ERP Roles
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    department TEXT NOT NULL,
    uan TEXT, -- Universal Account Number (PF India)
    pan TEXT CHECK (length(pan) = 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);


-- =========================================================================
-- TRIGGERS FOR AUTO UPDATING TIMESTAMPS
-- =========================================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_company_settings_modtime BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_vendors_modtime BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_finance_transactions_modtime BEFORE UPDATE ON finance_transactions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_employees_modtime BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create Security Access Helper Functions based on JWT claims (Supabase auth.jwt())
-- e.g. custom user metadata role claim check: auth.jwt() -> 'user_metadata' -> 'role'

-- Policy 1: Audit Log Security - Reads available to Super Admin, Admin, and Finance. Inserts open to any auth session.
CREATE POLICY audit_read ON audit_logs 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Finance')));

CREATE POLICY audit_insert ON audit_logs 
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 2: Company Settings - Reads available to all Auth. Writes strictly Super Admin, Admin.
CREATE POLICY company_read ON company_settings 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY company_write ON company_settings 
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin')));

-- Policy 3: Vendors policies
CREATE POLICY vendor_read ON vendors 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND (
        auth.jwt() -> 'user_metadata' ->> 'role' NOT IN ('Vendor') OR 
        email = auth.email() -- Vendor role can only see their own row
    ));

CREATE POLICY vendor_write ON vendors 
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Finance')));

-- Policy 4: Products policies
CREATE POLICY product_read ON products 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY product_write ON products 
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Inventory Manager', 'Warehouse Manager')));

-- Policy 5: Orders policies
CREATE POLICY orders_read ON orders 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND (
        auth.jwt() -> 'user_metadata' ->> 'role' NOT IN ('Vendor') 
        -- Vendors do not see general sales pipeline unless they are supplying components
    ));

CREATE POLICY orders_write ON orders 
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Manager', 'Warehouse Manager', 'Packing Staff', 'Finance')));

-- Policy 6: Finance Transactions policies
CREATE POLICY finance_read ON finance_transactions 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Finance')));

CREATE POLICY finance_write ON finance_transactions 
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND (auth.jwt() -> 'user_metadata' ->> 'role' IN ('Super Admin', 'Admin', 'Finance')));

-- =========================================================================
-- SEED INITIAL DATA IN METRIC COUNTER POINTERS
-- =========================================================================
-- INSERT INTO company_settings (id, company_name, gstin, pan, cin, tan, msme_type, email, phone, address_lines, state, city, pin_code, bank_name, account_number, ifsc_code, upi_id)
-- VALUES (1, 'TTGT Solutions Private Limited', '27AAPTT3241R1ZM', 'AAPTT3241R', 'U72900MH2026PTC394123', 'MUMT04932B', 'Medium', 'accounts@ttgtsolutions.com', '+91 22 4930 2000', 'B-Wing, 804, Lodha Supremus, Kanjurmarg East', 'Maharashtra', 'Mumbai', '400042', 'HDFC Bank Ltd', '50200049281234', 'HDFC0000080', 'ttgt@okhdfcbank');
`;
