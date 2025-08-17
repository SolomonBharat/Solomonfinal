import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  useRFQs, 
  useSuppliers, 
  useAdminApproveRFQ, 
  useAdminAssignSuppliers 
} from '../../lib/queries';
import DashboardLayout from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  Package,
  DollarSign,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface AssignSuppliersModalProps {
  rfq: any;
  isOpen: boolean;
  onClose: () => void;
}

function AssignSuppliersModal({ rfq, isOpen, onClose }: AssignSuppliersModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const { data: suppliers = [] } = useSuppliers();
  const assignSuppliers = useAdminAssignSuppliers();

  const verifiedSuppliers = suppliers.filter(s => 
    s.verification_status === 'verified' && 
    s.product_categories.includes(rfq.category)
  );

  const handleAssign = async () => {
    if (selectedSuppliers.length === 0) {
      toast.error('Please select at least one supplier');
      return;
    }

    try {
      await assignSuppliers.mutateAsync({
        rfqId: rfq.id,
        supplierIds: selectedSuppliers
      });
      toast.success('Suppliers assigned successfully');
      onClose();
      setSelectedSuppliers([]);
    } catch (error) {
      toast.error('Failed to assign suppliers');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assign Suppliers to RFQ</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-900">{rfq.title}</h3>
          <p className="text-sm text-gray-600">Category: {rfq.category}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Available Suppliers ({verifiedSuppliers.length})</h4>
          {verifiedSuppliers.length === 0 ? (
            <p className="text-gray-500">No verified suppliers available for this category</p>
          ) : (
            verifiedSuppliers.map(supplier => (
              <div key={supplier.id} className="flex items-center space-x-3 p-3 border rounded">
                <input
                  type="checkbox"
                  checked={selectedSuppliers.includes(supplier.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                    } else {
                      setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                    }
                  }}
                  className="rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">{supplier.profiles?.company_name || 'Unknown Company'}</p>
                  <p className="text-sm text-gray-600">
                    Categories: {supplier.product_categories.join(', ')}
                  </p>
                  {supplier.years_in_business && (
                    <p className="text-sm text-gray-500">
                      {supplier.years_in_business} years in business
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleAssign}
            disabled={selectedSuppliers.length === 0 || assignSuppliers.isPending}
          >
            {assignSuppliers.isPending ? 'Assigning...' : `Assign ${selectedSuppliers.length} Supplier(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRFQs() {
  const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const { data: rfqs = [], isLoading } = useRFQs();
  const approveRFQ = useAdminApproveRFQ();

  const handleApprove = async (rfqId: string) => {
    try {
      await approveRFQ.mutateAsync(rfqId);
      toast.success('RFQ approved successfully');
    } catch (error) {
      toast.error('Failed to approve RFQ');
    }
  };

  const handleAssignSuppliers = (rfq: any) => {
    setSelectedRFQ(rfq);
    setShowAssignModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      matched: { color: 'bg-blue-100 text-blue-800', label: 'Matched' },
      quoting: { color: 'bg-purple-100 text-purple-800', label: 'Quoting' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_approval;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">RFQ Management</h1>
          <div className="text-sm text-gray-500">
            Total RFQs: {rfqs.length}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-xl font-semibold">
                    {rfqs.filter(r => r.status === 'pending_approval').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-semibold">
                    {rfqs.filter(r => r.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Matched</p>
                  <p className="text-xl font-semibold">
                    {rfqs.filter(r => r.status === 'matched').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-xl font-semibold">
                    {rfqs.filter(r => ['approved', 'matched', 'quoting'].includes(r.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RFQs List */}
        <Card>
          <CardHeader>
            <CardTitle>All RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rfqs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No RFQs found</p>
              ) : (
                rfqs.map(rfq => (
                  <div key={rfq.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{rfq.title}</h3>
                        <p className="text-gray-600 mt-1">{rfq.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Category: {rfq.category}</span>
                          <span>Quantity: {rfq.quantity} {rfq.unit}</span>
                          {rfq.target_price && (
                            <span className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Target: ${rfq.target_price}
                            </span>
                          )}
                          <span>Created: {new Date(rfq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(rfq.status)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-sm text-gray-600">
                        Buyer: {rfq.profiles?.company_name || rfq.profiles?.full_name || 'Unknown'}
                      </div>
                      
                      <div className="flex space-x-2">
                        {rfq.status === 'pending_approval' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(rfq.id)}
                            disabled={approveRFQ.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {rfq.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAssignSuppliers(rfq)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Assign Suppliers
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AssignSuppliersModal
        rfq={selectedRFQ}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />
    </DashboardLayout>
  );
}