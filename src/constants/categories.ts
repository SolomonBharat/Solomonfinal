// Standardized Product Categories for Solomon Bharat Platform
// This is the single source of truth for all product categories

export const PRODUCT_CATEGORIES = [
  'Textiles & Apparel',
  'Spices & Food Products', 
  'Handicrafts & Home Decor',
  'Electronics & Components',
  'Pharmaceuticals & Healthcare',
  'Chemicals & Materials',
  'Automotive Parts & Accessories',
  'Jewelry & Gems',
  'Leather Goods & Footwear',
  'Agricultural Products',
  'Industrial Equipment & Machinery',
  'Cosmetics & Personal Care',
  'Sports & Fitness Equipment',
  'Toys & Games',
  'Furniture & Furnishings',
  'Paper & Packaging Materials',
  'Rubber & Plastic Products',
  'Metal & Metallurgy',
  'Tea & Coffee Products',
  'Ayurvedic & Herbal Products'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

// Category descriptions for better understanding
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Textiles & Apparel': 'Cotton, silk, wool fabrics, garments, home textiles',
  'Spices & Food Products': 'Turmeric, cardamom, pepper, tea, processed foods',
  'Handicrafts & Home Decor': 'Traditional crafts, decorative items, artwork',
  'Electronics & Components': 'Electronic parts, consumer electronics, IT hardware',
  'Pharmaceuticals & Healthcare': 'Generic medicines, medical devices, health supplements',
  'Chemicals & Materials': 'Industrial chemicals, dyes, pigments, raw materials',
  'Automotive Parts & Accessories': 'Auto components, spare parts, accessories',
  'Jewelry & Gems': 'Precious stones, gold jewelry, fashion jewelry',
  'Leather Goods & Footwear': 'Leather products, shoes, bags, accessories',
  'Agricultural Products': 'Rice, wheat, pulses, fresh produce',
  'Industrial Equipment & Machinery': 'Manufacturing equipment, tools, machinery',
  'Cosmetics & Personal Care': 'Beauty products, skincare, personal hygiene',
  'Sports & Fitness Equipment': 'Sporting goods, fitness equipment, outdoor gear',
  'Toys & Games': 'Educational toys, games, children products',
  'Furniture & Furnishings': 'Wooden furniture, home furnishings, decor',
  'Paper & Packaging Materials': 'Paper products, packaging solutions, printing',
  'Rubber & Plastic Products': 'Rubber goods, plastic items, industrial products',
  'Metal & Metallurgy': 'Steel products, metal components, alloys',
  'Tea & Coffee Products': 'Premium teas, coffee beans, beverages',
  'Ayurvedic & Herbal Products': 'Traditional medicines, herbal supplements, wellness'
};