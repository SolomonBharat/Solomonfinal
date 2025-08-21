import { supabase, isSupabaseConfigured } from './supabase';

// Enhanced Database Layer with Supabase integration and localStorage fallback
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
  total_value: number;
  payment_received: number;
  payment_pending: number;
  buyer_contact: string;
  buyer_country: string;
  supplier_contact: string;
  supplier_location: string;
  rfq_title: string;
  tracking_number?: string;
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

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: 'buyer-1',
    email: 'buyer@example.com',
    name: 'John Smith',
    company: 'Global Trade Corp',
    country: 'United States',
    phone: '+1 555 123 4567',
    user_type: 'buyer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_completed: true,
    verification_status: 'verified'
  },
  {
    id: 'supplier-1',
    email: 'supplier@example.com',
    name: 'Rajesh Kumar',
    company: 'Global Textiles Pvt Ltd',
    country: 'India',
    phone: '+91 98765 43210',
    user_type: 'supplier',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_completed: true,
    verification_status: 'verified'
  },
  {
    id: 'admin-1',
    email: 'admin@solomonbharat.com',
    name: 'Admin User',
    company: 'Solomon Bharat',
    country: 'India',
    phone: '+91 98765 00000',
    user_type: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile_completed: true,
    verification_status: 'verified'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    company_name: 'Global Textiles Pvt Ltd',
    contact_person: 'Rajesh Kumar',
    business_type: 'Manufacturer',
    years_in_business: 15,
    annual_turnover: '5-10 Million USD',
    employee_count: '100-500',
    product_categories: ['Textiles & Apparel', 'Organic Cotton'],
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 9001'],
    export_countries: ['USA', 'UK', 'Canada', 'Australia'],
    production_capacity: '50,000 pieces per month',
    minimum_order_quantity: '1,000 pieces',
    quality_standards: 'ISO 9001:2015, GOTS Certified',
    gst_number: '33AABCG1234M1Z5',
    iec_code: 'AABCG1234M',
    rating: 4.8,
    total_orders: 156,
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Database Service Class with Supabase and localStorage fallback
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private getStorageKey(table: string): string {
    return `solomon_${table}`;
  }

  private getFromStorage<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(table));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // User Management
  async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      // Always use localStorage for demo
      const users = this.getFromStorage<User>('users');
      const newUser: User = {
        id: userData.id || this.generateId(),
        email: userData.email!,
        name: userData.name!,
        company: userData.company!,
        country: userData.country!,
        phone: userData.phone,
        user_type: userData.user_type || 'buyer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_completed: userData.profile_completed || false,
        verification_status: userData.verification_status || 'verified'
      };
      users.push(newUser);
      this.saveToStorage('users', users);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      // Always use localStorage for demo
      const users = this.getFromStorage<User>('users');
      return users.length > 0 ? users : mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      return mockUsers;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      // Always use localStorage for demo
      const users = this.getFromStorage<User>('users');
      const allUsers = users.length > 0 ? users : mockUsers;
      return allUsers.find(user => user.id === id) || null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Always use localStorage for demo
      const users = this.getFromStorage<User>('users');
      const allUsers = users.length > 0 ? users : mockUsers;
      return allUsers.find(user => user.email === email) || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const users = this.getFromStorage<User>('users');
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates, updated_at: new Date().toISOString() };
          this.saveToStorage('users', users);
          return users[userIndex];
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // RFQ Management
  async createRFQ(rfqData: Partial<RFQ>): Promise<RFQ | null> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('rfqs')
          .insert([{
            ...rfqData,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            matched_suppliers: [],
            quotations_count: 0,
            status: 'pending_approval' as const
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating RFQ:', error);
          return null;
        }
        return data;
      } else {
        const rfqs = this.getFromStorage<RFQ>('rfqs');
        const newRFQ: RFQ = {
          id: this.generateId(),
          buyer_id: rfqData.buyer_id!,
          title: rfqData.title!,
          category: rfqData.category!,
          description: rfqData.description || '',
          quantity: rfqData.quantity!,
          unit: rfqData.unit!,
          target_price: rfqData.target_price!,
          max_price: rfqData.max_price,
          delivery_timeline: rfqData.delivery_timeline!,
          shipping_terms: rfqData.shipping_terms!,
          quality_standards: rfqData.quality_standards,
          certifications_needed: rfqData.certifications_needed,
          additional_requirements: rfqData.additional_requirements,
          status: 'pending_approval',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          matched_suppliers: [],
          quotations_count: 0
        };
        rfqs.push(newRFQ);
        this.saveToStorage('rfqs', rfqs);
        return newRFQ;
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      return null;
    }
  }

  async getRFQs(): Promise<RFQ[]> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('rfqs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching RFQs:', error);
          return [];
        }
        return data || [];
      } else {
        return this.getFromStorage<RFQ>('rfqs');
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      return [];
    }
  }

  async getRFQById(id: string): Promise<RFQ | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const rfqs = this.getFromStorage<RFQ>('rfqs');
        return rfqs.find(rfq => rfq.id === id) || null;
      }
    } catch (error) {
      console.error('Error fetching RFQ by ID:', error);
      return null;
    }
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<RFQ | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const rfqs = this.getFromStorage<RFQ>('rfqs');
        const rfqIndex = rfqs.findIndex(rfq => rfq.id === id);
        if (rfqIndex !== -1) {
          rfqs[rfqIndex] = { ...rfqs[rfqIndex], ...updates, updated_at: new Date().toISOString() };
          this.saveToStorage('rfqs', rfqs);
          return rfqs[rfqIndex];
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating RFQ:', error);
      return null;
    }
  }

  async getRFQsByBuyer(buyerId: string): Promise<RFQ[]> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const rfqs = this.getFromStorage<RFQ>('rfqs');
        return rfqs.filter(rfq => rfq.buyer_id === buyerId);
      }
    } catch (error) {
      console.error('Error fetching buyer RFQs:', error);
      return [];
    }
  }

  // Quotation Management
  async createQuotation(quotationData: Partial<Quotation>): Promise<Quotation | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const quotations = this.getFromStorage<Quotation>('quotations');
        const newQuotation: Quotation = {
          id: this.generateId(),
          rfq_id: quotationData.rfq_id!,
          supplier_id: quotationData.supplier_id!,
          supplier_name: quotationData.supplier_name!,
          supplier_company: quotationData.supplier_company!,
          supplier_location: quotationData.supplier_location!,
          supplier_email: quotationData.supplier_email!,
          supplier_phone: quotationData.supplier_phone!,
          quoted_price: quotationData.quoted_price!,
          moq: quotationData.moq!,
          lead_time: quotationData.lead_time!,
          payment_terms: quotationData.payment_terms!,
          shipping_terms: quotationData.shipping_terms!,
          validity_days: quotationData.validity_days!,
          quality_guarantee: quotationData.quality_guarantee || false,
          sample_available: quotationData.sample_available || false,
          notes: quotationData.notes || '',
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
          total_value: quotationData.total_value!
        };
        quotations.push(newQuotation);
        this.saveToStorage('quotations', quotations);
        return newQuotation;
      }
    } catch (error) {
      console.error('Error creating quotation:', error);
      return null;
    }
  }

  async getQuotations(): Promise<Quotation[]> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('quotations')
          .select('*')
          .order('submitted_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching quotations:', error);
          return [];
        }
        return data || [];
      } else {
        return this.getFromStorage<Quotation>('quotations');
      }
    } catch (error) {
      console.error('Error fetching quotations:', error);
      return [];
    }
  }

  async getQuotationsByRFQ(rfqId: string): Promise<Quotation[]> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const quotations = this.getFromStorage<Quotation>('quotations');
        return quotations.filter(q => q.rfq_id === rfqId);
      }
    } catch (error) {
      console.error('Error fetching quotations by RFQ:', error);
      return [];
    }
  }

  async getQuotationsBySupplier(supplierId: string): Promise<Quotation[]> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const quotations = this.getFromStorage<Quotation>('quotations');
        return quotations.filter(q => q.supplier_id === supplierId);
      }
    } catch (error) {
      console.error('Error fetching supplier quotations:', error);
      return [];
    }
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const quotations = this.getFromStorage<Quotation>('quotations');
        const quotationIndex = quotations.findIndex(q => q.id === id);
        if (quotationIndex !== -1) {
          quotations[quotationIndex] = { 
            ...quotations[quotationIndex], 
            ...updates,
            reviewed_at: updates.status ? new Date().toISOString() : quotations[quotationIndex].reviewed_at
          };
          this.saveToStorage('quotations', quotations);
          return quotations[quotationIndex];
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      return null;
    }
  }

  // Order Management
  async createOrder(orderData: Partial<Order>): Promise<Order | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const orders = this.getFromStorage<Order>('orders');
        const newOrder: Order = {
          id: this.generateId(),
          rfq_id: orderData.rfq_id!,
          quotation_id: orderData.quotation_id!,
          buyer_id: orderData.buyer_id!,
          supplier_id: orderData.supplier_id!,
          order_value: orderData.order_value!,
          quantity: orderData.quantity!,
          unit_price: orderData.unit_price!,
          payment_terms: orderData.payment_terms!,
          delivery_terms: orderData.delivery_terms!,
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          expected_delivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          tracking_info: orderData.tracking_info,
          total_value: orderData.order_value!,
          payment_received: orderData.order_value! * 0.3, // 30% advance
          payment_pending: orderData.order_value! * 0.7, // 70% pending
          buyer_contact: 'John Smith',
          buyer_country: 'United States',
          supplier_contact: 'Rajesh Kumar',
          supplier_location: 'Tirupur, India',
          rfq_title: 'Product Order'
        };
        orders.push(newOrder);
        this.saveToStorage('orders', orders);
        return newOrder;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching orders:', error);
          return [];
        }
        return data || [];
      } else {
        return this.getFromStorage<Order>('orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrdersByBuyer(buyerId: string): Promise<Order[]> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const orders = this.getFromStorage<Order>('orders');
        return orders.filter(order => order.buyer_id === buyerId);
      }
    } catch (error) {
      console.error('Error fetching buyer orders:', error);
      return [];
    }
  }

  async getOrdersBySupplier(supplierId: string): Promise<Order[]> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const orders = this.getFromStorage<Order>('orders');
        return orders.filter(order => order.supplier_id === supplierId);
      }
    } catch (error) {
      console.error('Error fetching supplier orders:', error);
      return [];
    }
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const orders = this.getFromStorage<Order>('orders');
        const orderIndex = orders.findIndex(order => order.id === id);
        if (orderIndex !== -1) {
          orders[orderIndex] = { ...orders[orderIndex], ...updates, updated_at: new Date().toISOString() };
          this.saveToStorage('orders', orders);
          return orders[orderIndex];
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  // Supplier Management
  async createSupplierProfile(supplierData: Partial<Supplier>): Promise<Supplier | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const suppliers = this.getFromStorage<Supplier>('suppliers');
        const newSupplier: Supplier = {
          id: supplierData.id!,
          company_name: supplierData.company_name!,
          contact_person: supplierData.contact_person!,
          business_type: supplierData.business_type!,
          years_in_business: supplierData.years_in_business!,
          annual_turnover: supplierData.annual_turnover!,
          employee_count: supplierData.employee_count!,
          product_categories: supplierData.product_categories || [],
          certifications: supplierData.certifications || [],
          export_countries: supplierData.export_countries || [],
          production_capacity: supplierData.production_capacity || '',
          minimum_order_quantity: supplierData.minimum_order_quantity || '',
          quality_standards: supplierData.quality_standards || '',
          gst_number: supplierData.gst_number || '',
          iec_code: supplierData.iec_code || '',
          rating: supplierData.rating || 0,
          total_orders: supplierData.total_orders || 0,
          verified: supplierData.verified || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        suppliers.push(newSupplier);
        this.saveToStorage('suppliers', suppliers);
        return newSupplier;
      }
    } catch (error) {
      console.error('Error creating supplier profile:', error);
      return null;
    }
  }

  async getSuppliers(): Promise<Supplier[]> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('suppliers')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching suppliers:', error);
          return mockSuppliers;
        }
        return data || mockSuppliers;
      } else {
        const suppliers = this.getFromStorage<Supplier>('suppliers');
        return suppliers.length > 0 ? suppliers : mockSuppliers;
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return mockSuppliers;
    }
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const suppliers = this.getFromStorage<Supplier>('suppliers');
        const allSuppliers = suppliers.length > 0 ? suppliers : mockSuppliers;
        return allSuppliers.find(supplier => supplier.id === id) || null;
      }
    } catch (error) {
      console.error('Error fetching supplier by ID:', error);
      return null;
    }
  }

  async updateSupplierProfile(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const suppliers = this.getFromStorage<Supplier>('suppliers');
        const supplierIndex = suppliers.findIndex(supplier => supplier.id === id);
        if (supplierIndex !== -1) {
          suppliers[supplierIndex] = { ...suppliers[supplierIndex], ...updates, updated_at: new Date().toISOString() };
          this.saveToStorage('suppliers', suppliers);
          return suppliers[supplierIndex];
        }
        return null;
      }
    } catch (error) {
      console.error('Error updating supplier profile:', error);
      return null;
    }
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        // Mock analytics data
        return {
          total_users: 1250,
          total_buyers: 890,
          total_suppliers: 360,
          total_rfqs: 456,
          total_quotations: 1234,
          total_orders: 234,
          total_gmv: 5600000,
          monthly_gmv: 890000,
          avg_order_value: 23900,
          success_rate: 78.5,
          top_categories: [
            { category: 'Textiles & Apparel', count: 156 },
            { category: 'Spices & Food Products', count: 89 },
            { category: 'Electronics & Components', count: 67 },
            { category: 'Handicrafts & Home Decor', count: 45 },
            { category: 'Agricultural Products', count: 34 }
          ],
          top_countries: [
            { country: 'United States', count: 234 },
            { country: 'United Kingdom', count: 156 },
            { country: 'Germany', count: 123 },
            { country: 'Canada', count: 89 },
            { country: 'Australia', count: 67 }
          ]
        };
      }
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
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const rfqs = this.getFromStorage<RFQ>('rfqs');
        return rfqs.filter(rfq => {
          const matchesQuery = !query || 
            rfq.title.toLowerCase().includes(query.toLowerCase()) ||
            rfq.description.toLowerCase().includes(query.toLowerCase()) ||
            rfq.category.toLowerCase().includes(query.toLowerCase());
          
          const matchesCategory = !filters?.category || rfq.category === filters.category;
          const matchesStatus = !filters?.status || rfq.status === filters.status;
          
          return matchesQuery && matchesCategory && matchesStatus;
        });
      }
    } catch (error) {
      console.error('Error searching RFQs:', error);
      return [];
    }
  }

  // Notification System
  async createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const notifications = this.getFromStorage('notifications');
        const newNotification = {
          id: this.generateId(),
          user_id: userId,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
        };
        notifications.push(newNotification);
        this.saveToStorage('notifications', notifications);
        return newNotification;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string) {
    try {
      if (isSupabaseConfigured && supabase) {
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
      } else {
        const notifications = this.getFromStorage('notifications');
        return notifications.filter((n: any) => n.user_id === userId);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}

export const db = DatabaseService.getInstance();