import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'

// Types
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
  description: string | null
  requirements: any
  active: boolean
  created_at: string
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
  approved_at: string | null
  approved_by: string | null
  expires_at: string | null
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
}

export interface SampleRequest {
  id: string
  rfq_id: string
  quotation_id: string
  buyer_id: string
  supplier_id: string
  delivery_address: string | null
  courier_service: string | null
  tracking_number: string | null
  status: 'requested' | 'approved_by_admin' | 'shipped_by_supplier' | 'delivered' | 'rejected'
  created_at: string
  approved_at: string | null
  approved_by: string | null
  shipped_at: string | null
  delivered_at: string | null
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
  expected_delivery: string | null
  tracking_info: string | null
}

// Categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      return data as Category[]
    }
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

// RFQs
export const useRFQs = (filters?: { status?: string; buyer_id?: string }) => {
  return useQuery({
    queryKey: ['rfqs', filters],
    queryFn: async () => {
      let query = supabase.from('rfqs').select(`
        *,
        profiles!buyer_id(*)
      `)
      
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data as RFQ[]
    }
  })
}

export const useCreateRFQ = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rfqData: Omit<RFQ, 'id' | 'created_at' | 'approved_at' | 'approved_by'>) => {
      const { data, error } = await supabase
        .from('rfqs')
        .insert(rfqData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    }
  })
}

// Suppliers
export const useSuppliers = (filters?: { verification_status?: string }) => {
  return useQuery({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          profiles!inner(*)
        `)
      
      if (filters?.verification_status) {
        query = query.eq('verification_status', filters.verification_status)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    }
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (supplierData: Omit<Supplier, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })
}

// Quotations
export const useQuotations = (filters?: { rfq_id?: string; supplier_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      let query = supabase.from('supplier_quotations').select(`
        *,
        rfqs!inner(*),
        profiles!supplier_id(*)
      `)
      
      if (filters?.rfq_id) {
        query = query.eq('rfq_id', filters.rfq_id)
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      const { data, error } = await query.order('submitted_at', { ascending: false })
      
      if (error) throw error
      return data as SupplierQuotation[]
    }
  })
}

export const useCreateQuotation = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (quotationData: Omit<SupplierQuotation, 'id' | 'submitted_at'>) => {
      const { data, error } = await supabase
        .from('supplier_quotations')
        .insert(quotationData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    }
  })
}

// Sample Requests
export const useSampleRequests = (filters?: { buyer_id?: string; supplier_id?: string }) => {
  return useQuery({
    queryKey: ['sample-requests', filters],
    queryFn: async () => {
      let query = supabase.from('sample_requests').select(`
        *,
        rfqs!inner(*),
        supplier_quotations!inner(*),
        buyer_profiles:profiles!buyer_id(*),
        supplier_profiles:profiles!supplier_id(*)
      `)
      
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id)
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data as SampleRequest[]
    }
  })
}

export const useCreateSampleRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sampleData: Omit<SampleRequest, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert(sampleData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] })
    }
  })
}

// Orders
export const useOrders = (filters?: { buyer_id?: string; supplier_id?: string }) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let query = supabase.from('orders').select(`
        *,
        rfqs!inner(*),
        supplier_quotations!inner(*),
        buyer_profiles:profiles!buyer_id(*),
        supplier_profiles:profiles!supplier_id(*)
      `)
      
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id)
      }
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Order[]
    }
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
// Admin RPCs
export const useAdminApproveRFQ = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rfqId: string) => {
      const { error } = await supabase.rpc('admin_approve_rfq', { p_rfq_id: rfqId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    }
  })
}

export const useAdminAssignSuppliers = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ rfqId, supplierIds }: { rfqId: string; supplierIds: string[] }) => {
      const { error } = await supabase.rpc('admin_assign_suppliers', { 
        p_rfq_id: rfqId, 
        p_supplier_ids: supplierIds 
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    }
  })
}

export const useAdminVerifySupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ supplierId, status }: { supplierId: string; status: string }) => {
      const { error } = await supabase.rpc('admin_verify_supplier', { 
        p_supplier_id: supplierId, 
        p_status: status 
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })
}

export const useAdminSetQuotationStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const { error } = await supabase.rpc('admin_set_quotation_status', { 
        p_quote_id: quoteId, 
        p_status: status 
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    }
  })
}

export const useAdminApproveSample = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sampleId: string) => {
      const { error } = await supabase.rpc('admin_approve_sample', { p_sample_id: sampleId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample-requests'] })
    }
  })
}