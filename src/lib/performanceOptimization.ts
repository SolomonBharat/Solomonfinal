// Performance Optimization Service
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  // Enhanced caching mechanism
  setCache<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Optimized supplier-category matching
  getOptimizedSupplierMatches(rfqCategory: string, rfqRequirements: any): any[] {
    const cacheKey = `supplier_matches_${rfqCategory}_${JSON.stringify(rfqRequirements)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    const supplierCategoryMappings = JSON.parse(localStorage.getItem('supplier_category_mappings') || '[]');

    // Enhanced matching algorithm
    const matches = onboardedSuppliers
      .filter((supplier: any) => {
        // Check if supplier is approved for this category
        const hasApprovedCategory = supplierCategoryMappings.some((mapping: any) => 
          mapping.supplier_id === supplier.id && 
          mapping.status === 'approved' &&
          this.getCategoryNameById(mapping.category_id) === rfqCategory
        );

        return hasApprovedCategory && supplier.verified;
      })
      .map((supplier: any) => ({
        ...supplier,
        match_score: this.calculateMatchScore(supplier, rfqRequirements),
        response_time_estimate: this.estimateResponseTime(supplier),
        reliability_score: this.calculateReliabilityScore(supplier)
      }))
      .filter(supplier => supplier.match_score >= 70) // Minimum 70% match
      .sort((a, b) => {
        // Sort by match score, then reliability, then response time
        if (b.match_score !== a.match_score) return b.match_score - a.match_score;
        if (b.reliability_score !== a.reliability_score) return b.reliability_score - a.reliability_score;
        return a.response_time_estimate - b.response_time_estimate;
      })
      .slice(0, 10); // Limit to top 10 matches

    this.setCache(cacheKey, matches, 600000); // Cache for 10 minutes
    return matches;
  }

  private getCategoryNameById(categoryId: string): string {
    const categories = JSON.parse(localStorage.getItem('configured_categories') || '[]');
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.name || '';
  }

  private calculateMatchScore(supplier: any, rfqRequirements: any): number {
    let score = 80; // Base score

    // Category exact match
    const supplierCategories = supplier.productCategories || supplier.product_categories || [];
    if (supplierCategories.includes(rfqRequirements.category)) {
      score += 10;
    }

    // MOQ compatibility
    const supplierMOQ = this.parseQuantity(supplier.minimumOrderQuantity || supplier.minimum_order_quantity);
    const rfqQuantity = parseInt(rfqRequirements.quantity || '0');
    if (supplierMOQ <= rfqQuantity) {
      score += 5;
    } else {
      score -= 10;
    }

    // Certification match
    const supplierCerts = supplier.certifications || [];
    const requiredCerts = rfqRequirements.certifications_needed?.split(',').map((c: string) => c.trim()) || [];
    const certMatch = requiredCerts.filter((cert: string) => 
      supplierCerts.some((sCert: string) => sCert.toLowerCase().includes(cert.toLowerCase()))
    ).length;
    score += certMatch * 2;

    // Experience bonus
    const years = parseInt(supplier.yearsInBusiness || supplier.years_in_business || '0');
    if (years >= 10) score += 5;
    else if (years >= 5) score += 3;

    return Math.min(100, Math.max(0, score));
  }

  private parseQuantity(moqString: string): number {
    const match = moqString?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1000;
  }

  private estimateResponseTime(supplier: any): number {
    // Estimate response time in hours based on supplier characteristics
    let baseTime = 24; // 24 hours base

    const years = parseInt(supplier.yearsInBusiness || supplier.years_in_business || '0');
    if (years >= 10) baseTime -= 6;
    else if (years >= 5) baseTime -= 3;

    const certCount = (supplier.certifications || []).length;
    baseTime -= Math.min(6, certCount);

    return Math.max(2, baseTime);
  }

  private calculateReliabilityScore(supplier: any): number {
    let score = 70; // Base reliability

    // Years in business
    const years = parseInt(supplier.yearsInBusiness || supplier.years_in_business || '0');
    score += Math.min(20, years * 2);

    // Certifications
    const certCount = (supplier.certifications || []).length;
    score += Math.min(10, certCount * 2);

    // Verification status
    if (supplier.verified) score += 10;

    return Math.min(100, score);
  }

  // Batch operations for better performance
  batchUpdateSuppliers(updates: { id: string; data: Partial<any> }[]): void {
    const suppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    
    const updatedSuppliers = suppliers.map((supplier: any) => {
      const update = updates.find(u => u.id === supplier.id);
      return update ? { ...supplier, ...update.data, updated_at: new Date().toISOString() } : supplier;
    });

    localStorage.setItem('onboarded_suppliers', JSON.stringify(updatedSuppliers));
    this.clearCache('supplier_'); // Clear supplier-related cache
  }

  // Optimized search with indexing simulation
  searchSuppliers(query: string, filters: any = {}): any[] {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const suppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    
    let results = suppliers.filter((supplier: any) => {
      // Text search
      const searchFields = [
        supplier.companyName || supplier.company_name,
        supplier.contactPerson || supplier.contact_person,
        supplier.email,
        ...(supplier.productCategories || supplier.product_categories || []),
        ...(supplier.certifications || [])
      ].join(' ').toLowerCase();

      const matchesQuery = !query || searchFields.includes(query.toLowerCase());

      // Apply filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return supplier[key] === value;
      });

      return matchesQuery && matchesFilters;
    });

    // Sort by relevance
    if (query) {
      results = results.sort((a, b) => {
        const aRelevance = this.calculateSearchRelevance(a, query);
        const bRelevance = this.calculateSearchRelevance(b, query);
        return bRelevance - aRelevance;
      });
    }

    this.setCache(cacheKey, results, 180000); // Cache for 3 minutes
    return results;
  }

  private calculateSearchRelevance(supplier: any, query: string): number {
    let relevance = 0;
    const lowerQuery = query.toLowerCase();

    // Company name match (highest priority)
    const companyName = (supplier.companyName || supplier.company_name || '').toLowerCase();
    if (companyName.includes(lowerQuery)) relevance += 10;
    if (companyName.startsWith(lowerQuery)) relevance += 5;

    // Category match
    const categories = supplier.productCategories || supplier.product_categories || [];
    categories.forEach((cat: string) => {
      if (cat.toLowerCase().includes(lowerQuery)) relevance += 7;
    });

    // Certification match
    const certifications = supplier.certifications || [];
    certifications.forEach((cert: string) => {
      if (cert.toLowerCase().includes(lowerQuery)) relevance += 3;
    });

    return relevance;
  }

  // Data integrity checks
  validateDataIntegrity(): { issues: string[]; fixes: string[] } {
    const issues: string[] = [];
    const fixes: string[] = [];

    // Check for duplicate emails
    const suppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    const emails = suppliers.map((s: any) => s.email);
    const duplicateEmails = emails.filter((email: string, index: number) => emails.indexOf(email) !== index);
    
    if (duplicateEmails.length > 0) {
      issues.push(`Duplicate emails found: ${duplicateEmails.join(', ')}`);
      fixes.push('Remove or merge duplicate supplier entries');
    }

    // Check for missing required fields
    suppliers.forEach((supplier: any, index: number) => {
      const requiredFields = ['email', 'companyName', 'contactPerson'];
      const missingFields = requiredFields.filter(field => !supplier[field]);
      
      if (missingFields.length > 0) {
        issues.push(`Supplier ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
        fixes.push(`Update supplier ${index + 1} with missing information`);
      }
    });

    return { issues, fixes };
  }
}

export const performanceService = PerformanceOptimizationService.getInstance();