import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, CheckCircle, X, Eye, Users, Edit } from 'lucide-react';
import { useRFQs, useSuppliers, useAdminApproveRFQ, useAdminAssignSuppliers, useUpdateRFQ } from '../lib/queries';
import { toast } from 'sonner';

const AdminRFQs = () => {
  const [selectedRFQ, setSelectedRFQ] = useState<any | null>(null);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedRFQs, setSelectedRFQs] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rfqs = [], isLoading: loading } = useRFQs();
  const { data: suppliers = [] } = useSuppliers();
  const approveRFQMutation = useAdminApproveRFQ();
  const assignSuppliersMutation = useAdminAssignSuppliers();
  const updateRFQMutation = useUpdateRFQ();

  const verifiedSuppliers = suppliers.filter(s => s.verification_status === 'verified');

  const handleRFQSelect = (rfqId: string) => {
    setSelectedRFQs(prev => 
      prev.includes(rfqId) 
        ? prev.filter(id => id !== rfqId)
        : [...prev, rfqId]
    );
  };

  const handleApprove = (rfqId: string) => {
    approveRFQMutation.mutate(rfqId, {
      onSuccess: () => {
        toast.success('RFQ approved successfully!');
      },
      onError: (error) => {
        console.error('Error approving RFQ:', error);
        toast.error('Failed to approve RFQ');
      }
    });
  };

  const handleReject = (rfqId: string) => {
    updateRFQMutation.mutate({
      id: rfqId,
      updates: { status: 'closed' }
    }, {
      onSuccess: () => {
        toast.success('RFQ rejected');
      },
      onError: (error) => {
        console.error('Error rejecting RFQ:', error);
        toast.error('Failed to reject RFQ');
      }
    });
  };

  const handleAssignSuppliers = (rfqId: string) => {
    // For demo, assign first 3 verified suppliers
    const supplierIds = verifiedSuppliers.slice(0, 3).map(s => s.id);
    
    if (supplierIds.length === 0) {
      toast.error('No verified suppliers available');
      return;
    }

    assignSuppliersMutation.mutate({
      rfqId,
      supplierIds
    }, {
      onSuccess: () => {
        toast.success('Suppliers assigned successfully!');
      },
      onError: (error) => {
        console.error('Error assigning suppliers:', error);
        toast.error('Failed to assign suppliers');
      }
    });
  };

  const handleViewRFQDetails = (rfq: any) => {
    setSelectedRFQ(rfq);
    setEditFormData(rfq);
    setShowRFQModal(true);
    setEditMode(false);
  };

  const handleEditRFQ = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (selectedRFQ) {
      updateRFQMutation.mutate({
        id: selectedRFQ.id,
        updates: editFormData
      }, {
        onSuccess: () => {
          setEditMode(false);
          toast.success('RFQ updated successfully!');
        },
        onError: (error) => {
          console.error('Error updating RFQ:', error);
          toast.error('Failed to update RFQ');
        }
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoting: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    
    return badges[urgency as keyof typeof badges];
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesStatus = filterStatus === 'all' || rfq.status === filterStatus;
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const categories = [
    'Textiles & Apparel',
    'Spices & Food Products',
    'Handicrafts & Home Decor',
    'Electronics & Components',
    'Pharmaceuticals & Healthcare',
    'Chemicals & Materials',
    'Automotive Parts',
    'Jewelry & Gems',
    'Leather Goods',
    'Agricultural Products',
    'Industrial Equipment',
    'Other'
  ];

  const units = [
    'pieces', 'kg', 'tons', 'meters', 'liters', 'boxes', 'cartons', 'sets', 'pairs', 'dozens'
  ];

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
            <span className="text-gray-900 font-medium text-sm sm:text-base">Manage RFQs</span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Manage RFQs</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Review, approve, and assign RFQs to appropriate suppliers
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search RFQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64 text-sm"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="matched">Matched</option>
                  <option value="quoting">Quoting</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredRFQs.length} RFQ{filteredRFQs.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* RFQs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFQ Details
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Urgency
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRFQs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRFQs.includes(rfq.id)}
                          onChange={() => handleRFQSelect(rfq.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32 sm:max-w-none">{rfq.title}</p>
                          <p className="text-xs text-gray-500">{rfq.category}</p>
                          <p className="text-xs text-gray-400">{rfq.created_at}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Buyer</p>
                          <p className="text-xs text-gray-500">Company</p>
                          <p className="text-xs text-gray-400">Country</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        ${(rfq.target_price * rfq.quantity || 0).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                          {rfq.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge('medium')}`}>
                          medium
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {rfq.status === 'pending_approval' && (
                            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={() => handleApprove(rfq.id)}
                                className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-green-700 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(rfq.id)}
                                className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-red-700 font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {rfq.status === 'approved' && (
                            <button
                              onClick={() => handleAssignSuppliers(rfq.id)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                            >
                              <Users className="h-3 w-3" />
                              <span>Assign Suppliers</span>
                            </button>
                          )}
                          {rfq.status === 'matched' && (
                            <div className="text-xs sm:text-sm text-purple-600">
                              Suppliers assigned
                            </div>
                          )}
                          {rfq.status === 'quoting' && (
                            <div className="text-xs sm:text-sm text-green-600">
                              Quotations received
                            </div>
                          )}
                          <button 
                            onClick={() => handleViewRFQDetails(rfq)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRFQs.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <p className="text-blue-800">
                  {selectedRFQs.length} RFQ{selectedRFQs.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Bulk Approve
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                    Bulk Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 text-sm sm:text-base">Pending Approval</h4>
              <p className="text-xl sm:text-2xl font-bold text-yellow-900">
                {rfqs.filter(rfq => rfq.status === 'pending_approval').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Approved</h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">
                {rfqs.filter(rfq => rfq.status === 'approved').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 text-sm sm:text-base">Matched</h4>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">
                {rfqs.filter(rfq => rfq.status === 'matched').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 text-sm sm:text-base">Quoting</h4>
              <p className="text-xl sm:text-2xl font-bold text-green-900">
                {rfqs.filter(rfq => rfq.status === 'quoting').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Details Modal */}
      {showRFQModal && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editMode ? 'Edit RFQ' : 'RFQ Details'}
              </h3>
              <button
                onClick={() => setShowRFQModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {editMode ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                      <input
                        type="number"
                        value={editFormData.quantity || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                      <select
                        value={editFormData.unit || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.target_price || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, target_price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Timeline</label>
                      <input
                        type="text"
                        value={editFormData.delivery_timeline || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, delivery_timeline: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={4}
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Buyer Information */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Buyer Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-blue-700 font-medium">Company:</span>
                        <p className="text-blue-900">Company Name</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Contact:</span>
                        <p className="text-blue-900">Contact Name</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Email:</span>
                        <p className="text-blue-900">email@example.com</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Phone:</span>
                        <p className="text-blue-900">Phone Number</p>
                      </div>
                    </div>
                  </div>

                  {/* RFQ Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">RFQ Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <p className="mt-1 text-sm text-gray-900">{editFormData.title}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <p className="mt-1 text-sm text-gray-900">{editFormData.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quantity</label>
                        <p className="mt-1 text-sm text-gray-900">{editFormData.quantity} {editFormData.unit}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Target Price</label>
                        <p className="mt-1 text-sm text-gray-900">${editFormData.target_price}</p>
                      </div>
                    </div>
                    {editFormData.description && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="mt-1 text-sm text-gray-900">{editFormData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowRFQModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {editMode ? (
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={handleEditRFQ}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit RFQ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRFQs;