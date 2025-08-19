import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Save, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { categoryService, CategoryConfig } from '../lib/categoryManagement';

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    requirements: {
      min_certifications: [] as string[],
      required_documents: [] as string[],
      min_experience_years: 1,
      min_annual_turnover: '$100K - $500K'
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    setCategories(categoryService.getConfiguredCategories());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData, updated_at: new Date().toISOString() }
          : cat
      );
      localStorage.setItem('configured_categories', JSON.stringify(updatedCategories));
    } else {
      // Create new category
      categoryService.createCategoryConfig({
        ...formData,
        created_by: 'admin_user'
      });
    }

    resetForm();
    loadCategories();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
      requirements: {
        min_certifications: [],
        required_documents: [],
        min_experience_years: 1,
        min_annual_turnover: '$100K - $500K'
      }
    });
    setEditingCategory(null);
    setShowCreateModal(false);
  };

  const handleEdit = (category: CategoryConfig) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      active: category.active,
      requirements: category.requirements
    });
    setShowCreateModal(true);
  };

  const handleToggleActive = (categoryId: string) => {
    const updatedCategories = categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, active: !cat.active, updated_at: new Date().toISOString() }
        : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem('configured_categories', JSON.stringify(updatedCategories));
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      localStorage.setItem('configured_categories', JSON.stringify(updatedCategories));
    }
  };

  const availableCertifications = [
    'ISO 9001', 'ISO 14001', 'ISO 45001', 'CE Marking', 'FDA Approved',
    'GMP Certified', 'HACCP', 'Organic Certified', 'Fair Trade',
    'BSCI Audit', 'Sedex Audit', 'WRAP Certified', 'GOTS', 'OEKO-TEX'
  ];

  const availableDocuments = [
    'GST Certificate', 'IEC Code', 'Export License', 'Factory License',
    'Quality Certificates', 'Audit Reports', 'Insurance Documents'
  ];

  const turnoverOptions = [
    'Under $100K', '$100K - $500K', '$500K - $1M', '$1M - $5M', '$5M - $10M', 'Above $10M'
  ];

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
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Category Management</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management</h1>
              <p className="text-gray-600">Configure product categories and supplier requirements</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(category.id)}
                        className={`${category.active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {category.active ? <X className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Min. Experience:</span>
                      <span className="ml-2 text-sm text-gray-900">{category.requirements.min_experience_years} years</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Min. Turnover:</span>
                      <span className="ml-2 text-sm text-gray-900">{category.requirements.min_annual_turnover}</span>
                    </div>
                    {category.requirements.min_certifications.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Required Certifications:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {category.requirements.min_certifications.map((cert, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Configured</h3>
              <p className="text-gray-600 mb-6">
                Configure product categories to enable supplier onboarding
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Create First Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Active for onboarding
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.requirements.min_experience_years}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        min_experience_years: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min. Annual Turnover *
                  </label>
                  <select
                    required
                    value={formData.requirements.min_annual_turnover}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      requirements: {
                        ...prev.requirements,
                        min_annual_turnover: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {turnoverOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Certifications
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                  {availableCertifications.map(cert => (
                    <label key={cert} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.requirements.min_certifications.includes(cert)}
                        onChange={(e) => {
                          const newCerts = e.target.checked
                            ? [...formData.requirements.min_certifications, cert]
                            : formData.requirements.min_certifications.filter(c => c !== cert);
                          setFormData(prev => ({
                            ...prev,
                            requirements: {
                              ...prev.requirements,
                              min_certifications: newCerts
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Documents
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {availableDocuments.map(doc => (
                    <label key={doc} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.requirements.required_documents.includes(doc)}
                        onChange={(e) => {
                          const newDocs = e.target.checked
                            ? [...formData.requirements.required_documents, doc]
                            : formData.requirements.required_documents.filter(d => d !== doc);
                          setFormData(prev => ({
                            ...prev,
                            requirements: {
                              ...prev.requirements,
                              required_documents: newDocs
                            }
                          }));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingCategory ? 'Update' : 'Create'} Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManagement;