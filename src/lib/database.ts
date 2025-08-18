// Centralized mock database with persistence for all application data
import type { RFQ, SupplierQuotation, Order, Category, UserProfile } from './queries';

interface MockSupplier {
  id: string;
  product_categories: string[];
  certifications: string[];
  years_in_business: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  profiles?: UserProfile;
}

class Database {
  private mockRFQs: RFQ[] = [];
  private mockQuotations: SupplierQuotation[] = [];
  private mockOrders: Order[] = [];
  private mockSuppliers: MockSupplier[] = [];
  private mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Textiles & Apparel',
      description: 'Clothing, fabrics, and textile products',
      requirements: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cat-2',
      name: 'Spices & Food Products',
      description: 'Spices, food items, and agricultural products',
      requirements: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cat-3',
      name: 'Handicrafts & Home Decor',
      description: 'Handmade crafts and decorative items',
      requirements: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cat-4',
      name: 'Electronics & Components',
      description: 'Electronic devices and components',
      requirements: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cat-5',
      name: 'Pharmaceuticals & Healthcare',
      description: 'Medical and pharmaceutical products',
      requirements: {},
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  private loadFromStorage() {
    try {
      const rfqs = localStorage.getItem('db_rfqs');
      const quotations = localStorage.getItem('db_quotations');
      const orders = localStorage.getItem('db_orders');
      const suppliers = localStorage.getItem('db_suppliers');

      if (rfqs) this.mockRFQs = JSON.parse(rfqs);
      if (quotations) this.mockQuotations = JSON.parse(quotations);
      if (orders) this.mockOrders = JSON.parse(orders);
      if (suppliers) this.mockSuppliers = JSON.parse(suppliers);
    } catch (error) {
      console.error('Error loading database from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('db_rfqs', JSON.stringify(this.mockRFQs));
      localStorage.setItem('db_quotations', JSON.stringify(this.mockQuotations));
      localStorage.setItem('db_orders', JSON.stringify(this.mockOrders));
      localStorage.setItem('db_suppliers', JSON.stringify(this.mockSuppliers));
    } catch (error) {
      console.error('Error saving database to storage:', error);
    }
  }

  private initializeDefaultData() {
    // Initialize with sample data if empty
    if (this.mockRFQs.length === 0) {
      this.mockRFQs = [
        {
          id: 'rfq-sample-1',
          buyer_id: 'buyer-sample',
          title: 'Sample Cotton T-Shirts',
          category: 'Textiles & Apparel',
          description: 'High quality cotton t-shirts for export',
          quantity: 1000,
          unit: 'pieces',
          target_price: 12.50,
          max_price: 15.00,
          delivery_timeline: '30 days',
          shipping_terms: 'FOB Mumbai',
          quality_standards: 'ISO 9001',
          certifications_needed: 'GOTS',
          additional_requirements: 'Organic cotton preferred',
          open_for_bidding: true,
          status: 'approved',
          created_at: '2024-01-15T10:00:00Z',
          approved_at: '2024-01-16T10:00:00Z',
          approved_by: 'admin-1',
          expires_at: '2024-02-15T10:00:00Z'
        }
      ];
    }

    if (this.mockSuppliers.length === 0) {
      this.mockSuppliers = [
        {
          id: 'supplier-sample-1',
          product_categories: ['Textiles & Apparel'],
          certifications: ['ISO 9001', 'GOTS'],
          years_in_business: 15,
          verification_status: 'verified',
          created_at: '2024-01-01T00:00:00Z',
          profiles: {
            id: 'supplier-sample-1',
            user_type: 'supplier',
            full_name: 'Sample Supplier',
            company_name: 'Sample Textiles Ltd',
            phone: '+91-9876543210',
            country: 'India',
            website: 'https://sampletextiles.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      ];
    }

    this.saveToStorage();
  }

  // RFQ Methods
  getRFQs(): RFQ[] {
    return [...this.mockRFQs];
  }

  getRFQById(id: string): RFQ | null {
    return this.mockRFQs.find(rfq => rfq.id === id) || null;
  }

  createRFQ(rfqData: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>): RFQ {
    const newRFQ: RFQ = {
      ...rfqData,
      id: 'rfq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockRFQs.push(newRFQ);
    this.saveToStorage();
    return newRFQ;
  }

  updateRFQ(rfqId: string, updates: Partial<RFQ>): RFQ | null {
    const index = this.mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (index === -1) return null;

    this.mockRFQs[index] = {
      ...this.mockRFQs[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    return this.mockRFQs[index];
  }

  deleteRFQ(rfqId: string): boolean {
    const index = this.mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (index === -1) return false;

    this.mockRFQs.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Quotation Methods
  getQuotations(): SupplierQuotation[] {
    return [...this.mockQuotations];
  }

  createQuotation(quotationData: Omit<SupplierQuotation, 'id' | 'submitted_at'>): SupplierQuotation {
    const newQuotation: SupplierQuotation = {
      ...quotationData,
      id: 'quote-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      submitted_at: new Date().toISOString()
    };

    this.mockQuotations.push(newQuotation);
    this.saveToStorage();
    return newQuotation;
  }

  updateQuotation(quotationId: string, updates: Partial<SupplierQuotation>): SupplierQuotation | null {
    const index = this.mockQuotations.findIndex(q => q.id === quotationId);
    if (index === -1) return null;

    this.mockQuotations[index] = {
      ...this.mockQuotations[index],
      ...updates
    };

    this.saveToStorage();
    return this.mockQuotations[index];
  }

  // Order Methods
  getOrders(): Order[] {
    return [...this.mockOrders];
  }

  createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.mockOrders.push(newOrder);
    this.saveToStorage();
    return newOrder;
  }

  updateOrder(orderId: string, updates: Partial<Order>): Order | null {
    const index = this.mockOrders.findIndex(order => order.id === orderId);
    if (index === -1) return null;

    this.mockOrders[index] = {
      ...this.mockOrders[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    return this.mockOrders[index];
  }

  // Supplier Methods
  getSuppliers(): MockSupplier[] {
    return [...this.mockSuppliers];
  }

  createSupplier(supplierData: Omit<MockSupplier, 'id' | 'created_at'>): MockSupplier {
    const newSupplier: MockSupplier = {
      ...supplierData,
      id: 'supplier-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };

    this.mockSuppliers.push(newSupplier);
    this.saveToStorage();
    return newSupplier;
  }

  // Category Methods
  getCategories(): Category[] {
    return [...this.mockCategories];
  }

  // Analytics Methods
  getAnalytics() {
    const totalOrders = this.mockOrders.length;
    const totalGMV = this.mockOrders.reduce((sum, order) => sum + (order.total_value || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalGMV / totalOrders : 0;
    const successRate = this.mockRFQs.length > 0 ? (totalOrders / this.mockRFQs.length) * 100 : 0;

    // Calculate category distribution
    const categoryCount: { [key: string]: number } = {};
    this.mockRFQs.forEach(rfq => {
      categoryCount[rfq.category] = (categoryCount[rfq.category] || 0) + 1;
    });

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topCountries = [
      { country: 'United States', count: 45 },
      { country: 'United Kingdom', count: 32 },
      { country: 'Germany', count: 28 },
      { country: 'Canada', count: 22 },
      { country: 'Australia', count: 18 }
    ];

    return {
      totalUsers: 150,
      totalBuyers: 85,
      totalSuppliers: this.mockSuppliers.length,
      totalRFQs: this.mockRFQs.length,
      totalQuotations: this.mockQuotations.length,
      totalOrders: totalOrders,
      totalGMV,
      monthlyGMV: totalGMV * 0.3,
      avgOrderValue,
      successRate,
      topCategories,
      topCountries
    };
  }
}

export const db = new Database();