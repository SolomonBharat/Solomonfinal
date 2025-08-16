import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, DollarSign, User, LogOut, Bell, Eye, Send, MapPin, Star, Award, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  buyer_company: string;
  buyer_country: string;
  delivery_timeline: string;
  created_at: string;
  status: 'new' | 'quoted' | 'expired';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  match_score?: number;
  max_price?: number;
  shipping_terms?: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
}

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRfqDetailsModal, setShowRfqDetailsModal] = useState(false);

  useEffect(() => {
    // Get supplier's categories from onboarded suppliers
    const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    const currentSupplier = onboardedSuppliers.find((s: any) => {
      return s.email === user?.email || 
             s.contactPerson === user?.name ||
             s.contact_person === user?.name;
    });
    
    let supplierCategories = [];
    if (currentSupplier && (currentSupplier.productCategories || currentSupplier.product_categories)) {
      supplierCategories = currentSupplier.productCategories || currentSupplier.product_categories;
    } else {
      // If no supplier found, show all categories for demo
      supplierCategories = [
        'Textiles & Apparel',
        'Spices & Food Products', 
        'Handicrafts & Home Decor',
        'Electronics & Components'
      ];
    }
    
    // Load approved RFQs from localStorage that match supplier's categories
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    
    // Show only approved and matched RFQs that match supplier's categories
    const availableRFQs = userRFQs.filter((rfq: any) => 
      (rfq.status === 'approved' || rfq.status === 'matched') && 
      supplierCategories.includes(rfq.category)
    ).map((rfq: any) => {
      // Check if THIS SPECIFIC supplier has already quoted for this RFQ
      const hasQuoted = supplierQuotations.some((q: any) => {
        return q.rfq_id === rfq.id && (
          q.supplier_email === user?.email || 
          q.supplier_name === user?.name ||
          q.supplier_id === user?.id
        );
      });
      );
      
      return {
        ...rfq,
        target_price: parseFloat(rfq.target_price) || 0,
        buyer_company: rfq.buyer_company || 'Buyer Company',
        buyer_country: rfq.buyer_country || 'Country',
        delivery_timeline: rfq.delivery_timeline || '30 days',
        status: hasQuoted ? 'quoted' as const : 'new' as const,
        urgency: 'medium' as const,
        match_score: 90
      };
    });
    
    setRfqs(availableRFQs);
  }, [user?.email]);

  const [stats, setStats] = useState({
    total_rfqs: 0,
    new_rfqs: 0,
    quotes_sent: 0,
    monthly_revenue: 0
  });

  useEffect(() => {
    // Calculate real stats
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const userQuotations = supplierQuotations.filter((q: any) => q.supplier_email === user?.email);
    const sentQuotes = userQuotations.filter((q: any) => q.status !== 'pending_review');
    const acceptedQuotes = userQuotations.filter((q: any) => q.status === 'accepted');
    const monthlyRevenue = acceptedQuotes.reduce((sum: number, q: any) => sum + (q.total_value || 0), 0);

    setStats({
      total_rfqs: rfqs.length,
      new_rfqs: rfqs.filter(rfq => rfq.status === 'new').length,
      quotes_sent: sentQuotes.length,
      monthly_revenue: monthlyRevenue
    });
  }, [rfqs, user?.email]);

  const handleQuoteSubmit = (rfqId: string) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (rfq) {
      // Redirect to quote page
      window.location.href = `/supplier/quote/${rfqId}`;
    }
  };

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      quoted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges];
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[urgency as keyof typeof badges];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600">Solomon Bharat</Link>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="text-gray-600 text-sm sm:text-base">Supplier Portal</span>
            </div>
            <div className="flex items-center justify-between sm:justify-end space-x-4">
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700 truncate max-w-32 sm:max-w-none">{user?.name || 'Supplier User'}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || 'Supplier'}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your quotations and connect with global buyers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total RFQs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_rfqs}</p>
              </div>
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">New RFQs</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.new_rfqs}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Quotes Sent</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.quotes_sent}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">${stats.monthly_revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Available RFQs */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Available RFQs for Your Category</h2>
            <p className="text-gray-600 text-sm sm:text-base">Opportunities matched to your expertise</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Match Score Badge */}
                <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium text-sm">
                      {rfq.match_score}% Match
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getUrgencyBadge(rfq.urgency)}`}>
                      {rfq.urgency} priority
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {rfq.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Buyer from {rfq.buyer_country}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">Quantity:</span>
                      <p className="font-medium text-sm">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Target Price:</span>
                      <p className="font-medium text-sm">${rfq.target_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Timeline:</span>
                      <p className="font-medium text-sm">{rfq.delivery_timeline}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Total Value:</span>
                      <p className="font-medium text-sm text-green-600">${(rfq.target_price * rfq.quantity).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{rfq.description}</p>
                    {rfq.additional_requirements && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Special Requirements:</strong> {rfq.additional_requirements.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    {rfq.status === 'new' && (
                      <Link
                        to={`/supplier/quote/${rfq.id}`}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-1"
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit Quote</span>
                      </Link>
                    )}
                    {rfq.status === 'quoted' && (
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="bg-green-50 text-green-700 py-2 px-3 rounded-md text-sm font-medium text-center">
                          ✅ Quote Submitted
                        </div>
                        <Link
                          to={`/supplier/quote/${rfq.id}?edit=true`}
                          className="bg-blue-50 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100 text-center"
                        >
                          Edit Quote
                        </Link>
                      </div>
                    )}
                    <button 
                      onClick={() => handleViewRfqDetails(rfq)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rfqs.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Available</h3>
              <p className="text-gray-600 mb-6">
                No approved RFQs match your product categories yet.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link 
            to="/supplier/quotations"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">My Quotations</h3>
                <p className="text-xs sm:text-sm text-gray-600">View all submitted quotes</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/supplier/profile"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Company Profile</h3>
                <p className="text-xs sm:text-sm text-gray-600">Update your business details</p>
              </div>
            </div>
          </Link>

          <a 
            href="https://wa.me/918595135554" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Need Support?</h3>
                <p className="text-xs sm:text-sm text-gray-600">Contact our team for help</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* RFQ Details Modal */}
      {showRfqDetailsModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">RFQ Details</h3>
              <button
                onClick={() => setShowRfqDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {/* Buyer Information */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Buyer</label>
                      <p className="mt-1 text-sm text-blue-900 font-medium">{selectedRfq.buyer_name || 'International Buyer'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Country</label>
                      <p className="mt-1 text-sm text-blue-900">{selectedRfq.buyer_country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Requirements</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Title</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{selectedRfq.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRfq.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{selectedRfq.quantity.toLocaleString()} {selectedRfq.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Match Score</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      {selectedRfq.match_score}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">Target Price</label>
                    <p className="mt-1 text-xl font-bold text-green-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-green-600">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  {selectedRfq.max_price && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-orange-700">Maximum Price</label>
                      <p className="mt-1 text-xl font-bold text-orange-900">${selectedRfq.max_price.toFixed(2)}</p>
                      <p className="text-sm text-orange-600">per {selectedRfq.unit.slice(0, -1)}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Total Budget</label>
                    <p className="mt-1 text-xl font-bold text-blue-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-blue-600">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRfq.description}</p>
                </div>
              </div>

              {/* Requirements & Terms */}
              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Terms</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Timeline</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRfq.delivery_timeline}</p>
                  </div>
                  {selectedRfq.shipping_terms && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shipping Terms</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.shipping_terms}</p>
                    </div>
                  )}
                  {selectedRfq.quality_standards && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quality Standards</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.quality_standards}</p>
                    </div>
                  )}
                  {selectedRfq.certifications_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Required Certifications</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.certifications_needed}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Requirements */}
              {selectedRfq.additional_requirements && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Requirements</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">{selectedRfq.additional_requirements}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posted Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(selectedRfq.urgency)} mt-1`}>
                      {selectedRfq.urgency} priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
              <button
                onClick={() => setShowRfqDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {selectedRfq.status === 'new' && (
                <button
                  onClick={() => {
                    setShowRfqDetailsModal(false);
                    handleQuoteSubmit(selectedRfq.id);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Quote</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;