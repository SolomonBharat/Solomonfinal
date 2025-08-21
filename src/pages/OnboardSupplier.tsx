import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, User, Globe, Award, Save } from 'lucide-react';
import { PRODUCT_CATEGORIES, CATEGORY_DESCRIPTIONS } from '../constants/categories';

const OnboardSupplier = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Company Information
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    
    // Legal Information
    gst_number: '',
    iec_code: '',
    pan_number: '',
    
    // Business Details
    business_type: 'Manufacturer',
    years_in_business: '',
    annual_turnover: '',
    employee_count: '',
    export_countries: '',
    
    // Product Information
    product_category: '',
    certifications: [] as string[],
    quality_standards: '',
    production_capacity: '',
    minimum_order_quantity: '',
    
    // Terms
    payment_terms: '30% advance, 70% on shipment',
    lead_time: '25-30 days',
    shipping_terms: 'FOB',
    
    // Additional
    about_company: '',
    bank_details: '',
    references: ''
  });

  const businessTypes = [
    'Manufacturer', 'Exporter', 'Trading Company', 'Supplier', 'Distributor'
  ];

  const commonCertifications = [
    'ISO 9001', 'ISO 14001', 'GOTS', 'OEKO-TEX', 'BIS', 'FSSAI', 'CE', 'FDA', 
    'GMP', 'HACCP', 'Fair Trade', 'Organic India', 'Export License'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
    
    // Create new supplier account
    const newSupplier = {
      id: `supplier-${Date.now()}`,
      user_type: 'supplier',
      ...formData,
      product_categories: [formData.product_category], // Convert single category to array
      status: 'pending_verification',
      created_at: new Date().toISOString(),
      verified: false,
      rating: 0,
      total_orders: 0
    };
    
    // Save to localStorage (in production, this would be Supabase)
    const suppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    suppliers.push(newSupplier);
    localStorage.setItem('onboarded_suppliers', JSON.stringify(suppliers));
    
    setTimeout(() => {
      setLoading(false);
      alert('✅ Supplier onboarded successfully! Account created and pending verification.');
      navigate('/admin/suppliers');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Admin</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Onboard New Supplier</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboard New Supplier</h1>
            <p className="text-gray-600">
              Add a new verified supplier to the Solomon Bharat network
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
                      placeholder="e.g., Global Textiles Pvt Ltd"
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
                      placeholder="e.g., Rajesh Kumar"
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
                      placeholder="contact@company.com"
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
                      placeholder="+91 98765 43210"
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
                      placeholder="https://www.company.com"
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
                    Complete Business Address *
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Industrial Area, City, State, PIN Code, India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Legal & Compliance */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Legal & Compliance
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
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
                      placeholder="33AABCG1234M1Z5"
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
                      placeholder="AABCG1234M"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="pan_number" className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Number *
                    </label>
                    <input
                      type="text"
                      id="pan_number"
                      name="pan_number"
                      required
                      value={formData.pan_number}
                      onChange={handleChange}
                      placeholder="AABCG1234M"
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
                      Years in Business *
                    </label>
                    <input
                      type="number"
                      id="years_in_business"
                      name="years_in_business"
                      required
                      value={formData.years_in_business}
                      onChange={handleChange}
                      placeholder="15"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="annual_turnover" className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover *
                    </label>
                    <select
                      id="annual_turnover"
                      name="annual_turnover"
                      required
                      value={formData.annual_turnover}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Turnover</option>
                      <option value="Under 1 Million USD">Under 1 Million USD</option>
                      <option value="1-5 Million USD">1-5 Million USD</option>
                      <option value="5-10 Million USD">5-10 Million USD</option>
                      <option value="10-50 Million USD">10-50 Million USD</option>
                      <option value="Over 50 Million USD">Over 50 Million USD</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Count *
                    </label>
                    <select
                      id="employee_count"
                      name="employee_count"
                      required
                      value={formData.employee_count}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Count</option>
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
                      placeholder="USA, UK, Canada, Australia..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Primary Product Category *</h3>
                <p className="text-sm text-gray-600 mt-1">Select your main area of expertise</p>
              </div>
              <div className="p-6">
                <div>
                  <select
                    id="product_category"
                    name="product_category"
                    required
                    value={formData.product_category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Primary Category</option>
                    {PRODUCT_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formData.product_category && CATEGORY_DESCRIPTIONS[formData.product_category] && (
                    <p className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <strong>Category includes:</strong> {CATEGORY_DESCRIPTIONS[formData.product_category]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Certifications & Standards</h3>
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
                    Additional Quality Standards
                  </label>
                  <textarea
                    id="quality_standards"
                    name="quality_standards"
                    rows={3}
                    value={formData.quality_standards}
                    onChange={handleChange}
                    placeholder="Describe any additional quality standards, testing procedures, or certifications..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Production & Terms */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Production Capabilities & Terms</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="production_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                      Production Capacity *
                    </label>
                    <input
                      type="text"
                      id="production_capacity"
                      name="production_capacity"
                      required
                      value={formData.production_capacity}
                      onChange={handleChange}
                      placeholder="e.g., 50,000 pieces per month"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="minimum_order_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity *
                    </label>
                    <input
                      type="text"
                      id="minimum_order_quantity"
                      name="minimum_order_quantity"
                      required
                      value={formData.minimum_order_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 1,000 pieces"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Payment Terms *
                    </label>
                    <select
                      id="payment_terms"
                      name="payment_terms"
                      required
                      value={formData.payment_terms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="30% advance, 70% on shipment">30% advance, 70% on shipment</option>
                      <option value="40% advance, 60% on shipment">40% advance, 60% on shipment</option>
                      <option value="50% advance, 50% on shipment">50% advance, 50% on shipment</option>
                      <option value="25% advance, 75% against documents">25% advance, 75% against documents</option>
                      <option value="LC at sight">LC at sight</option>
                      <option value="LC 30 days">LC 30 days</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="lead_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Standard Lead Time *
                    </label>
                    <input
                      type="text"
                      id="lead_time"
                      name="lead_time"
                      required
                      value={formData.lead_time}
                      onChange={handleChange}
                      placeholder="e.g., 25-30 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* About Company */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Company Description</h3>
              </div>
              <div className="p-6">
                <div>
                  <label htmlFor="about_company" className="block text-sm font-medium text-gray-700 mb-2">
                    About Company *
                  </label>
                  <textarea
                    id="about_company"
                    name="about_company"
                    rows={4}
                    required
                    value={formData.about_company}
                    onChange={handleChange}
                    placeholder="Describe the company's expertise, specializations, and unique value propositions..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link 
                to="/admin"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.product_category}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Creating Account...' : 'Onboard Supplier'}</span>
              </button>
            </div>
          </form>

          {/* Information Required */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Information Required for Supplier Onboarding</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h5 className="font-semibold mb-2">🏢 Company Documents:</h5>
                <ul className="space-y-1">
                  <li>• GST Registration Certificate</li>
                  <li>• IEC (Import Export Code)</li>
                  <li>• PAN Card</li>
                  <li>• Company Registration Certificate</li>
                  <li>• Bank Account Details</li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-2">🏆 Quality Certifications:</h5>
                <ul className="space-y-1">
                  <li>• ISO 9001 (Quality Management)</li>
                  <li>• Product-specific certifications</li>
                  <li>• Export licenses</li>
                  <li>• Quality test reports</li>
                  <li>• Customer references</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-300">
              <h5 className="font-semibold text-blue-900 mb-2">📦 Category Selection:</h5>
              <p className="text-sm text-blue-800">
                Suppliers must select ONE primary category that best represents their core expertise. 
                This ensures accurate matching with relevant buyer RFQs and maintains quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardSupplier;