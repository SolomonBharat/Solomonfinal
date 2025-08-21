import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, X, Eye, Building, MapPin, User } from 'lucide-react';
import { db, SampleRequest } from '../lib/database';

const AdminSampleRequests = () => {
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    const requests = db.getSampleRequests();
    setSampleRequests(requests);
  }, []);

  const handleApproveRequest = (requestId: string) => {
    db.updateSampleRequest(requestId, {
      status: 'sent_to_suppliers',
      approved_at: new Date().toISOString()
    });

    // Refresh data
    const updatedRequests = db.getSampleRequests();
    setSampleRequests(updatedRequests);

    alert('✅ Sample request approved and sent to suppliers!\n\nSuppliers will be notified and can now provide sample pricing.');
  };

  const handleRejectRequest = (requestId: string) => {
    db.updateSampleRequest(requestId, {
      status: 'rejected',
      admin_notes: 'Request rejected by admin'
    });

    // Refresh data
    const updatedRequests = db.getSampleRequests();
    setSampleRequests(updatedRequests);

    alert('❌ Sample request rejected.');
  };

  const handleViewDetails = (request: SampleRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_admin_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      sent_to_suppliers: 'bg-blue-100 text-blue-800'
    };
    return badges[status as keyof typeof badges];
  };

  const pendingRequests = sampleRequests.filter(r => r.status === 'pending_admin_approval');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin" 
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Requests Management</h1>
            <p className="text-gray-600">
              Review and approve sample requests from buyers
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
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sampleRequests.filter(r => r.status === 'sent_to_suppliers').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {sampleRequests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Sample Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Sample Requests</h3>
            </div>
            
            <div className="p-6">
              {sampleRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Sample Requests</h4>
                  <p className="text-gray-600">No sample requests have been submitted yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sampleRequests.map((request) => (
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
                              <User className="h-4 w-4 mr-1" />
                              <span>{request.buyer_name}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Request Details */}
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-gray-500 text-sm">Sample Quantity:</span>
                          <p className="font-medium">{request.sample_quantity} sample{request.sample_quantity > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Suppliers:</span>
                          <p className="font-medium">{request.supplier_names.length} selected</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Requested:</span>
                          <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">RFQ ID:</span>
                          <p className="font-medium font-mono text-xs">{request.rfq_id}</p>
                        </div>
                      </div>

                      {/* Suppliers List */}
                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">Selected Suppliers:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {request.supplier_names.map((name, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {name}
                            </span>
                          ))}
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
                        <p className="text-sm text-gray-700 mt-1 p-3 bg-blue-50 rounded-md border border-blue-200 flex items-start">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                          {request.delivery_location}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          {request.status === 'pending_admin_approval' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 font-medium"
                              >
                                Approve & Send to Suppliers
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-50 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Request ID: {request.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sample Request Details</h3>
                <p className="text-sm text-gray-600">{selectedRequest.rfq_title}</p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Buyer Information */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Buyer Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-blue-700 text-sm">Company:</span>
                    <p className="font-medium text-blue-900">{selectedRequest.buyer_company}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 text-sm">Contact:</span>
                    <p className="font-medium text-blue-900">{selectedRequest.buyer_name}</p>
                  </div>
                </div>
              </div>

              {/* Sample Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Sample Request Details</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-sm">Sample Quantity:</span>
                    <p className="font-medium">{selectedRequest.sample_quantity} sample{selectedRequest.sample_quantity > 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Requested Date:</span>
                    <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              {selectedRequest.specifications && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Sample Specifications</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-700">{selectedRequest.specifications}</p>
                  </div>
                </div>
              )}

              {/* Delivery Location */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Delivery Location</h4>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start">
                  <MapPin className="h-5 w-5 mr-2 mt-0.5 text-blue-600" />
                  <p className="text-blue-800">{selectedRequest.delivery_location}</p>
                </div>
              </div>

              {/* Selected Suppliers */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Selected Suppliers ({selectedRequest.supplier_names.length})</h4>
                <div className="space-y-2">
                  {selectedRequest.supplier_names.map((name, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-medium text-green-900">{name}</span>
                      <span className="text-sm text-green-700">Verified Supplier</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Current Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {selectedRequest.status === 'pending_admin_approval' && (
                <>
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id);
                      setShowRequestModal(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve & Send to Suppliers
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSampleRequests;