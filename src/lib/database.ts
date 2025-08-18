// Mock database for analytics and performance data
import type { RFQ, SupplierQuotation, Order, Category } from './queries';

interface MockDatabase {
  getAnalytics(): {
    totalUsers: number;
    totalBuyers: number;
    totalSuppliers: number;
    totalRFQs: number;
    totalQuotations: number;
    totalOrders: number;
    totalGMV: number;
    monthlyGMV: number;
    avgOrderValue: number;
    successRate: number;
    topCategories: Array<{ category: string; count: number }>;
    topCountries: Array<{ country: string; count: number }>;
  };
  getRFQs(): RFQ[];
  getQuotations(): SupplierQuotation[];
  getOrders(): Order[];
  getRFQById(id: string): RFQ | null;
  getCategories(): Category[];
}

class Database implements MockDatabase {
  private mockRFQs: RFQ[] = [
    {
      id: 'rfq-1',
      buyer_id: 'buyer-1',
      title: 'Cotton T-Shirts Export Quality',
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
    },
    {
      id: 'rfq-2',
      buyer_id: 'buyer-2',
      title: 'Organic Turmeric Powder',
      category: 'Spices & Food Products',
      description: 'Premium organic turmeric powder',
      quantity: 500,
      unit: 'kg',
      target_price: 8.75,
      max_price: 10.00,
      delivery_timeline: '21 days',
      shipping_terms: 'CIF destination',
      quality_standards: 'HACCP',
      certifications_needed: 'Organic',
      additional_requirements: 'Lab test reports required',
      open_for_bidding: true,
      status: 'matched',
      created_at: '2024-01-12T14:30:00Z',
      approved_at: '2024-01-13T14:30:00Z',
      approved_by: 'admin-1',
      expires_at: '2024-02-12T14:30:00Z'
    }
  ];

  private mockQuotations: SupplierQuotation[] = [
    {
      id: 'quote-1',
      rfq_id: 'rfq-1',
      supplier_id: 'supplier-1',
      price_per_unit: 12.50,
      moq: 500,
      lead_time_days: 21,
      payment_terms: '30% advance, 70% on shipment',
      shipping_terms: 'FOB Mumbai',
      validity_days: 15,
      quality_guarantee: true,
      sample_available: true,
      notes: 'Premium quality cotton with GOTS certification',
      attachments: [],
      status: 'approved_for_buyer',
      submitted_at: '2024-01-15T10:00:00Z',
      reviewed_at: '2024-01-16T10:00:00Z',
      reviewed_by: 'admin-1'
    },
    {
      id: 'quote-2',
      rfq_id: 'rfq-2',
      supplier_id: 'supplier-2',
      price_per_unit: 8.75,
      moq: 100,
      lead_time_days: 14,
      payment_terms: 'LC at sight',
      shipping_terms: 'CIF destination port',
      validity_days: 30,
      quality_guarantee: true,
      sample_available: true,
      notes: 'Organic certified with lab test reports',
      attachments: [],
      status: 'approved_for_buyer',
      submitted_at: '2024-01-12T14:30:00Z',
      reviewed_at: '2024-01-13T14:30:00Z',
      reviewed_by: 'admin-1'
    }
  ];

  private mockOrders: Order[] = [
    {
      id: 'order-1',
      rfq_id: 'rfq-1',
      quotation_id: 'quote-1',
      buyer_id: 'buyer-1',
      supplier_id: 'supplier-1',
      quantity: 1000,
      unit_price: 12.50,
      total_value: 12500,
      payment_terms: '30% advance, 70% on shipment',
      delivery_terms: 'FOB Mumbai',
      status: 'in_production',
      created_at: '2024-01-17T10:00:00Z',
      expected_delivery: '2024-02-17T10:00:00Z',
      tracking_info: 'IN-PROD-2024-001'
    },
    {
      id: 'order-2',
      rfq_id: 'rfq-2',
      quotation_id: 'quote-2',
      buyer_id: 'buyer-2',
      supplier_id: 'supplier-2',
      quantity: 500,
      unit_price: 8.75,
      total_value: 4375,
      payment_terms: 'LC at sight',
      delivery_terms: 'CIF destination port',
      status: 'completed',
      created_at: '2024-01-14T14:30:00Z',
      expected_delivery: '2024-02-14T14:30:00Z',
      tracking_info: 'DELIVERED'
    }
  ];

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
    }
  ];

  getAnalytics() {
    const totalOrders = this.mockOrders.length;
    const totalGMV = this.mockOrders.reduce((sum, order) => sum + order.total_value, 0);
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
      totalSuppliers: 60,
      totalRFQs: this.mockRFQs.length,
      totalQuotations: this.mockQuotations.length,
      totalOrders: totalOrders,
      totalGMV,
      monthlyGMV: totalGMV * 0.3, // Assume 30% is from current month
      avgOrderValue,
      successRate,
      topCategories,
      topCountries
    };
  }

  getRFQs(): RFQ[] {
    return this.mockRFQs;
  }

  getQuotations(): SupplierQuotation[] {
    return this.mockQuotations;
  }

  getOrders(): Order[] {
    return this.mockOrders;
  }

  getRFQById(id: string): RFQ | null {
    return this.mockRFQs.find(rfq => rfq.id === id) || null;
  }

  getCategories(): Category[] {
    return this.mockCategories;
  }
}

export const db = new Database();