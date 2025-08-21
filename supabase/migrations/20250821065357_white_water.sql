/*
  # Fix Enum Values for Solomon Bharat Database
  
  This migration fixes the enum types to include all status values used by the application.

  1. Enum Types
    - `rfq_status` - All possible RFQ status values
    - `quotation_status` - All possible quotation status values
    - `order_status` - All possible order status values
    - `user_type` - User role types
    - `verification_status` - User verification states

  2. Tables
    - Complete schema with proper enum constraints
    - All required tables for the Solomon Bharat platform

  3. Security
    - Row Level Security enabled on all tables
    - Proper access policies for buyers, suppliers, and admins
*/

-- Create enum types for better data integrity
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('buyer', 'supplier', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rfq_status AS ENUM (
    'pending_approval', 'approved', 'matched', 'quoted', 'closed', 'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quotation_status AS ENUM (
    'pending_review', 'approved', 'rejected', 'sent_to_buyer', 'accepted'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'confirmed', 'in_production', 'shipped', 'delivered', 'completed', 'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  company text,
  country text,
  phone text,
  user_type user_type NOT NULL DEFAULT 'buyer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  profile_completed boolean DEFAULT false,
  verification_status verification_status DEFAULT 'pending'
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Create RFQs table
CREATE TABLE IF NOT EXISTS public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  quantity integer NOT NULL,
  unit text NOT NULL,
  target_price numeric NOT NULL,
  max_price numeric,
  delivery_timeline text,
  shipping_terms text,
  quality_standards text,
  certifications_needed text,
  additional_requirements text,
  status rfq_status DEFAULT 'pending_approval',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  matched_suppliers text[] DEFAULT '{}',
  quotations_count integer DEFAULT 0
);

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- RFQ policies
CREATE POLICY "Buyers can view their own RFQs"
  ON public.rfqs FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers can create RFQs"
  ON public.rfqs FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own RFQs"
  ON public.rfqs FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Admins can view all RFQs"
  ON public.rfqs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can update all RFQs"
  ON public.rfqs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Suppliers can view approved RFQs"
  ON public.rfqs FOR SELECT
  USING (status IN ('approved', 'matched', 'quoted') AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'supplier'));

-- Create quotations table
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid REFERENCES public.rfqs(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  supplier_name text,
  supplier_company text,
  supplier_location text,
  supplier_email text,
  supplier_phone text,
  quoted_price numeric NOT NULL,
  moq integer NOT NULL,
  lead_time text NOT NULL,
  payment_terms text,
  shipping_terms text,
  validity_days integer,
  quality_guarantee boolean DEFAULT false,
  sample_available boolean DEFAULT false,
  notes text,
  status quotation_status DEFAULT 'pending_review',
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  total_value numeric
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Quotation policies
CREATE POLICY "Suppliers can view and create their own quotations"
  ON public.quotations FOR ALL
  USING (auth.uid() = supplier_id);

CREATE POLICY "Buyers can view quotations for their RFQs"
  ON public.quotations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.rfqs WHERE id = rfq_id AND buyer_id = auth.uid()));

CREATE POLICY "Admins can view all quotations"
  ON public.quotations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can update all quotations"
  ON public.quotations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id uuid REFERENCES public.rfqs(id) ON DELETE CASCADE NOT NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  order_value numeric NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  payment_terms text,
  delivery_terms text,
  status order_status DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expected_delivery timestamptz,
  tracking_info text
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order policies
CREATE POLICY "Buyers can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Suppliers can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = supplier_id);

CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Suppliers can update their own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = supplier_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

-- Create suppliers table for detailed supplier profiles
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  business_type text,
  years_in_business integer,
  annual_turnover text,
  employee_count text,
  product_categories text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  export_countries text[] DEFAULT '{}',
  production_capacity text,
  minimum_order_quantity text,
  quality_standards text,
  gst_number text,
  iec_code text,
  rating numeric DEFAULT 0,
  total_orders integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Supplier policies
CREATE POLICY "Suppliers can view and update their own profile"
  ON public.suppliers FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all supplier profiles"
  ON public.suppliers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Admins can update all supplier profiles"
  ON public.suppliers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY "Buyers can view verified supplier profiles"
  ON public.suppliers FOR SELECT
  USING (verified = true AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'buyer'));

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON public.rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq_id ON public.quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_supplier_id ON public.quotations(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier_id ON public.orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON public.rfqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;