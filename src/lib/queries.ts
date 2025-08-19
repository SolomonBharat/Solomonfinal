import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, UserProfile, Category, RFQ, Supplier, SupplierQuotation, SampleRequest } from './supabase'

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

// RFQs
export const useRFQs = (filters?: { status?: string; buyer_id?: string }) => {
  return useQuery({
    queryKey: ['rfqs', filters],
    queryFn: async () => {
      let query = supabase.from('rfqs').select('*')
      
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

// Quotations
export const useQuotations = (filters?: { rfq_id?: string; supplier_id?: string; status?: string }) => {
  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: async () => {
      let query = supabase.from('supplier_quotations').select('*')
      
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
      let query = supabase.from('sample_requests').select('*')
      
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