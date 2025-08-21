import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  X, 
  User, 
  LogOut, 
  Bell, 
  Eye, 
  DollarSign,
  Star,
  Award,
  MapPin,
  Building,
  MessageCircle,
  Package,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: 'pending_approval' | 'approved' | 'matched' | 'quoted' | 'closed' | 'rejected';
  created_at: string;
  buyer_company: string;
  buyer_country: string;
  description: string;
  delivery_timeline: string;
  shipping_terms: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  images?: string[];
}

interface Query {
  id: string;
  rfq_id: string;
  rfq_title: string;
  buyer_company: string;
  question: string;
  status: 'forwarded_to_buyer' | 'buyer_responded';
  created_at: string;
  buyer_response?: string;
}

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [buyerResponse, setBuyerResponse] = useState('');

  useEffect(() => {
    // Load approved RFQs that match supplier's category
    const allRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const supplierCategory = user?.product_categories?.[0] || 'Textiles & Apparel';
    
    // Filter RFQs that are approved and match supplier's category
    const matchedRFQs = allRFQs.filter((rfq: any) => 
      rfq.status === 'approved' && rfq.category === supplierCategory
    ).map((rfq: any) => ({
      ...rfq,
      quantity: parseInt(rfq.quantity) || 0,
      target_price: parseFloat(rfq.target_price) || 0
    }));
    
    setRfqs(matchedRFQs);
  }, [user?.product_categories]);

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqModal(true);
  };

  const handleQuoteNow = (rfqId: string) => {
    // Navigate to quote submission page
    window.location.href = `/supplier/quote/${rfqId}`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.pending_approval;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'matched': return <CheckCircle className="h-4 w-4" />;
      case 'quoted': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <X className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
                <span className="text-gray-600">Supplier Dashboard</span>
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
              Find new business opportunities and manage your quotations
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">My Quotations</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Win Rate</p>
                  <p className="text-2xl font-bold text-gray-900">68%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Available RFQs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Available RFQs for Your Category</h2>
              <p className="text-sm text-gray-600 mt-1">
                RFQs matching your specialization: {user?.product_categories?.[0] || 'Textiles & Apparel'}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timeline
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
                          <p className="text-xs text-gray-400">Posted: {new Date(rfq.created_at).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rfq.buyer_company}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{rfq.buyer_country}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">${rfq.target_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">per {rfq.unit.slice(0, -1)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rfq.delivery_timeline}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewRfqDetails(rfq)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => handleQuoteNow(rfq.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-medium"
                          >
                            Quote Now
                          </button>
                        </div>
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
              to="/supplier/quotations"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">My Quotations</h3>
                  <p className="text-sm text-gray-600">View all submitted quotes</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/supplier/profile"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Update Profile</h3>
                  <p className="text-sm text-gray-600">Manage company details</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/supplier/performance"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Performance</h3>
                  <p className="text-sm text-gray-600">View analytics & insights</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* RFQ Details Modal */}
      {showRfqModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">📋 RFQ Details</h3>
                <p className="text-sm text-gray-500 mt-1">Complete buyer requirements and specifications</p>
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

              {/* Buyer Information */}
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  🏢 Buyer Information
                </h4>
                <div className="bg-white p-4 rounded-lg border-2 border-purple-300 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-purple-800 mb-2">🏢 Company</label>
                      <p className="text-lg font-bold text-purple-900">{selectedRfq.buyer_company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-purple-800 mb-2">🌍 Location</label>
                      <p className="text-lg text-purple-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedRfq.buyer_country}
                      </p>
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-lg">
                    <label className="block text-sm font-bold text-green-800 mb-2">🎯 Target Price</label>
                    <p className="text-4xl font-bold text-green-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-green-600 mt-1 font-medium">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border-2 border-purple-300 shadow-lg">
                    <label className="block text-sm font-bold text-purple-800 mb-2">💵 Total Budget</label>
                    <p className="text-4xl font-bold text-purple-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-purple-600 mt-1 font-medium">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {selectedRfq.description && (
                <div className="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200 shadow-sm">
                  <h4 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    📝 Product Description
                  </h4>
                  <div className="bg-white p-6 rounded-lg border-2 border-yellow-300 shadow-sm">
                    <p className="text-gray-800 leading-relaxed text-lg">{selectedRfq.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements & Terms */}
              <div className="mb-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
                <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Requirements & Terms
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedRfq.delivery_timeline && (
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Delivery Timeline</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.delivery_timeline}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.shipping_terms && (
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Shipping Terms</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.shipping_terms}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.quality_standards && (
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Quality Standards</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedRfq.quality_standards}</p>
                      </div>
                    </div>
                  )}
                  {selectedRfq.certifications_needed && (
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Required Certifications</label>
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

              {/* Buyer Product Images */}
              {selectedRfq.images && selectedRfq.images.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                  <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    📸 Buyer's Product Images
                  </h4>
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-300 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedRfq.images.map((image, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={image}
                            alt={`Product requirement ${index + 1}`}
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
                      💡 These images show the buyer's exact requirements. Use them to understand specifications and provide accurate quotes.
                    </p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posted Date</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Required</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{selectedRfq.delivery_timeline}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">📋 RFQ ID:</span> {selectedRfq.id} • <span className="font-semibold">🏢 Buyer:</span> {selectedRfq.buyer_company}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRfqModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowRfqModal(false);
                    handleQuoteNow(selectedRfq.id);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                >
                  🚀 Quote Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupplierDashboard;