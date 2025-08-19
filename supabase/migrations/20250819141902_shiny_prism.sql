/*
  # Solomon Bharat B2B Marketplace Complete Schema

  1. New Tables
    - `profiles` - Extended user profile information
    - `buyers` - Buyer-specific information  
    - `suppliers` - Supplier-specific information
    - `categories` - Product categories
    - `rfqs` - Request for Quotations
    - `rfq_suppliers` - Many-to-many relationship between RFQs and suppliers
    - `supplier_quotations` - Quotations submitted by suppliers
    - `sample_requests` - Sample requests from buyers
    - `rfq_questions` - Q&A system for RFQs
    - `orders` - Confirmed orders

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Admin function for role checking

  3. Features
    - Email verification through Supabase Auth
    - Role-based access control (buyer, supplier, admin)
    - Comprehensive audit trail
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rfq_status AS ENUM ('pending_approval', 'approved', 'matched', 'quoted', 'closed', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quotation_status AS ENUM ('pending_review', 'approved_for_buyer', 'rejected', 'sent_to_buyer', 'accepted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sample_status AS ENUM ('requested', 'approved_by_admin', 'shipped_by_supplier', 'delivered', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('confirmed', 'in_production', 'shipped', 'delivered', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE qa_status AS ENUM ('pending_admin', 'approved_by_admin', 'sent_to_buyer', 'answered_by_buyer', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  country TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type TEXT,
  annual_volume TEXT,
  preferred_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can manage own data" ON buyers;
CREATE POLICY "Buyers can manage own data"
  ON buyers
  FOR ALL
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product_categories TEXT[] DEFAULT '{}',
  certifications TEXT[],
  years_in_business INTEGER,
  annual_turnover TEXT,
  employee_count TEXT,
  gst_number TEXT,
  iec_code TEXT,
  production_capacity TEXT,
  minimum_order_quantity TEXT,
  quality_standards TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers can manage own data" ON suppliers;
CREATE POLICY "Suppliers can manage own data"
  ON suppliers
  FOR ALL
  TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active categories" ON categories;
CREATE POLICY "Anyone can read active categories"
  ON categories
  FOR SELECT
  TO public
  USING (active = TRUE OR is_admin());

-- RFQs table
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL,
  target_price DECIMAL NOT NULL CHECK (target_price > 0),
  max_price DECIMAL CHECK (max_price > 0),
  delivery_timeline TEXT,
  shipping_terms TEXT,
  quality_standards TEXT,
  certifications_needed TEXT,
  additional_requirements TEXT,
  product_images TEXT[] DEFAULT '{}',
  status rfq_status DEFAULT 'pending_approval',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can manage own RFQs" ON rfqs;
CREATE POLICY "Buyers can manage own RFQs"
  ON rfqs
  FOR ALL
  TO authenticated
  USING (buyer_id = auth.uid() OR is_admin())
  WITH CHECK (buyer_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Suppliers can read approved RFQs" ON rfqs;
CREATE POLICY "Suppliers can read approved RFQs"
  ON rfqs
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = auth.uid() OR 
    is_admin() OR 
    status IN ('approved', 'matched', 'quoted')
  );

-- Supplier Quotations table
CREATE TABLE IF NOT EXISTS supplier_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quoted_price DECIMAL NOT NULL CHECK (quoted_price > 0),
  moq INTEGER NOT NULL CHECK (moq > 0),
  lead_time TEXT NOT NULL,
  payment_terms TEXT,
  shipping_terms TEXT,
  validity_days INTEGER CHECK (validity_days > 0),
  quality_guarantee BOOLEAN DEFAULT FALSE,
  sample_available BOOLEAN DEFAULT FALSE,
  notes TEXT,
  status quotation_status DEFAULT 'pending_review',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE supplier_quotations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers can manage own quotations" ON supplier_quotations;
CREATE POLICY "Suppliers can manage own quotations"
  ON supplier_quotations
  FOR ALL
  TO authenticated
  USING (supplier_id = auth.uid() OR is_admin())
  WITH CHECK (supplier_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Buyers can read approved quotations for own RFQs" ON supplier_quotations;
CREATE POLICY "Buyers can read approved quotations for own RFQs"
  ON supplier_quotations
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() OR 
    is_admin() OR 
    (status = 'approved_for_buyer' AND EXISTS (
      SELECT 1 FROM rfqs WHERE id = supplier_quotations.rfq_id AND buyer_id = auth.uid()
    ))
  );

-- RFQ Questions table
CREATE TABLE IF NOT EXISTS rfq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  status qa_status DEFAULT 'pending_admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_approved_at TIMESTAMPTZ,
  buyer_answer TEXT,
  buyer_answered_at TIMESTAMPTZ,
  answered_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ
);

ALTER TABLE rfq_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read relevant questions" ON rfq_questions;
CREATE POLICY "Users can read relevant questions"
  ON rfq_questions
  FOR SELECT
  TO authenticated
  USING (
    supplier_id = auth.uid() OR 
    is_admin() OR 
    EXISTS (SELECT 1 FROM rfqs WHERE id = rfq_questions.rfq_id AND buyer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Suppliers can ask questions" ON rfq_questions;
CREATE POLICY "Suppliers can ask questions"
  ON rfq_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (supplier_id = auth.uid());

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
  quotation_id UUID NOT NULL REFERENCES supplier_quotations(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL NOT NULL CHECK (unit_price > 0),
  total_value DECIMAL GENERATED ALWAYS AS (quantity::DECIMAL * unit_price) STORED,
  payment_terms TEXT,
  delivery_terms TEXT,
  status order_status DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expected_delivery TIMESTAMPTZ,
  tracking_info TEXT
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own orders" ON orders;
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR supplier_id = auth.uid() OR is_admin());

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Textiles & Apparel', 'Clothing, fabrics, and textile products'),
  ('Spices & Food Products', 'Spices, food items, and agricultural products'),
  ('Handicrafts & Home Decor', 'Handmade crafts and decorative items'),
  ('Electronics & Components', 'Electronic devices and components'),
  ('Pharmaceuticals & Healthcare', 'Medical and pharmaceutical products'),
  ('Chemicals & Materials', 'Chemical products and raw materials'),
  ('Automotive Parts', 'Vehicle parts and accessories'),
  ('Jewelry & Gems', 'Jewelry and precious stones'),
  ('Leather Goods', 'Leather products and accessories'),
  ('Agricultural Products', 'Farm products and agricultural goods'),
  ('Industrial Equipment', 'Machinery and industrial equipment'),
  ('Other', 'Other product categories')
ON CONFLICT (name) DO NOTHING;

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS VOID AS $$
BEGIN
  -- This function can be called to create an admin user
  -- In production, you would create this through a secure process
  INSERT INTO profiles (id, user_type, full_name, company_name, country)
  SELECT 
    id,
    'admin'::user_type,
    'Admin User',
    'Solomon Bharat',
    'India'
  FROM auth.users 
  WHERE email = 'admin@solomonbharat.com'
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_type_idx ON profiles(user_type);
CREATE INDEX IF NOT EXISTS suppliers_verification_status_idx ON suppliers(verification_status);
CREATE INDEX IF NOT EXISTS suppliers_product_categories_idx ON suppliers USING GIN(product_categories);
CREATE INDEX IF NOT EXISTS rfqs_status_idx ON rfqs(status);
CREATE INDEX IF NOT EXISTS rfqs_category_idx ON rfqs(category);
CREATE INDEX IF NOT EXISTS rfqs_buyer_id_idx ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS rfqs_created_at_idx ON rfqs(created_at);
CREATE INDEX IF NOT EXISTS supplier_quotations_rfq_id_idx ON supplier_quotations(rfq_id);
CREATE INDEX IF NOT EXISTS supplier_quotations_supplier_id_idx ON supplier_quotations(supplier_id);
CREATE INDEX IF NOT EXISTS supplier_quotations_status_idx ON supplier_quotations(status);
CREATE INDEX IF NOT EXISTS rfq_questions_rfq_id_idx ON rfq_questions(rfq_id);
CREATE INDEX IF NOT EXISTS rfq_questions_supplier_id_idx ON rfq_questions(supplier_id);
CREATE INDEX IF NOT EXISTS rfq_questions_status_idx ON rfq_questions(status);
CREATE INDEX IF NOT EXISTS orders_buyer_id_idx ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS orders_supplier_id_idx ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);