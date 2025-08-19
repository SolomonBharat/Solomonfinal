import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, User, Building, MapPin, DollarSign, Truck, CheckCircle, Clock, X } from 'lucide-react';

interface SampleRequest {
  id: string;
  rfq_id: string;
  rfq_title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_company: string;
  buyer_email: string;
  buyer_phone: string;
  supplier_id: string;
  supplier_name: string;
  supplier_company: string;
  supplier_email: string;
  supplier_phone: string;
  quoted_price: number;
  quantity: number;
  status: 'pending_admin_review' | 'approved_by_admin' | 'shipped_by_supplier' | 'delivered_to_buyer';
  created_at: string;
  admin_approved_at?: string;
  courier_service?: string;
  tracking_id?: string;
  shipped_at?: string;
  delivered_at?: string;
}

const AdminSampleRequests = () => {
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadSampleRequests();
  }, []);

  const loadSampleRequests = () => {
    const allSampleRequests = JSON.parse(localStorage.getItem('sample_requests') || '[]');
    setSampleRequests(allSampleRequests);
  };

  const handleApproveSampleRequest = (requestId: string) => {
    const updatedRequests = sampleRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved_by_admin', admin_approved_at: new Date().toISOString() }
        : req
    );
    localStorage.setItem('sample_requests', JSON.stringify(updatedRequests));
    setSampleRequests(updatedRequests);
    alert('Sample request approved! Supplier can now upload tracking details.');
  };

  const handleMarkAsDelivered = (requestId: string) => {
    const updatedRequests = sampleRequests.map(req =>
      req.id === requestId
        ? { ...req, status: 'delivered_to_buyer', delivered_at: new Date().toISOString() }
        : req
    );
    localStorage.setItem('sample_requests', JSON.stringify(updatedRequests));
    setSampleRequests(updatedRequests);
    alert('Sample marked as delivered!');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_admin_review: 'bg-yellow-100 text-yellow-800',
      approved_by_admin: 'bg-blue-100 text-blue-800',
      shipped_by_supplier: 'bg-purple-100 text-purple-800',
      delivered_to_buyer: 'bg-green-100 text-green-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_admin_review': return <Clock className="h-4 w-4" />;
      case 'approved_by_admin': return <CheckCircle className="h-4 w-4" />;
      case 'shipped_by_supplier': return <Truck className="h-4 w-4" />;
      case 'delivered_to_buyer': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredRequests = sampleRequests.filter(req => {
    return filterStatus === 'all' || req.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium text-sm sm:text-base">Sample Requests</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sample Requests Management</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Review and manage all sample requests from buyers
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Requests</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{sampleRequests.length}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending Review</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {sampleRequests.filter(req => req.status === 'pending_admin_review').length}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Shipped by Supplier</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {sampleRequests.filter(req => req.status === 'shipped_by_supplier').length}
                  </p>
                </div>
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Delivered</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {sampleRequests.filter(req => req.status === 'delivered_to_buyer').length}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending_admin_review">Pending Admin Review</option>
                <option value="approved_by_admin">Approved by Admin</option>
                <option value="shipped_by_supplier">Shipped by Supplier</option>
                <option value="delivered_to_buyer">Delivered to Buyer</option>
              </select>
              <span className="text-sm text-gray-500">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Sample Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFQ & Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote Details
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Info
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{req.rfq_title}</p>
                          <p className="text-xs text-gray-500">RFQ ID: {req.rfq_id}</p>
                          <p className="text-xs text-gray-400">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{req.buyer_company}</p>
                          <p className="text-xs text-gray-500">{req.buyer_name}</p>
                          <p className="text-xs text-gray-400">{req.buyer_email}</p>
                          <p className="text-xs text-gray-400">{req.buyer_phone}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{req.supplier_company}</p>
                          <p className="text-xs text-gray-500">{req.supplier_name}</p>
                          <p className="text-xs text-gray-400">{req.supplier_email}</p>
                          <p className="text-xs text-gray-400">{req.supplier_phone}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">${req.quoted_price.toFixed(2)} / unit</p>
                          <p className="text-xs text-gray-500">{req.quantity} units</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(req.status)}`}>
                          {getStatusIcon(req.status)}
                          <span className="capitalize">{req.status.replace(/_/g, ' ')}</span>
                        </span>
                        {req.admin_approved_at && (
                          <p className="text-xs text-gray-400 mt-1">Approved: {new Date(req.admin_approved_at).toLocaleDateString()}</p>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        {req.status === 'shipped_by_supplier' || req.status === 'delivered_to_buyer' ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{req.courier_service}</p>
                            <p className="text-xs text-gray-500">{req.tracking_id}</p>
                            <p className="text-xs text-gray-400">Shipped: {new Date(req.shipped_at!).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {req.status === 'pending_admin_review' && (
                            <button
                              onClick={() => handleApproveSampleRequest(req.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 font-medium"
                            >
                              Approve
                            </button>
                          )}
                          {(req.status === 'shipped_by_supplier' || req.status === 'approved_by_admin') && (
                            <button
                              onClick={() => handleMarkAsDelivered(req.id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 font-medium"
                            >
                              Mark Delivered
                            </button>
                          )}
                          <a 
                            href={`https://wa.me/${req.buyer_phone}?text=${encodeURIComponent(`Hello ${req.buyer_name}, regarding your sample request for ${req.rfq_title} (RFQ ID: ${req.rfq_id})...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center space-x-1"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Contact Buyer</span>
                          </a>
                          <a 
                            href={`https://wa.me/${req.supplier_phone}?text=${encodeURIComponent(`Hello ${req.supplier_name}, regarding sample request for ${req.rfq_title} (RFQ ID: ${req.rfq_id})...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800 text-xs flex items-center space-x-1"
                          >
                            <Phone className="h-3 w-3" />
                            <span>Contact Supplier</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sample Requests Found</h3>
              <p className="text-gray-600 mb-6">
                There are no sample requests matching the current filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSampleRequests;