import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string
  user_type: 'admin' | 'buyer' | 'supplier'
  full_name: string | null
  company_name: string | null
  phone: string | null
  country: string | null
  website: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  requirements: any
  active: boolean
}

export interface RFQ {
  id: string
  buyer_id: string
  title: string
  category: string
  description: string | null
  quantity: number
  unit: string
  target_price: number | null
  open_for_bidding: boolean
  status: 'pending_approval' | 'approved' | 'matched' | 'quoting' | 'closed'
  created_at: string
  approved_at: string | null
  approved_by: string | null
}

export interface Supplier {
  id: string
  product_categories: string[]
  certifications: string[]
  years_in_business: number | null
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_at: string | null
  verified_by: string | null
}

export interface SupplierQuotation {
  id: string
  rfq_id: string
  supplier_id: string
  price_per_unit: number
  moq: number | null
  lead_time_days: number | null
  payment_terms: string | null
  shipping_terms: string | null
  validity_days: number | null
  attachments: any
  status: 'draft' | 'pending_admin_review' | 'approved_for_buyer' | 'rejected'
  submitted_at: string
}

export interface SampleRequest {
  id: string
  rfq_id: string
  buyer_id: string
  supplier_id: string
  courier_service: string | null
  tracking_number: string | null
  status: 'requested' | 'approved_by_admin' | 'shipped_by_supplier' | 'delivered' | 'rejected'
  created_at: string
}