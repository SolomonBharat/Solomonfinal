import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { useRFQs, useDeleteRFQ } from '../lib/queries';
import { toast } from 'sonner';

const MyRFQs = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const deleteRFQMutation = useDeleteRFQ();
  
  const { data: allRFQs = [], isLoading: loading } = useRFQs();
  
  // Filter RFQs for current user
  const rfqs = allRFQs.filter(rfq => rfq.buyer_id === user?.id);

  const deleteRFQ = async (rfqId: string) => {
    if (window.confirm('Are you sure you want to delete this RFQ?')) {
      try {
        await deleteRFQMutation.mutateAsync(rfqId);
        toast.success('RFQ deleted successfully');
      } catch (error) {
      } catch (error) {
        console.error('Error deleting RFQ:', error);
        toast.error('Failed to delete RFQ');
      }
        toast.error('Failed to delete RFQ');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      matched: { color: 'bg-purple-100 text-purple-800', icon: Package },
      quoting: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.pending_approval;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredRFQs = rfqs.filter(rfq => {
    if (filter === 'all') return true;
    return rfq.status === filter;
  });

  const stats = {
    total: rfqs.length,
    pending: rfqs.filter(r => r.status === 'pending_approval').length,
    active: rfqs.filter(r => ['approved', 'matched', 'quoting'].includes(r.status)).length,
  };

  if (loading) {
    return (
      <DashboardLayout title="My RFQs" subtitle="Manage your sourcing requests">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My RFQs" subtitle="Manage your sourcing requests">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total RFQs</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active RFQs</div>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              All ({rfqs.length})
            </button>
            <button
              onClick={() => setFilter('pending_approval')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'pending_approval' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 py-1 rounded-md text-sm ${filter === 'approved' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Active ({stats.active})
            </button>
          </div>
          <Link
            to="/create-rfq"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create RFQ</span>
          </Link>
        </div>

        {/* RFQs List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredRFQs.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No RFQs yet' : `No ${filter.replace('_', ' ')} RFQs`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Start by creating your first sourcing request'
                  : `You don't have any ${filter.replace('_', ' ')} RFQs`
                }
              </p>
              <Link
                to="/create-rfq"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First RFQ</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRFQs.map((rfq) => (
                <div key={rfq.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rfq.title}</h3>
                        {getStatusBadge(rfq.status)}
                      </div>
                      <p className="text-gray-600 mb-3">{rfq.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Category:</span> {rfq.category}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {rfq.quantity} {rfq.unit}
                        </div>
                        <div>
                          <span className="font-medium">Target Price:</span> ${rfq.target_price || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span> {new Date(rfq.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteRFQ(rfq.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyRFQs;