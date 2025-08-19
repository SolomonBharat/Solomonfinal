import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building, Globe, Phone, Mail, Save, Award, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SupplierProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: user?.company || 'Supplier 1',
    contact_person: user?.name || 'Rajesh Kumar',
    email: user?.email || 'supplier1@example.com',
    phone: '+91 98765 43210',
    address: '123 Industrial Area, Tirupur, Tamil Nadu 641604, India',
    website: 'https://www.globaltextiles.com',
    gst_number: '33AABCG1234M1Z5',
    iec_code: 'AABCG1234M',
    business_type: 'Manufacturer',
    years_in_business: '15',
    annual_turnover: '5-10 Million USD',
    employee_count: '100-500',
    export_countries: 'USA, UK, Canada, Australia, Germany',
    product_categories: ['Textiles & Apparel', 'Organic Cotton Products'],
    certifications: ['GOTS', 'OEKO-TEX', 'ISO 9001', 'ISO 14001'],
    quality_standards: 'ISO 9001:2015, GOTS Certified, OEKO-TEX Standard 100',
    production_capacity: '50,000 pieces per month',
    minimum_order_quantity: '1,000 pieces',
    payment_terms: '30% advance, 70% on shipment',
    lead_time: '25-30 days',
    about_company: 'Global Textiles Pvt Ltd is a leading manufacturer and exporter of high-quality organic cotton textiles. With over 15 years of experience, we specialize in sustainable fashion and eco-friendly textile production.'
  });

  const businessTypes = [
    'Manufacturer', 'Exporter', 'Trading Company', 'Supplier', 'Distributor'
  ];

  const categories = [
    'Textiles & Apparel', 'Spices & Food Products', 'Handicrafts & Home Decor',
    'Electronics & Components', 'Pharmaceuticals & Healthcare', 'Chemicals & Materials',
    'Automotive Parts', 'Jewelry & Gems', 'Leather Goods', 'Agricultural Products'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      product_categories: prev.product_categories.includes(category)
        ? prev.product_categories.filter(c => c !== category)
        : [...prev.product_categories, category]
    }));
  };

  const handleCertificationChange = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Update supplier profile in localStorage
    const savedUser = localStorage.getItem('solomon_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const updatedUser = {
        ...user,
        company: formData.company_name,
        name: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        product_categories: formData.product_categories,
        certifications: formData.certifications,
        business_type: formData.business_type,
        years_in_business: formData.years_in_business,
        annual_turnover: formData.annual_turnover,
        employee_count: formData.employee_count,
        export_countries: formData.export_countries,
        quality_standards: formData.quality_standards,
        production_capacity: formData.production_capacity,
        minimum_order_quantity: formData.minimum_order_quantity,
        payment_terms: formData.payment_terms,
        lead_time: formData.lead_time,
        about_company: formData.about_company,
        address: formData.address,
        website: formData.website,
        gst_number: formData.gst_number,
        iec_code: formData.iec_code
      };
      localStorage.setItem('solomon_user', JSON.stringify(updatedUser));
    }
    
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
      // Reload the page to reflect changes
      window.location.reload();
    }, 1000);
  };

  const commonCertifications = [
    'ISO 9001', 'ISO 14001', 'GOTS', 'OEKO-TEX', 'BIS', 'FSSAI', 'CE', 'FDA', 'GMP', 'HACCP'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/supplier/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Company Profile</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-gray-600">
              Manage your company information and business details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Company Information
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contact_person"
                      name="contact_person"
                      required
                      value={formData.contact_person}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="business_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      id="business_type"
                      name="business_type"
                      required
                      value={formData.business_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {businessTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Legal & Compliance
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number *
                    </label>
                    <input
                      type="text"
                      id="gst_number"
                      name="gst_number"
                      required
                      value={formData.gst_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="iec_code" className="block text-sm font-medium text-gray-700 mb-2">
                      IEC Code *
                    </label>
                    <input
                      type="text"
                      id="iec_code"
                      name="iec_code"
                      required
                      value={formData.iec_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  Business Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="years_in_business" className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="text"
                      id="years_in_business"
                      name="years_in_business"
                      value={formData.years_in_business}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="annual_turnover" className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover
                    </label>
                    <select
                      id="annual_turnover"
                      name="annual_turnover"
                      value={formData.annual_turnover}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Under 1 Million USD">Under 1 Million USD</option>
                      <option value="1-5 Million USD">1-5 Million USD</option>
                      <option value="5-10 Million USD">5-10 Million USD</option>
                      <option value="10-50 Million USD">10-50 Million USD</option>
                      <option value="Over 50 Million USD">Over 50 Million USD</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Count
                    </label>
                    <select
                      id="employee_count"
                      name="employee_count"
                      value={formData.employee_count}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-100">51-100</option>
                      <option value="100-500">100-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="export_countries" className="block text-sm font-medium text-gray-700 mb-2">
                      Export Countries
                    </label>
                    <input
                      type="text"
                      id="export_countries"
                      name="export_countries"
                      value={formData.export_countries}
                      onChange={handleChange}
                      placeholder="USA, UK, Canada..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Categories (Read Only)</h3>
                <p className="text-sm text-gray-600 mt-1">Categories are set during onboarding and cannot be changed</p>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 opacity-60 pointer-events-none">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(category)}
                        disabled={true}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Product categories are assigned during the onboarding process and cannot be modified. 
                    If you need to add or change categories, please contact our admin team.
                  </p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Certifications & Standards
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {commonCertifications.map(certification => (
                    <label key={certification} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(certification)}
                        onChange={() => handleCertificationChange(certification)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{certification}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label htmlFor="quality_standards" className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Standards & Additional Certifications
                  </label>
                  <textarea
                    id="quality_standards"
                    name="quality_standards"
                    rows={3}
                    value={formData.quality_standards}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Production & Terms */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Production & Terms</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="production_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                      Production Capacity
                    </label>
                    <input
                      type="text"
                      id="production_capacity"
                      name="production_capacity"
                      value={formData.production_capacity}
                      onChange={handleChange}
                      placeholder="e.g., 50,000 pieces per month"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="minimum_order_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="text"
                      id="minimum_order_quantity"
                      name="minimum_order_quantity"
                      value={formData.minimum_order_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 1,000 pieces"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      id="payment_terms"
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      placeholder="e.g., 30% advance, 70% on shipment"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lead_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Typical Lead Time
                    </label>
                    <input
                      type="text"
                      id="lead_time"
                      name="lead_time"
                      value={formData.lead_time}
                      onChange={handleChange}
                      placeholder="e.g., 25-30 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="about_company" className="block text-sm font-medium text-gray-700 mb-2">
                    About Company
                  </label>
                  <textarea
                    id="about_company"
                    name="about_company"
                    rows={4}
                    value={formData.about_company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link 
                to="/supplier/dashboard"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;