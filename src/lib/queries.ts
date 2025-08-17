import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// Query keys
export const queryKeys = {
  profile: (userId?: string) => ['profile', userId],
  categories: () => ['categories'],
  suppliers: (filters?: any) => ['suppliers', filters],
  rfqs: (filters?: any) => ['rfqs', filters],
  quotations: (rfqId?: string) => ['quotations', rfqId],
  sampleRequests: (filters?: any) => ['sampleRequests', filters],
  orders: (filters?: any) => ['orders', filters],
  questions: (rfqId?: string) => ['questions', rfqId],
};

// Profile queries
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Categories queries
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
};

// Suppliers queries
export const useSuppliers = (filters?: { verificationStatus?: string }) => {
  return useQuery({
    queryKey: queryKeys.suppliers(filters),
    queryFn: async () => {
      let query = supabase
        .from('suppliers')
        .select(`
          *,
          profiles!inner(*)
        `);

      if (filters?.verificationStatus) {
        query = query.eq('verification_status', filters.verificationStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// RFQs queries
export const useRFQs = (filters?: { status?: string; buyerId?: string }) => {
  return useQuery({
    queryKey: queryKeys.rfqs(filters),
    queryFn: async () => {
      let query = supabase
        .from('rfqs')
        .select(`
          *,
          profiles!buyer_id(*)
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.buyerId) {
        query = query.eq('buyer_id', filters.buyerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

// Supplier RFQs (assigned or open bidding)
export const useSupplierRFQs = (supplierId?: string) => {
  return useQuery({
    queryKey: ['supplierRFQs', supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          profiles!buyer_id(*),
          rfq_suppliers!inner(*)
        `)
        .eq('rfq_suppliers.supplier_id', supplierId!)
        .in('status', ['approved', 'matched', 'quoting']);
      
      if (error) throw error;
      return data;
    },
    enabled: !!supplierId,
  });
};

// Open bidding RFQs for suppliers
export const useOpenBiddingRFQs = (categories?: string[]) => {
  return useQuery({
    queryKey: ['openBiddingRFQs', categories],
    queryFn: async () => {
      if (!categories || categories.length === 0) return [];

      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          profiles!buyer_id(*)
        `)
        .eq('open_for_bidding', true)
        .in('status', ['approved', 'matched'])
        .in('category', categories);
      
      if (error) throw error;
      return data;
    },
    enabled: !!categories && categories.length > 0,
  });
};

// Quotations queries
export const useQuotations = (rfqId?: string) => {
  return useQuery({
    queryKey: queryKeys.quotations(rfqId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_quotations')
        .select(`
          *,
          profiles!supplier_id(*)
        `)
        .eq('rfq_id', rfqId!)
        .eq('status', 'approved_for_buyer')
        .order('price_per_unit');
      
      if (error) throw error;
      return data;
    },
    enabled: !!rfqId,
  });
};

// Admin quotations (pending review)
export const usePendingQuotations = () => {
  return useQuery({
    queryKey: ['pendingQuotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplier_quotations')
        .select(`
          *,
          profiles!supplier_id(*),
          rfqs!inner(*)
        `)
        .eq('status', 'pending_admin_review')
        .order('submitted_at');
      
      if (error) throw error;
      return data;
    },
  });
};

// Mutations
export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rfqData: any) => {
      const { data, error } = await supabase
        .from('rfqs')
        .insert(rfqData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs() });
    },
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quotationData: any) => {
      const { data, error } = await supabase
        .from('supplier_quotations')
        .insert(quotationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingQuotations'] });
    },
  });
};

// Admin mutations
export const useAdminApproveRFQ = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rfqId: string) => {
      const { error } = await supabase.rpc('admin_approve_rfq', {
        p_rfq_id: rfqId,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs() });
    },
  });
};

export const useAdminAssignSuppliers = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ rfqId, supplierIds }: { rfqId: string; supplierIds: string[] }) => {
      const { error } = await supabase.rpc('admin_assign_suppliers', {
        p_rfq_id: rfqId,
        p_supplier_ids: supplierIds,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs() });
    },
  });
};

export const useAdminVerifySupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ supplierId, status }: { supplierId: string; status: 'verified' | 'rejected' }) => {
      const { error } = await supabase.rpc('admin_verify_supplier', {
        p_supplier_id: supplierId,
        p_status: status,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers() });
    },
  });
};

export const useAdminSetQuotationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ quoteId, status }: { 
      quoteId: string; 
      status: 'approved_for_buyer' | 'rejected' 
    }) => {
      const { error } = await supabase.rpc('admin_set_quotation_status', {
        p_quote_id: quoteId,
        p_status: status,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingQuotations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.quotations() });
    },
  });
};