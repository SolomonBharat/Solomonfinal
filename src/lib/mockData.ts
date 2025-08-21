// Simple mock data for frontend-only version
export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country: string;
  phone?: string;
  user_type: 'buyer' | 'supplier' | 'admin';
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
  quotations_count: number;
}

export interface Quotation {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_company: string;
  supplier_location: string;
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
  total_value: number;
}

// Demo users
export const demoUsers: User[] = [
  {
    id: 'buyer-1',
    email: 'buyer@example.com',
    name: 'John Smith',
    company: 'Global Trade Corp',
    country: 'United States',
    phone: '+1 555 123 4567',
    user_type: 'buyer'
  },
  {
    id: 'supplier-1',
    email: 'supplier@example.com',
    name: 'Rajesh Kumar',
    company: 'Global Textiles Pvt Ltd',
    country: 'India',
    phone: '+91 98765 43210',
    user_type: 'supplier'
  },
  {
    id: 'admin-1',
    email: 'admin@solomonbharat.com',
    name: 'Admin User',
    company: 'Solomon Bharat',
    country: 'India',
    phone: '+91 98765 00000',
    user_type: 'admin'
  }
];

// Demo credentials
export const demoCredentials = [
  { email: 'buyer@example.com', password: 'buyer123', user_type: 'buyer' },
  { email: 'supplier@example.com', password: 'supplier123', user_type: 'supplier' },
  { email: 'admin@solomonbharat.com', password: 'admin123', user_type: 'admin' }
];

// Simple storage functions
export const storage = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(`solomon_${key}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  
  set: (key: string, data: any) => {
    try {
      localStorage.setItem(`solomon_${key}`, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },
  
  generateId: () => Math.random().toString(36).substr(2, 9)
};