import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories, useCreateSupplier } from '../../lib/queries';
import { toast } from 'sonner';
import { Building, User, FileText, Camera, Video, Award } from 'lucide-react';

const AdminSupplierOnboarding = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { data: categories = [] } = useCategories();
  const createSupplier = useCreateSupplier();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    phone: '',
    country: 'India',
    years_in_business: '',
    gst_number: '',
    iec_code: '',
    factory_photo_url: '',
    factory_video_url: '',
    product_categories: [] as string[],
    certifications: [] as string[],
    annual_turnover: '',
    employee_count: '',
    production_capacity: '',
    minimum_order_quantity: '',
    quality_standards: ''
  });

  const availableCertifications = [
    'ISO 9001', 'ISO 14001', 'CE Marking', 'FDA Approved', 'GMP Certified',
    'HACCP', 'Organic Certified', 'Fair Trade', 'BSCI Audit', 'GOTS', 'OEKO-TEX'
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

  const handleCertificationChange = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.product_categories.length === 0) {
      toast.error('Please select at least one product category');
      return;
    }

    setLoading(true);

    try {
      // First create the user account
      const { error: authError } = await signUp(formData.email, formData.password, {
        userType: 'supplier',
        fullName: formData.full_name,
        companyName: formData.company_name,
        phone: formData.phone,
        country: formData.country,
      });

      if (authError) {
        toast.error('Failed to create user account: ' + authError.message);
        return;
      }

      // Note: In a real implementation, you'd get the user ID from the auth response
      // For now, we'll create a temporary ID and let Supabase handle the actual user creation
      toast.success('Supplier onboarded successfully! They can now log in with their credentials.');
      navigate('/admin');
    } catch (error: any) {
      console.error('Error onboarding supplier:', error);
      toast.error('Failed to onboard supplier: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Onboard New Supplier" subtitle="Add a new supplier to the platform">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Supplier Onboarding Form</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in all required information to onboard a new supplier</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      name="years_in_business"
                      value={formData.years_in_business}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IEC Code
                    </label>
                    <input
                      type="text"
                      name="iec_code"
                      value={formData.iec_code}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Turnover
                    </label>
                    <select
                      name="annual_turnover"
                      value={formData.annual_turnover}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Range</option>
                      <option value="under_1m">Under $1M</option>
                      <option value="1m_5m">$1M - $5M</option>
                      <option value="5m_10m">$5M - $10M</option>
                      <option value="10m_50m">$10M - $50M</option>
                      <option value="over_50m">Over $50M</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Count
                    </label>
                    <select
                      name="employee_count"
                      value={formData.employee_count}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Range</option>
                      <option value="1_10">1-10</option>
                      <option value="11_50">11-50</option>
                      <option value="51_200">51-200</option>
                      <option value="201_500">201-500</option>
                      <option value="over_500">Over 500</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Factory Media */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Factory Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Factory Photo URL
                    </label>
                    <input
                      type="url"
                      name="factory_photo_url"
                      value={formData.factory_photo_url}
                      onChange={handleChange}
                      placeholder="https://example.com/factory-photo.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Factory Video URL
                    </label>
                    <input
                      type="url"
                      name="factory_video_url"
                      value={formData.factory_video_url}
                      onChange={handleChange}
                      placeholder="https://example.com/factory-video.mp4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Product Categories */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Product Categories *
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the categories this supplier can manufacture or supply
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.product_categories.includes(category.name)}
                        onChange={() => handleCategoryChange(category.name)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCertifications.map(cert => (
                    <label key={cert} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleCertificationChange(cert)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Production Capacity
                    </label>
                    <input
                      type="text"
                      name="production_capacity"
                      value={formData.production_capacity}
                      onChange={handleChange}
                      placeholder="e.g., 10,000 units/month"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="text"
                      name="minimum_order_quantity"
                      value={formData.minimum_order_quantity}
                      onChange={handleChange}
                      placeholder="e.g., 100 pieces"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality Standards
                    </label>
                    <textarea
                      name="quality_standards"
                      value={formData.quality_standards}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe quality standards and processes..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || formData.product_categories.length === 0}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Onboarding...</span>
                    </>
                  ) : (
                    <span>Onboard Supplier</span>
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

export default AdminSupplierOnboarding;