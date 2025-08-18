import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { Star, MapPin, Award, Users, Search, Filter } from 'lucide-react';

const BuyerSuppliers = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // Load mock suppliers
    const mockSuppliers = [
      {
        id: 'supplier-1',
        company_name: 'Premium Textiles Ltd',
        full_name: 'Rajesh Kumar',
        country: 'India',
        city: 'Mumbai',
        product_categories: ['Textiles & Apparel', 'Home Textiles'],
        certifications: ['ISO 9001', 'GOTS', 'OEKO-TEX'],
        years_in_business: 15,
        rating: 4.8,
        total_orders: 245,
        verification_status: 'verified',
        specialties: ['Organic Cotton', 'Sustainable Manufacturing'],
        min_order_value: 5000,
        response_time: '2 hours'
      },
      {
        id: 'supplier-2',
        company_name: 'Golden Spices Co',
        full_name: 'Priya Sharma',
        country: 'India',
        city: 'Kerala',
        product_categories: ['Spices & Food Products', 'Agricultural Products'],
        certifications: ['FDA', 'HACCP', 'Organic Certified'],
        years_in_business: 12,
        rating: 4.9,
        total_orders: 189,
        verification_status: 'verified',
        specialties: ['Organic Spices', 'Export Quality'],
        min_order_value: 2000,
        response_time: '1 hour'
      },
      {
        id: 'supplier-3',
        company_name: 'Heritage Woodworks',
        full_name: 'Amit Patel',
        country: 'India',
        city: 'Rajasthan',
        product_categories: ['Handicrafts & Home Decor', 'Furniture'],
        certifications: ['FSC', 'Fair Trade'],
        years_in_business: 20,
        rating: 4.7,
        total_orders: 156,
        verification_status: 'verified',
        specialties: ['Handcrafted Furniture', 'Traditional Designs'],
        min_order_value: 10000,
        response_time: '4 hours'
      },
      {
        id: 'supplier-4',
        company_name: 'Tech Components India',
        full_name: 'Suresh Reddy',
        country: 'India',
        city: 'Bangalore',
        product_categories: ['Electronics & Components', 'Industrial Equipment'],
        certifications: ['ISO 14001', 'CE Marking'],
        years_in_business: 8,
        rating: 4.6,
        total_orders: 98,
        verification_status: 'verified',
        specialties: ['PCB Manufacturing', 'Quality Testing'],
        min_order_value: 3000,
        response_time: '3 hours'
      }
    ];
    
    setSuppliers(mockSuppliers);
    setLoading(false);
  }, []);

  const categories = [
    'Textiles & Apparel',
    'Spices & Food Products',
    'Handicrafts & Home Decor',
    'Electronics & Components',
    'Pharmaceuticals & Healthcare',
    'Chemicals & Materials',
    'Automotive Parts',
    'Jewelry & Gems',
    'Leather Goods',
    'Agricultural Products',
    'Industrial Equipment'
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.product_categories.some((cat: string) => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || supplier.product_categories.includes(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout title="Suppliers" subtitle="Discover verified suppliers from India">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Suppliers" subtitle="Discover verified suppliers from India">
      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-600">
                {filteredSuppliers.length} suppliers found
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{supplier.company_name}</h3>
                  <p className="text-sm text-gray-600">{supplier.full_name}</p>
                  <div className="flex items-center space-x-1 mt-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{supplier.city}, {supplier.country}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{supplier.rating}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Product Categories</h4>
                  <div className="flex flex-wrap gap-1">
                    {supplier.product_categories.map((category: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Specialties</h4>
                  <div className="flex flex-wrap gap-1">
                    {supplier.specialties.map((specialty: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Certifications</h4>
                  <div className="flex flex-wrap gap-1">
                    {supplier.certifications.map((cert: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Experience:</span> {supplier.years_in_business} years
                  </div>
                  <div>
                    <span className="font-medium">Orders:</span> {supplier.total_orders}
                  </div>
                  <div>
                    <span className="font-medium">Min Order:</span> ${supplier.min_order_value.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Response:</span> {supplier.response_time}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Verified</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      View Profile
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BuyerSuppliers;