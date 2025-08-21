import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, X, User, LogOut, Bell, Eye, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/mockData';
import type { RFQ } from '../lib/mockData';

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);

  useEffect(() => {
    // Load user's RFQs from localStorage
    const loadRFQs = () => {
      if (user?.id) {
        const allRfqs = storage.get('rfqs');
        const userRfqs = allRfqs.filter((rfq: RFQ) => rfq.buyer_id === user.id);
        setRfqs(userRfqs);
      }
    };

    loadRFQs();
  }, [user?.id]);

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqModal(true);
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Awaiting admin review';
      case 'approved': return 'Approved - Finding suppliers';
      case 'matched': return 'Suppliers found - Requesting quotes';
      case 'quoted': return 'Quotations received';
      case 'closed': return 'RFQ completed';
      case 'rejected': return 'RFQ rejected';
      default: return 'Processing';
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
                  {rfqs.reduce((sum, rfq) => sum + (rfq.quotations_count || 0), 0)}
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
          
          {rfqs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
              <p className="text-gray-600 mb-6">Create your first RFQ to start sourcing from India</p>
              <Link 
                to="/create-rfq"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First RFQ</span>
              </Link>
            </div>
          ) : (
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
                          <span className="capitalize">{rfq.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewRfqDetails(rfq)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

      {/* RFQ Details Modal */}
      {showRfqModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">RFQ Details</h3>
              <button
                onClick={() => setShowRfqModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRfq.status)} mt-1`}>
                      {getStatusIcon(selectedRfq.status)}
                      <span className="capitalize">{selectedRfq.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Target Price</label>
                    <p className="mt-1 text-xl font-bold text-blue-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  {selectedRfq.max_price && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-orange-700">Maximum Price</label>
                      <p className="mt-1 text-xl font-bold text-orange-900">${selectedRfq.max_price.toFixed(2)}</p>
                      <p className="text-sm text-orange-600">per {selectedRfq.unit.slice(0, -1)}</p>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">Total Budget</label>
                    <p className="mt-1 text-xl font-bold text-green-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-green-600">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {selectedRfq.description && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRfq.description}</p>
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Current Status:</strong> {getStatusMessage(selectedRfq.status)}
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRfqModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;