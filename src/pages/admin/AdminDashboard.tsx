import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRFQs, useSuppliers, useQuotations } from '../../lib/queries';
import { Users, FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { data: rfqs = [] } = useRFQs();
  const { data: suppliers = [] } = useSuppliers();
  const { data: quotations = [] } = useQuotations();

  const stats = {
    totalRFQs: rfqs.length,
    pendingRFQs: rfqs.filter(rfq => rfq.status === 'pending_approval').length,
    totalSuppliers: suppliers.length,
    pendingSuppliers: suppliers.filter(s => s.verification_status === 'pending').length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === 'pending_admin_review').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile?.full_name}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
                  <p className="text-sm text-yellow-600">{stats.pendingRFQs} pending approval</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                  <p className="text-sm text-yellow-600">{stats.pendingSuppliers} pending verification</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Quotations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuotations}</p>
                  <p className="text-sm text-yellow-600">{stats.pendingQuotations} pending review</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/admin/rfqs"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Manage RFQs</h3>
                  <p className="text-sm text-gray-600">Review and approve RFQs</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/suppliers"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Verify Suppliers</h3>
                  <p className="text-sm text-gray-600">Review supplier applications</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/quotations"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Moderate Quotes</h3>
                  <p className="text-sm text-gray-600">Review quotations</p>
                </div>
              </div>
            </a>

            <a
              href="/admin/samples"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Sample Requests</h3>
                  <p className="text-sm text-gray-600">Manage sample requests</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;