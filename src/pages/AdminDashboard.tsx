import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Globe,
  Package,
  Award,
  ArrowRight,
  Bell,
  User,
  LogOut,
  Eye,
  MessageCircle,
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalRFQs: 0,
    pendingRFQs: 0,
    totalQuotations: 0,
    totalOrders: 0,
    monthlyGMV: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryResponse, setQueryResponse] = useState('');

  useEffect(() => {
    // Load platform statistics
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const buyers = users.filter((u: any) => u.user_type === 'buyer');
    const suppliers = users.filter((u: any) => u.user_type === 'supplier');
    const pendingRFQs = userRFQs.filter((rfq: any) => rfq.status === 'pending_approval');
    
    setStats({
      totalUsers: users.length + buyers.length + suppliers.length + 3, // Add demo users
      totalBuyers: buyers.length + 1, // Add demo buyer
      totalSuppliers: suppliers.length + 1, // Add demo supplier
      totalRFQs: userRFQs.length,
      pendingRFQs: pendingRFQs.length,
      totalQuotations: supplierQuotations.length,
      totalOrders: orders.length,
      monthlyGMV: 125000
    });

    // Load recent activity
    const activity = [
      { type: 'RFQ', action: 'New RFQ submitted', user: 'Global Trade Corp', time: '5 min ago' },
      { type: 'Supplier', action: 'Supplier verified', user: 'Textile Exports Ltd', time: '15 min ago' },
      { type: 'Quote', action: 'Quotation approved', user: 'Spice Masters', time: '1 hour ago' },
      { type: 'User', action: 'New buyer registered', user: 'Fashion Forward Inc', time: '2 hours ago' }
    ];
    setRecentActivity(activity);

    // Load supplier queries
    const supplierQueries = JSON.parse(localStorage.getItem('supplier_queries') || '[]');
    setQueries(supplierQueries);
  }, []);

  const handleViewQuery = (query: any) => {
    setSelectedQuery(query);
    setShowQueryModal(true);
  };

  const handleForwardToBuyer = () => {
    if (!selectedQuery) return;
    
    const queries = JSON.parse(localStorage.getItem('supplier_queries') || '[]');
    const updatedQueries = queries.map((query: any) => 
      query.id === selectedQuery.id 
        ? { ...query, status: 'forwarded_to_buyer', admin_notes: queryResponse }
        : query
    );
    localStorage.setItem('supplier_queries', JSON.stringify(updatedQueries));
    setQueries(updatedQueries);
    setShowQueryModal(false);
    setQueryResponse('');
    alert('✅ Query forwarded to buyer!\n\n📋 The buyer will be notified.\n⏰ You\'ll see the buyer\'s response when they reply.\n📧 Supplier will be updated once buyer responds.');
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
              <span className="text-gray-600">Admin Dashboard</span>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor platform activity and manage the Solomon Bharat marketplace
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
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
                <p className="text-xs text-gray-500">{stats.pendingRFQs} pending approval</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly GMV</p>
                <p className="text-2xl font-bold text-gray-900">${stats.monthlyGMV.toLocaleString()}</p>
                <p className="text-xs text-gray-500">+15% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Platform Growth</p>
                <p className="text-2xl font-bold text-gray-900">+23%</p>
                <p className="text-xs text-gray-500">User growth this month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Pending Queries Alert */}
        {queries.filter(q => q.status === 'pending_admin_review').length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-900">
                    {queries.filter(q => q.status === 'pending_admin_review').length} Supplier Queries Pending Review
                  </h3>
                  <p className="text-sm text-orange-800">
                    Suppliers have questions about RFQs that need your attention
                  </p>
                </div>
              </div>
              <Link 
                to="/admin/rfqs"
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Review Queries
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link 
            to="/admin/rfqs"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <FileText className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="font-semibold text-gray-900">Manage RFQs</h3>
                <p className="text-sm text-gray-600">Review and approve RFQs</p>
                {stats.pendingRFQs > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                    {stats.pendingRFQs} pending
                  </span>
                )}
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
            </div>
          </Link>

          <Link 
            to="/admin/suppliers"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <Users className="h-8 w-8 text-green-500 mb-3" />
                <h3 className="font-semibold text-gray-900">Supplier Network</h3>
                <p className="text-sm text-gray-600">Manage verified suppliers</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500" />
            </div>
          </Link>

          <Link 
            to="/admin/onboard-supplier"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <Package className="h-8 w-8 text-purple-500 mb-3" />
                <h3 className="font-semibold text-gray-900">Onboard Supplier</h3>
                <p className="text-sm text-gray-600">Add new verified supplier</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500" />
            </div>
          </Link>

          <Link 
            to="/admin/analytics"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <TrendingUp className="h-8 w-8 text-yellow-500 mb-3" />
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-600">Platform insights</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" />
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'RFQ' ? 'bg-blue-500' :
                    activity.type === 'Supplier' ? 'bg-green-500' :
                    activity.type === 'Quote' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-900">Platform Health</h3>
                <p className="text-sm text-green-700">All systems operational</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Globe className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-blue-900">Global Reach</h3>
                <p className="text-sm text-blue-700">Active in 25+ countries</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-purple-900">Quality Score</h3>
                <p className="text-sm text-purple-700">4.8/5 platform rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Review Modal */}
      {showQueryModal && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Supplier Query</h3>
              <button
                onClick={() => setShowQueryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">RFQ Information</h4>
                  <p className="text-sm text-blue-800">
                    <strong>Title:</strong> {selectedQuery.rfq_title}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Supplier:</strong> {selectedQuery.supplier_name} ({selectedQuery.supplier_company})
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Supplier's Question</h4>
                  <p className="text-gray-700">{selectedQuery.question}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Asked on: {new Date(selectedQuery.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="admin_response" className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  id="admin_response"
                  rows={3}
                  value={queryResponse}
                  onChange={(e) => setQueryResponse(e.target.value)}
                  placeholder="Add any notes or context before forwarding to buyer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  <strong>Action:</strong> This query will be forwarded to the buyer for clarification. 
                  The buyer can respond with additional details.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowQueryModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForwardToBuyer}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Forward to Buyer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;