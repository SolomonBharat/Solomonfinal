import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Enhanced Database Layer with proper data management
export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country: string;
  phone?: string;
  website?: string;
  user_type: 'buyer' | 'supplier' | 'admin';
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  password?: string;
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
  user_id: string;
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

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  attachments?: string[];
  read: boolean;
  created_at: string;
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

// Database Service Class
export class DatabaseService {
  private static instance: DatabaseService;
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User Management
  async createUser(userData: Partial<User>): Promise<User> {
    const user: User = {
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completed: false,
      verification_status: 'pending',
      ...userData
    } as User;

    const users = this.getUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return user;
  }

  getUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }
    return null;
  }

  // RFQ Management
  createRFQ(rfqData: Partial<RFQ>): RFQ {
    const rfq: RFQ = {
      id: `rfq_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      matched_suppliers: [],
      quotations_count: 0,
      status: 'pending_approval',
      ...rfqData
    } as RFQ;

    const rfqs = this.getRFQs();
    rfqs.push(rfq);
    localStorage.setItem('rfqs', JSON.stringify(rfqs));
    return rfq;
  }

  getRFQs(): RFQ[] {
    return JSON.parse(localStorage.getItem('rfqs') || '[]');
  }

  getRFQById(id: string): RFQ | null {
    const rfqs = this.getRFQs();
    return rfqs.find(rfq => rfq.id === id) || null;
  }

  updateRFQ(id: string, updates: Partial<RFQ>): RFQ | null {
    const rfqs = this.getRFQs();
    const index = rfqs.findIndex(rfq => rfq.id === id);
    if (index !== -1) {
      rfqs[index] = { ...rfqs[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('rfqs', JSON.stringify(rfqs));
      return rfqs[index];
    }
    return null;
  }

  // Quotation Management
  createQuotation(quotationData: Partial<Quotation>): Quotation {
    const quotation: Quotation = {
      id: `quote_${Date.now()}`,
      submitted_at: new Date().toISOString(),
      status: 'pending_review',
      ...quotationData
    } as Quotation;

    const quotations = this.getQuotations();
    quotations.push(quotation);
    localStorage.setItem('quotations', JSON.stringify(quotations));
    return quotation;
  }

  getQuotations(): Quotation[] {
    return JSON.parse(localStorage.getItem('quotations') || '[]');
  }

  updateQuotation(id: string, updates: Partial<Quotation>): Quotation | null {
    const quotations = this.getQuotations();
    const index = quotations.findIndex(q => q.id === id);
    if (index !== -1) {
      quotations[index] = { ...quotations[index], ...updates };
      if (updates.status) {
        quotations[index].reviewed_at = new Date().toISOString();
      }
      localStorage.setItem('quotations', JSON.stringify(quotations));
      return quotations[index];
    }
    return null;
  }

  // Order Management
  createOrder(orderData: Partial<Order>): Order {
    const order: Order = {
      id: `order_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'confirmed',
      ...orderData
    } as Order;

    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    return order;
  }

  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }

  updateOrder(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem('orders', JSON.stringify(orders));
      return orders[index];
    }
    return null;
  }

  // Analytics
  getAnalytics(): Analytics {
    const users = this.getUsers();
    const rfqs = this.getRFQs();
    const quotations = this.getQuotations();
    const orders = this.getOrders();

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
  }

  // Search and Filter
  searchRFQs(query: string, filters?: { category?: string; status?: string }): RFQ[] {
    let rfqs = this.getRFQs();
    
    if (query) {
      rfqs = rfqs.filter(rfq => 
        rfq.title.toLowerCase().includes(query.toLowerCase()) ||
        rfq.description.toLowerCase().includes(query.toLowerCase()) ||
        rfq.category.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.category) {
      rfqs = rfqs.filter(rfq => rfq.category === filters.category);
    }

    if (filters?.status) {
      rfqs = rfqs.filter(rfq => rfq.status === filters.status);
    }

    return rfqs;
  }

  // Notification System
  createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = {
      id: `notif_${Date.now()}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    };
    notifications.push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    return notification;
  }

  getUserNotifications(userId: string) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    return notifications.filter((n: any) => n.user_id === userId).sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}

export const db = DatabaseService.getInstance();

// Authentication Context
interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'supplier' | 'admin' | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<User>;
  updateUserVerification: (userId: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'buyer' | 'supplier' | 'admin' | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserType(userData.user_type);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      // Check registered buyers first
      const registeredBuyers = JSON.parse(localStorage.getItem('registered_buyers') || '[]');
      const buyer = registeredBuyers.find((b: any) => b.email === email && b.password === password);
      
      if (buyer) {
        const userAccount: User = {
          id: buyer.id || `buyer_${Date.now()}`,
          email: buyer.email,
          name: buyer.company, // Use company name as primary display name
          company: buyer.company,
          country: buyer.country,
          phone: buyer.phone,
          user_type: 'buyer',
          created_at: buyer.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_completed: true,
          verification_status: 'verified'
        };
        
        setUser(userAccount);
        setUserType(userAccount.user_type);
        localStorage.setItem('currentUser', JSON.stringify(userAccount));
        setLoading(false);
        return { success: true };
      }

      // Check onboarded suppliers
      const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
      const supplier = onboardedSuppliers.find((s: any) => s.email === email && password === 'supplier123');
      
      if (supplier) {
        const userAccount: User = {
          id: supplier.id || `supplier_${Date.now()}`,
          email: supplier.email,
          name: supplier.contactPerson,
          company: supplier.companyName,
          country: supplier.country,
          phone: supplier.phone,
          user_type: 'supplier',
          created_at: supplier.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_completed: true,
          verification_status: 'verified'
        };
        
        setUser(userAccount);
        setUserType(userAccount.user_type);
        localStorage.setItem('currentUser', JSON.stringify(userAccount));
        setLoading(false);
        return { success: true };
      }

      // Check default accounts
      const defaultAccounts = [
        { email: 'admin@solomonbharat.com', password: 'admin123', user_type: 'admin', name: 'Admin User', company: 'Solomon Bharat', country: 'India' },
        { email: 'buyer@example.com', password: 'buyer123', user_type: 'buyer', name: 'John Smith', company: 'Global Trade Corp', country: 'United States' },
        { email: 'supplier@example.com', password: 'supplier123', user_type: 'supplier', name: 'Rajesh Kumar', company: 'Global Textiles Pvt Ltd', country: 'India' }
      ];

      const defaultAccount = defaultAccounts.find(acc => acc.email === email && acc.password === password);
      
      if (defaultAccount) {
        const userAccount: User = {
          id: `${defaultAccount.user_type}_${Date.now()}`,
          email: defaultAccount.email,
          name: defaultAccount.name,
          company: defaultAccount.company,
          country: defaultAccount.country,
          user_type: defaultAccount.user_type as 'buyer' | 'supplier' | 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_completed: true,
          verification_status: 'verified'
        };
        
        setUser(userAccount);
        setUserType(userAccount.user_type);
        localStorage.setItem('currentUser', JSON.stringify(userAccount));
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<User> => {
    const newUser: User = {
      id: `buyer_${Date.now()}`,
      email: userData.email!,
      name: userData.company!, // Use company name as primary display name
      company: userData.company!,
      country: userData.country!,
      phone: userData.phone,
      website: userData.website,
      user_type: 'buyer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completed: true,
      verification_status: 'pending'
    };

    // Save to registered buyers with password
    const registeredBuyers = JSON.parse(localStorage.getItem('registered_buyers') || '[]');
    registeredBuyers.push({
      ...newUser,
      password: userData.password
    });
    localStorage.setItem('registered_buyers', JSON.stringify(registeredBuyers));

    return newUser;
  };

  const updateUserVerification = (userId: string) => {
    // Mark user as verified after first approved RFQ
    const registeredBuyers = JSON.parse(localStorage.getItem('registered_buyers') || '[]');
    const updatedBuyers = registeredBuyers.map((buyer: any) => 
      buyer.id === userId ? { ...buyer, verification_status: 'verified' } : buyer
    );
    localStorage.setItem('registered_buyers', JSON.stringify(updatedBuyers));
    
    if (user && user.id === userId) {
      const updatedUser = { ...user, verification_status: 'verified' as const };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('currentUser');
  };

  const value: AuthContextType = {
    user,
    userType,
    login,
    logout,
    register,
    updateUserVerification,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};