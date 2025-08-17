import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRFQs, useOrders } from '../lib/queries';
import { Plus, FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BuyerDashboard = () => {
  const { profile } = useAuth();
  const { data: rfqs = [], isLoading: rfqsLoading } = useRFQs({ buyer_id: profile?.id });
  const { data: orders = [], isLoading: ordersLoading } = useOrders({ buyer_id: profile?.id });

  const stats = {
    totalRFQs: rfqs.length,
    activeRFQs: rfqs.filter(rfq => ['approved', 'matched', 'quoting'].includes(rfq.status)).length,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total_value, 0),
  };

  if (rfqsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.full_name}</h1>
            <p className="text-gray-600">Manage your sourcing requests and connect with verified suppliers</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active RFQs</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeRFQs}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalOrders}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Recent RFQs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Recent RFQs</h2>
                <Link
                  to="/create-rfq"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create RFQ</span>
                </Link>
              </div>
            </div>

            <div className="p-6">
              {rfqs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
                  <p className="text-gray-600 mb-6">Start by creating your first sourcing request</p>
                  <Link
                    to="/create-rfq"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create Your First RFQ</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {rfqs.slice(0, 5).map((rfq) => (
                    <div key={rfq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rfq.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Quantity: {rfq.quantity} {rfq.unit}</span>
                            {rfq.target_price && <span>Target: ${rfq.target_price}</span>}
                            <span>Created: {new Date(rfq.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rfq.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                          rfq.status === 'approved' ? 'bg-green-100 text-green-800' :
                          rfq.status === 'matched' ? 'bg-blue-100 text-blue-800' :
                          rfq.status === 'quoting' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {rfq.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;