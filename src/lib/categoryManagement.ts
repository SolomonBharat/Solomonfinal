// Category Management System
export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  active: boolean;
  requirements: {
    min_certifications: string[];
    required_documents: string[];
    min_experience_years: number;
    min_annual_turnover: string;
  };
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface SupplierCategoryMapping {
  supplier_id: string;
  category_id: string;
  approved_by: string;
  approved_at: string;
  verification_documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export class CategoryManagementService {
  private static instance: CategoryManagementService;
  
  static getInstance(): CategoryManagementService {
    if (!CategoryManagementService.instance) {
      CategoryManagementService.instance = new CategoryManagementService();
    }
    return CategoryManagementService.instance;
  }

  // Get all configured categories
  getConfiguredCategories(): CategoryConfig[] {
    return JSON.parse(localStorage.getItem('configured_categories') || '[]');
  }

  // Get active categories only
  getActiveCategories(): CategoryConfig[] {
    return this.getConfiguredCategories().filter(cat => cat.active);
  }

  // Create new category configuration
  createCategoryConfig(categoryData: Omit<CategoryConfig, 'id' | 'created_at' | 'updated_at'>): CategoryConfig {
    const category: CategoryConfig = {
      id: `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...categoryData
    };

    const categories = this.getConfiguredCategories();
    categories.push(category);
    localStorage.setItem('configured_categories', JSON.stringify(categories));
    return category;
  }

  // Validate if supplier meets category requirements
  validateSupplierForCategory(supplierData: any, categoryId: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const category = this.getConfiguredCategories().find(cat => cat.id === categoryId);
    if (!category) {
      return { valid: false, errors: ['Category not found'], warnings: [] };
    }

    if (!category.active) {
      return { valid: false, errors: ['Category is not active for onboarding'], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check minimum experience
    const yearsInBusiness = parseInt(supplierData.yearsInBusiness || supplierData.years_in_business || '0');
    if (yearsInBusiness < category.requirements.min_experience_years) {
      errors.push(`Minimum ${category.requirements.min_experience_years} years experience required`);
    }

    // Check required certifications
    const supplierCerts = supplierData.certifications || [];
    const missingCerts = category.requirements.min_certifications.filter(
      cert => !supplierCerts.includes(cert)
    );
    if (missingCerts.length > 0) {
      warnings.push(`Recommended certifications missing: ${missingCerts.join(', ')}`);
    }

    // Check annual turnover
    const turnover = supplierData.annualTurnover || supplierData.annual_turnover;
    if (!this.validateTurnover(turnover, category.requirements.min_annual_turnover)) {
      warnings.push(`Minimum annual turnover of ${category.requirements.min_annual_turnover} recommended`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateTurnover(supplierTurnover: string, requiredTurnover: string): boolean {
    const turnoverValues = {
      'Under $100K': 50000,
      '$100K - $500K': 300000,
      '$500K - $1M': 750000,
      '$1M - $5M': 3000000,
      '$5M - $10M': 7500000,
      'Above $10M': 15000000
    };

    const supplierValue = turnoverValues[supplierTurnover as keyof typeof turnoverValues] || 0;
    const requiredValue = turnoverValues[requiredTurnover as keyof typeof turnoverValues] || 0;

    return supplierValue >= requiredValue;
  }

  // Get supplier category mappings
  getSupplierCategoryMappings(supplierId: string): SupplierCategoryMapping[] {
    const mappings = JSON.parse(localStorage.getItem('supplier_category_mappings') || '[]');
    return mappings.filter((mapping: SupplierCategoryMapping) => mapping.supplier_id === supplierId);
  }

  // Create supplier category mapping
  createSupplierCategoryMapping(mapping: Omit<SupplierCategoryMapping, 'approved_at'>): SupplierCategoryMapping {
    const newMapping: SupplierCategoryMapping = {
      ...mapping,
      approved_at: new Date().toISOString()
    };

    const mappings = JSON.parse(localStorage.getItem('supplier_category_mappings') || '[]');
    mappings.push(newMapping);
    localStorage.setItem('supplier_category_mappings', JSON.stringify(mappings));
    return newMapping;
  }

  // Initialize default categories if none exist
  initializeDefaultCategories(adminId: string): void {
    const existingCategories = this.getConfiguredCategories();
    if (existingCategories.length > 0) return;

    const defaultCategories = [
      {
        name: 'Textiles & Apparel',
        description: 'Clothing, fabrics, and textile products',
        active: true,
        requirements: {
          min_certifications: ['ISO 9001'],
          required_documents: ['GST Certificate', 'IEC Code'],
          min_experience_years: 3,
          min_annual_turnover: '$500K - $1M'
        },
        created_by: adminId
      },
      {
        name: 'Spices & Food Products',
        description: 'Food products, spices, and agricultural items',
        active: true,
        requirements: {
          min_certifications: ['FSSAI', 'HACCP'],
          required_documents: ['FSSAI License', 'Export License'],
          min_experience_years: 2,
          min_annual_turnover: '$100K - $500K'
        },
        created_by: adminId
      },
      {
        name: 'Electronics & Components',
        description: 'Electronic devices and components',
        active: true,
        requirements: {
          min_certifications: ['CE', 'ISO 9001'],
          required_documents: ['CE Certificate', 'Test Reports'],
          min_experience_years: 5,
          min_annual_turnover: '$1M - $5M'
        },
        created_by: adminId
      }
    ];

    defaultCategories.forEach(categoryData => {
      this.createCategoryConfig(categoryData);
    });
  }
}

export const categoryService = CategoryManagementService.getInstance();