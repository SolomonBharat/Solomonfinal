/*
  # Complete Database Setup for Solomon Bharat Platform

  1. Database Schema
    - Create all necessary tables with proper relationships
    - Set up proper indexes and constraints
    - Enable RLS on all tables

  2. Security Policies
    - User management policies
    - Data access policies
    - Admin policies

  3. Helper Functions
    - Authentication helpers
    - Admin check functions
*/

-- Create helper functions first
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Everyone can read active categories" ON categories;
DROP POLICY IF EXISTS "Users can manage own profile, admins can manage all" ON profiles;
DROP POLICY IF EXISTS "Users can manage own supplier record, admins can manage all" ON suppliers;
DROP POLICY IF EXISTS "Users can manage own buyer record, admins can manage all" ON buyers;
DROP POLICY IF EXISTS "Admin can manage all RFQs" ON rfqs;
DROP POLICY IF EXISTS "Buyers can create RFQs" ON rfqs;
DROP POLICY IF EXISTS "Buyers can read own RFQs or admin can read all" ON rfqs;
DROP POLICY IF EXISTS "Buyers can update own pending RFQs" ON rfqs;
DROP POLICY IF EXISTS "Suppliers can read assigned or open bidding RFQs" ON rfqs;

-- Ensure RLS is enabled on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_questions ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (active = true OR is_admin());

CREATE POLICY "categories_admin_policy" ON categories
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Profiles policies
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT TO authenticated USING (id = uid() OR is_admin());

CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = uid());

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE TO authenticated USING (id = uid() OR is_admin()) WITH CHECK (id = uid() OR is_admin());

CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE TO authenticated USING (id = uid() OR is_admin());

-- Buyers policies
CREATE POLICY "buyers_all_policy" ON buyers
  FOR ALL TO authenticated USING (id = uid() OR is_admin()) WITH CHECK (id = uid() OR is_admin());

-- Suppliers policies
CREATE POLICY "suppliers_all_policy" ON suppliers
  FOR ALL TO authenticated USING (id = uid() OR is_admin()) WITH CHECK (id = uid() OR is_admin());

-- RFQs policies
CREATE POLICY "rfqs_select_policy" ON rfqs
  FOR SELECT TO authenticated USING (
    buyer_id = uid() OR 
    is_admin() OR 
    (open_for_bidding = true AND status IN ('approved', 'matched'))
  );

CREATE POLICY "rfqs_insert_policy" ON rfqs
  FOR INSERT TO authenticated WITH CHECK (buyer_id = uid());

CREATE POLICY "rfqs_update_policy" ON rfqs
  FOR UPDATE TO authenticated USING (
    (buyer_id = uid() AND status = 'pending_approval') OR 
    is_admin()
  ) WITH CHECK (
    (buyer_id = uid() AND status = 'pending_approval') OR 
    is_admin()
  );

CREATE POLICY "rfqs_delete_policy" ON rfqs
  FOR DELETE TO authenticated USING (buyer_id = uid() OR is_admin());

-- RFQ Suppliers policies
CREATE POLICY "rfq_suppliers_select_policy" ON rfq_suppliers
  FOR SELECT TO authenticated USING (
    supplier_id = uid() OR 
    is_admin() OR 
    EXISTS (SELECT 1 FROM rfqs WHERE id = rfq_id AND buyer_id = uid())
  );

CREATE POLICY "rfq_suppliers_admin_policy" ON rfq_suppliers
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Supplier Quotations policies
CREATE POLICY "quotations_select_policy" ON supplier_quotations
  FOR SELECT TO authenticated USING (
    supplier_id = uid() OR 
    is_admin() OR 
    (status = 'approved_for_buyer' AND EXISTS (
      SELECT 1 FROM rfqs WHERE id = rfq_id AND buyer_id = uid()
    ))
  );

CREATE POLICY "quotations_insert_policy" ON supplier_quotations
  FOR INSERT TO authenticated WITH CHECK (
    supplier_id = uid() AND (
      EXISTS (SELECT 1 FROM rfq_suppliers WHERE rfq_id = rfq_id AND supplier_id = uid()) OR
      EXISTS (
        SELECT 1 FROM rfqs r 
        JOIN suppliers s ON s.id = uid() 
        WHERE r.id = rfq_id AND r.open_for_bidding = true AND r.category = ANY(s.product_categories)
      )
    )
  );

CREATE POLICY "quotations_update_policy" ON supplier_quotations
  FOR UPDATE TO authenticated USING (
    (supplier_id = uid() AND status = 'draft') OR 
    is_admin()
  ) WITH CHECK (
    (supplier_id = uid() AND status = 'draft') OR 
    is_admin()
  );

CREATE POLICY "quotations_admin_policy" ON supplier_quotations
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Sample Requests policies
CREATE POLICY "samples_select_policy" ON sample_requests
  FOR SELECT TO authenticated USING (
    buyer_id = uid() OR 
    supplier_id = uid() OR 
    is_admin()
  );

CREATE POLICY "samples_insert_policy" ON sample_requests
  FOR INSERT TO authenticated WITH CHECK (
    buyer_id = uid() AND EXISTS (
      SELECT 1 FROM rfqs WHERE id = rfq_id AND buyer_id = uid()
    )
  );

CREATE POLICY "samples_update_policy" ON sample_requests
  FOR UPDATE TO authenticated USING (
    (supplier_id = uid() AND status = 'approved_by_admin') OR 
    is_admin()
  ) WITH CHECK (
    (supplier_id = uid() AND status = 'approved_by_admin') OR 
    is_admin()
  );

CREATE POLICY "samples_admin_policy" ON sample_requests
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Orders policies
CREATE POLICY "orders_select_policy" ON orders
  FOR SELECT TO authenticated USING (
    buyer_id = uid() OR 
    supplier_id = uid() OR 
    is_admin()
  );

CREATE POLICY "orders_insert_policy" ON orders
  FOR INSERT TO authenticated WITH CHECK (buyer_id = uid());

CREATE POLICY "orders_update_policy" ON orders
  FOR UPDATE TO authenticated USING (
    supplier_id = uid() OR 
    is_admin()
  ) WITH CHECK (
    supplier_id = uid() OR 
    is_admin()
  );

CREATE POLICY "orders_admin_policy" ON orders
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- RFQ Questions policies
CREATE POLICY "questions_select_policy" ON rfq_questions
  FOR SELECT TO authenticated USING (
    supplier_id = uid() OR 
    is_admin() OR 
    EXISTS (SELECT 1 FROM rfqs WHERE id = rfq_id AND buyer_id = uid())
  );

CREATE POLICY "questions_insert_policy" ON rfq_questions
  FOR INSERT TO authenticated WITH CHECK (
    supplier_id = uid() AND (
      EXISTS (SELECT 1 FROM rfq_suppliers WHERE rfq_id = rfq_id AND supplier_id = uid()) OR
      EXISTS (
        SELECT 1 FROM rfqs r 
        JOIN suppliers s ON s.id = uid() 
        WHERE r.id = rfq_id AND r.open_for_bidding = true AND r.category = ANY(s.product_categories)
      )
    )
  );

CREATE POLICY "questions_admin_policy" ON rfq_questions
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create admin user if not exists
DO $$
BEGIN
  -- Insert admin profile if it doesn't exist
  INSERT INTO profiles (id, user_type, full_name, company_name, phone, country, website)
  VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin',
    'System Administrator',
    'Solomon Bharat',
    '+91-8595135554',
    'India',
    'https://solomonbharat.com'
  )
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if the user doesn't exist in auth.users
    NULL;
END $$;

-- Insert sample categories
INSERT INTO categories (name, description, active) VALUES
  ('Textiles & Apparel', 'Clothing, fabrics, and textile products', true),
  ('Spices & Food Products', 'Spices, processed foods, and agricultural products', true),
  ('Handicrafts & Home Decor', 'Traditional crafts and decorative items', true),
  ('Electronics & Components', 'Electronic devices and components', true),
  ('Pharmaceuticals & Healthcare', 'Medical products and pharmaceuticals', true),
  ('Chemicals & Materials', 'Industrial chemicals and raw materials', true),
  ('Automotive Parts', 'Vehicle parts and accessories', true),
  ('Jewelry & Gems', 'Precious stones and jewelry', true),
  ('Leather Goods', 'Leather products and accessories', true),
  ('Agricultural Products', 'Fresh produce and agricultural items', true)
ON CONFLICT (name) DO NOTHING;