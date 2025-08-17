import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRFQs, useQuotations, useOrders } from '../lib/queries';
import { FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';

const SupplierDashboard = () => {
  const { profile } = useAuth();
  const { data: rfqs = [], isLoading: rfqsLoading } = useRFQs();
  const { data: quotations = [], isLoading: quotationsLoading } = useQuotations({ supplier_id: profile?.id });
  const { data: orders = [], isLoading: ordersLoading } = useOrders({ supplier_id: profile?.id });

  // Filter RFQs that match supplier's categories
  const availableRFQs = rfqs.filter(rfq => 
    rfq.status === 'approved' && 
    rfq.open_for_bidding
  );

  const stats = {
    availableRFQs: availableRFQs.length,
    totalQuotations: quotations.length,
    acceptedQuotations: quotations.filter(q => q.status === 'approved_for_buyer').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_value, 0),
  };

  if (rfqsLoading || quotationsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.full_name}</h1>
            <p className="text-gray-600">Manage your quotations and connect with global buyers</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              {availableRFQs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Available</h3>
                  <p className="text-gray-600">No approved RFQs match your categories yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableRFQs.slice(0, 5).map((rfq) => (
                    <div key={rfq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{rfq.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rfq.category}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Quantity: {rfq.quantity} {rfq.unit}</span>
                            {rfq.target_price && <span>Target: ${rfq.target_price}</span>}
                            <span>Timeline: {rfq.delivery_timeline}</span>
                          </div>
                        </div>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                          Submit Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Quotations */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">My Recent Quotations</h2>
            </div>

            <div className="p-6">
              {quotations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Yet</h3>
                  <p className="text-gray-600">Start by submitting quotes for available RFQs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quotations.slice(0, 5).map((quotation) => (
                    <div key={quotation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">Quote #{quotation.id.slice(-8)}</h3>
                          <p className="text-sm text-gray-600 mt-1">Price: ${quotation.price_per_unit}/unit</p>
                          <p className="text-sm text-gray-500">Submitted: {new Date(quotation.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          quotation.status === 'pending_admin_review' ? 'bg-yellow-100 text-yellow-800' :
                          quotation.status === 'approved_for_buyer' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {quotation.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;