import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, Eye, Edit, DollarSign, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Quotation {
  id: string;
  rfq_id: string;
  rfq_title: string;
  buyer_company: string;
  buyer_country: string;
  quoted_price: number;
  moq: number;
  lead_time: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'sent_to_buyer';
  submitted_at: string;
  notes: string;
  total_value: number;
  payment_terms?: string;
  shipping_terms?: string;
  validity_days?: number;
  quality_guarantee?: boolean;
  sample_available?: boolean;
}

const SupplierQuotations = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  useEffect(() => {
    // Load quotations from localStorage
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    
    // Filter to show only current supplier's quotations
    const myQuotations = supplierQuotations.filter((q: any) => {
      return q.supplier_email === user?.email || 
             q.supplier_name === user?.name ||
             q.supplier_id === user?.id;
    });
    
    setQuotations(myQuotations);
  }, []);

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleViewQuotationDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setShowQuotationModal(true);
  };
  const getStatusBadge = (status: string) => {
    const badges = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      sent_to_buyer: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800'
    };
    return badges[status as keyof typeof badges];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <CheckCircle className="h-4 w-4" />;
      case 'sent_to_buyer': return <FileText className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_review': return 'Awaiting admin review';
      case 'approved': return 'Approved by admin - Sending to buyer';
      case 'rejected': return 'Rejected by admin';
      case 'sent_to_buyer': return 'Sent to buyer for consideration';
      default: return 'Processing';
    }
  };

  const filteredQuotations = quotations.filter(quotation => {
    return filterStatus === 'all' || quotation.status === filterStatus;
  });

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
            <span className="text-gray-900 font-medium">My Quotations</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Quotations</h1>
            <p className="text-gray-600">
              Track all your submitted quotations and their status
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Quotes</p>
                  <p className="text-2xl font-bold text-gray-900">{quotations.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {quotations.filter(q => q.status === 'pending_review').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted Quotes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {quotations.filter(q => q.status === 'accepted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${quotations.reduce((sum, q) => sum + q.total_value, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="sent_to_buyer">Sent to Buyer</option>
                <option value="accepted">Accepted by Buyer</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Quotations Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredQuotations.map((quotation) => (
              <div key={quotation.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {quotation.rfq_title}
                      </h3>
                      <p className="text-sm text-gray-600">{quotation.buyer_company}, {quotation.buyer_country}</p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(quotation.status)}`}>
                      {getStatusIcon(quotation.status)}
                      <span className="capitalize">{quotation.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* Quote Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">Quoted Price:</span>
                      <p className="font-medium text-sm">${quotation.quoted_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">MOQ:</span>
                      <p className="font-medium text-sm">{quotation.moq.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lead Time:</span>
                      <p className="font-medium text-sm">{quotation.lead_time}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Total Value:</span>
                      <p className="font-medium text-sm text-green-600">${quotation.total_value.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {quotation.notes && (
                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1">{quotation.notes}</p>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Status:</strong> {getStatusMessage(quotation.status)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {quotation.status === 'pending_review' && (
                        <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm">
                          <Edit className="h-3 w-3" />
                          <span onClick={() => window.location.href = `/supplier/quote/${quotation.rfq_id}?edit=true`}>Edit Quote</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm">
                        <Eye className="h-3 w-3" />
                        <span onClick={() => handleViewQuotationDetails(quotation)}>Quick View</span>
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Submitted: {new Date(quotation.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredQuotations.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? "You haven't submitted any quotations yet."
                  : `No quotations with status "${filterStatus.replace('_', ' ')}" found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Quotation Details Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">My Quotation Details</h3>
                <p className="text-sm text-gray-500 mt-1">Complete information about your submitted quote</p>
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
              {/* RFQ Information */}
              <div className="mb-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  RFQ Information
                </h4>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">RFQ Title</label>
                      <p className="text-lg font-bold text-blue-900">{selectedQuotation.rfq_title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Buyer Company</label>
                      <p className="text-sm text-blue-900 flex items-center">
                        <Building className="h-4 w-4 mr-1" />
                        📦 Sample Requested - Tracking details provided in quotation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your Quotation */}
              <div className="mb-8 bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Your Quotation
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <label className="block text-sm font-medium text-green-700 mb-2">Price per Unit</label>
                    <p className="text-3xl font-bold text-green-900">${selectedQuotation.quoted_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Total Value</label>
                    <p className="text-3xl font-bold text-blue-900">${selectedQuotation.total_value.toLocaleString()}</p>
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
                  {selectedQuotation.payment_terms && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Payment Terms</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedQuotation.payment_terms}</p>
                      </div>
                    </div>
                  )}
                  {selectedQuotation.shipping_terms && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Shipping Terms</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900">{selectedQuotation.shipping_terms}</p>
                      </div>
                    </div>
                  )}
                  {selectedQuotation.validity_days && (
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 mb-1">Quote Validity</label>
                      <div className="bg-white p-3 rounded-md border">
                        <p className="text-sm text-gray-900 font-medium">{selectedQuotation.validity_days} days</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantees & Services */}
              {(selectedQuotation.quality_guarantee !== undefined || selectedQuotation.sample_available !== undefined) && (
                <div className="mb-8 bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Guarantees & Services
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedQuotation.quality_guarantee !== undefined && (
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
                    )}
                    {selectedQuotation.sample_available !== undefined && (
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
                    )}
                  </div>
                </div>
              )}

              {/* Your Notes */}
              {selectedQuotation.notes && (
                <div className="mb-8 bg-orange-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Your Notes
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="text-gray-700 leading-relaxed">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}

              {/* Status Information */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Status Information
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <div className="bg-white p-3 rounded-md border">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedQuotation.status)}`}>
                        {getStatusIcon(selectedQuotation.status)}
                        <span className="capitalize">{selectedQuotation.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                    <div className="bg-white p-3 rounded-md border">
                      <p className="text-sm text-gray-900 font-medium">{new Date(selectedQuotation.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-700">
                    <strong>Status:</strong> {getStatusMessage(selectedQuotation.status)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Quote ID: {selectedQuotation.id} • Total Value: ${selectedQuotation.total_value.toLocaleString()}
              </div>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierQuotations;