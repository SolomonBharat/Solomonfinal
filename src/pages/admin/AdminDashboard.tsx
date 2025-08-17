import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  FileText, 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';

const AdminDashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: pendingSuppliers },
        { count: pendingRFQs },
        { count: pendingQuotations },
        { count: totalRFQs },
        { count: totalQuotations },
        { count: totalOrders },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('supplier_quotations').select('*', { count: 'exact', head: true }).eq('status', 'pending_admin_review'),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }),
        supabase.from('supplier_quotations').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
      ]);

      return {
        totalUsers: totalUsers || 0,
        pendingSuppliers: pendingSuppliers || 0,
        pendingRFQs: pendingRFQs || 0,
        pendingQuotations: pendingQuotations || 0,
        totalRFQs: totalRFQs || 0,
        totalQuotations: totalQuotations || 0,
        totalOrders: totalOrders || 0,
      };
    },
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data: recentRFQs } = await supabase
        .from('rfqs')
        .select(`
          id, title, status, created_at,
          profiles!buyer_id(full_name, company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentQuotations } = await supabase
        .from('supplier_quotations')
        .select(`
          id, status, submitted_at,
          profiles!supplier_id(full_name, company_name),
          rfqs!inner(title)
        `)
        .order('submitted_at', { ascending: false })
        .limit(5);

      return {
        recentRFQs: recentRFQs || [],
        recentQuotations: recentQuotations || [],
      };
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Suppliers</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pendingSuppliers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending RFQs</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingRFQs}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Quotations</p>
                <p className="text-2xl font-bold text-red-600">{stats?.pendingQuotations}</p>
              </div>
              <Package className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalRFQs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quotations</p>
                <p className="text-2xl font-bold text-green-600">{stats?.totalQuotations}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent RFQs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity?.recentRFQs.map((rfq: any) => (
                  <div key={rfq.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                      <p className="text-xs text-gray-500">
                        by {rfq.profiles?.company_name} • {new Date(rfq.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rfq.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                      rfq.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {rfq.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Quotations</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity?.recentQuotations.map((quotation: any) => (
                  <div key={quotation.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{quotation.rfqs?.title}</p>
                      <p className="text-xs text-gray-500">
                        by {quotation.profiles?.company_name} • {new Date(quotation.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      quotation.status === 'pending_admin_review' ? 'bg-yellow-100 text-yellow-800' :
                      quotation.status === 'approved_for_buyer' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {quotation.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats?.pendingSuppliers > 0 && (
              <a
                href="/admin/suppliers?status=pending"
                className="bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">Review Suppliers</p>
                    <p className="text-sm text-gray-600">{stats.pendingSuppliers} pending</p>
                  </div>
                </div>
              </a>
            )}

            {stats?.pendingRFQs > 0 && (
              <a
                href="/admin/rfqs?status=pending_approval"
                className="bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Approve RFQs</p>
                    <p className="text-sm text-gray-600">{stats.pendingRFQs} pending</p>
                  </div>
                </div>
              </a>
            )}

            {stats?.pendingQuotations > 0 && (
              <a
                href="/admin/quotations"
                className="bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium text-gray-900">Review Quotations</p>
                    <p className="text-sm text-gray-600">{stats.pendingQuotations} pending</p>
                  </div>
                </div>
              </a>
            )}

            <a
              href="/admin/categories"
              className="bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Manage Categories</p>
                  <p className="text-sm text-gray-600">Configure platform</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;