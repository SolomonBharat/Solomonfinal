import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import { 
  TrendingUp, 
  Star, 
  Package, 
  Clock, 
  DollarSign,
  Award,
  Target,
  Users
} from 'lucide-react';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

const SupplierPerformance = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState({
    totalQuotes: 0,
    acceptedQuotes: 0,
    totalRevenue: 0,
    avgResponseTime: 0,
    rating: 4.8,
    completedOrders: 0,
    winRate: 0,
    monthlyQuotes: [],
    categoryPerformance: [],
    recentFeedback: []
  });

  useEffect(() => {
    // Load supplier-specific performance data
    const quotations = db.getQuotations().filter(q => q.supplier_id === user?.id);
    const orders = db.getOrders().filter(order => order.supplier_id === user?.id);
    
    const acceptedQuotes = quotations.filter(q => q.status === 'accepted');
    const totalRevenue = orders.reduce((sum, order) => sum + order.order_value, 0);
    const completedOrders = orders.filter(order => order.status === 'completed');

    // Calculate monthly quotes (last 6 months)
    const monthlyQuotes = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthQuotes = quotations.filter(quote => {
        const quoteDate = new Date(quote.submitted_at);
        return quoteDate.getMonth() === date.getMonth() && 
               quoteDate.getFullYear() === date.getFullYear();
      });
      monthlyQuotes.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        quotes: monthQuotes.length,
        accepted: monthQuotes.filter(q => q.status === 'accepted').length
      });
    }

    // Category performance
    const categoryStats: { [key: string]: { quotes: number; accepted: number } } = {};
    quotations.forEach(quote => {
      const rfq = db.getRFQById(quote.rfq_id);
      if (rfq) {
        if (!categoryStats[rfq.category]) {
          categoryStats[rfq.category] = { quotes: 0, accepted: 0 };
        }
        categoryStats[rfq.category].quotes++;
        if (quote.status === 'accepted') {
          categoryStats[rfq.category].accepted++;
        }
      }
    });

    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      quotes: stats.quotes,
      accepted: stats.accepted,
      winRate: stats.quotes > 0 ? (stats.accepted / stats.quotes) * 100 : 0
    }));

    setPerformance({
      totalQuotes: quotations.length,
      acceptedQuotes: acceptedQuotes.length,
      totalRevenue,
      avgResponseTime: 1.2, // hours
      rating: 4.8,
      completedOrders: completedOrders.length,
      winRate: quotations.length > 0 ? (acceptedQuotes.length / quotations.length) * 100 : 0,
      monthlyQuotes,
      categoryPerformance,
      recentFeedback: [
        { buyer: 'Global Trade Corp', rating: 5, comment: 'Excellent quality and on-time delivery!', date: '2 days ago' },
        { buyer: 'Health Foods Ltd', rating: 4, comment: 'Good product, competitive pricing.', date: '1 week ago' },
        { buyer: 'Home Decor Inc', rating: 5, comment: 'Outstanding craftsmanship and service.', date: '2 weeks ago' }
      ]
    });
  }, [user?.id]);

  return (
    <DashboardLayout title="Performance Dashboard" subtitle="Track your business metrics and growth">
      <div className="p-6 space-y-6">
        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Quotes"
            value={performance.totalQuotes}
            icon={Package}
            color="blue"
            change={{ value: 18, type: 'increase' }}
          />
          <StatsCard
            title="Win Rate"
            value={`${performance.winRate.toFixed(1)}%`}
            icon={Target}
            color="green"
            change={{ value: 5, type: 'increase' }}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${performance.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="purple"
            change={{ value: 22, type: 'increase' }}
          />
          <StatsCard
            title="Supplier Rating"
            value={performance.rating}
            icon={Star}
            color="yellow"
            subtitle="Based on buyer feedback"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Response Time"
            value={`${performance.avgResponseTime}h`}
            icon={Clock}
            color="indigo"
            subtitle="Average quote response"
          />
          <StatsCard
            title="Completed Orders"
            value={performance.completedOrders}
            icon={Award}
            color="green"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="Accepted Quotes"
            value={performance.acceptedQuotes}
            icon={TrendingUp}
            color="blue"
            subtitle="Successfully converted"
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Quote Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Quote Performance</h3>
            <div className="space-y-4">
              {performance.monthlyQuotes.map((month, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm text-gray-600">{month.quotes} quotes, {month.accepted} accepted</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full relative" style={{ width: `${(month.quotes / 10) * 100}%` }}>
                      <div 
                        className="bg-green-600 h-2 rounded-full absolute top-0 left-0" 
                        style={{ width: month.quotes > 0 ? `${(month.accepted / month.quotes) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
            <div className="space-y-4">
              {performance.categoryPerformance.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    <span className="text-sm text-gray-600">{category.winRate.toFixed(1)}% win rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${category.winRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{category.accepted}/{category.quotes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Buyer Feedback</h3>
          <div className="space-y-4">
            {performance.recentFeedback.map((feedback, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{feedback.buyer}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{feedback.date}</span>
                </div>
                <p className="text-gray-700 text-sm italic">"{feedback.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">🚀 Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Growth Trend</span>
              </div>
              <p className="text-sm text-green-800">
                Your quote acceptance rate has improved by 15% this quarter. Keep up the competitive pricing!
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Buyer Retention</span>
              </div>
              <p className="text-sm text-blue-800">
                3 buyers have placed repeat orders. Focus on maintaining quality to build long-term relationships.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Quality Score</span>
              </div>
              <p className="text-sm text-purple-800">
                Your 4.8-star rating puts you in the top 10% of suppliers. Excellent work!
              </p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">📋 Action Items</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <p className="text-yellow-800">
                <strong>Respond Faster:</strong> Reduce your average response time to under 1 hour to increase win rate by an estimated 8%.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <p className="text-yellow-800">
                <strong>Expand Categories:</strong> Consider adding "Electronics & Components" to your profile - high demand with good margins.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
              <p className="text-yellow-800">
                <strong>Update Certifications:</strong> Adding ISO 14001 certification could increase your quote acceptance rate by 12%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierPerformance;