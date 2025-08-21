import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        product_images: Array.from(e.target.files || [])
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_images: prev.product_images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (formData.product_images.length === 0) {
      alert('Please upload at least one product image.');
      setLoading(false);
      return;
    }
    
    if (formData.product_images.length === 0) {
      alert('Please upload at least one product image.');
      setLoading(false);
      return;
    }
    
    if (!formData.title || !formData.category || !formData.description || !formData.quantity || !formData.unit || !formData.target_price || !formData.delivery_timeline || !formData.delivery_country || !formData.shipping_terms) {
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // Create RFQ in Supabase
      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          buyer_id: user!.id,
          title: formData.title,
          category: formData.category,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          unit: formData.unit,
          target_price: parseFloat(formData.target_price),
          max_price: formData.max_price ? parseFloat(formData.max_price) : null,
          delivery_timeline: formData.delivery_timeline,
          shipping_terms: formData.shipping_terms,
          quality_standards: formData.quality_standards || null,
          certifications_needed: formData.certifications_needed || null,
          additional_requirements: formData.additional_requirements || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (rfqError) {
        throw rfqError;
      }

      alert('RFQ submitted successfully! It will be reviewed by our team within 24 hours.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating RFQ:', error);
      alert('Failed to create RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium text-sm sm:text-base">Create New RFQ</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New RFQ</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Provide detailed information about the product you want to source from India
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Product Images */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images * (Required - At least 1 image)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-images"
                    />
                    <label
                      htmlFor="product-images"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload product images</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each (At least 1 required)</span>
                    </label>
                  </div>
                  
                  {formData.product_images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.product_images.map((file, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                          <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-center p-2">
                            <span className="text-xs text-gray-600 text-center break-words">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="delivery_country" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Country *
                    </label>
                    <input
                      type="text"
                      id="delivery_country"
                      name="delivery_country"
                      required
                      value={formData.delivery_country}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              <Link 
                to="/dashboard"
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit RFQ'}
              </button>
            </div>
          </form>

    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium text-sm sm:text-base">Create New RFQ</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New RFQ</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Provide detailed information about the product you want to source from India
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Product Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                {/* Product Images */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="product-images"
                    />
                    <label
                      htmlFor="product-images"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload product images</span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each (At least 1 required)</span>
                    </label>
                  </div>
                  
                  {formData.product_images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.product_images.map((file, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                          <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-center p-2">
                            <span className="text-xs text-gray-600 text-center break-words">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="delivery_country" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Country *
                    </label>
                    <input
                      type="text"
                      id="delivery_country"
                      name="delivery_country"
                      required
                      value={formData.delivery_country}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
              <Link 
                to="/dashboard"
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
              <li>• Upload clear product images (required) and detailed specifications</li>
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