// Enhanced Supplier Validation Service
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface SupplierData {
  contactPerson: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  country: string;
  yearsInBusiness: string;
  annualTurnover: string;
  employeeCount: string;
  gstNumber?: string;
  iecCode?: string;
  productCategories: string[];
  certifications: string[];
  exportCountries: string[];
  productionCapacity?: string;
  minimumOrderQuantity?: string;
  qualityStandards?: string;
  website?: string;
  factoryDescription?: string;
}

export class SupplierValidationService {
  private static instance: SupplierValidationService;
  
  static getInstance(): SupplierValidationService {
    if (!SupplierValidationService.instance) {
      SupplierValidationService.instance = new SupplierValidationService();
    }
    return SupplierValidationService.instance;
  }

  // Comprehensive supplier validation
  validateSupplier(supplierData: SupplierData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Required field validation
    const requiredFields = [
      'contactPerson', 'email', 'phone', 'companyName', 
      'businessType', 'country', 'yearsInBusiness', 
      'annualTurnover', 'employeeCount'
    ];

    requiredFields.forEach(field => {
      if (!supplierData[field as keyof SupplierData]) {
        errors.push(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        score -= 10;
      }
    });

    // Email validation
    if (supplierData.email && !this.isValidEmail(supplierData.email)) {
      errors.push('Invalid email format');
      score -= 5;
    }

    // Phone validation
    if (supplierData.phone && !this.isValidPhone(supplierData.phone)) {
      errors.push('Invalid phone number format');
      score -= 5;
    }

    // Website validation (only if provided)
    if (supplierData.website && !this.isValidWebsite(supplierData.website)) {
      warnings.push('Invalid website URL format');
      score -= 2;
    }

    // Business experience validation
    const yearsInBusiness = parseInt(supplierData.yearsInBusiness || '0');
    if (yearsInBusiness < 1) {
      warnings.push('Minimum 1 year business experience recommended');
      score -= 5;
    }

    // Category validation
    if (!supplierData.productCategories || supplierData.productCategories.length === 0) {
      errors.push('At least one product category must be selected');
      score -= 15;
    }

    // Check for duplicate email
    if (this.isDuplicateEmail(supplierData.email)) {
      errors.push('Email address already exists in the system');
      score -= 20;
    }

    // GST number validation for Indian suppliers
    if (supplierData.country === 'India' && supplierData.gstNumber) {
      if (!this.isValidGSTNumber(supplierData.gstNumber)) {
        warnings.push('Invalid GST number format');
        score -= 3;
      }
    }

    // Certification bonus
    if (supplierData.certifications && supplierData.certifications.length > 0) {
      score += Math.min(10, supplierData.certifications.length * 2);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, score))
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private isValidWebsite(website: string): boolean {
    try {
      new URL(website);
      return website.startsWith('http://') || website.startsWith('https://');
    } catch {
      return false;
    }
  }

  private isValidGSTNumber(gst: string): boolean {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  }

  private isDuplicateEmail(email: string): boolean {
    const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    return onboardedSuppliers.some((supplier: any) => supplier.email === email);
  }

  // Validate category selection against configured categories
  validateCategorySelection(selectedCategories: string[]): ValidationResult {
    const configuredCategories = JSON.parse(localStorage.getItem('configured_categories') || '[]');
    const activeCategories = configuredCategories.filter((cat: any) => cat.active);
    
    const errors: string[] = [];
    const warnings: string[] = [];

    selectedCategories.forEach(category => {
      const isConfigured = activeCategories.some((cat: any) => cat.name === category);
      if (!isConfigured) {
        errors.push(`Category "${category}" is not configured or active for onboarding`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : 0
    };
  }
}

export const supplierValidation = SupplierValidationService.getInstance();