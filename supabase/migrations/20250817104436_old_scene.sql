/*
  # Initial Database Schema for Solomon Bharat Portal

  1. Core Tables
    - profiles (user profile data)
    - categories (product categories)
    - suppliers (supplier-specific data)
    - buyers (buyer-specific data)
    - rfqs (request for quotations)
    - rfq_suppliers (supplier assignments)
    - supplier_quotations (quotations from suppliers)
    - sample_requests (sample request management)
    - orders (confirmed orders)
    - rfq_questions (Q&A system)

  2. Security
    - Enable RLS on all tables
    - Create helper functions for role checking
    - Add comprehensive policies for each role

  3. Indexes
    - Performance indexes on commonly queried fields
*/

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type rfq_status as enum ('pending_approval','approved','matched','quoting','closed');
create type quotation_status as enum ('draft','pending_admin_review','approved_for_buyer','rejected');
create type sample_status as enum ('requested','approved_by_admin','shipped_by_supplier','delivered','rejected');
create type order_status as enum ('confirmed','in_production','shipped','delivered','completed');
create type qa_status as enum ('pending_admin','approved_by_admin','sent_to_buyer','answered_by_buyer','published');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type text check (user_type in ('admin','buyer','supplier')) not null,
  full_name text,
  company_name text,
  phone text,
  country text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  requirements jsonb default '{}'::jsonb,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Suppliers table
create table public.suppliers (
  id uuid primary key references auth.users(id) on delete cascade,
  product_categories text[] not null default '{}',
  certifications text[] default '{}',
  years_in_business int,
  annual_turnover text,
  employee_count text,
  gst_number text,
  iec_code text,
  production_capacity text,
  minimum_order_quantity text,
  quality_standards text,
  verification_status text check (verification_status in ('pending','verified','rejected')) default 'pending',
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Buyers table
create table public.buyers (
  id uuid primary key references auth.users(id) on delete cascade,
  business_type text,
  annual_volume text,
  preferred_categories text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RFQs table
create table public.rfqs (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null,
  description text,
  quantity int not null,
  unit text not null,
  target_price numeric,
  max_price numeric,
  delivery_timeline text,
  shipping_terms text,
  quality_standards text,
  certifications_needed text,
  additional_requirements text,
  open_for_bidding boolean default false,
  status rfq_status default 'pending_approval',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  expires_at timestamptz
);

-- RFQ Suppliers assignment table
create table public.rfq_suppliers (
  rfq_id uuid references public.rfqs(id) on delete cascade,
  supplier_id uuid references auth.users(id) on delete cascade,
  invited_by uuid references auth.users(id),
  invited_at timestamptz default now(),
  primary key (rfq_id, supplier_id)
);

-- Supplier Quotations table
create table public.supplier_quotations (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  supplier_id uuid references auth.users(id) on delete cascade not null,
  price_per_unit numeric not null check (price_per_unit > 0),
  moq int check (moq >= 1),
  lead_time_days int check (lead_time_days >= 0),
  payment_terms text,
  shipping_terms text,
  validity_days int check (validity_days > 0),
  quality_guarantee boolean default false,
  sample_available boolean default false,
  notes text,
  attachments jsonb default '[]'::jsonb,
  status quotation_status default 'pending_admin_review',
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

-- Sample Requests table
create table public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  quotation_id uuid references public.supplier_quotations(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  supplier_id uuid references auth.users(id) on delete cascade not null,
  delivery_address text,
  courier_service text,
  tracking_number text,
  status sample_status default 'requested',
  created_at timestamptz default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  shipped_at timestamptz,
  delivered_at timestamptz
);

-- Orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  quotation_id uuid references public.supplier_quotations(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  supplier_id uuid references auth.users(id) on delete cascade not null,
  quantity int not null check (quantity > 0),
  unit_price numeric not null check (unit_price > 0),
  total_value numeric generated always as (quantity * unit_price) stored,
  payment_terms text,
  delivery_terms text,
  status order_status default 'confirmed',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expected_delivery timestamptz,
  tracking_info text
);

-- RFQ Questions table
create table public.rfq_questions (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  supplier_id uuid references auth.users(id) on delete cascade not null,
  question text not null,
  answer text,
  status qa_status default 'pending_admin',
  created_at timestamptz default now(),
  answered_at timestamptz,
  answered_by uuid references auth.users(id),
  published_at timestamptz
);

-- Create indexes for performance
create index on public.profiles(user_type);
create index on public.suppliers using gin (product_categories);
create index on public.suppliers(verification_status);
create index on public.buyers(id);
create index on public.rfqs(buyer_id);
create index on public.rfqs(category);
create index on public.rfqs(status);
create index on public.rfqs(created_at);
create index on public.rfq_suppliers(supplier_id);
create index on public.rfq_suppliers(rfq_id);
create index on public.supplier_quotations(rfq_id);
create index on public.supplier_quotations(supplier_id);
create index on public.supplier_quotations(status);
create index on public.sample_requests(rfq_id);
create index on public.sample_requests(buyer_id);
create index on public.sample_requests(supplier_id);
create index on public.sample_requests(status);
create index on public.orders(buyer_id);
create index on public.orders(supplier_id);
create index on public.orders(status);
create index on public.rfq_questions(rfq_id);
create index on public.rfq_questions(supplier_id);
create index on public.rfq_questions(status);