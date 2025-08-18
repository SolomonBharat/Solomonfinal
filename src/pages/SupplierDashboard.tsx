import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { FileText, Package, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useRFQs, useQuotations, useOrders, useSuppliers } from '../lib/queries';
import { Link } from 'react-router-dom';
import SubmitQuoteModal from '../components/SubmitQuoteModal';

const SupplierDashboard = () => {
  const { profile, user } = useAuth();
  const [selectedRFQ, setSelectedRFQ] = React.useState<any>(null);
  const [showQuoteModal, setShowQuoteModal] = React.useState(false);
  
  // Load real data from Supabase
  const { data: suppliers = [] } = useSuppliers();
  const { data: allQuotations = [], isLoading: quotationsLoading } = useQuotations();
  const { data: allOrders = [], isLoading: ordersLoading } = useOrders();

  // Get current supplier's categories
  const currentSupplier = suppliers.find(s => s.id === user?.id);
  const supplierCategories = currentSupplier?.product_categories || [];
  
  // Load RFQs filtered by supplier's categories
  const { data: availableRFQs = [], isLoading: rfqsLoading } = useRFQs({
    status: 'approved',
    categories: supplierCategories
  });
  
  const quotations = allQuotations.filter(q => q.supplier_id === user?.id);
  const orders = allOrders.filter(order => order.supplier_id === user?.id);

  const handleSubmitQuote = (rfq: any) => {
    setSelectedRFQ(rfq);
    setShowQuoteModal(true);
  };
  const stats = {
    availableRFQs: availableRFQs.length,
    totalQuotations: quotations.length,
    acceptedQuotations: quotations.filter(q => q.status === 'approved_for_buyer').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_value || 0), 0),
  };

  if (rfqsLoading || quotationsLoading || ordersLoading) {
    return (
      <DashboardLayout title="Supplier Dashboard" subtitle="Welcome to your supplier dashboard">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Supplier Dashboard" subtitle={`Welcome, ${profile?.full_name || 'Supplier'}`}>
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available RFQs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.availableRFQs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Quotations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuotations}</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted Quotes</p>
                <p className="text-2xl font-bold text-green-600">{stats.acceptedQuotations}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Available RFQs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Available RFQs</h2>
              <span className="text-sm text-gray-500">
                Showing RFQs for your categories: {supplierCategories.join(', ')}
              </span>
            </div>
          </div>

          <div className="p-6">
            {availableRFQs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Available</h3>
                <p className="text-gray-600">No approved RFQs match your categories yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRFQs.map((rfq) => (
                  <div key={rfq.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{rfq.title}</h3>
                        <p className="text-gray-600 mt-1">{rfq.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Category: {rfq.category}</span>
                          <span>Quantity: {rfq.quantity} {rfq.unit}</span>
                          {rfq.target_price && (
                            <span>Target Price: ${rfq.target_price}</span>
                          )}
                          <span>Posted: {new Date(rfq.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleSubmitQuote(rfq)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Submit Quote
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/supplier/dashboard" className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Browse RFQs</h3>
                <p className="text-sm opacity-90">Find new opportunities</p>
              </div>
            </div>
          </Link>

          <Link to="/supplier/quotations" className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">My Quotations</h3>
                <p className="text-sm opacity-90">Manage your quotes</p>
              </div>
            </div>
          </Link>

          <Link to="/supplier/performance" className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8" />
              <div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm opacity-90">View your metrics</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <SubmitQuoteModal
        rfq={selectedRFQ}
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        supplierId={user?.id || ''}
      />
    </DashboardLayout>
  );
};

export default SupplierDashboard;