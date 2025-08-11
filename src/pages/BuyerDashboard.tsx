import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, X, User, LogOut, Bell, Eye, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: 'pending' | 'approved' | 'matched' | 'quoted' | 'closed';
  created_at: string;
  quotations_count: number;
  description?: string;
  delivery_timeline?: string;
  shipping_terms?: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  max_price?: number;
}

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);

  useEffect(() => {
    // Load user's RFQs from localStorage and demo RFQs
    const allRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    
    // Check for quotations that have been sent to buyer
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const sentQuotations = supplierQuotations.filter((q: any) => q.status === 'sent_to_buyer');
    
    // Filter RFQs to show only the current user's RFQs
    const userRFQs = allRFQs.filter((rfq: any) => rfq.buyer_id === user?.id).map((rfq: any) => {
      // Check if this RFQ has quotations
      const rfqQuotations = sentQuotations.filter((q: any) => q.rfq_id === rfq.id);
      
      // Ensure all numeric fields are properly converted
      const convertedRFQ = {
        ...rfq,
        quantity: parseInt(rfq.quantity) || 0,
        target_price: parseFloat(rfq.target_price) || 0,
        quotations_count: rfqQuotations.length
      };
      
      // Update status based on quotations
      if (rfqQuotations.length > 0) {
        convertedRFQ.status = 'quoted';
      }
      
      return convertedRFQ;
    });
    
    setRfqs(userRFQs);
  }, [user?.id]);

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqModal(true);
  };
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'matched': return <CheckCircle className="h-4 w-4" />;
      case 'quoted': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-blue-600">Solomon Bharat</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Buyer Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">
            Manage your sourcing requests and connect with verified Indian suppliers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active RFQs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.filter(rfq => ['approved', 'matched', 'quoted'].includes(rfq.status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quotations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.reduce((sum, rfq) => sum + rfq.quotations_count, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <Link 
            to="/create-rfq" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm border border-blue-600 transition-colors flex items-center justify-center"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Create RFQ</p>
            </div>
          </Link>
        </div>

        {/* RFQs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your RFQs</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-sm text-gray-500">{rfq.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {rfq.quantity.toLocaleString()} {rfq.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${rfq.target_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                        {getStatusIcon(rfq.status)}
                        <span className="capitalize">{rfq.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {rfq.quotations_count > 0 ? (
                        <span className="text-green-600 font-medium">{rfq.quotations_count} received</span>
                      ) : (
                        <span className="text-gray-400">None yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(rfq.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {rfq.status === 'matched' && (
                        <Link 
                          to={`/rfq/${rfq.id}/suppliers`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Suppliers
                        </Link>
                      )}
                      {rfq.status === 'quoted' && (
                        <div className="flex flex-col space-y-1">
                          <Link 
                            to={`/rfq/${rfq.id}/quotations`}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            View Quotes ({rfq.quotations_count})
                          </Link>
                        </div>
                      )}
                      {rfq.status === 'matched' && (
                        <div className="text-green-600 font-medium">
                          ✅ Quote Accepted - Order Matched!
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link 
            to="/my-rfqs"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">My RFQs</h3>
                <p className="text-sm text-gray-600">View all your sourcing requests</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/profile"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-600">Manage your company details</p>
              </div>
      {/* RFQ Details Modal */}
      {showRfqModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">📋 RFQ Details</h3>
                <p className="text-sm text-gray-500 mt-1">Complete information about your sourcing request</p>
              </div>
              <button
                onClick={() => setShowRfqModal(false)}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)] bg-gray-50">
              {/* Basic Information */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📝 Basic Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-blue-800 mb-2">📦 Product Title</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                      <p className="text-lg text-gray-900 font-semibold">{selectedRfq.title}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-800 mb-2">🏷️ Category</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                      <p className="text-lg text-gray-900">{selectedRfq.category}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-800 mb-2">📊 Quantity</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                      <p className="text-lg text-gray-900 font-semibold">{selectedRfq.quantity.toLocaleString()} {selectedRfq.unit}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-blue-800 mb-2">📈 Status</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRfq.status)}`}>
                        {getStatusIcon(selectedRfq.status)}
                        <span className="capitalize">{selectedRfq.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  💰 Pricing Information
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-lg">
                    <label className="block text-sm font-bold text-green-800 mb-2">🎯 Target Price</label>
                    <p className="text-4xl font-bold text-green-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-green-600 mt-1 font-medium">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  {selectedRfq.max_price && (
                    <div className="bg-white p-6 rounded-xl border-2 border-orange-300 shadow-lg">
                      <label className="block text-sm font-bold text-orange-800 mb-2">🔺 Maximum Price</label>
                      <p className="text-4xl font-bold text-orange-900">${selectedRfq.max_price.toFixed(2)}</p>
                      <p className="text-sm text-orange-600 mt-1 font-medium">per {selectedRfq.unit.slice(0, -1)}</p>
                    </div>
                  )}
                  <div className="bg-white p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                    <label className="block text-sm font-bold text-purple-800 mb-2">💵 Total Budget</label>
                    <p className="text-4xl font-bold text-purple-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-purple-600 mt-1 font-medium">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {selectedRfq.description && (
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                  <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    📝 Product Description
                  </h4>
                  <div className="bg-white p-6 rounded-lg border-2 border-purple-300 shadow-sm">
                    <p className="text-gray-800 leading-relaxed text-lg">{selectedRfq.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements & Terms */}
              <div className="mb-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Requirements & Terms
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedRfq.delivery_timeline && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Delivery Timeline</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.delivery_timeline}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.shipping_terms && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Shipping Terms</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.shipping_terms}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.quality_standards && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Quality Standards</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.quality_standards}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.certifications_needed && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Required Certifications</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.certifications_needed}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Requirements */}
              {selectedRfq.additional_requirements && (
                <div className="mb-8 bg-red-50 rounded-lg p-6 border border-red-200">
                  <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Additional Requirements
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed">{selectedRfq.additional_requirements}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Timeline & Status
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quotations Received</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">
                        {selectedRfq.quotations_count > 0 ? `${selectedRfq.quotations_count} quotations` : 'No quotations yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">📋 RFQ ID:</span> {selectedRfq.id} • <span className="font-semibold">📅 Created:</span> {new Date(selectedRfq.created_at).toLocaleDateString()}
              </div>
              <button
                onClick={() => setShowRfqModal(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
              >
                ✅ Close
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
          </Link>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Need Help?</h3>
                <p className="text-sm text-gray-600">Contact our sourcing experts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;