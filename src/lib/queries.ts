import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { 
  UserProfile, 
  RFQ, 
  SupplierQuotation, 
  Order, 
  Supplier, 
  Category 
} from './supabase'

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
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
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
export const useRFQs = (filters?: { status?: string; buyer_id?: string; categories?: string[] }) => {
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
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories)
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
    mutationFn: async (rfqData: Omit<RFQ, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'approved_by'>) => {
      const { data, error } = await supabase
        .from('rfqs')
        .insert({
          ...rfqData,
          updated_at: new Date().toISOString()
        })
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

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RFQ> }) => {
      const { data, error } = await supabase
        .from('rfqs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
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

export const useDeleteRFQ = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rfqs')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    }
  })
}

// Suppliers
export const useSuppliers = (filters?: { verification_status?: string; categories?: string[] }) => {
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
      
      if (filters?.categories && filters.categories.length > 0) {
        query = query.overlaps('product_categories', filters.categories)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return data as Supplier[]
    }
  })
}

export const useCreateSupplier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          ...supplierData,
          updated_at: new Date().toISOString()
        })
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
        .insert({
          ...quotationData,
          submitted_at: new Date().toISOString()
        })
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
export const useSampleRequests = (filters?: { supplier_id?: string; buyer_id?: string }) => {
  return useQuery({
    queryKey: ['sample_requests', filters],
    queryFn: async () => {
      let query = supabase.from('sample_requests').select(`
        *,
        rfqs!inner(*),
        supplier_quotations!inner(*),
        buyer_profiles:profiles!buyer_id(*),
        supplier_profiles:profiles!supplier_id(*)
      `)
      
      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id)
      }
      if (filters?.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }
  })
}

export const useUpdateSampleRequest = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('sample_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample_requests'] })
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
    mutationFn: async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          updated_at: new Date().toISOString()
        })
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

export const useUpdateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Order> }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
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

// Admin functions
export const useAdminApproveRFQ = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rfqId: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('rfqs')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', rfqId)
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

export const useAdminAssignSuppliers = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ rfqId, supplierIds }: { rfqId: string; supplierIds: string[] }) => {
      // Insert supplier assignments
      const assignments = supplierIds.map(supplierId => ({
        rfq_id: rfqId,
        supplier_id: supplierId,
        invited_at: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from('rfq_suppliers')
        .insert(assignments)
      
      if (error) throw error
      
      // Update RFQ status
      const { error: updateError } = await supabase
        .from('rfqs')
        .update({ 
          status: 'matched',
          updated_at: new Date().toISOString()
        })
        .eq('id', rfqId)
      
      if (updateError) throw updateError
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
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('suppliers')
        .update({ 
          verification_status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          verified_by: status === 'verified' ? user?.id : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId)
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

export const useAdminSetQuotationStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('supplier_quotations')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', quoteId)
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

// Export types
export type { UserProfile, RFQ, SupplierQuotation, Order, Supplier, Category }