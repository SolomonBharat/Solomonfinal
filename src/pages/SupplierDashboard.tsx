import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

const SupplierDashboard = () => {
  const { profile } = useAuth();
  
  // Mock data for now since we're fixing the database
  const rfqs = [];
  const quotations = [];
  const orders = [];
  const rfqsLoading = false;
  const quotationsLoading = false;
  const ordersLoading = false;

  // Filter RFQs that match supplier's categories
  const availableRFQs = [];

  const stats = {
    availableRFQs: availableRFQs.length,
    totalQuotations: quotations.length,
    acceptedQuotations: 0,
    totalRevenue: 0,
  };

  if (rfqsLoading || quotationsLoading || ordersLoading) {
    return (
      <DashboardLayout title="Supplier Dashboard" subtitle="Welcome to your supplier dashboard">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Supplier Dashboard" subtitle={`Welcome, ${profile?.full_name || 'Supplier'}`}>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available RFQs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.availableRFQs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotations}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Quotes</p>
                <p className="text-2xl font-bold text-green-600">{stats.acceptedQuotations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Available RFQs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available RFQs</h2>
          </div>

          <div className="p-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Available</h3>
              <p className="text-gray-600">No approved RFQs match your categories yet.</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Browse RFQs</h3>
                <p className="text-sm opacity-90">Find new opportunities</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">My Quotations</h3>
                <p className="text-sm opacity-90">Manage your quotes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm opacity-90">View your metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierDashboard;