import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Profile {
  id: string;
  user_id: string;
  user_type: 'buyer' | 'supplier' | 'admin';
  name: string;
  email: string;
  phone?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  profile_id: string;
  name: string;
  address?: string;
  website?: string;
  business_type?: string;
  gst_number?: string;
  iec_code?: string;
  pan_number?: string;
  years_in_business?: number;
  annual_turnover?: string;
  employee_count?: string;
  export_countries?: string;
  verified: boolean;
  verification_documents: string[];
  created_at: string;
  updated_at: string;
}

export interface SupplierDetails {
  id: string;
  profile_id: string;
  product_categories: string[];
  certifications: string[];
  quality_standards?: string;
  production_capacity?: string;
  minimum_order_quantity?: string;
  payment_terms: string;
  lead_time: string;
  shipping_terms: string;
  about_company?: string;
  factory_photos: string[];
  factory_video?: string;
  rating: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  title: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  target_price: number;
  max_price?: number;
  delivery_timeline?: string;
  shipping_terms: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  images: string[];
  status: 'pending_approval' | 'approved' | 'matched' | 'quoted' | 'closed' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  supplier_id: string;
  quoted_price: number;
  moq: number;
  lead_time: string;
  payment_terms: string;
  shipping_terms: string;
  validity_days: number;
  quality_guarantee: boolean;
  sample_available: boolean;
  notes?: string;
  images: string[];
  status: 'pending_review' | 'approved' | 'rejected' | 'sent_to_buyer' | 'accepted';
  admin_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  rfq_id: string;
  quotation_id: string;
  buyer_id: string;
  supplier_id: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'completed';
  payment_received: number;
  tracking_number?: string;
  expected_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface SampleRequest {
  id: string;
  rfq_id: string;
  buyer_id: string;
  supplier_ids: string[];
  sample_quantity: number;
  specifications?: string;
  delivery_location: string;
  status: 'pending_admin_approval' | 'approved' | 'rejected' | 'sent_to_suppliers';
  admin_notes?: string;
  approved_at?: string;
  created_at: string;
}

export interface SampleQuote {
  id: string;
  sample_request_id: string;
  supplier_id: string;
  sample_price: number;
  shipping_cost: number;
  total_cost: number;
  delivery_time: string;
  notes?: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  submitted_at?: string;
  created_at: string;
}