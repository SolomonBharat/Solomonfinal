import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Eye,
  Award,
  Globe,
  Package,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [buyerResponse, setBuyerResponse] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalRFQs: 0,
    pendingRFQs: 0,
    totalQuotations: 0,
    totalOrders: 0,
    monthlyGMV: 0,
    platformGrowth: 0
  });

  const [recentActivity, setRecentActivity] = useState([
    { type: 'RFQ', action: 'New RFQ submitted', user: 'Global Trade Corp', time: '2 min ago', status: 'pending' },
    { type: 'Supplier', action: 'Supplier verification completed', user: 'Textile Exports Ltd', time: '15 min ago', status: 'approved' },
    { type: 'Quote', action: 'Quotation submitted', user: 'Spice Masters', time: '1 hour ago', status: 'pending' },
    { type: 'Order', action: 'Order completed', user: 'Fashion Forward', time: '2 hours ago', status: 'completed' }
  ]);

  useEffect(() => {
    // Load platform statistics
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const rfqs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const quotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');

    const buyers = users.filter(u => u.user_type === 'buyer');
    const suppliers = users.filter(u => u.user_type === 'supplier');
    const pendingRFQs = rfqs.filter((rfq: any) => rfq.status === 'pending_approval');

    setStats({
      totalUsers: users.length + 150, // Add base users
      totalBuyers: buyers.length + 75,
      totalSuppliers: suppliers.length + 50,
      totalRFQs: rfqs.length + 200,
      pendingRFQs: pendingRFQs.length,
      totalQuotations: quotations.length + 150,
      totalOrders: orders.length + 100,
      monthlyGMV: 2500000,
      platformGrowth: 23
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/onboard-supplier"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Onboard Supplier</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stats.totalBuyers} buyers, {stats.totalSuppliers} suppliers</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRFQs}</p>
                  {stats.pendingRFQs > 0 && (
                    <p className="text-xs text-orange-600">{stats.pendingRFQs} pending approval</p>
                  )}
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly GMV</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.monthlyGMV / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-green-600">+{stats.platformGrowth}% growth</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">94.2%</p>
                  <p className="text-xs text-green-600">RFQ to order conversion</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link 
              to="/admin/rfqs"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pending RFQs</h3>
                  <p className="text-sm text-gray-600">{stats.pendingRFQs} awaiting approval</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/suppliers"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Supplier Network</h3>
                  <p className="text-sm text-gray-600">Manage verified suppliers</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/analytics"
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">Platform insights</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/onboard-supplier"
              className="bg-blue-600 text-white p-6 rounded-lg shadow-sm hover:bg-blue-700 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Onboard Supplier</h3>
                  <p className="text-sm text-blue-100">Add new supplier</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'RFQ' ? 'bg-blue-100' :
                        activity.type === 'Supplier' ? 'bg-green-100' :
                        activity.type === 'Quote' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        {activity.type === 'RFQ' && <FileText className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'Supplier' && <Users className="h-4 w-4 text-green-600" />}
                        {activity.type === 'Quote' && <Package className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'Order' && <CheckCircle className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-900">Platform Health</h4>
                  <p className="text-sm text-green-700">All systems operational</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Global Reach</h4>
                  <p className="text-sm text-blue-700">Active in 45+ countries</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-purple-900">Quality Score</h4>
                  <p className="text-sm text-purple-700">96% satisfaction rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;