import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, Eye, Edit, Send } from 'lucide-react';
import { useQuotations } from '../lib/queries';

const SupplierQuotations = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const { data: allQuotations = [], isLoading: loading } = useQuotations();
  
  // Filter quotations for current user
  const quotations = allQuotations.filter(q => q.supplier_id === user?.id);
    
    const badge = badges[status as keyof typeof badges] || badges.draft;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const filteredQuotations = quotations.filter(quote => {
    if (filter === 'all') return true;
    return quote.status === filter;
  });

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => q.status === 'pending_admin_review').length,
    approved: quotations.filter(q => q.status === 'approved_for_buyer').length,
    rejected: quotations.filter(q => q.status === 'rejected').length,
  };

  if (loading) {
    return (
      <DashboardLayout title="My Quotations" subtitle="Manage your submitted quotations">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Quotations" subtitle="Manage your submitted quotations">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Quotations</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All ({quotations.length})
            </button>
            <button
              onClick={() => setFilter('pending_admin_review')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'pending_admin_review' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved_for_buyer')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'approved_for_buyer' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Approved ({stats.approved})
            </button>
          </div>
        </div>

        {/* Quotations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredQuotations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No quotations yet' : `No ${filter.replace('_', ' ')} quotations`}
              </h3>
              <p className="text-gray-600">
                Your quotations will appear here once you submit them for RFQs
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredQuotations.map((quotation) => (
                <div key={quotation.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Quotation #{quotation.id}</h3>
                        {getStatusBadge(quotation.status)}
                      </div>
                      <p className="text-gray-600 mb-3">
                        RFQ: <span className="font-medium">{quotation.rfq_id}</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Price per unit:</span> ${quotation.price_per_unit || 0}
                        </div>
                        <div>
                          <span className="font-medium">MOQ:</span> {quotation.moq || 0} units
                        </div>
                        <div>
                          <span className="font-medium">Lead time:</span> {quotation.lead_time_days || 0} days
                        </div>
                        <div>
                          <span className="font-medium">Validity:</span> {quotation.validity_days || 0} days
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Payment terms:</span> {quotation.payment_terms || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Shipping terms:</span> {quotation.shipping_terms || 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={`h-4 w-4 ${quotation.quality_guarantee ? 'text-green-500' : 'text-gray-300'}`} />
                          <span>Quality Guarantee</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle className={`h-4 w-4 ${quotation.sample_available ? 'text-green-500' : 'text-gray-300'}`} />
                          <span>Sample Available</span>
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {new Date(quotation.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      {quotation.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-700">{quotation.notes || ''}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      {quotation.status === 'draft' && (
                        <button className="text-gray-400 hover:text-green-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Tips for Better Quotations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Pricing Strategy</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be competitive but maintain quality standards</li>
                <li>• Include all costs (materials, labor, shipping)</li>
                <li>• Offer volume discounts for larger orders</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Response Quality</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Respond quickly to increase acceptance rates</li>
                <li>• Provide detailed product specifications</li>
                <li>• Include certifications and quality guarantees</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierQuotations;