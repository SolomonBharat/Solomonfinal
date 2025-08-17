/*
  # Seed Data for Solomon Bharat Portal

  1. Categories
    - Textiles & Apparel
    - Agricultural Products
    - Electronics & Components

  2. Test Users (will be created via auth, this is just for reference)
    - Admin: admin@solomonbharat.com
    - Buyer: buyer@example.com  
    - Supplier1: supplier1@example.com (verified)
    - Supplier2: supplier2@example.com (pending)
*/

-- Insert categories
insert into public.categories (name, description, requirements, active) values
  ('Textiles & Apparel', 'Clothing, fabrics, and textile products', 
   '{"min_experience_years": 3, "required_certifications": ["ISO 9001"], "min_annual_turnover": "$500K"}', true),
  ('Agricultural Products', 'Food products, spices, and agricultural items', 
   '{"min_experience_years": 2, "required_certifications": ["FSSAI", "Organic"], "min_annual_turnover": "$100K"}', true),
  ('Electronics & Components', 'Electronic devices and components', 
   '{"min_experience_years": 5, "required_certifications": ["CE", "ISO 9001"], "min_annual_turnover": "$1M"}', true);

-- Note: Users will be created through the auth system and profiles will be created via triggers or application logic
-- This is just documentation of the test accounts that should be created:

-- Admin user profile (to be created after auth signup)
-- insert into public.profiles (id, user_type, full_name, company_name, phone, country) values
--   ('admin-uuid', 'admin', 'Admin User', 'Solomon Bharat', '+91-8595135554', 'India');

-- Buyer user profile (to be created after auth signup)  
-- insert into public.profiles (id, user_type, full_name, company_name, phone, country) values
--   ('buyer-uuid', 'buyer', 'John Smith', 'Global Trade Corp', '+1-555-0123', 'United States');
-- insert into public.buyers (id) values ('buyer-uuid');

-- Supplier profiles (to be created after auth signup)
-- insert into public.profiles (id, user_type, full_name, company_name, phone, country) values
--   ('supplier1-uuid', 'supplier', 'Rajesh Kumar', 'Textile Exports Ltd', '+91-9876543210', 'India'),
--   ('supplier2-uuid', 'supplier', 'Priya Sharma', 'Agro Products Inc', '+91-9876543211', 'India');

-- insert into public.suppliers (id, product_categories, certifications, years_in_business, verification_status) values
--   ('supplier1-uuid', '{"Textiles & Apparel"}', '{"ISO 9001", "GOTS"}', 8, 'verified'),
--   ('supplier2-uuid', '{"Agricultural Products"}', '{"FSSAI", "Organic"}', 5, 'pending');