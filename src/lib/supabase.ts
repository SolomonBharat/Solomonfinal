import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'admin' | 'buyer' | 'supplier';
          full_name: string | null;
          company_name: string | null;
          phone: string | null;
          country: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_type: 'admin' | 'buyer' | 'supplier';
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          country?: string | null;
          website?: string | null;
        };
        Update: {
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          country?: string | null;
          website?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          requirements: any;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          requirements?: any;
          active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          requirements?: any;
          active?: boolean;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          product_categories: string[];
          certifications: string[];
          years_in_business: number | null;
          annual_turnover: string | null;
          employee_count: string | null;
          gst_number: string | null;
          iec_code: string | null;
          production_capacity: string | null;
          minimum_order_quantity: string | null;
          quality_standards: string | null;
          verification_status: 'pending' | 'verified' | 'rejected';
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          product_categories?: string[];
          certifications?: string[];
          years_in_business?: number | null;
          annual_turnover?: string | null;
          employee_count?: string | null;
          gst_number?: string | null;
          iec_code?: string | null;
          production_capacity?: string | null;
          minimum_order_quantity?: string | null;
          quality_standards?: string | null;
        };
        Update: {
          product_categories?: string[];
          certifications?: string[];
          years_in_business?: number | null;
          annual_turnover?: string | null;
          employee_count?: string | null;
          gst_number?: string | null;
          iec_code?: string | null;
          production_capacity?: string | null;
          minimum_order_quantity?: string | null;
          quality_standards?: string | null;
          updated_at?: string;
        };
      };
      rfqs: {
        Row: {
          id: string;
          buyer_id: string;
          title: string;
          category: string;
          description: string | null;
          quantity: number;
          unit: string;
          target_price: number | null;
          max_price: number | null;
          delivery_timeline: string | null;
          shipping_terms: string | null;
          quality_standards: string | null;
          certifications_needed: string | null;
          additional_requirements: string | null;
          open_for_bidding: boolean;
          status: 'pending_approval' | 'approved' | 'matched' | 'quoting' | 'closed';
          created_at: string;
          updated_at: string;
          approved_at: string | null;
          approved_by: string | null;
          expires_at: string | null;
        };
        Insert: {
          buyer_id: string;
          title: string;
          category: string;
          description?: string | null;
          quantity: number;
          unit: string;
          target_price?: number | null;
          max_price?: number | null;
          delivery_timeline?: string | null;
          shipping_terms?: string | null;
          quality_standards?: string | null;
          certifications_needed?: string | null;
          additional_requirements?: string | null;
          open_for_bidding?: boolean;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          category?: string;
          description?: string | null;
          quantity?: number;
          unit?: string;
          target_price?: number | null;
          max_price?: number | null;
          delivery_timeline?: string | null;
          shipping_terms?: string | null;
          quality_standards?: string | null;
          certifications_needed?: string | null;
          additional_requirements?: string | null;
          open_for_bidding?: boolean;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      supplier_quotations: {
        Row: {
          id: string;
          rfq_id: string;
          supplier_id: string;
          price_per_unit: number;
          moq: number | null;
          lead_time_days: number | null;
          payment_terms: string | null;
          shipping_terms: string | null;
          validity_days: number | null;
          quality_guarantee: boolean;
          sample_available: boolean;
          notes: string | null;
          attachments: any;
          status: 'draft' | 'pending_admin_review' | 'approved_for_buyer' | 'rejected';
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          rfq_id: string;
          supplier_id: string;
          price_per_unit: number;
          moq?: number | null;
          lead_time_days?: number | null;
          payment_terms?: string | null;
          shipping_terms?: string | null;
          validity_days?: number | null;
          quality_guarantee?: boolean;
          sample_available?: boolean;
          notes?: string | null;
          attachments?: any;
          status?: 'draft' | 'pending_admin_review';
        };
        Update: {
          price_per_unit?: number;
          moq?: number | null;
          lead_time_days?: number | null;
          payment_terms?: string | null;
          shipping_terms?: string | null;
          validity_days?: number | null;
          quality_guarantee?: boolean;
          sample_available?: boolean;
          notes?: string | null;
          attachments?: any;
        };
      };
    };
  };
}

export type UserProfile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type RFQ = Database['public']['Tables']['rfqs']['Row'];
export type SupplierQuotation = Database['public']['Tables']['supplier_quotations']['Row'];