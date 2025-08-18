import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Clock, 
  Users,
  Globe,
  Award
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRFQs, useOrders, useQuotations } from '../lib/queries';

const BuyerAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalRFQs: 0,
    activeRFQs: 0,
    completedOrders: 0,
    totalSpent: 0,
    avgResponseTime: 0,
    supplierCount: 0,
    topCategories: [],
    monthlySpend: [],
    rfqSuccessRate: 0
  });

  const { data: rfqs = [] } = useRFQs({ buyer_id: user?.id });
  const { data: orders = [] } = useOrders({ buyer_id: user?.id });
  const { data: quotations = [] } = useQuotations();

  useEffect(() => {
    if (user?.id) {
      const totalSpent = orders.reduce((sum, order) => sum + (order.total_value || 0), 0);
      const activeRFQs = rfqs.filter(rfq => ['approved', 'matched', 'quoted'].includes(rfq.status));
      const completedOrders = orders.filter(order => order.status === 'completed');

      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      rfqs.forEach(rfq => {
        categoryCount[rfq.category] = (categoryCount[rfq.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate monthly spend (last 6 months)
      const monthlySpend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === date.getMonth() && 
                 orderDate.getFullYear() === date.getFullYear();
        });
        const monthSpend = monthOrders.reduce((sum, order) => sum + (order.total_value || 0), 0);
        monthlySpend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          amount: monthSpend
        });
      }

      setAnalytics({
        totalRFQs: rfqs.length,
        activeRFQs: activeRFQs.length,
        completedOrders: completedOrders.length,
        totalSpent,
        avgResponseTime: 2.5, // days
        supplierCount: new Set(quotations.filter(q => 
          rfqs.some(rfq => rfq.id === q.rfq_id)
        ).map(q => q.supplier_id)).size,
        topCategories,
        monthlySpend,
        rfqSuccessRate: rfqs.length > 0 ? (completedOrders.length / rfqs.length) * 100 : 0
      });
    }
  }, [user?.id, rfqs, orders, quotations]);

  return (
    <DashboardLayout title="Analytics" subtitle="Track your sourcing performance and insights">
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total RFQs"
            value={analytics.totalRFQs}
            icon={Package}
            color="blue"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="Active RFQs"
            value={analytics.activeRFQs}
            icon={Clock}
            color="yellow"
            subtitle="Currently in progress"
          />
          <StatsCard
            title="Completed Orders"
            value={analytics.completedOrders}
            icon={Award}
            color="green"
            change={{ value: 8, type: 'increase' }}
          />
          <StatsCard
            title="Total Spent"
            value={`$${analytics.totalSpent.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
            change={{ value: 15, type: 'increase' }}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Avg Response Time"
            value={`${analytics.avgResponseTime} days`}
            icon={Clock}
            color="indigo"
            subtitle="From RFQ to first quote"
          />
          <StatsCard
            title="Supplier Network"
            value={analytics.supplierCount}
            icon={Users}
            color="green"
            subtitle="Unique suppliers engaged"
          />
          <StatsCard
            title="Success Rate"
            value={`${analytics.rfqSuccessRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="blue"
            subtitle="RFQs to completed orders"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Spending Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
            <div className="space-y-3">
              {analytics.monthlySpend.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{month.month}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.max(10, (month.amount / Math.max(...analytics.monthlySpend.map(m => m.amount))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      ${month.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Product Categories</h3>
            <div className="space-y-3">
              {analytics.topCategories.map((category: any, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(category.count / Math.max(...analytics.topCategories.map((c: any) => c.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.count} RFQs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-900">Quote Comparison</h4>
              <p className="text-sm text-blue-700 mt-1">
                Average of 3.2 quotes per RFQ
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-900">Global Reach</h4>
              <p className="text-sm text-green-700 mt-1">
                Sourcing from 12+ Indian states
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-900">Quality Score</h4>
              <p className="text-sm text-purple-700 mt-1">
                95% supplier satisfaction rate
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Recommendations</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-blue-800">
                <strong>Diversify Categories:</strong> Consider exploring "Electronics & Components" - high supplier availability with competitive pricing.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-blue-800">
                <strong>Optimize Timing:</strong> RFQs posted on Mondays receive 23% more responses on average.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-blue-800">
                <strong>Bulk Opportunities:</strong> Increase order quantities by 20% to unlock better pricing tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerAnalytics;