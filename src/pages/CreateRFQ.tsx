import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/toast';
import { Save, Send, ArrowLeft } from 'lucide-react';

const CreateRFQ = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    quantity: '',
    unit: 'pieces',
    target_price: '',
    max_price: '',
    delivery_timeline: '',
    shipping_terms: '',
    quality_standards: '',
    certifications_needed: '',
    additional_requirements: '',
    open_for_bidding: false
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create RFQ object
      const rfq = {
        id: 'rfq-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        buyer_id: user?.id,
        buyer_name: user?.name,
        buyer_company: user?.company,
        buyer_email: user?.email,
        buyer_phone: '+1234567890',
        buyer_country: 'USA',
        ...formData,
        quantity: parseInt(formData.quantity),
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        status: isDraft ? 'draft' : 'pending_approval',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      const existingRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
      existingRFQs.push(rfq);
      localStorage.setItem('user_rfqs', JSON.stringify(existingRFQs));

      toast.success(isDraft ? 'RFQ saved as draft!' : 'RFQ submitted successfully!', {
        description: isDraft ? 'You can continue editing later' : 'Your RFQ is now pending admin approval'
      });

      navigate('/my-rfqs');
    } catch (error) {
      toast.error('Failed to create RFQ', {
        description: 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create RFQ" subtitle="Submit a new sourcing request">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/my-rfqs')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">New RFQ</h2>
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RFQ Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Cotton T-Shirts for Export"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide detailed product specifications, materials, colors, sizes, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price (USD per unit)
                  </label>
                  <input
                    type="number"
                    name="target_price"
                    value={formData.target_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Your ideal price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Price (USD per unit)
                  </label>
                  <input
                    type="number"
                    name="max_price"
                    value={formData.max_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Maximum you're willing to pay"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Timeline
                  </label>
                  <input
                    type="text"
                    name="delivery_timeline"
                    value={formData.delivery_timeline}
                    onChange={handleChange}
                    placeholder="e.g., 30 days, 2 weeks"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Terms
                  </label>
                  <input
                    type="text"
                    name="shipping_terms"
                    value={formData.shipping_terms}
                    onChange={handleChange}
                    placeholder="e.g., FOB, CIF, EXW"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality Standards
                  </label>
                  <input
                    type="text"
                    name="quality_standards"
                    value={formData.quality_standards}
                    onChange={handleChange}
                    placeholder="e.g., ISO 9001, ASTM standards"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications Needed
                  </label>
                  <input
                    type="text"
                    name="certifications_needed"
                    value={formData.certifications_needed}
                    onChange={handleChange}
                    placeholder="e.g., CE, FDA, GOTS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea
                  name="additional_requirements"
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any other specific requirements, packaging needs, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Open for Bidding */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="open_for_bidding"
                  checked={formData.open_for_bidding}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-700">
                  Open for public bidding (allows all verified suppliers to quote)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, true)}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{loading ? 'Submitting...' : 'Submit RFQ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateRFQ;