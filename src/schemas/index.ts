import { z } from 'zod'

export const rfqSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unit: z.string().min(1, 'Unit is required'),
  target_price: z.number().positive('Target price must be positive').optional(),
})

export const supplierProfileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  company_name: z.string().min(2, 'Company name is required'),
  phone: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  product_categories: z.array(z.string()).min(1, 'At least one category is required'),
  certifications: z.array(z.string()),
  years_in_business: z.number().int().min(0, 'Years in business must be 0 or greater').optional(),
})

export const quotationSchema = z.object({
  price_per_unit: z.number().positive('Price per unit must be positive'),
  moq: z.number().int().positive('MOQ must be a positive integer').optional(),
  lead_time_days: z.number().int().min(0, 'Lead time must be 0 or greater').optional(),
  payment_terms: z.string().optional(),
  shipping_terms: z.string().optional(),
  validity_days: z.number().int().positive('Validity days must be positive').optional(),
})

export const sampleRequestSchema = z.object({
  courier_service: z.string().min(1, 'Courier service is required'),
  tracking_number: z.string().min(1, 'Tracking number is required'),
})

export type RFQFormData = z.infer<typeof rfqSchema>
export type SupplierProfileFormData = z.infer<typeof supplierProfileSchema>
export type QuotationFormData = z.infer<typeof quotationSchema>
export type SampleRequestFormData = z.infer<typeof sampleRequestSchema>