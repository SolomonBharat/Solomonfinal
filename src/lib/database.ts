import { supabase } from './supabase';

// Enhanced Database Layer with Supabase integration
export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country: string;
  phone?: string;
  user_type: 'buyer' | 'supplier' | 'admin';
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface RFQ {
  id: string;
  buyer_id: string;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  target_price: number;
  max_price?: number;
  delivery_timeline: string;
  shipping_terms: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  status: 'pending_approval' | 'approved' | 'matched' | 'quoted' | 'closed' | 'rejected';
  created_at: string;
  updated_at: string;
  expires_at: string;
  matched_suppliers: string[];
  quotations_count: number;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_company: string;
  supplier_location: string;
  supplier_email: string;
  supplier_phone: string;
  quoted_price: number;
  moq: number;
  lead_time: string;
  payment_terms: string;
  shipping_terms: string;
  validity_days: number;
  quality_guarantee: boolean;
  sample_available: boolean;
  notes: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'sent_to_buyer' | 'accepted';
  submitted_at: string;
  reviewed_at?: string;
  total_value: number;
}

export interface Supplier {
  id: string;
  company_name: string;
  contact_person: string;
  business_type: string;
  years_in_business: number;
  annual_turnover: string;
  employee_count: string;
  product_categories: string[];
  certifications: string[];
  export_countries: string[];
  production_capacity: string;
  minimum_order_quantity: string;
  quality_standards: string;
  gst_number: string;
  iec_code: string;
  rating: number;
  total_orders: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  rfq_id: string;
  quotation_id: string;
  buyer_id: string;
  supplier_id: string;
  order_value: number;
  quantity: number;
  unit_price: number;
  payment_terms: string;
  delivery_terms: string;
  status: 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  expected_delivery: string;
  tracking_info?: string;
}

export interface Analytics {
  total_users: number;
  total_buyers: number;
  total_suppliers: number;
  total_rfqs: number;
  total_quotations: number;
  total_orders: number;
  total_gmv: number;
  monthly_gmv: number;
  avg_order_value: number;
  success_rate: number;
  top_categories: { category: string; count: number }[];
  top_countries: { country: string; count: number }[];
}

// Database Service Class with Supabase
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User Management
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // RFQ Management
  async createRFQ(rfqData: Partial<RFQ>): Promise<RFQ | null> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .insert([{
          ...rfqData,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          matched_suppliers: [],
          quotations_count: 0,
          status: 'pending_approval'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating RFQ:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating RFQ:', error);
      return null;
    }
  }

  async getRFQs(): Promise<RFQ[]> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching RFQs:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching RFQ by ID:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching RFQ by ID:', error);
      return null;
    }
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ | null> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating RFQ:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error updating RFQ:', error);
      return null;
    }
  }

  async getRFQsByBuyer(buyerId: string): Promise<RFQ[]> {
    try {
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyer RFQs:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching buyer RFQs:', error);
      return [];
    }
  }

  // Quotation Management
  async createQuotation(quotationData: Partial<Quotation>): Promise<Quotation | null> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .insert([{
          ...quotationData,
          status: 'pending_review'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating quotation:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating quotation:', error);
      return null;
    }
  }

  async getQuotations(): Promise<Quotation[]> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotations:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  }

  async getQuotationsByRFQ(rfqId: string): Promise<Quotation[]> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('rfq_id', rfqId)
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching quotations by RFQ:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching quotations by RFQ:', error);
      return [];
    }
  }

  async getQuotationsBySupplier(supplierId: string): Promise<Quotation[]> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching supplier quotations:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching supplier quotations:', error);
      return [];
    }
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .update({
          ...updates,
          reviewed_at: updates.status ? new Date().toISOString() : undefined
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating quotation:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error updating quotation:', error);
      return null;
    }
  }

  // Order Management
  async createOrder(orderData: Partial<Order>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          status: 'confirmed'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating order:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching buyer orders:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      return [];
    }
  }

  async getOrdersBySupplier(supplierId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching supplier orders:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      return [];
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating order:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  // Supplier Management
  async createSupplierProfile(supplierData: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating supplier profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating supplier profile:', error);
      return null;
    }
  }

  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching supplier by ID:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      return null;
    }
  }

  async updateSupplierProfile(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating supplier profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error updating supplier profile:', error);
      return null;
    }
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    try {
      const [usersResult, rfqsResult, quotationsResult, ordersResult] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('rfqs').select('*'),
        supabase.from('quotations').select('*'),
        supabase.from('orders').select('*')
      ]);

      const users = usersResult.data || [];
      const rfqs = rfqsResult.data || [];
      const quotations = quotationsResult.data || [];
      const orders = ordersResult.data || [];

      const buyers = users.filter(u => u.user_type === 'buyer');
      const suppliers = users.filter(u => u.user_type === 'supplier');

      const totalGMV = orders.reduce((sum, order) => sum + order.order_value, 0);
      const currentMonth = new Date().getMonth();
      const monthlyOrders = orders.filter(order => 
        new Date(order.created_at).getMonth() === currentMonth
      );
      const monthlyGMV = monthlyOrders.reduce((sum, order) => sum + order.order_value, 0);

      const categoryCount: { [key: string]: number } = {};
      rfqs.forEach(rfq => {
        categoryCount[rfq.category] = (categoryCount[rfq.category] || 0) + 1;
      });

      const countryCount: { [key: string]: number } = {};
      buyers.forEach(buyer => {
        countryCount[buyer.country] = (countryCount[buyer.country] || 0) + 1;
      });

      return {
        total_users: users.length,
        total_buyers: buyers.length,
        total_suppliers: suppliers.length,
        total_rfqs: rfqs.length,
        total_quotations: quotations.length,
        total_orders: orders.length,
        total_gmv: totalGMV,
        monthly_gmv: monthlyGMV,
        avg_order_value: orders.length > 0 ? totalGMV / orders.length : 0,
        success_rate: rfqs.length > 0 ? (orders.length / rfqs.length) * 100 : 0,
        top_categories: Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        top_countries: Object.entries(countryCount)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return {
        total_users: 0,
        total_buyers: 0,
        total_suppliers: 0,
        total_rfqs: 0,
        total_quotations: 0,
        total_orders: 0,
        total_gmv: 0,
        monthly_gmv: 0,
        avg_order_value: 0,
        success_rate: 0,
        top_categories: [],
        top_countries: []
      };
    }
  }

  // Search and Filter
  async searchRFQs(query: string, filters?: { category?: string; status?: string }): Promise<RFQ[]> {
    try {
      let queryBuilder = supabase.from('rfqs').select('*');

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }

      if (filters?.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error searching RFQs:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error searching RFQs:', error);
      return [];
    }
  }

  // Notification System
  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type,
          read: false
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string) {
    try {
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

export const db = DatabaseService.getInstance();