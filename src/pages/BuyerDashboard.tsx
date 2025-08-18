import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Plus, FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/database';

const BuyerDashboard = () => {
  const { profile } = useAuth();
  const { user } = useAuth();
  
  // Load real data from database
  const rfqs = user?.id ? db.getRFQs().filter(rfq => rfq.buyer_id === user.id) : [];
  const orders = user?.id ? db.getOrders().filter(order => order.buyer_id === user.id) : [];
  const rfqsLoading = false;
  const ordersLoading = false;

  const stats = {
    totalRFQs: rfqs.length,
    activeRFQs: rfqs.filter(rfq => ['approved', 'matched', 'quoting'].includes(rfq.status)).length,
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + (order.total_value || 0), 0),
  };

  if (rfqsLoading || ordersLoading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Welcome to your buyer dashboard">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${profile?.full_name || 'User'}`}>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create RFQ</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first sourcing request</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Your First RFQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Create RFQ</h3>
                <p className="text-sm opacity-90">Start a new sourcing request</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Browse Suppliers</h3>
                <p className="text-sm opacity-90">Find verified suppliers</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">View Analytics</h3>
                <p className="text-sm opacity-90">Track your sourcing metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;