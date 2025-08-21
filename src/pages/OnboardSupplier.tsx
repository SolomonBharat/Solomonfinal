import React, { useState } from 'react';
import { Building2, User, Mail, Phone, MapPin, FileText, Award, Globe, Package, DollarSign, Users, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import FileUpload from '../components/FileUpload';

// Enhanced Database Layer with proper data management
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

// Supplier Onboarding Component
const OnboardSupplier: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [supplierCredentials, setSupplierCredentials] = useState<{email: string, password: string} | null>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    contactPerson: '',
    email: '',
    phone: '',
    companyName: '',
    businessType: '',
    country: '',
    
    // Business Details
    yearsInBusiness: '',
    annualTurnover: '',
    employeeCount: '',
    gstNumber: '',
    iecCode: '',
    
    // Product & Services
    productCategories: [] as string[],
    certifications: [] as string[],
    exportCountries: [] as string[],
    productionCapacity: '',
    minimumOrderQuantity: '',
    qualityStandards: '',
    
    // Factory Information
    factoryVideo: null as File | null,
    factoryImages: [] as File[],
    factoryDescription: ''
  });

  const businessTypes = [
    'Manufacturer',
    'Exporter',
    'Trader',
    'Service Provider',
    'Distributor',
    'Wholesaler'
  ];

  const countries = [
    'India', 'China', 'USA', 'Germany', 'Japan', 'South Korea', 'Italy', 'France', 'UK', 'Canada',
    'Australia', 'Brazil', 'Mexico', 'Turkey', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia',
    'Singapore', 'UAE', 'Saudi Arabia', 'Egypt', 'South Africa', 'Nigeria', 'Kenya'
  ];

  const productCategoryOptions = [
    'Electronics & Electrical',
    'Textiles & Apparel',
    'Machinery & Equipment',
    'Automotive Parts',
    'Chemicals & Pharmaceuticals',
    'Food & Beverages',
    'Home & Garden',
    'Sports & Recreation',
    'Health & Beauty',
    'Industrial Supplies',
    'Construction Materials',
    'Agriculture & Farming',
    'Packaging Materials',
    'Furniture & Furnishing',
    'Toys & Games'
  ];

  const certificationOptions = [
    'ISO 9001',
    'ISO 14001',
    'ISO 45001',
    'CE Marking',
    'FDA Approved',
    'GMP Certified',
    'HACCP',
    'Organic Certified',
    'Fair Trade',
    'BSCI Audit',
    'Sedex Audit',
    'WRAP Certified'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.contactPerson && formData.email && formData.phone && formData.companyName && formData.businessType && formData.country);
      case 2:
        return !!(formData.yearsInBusiness && formData.annualTurnover && formData.employeeCount);
      case 3:
        return formData.productCategories.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create supplier account
      const supplierData = {
        id: `supplier_${Date.now()}`,
        user_id: `user_${Date.now()}`,
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        business_type: formData.businessType,
        years_in_business: parseInt(formData.yearsInBusiness),
        annual_turnover: formData.annualTurnover,
        employee_count: formData.employeeCount,
        product_categories: formData.productCategories,
        certifications: formData.certifications,
        export_countries: formData.exportCountries,
        production_capacity: formData.productionCapacity,
        minimum_order_quantity: formData.minimumOrderQuantity,
        quality_standards: formData.qualityStandards,
        gst_number: formData.gstNumber,
        iec_code: formData.iecCode,
        factory_video: formData.factoryVideo?.name || null,
        factory_images: formData.factoryImages.map(f => f.name) || [],
        factory_description: formData.factoryDescription,
        factory_video: formData.factoryVideo?.name || null,
        factory_images: formData.factoryImages.map(f => f.name) || [],
        factory_description: formData.factoryDescription,
        rating: 0,
        total_orders: 0,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to onboarded suppliers
      const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
      onboardedSuppliers.push({
        ...supplierData,
        email: formData.email,
        phone: formData.phone,
        country: formData.country
      });
      localStorage.setItem('onboarded_suppliers', JSON.stringify(onboardedSuppliers));

      // Create login account
      const loginAccount = {
        email: formData.email,
        password: 'supplier123',
        user_type: 'supplier',
        name: formData.contactPerson,
        company: formData.companyName,
        country: formData.country,
        phone: formData.phone,
        profile_completed: true,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        supplier_data: supplierData
      };

      const supplierAccounts = JSON.parse(localStorage.getItem('supplier_accounts') || '[]');
      supplierAccounts.push(loginAccount);
      localStorage.setItem('supplier_accounts', JSON.stringify(supplierAccounts));

      // Set credentials for display
      setSupplierCredentials({
        email: formData.email,
        password: 'supplier123'
      });

      setShowSuccess(true);
    } catch (error) {
      console.error('Error onboarding supplier:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setShowSuccess(false);
    setSupplierCredentials(null);
    setFormData({
      contactPerson: '',
      email: '',
      phone: '',
      companyName: '',
      businessType: '',
      country: '',
      yearsInBusiness: '',
      annualTurnover: '',
      employeeCount: '',
      gstNumber: '',
      iecCode: '',
      productCategories: [],
      certifications: [],
      exportCountries: [],
      productionCapacity: '',
      minimumOrderQuantity: '',
      qualityStandards: '',
      factoryVideo: null,
      factoryImages: [],
      factoryDescription: ''
    });
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supplier Onboarded Successfully!
          </h2>
          
          <p className="text-gray-600 mb-6">
            {formData.companyName} has been successfully onboarded to our platform.
          </p>

          {supplierCredentials && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Login Credentials:</h3>
              <div className="text-sm text-blue-800">
                <p><strong>Email:</strong> {supplierCredentials.email}</p>
                <p><strong>Password:</strong> {supplierCredentials.password}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Onboard Another Supplier
            </button>
            
            <button
              onClick={() => window.location.href = '/admin'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Onboarding</h1>
          <p className="text-gray-600">Complete the registration process to join our platform</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-indigo-600" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
                Business Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    value={formData.yearsInBusiness}
                    onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter years in business"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Turnover *
                  </label>
                  <select
                    value={formData.annualTurnover}
                    onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select annual turnover</option>
                    <option value="Under $100K">Under $100K</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                    <option value="Above $10M">Above $10M</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Count *
                  </label>
                  <select
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select employee count</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-100">51-100</option>
                    <option value="101-500">101-500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IEC Code
                  </label>
                  <input
                    type="text"
                    value={formData.iecCode}
                    onChange={(e) => handleInputChange('iecCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter IEC code"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-indigo-600" />
                Products & Services
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Categories * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productCategoryOptions.map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.productCategories.includes(category)}
                          onChange={(e) => handleArrayChange('productCategories', category, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Certifications (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {certificationOptions.map(cert => (
                      <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.certifications.includes(cert)}
                          onChange={(e) => handleArrayChange('certifications', cert, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Export Countries (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                    {countries.map(country => (
                      <label key={country} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.exportCountries.includes(country)}
                          onChange={(e) => handleArrayChange('exportCountries', country, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Production Capacity
                    </label>
                    <input
                      type="text"
                      value={formData.productionCapacity}
                      onChange={(e) => handleInputChange('productionCapacity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 10,000 units/month"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="text"
                      value={formData.minimumOrderQuantity}
                      onChange={(e) => handleInputChange('minimumOrderQuantity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 100 units"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Standards
                  </label>
                  <textarea
                    value={formData.qualityStandards}
                    onChange={(e) => handleInputChange('qualityStandards', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe your quality standards and processes"
                  />
                </div>

                {/* Factory Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Factory Description
                  </label>
                  <textarea
                    value={formData.factoryDescription}
                    onChange={(e) => handleInputChange('factoryDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe your factory, production processes, and facilities"
                  />
                </div>

                <div>
                  <FileUpload
                    label="Factory Video"
                    description="Upload a video showcasing your factory and production capabilities"
                    acceptedTypes="video/*"
                    maxFiles={1}
                    maxSize={100}
                    multiple={false}
                    onFileSelect={(files) => handleInputChange('factoryVideo', files[0] || null)}
                  />
                </div>

                <div>
                  <FileUpload
                    label="Factory Images"
                    description="Upload images of your factory, equipment, and production areas"
                    acceptedTypes="image/*"
                    maxFiles={10}
                    maxSize={10}
                    multiple={true}
                    onFileSelect={(files) => handleInputChange('factoryImages', files)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardSupplier;