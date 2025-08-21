import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  X, 
  Eye,
  DollarSign,
  Building,
  Award,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Image
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface QuotationReview {
  id: string;
  rfq_title: string;
  supplier_name: string;
  supplier_company: string;
  supplier_location: string;
  supplier_email: string;
  supplier_phone: string;
  quoted_price: number;
  moq: number;
  lead_time: string;
  payment_terms: string;
  shipping_terms: string;
  validity_days: number;
  quality_guarantee: boolean;
  sample_available: boolean;
  notes: string;
  status: 'pending_review' | 'approved' | 'rejected';
  submitted_at: string;
  total_value: number;
  images?: string[];
  supplier_details?: {
    business_type: string;
    years_in_business: string;
    annual_turnover: string;
    employee_count: string;
    gst_number: string;
    iec_code: string;
    production_capacity: string;
    export_countries: string;
    about_company: string;
    factory_photos: string[];
    factory_video: string;
    certifications: string[];
    quality_standards: string;
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [quotationsForReview, setQuotationsForReview] = useState<QuotationReview[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationReview | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  useEffect(() => {
    // Load quotations pending admin review
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    
    // Merge quotations with complete supplier details from onboarding
    const quotationsWithSupplierDetails = supplierQuotations.map((quote: any) => {
      const supplierDetails = onboardedSuppliers.find((supplier: any) => 
        supplier.email === quote.supplier_email || 
        supplier.company_name === quote.supplier_company
      );
      
      return {
        ...quote,
        supplier_details: supplierDetails ? {
          business_type: supplierDetails.business_type,
          years_in_business: supplierDetails.years_in_business,
          annual_turnover: supplierDetails.annual_turnover,
          employee_count: supplierDetails.employee_count,
          gst_number: supplierDetails.gst_number,
          iec_code: supplierDetails.iec_code,
          production_capacity: supplierDetails.production_capacity,
          export_countries: supplierDetails.export_countries,
          about_company: supplierDetails.about_company,
          factory_photos: supplierDetails.factory_photos || [],
          factory_video: supplierDetails.factory_video,
          certifications: supplierDetails.certifications || [],
          quality_standards: supplierDetails.quality_standards
        } : null
      };
    });
    
    setQuotationsForReview(quotationsWithSupplierDetails);
  }, []);

  const [stats] = useState({
    total_users: 1247,
    pending_rfqs: 8,
    pending_quotations: 12,
    monthly_gmv: 2400000
  });

  const handleApproveQuotation = (quotationId: string) => {
    setQuotationsForReview(prev => prev.map(q => 
      q.id === quotationId ? { ...q, status: 'approved' as const } : q
    ));
    
    // Update in localStorage and mark as sent to buyer
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'sent_to_buyer' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    
    alert('Quotation approved and sent to buyer!');
  };

  const handleRejectQuotation = (quotationId: string) => {
    setQuotationsForReview(prev => prev.map(q => 
      q.id === quotationId ? { ...q, status: 'rejected' as const } : q
    ));
    
    // Update in localStorage
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'rejected' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    
    alert('Quotation rejected.');
  };

  const handleViewQuotationDetails = (quotation: QuotationReview) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-2xl font-bold text-blue-600">Solomon Bharat</Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">Admin Dashboard</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('solomon_user');
                    localStorage.removeItem('solomon_user_type');
                    window.location.href = '/';
                  }}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage the Solomon Bharat platform and oversee all operations
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending RFQs</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending_rfqs}</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Quotations</p>
                    <p className="text-2xl font-bold text-orange-600">{quotationsForReview.filter(q => q.status === 'pending_review').length}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Monthly GMV</p>
                    <p className="text-2xl font-bold text-green-600">${(stats.monthly_gmv / 1000000).toFixed(1)}M</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Link 
                to="/admin/rfqs"
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Manage RFQs</h3>
                    <p className="text-sm text-gray-600">Review and approve RFQs</p>
                  </div>
                </div>
              </Link>

              <Link 
                to="/admin/suppliers"
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Supplier Network</h3>
                    <p className="text-sm text-gray-600">Manage verified suppliers</p>
                  </div>
                </div>
              </Link>

              <Link 
                to="/admin/onboard-supplier"
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm border border-blue-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8" />
                  <div>
                    <h3 className="font-semibold">Onboard Supplier</h3>
                    <p className="text-sm text-blue-100">Add new verified supplier</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Quotations Pending Review */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quotations Pending Review</h2>
                <p className="text-sm text-gray-600">Review and approve supplier quotations before sending to buyers</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RFQ & Supplier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quote Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quotationsForReview.map((quotation) => (
                      <tr key={quotation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{quotation.rfq_title}</p>
                            <p className="text-sm text-gray-600">{quotation.supplier_company}</p>
                            <p className="text-xs text-gray-500">{quotation.supplier_location}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">${quotation.quoted_price.toFixed(2)} per unit</p>
                            <p className="text-sm text-gray-600">MOQ: {quotation.moq.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Total: ${quotation.total_value.toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">{quotation.lead_time}</p>
                            <p className="text-xs text-gray-500">{quotation.payment_terms}</p>
                            <p className="text-xs text-gray-500">{quotation.shipping_terms}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {quotation.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewQuotationDetails(quotation)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 inline mr-1" />
                              Review
                            </button>
                            {quotation.status === 'pending_review' && (
                              <>
                                <button
                                  onClick={() => handleApproveQuotation(quotation.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectQuotation(quotation.id)}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {quotationsForReview.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations pending review</h3>
                  <p className="text-gray-600">All quotations have been reviewed and processed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quotation Review Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">🔍 Admin Quotation Review</h3>
                <p className="text-sm text-gray-500 mt-1">Complete supplier and quotation details for approval</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* RFQ Information */}
              <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📋 RFQ Information
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">RFQ Title</label>
                      <p className="text-lg font-bold text-blue-900">{selectedQuotation.rfq_title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Quotation ID</label>
                      <p className="text-sm text-blue-900 font-mono">{selectedQuotation.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Supplier Information */}
              <div className="mb-8 bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  🏢 Complete Supplier Profile
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  {/* Basic Contact */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Company Name</label>
                      <p className="text-lg font-bold text-green-900">{selectedQuotation.supplier_company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Contact Person</label>
                      <p className="text-sm text-green-900">{selectedQuotation.supplier_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Email</label>
                      <p className="text-sm text-green-900 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {selectedQuotation.supplier_email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Phone</label>
                      <p className="text-sm text-green-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {selectedQuotation.supplier_phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">Location</label>
                      <p className="text-sm text-green-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedQuotation.supplier_location}
                      </p>
                    </div>
                  </div>

                  {/* Business Details from Onboarding */}
                  {selectedQuotation.supplier_details && (
                    <div className="border-t border-green-200 pt-6">
                      <h5 className="text-lg font-semibold text-green-900 mb-4">📊 Business Details (From Onboarding)</h5>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Business Type</label>
                          <p className="text-sm text-green-900 font-medium">{selectedQuotation.supplier_details.business_type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Years in Business</label>
                          <p className="text-sm text-green-900 font-medium">{selectedQuotation.supplier_details.years_in_business} years</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Annual Turnover</label>
                          <p className="text-sm text-green-900 font-medium">{selectedQuotation.supplier_details.annual_turnover}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Employee Count</label>
                          <p className="text-sm text-green-900 font-medium">{selectedQuotation.supplier_details.employee_count}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">GST Number</label>
                          <p className="text-sm text-green-900 font-mono">{selectedQuotation.supplier_details.gst_number}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">IEC Code</label>
                          <p className="text-sm text-green-900 font-mono">{selectedQuotation.supplier_details.iec_code}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Production Capacity</label>
                          <p className="text-sm text-green-900 font-medium">{selectedQuotation.supplier_details.production_capacity}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Export Countries</label>
                          <p className="text-sm text-green-900">{selectedQuotation.supplier_details.export_countries}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-green-700 mb-1">Certifications</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedQuotation.supplier_details.certifications.map((cert, index) => (
                              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* About Company */}
                      {selectedQuotation.supplier_details.about_company && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-green-700 mb-2">About Company</label>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 leading-relaxed">{selectedQuotation.supplier_details.about_company}</p>
                          </div>
                        </div>
                      )}

                      {/* Quality Standards */}
                      {selectedQuotation.supplier_details.quality_standards && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-green-700 mb-2">Quality Standards</label>
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">{selectedQuotation.supplier_details.quality_standards}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Factory Media from Onboarding */}
              {selectedQuotation.supplier_details && (selectedQuotation.supplier_details.factory_photos?.length > 0 || selectedQuotation.supplier_details.factory_video) && (
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                  <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    🏭 Factory & Production Facility (Admin Verification)
                  </h4>
                  
                  {/* Factory Photos */}
                  {selectedQuotation.supplier_details.factory_photos?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-lg font-semibold text-purple-900 mb-3">📸 Factory Photos (From Onboarding)</h5>
                      <div className="bg-white p-4 rounded-lg border-2 border-purple-300 shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedQuotation.supplier_details.factory_photos.map((photo, index) => (
                            <div key={index} className="group relative">
                              <img
                                src={photo}
                                alt={`Factory view ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border-2 border-purple-200 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.open(photo, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-purple-700 mt-3 font-medium">
                          🔍 <strong>Admin Note:</strong> These are the actual factory photos submitted during supplier onboarding. Verify production capabilities.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Factory Video */}
                  {selectedQuotation.supplier_details.factory_video && (
                    <div>
                      <h5 className="text-lg font-semibold text-purple-900 mb-3">🎥 Factory Video Tour (From Onboarding)</h5>
                      <div className="bg-white p-4 rounded-lg border-2 border-purple-300 shadow-sm">
                        <video
                          src={selectedQuotation.supplier_details.factory_video}
                          className="w-full h-64 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                          controls
                          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f9ff'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-family='Arial' font-size='12' fill='%23374151'%3EFactory Video%3C/text%3E%3C/svg%3E"
                        />
                        <p className="text-sm text-purple-700 mt-3 font-medium">
                          🎬 <strong>Admin Note:</strong> Factory video tour submitted during onboarding. Review production processes and quality control.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quotation Details */}
              <div className="mb-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  💰 Quotation Details
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Price per Unit</label>
                    <p className="text-3xl font-bold text-blue-900">${selectedQuotation.quoted_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-2">Total Value</label>
                    <p className="text-3xl font-bold text-green-900">${selectedQuotation.total_value.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                    <label className="block text-sm font-medium text-purple-700 mb-2">MOQ</label>
                    <p className="text-3xl font-bold text-purple-900">{selectedQuotation.moq.toLocaleString()}</p>
                    <p className="text-sm text-purple-600 mt-1">pieces</p>
                  </div>
                </div>
              </div>

              {/* Complete Terms & Conditions */}
              <div className="mb-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📋 Complete Terms & Conditions
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Lead Time</label>
                    <div className="bg-white p-3 rounded-md border-2 border-orange-200">
                      <p className="text-sm text-gray-900 font-bold">{selectedQuotation.lead_time}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Payment Terms</label>
                    <div className="bg-white p-3 rounded-md border-2 border-orange-200">
                      <p className="text-sm text-gray-900 font-medium">{selectedQuotation.payment_terms}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Shipping Terms (Incoterms)</label>
                    <div className="bg-white p-3 rounded-md border-2 border-orange-200">
                      <p className="text-sm text-gray-900 font-medium">{selectedQuotation.shipping_terms}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Quote Validity</label>
                    <div className="bg-white p-3 rounded-md border-2 border-orange-200">
                      <p className="text-sm text-gray-900 font-bold">{selectedQuotation.validity_days} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality Guarantees & Services */}
              <div className="mb-8 bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  🏆 Quality Guarantees & Services
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full ${selectedQuotation.quality_guarantee ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                        {selectedQuotation.quality_guarantee ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <X className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Quality Guarantee</span>
                        <p className={`text-lg font-bold ${selectedQuotation.quality_guarantee ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedQuotation.quality_guarantee ? '✅ Included' : '❌ Not Included'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-indigo-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full ${selectedQuotation.sample_available ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center`}>
                        {selectedQuotation.sample_available ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <X className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sample Available</span>
                        <p className={`text-lg font-bold ${selectedQuotation.sample_available ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedQuotation.sample_available ? '✅ Yes' : '❌ No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Notes */}
              {selectedQuotation.notes && (
                <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    📝 Supplier Notes & Additional Terms
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}

              {/* Supplier Product Images */}
              {selectedQuotation.images && selectedQuotation.images.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                  <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    📸 Supplier Product Images (With Quote)
                  </h4>
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedQuotation.images.map((image, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={image}
                            alt={`Supplier product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-blue-200 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 mt-3 font-medium">
                      💡 <strong>Admin Note:</strong> These are product images submitted by the supplier with this specific quotation
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Decision Section */}
              <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  🔍 Admin Review & Decision
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Submission Date</label>
                      <p className="text-sm text-red-900 font-medium">{new Date(selectedQuotation.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Current Status</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {selectedQuotation.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>⚠️ Admin Review Required:</strong> Please verify all supplier details, terms, and pricing before approving this quotation for buyer review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <strong>Quotation ID:</strong> {selectedQuotation.id} • <strong>Total Value:</strong> ${selectedQuotation.total_value.toLocaleString()}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedQuotation.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => {
                        handleRejectQuotation(selectedQuotation.id);
                        setShowQuotationModal(false);
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApproveQuotation(selectedQuotation.id);
                        setShowQuotationModal(false);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      ✅ Approve & Send to Buyer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;