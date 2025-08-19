import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, X, Eye, Plus, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import QASystem from '../components/QASystem';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: 'pending_approval' | 'approved' | 'matched' | 'quoted' | 'closed' | 'rejected';
  created_at: string;
  quotations_count: number;
  description?: string;
  delivery_timeline?: string;
  max_price?: number;
  shipping_terms?: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  verification_status?: string;
}

const MyRFQs = () => {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  useEffect(() => {
    loadUserRFQs();
  }, [user?.id]);

  const loadUserRFQs = async () => {
    if (!user?.id) return;

    try {
      const { data: rfqsData, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading RFQs:', error);
        return;
      }

      // Get quotation counts for each RFQ
      const rfqsWithQuotations = await Promise.all(
        (rfqsData || []).map(async (rfq) => {
          const { count } = await supabase
            .from('supplier_quotations')
            .select('*', { count: 'exact', head: true })
            .eq('rfq_id', rfq.id)
            .eq('status', 'approved_for_buyer');

          return {
            ...rfq,
            quotations_count: count || 0,
            status: count && count > 0 ? 'quoted' : rfq.status
          };
        })
      );

      setRfqs(rfqsWithQuotations);
    } catch (error) {
      console.error('Error in loadUserRFQs:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRfq?.id) return;

    try {
      const { error } = await supabase
        .from('rfqs')
        .update({
          title: editFormData.title,
          category: editFormData.category,
          description: editFormData.description,
          quantity: parseInt(editFormData.quantity),
          unit: editFormData.unit,
          target_price: parseFloat(editFormData.target_price),
          delivery_timeline: editFormData.delivery_timeline,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRfq.id);

      if (error) {
        console.error('Error updating RFQ:', error);
        alert('Failed to update RFQ. Please try again.');
        return;
      }

      // Reload RFQs
      await loadUserRFQs();
      setEditMode(false);
      alert('RFQ updated successfully!');
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      alert('Failed to update RFQ. Please try again.');
    }
  };
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    
    // Filter RFQs to show only the current user's RFQs
    const userRFQs = allRFQs.filter((rfq: any) => 
      rfq.buyer_id === user?.id || rfq.buyer_email === user?.email
    ).map((rfq: any) => {
      // Check if this RFQ has quotations
      const rfqQuotations = supplierQuotations.filter((q: any) => q.rfq_id === rfq.id && q.status === 'sent_to_buyer');
      
      // Ensure all numeric fields are properly converted
      const convertedRFQ = {
        ...rfq,
        quantity: parseInt(rfq.quantity) || 0,
        target_price: parseFloat(rfq.target_price) || 0,
        quotations_count: rfqQuotations.length
      };
      
      // Update status based on quotations
      if (rfqQuotations.length > 0) {
        convertedRFQ.status = 'quoted';
      }
      
      return convertedRFQ;
    });
    
    setRfqs(userRFQs);
  }, [user?.id]);

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setEditFormData(rfq);
    setShowRfqModal(true);
    setEditMode(false);
  };

  const handleEditRfq = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    // Update RFQ in localStorage
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === selectedRfq?.id ? { ...rfq, ...editFormData } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
    
    // Update local state
    setRfqs(prev => prev.map(rfq => 
      rfq.id === selectedRfq?.id ? { ...rfq, ...editFormData } : rfq
    ));
    
    setEditMode(false);
    alert('RFQ updated successfully!');
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
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 py-4">
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
              <span className="text-gray-900 font-medium text-sm sm:text-base">My RFQs</span>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My RFQs</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Track all your sourcing requests and their progress
                </p>
              </div>
              <Link 
                to="/create-rfq"
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Create New RFQ</span>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total RFQs</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{rfqs.length}</p>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                      {rfqs.filter(rfq => rfq.status === 'pending_approval').length}
                    </p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Active</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {rfqs.filter(rfq => ['approved', 'matched'].includes(rfq.status)).length}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Quoted</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                      {rfqs.filter(rfq => rfq.status === 'quoted').length}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredRFQs.map((rfq) => (
                <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {rfq.title}
                        </h3>
                        <p className="text-sm text-gray-600">{rfq.category}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                          {getStatusIcon(rfq.status)}
                          <span className="capitalize">{rfq.status.replace('_', ' ')}</span>
                        </span>
                        {rfq.verification_status === 'unverified' && rfq.status === 'pending_approval' && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                            Unverified Buyer
                          </span>
                        )}
                        {rfq.verification_status === 'verified' && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✅ Verified
                          </span>
                        )}
                      </div>
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
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                      <div className="flex flex-wrap gap-2">
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
                        {(rfq.status === 'pending_approval' || rfq.status === 'rejected') && (
                          <button 
                            onClick={() => {
                              setSelectedRfq(rfq);
                              setEditFormData(rfq);
                              setEditMode(true);
                              setShowRfqModal(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit RFQ</span>
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewRfqDetails(rfq)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                        >
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
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editMode ? 'Edit RFQ' : 'RFQ Details'}
              </h3>
              <button
                onClick={() => setShowRfqModal(false)}
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
                  {/* Basic Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

                  {/* Product Images */}
                  {selectedRfq.product_images && selectedRfq.product_images.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedRfq.product_images.map((imageName, index) => (
                          <div key={index} className="bg-gray-100 rounded-lg p-3 text-center">
                            <div className="aspect-square bg-gray-200 rounded flex items-center justify-center mb-2">
                              <span className="text-xs text-gray-600">📷</span>
                            </div>
                            <span className="text-xs text-gray-700 break-words">{imageName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements & Terms */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Terms</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="text-sm text-gray-700">{selectedRfq.additional_requirements}</p>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created Date</label>
                        <p className="mt-1 text-sm text-gray-900">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quotations Received</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedRfq.quotations_count > 0 ? `${selectedRfq.quotations_count} quotations` : 'No quotations yet'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Q&A Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Questions & Answers</h4>
                <QASystem 
                  rfqId={selectedRfq.id} 
                  mode="buyer_answer"
                />
              </div>

              <div className="mt-6">
                <QASystem 
                  rfqId={selectedRfq.id} 
                  mode="public_view"
                />
              </div>
            </div>
            
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowRfqModal(false)}
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
                (selectedRfq?.status === 'pending_approval' || selectedRfq?.status === 'rejected') && (
                  <button
                    onClick={handleEditRfq}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit RFQ
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyRFQs;