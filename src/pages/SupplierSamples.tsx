import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, DollarSign, MapPin, Building, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, SampleRequest, SampleQuote } from '../lib/database';

const SupplierSamples = () => {
  const { user } = useAuth();
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [sampleQuotes, setSampleQuotes] = useState<SampleQuote[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    sample_price: '',
    shipping_cost: '',
    delivery_time: '',
    notes: ''
  });

  useEffect(() => {
    // Load sample requests that include this supplier
    const allRequests = db.getSampleRequests();
    const supplierRequests = allRequests.filter(request => 
      request.supplier_ids.includes(user?.id || '') && 
      request.status === 'sent_to_suppliers'
    );
    setSampleRequests(supplierRequests);

    // Load supplier's sample quotes
    const supplierQuotes = db.getSampleQuotes(user?.id);
    setSampleQuotes(supplierQuotes);
  }, [user?.id]);

  const handleProvideQuote = (request: SampleRequest) => {
    setSelectedRequest(request);
    
    // Check if quote already exists
    const existingQuote = sampleQuotes.find(q => q.sample_request_id === request.id);
    if (existingQuote) {
      setQuoteFormData({
        sample_price: existingQuote.sample_price.toString(),
        shipping_cost: existingQuote.shipping_cost.toString(),
        delivery_time: existingQuote.delivery_time,
        notes: existingQuote.notes
      });
    } else {
      setQuoteFormData({
        sample_price: '',
        shipping_cost: '',
        delivery_time: '',
        notes: ''
      });
    }
    
    setShowQuoteModal(true);
  };

  const handleSubmitQuote = () => {
    if (!quoteFormData.sample_price || !quoteFormData.delivery_time) {
      alert('Please provide sample price and delivery time.');
      return;
    }

    const samplePrice = parseFloat(quoteFormData.sample_price);
    const shippingCost = parseFloat(quoteFormData.shipping_cost) || 0;
    const totalCost = samplePrice + shippingCost;

    // Check if updating existing quote
    const existingQuote = sampleQuotes.find(q => q.sample_request_id === selectedRequest!.id);
    
    if (existingQuote) {
      // Update existing quote
      db.updateSampleQuote(existingQuote.id, {
        sample_price: samplePrice,
        shipping_cost: shippingCost,
        total_cost: totalCost,
        delivery_time: quoteFormData.delivery_time,
        notes: quoteFormData.notes,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
    } else {
      // Create new quote
      db.createSampleQuote({
        sample_request_id: selectedRequest!.id,
        supplier_id: user!.id,
        supplier_name: user!.name,
        supplier_company: user!.company,
        sample_price: samplePrice,
        shipping_cost: shippingCost,
        total_cost: totalCost,
        delivery_time: quoteFormData.delivery_time,
        notes: quoteFormData.notes
      });
    }

    // Refresh data
    const updatedQuotes = db.getSampleQuotes(user?.id);
    setSampleQuotes(updatedQuotes);

    setShowQuoteModal(false);
    setSelectedRequest(null);
    setQuoteFormData({
      sample_price: '',
      shipping_cost: '',
      delivery_time: '',
      notes: ''
    });

    alert('✅ Sample quote submitted successfully!\n\nThe buyer will receive your sample pricing and can proceed with sample order.');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getExistingQuote = (requestId: string) => {
    return sampleQuotes.find(q => q.sample_request_id === requestId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/supplier/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Sample Requests</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Requests</h1>
            <p className="text-gray-600">
              Manage sample requests from buyers and provide sample pricing
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{sampleRequests.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Quotes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {sampleRequests.filter(r => !getExistingQuote(r.id) || getExistingQuote(r.id)?.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Submitted Quotes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {sampleQuotes.filter(q => q.status === 'submitted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted Samples</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sampleQuotes.filter(q => q.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Sample Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sample Requests</h3>
            </div>
            
            <div className="p-6">
              {sampleRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Sample Requests</h4>
                  <p className="text-gray-600">You haven't received any sample requests yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sampleRequests.map((request) => {
                    const existingQuote = getExistingQuote(request.id);
                    return (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">{request.rfq_title}</h4>
                            <div className="flex items-center text-gray-600 text-sm space-x-4">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 mr-1" />
                                <span>{request.buyer_company}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span>{request.delivery_location.split(',').slice(-2).join(',').trim()}</span>
                              </div>
                            </div>
                          </div>
                          {existingQuote && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(existingQuote.status)}`}>
                              {existingQuote.status === 'submitted' ? 'Quote Submitted' : existingQuote.status}
                            </span>
                          )}
                        </div>

                        {/* Request Details */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-gray-500 text-sm">Sample Quantity:</span>
                            <p className="font-medium">{request.sample_quantity} sample{request.sample_quantity > 1 ? 's' : ''}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Requested:</span>
                            <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 text-sm">Buyer:</span>
                            <p className="font-medium">{request.buyer_name}</p>
                          </div>
                        </div>

                        {/* Specifications */}
                        {request.specifications && (
                          <div className="mb-4">
                            <span className="text-gray-500 text-sm">Specifications:</span>
                            <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-md">{request.specifications}</p>
                          </div>
                        )}

                        {/* Delivery Location */}
                        <div className="mb-4">
                          <span className="text-gray-500 text-sm">Delivery Location:</span>
                          <p className="text-sm text-gray-700 mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">{request.delivery_location}</p>
                        </div>

                        {/* Existing Quote Display */}
                        {existingQuote && (
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h5 className="font-semibold text-green-900 mb-2">Your Sample Quote</h5>
                            <div className="grid md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-green-700">Sample Price:</span>
                                <p className="font-bold text-green-900">${existingQuote.sample_price.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-green-700">Shipping:</span>
                                <p className="font-bold text-green-900">${existingQuote.shipping_cost.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-green-700">Total:</span>
                                <p className="font-bold text-green-900">${existingQuote.total_cost.toFixed(2)}</p>
                              </div>
                              <div>
                                <span className="text-green-700">Delivery:</span>
                                <p className="font-bold text-green-900">{existingQuote.delivery_time}</p>
                              </div>
                            </div>
                            {existingQuote.notes && (
                              <div className="mt-3">
                                <span className="text-green-700 text-sm">Notes:</span>
                                <p className="text-sm text-green-800 mt-1">{existingQuote.notes}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleProvideQuote(request)}
                              className={`px-4 py-2 rounded text-sm font-medium ${
                                existingQuote 
                                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {existingQuote ? 'Update Quote' : 'Provide Sample Quote'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400">
                            Request ID: {request.id}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Sample Request Guidelines</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Provide competitive sample pricing to increase chances of bulk order</li>
              <li>• Include shipping costs in your quote for transparency</li>
              <li>• Mention any special packaging or handling for samples</li>
              <li>• Samples help buyers evaluate quality before placing bulk orders</li>
              <li>• Quick response to sample requests often leads to faster order conversion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Provide Sample Quote</h3>
                <p className="text-sm text-gray-600">{selectedRequest.rfq_title}</p>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Request Summary */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Sample Request Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Quantity:</span>
                    <p className="font-medium text-blue-900">{selectedRequest.sample_quantity} sample{selectedRequest.sample_quantity > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="text-blue-700">Buyer:</span>
                    <p className="font-medium text-blue-900">{selectedRequest.buyer_company}</p>
                  </div>
                </div>
                {selectedRequest.specifications && (
                  <div className="mt-3">
                    <span className="text-blue-700 text-sm">Specifications:</span>
                    <p className="text-sm text-blue-800 mt-1">{selectedRequest.specifications}</p>
                  </div>
                )}
                <div className="mt-3">
                  <span className="text-blue-700 text-sm">Delivery Location:</span>
                  <p className="text-sm text-blue-800 mt-1">{selectedRequest.delivery_location}</p>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sample_price" className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Price (USD) *
                    </label>
                    <input
                      type="number"
                      id="sample_price"
                      step="0.01"
                      value={quoteFormData.sample_price}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, sample_price: e.target.value }))}
                      placeholder="25.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="shipping_cost" className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost (USD)
                    </label>
                    <input
                      type="number"
                      id="shipping_cost"
                      step="0.01"
                      value={quoteFormData.shipping_cost}
                      onChange={(e) => setQuoteFormData(prev => ({ ...prev, shipping_cost: e.target.value }))}
                      placeholder="15.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Total Calculation */}
                {quoteFormData.sample_price && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 font-medium">
                      Total Cost: ${(parseFloat(quoteFormData.sample_price) + (parseFloat(quoteFormData.shipping_cost) || 0)).toFixed(2)}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Delivery Time *
                  </label>
                  <select
                    id="delivery_time"
                    value={quoteFormData.delivery_time}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, delivery_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Delivery Time</option>
                    <option value="3-5 days">3-5 days</option>
                    <option value="5-7 days">5-7 days</option>
                    <option value="7-10 days">7-10 days</option>
                    <option value="10-14 days">10-14 days</option>
                    <option value="2-3 weeks">2-3 weeks</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={quoteFormData.notes}
                    onChange={(e) => setQuoteFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special instructions, packaging details, or additional information..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Important Note */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-semibold text-yellow-900 mb-2">📋 Important Notes</h5>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Sample costs are typically paid by the buyer</li>
                  <li>• Include all costs (product + shipping) for transparency</li>
                  <li>• Provide realistic delivery timelines</li>
                  <li>• Quality samples increase chances of bulk order conversion</li>
                </ul>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuote}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {getExistingQuote(selectedRequest.id) ? 'Update Quote' : 'Submit Quote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierSamples;