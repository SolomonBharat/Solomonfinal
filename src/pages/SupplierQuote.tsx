import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, DollarSign } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import QASystem from '../components/QASystem';

const SupplierQuote = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price_per_unit: '',
    moq: '',
    lead_time: '',
    payment_terms: '30% advance, 70% on shipment',
    shipping_terms: 'FOB',
    validity_days: '15',
    quality_guarantee: true,
    sample_available: true,
    notes: '',
    product_images: [] as File[],
    product_videos: [] as File[]
  });

  // Mock RFQ data
  const rfqData = {
    id: rfqId,
    title: 'Organic Cotton T-Shirts',
    category: 'Textiles & Apparel',
    quantity: 5000,
    unit: 'pieces',
    target_price: 8.50,
    buyer_company: 'Global Trade Corp',
    buyer_country: 'United States',
    delivery_timeline: '30 days',
    description: 'High-quality organic cotton t-shirts for retail. GOTS certification required. Colors: White, Black, Navy. Sizes: S, M, L, XL. 100% organic cotton, 180 GSM.',
    additional_requirements: 'GOTS certification mandatory. Custom labels required. Eco-friendly packaging preferred.'
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to submit quotation
    setTimeout(() => {
      setLoading(false);
      alert('Quotation submitted successfully! It will be reviewed by admin before being sent to the buyer.');
      navigate('/supplier/dashboard');
    }, 1500);
  };

  const calculateTotal = () => {
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    const moq = parseInt(formData.moq) || rfqData.quantity;
    return pricePerUnit * moq;
  };

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
            <span className="text-gray-900 font-medium">Submit Quotation</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Quotation</h1>
            <p className="text-gray-600">
              Provide your best quote for this RFQ. Your quotation will be reviewed by admin before being sent to the buyer.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* RFQ Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{rfqData.title}</h4>
                    <p className="text-sm text-gray-600">{rfqData.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium">{rfqData.quantity.toLocaleString()} {rfqData.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Target Price:</span>
                      <p className="font-medium">${rfqData.target_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <p className="font-medium">{rfqData.delivery_timeline}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <p className="font-medium">{rfqData.buyer_company}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{rfqData.description}</p>
                  </div>

                  {rfqData.additional_requirements && (
                    <div>
                      <span className="text-gray-500 text-sm">Additional Requirements:</span>
                      <p className="text-sm text-gray-700 mt-1">{rfqData.additional_requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quotation Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Pricing Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Unit (USD) *
                        </label>
                        <input
                          type="number"
                          id="price_per_unit"
                          name="price_per_unit"
                          step="0.01"
                          required
                          value={formData.price_per_unit}
                          onChange={handleChange}
                          placeholder="8.50"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="moq" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Order Quantity *
                        </label>
                        <input
                          type="number"
                          id="moq"
                          name="moq"
                          required
                          value={formData.moq}
                          onChange={handleChange}
                          placeholder="5000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Total Calculation */}
                    {formData.price_per_unit && formData.moq && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 font-medium">
                          Total Quote Value: ${calculateTotal().toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Terms & Conditions
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="lead_time" className="block text-sm font-medium text-gray-700 mb-2">
                          Lead Time *
                        </label>
                        <select
                          id="lead_time"
                          name="lead_time"
                          required
                          value={formData.lead_time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Lead Time</option>
                          <option value="15-20 days">15-20 days</option>
                          <option value="20-25 days">20-25 days</option>
                          <option value="25-30 days">25-30 days</option>
                          <option value="30-35 days">30-35 days</option>
                          <option value="35-40 days">35-40 days</option>
                          <option value="40-45 days">40-45 days</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="validity_days" className="block text-sm font-medium text-gray-700 mb-2">
                          Quote Validity (Days) *
                        </label>
                        <select
                          id="validity_days"
                          name="validity_days"
                          required
                          value={formData.validity_days}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="7">7 days</option>
                          <option value="15">15 days</option>
                          <option value="30">30 days</option>
                          <option value="45">45 days</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Terms *
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
                          <option value="100% advance">100% advance</option>
                        </select>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="FOB">FOB (Free on Board)</option>
                          <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                          <option value="CFR">CFR (Cost & Freight)</option>
                          <option value="EXW">EXW (Ex Works)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="quality_guarantee"
                          name="quality_guarantee"
                          checked={formData.quality_guarantee}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="quality_guarantee" className="text-sm text-gray-700">
                          Quality guarantee provided
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="sample_available"
                          name="sample_available"
                          checked={formData.sample_available}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sample_available" className="text-sm text-gray-700">
                          Samples available for approval
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes & Specifications
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information, bulk discounts, special offers, or clarifications..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Product Images */}
                  <div>
                    <FileUpload
                      label="Product Images"
                      description="Upload high-quality images of your products"
                      acceptedTypes="image/*"
                      maxFiles={10}
                      maxSize={10}
                      onFileSelect={(files) => setFormData(prev => ({ ...prev, product_images: files }))}
                    />
                  </div>

                  {/* Product Videos */}
                  <div>
                    <FileUpload
                      label="Product Videos"
                      description="Upload videos showcasing your products and quality"
                      acceptedTypes="video/*"
                      maxFiles={3}
                      maxSize={50}
                      onFileSelect={(files) => setFormData(prev => ({ ...prev, product_videos: files }))}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <Link 
                    to="/supplier/dashboard"
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Quotation'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Q&A Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions & Answers</h3>
              <QASystem 
                rfqId={rfqId} 
                mode="supplier_ask"
                onQuestionSubmit={(question) => console.log('Question submitted:', question)}
              />
            </div>
          </div>

          {/* Public Q&A */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Q&A</h3>
              <p className="text-sm text-gray-600 mb-4">
                Previous questions and answers that might help with your quotation:
              </p>
              <QASystem 
                rfqId={rfqId} 
                mode="public_view"
              />
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Quotations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be competitive with your pricing while maintaining quality standards</li>
              <li>• Clearly mention any certifications or quality standards you meet</li>
              <li>• Provide realistic lead times and stick to them</li>
              <li>• Include any value-added services or bulk discounts in your notes</li>
              <li>• Your quotation will be reviewed by our team before being sent to the buyer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierQuote;