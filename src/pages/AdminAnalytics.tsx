import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Package,
  Award,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';
import { db } from '../lib/database';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalBuyers: 0,
    totalSuppliers: 0,
    totalRFQs: 0,
    totalQuotations: 0,
    totalOrders: 0,
    totalGMV: 0,
    monthlyGMV: 0,
    avgOrderValue: 0,
    successRate: 0,
    topCategories: [],
    topCountries: [],
    monthlyStats: [],
    recentActivity: []
  });

  useEffect(() => {
    const data = db.getAnalytics();
    
    // Generate monthly stats for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthRFQs = db.getRFQs().filter(rfq => {
        const rfqDate = new Date(rfq.created_at);
        return rfqDate.getMonth() === date.getMonth() && 
               rfqDate.getFullYear() === date.getFullYear();
      });
      
      const monthOrders = db.getOrders().filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        rfqs: monthRFQs.length,
        orders: monthOrders.length,
        gmv: monthOrders.reduce((sum, order) => sum + order.order_value, 0)
      });
    }

    // Recent activity
    const recentActivity = [
      { type: 'RFQ', action: 'New RFQ created', user: 'Global Trade Corp', time: '2 min ago' },
      { type: 'Quote', action: 'Quote submitted', user: 'Textile Supplier Ltd', time: '5 min ago' },
      { type: 'Order', action: 'Order completed', user: 'Health Foods Inc', time: '1 hour ago' },
      { type: 'User', action: 'New supplier registered', user: 'Spice Exports Pvt', time: '2 hours ago' },
      { type: 'Quote', action: 'Quote accepted', user: 'Fashion Forward', time: '3 hours ago' }
    ];

    setAnalytics({
      ...data,
      monthlyStats,
      recentActivity
    });
  }, []);

  const tableColumns = [
    { key: 'type', title: 'Type', sortable: true },
    { key: 'action', title: 'Action', sortable: false },
    { key: 'user', title: 'User/Company', sortable: true },
    { key: 'time', title: 'Time', sortable: true }
  ];

  return (
    <DashboardLayout title="Platform Analytics" subtitle="Comprehensive insights and performance metrics">
      <div className="p-6 space-y-6">
        {/* Key Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={analytics.totalUsers}
            icon={Users}
            color="blue"
            change={{ value: 12, type: 'increase' }}
            subtitle={`${analytics.totalBuyers} buyers, ${analytics.totalSuppliers} suppliers`}
          />
          <StatsCard
            title="Total RFQs"
            value={analytics.totalRFQs}
            icon={FileText}
            color="green"
            change={{ value: 8, type: 'increase' }}
          />
          <StatsCard
            title="Platform GMV"
            value={`$${(analytics.totalGMV / 1000000).toFixed(1)}M`}
            icon={DollarSign}
            color="purple"
            change={{ value: 25, type: 'increase' }}
          />
          <StatsCard
            title="Success Rate"
            value={`${analytics.successRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="yellow"
            subtitle="RFQs to completed orders"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Monthly GMV"
            value={`$${(analytics.monthlyGMV / 1000).toFixed(0)}K`}
            icon={BarChart3}
            color="indigo"
            change={{ value: 18, type: 'increase' }}
          />
          <StatsCard
            title="Avg Order Value"
            value={`$${analytics.avgOrderValue.toLocaleString()}`}
            icon={Package}
            color="green"
            change={{ value: 5, type: 'increase' }}
          />
          <StatsCard
            title="Total Quotations"
            value={analytics.totalQuotations}
            icon={Award}
            color="blue"
            change={{ value: 15, type: 'increase' }}
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Platform Activity</h3>
            <div className="space-y-4">
              {analytics.monthlyStats.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{month.rfqs} RFQs, {month.orders} Orders</div>
                      <div className="text-xs text-green-600 font-medium">${month.gmv.toLocaleString()} GMV</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.max(10, (month.rfqs / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Product Categories</h3>
            <div className="space-y-4">
              {analytics.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(category.count / Math.max(...analytics.topCategories.map(c => c.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Buyer Countries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">{country.country}</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{country.count} buyers</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h3>
          </div>
          <DataTable
            columns={tableColumns}
            data={analytics.recentActivity}
            searchable={true}
            exportable={true}
            pagination={true}
            pageSize={10}
          />
        </div>

        {/* Platform Health Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-green-50 rounded-lg border border-green-200 p-6 text-center">
            <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-900">Avg Response Time</h4>
            <p className="text-2xl font-bold text-green-800">2.3 hrs</p>
            <p className="text-sm text-green-600">Quote to RFQ</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-900">Platform Rating</h4>
            <p className="text-2xl font-bold text-blue-800">4.7/5</p>
            <p className="text-sm text-blue-600">User satisfaction</p>
          </div>
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-900">Growth Rate</h4>
            <p className="text-2xl font-bold text-purple-800">+23%</p>
            <p className="text-sm text-purple-600">Month over month</p>
          </div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 text-center">
            <Users className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h4 className="font-semibold text-yellow-900">Active Users</h4>
            <p className="text-2xl font-bold text-yellow-800">89%</p>
            <p className="text-sm text-yellow-600">Monthly active rate</p>
          </div>
        </div>

        {/* Strategic Insights */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">🎯 Strategic Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-indigo-800">Growth Opportunities</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-sm text-indigo-700">
                    <strong>Electronics Category:</strong> 40% increase in demand, consider supplier recruitment drive.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-sm text-indigo-700">
                    <strong>European Market:</strong> Growing interest from UK and Germany buyers.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-indigo-800">Platform Optimization</h4>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-sm text-indigo-700">
                    <strong>Mobile Usage:</strong> 35% of users access via mobile, optimize mobile experience.
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <p className="text-sm text-indigo-700">
                    <strong>Quote Response:</strong> Faster responses correlate with 23% higher acceptance rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;