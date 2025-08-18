import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useSampleRequests, useUpdateSampleRequest } from '../../lib/queries';
import { toast } from 'sonner';
import { Package, Truck, CheckCircle, Clock, Eye, Edit } from 'lucide-react';

const SupplierSampleRequests = () => {
  const { user } = useAuth();
  const { data: sampleRequests = [], isLoading: loading } = useSampleRequests({ 
    supplier_id: user?.id 
  });
  const updateSampleRequest = useUpdateSampleRequest();
  
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState({
    courier_service: '',
    tracking_number: ''
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      requested: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Requested' },
      approved_by_admin: { color: 'bg-blue-100 text-blue-800', icon: Package, label: 'Approved' },
      shipped_by_supplier: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      rejected: { color: 'bg-red-100 text-red-800', icon: CheckCircle, label: 'Rejected' }
    };

    const badge = badges[status as keyof typeof badges] || badges.requested;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const handleUpdateTracking = async (requestId: string) => {
    if (!trackingData.courier_service || !trackingData.tracking_number) {
      toast.error('Please fill in both courier service and tracking number');
      return;
    }

    try {
      await updateSampleRequest.mutateAsync({
        id: requestId,
        updates: {
          courier_service: trackingData.courier_service,
          tracking_number: trackingData.tracking_number,
          status: 'shipped_by_supplier',
          shipped_at: new Date().toISOString()
        }
      });

      toast.success('Tracking information updated successfully!');
      setEditingRequest(null);
      setTrackingData({ courier_service: '', tracking_number: '' });
    } catch (error: any) {
      console.error('Error updating tracking:', error);
      toast.error('Failed to update tracking information');
    }
  };

  const stats = {
    total: sampleRequests.length,
    approved: sampleRequests.filter(r => r.status === 'approved_by_admin').length,
    shipped: sampleRequests.filter(r => r.status === 'shipped_by_supplier').length,
    delivered: sampleRequests.filter(r => r.status === 'delivered').length,
  };

  if (loading) {
    return (
      <DashboardLayout title="Sample Requests" subtitle="Manage sample requests and tracking">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sample Requests" subtitle="Manage sample requests and tracking">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Ready to Ship</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>

        {/* Sample Requests List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Sample Requests</h2>
          </div>
          
          {sampleRequests.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sample requests yet</h3>
              <p className="text-gray-600">Sample requests will appear here when buyers request samples</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sampleRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">Sample Request #{request.id}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-gray-600 mb-3">
                        RFQ: <span className="font-medium">{request.rfqs?.title}</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Buyer:</span> {request.buyer_profiles?.company_name || 'Unknown'}
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span> {new Date(request.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Delivery Address:</span> {request.delivery_address || 'Not provided'}
                        </div>
                        {request.approved_at && (
                          <div>
                            <span className="font-medium">Approved:</span> {new Date(request.approved_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {request.courier_service && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                          <div>
                            <span className="font-medium">Courier:</span> {request.courier_service}
                          </div>
                          <div>
                            <span className="font-medium">Tracking:</span> {request.tracking_number}
                          </div>
                        </div>
                      )}

                      {/* Tracking Form */}
                      {request.status === 'approved_by_admin' && editingRequest === request.id && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">Add Tracking Information</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Courier Service
                              </label>
                              <select
                                value={trackingData.courier_service}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, courier_service: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Courier</option>
                                <option value="DHL">DHL</option>
                                <option value="FedEx">FedEx</option>
                                <option value="UPS">UPS</option>
                                <option value="Blue Dart">Blue Dart</option>
                                <option value="DTDC">DTDC</option>
                                <option value="India Post">India Post</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tracking Number
                              </label>
                              <input
                                type="text"
                                value={trackingData.tracking_number}
                                onChange={(e) => setTrackingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                                placeholder="Enter tracking number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={() => handleUpdateTracking(request.id)}
                              disabled={updateSampleRequest.isPending}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              {updateSampleRequest.isPending ? 'Updating...' : 'Update Tracking'}
                            </button>
                            <button
                              onClick={() => setEditingRequest(null)}
                              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'approved_by_admin' && (
                        <button
                          onClick={() => setEditingRequest(request.id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add Tracking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📦 Sample Request Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">For Approved Requests</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Prepare the sample according to specifications</li>
                <li>• Package securely for international shipping</li>
                <li>• Add tracking information once shipped</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">Shipping Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use reliable courier services (DHL, FedEx, UPS)</li>
                <li>• Include proper customs documentation</li>
                <li>• Provide accurate tracking numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierSampleRequests;