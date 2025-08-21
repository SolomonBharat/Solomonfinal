/*
  # Solomon Bharat B2B Marketplace - Initial Database Schema

  1. New Tables
    - `profiles` - User profiles for buyers, suppliers, and admins
    - `companies` - Company information and verification details
    - `rfqs` - Request for Quotations from buyers
    - `quotations` - Supplier responses to RFQs
    - `orders` - Confirmed orders between buyers and suppliers
    - `messages` - Communication between users
    - `notifications` - System notifications
    - `rfq_questions` - Supplier questions about RFQs
    - `sample_requests` - Buyer requests for product samples
    - `sample_quotes` - Supplier quotes for samples
    - `categories` - Product categories
    - `certifications` - Available certifications

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Separate access for buyers, suppliers, and admins

  3. Features
    - User authentication and profiles
    - RFQ management workflow
    - Quotation and order processing
    - Messaging system
    - Sample request workflow
    - Admin approval processes
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
CREATE TYPE rfq_status AS ENUM ('pending_approval', 'approved', 'matched', 'quoted', 'closed', 'rejected');
CREATE TYPE quotation_status AS ENUM ('pending_review', 'approved', 'rejected', 'sent_to_buyer', 'accepted');
CREATE TYPE order_status AS ENUM ('confirmed', 'in_production', 'shipped', 'delivered', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'completed');
CREATE TYPE question_status AS ENUM ('pending_admin_review', 'answered_by_buyer', 'shared_with_suppliers');
CREATE TYPE sample_request_status AS ENUM ('pending_admin_approval', 'approved', 'rejected', 'sent_to_suppliers');
CREATE TYPE sample_quote_status AS ENUM ('pending', 'submitted', 'accepted', 'rejected');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'buyer',
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  country text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  website text,
  business_type text,
  gst_number text,
  iec_code text,
  pan_number text,
  years_in_business integer,
  annual_turnover text,
  employee_count text,
  export_countries text,
  verified boolean DEFAULT false,
  verification_documents jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert standard categories
INSERT INTO categories (name, description) VALUES
  ('Textiles & Apparel', 'Cotton, silk, wool fabrics, garments, home textiles'),
  ('Spices & Food Products', 'Turmeric, cardamom, pepper, tea, processed foods'),
  ('Handicrafts & Home Decor', 'Traditional crafts, decorative items, artwork'),
  ('Electronics & Components', 'Electronic parts, consumer electronics, IT hardware'),
  ('Pharmaceuticals & Healthcare', 'Generic medicines, medical devices, health supplements'),
  ('Chemicals & Materials', 'Industrial chemicals, dyes, pigments, raw materials'),
  ('Automotive Parts & Accessories', 'Auto components, spare parts, accessories'),
  ('Jewelry & Gems', 'Precious stones, gold jewelry, fashion jewelry'),
  ('Leather Goods & Footwear', 'Leather products, shoes, bags, accessories'),
  ('Agricultural Products', 'Rice, wheat, pulses, fresh produce')
ON CONFLICT (name) DO NOTHING;

-- Supplier details table
CREATE TABLE IF NOT EXISTS supplier_details (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  product_categories text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  quality_standards text,
  production_capacity text,
  minimum_order_quantity text,
  payment_terms text DEFAULT '30% advance, 70% on shipment',
  lead_time text DEFAULT '25-30 days',
  shipping_terms text DEFAULT 'FOB',
  about_company text,
  factory_photos text[] DEFAULT '{}',
  factory_video text,
  rating numeric(3,2) DEFAULT 0,
  total_orders integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RFQs table
CREATE TABLE IF NOT EXISTS rfqs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  quantity integer NOT NULL,
  unit text NOT NULL,
  target_price numeric(10,2) NOT NULL,
  max_price numeric(10,2),
  delivery_timeline text,
  shipping_terms text DEFAULT 'FOB',
  quality_standards text,
  certifications_needed text,
  additional_requirements text,
  images text[] DEFAULT '{}',
  status rfq_status DEFAULT 'pending_approval',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quotations table
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quoted_price numeric(10,2) NOT NULL,
  moq integer NOT NULL,
  lead_time text NOT NULL,
  payment_terms text NOT NULL,
  shipping_terms text NOT NULL,
  validity_days integer DEFAULT 15,
  quality_guarantee boolean DEFAULT false,
  sample_available boolean DEFAULT false,
  notes text,
  images text[] DEFAULT '{}',
  status quotation_status DEFAULT 'pending_review',
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid REFERENCES rfqs(id) ON DELETE CASCADE,
  quotation_id uuid REFERENCES quotations(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  total_value numeric(12,2) NOT NULL,
  status order_status DEFAULT 'confirmed',
  payment_status payment_status DEFAULT 'pending',
  payment_received numeric(12,2) DEFAULT 0,
  tracking_number text,
  expected_delivery date,
  actual_delivery date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rfq_id uuid REFERENCES rfqs(id) ON DELETE SET NULL,
  subject text,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  related_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RFQ Questions table
CREATE TABLE IF NOT EXISTS rfq_questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid REFERENCES rfqs(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  buyer_answer text,
  status question_status DEFAULT 'pending_admin_review',
  answered_at timestamptz,
  shared_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Sample Requests table
CREATE TABLE IF NOT EXISTS sample_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id uuid REFERENCES rfqs(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_ids uuid[] NOT NULL,
  sample_quantity integer NOT NULL DEFAULT 1,
  specifications text,
  delivery_location text NOT NULL,
  status sample_request_status DEFAULT 'pending_admin_approval',
  admin_notes text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Sample Quotes table
CREATE TABLE IF NOT EXISTS sample_quotes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sample_request_id uuid REFERENCES sample_requests(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sample_price numeric(10,2) NOT NULL,
  shipping_cost numeric(10,2) DEFAULT 0,
  total_cost numeric(10,2) GENERATED ALWAYS AS (sample_price + shipping_cost) STORED,
  delivery_time text NOT NULL,
  notes text,
  status sample_quote_status DEFAULT 'pending',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sample_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for companies
CREATE POLICY "Users can read own company"
  ON companies
  FOR SELECT
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own company"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own company"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for supplier_details
CREATE POLICY "Suppliers can manage own details"
  ON supplier_details
  FOR ALL
  TO authenticated
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Buyers can read supplier details"
  ON supplier_details
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for rfqs
CREATE POLICY "Buyers can manage own RFQs"
  ON rfqs
  FOR ALL
  TO authenticated
  USING (buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Suppliers can read approved RFQs"
  ON rfqs
  FOR SELECT
  TO authenticated
  USING (status IN ('approved', 'matched', 'quoted'));

CREATE POLICY "Admins can read all RFQs"
  ON rfqs
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can update RFQs"
  ON rfqs
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

-- RLS Policies for quotations
CREATE POLICY "Suppliers can manage own quotations"
  ON quotations
  FOR ALL
  TO authenticated
  USING (supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Buyers can read quotations for their RFQs"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (rfq_id IN (SELECT id FROM rfqs WHERE buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())));

CREATE POLICY "Admins can manage all quotations"
  ON quotations
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for rfq_questions
CREATE POLICY "Suppliers can create questions"
  ON rfq_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can read relevant questions"
  ON rfq_questions
  FOR SELECT
  TO authenticated
  USING (
    supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    rfq_id IN (SELECT id FROM rfqs WHERE buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Admins can update questions"
  ON rfq_questions
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

-- RLS Policies for sample_requests
CREATE POLICY "Buyers can manage own sample requests"
  ON sample_requests
  FOR ALL
  TO authenticated
  USING (buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Suppliers can read relevant sample requests"
  ON sample_requests
  FOR SELECT
  TO authenticated
  USING (
    (SELECT id FROM profiles WHERE user_id = auth.uid()) = ANY(supplier_ids) OR
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin')
  );

CREATE POLICY "Admins can manage sample requests"
  ON sample_requests
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND user_type = 'admin'));

-- RLS Policies for sample_quotes
CREATE POLICY "Suppliers can manage own sample quotes"
  ON sample_quotes
  FOR ALL
  TO authenticated
  USING (supplier_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Buyers can read sample quotes for their requests"
  ON sample_quotes
  FOR SELECT
  TO authenticated
  USING (
    sample_request_id IN (
      SELECT id FROM sample_requests 
      WHERE buyer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_companies_profile_id ON companies(profile_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_category ON rfqs(category);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_supplier_id ON quotations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_rfq_questions_rfq_id ON rfq_questions(rfq_id);
CREATE INDEX IF NOT EXISTS idx_sample_requests_buyer_id ON sample_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sample_quotes_supplier_id ON sample_quotes(supplier_id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_supplier_details_updated_at
  BEFORE UPDATE ON supplier_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON rfqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();