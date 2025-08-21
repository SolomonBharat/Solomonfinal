import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, X, Eye, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db, RFQ } from '../lib/database';


const MyRFQs = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);

  useEffect(() => {
    // Load user's RFQs from Supabase
    const loadRFQs = async () => {
      if (user?.id) {
        const userRFQs = await db.getRFQsByBuyer(user.id);
        
        // Update quotations count for each RFQ
        const rfqsWithQuotations = await Promise.all(
          userRFQs.map(async (rfq) => {
            const quotations = await db.getQuotationsByRFQ(rfq.id);
            const sentQuotations = quotations.filter(q => q.status === 'sent_to_buyer');
            return {
              ...rfq,
              quotations_count: sentQuotations.length,
              status: sentQuotations.length > 0 ? 'quoted' : rfq.status
            };
          })
        );
        
        setRfqs(rfqsWithQuotations);
      }
    };

    loadRFQs();
  }, [user?.id]);

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqModal(true);
  };
  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || badges.pending_approval;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'matched': return <FileText className="h-4 w-4" />;
      case 'quoted': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <X className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'Awaiting admin review';
      case 'approved': return 'Approved - Finding suppliers';
      case 'matched': return 'Suppliers found - Requesting quotes';
      case 'quoted': return 'Quotations received';
      case 'closed': return 'RFQ completed';
      case 'rejected': return 'RFQ rejected';
      default: return 'Processing';
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    return filterStatus === 'all' || rfq.status === filterStatus;
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">My RFQs</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My RFQs</h1>
              <p className="text-gray-600">
                Track all your sourcing requests and their progress
              </p>
            </div>
            <Link 
              to="/create-rfq"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create New RFQ</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {rfqs.filter(rfq => rfq.status === 'pending_approval').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {rfqs.filter(rfq => ['approved', 'matched'].includes(rfq.status)).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quoted</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rfqs.filter(rfq => rfq.status === 'quoted').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
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
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="matched">Matched</option>
                <option value="quoted">Quoted</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredRFQs.length} RFQ{filteredRFQs.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* RFQs Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {rfq.title}
                      </h3>
                      <p className="text-sm text-gray-600">{rfq.category}</p>
                    </div>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                      {getStatusIcon(rfq.status)}
                      <span className="capitalize">{rfq.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  {/* RFQ Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">Quantity:</span>
                      <p className="font-medium text-sm">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Target Price:</span>
                      <p className="font-medium text-sm">${rfq.target_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Created:</span>
                      <p className="font-medium text-sm">{new Date(rfq.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Quotations:</span>
                      <p className="font-medium text-sm">
                        {rfq.quotations_count > 0 ? `${rfq.quotations_count} received` : 'None yet'}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {rfq.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{rfq.description}</p>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Status:</strong> {getStatusMessage(rfq.status)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {rfq.status === 'matched' && (
                        <Link 
                          to={`/rfq/${rfq.id}/suppliers`}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          View Suppliers
                        </Link>
                      )}
                      {rfq.status === 'quoted' && (
                        <Link 
                          to={`/rfq/${rfq.id}/quotations`}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          View Quotes ({rfq.quotations_count})
                        </Link>
                      )}
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm">
                        <Eye className="h-3 w-3" />
                        <span>Quick View</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRFQs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs found</h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? "You haven't created any RFQs yet. Start sourcing your first product!"
                  : `No RFQs with status "${filterStatus.replace('_', ' ')}" found.`
                }
              </p>
              {filterStatus === 'all' && (
                <Link 
                  to="/create-rfq"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Your First RFQ</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
      {/* RFQ Details Modal */}
      {showRfqModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">RFQ Details</h3>
              <button
                onClick={() => setShowRfqModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Title</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{selectedRfq.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRfq.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{selectedRfq.quantity.toLocaleString()} {selectedRfq.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRfq.status)} mt-1`}>
                      {getStatusIcon(selectedRfq.status)}
                      <span className="capitalize">{selectedRfq.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Target Price</label>
                    <p className="mt-1 text-xl font-bold text-blue-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-blue-600">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  {selectedRfq.max_price && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-orange-700">Maximum Price</label>
                      <p className="mt-1 text-xl font-bold text-orange-900">${selectedRfq.max_price.toFixed(2)}</p>
                      <p className="text-sm text-orange-600">per {selectedRfq.unit.slice(0, -1)}</p>
                    </div>
                  )}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">Total Budget</label>
                    <p className="mt-1 text-xl font-bold text-green-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-green-600">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {selectedRfq.description && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRfq.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements & Terms */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Terms</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedRfq.delivery_timeline && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Delivery Timeline</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.delivery_timeline}</p>
                    </div>
                  )}
                  {selectedRfq.shipping_terms && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shipping Terms</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.shipping_terms}</p>
                    </div>
                  )}
                  {selectedRfq.quality_standards && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quality Standards</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.quality_standards}</p>
                    </div>
                  )}
                  {selectedRfq.certifications_needed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Required Certifications</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRfq.certifications_needed}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Requirements */}
              {selectedRfq.additional_requirements && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Requirements</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-700">{selectedRfq.additional_requirements}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quotations Received</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {selectedRfq.quotations_count > 0 ? `${selectedRfq.quotations_count} quotations` : 'No quotations yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowRfqModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyRFQs;