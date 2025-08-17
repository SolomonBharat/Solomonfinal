import { z } from 'zod';

// RFQ Schema
export const rfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit: z.string().min(1, 'Unit is required'),
  target_price: z.number().positive('Target price must be positive').optional(),
  max_price: z.number().positive('Max price must be positive').optional(),
  delivery_timeline: z.string().optional(),
  shipping_terms: z.string().optional(),
  quality_standards: z.string().optional(),
  certifications_needed: z.string().optional(),
  additional_requirements: z.string().optional(),
  open_for_bidding: z.boolean().default(false),
});

export type RFQFormData = z.infer<typeof rfqSchema>;

// Quotation Schema
export const quotationSchema = z.object({
  price_per_unit: z.number().positive('Price must be positive'),
  moq: z.number().int().positive('MOQ must be a positive integer').optional(),
  lead_time_days: z.number().int().min(0, 'Lead time cannot be negative').optional(),
  payment_terms: z.string().optional(),
  shipping_terms: z.string().optional(),
  validity_days: z.number().int().positive('Validity must be positive').optional(),
  quality_guarantee: z.boolean().default(false),
  sample_available: z.boolean().default(false),
  notes: z.string().optional(),
});

export type QuotationFormData = z.infer<typeof quotationSchema>;

// Profile Schema
export const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Supplier Profile Schema
export const supplierProfileSchema = profileSchema.extend({
  product_categories: z.array(z.string()).min(1, 'At least one category is required'),
  certifications: z.array(z.string()).default([]),
  years_in_business: z.number().int().min(0, 'Years in business cannot be negative').optional(),
  annual_turnover: z.string().optional(),
  employee_count: z.string().optional(),
  gst_number: z.string().optional(),
  iec_code: z.string().optional(),
  production_capacity: z.string().optional(),
  minimum_order_quantity: z.string().optional(),
  quality_standards: z.string().optional(),
});

export type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>;

// Category Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  requirements: z.object({
    min_experience_years: z.number().int().min(0).default(0),
    required_certifications: z.array(z.string()).default([]),
    min_annual_turnover: z.string().default(''),
  }).default({}),
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;