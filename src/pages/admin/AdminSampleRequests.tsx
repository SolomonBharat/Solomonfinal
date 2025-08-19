import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Truck, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'sonner';

const AdminSampleRequests = () => {
  const queryClient = useQueryClient();

  // Fetch sample requests
  const { data: sampleRequests, isLoading } = useQuery({
    queryKey: ['adminSampleRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sample_requests')
        .select(`
          *,
          rfqs!inner(title),
          profiles!buyer_id(full_name, company_name),
          profiles!supplier_id(full_name, company_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Approve sample mutation
  const approveSampleMutation = useMutation({
    mutationFn: async (sampleId: string) => {
      const { error } = await supabase.rpc('admin_approve_sample', {
        p_sample_id: sampleId,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSampleRequests'] });
      toast.success('Sample request approved');
    },
    onError: (error: any) => {
      toast.error('Failed to approve sample request', {
        description: error.message,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      requested: 'bg-yellow-100 text-yellow-800',
      approved_by_admin: 'bg-blue-100 text-blue-800',
      shipped_by_supplier: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested': return <Clock className="h-4 w-4" />;
      case 'approved_by_admin': return <CheckCircle className="h-4 w-4" />;
      case 'shipped_by_supplier': return <Truck className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Sample Requests" subtitle="Manage sample requests">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sample Requests" subtitle="Manage sample requests">
      <div className="p-6 space-y-6">
        {/* Sample Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sample Requests</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RFQ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleRequests?.map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{request.rfqs?.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.profiles?.company_name}
                        </p>
                        <p className="text-xs text-gray-500">{request.profiles?.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.profiles?.company_name}
                        </p>
                        <p className="text-xs text-gray-500">{request.profiles?.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.tracking_number ? (
                        <div>
                          <p className="font-medium">{request.courier_service}</p>
                          <p className="text-xs text-gray-500">{request.tracking_number}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not available</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {request.status === 'requested' && (
                        <button
                          onClick={() => approveSampleMutation.mutate(request.id)}
                          disabled={approveSampleMutation.isPending}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {sampleRequests?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sample requests</h3>
            <p className="text-gray-600">Sample requests will appear here when buyers request them.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSampleRequests;