import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCreateRFQ, useCategories } from '../lib/queries';
import { DashboardLayout } from '../components/DashboardLayout';
import { toast } from 'sonner';
import { FileText, Package, DollarSign, Calendar, Truck, Award } from 'lucide-react';

const CreateRFQ = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const createRFQMutation = useCreateRFQ();
  
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
    additional_requirements: ''
  });

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
    
    if (!user?.id) {
      toast.error('You must be logged in to create an RFQ');
      return;
    }

    if (!formData.title || !formData.category || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await createRFQMutation.mutateAsync({
        buyer_id: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description || null,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        delivery_timeline: formData.delivery_timeline || null,
        shipping_terms: formData.shipping_terms || null,
        quality_standards: formData.quality_standards || null,
        certifications_needed: formData.certifications_needed || null,
        additional_requirements: formData.additional_requirements || null,
        open_for_bidding: false,
        status: 'pending_approval',
        expires_at: null
      });

      toast.success('RFQ created successfully! It will be reviewed by our admin team.');
      navigate('/my-rfqs');
    } catch (error: any) {
      console.error('Error creating RFQ:', error);
      toast.error('Failed to create RFQ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create RFQ" subtitle="Submit a new Request for Quotation">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">New RFQ Details</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in the details for your sourcing request</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
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
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your requirements in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Quantity & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
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

                  <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Terms */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  Delivery & Terms
                </h3>
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
                      placeholder="e.g., 30 days from order confirmation"
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
                      placeholder="e.g., FOB Mumbai, CIF destination port"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quality & Certifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Quality & Certifications
                </h3>
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
                      placeholder="e.g., ISO 9001, Six Sigma"
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
                      placeholder="e.g., GOTS, OEKO-TEX, CE Marking"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Requirements
                  </label>
                  <textarea
                    name="additional_requirements"
                    value={formData.additional_requirements}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any other specific requirements or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating RFQ...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Submit RFQ</span>
                    </>
                  )}
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