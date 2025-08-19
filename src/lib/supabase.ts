import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.log('Required variables:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_type: 'buyer' | 'supplier' | 'admin';
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
          user_type: 'buyer' | 'supplier' | 'admin';
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          country?: string | null;
          website?: string | null;
        };
        Update: {
          user_type?: 'buyer' | 'supplier' | 'admin';
          full_name?: string | null;
          company_name?: string | null;
          phone?: string | null;
          country?: string | null;
          website?: string | null;
          updated_at?: string;
        };
      };
      buyers: {
        Row: {
          id: string;
          business_type: string | null;
          annual_volume: string | null;
          preferred_categories: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_type?: string | null;
          annual_volume?: string | null;
          preferred_categories?: string[] | null;
        };
        Update: {
          business_type?: string | null;
          annual_volume?: string | null;
          preferred_categories?: string[] | null;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          product_categories: string[];
          certifications: string[] | null;
          years_in_business: number | null;
          annual_turnover: string | null;
          employee_count: string | null;
          gst_number: string | null;
          iec_code: string | null;
          production_capacity: string | null;
          minimum_order_quantity: string | null;
          quality_standards: string | null;
          verification_status: string | null;
          verified_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          product_categories?: string[];
          certifications?: string[] | null;
          years_in_business?: number | null;
          annual_turnover?: string | null;
          employee_count?: string | null;
          gst_number?: string | null;
          iec_code?: string | null;
          production_capacity?: string | null;
          minimum_order_quantity?: string | null;
          quality_standards?: string | null;
          verification_status?: string | null;
        };
        Update: {
          product_categories?: string[];
          certifications?: string[] | null;
          years_in_business?: number | null;
          annual_turnover?: string | null;
          employee_count?: string | null;
          gst_number?: string | null;
          iec_code?: string | null;
          production_capacity?: string | null;
          minimum_order_quantity?: string | null;
          quality_standards?: string | null;
          verification_status?: string | null;
          verified_at?: string | null;
          verified_by?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          requirements: any;
          active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          requirements?: any;
          active?: boolean | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          requirements?: any;
          active?: boolean | null;
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
          target_price: number;
          max_price: number | null;
          delivery_timeline: string | null;
          shipping_terms: string | null;
          quality_standards: string | null;
          certifications_needed: string | null;
          additional_requirements: string | null;
          open_for_bidding: boolean | null;
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
          target_price: number;
          max_price?: number | null;
          delivery_timeline?: string | null;
          shipping_terms?: string | null;
          quality_standards?: string | null;
          certifications_needed?: string | null;
          additional_requirements?: string | null;
          open_for_bidding?: boolean | null;
          expires_at?: string | null;
        };
        Update: {
          title?: string;
          category?: string;
          description?: string | null;
          quantity?: number;
          unit?: string;
          target_price?: number;
          max_price?: number | null;
          delivery_timeline?: string | null;
          shipping_terms?: string | null;
          quality_standards?: string | null;
          certifications_needed?: string | null;
          additional_requirements?: string | null;
          open_for_bidding?: boolean | null;
          status?: 'pending_approval' | 'approved' | 'matched' | 'quoting' | 'closed';
          approved_at?: string | null;
          approved_by?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}