import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, Eye, Edit, Send } from 'lucide-react';

const SupplierQuotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load mock quotations
    const mockQuotations = [
      {
        id: 'quote-1',
        rfq_id: 'rfq-1',
        rfq_title: 'Cotton T-Shirts Export Quality',
        buyer_company: 'Global Trade Corp',
        price_per_unit: 12.50,
        moq: 500,
        lead_time_days: 21,
        payment_terms: '30% advance, 70% on shipment',
        shipping_terms: 'FOB Mumbai',
        validity_days: 15,
        quality_guarantee: true,
        sample_available: true,
        status: 'pending_admin_review',
        submitted_at: '2024-01-15T10:00:00Z',
        notes: 'Premium quality cotton with GOTS certification available'
      },
      {
        id: 'quote-2',
        rfq_id: 'rfq-2',
        rfq_title: 'Organic Turmeric Powder',
        buyer_company: 'Health Foods Inc',
        price_per_unit: 8.75,
        moq: 100,
        lead_time_days: 14,
        payment_terms: 'LC at sight',
        shipping_terms: 'CIF destination port',
        validity_days: 30,
        quality_guarantee: true,
        sample_available: true,
        status: 'approved_for_buyer',
        submitted_at: '2024-01-12T14:30:00Z',
        notes: 'Organic certified with lab test reports'
      },
      {
        id: 'quote-3',
        rfq_id: 'rfq-3',
        rfq_title: 'Handcrafted Wooden Furniture',
        buyer_company: 'Home Decor Ltd',
        price_per_unit: 245.00,
        moq: 20,
        lead_time_days: 45,
        payment_terms: '50% advance, 50% before shipment',
        shipping_terms: 'EXW factory',
        validity_days: 20,
        quality_guarantee: true,
        sample_available: false,
        status: 'rejected',
        submitted_at: '2024-01-08T09:15:00Z',
        notes: 'Traditional Rajasthani designs with FSC certified wood'
      }
    ];
    
    setQuotations(mockQuotations);
    setLoading(false);
  }, [user]);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit, label: 'Draft' },
      pending_admin_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Under Review' },
      approved_for_buyer: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
    };
    
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
                        <h3 className="text-lg font-semibold text-gray-900">{quotation.rfq_title}</h3>
                        {getStatusBadge(quotation.status)}
                      </div>
                      <p className="text-gray-600 mb-3">
                        Buyer: <span className="font-medium">{quotation.buyer_company}</span>
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Price per unit:</span> ${quotation.price_per_unit}
                        </div>
                        <div>
                          <span className="font-medium">MOQ:</span> {quotation.moq} units
                        </div>
                        <div>
                          <span className="font-medium">Lead time:</span> {quotation.lead_time_days} days
                        </div>
                        <div>
                          <span className="font-medium">Validity:</span> {quotation.validity_days} days
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Payment terms:</span> {quotation.payment_terms}
                        </div>
                        <div>
                          <span className="font-medium">Shipping terms:</span> {quotation.shipping_terms}
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
                          <p className="text-sm text-gray-700">{quotation.notes}</p>
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