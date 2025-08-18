import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                            supabaseAnonKey !== 'placeholder-key' &&
                            supabaseUrl.includes('supabase.co') &&
                            supabaseAnonKey.length > 20;

console.log('Supabase configuration:', {
  configured: isSupabaseConfigured,
  url: isSupabaseConfigured ? supabaseUrl : 'Not configured',
  keyLength: isSupabaseConfigured ? supabaseAnonKey.length : 0
});

// Create Supabase client with real-time enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Export configuration status
export { isSupabaseConfigured };

// Database types
export interface UserProfile {
  id: string
  user_type: 'admin' | 'buyer' | 'supplier'
  full_name: string | null
  company_name: string | null
  phone: string | null
  country: string | null
  website: string | null
  created_at: string
  updated_at: string
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
  max_price: number | null
  delivery_timeline: string | null
  shipping_terms: string | null
  quality_standards: string | null
  certifications_needed: string | null
  additional_requirements: string | null
  open_for_bidding: boolean
  status: 'pending_approval' | 'approved' | 'matched' | 'quoting' | 'closed'
  created_at: string
  updated_at: string
  approved_at: string | null
  approved_by: string | null
  expires_at: string | null
  profiles?: UserProfile
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
  quality_guarantee: boolean
  sample_available: boolean
  notes: string | null
  attachments: any
  status: 'draft' | 'pending_admin_review' | 'approved_for_buyer' | 'rejected'
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rfqs?: RFQ
  profiles?: UserProfile
}

export interface Order {
  id: string
  rfq_id: string
  quotation_id: string
  buyer_id: string
  supplier_id: string
  quantity: number
  unit_price: number
  total_value: number
  payment_terms: string | null
  delivery_terms: string | null
  status: 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed'
  created_at: string
  updated_at: string
  expected_delivery: string | null
  tracking_info: string | null
  rfqs?: RFQ
  supplier_quotations?: SupplierQuotation
  buyer_profiles?: UserProfile
  supplier_profiles?: UserProfile
}

export interface Supplier {
  id: string
  product_categories: string[]
  certifications: string[]
  years_in_business: number | null
  annual_turnover: string | null
  employee_count: string | null
  gst_number: string | null
  iec_code: string | null
  production_capacity: string | null
  minimum_order_quantity: string | null
  quality_standards: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
  profiles?: UserProfile
}

export interface Category {
  id: string
  name: string
  description: string | null
  requirements: any
  active: boolean
  created_at: string
  updated_at: string
}

// Helper function to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    return profile?.user_type === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Real-time subscription helpers
export const subscribeToRFQs = (callback: (payload: any) => void) => {
  return supabase
    .channel('rfqs')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rfqs' }, callback)
    .subscribe()
}

export const subscribeToQuotations = (callback: (payload: any) => void) => {
  return supabase
    .channel('quotations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_quotations' }, callback)
    .subscribe()
}

export const subscribeToOrders = (callback: (payload: any) => void) => {
  return supabase
    .channel('orders')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .subscribe()
}