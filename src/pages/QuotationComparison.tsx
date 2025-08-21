import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, X, Star, Award, Eye, Building, MapPin, DollarSign, FileText } from 'lucide-react';

interface Quotation {
  id: string;
  supplier: {
    name: string;
    location: string;
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
    const rfqQuotations = supplierQuotations.filter((q: any) => q.rfq_id === rfqId && q.status === 'sent_to_buyer');
    
    // Convert supplier quotations to the format expected by this component
    const convertedQuotations = rfqQuotations.map((q: any) => ({
      id: q.id,
      supplier: {
        name: q.supplier_company || 'Supplier Company',
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
      status: 'approved'
    }));

    setQuotations(convertedQuotations);
    setLoading(false);
  }, [rfqId]);

  const handleAcceptQuote = (quotationId: string) => {
    const supplier = quotations.find(q => q.id === quotationId)?.supplier.name;
    
    // Update RFQ status to matched in localStorage
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'matched' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedRFQs));
    
    // Update quotation status to accepted
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'accepted' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    
    alert(`✅ Quote accepted from ${supplier}! RFQ status updated to MATCHED.`);
    
    // Redirect back to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  const handleViewQuotationDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };
  const getBestPrice = () => {
    return Math.min(...quotations.map(q => q.price_per_unit));
  };

  const getFastestDelivery = () => {
    // Simple logic to find fastest delivery (lowest number in lead time)
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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-900 font-medium">Compare Quotations</span>
            </div>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
              <Download className="h-4 w-4" />
              <span>Export Comparison</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Quotations</h1>
            <p className="text-gray-600">
              You received {quotations.length} approved quotations for <strong>Organic Cotton T-Shirts</strong>
            </p>
          </div>

          {/* RFQ Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Requirements</h3>
            <div className="grid md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Product:</span>
                <p className="font-medium">Organic Cotton T-Shirts</p>
              </div>
              <div>
                <span className="text-gray-500">Quantity:</span>
                <p className="font-medium">5,000 pieces</p>
              </div>
              <div>
                <span className="text-gray-500">Target Price:</span>
                <p className="font-medium">$8.50 per piece</p>
              </div>
              <div>
                <span className="text-gray-500">Max Budget:</span>
                <p className="font-medium">$42,500</p>
              </div>
              <div>
                <span className="text-gray-500">Timeline:</span>
                <p className="font-medium">30 days</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-1">Best Price</h4>
              <p className="text-2xl font-bold text-green-900">${getBestPrice().toFixed(2)}</p>
              <p className="text-sm text-green-700">per unit</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-1">Fastest Delivery</h4>
              <p className="text-2xl font-bold text-blue-900">{getFastestDelivery()}</p>
              <p className="text-sm text-blue-700">days minimum</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-1">Quotations</h4>
              <p className="text-2xl font-bold text-purple-900">{quotations.length}</p>
              <p className="text-sm text-purple-700">approved quotes</p>
            </div>
          </div>

          {/* Quotations Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Comparison</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MOQ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">{quote.supplier.contact_person}</p>
                              {quote.supplier.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{quote.supplier.location}</p>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 ml-1">{quote.supplier.rating}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        ${quote.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.moq.toLocaleString()} pcs
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{quote.lead_time}</span>
                        {quote.lead_time.includes(getFastestDelivery().toString()) && (
                          <span className="block text-xs text-blue-600 font-medium">Fastest</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {quote.payment_terms}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => handleAcceptQuote(quote.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Accept Quote
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
          <div className="mt-8 grid lg:grid-cols-3 gap-6">
            {quotations.map((quote) => (
              <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-900">{quote.supplier.contact_person}</h4>
                    <div className="flex items-center space-x-1">
                      {quote.supplier.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      <Award className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
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
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Need Help Deciding?</h4>
            <p className="text-sm text-blue-800 mb-3">
              Our sourcing experts can help you evaluate these quotations based on your specific requirements.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
      {/* Quotation Details Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quotation Details</h3>
                <p className="text-sm text-gray-500 mt-1">Complete supplier quotation information</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* Supplier Information */}
              <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
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
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedQuotation.supplier.location}
                  </p>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="mb-8 bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Pricing Breakdown
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Price per Unit</label>
                    <p className="text-3xl font-bold text-blue-900">${selectedQuotation.price_per_unit.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-2">Total Price</label>
                    <p className="text-3xl font-bold text-green-900">${selectedQuotation.total_price.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                    <label className="block text-sm font-medium text-purple-700 mb-2">MOQ</label>
                    <p className="text-3xl font-bold text-purple-900">{selectedQuotation.moq.toLocaleString()}</p>
                    <p className="text-sm text-purple-600 mt-1">pieces</p>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Terms & Conditions
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
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
              <div className="mb-8 bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Guarantees & Services
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
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
                <div className="mb-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Supplier Notes
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}
            </div>
              {/* Supplier Product Images */}
              {selectedQuotation.images && selectedQuotation.images.length > 0 && (
                <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                  <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                    <Image className="h-5 w-5 mr-2" />
                    📸 Supplier Product Images
                  </h4>
                  <div className="bg-white p-4 rounded-lg border-2 border-green-300 shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedQuotation.images.map((image, index) => (
                        <div key={index} className="group relative">
                          <img
                            src={image}
                            alt={`Supplier product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border-2 border-green-200 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => window.open(image, '_blank')}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 mt-3 font-medium">
                      💡 Click on any image to view full size. These show the supplier's actual products and quality.
                    </p>
                  </div>
                </div>
              )}

            
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Quote from {selectedQuotation.supplier.contact_person} • Total: ${selectedQuotation.total_price.toLocaleString()}
              </div>
              <div className="flex space-x-3">
              <button
                onClick={() => setShowQuotationModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
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