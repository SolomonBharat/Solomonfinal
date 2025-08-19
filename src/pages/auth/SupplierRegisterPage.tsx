import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../lib/queries';
import { toast } from '../../components/ui/toast';
import { Globe, Loader2 } from 'lucide-react';

const SupplierRegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    country: '',
    productCategories: [] as string[],
    yearsInBusiness: '',
    certifications: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { data: categories } = useCategories();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, 'supplier', {
        full_name: formData.fullName,
        company_name: formData.companyName,
        phone: formData.phone,
        country: formData.country,
        product_categories: formData.productCategories,
        years_in_business: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
        certifications: formData.certifications,
      });

      if (error) {
        toast.error('Registration failed', {
          description: error.message,
        });
      } else {
        toast.success('Registration successful', {
          description: 'Your account is pending verification. You will be notified once approved.',
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCategoryChange = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(categoryName)
        ? prev.productCategories.filter(c => c !== categoryName)
        : [...prev.productCategories, categoryName]
    }));
  };

  const availableCertifications = [
    'ISO 9001', 'ISO 14001', 'CE Marking', 'FDA Approved', 'GMP Certified',
    'HACCP', 'Organic Certified', 'Fair Trade', 'BSCI Audit'
  ];

  const handleCertificationChange = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Solomon Bharat</h1>
          <p className="text-gray-600">Create your supplier account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="yearsInBusiness" className="block text-sm font-medium text-gray-700 mb-1">
                Years in Business
              </label>
              <input
                id="yearsInBusiness"
                name="yearsInBusiness"
                type="number"
                min="0"
                value={formData.yearsInBusiness}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Product Categories * (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories?.map(category => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.productCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Certifications (Optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto">
              {availableCertifications.map(cert => (
                <label key={cert} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.certifications.includes(cert)}
                    onChange={() => handleCertificationChange(cert)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || formData.productCategories.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Creating account...
              </>
            ) : (
              'Create Supplier Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-500">
              Sign in
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Looking to buy products?{' '}
            <Link to="/register" className="text-green-600 hover:text-green-500">
              Register as Buyer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupplierRegisterPage;