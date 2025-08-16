import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from '../components/FileUpload';
import AIInsights from '../components/AIInsights';

const CreateRFQ = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    unit: '',
    target_price: '',
    max_price: '',
    delivery_timeline: '',
    shipping_terms: 'FOB',
    quality_standards: '',
    certifications_needed: '',
    additional_requirements: '',
    product_images: [] as File[],
    delivery_country: ''
  });

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
    'Industrial Equipment',
    'Other'
  ];

  const units = [
    'pieces', 'kg', 'tons', 'meters', 'liters', 'boxes', 'cartons', 'sets', 'pairs', 'dozens'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.title || !formData.category || !formData.description || !formData.quantity || !formData.unit || !formData.target_price || !formData.delivery_timeline || !formData.shipping_terms) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    // Create new RFQ with pending status
    const newRFQ = {
      id: `rfq-${Date.now()}`,
      ...formData,
      quantity: parseInt(formData.quantity),
      target_price: parseFloat(formData.target_price),
      max_price: formData.max_price ? parseFloat(formData.max_price) : null,
      status: user?.verification_status === 'verified' ? 'pending_approval' : 'pending_approval',
      buyer_verified: user?.verification_status === 'verified' || false,
      created_at: new Date().toISOString().split('T')[0],
      quotations_count: 0,
      buyer_id: user?.id,
      buyer_name: user?.name,
      buyer_company: user?.company,
      buyer_country: user?.country,
      buyer_email: user?.email,
      buyer_phone: user?.phone,
      product_images: formData.product_images.map((f: File) => f.name)
    };
    
    // Add to localStorage for demo (in production, this would be Supabase)
    const existingRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    existingRFQs.push(newRFQ);
    localStorage.setItem('user_rfqs', JSON.stringify(existingRFQs));
    
    setTimeout(() => {
      setLoading(false);
      alert('RFQ submitted successfully! It will be reviewed by our team within 24 hours.');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Create New RFQ</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New RFQ</h1>
            <p className="text-gray-600">
              Provide detailed information about the product you want to source from India
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 space-y-6">
              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Organic Cotton T-Shirts"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed specifications, materials, colors, sizes, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      required
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      required
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="target_price" className="block text-sm font-medium text-gray-700 mb-2">
                      Target Price (USD) *
                    </label>
                    <input
                      type="number"
                      id="target_price"
                      name="target_price"
                      step="0.01"
                      required
                      value={formData.target_price}
                      onChange={handleChange}
                      placeholder="8.50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Price (USD)
                    </label>
                    <input
                      type="number"
                      id="max_price"
                      name="max_price"
                      step="0.01"
                      value={formData.max_price}
                      onChange={handleChange}
                      placeholder="10.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="delivery_timeline" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Timeline *
                    </label>
                    <select
                      id="delivery_timeline"
                      name="delivery_timeline"
                      required
                      value={formData.delivery_timeline}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Timeline</option>
                      <option value="30-days">30 days</option>
                      <option value="45-days">45 days</option>
                      <option value="60-days">60 days</option>
                      <option value="90-days">90 days</option>
                      <option value="negotiable">Negotiable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping & Quality */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Quality Requirements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="shipping_terms" className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Terms *
                    </label>
                    <select
                      id="shipping_terms"
                      name="shipping_terms"
                      required
                      value={formData.shipping_terms}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="FOB">FOB (Free on Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quality_standards" className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Standards
                    </label>
                    <input
                      type="text"
                      id="quality_standards"
                      name="quality_standards"
                      value={formData.quality_standards}
                      onChange={handleChange}
                      placeholder="e.g., ISO 9001, GOTS, BIS"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="certifications_needed" className="block text-sm font-medium text-gray-700 mb-2">
                    Required Certifications
                  </label>
                  <input
                    type="text"
                    id="certifications_needed"
                    name="certifications_needed"
                    value={formData.certifications_needed}
                    onChange={handleChange}
                    placeholder="e.g., CE, FDA, CPSIA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Product Images Upload */}
              <div>
                <FileUpload
                  label="Product Images"
                  description="Upload reference images of the product you want to source"
                  acceptedTypes="image/*"
                  maxFiles={5}
                  maxSize={10}
                  onFileSelect={(files) => setFormData(prev => ({ ...prev, product_images: files }))}
                />
              </div>

              {/* Additional Requirements */}
              <div>
                <label htmlFor="additional_requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  id="additional_requirements"
                  name="additional_requirements"
                  rows={3}
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  placeholder="Any other specific requirements, packaging details, special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* AI Insights */}
              {(formData.title || formData.description || formData.category) && (
                <div>
                  <AIInsights 
                    type="rfq" 
                    data={formData}
                    onInsightUpdate={(insights) => console.log('AI Insights:', insights)}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <Link 
                to="/dashboard"
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit RFQ'}
              </button>
            </div>
          </form>

          {/* Help Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Results</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about quantities and quality requirements</li>
              <li>• Include reference images or detailed specifications if possible</li>
              <li>• Mention any compliance standards required in your target market</li>
              <li>• Our team will review and match you with the best suppliers within 24-48 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQ;