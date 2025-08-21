import { supabase } from './supabase';
import type { Profile, Company, SupplierDetails, RFQ, Quotation, Order, SampleRequest, SampleQuote } from './supabase';

export class ApiService {
  // Profile Management
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }

  async updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Company Management
  async getCompany(profileId: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error) return null;
    return data;
  }

  async upsertCompany(company: Partial<Company>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('companies')
        .upsert(company);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Supplier Details Management
  async getSupplierDetails(profileId: string): Promise<SupplierDetails | null> {
    const { data, error } = await supabase
      .from('supplier_details')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error) return null;
    return data;
  }

  async upsertSupplierDetails(details: Partial<SupplierDetails>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('supplier_details')
        .upsert(details);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // RFQ Management
  async createRFQ(rfq: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: RFQ; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .insert(rfq)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getRFQs(filters?: { status?: string; buyer_id?: string; category?: string }): Promise<RFQ[]> {
    let query = supabase.from('rfqs').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.buyer_id) {
      query = query.eq('buyer_id', filters.buyer_id);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }

    return data || [];
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('rfqs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Quotation Management
  async createQuotation(quotation: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Quotation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .insert(quotation)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getQuotations(filters?: { rfq_id?: string; supplier_id?: string; status?: string }): Promise<Quotation[]> {
    let query = supabase.from('quotations').select('*');

    if (filters?.rfq_id) {
      query = query.eq('rfq_id', filters.rfq_id);
    }
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }

    return data || [];
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('quotations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Order Management
  async createOrder(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Order; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getOrders(filters?: { buyer_id?: string; supplier_id?: string; status?: string }): Promise<Order[]> {
    let query = supabase.from('orders').select('*');

    if (filters?.buyer_id) {
      query = query.eq('buyer_id', filters.buyer_id);
    }
    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  }

  // Sample Request Management
  async createSampleRequest(request: Omit<SampleRequest, 'id' | 'created_at'>): Promise<{ success: boolean; data?: SampleRequest; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getSampleRequests(filters?: { buyer_id?: string; status?: string }): Promise<SampleRequest[]> {
    let query = supabase.from('sample_requests').select('*');

    if (filters?.buyer_id) {
      query = query.eq('buyer_id', filters.buyer_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sample requests:', error);
      return [];
    }

    return data || [];
  }

  async updateSampleRequest(id: string, updates: Partial<SampleRequest>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('sample_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Sample Quote Management
  async createSampleQuote(quote: Omit<SampleQuote, 'id' | 'created_at' | 'total_cost'>): Promise<{ success: boolean; data?: SampleQuote; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('sample_quotes')
        .insert(quote)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getSampleQuotes(filters?: { supplier_id?: string; sample_request_id?: string }): Promise<SampleQuote[]> {
    let query = supabase.from('sample_quotes').select('*');

    if (filters?.supplier_id) {
      query = query.eq('supplier_id', filters.supplier_id);
    }
    if (filters?.sample_request_id) {
      query = query.eq('sample_request_id', filters.sample_request_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sample quotes:', error);
      return [];
    }

    return data || [];
  }

  // Notification Management
  async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async getNotifications(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    try {
      // Get counts from different tables
      const [rfqsResult, quotationsResult, ordersResult, profilesResult] = await Promise.all([
        supabase.from('rfqs').select('id', { count: 'exact' }),
        supabase.from('quotations').select('id', { count: 'exact' }),
        supabase.from('orders').select('total_value', { count: 'exact' }),
        supabase.from('profiles').select('user_type', { count: 'exact' })
      ]);

      const totalRFQs = rfqsResult.count || 0;
      const totalQuotations = quotationsResult.count || 0;
      const totalOrders = ordersResult.count || 0;
      const totalUsers = profilesResult.count || 0;

      // Calculate revenue from orders
      const { data: orders } = await supabase
        .from('orders')
        .select('total_value');

      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_value, 0) || 0;

      return {
        totalUsers,
        totalRFQs,
        totalQuotations,
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        conversionRate: totalRFQs > 0 ? (totalOrders / totalRFQs) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        totalUsers: 0,
        totalRFQs: 0,
        totalQuotations: 0,
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        conversionRate: 0
      };
    }
  }

  // Authentication helpers
  async signUp(email: string, password: string, userData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // File Upload
  async uploadFile(bucket: string, path: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return { success: true, url: publicUrl };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const api = new ApiService();