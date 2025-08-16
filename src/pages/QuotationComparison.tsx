import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, X, Star, Award, Eye, Building, MapPin, DollarSign, FileText, Phone } from 'lucide-react';
import QASystem from '../components/QASystem';

interface Quotation {
  id: string;
  supplier: {
    name: string;
    company: string;
    contact_person: string;
    location: string;
    email: string;
    phone: string;
    rating: number;
    verified: boolean;
  };
  price_per_unit: number;
  total_price: number;
  moq: number;
  lead_time: string;
  payment_terms: string;
  validity_days: number;
  shipping_terms: string;
  quality_guarantee: boolean;
  sample_available: boolean;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  factory_video?: string;
  factory_images?: string[];
  product_images?: string[];
  product_videos?: string[];
  sample_status?: string;
}

const QuotationComparison = () => {
  const { rfqId } = useParams();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  useEffect(() => {
    // Load quotations for this RFQ
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const rfqQuotations = supplierQuotations.filter((q: any) => 
      q.rfq_id === rfqId && q.status === 'sent_to_buyer'
    );
    
    // Convert supplier quotations to the format expected by this component
    const convertedQuotations = rfqQuotations.map((q: any) => ({
      id: q.id,
      supplier: {
        name: q.supplier_name || 'Contact Person',
        company: q.supplier_company || 'Supplier Company',
        contact_person: q.supplier_name || 'Contact Person',
        location: q.supplier_location || 'India',
        email: q.supplier_email || 'supplier@example.com',
        phone: q.supplier_phone || '+91 XXXXXXXXXX',
        rating: 4.5,
        verified: true
      },
      price_per_unit: q.quoted_price,
      total_price: q.total_value,
      moq: q.moq,
      lead_time: q.lead_time,
      payment_terms: q.payment_terms || '30% advance, 70% on shipment',
      validity_days: q.validity_days || 15,
      shipping_terms: q.shipping_terms || 'FOB',
      quality_guarantee: q.quality_guarantee || true,
      sample_available: q.sample_available || true,
      notes: q.notes || '',
      status: 'approved',
      sample_status: q.sample_status || 'not_requested'
    }));

    setQuotations(convertedQuotations);
    setLoading(false);
  }, [rfqId]);

  const handleAcceptQuote = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) return;

    // Check if any quote is already accepted for this RFQ
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const alreadyAccepted = supplierQuotations.some((quote: any) => 
      quote.rfq_id === rfqId && quote.status === 'accepted'
    );
    
    if (alreadyAccepted) {
      alert('A quote has already been accepted for this RFQ. Only one quote can be accepted per RFQ.');
      return;
    }
    
    // Get RFQ details for notification
    const rfq = userRFQs.find((r: any) => r.id === rfqId);

    // Notify admin immediately about quote acceptance
    import('../lib/notificationService').then(({ notificationService }) => {
      notificationService.notifyQuoteAcceptance({
        rfq_id: rfqId!,
        rfq_title: rfq?.title || 'Product RFQ',
        quotation_id: quotationId,
        buyer_company: rfq?.buyer_company || 'Buyer Company',
        buyer_email: rfq?.buyer_email || 'buyer@example.com',
        buyer_phone: rfq?.buyer_phone || 'Phone',
        supplier_company: quotation.supplier.company,
        supplier_email: quotation.supplier.email,
        supplier_phone: quotation.supplier.phone,
        total_value: quotation.total_price,
        quantity: quotation.moq || 1,
        unit_price: quotation.price_per_unit,
        payment_terms: quotation.payment_terms,
        delivery_timeline: quotation.lead_time
      });
    });

    const supplier = quotations.find(q => q.id === quotationId)?.supplier.name;
    
    // Update RFQ status to closed in localStorage
    const updatedRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'closed' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedRFQs));
    
    // Update quotation status to accepted
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'accepted' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    
    alert(`✅ Quote accepted from ${supplier}! RFQ status updated to CLOSED.`);
    
    // Redirect back to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  const handleRequestSample = (quotationId: string) => {
    const quotation = quotations.find(q => q.id === quotationId);
    if (!quotation) return;

    // Get RFQ details
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const rfq = userRFQs.find((r: any) => r.id === rfqId);

    // Create sample request record
    const sampleRequest = {
      id: `sample_${Date.now()}`,
      rfq_id: rfqId,
      rfq_title: rfq?.title || 'Product RFQ',
      quotation_id: quotationId,
      buyer_company: rfq?.buyer_company || 'Buyer Company',
      buyer_email: rfq?.buyer_email || 'buyer@example.com',
      buyer_phone: rfq?.buyer_phone || 'Phone',
      buyer_country: rfq?.buyer_country || 'Country',
      supplier_company: quotation.supplier.company,
      supplier_email: quotation.supplier.email,
      supplier_phone: quotation.supplier.phone,
      supplier_location: quotation.supplier.location,
      quoted_price: quotation.price_per_unit,
      quantity: quotation.moq || 1,
      status: 'pending',
      created_at: new Date().toISOString(),
      tracking_info: null
    };

    // Save sample request
    const sampleRequests = JSON.parse(localStorage.getItem('sample_requests') || '[]');
    sampleRequests.push(sampleRequest);
    localStorage.setItem('sample_requests', JSON.stringify(sampleRequests));

    // Notify admin immediately
    import('../lib/notificationService').then(({ notificationService }) => {
      notificationService.notifySampleRequest({
        rfq_id: rfqId!,
        rfq_title: rfq?.title || 'Product RFQ',
        buyer_company: rfq?.buyer_company || 'Buyer Company',
        buyer_email: rfq?.buyer_email || 'buyer@example.com',
        buyer_phone: rfq?.buyer_phone || 'Phone',
        supplier_company: quotation.supplier.company,
        supplier_email: quotation.supplier.email,
        supplier_phone: quotation.supplier.phone,
        quoted_price: quotation.price_per_unit,
        quantity: quotation.moq || 1
      });
    });

    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, sample_status: 'sample_requested' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    
    // Update local state
    setQuotations(prev => prev.map(quote => 
      quote.id === quotationId ? { ...quote, sample_status: 'sample_requested' } : quote
    ));
    
    const supplier = quotations.find(q => q.id === quotationId)?.supplier.name;
    alert(`Sample requested from ${supplier}! Supplier will provide tracking details.`);
  };

  const handleViewQuotationDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };

  const getBestPrice = () => {
    return Math.min(...quotations.map(q => q.price_per_unit));
  };

  const getFastestDelivery = () => {
    const deliveryTimes = quotations.map(q => {
      const match = q.lead_time.match(/(\d+)/);
      return match ? parseInt(match[1]) : 999;
    });
    return Math.min(...deliveryTimes);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-900 font-medium text-sm sm:text-base">Compare Quotations</span>
            </div>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm">
              <Download className="h-4 w-4" />
              <span>Export Comparison</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Compare Quotations</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              You received {quotations.length} approved quotations for your RFQ
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">Best Price</h4>
              <p className="text-xl sm:text-2xl font-bold text-green-900">${getBestPrice().toFixed(2)}</p>
              <p className="text-sm text-green-700">per unit</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">Fastest Delivery</h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{getFastestDelivery()}</p>
              <p className="text-sm text-blue-700">days minimum</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-1">Quotations</h4>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">{quotations.length}</p>
              <p className="text-sm text-purple-700">approved quotes</p>
            </div>
          </div>

          {/* Quotations Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Request All Samples
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Unit
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MOQ
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Lead Time
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Payment Terms
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{quote.supplier.name}</p>
                              {quote.supplier.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{quote.supplier.company}</p>
                            <p className="text-xs text-gray-500">{quote.supplier.location}</p>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 ml-1">{quote.supplier.rating}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold ${
                            quote.price_per_unit === getBestPrice() ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            ${quote.price_per_unit.toFixed(2)}
                          </span>
                          {quote.price_per_unit === getBestPrice() && (
                            <span className="text-xs text-green-600 font-medium">Best Price</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 font-medium">
                        ${quote.total_price.toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                        {quote.moq.toLocaleString()} pcs
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-900">{quote.lead_time}</span>
                        {quote.lead_time.includes(getFastestDelivery().toString()) && (
                          <span className="block text-xs text-blue-600 font-medium">Fastest</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                        {quote.payment_terms}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col space-y-1 sm:space-y-2">
                          {quote.sample_status === 'sample_requested' ? (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium text-center">
                              📦 Sample Requested
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRequestSample(quote.id)}
                              className="bg-orange-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-orange-700"
                            >
                              📦 Request Sample
                            </button>
                          )}
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-700"
                          >
                            Accept Quote
                          </button>
                          <button
                            onClick={() => handleViewQuotationDetails(quote)}
                            className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-blue-700"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Information Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {quotations.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{quote.supplier.contact_person}</h4>
                    <div className="flex items-center space-x-1">
                      {quote.supplier.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <Award className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="font-medium">{quote.supplier.company}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Shipping Terms:</span>
                      <span className="font-medium">{quote.shipping_terms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quote Valid:</span>
                      <span className="font-medium">{quote.validity_days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quality Guarantee:</span>
                      <span className={`font-medium ${quote.quality_guarantee ? 'text-green-600' : 'text-red-600'}`}>
                        {quote.quality_guarantee ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sample Available:</span>
                      <span className={`font-medium ${quote.sample_available ? 'text-green-600' : 'text-red-600'}`}>
                        {quote.sample_available ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>

                  {quote.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {quote.notes}
                      </p>
                    </div>
                  )}

                  {/* Sample Status */}
                  {quote.sample_status === 'sample_requested' && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-md border border-orange-200">
                      <p className="text-sm text-orange-800 font-medium">
                        📦 Sample Requested - Awaiting tracking details from supplier
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Q&A Section for Buyer */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions from Suppliers</h3>
              <QASystem 
                rfqId={rfqId} 
                mode="buyer_answer"
              />
            </div>
          </div>

          {/* Public Q&A */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Q&A</h3>
              <p className="text-sm text-gray-600 mb-4">
                Questions and answers visible to all suppliers:
              </p>
              <QASystem 
                rfqId={rfqId} 
                mode="public_view"
              />
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Need Help Deciding?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Our sourcing experts can help you evaluate these quotations based on your specific requirements.
            </p>
            <a 
              href="https://wa.me/918595135554" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 inline-flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Schedule Consultation</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quotation Details Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Quotation Details</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete supplier quotation information</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Supplier Information */}
              <div className="mb-6 sm:mb-8 bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Supplier Information
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-lg font-bold text-gray-900">{selectedQuotation.supplier.contact_person}</h5>
                      {selectedQuotation.supplier.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold text-yellow-600">{selectedQuotation.supplier.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 flex items-center mb-2">
                    <Building className="h-4 w-4 mr-1" />
                    {selectedQuotation.supplier.company}
                  </p>
                  <p className="text-gray-600 flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedQuotation.supplier.location}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600 flex items-center">
                      <span className="mr-1">📧</span>
                      {selectedQuotation.supplier.email}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <span className="mr-1">📞</span>
                      {selectedQuotation.supplier.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="mb-6 sm:mb-8 bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Pricing Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Price per Unit</label>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900">${selectedQuotation.price_per_unit.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-2">Total Price</label>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900">${selectedQuotation.total_price.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                    <label className="block text-sm font-medium text-purple-700 mb-2">MOQ</label>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900">{selectedQuotation.moq.toLocaleString()}</p>
                    <p className="text-sm text-purple-600 mt-1">pieces</p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6 sm:mb-8 bg-yellow-50 rounded-lg p-4 sm:p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Terms & Conditions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Lead Time</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{selectedQuotation.lead_time}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Payment Terms</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900">{selectedQuotation.payment_terms}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Shipping Terms</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900">{selectedQuotation.shipping_terms}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">Quote Validity</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{selectedQuotation.validity_days} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guarantees & Services */}
              <div className="mb-6 sm:mb-8 bg-purple-50 rounded-lg p-4 sm:p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Guarantees & Services
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full ${selectedQuotation.quality_guarantee ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Quality Guarantee</span>
                        <p className={`text-sm font-bold ${selectedQuotation.quality_guarantee ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedQuotation.quality_guarantee ? 'Included' : 'Not Included'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full ${selectedQuotation.sample_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sample Available</span>
                        <p className={`text-sm font-bold ${selectedQuotation.sample_available ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedQuotation.sample_available ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Notes */}
              {selectedQuotation.notes && (
                <div className="mb-6 sm:mb-8 bg-orange-50 rounded-lg p-4 sm:p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Supplier Notes
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-4 sm:px-6 py-4 bg-gray-100 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Quote from {selectedQuotation.supplier.name} • Total: ${selectedQuotation.total_price.toLocaleString()}
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowQuotationModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedQuotation.sample_status === 'sample_requested' ? (
                  <span className="px-6 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium text-center">
                    Sample Requested
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      handleRequestSample(selectedQuotation.id);
                      setShowQuotationModal(false);
                    }}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Request Sample
                  </button>
                )}
                <button
                  onClick={() => {
                    handleAcceptQuote(selectedQuotation.id);
                    setShowQuotationModal(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Accept This Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationComparison;