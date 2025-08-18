import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Users, FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/database';

const AdminDashboard = () => {
  const { profile } = useAuth();
  
  // Load real data from database
  const rfqs = db.getRFQs();
  const suppliers = db.getSuppliers();
  const quotations = db.getQuotations();

  const stats = {
    totalRFQs: rfqs.length,
    pendingRFQs: rfqs.filter(rfq => rfq.status === 'pending_approval').length,
    totalSuppliers: suppliers.length,
    pendingSuppliers: suppliers.filter(s => s.verification_status === 'pending').length,
    totalQuotations: quotations.length,
    pendingQuotations: quotations.filter(q => q.status === 'pending_admin_review').length,
  };

  return (
    <DashboardLayout title="Admin Dashboard" subtitle={`Welcome back, ${profile?.full_name || 'Admin'}`}>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/rfqs"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors block"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage RFQs</h3>
                <p className="text-sm text-gray-600">Review and approve RFQs</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Suppliers</h3>
                <p className="text-sm text-gray-600">Manage supplier network</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Quotations</h3>
                <p className="text-sm text-gray-600">Review quotations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Platform Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-800">0</div>
              <div className="text-sm text-blue-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-800">$0</div>
              <div className="text-sm text-green-600">Total GMV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">0%</div>
              <div className="text-sm text-purple-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;