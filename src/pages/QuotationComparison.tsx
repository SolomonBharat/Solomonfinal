import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Clock, DollarSign, Package, Star, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/database';
import type { RFQ, Quotation } from '../lib/database';

export default function QuotationComparison() {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!rfqId || !user) return;

      try {
        setLoading(true);
        
        // Load RFQ details
        const rfqData = await db.getRFQById(rfqId);
        if (rfqData && rfqData.buyer_id === user.id) {
          setRfq(rfqData);
        }

        // Load quotations for this RFQ
        const quotationsData = await db.getQuotations();
        const rfqQuotations = quotationsData.filter(q => q.rfq_id === rfqId);
        setQuotations(rfqQuotations);
      } catch (error) {
        console.error('Error loading quotation data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [rfqId, user]);

  const handleAcceptQuotation = async (quotationId: string) => {
    try {
      // Update quotation status to accepted
      await db.updateQuotation(quotationId, { status: 'accepted' });
      
      // Create order from accepted quotation
      const quotation = quotations.find(q => q.id === quotationId);
      if (quotation && rfq) {
        await db.createOrder({
          rfq_id: rfq.id,
          quotation_id: quotationId,
          buyer_id: user!.id,
          supplier_id: quotation.supplier_id,
          order_value: quotation.total_value || quotation.quoted_price,
          quantity: rfq.quantity,
          unit_price: quotation.quoted_price,
          payment_terms: quotation.payment_terms,
          delivery_terms: quotation.shipping_terms,
          status: 'confirmed'
        });

        // Update RFQ status to closed
        await db.updateRFQ(rfq.id, { status: 'closed' });
      }

      // Refresh data
      const updatedQuotations = await db.getQuotations();
      const rfqQuotations = updatedQuotations.filter(q => q.rfq_id === rfqId);
      setQuotations(rfqQuotations);
      
      alert('Quotation accepted and order created successfully!');
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    }
  };

  const handleRejectQuotation = async (quotationId: string) => {
    try {
      await db.updateQuotation(quotationId, { status: 'rejected' });
      
      // Refresh data
      const updatedQuotations = await db.getQuotations();
      const rfqQuotations = updatedQuotations.filter(q => q.rfq_id === rfqId);
      setQuotations(rfqQuotations);
      
      alert('Quotation rejected successfully!');
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      alert('Failed to reject quotation. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!rfq) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">RFQ Not Found</h2>
          <p className="text-gray-600 mb-6">The requested RFQ could not be found or you don't have access to it.</p>
          <button
            onClick={() => navigate('/my-rfqs')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to My RFQs
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-rfqs')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quotation Comparison</h1>
              <p className="text-gray-600">Compare and select the best quotation for your RFQ</p>
            </div>
          </div>
        </div>

        {/* RFQ Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Title</p>
              <p className="font-medium">{rfq.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{rfq.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quantity</p>
              <p className="font-medium">{rfq.quantity} {rfq.unit}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Target Price</p>
              <p className="font-medium">${rfq.target_price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                rfq.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                rfq.status === 'closed' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {rfq.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Quotations Received</p>
              <p className="font-medium">{quotations.length}</p>
            </div>
          </div>
        </div>

        {/* Quotations */}
        {quotations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Yet</h3>
            <p className="text-gray-600">Suppliers haven't submitted quotations for this RFQ yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Received Quotations ({quotations.length})
            </h2>
            
            <div className="grid gap-6">
              {quotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className={`bg-white rounded-lg shadow-sm border p-6 ${
                    selectedQuotation === quotation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.supplier_company || quotation.supplier_name}
                      </h3>
                      <p className="text-gray-600">{quotation.supplier_location}</p>
                      <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5 (23 reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${quotation.quoted_price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">per {rfq.unit}</p>
                      {quotation.total_value && (
                        <p className="text-lg font-semibold text-blue-600 mt-1">
                          Total: ${quotation.total_value.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">MOQ</p>
                        <p className="font-medium">{quotation.moq} units</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Lead Time</p>
                        <p className="font-medium">{quotation.lead_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Terms</p>
                        <p className="font-medium">{quotation.payment_terms || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {quotation.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                      <p className="text-gray-700">{quotation.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-4">
                      {quotation.quality_guarantee && (
                        <div className="flex items-center text-green-600">
                          <Award className="w-4 h-4 mr-1" />
                          <span className="text-sm">Quality Guarantee</span>
                        </div>
                      )}
                      {quotation.sample_available && (
                        <div className="flex items-center text-blue-600">
                          <Package className="w-4 h-4 mr-1" />
                          <span className="text-sm">Sample Available</span>
                        </div>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quotation.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {quotation.status === 'sent_to_buyer' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRejectQuotation(quotation.id)}
                          className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleAcceptQuotation(quotation.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}