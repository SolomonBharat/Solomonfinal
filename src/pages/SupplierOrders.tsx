import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { Package, Truck, CheckCircle, Clock, Eye, Edit } from 'lucide-react';

const SupplierOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load mock orders
    const mockOrders = [
      {
        id: 'order-1',
        rfq_title: 'Cotton T-Shirts Export Quality',
        buyer_company: 'Global Trade Corp',
        buyer_contact: 'John Smith',
        quantity: 1000,
        unit: 'pieces',
        unit_price: 12.50,
        total_value: 12500,
        status: 'in_production',
        created_at: '2024-01-15T10:00:00Z',
        expected_delivery: '2024-02-15T00:00:00Z',
        tracking_info: 'IN-PROD-2024-001',
        payment_terms: '30% advance, 70% on shipment',
        shipping_address: '123 Trade Street, New York, USA'
      },
      {
        id: 'order-2',
        rfq_title: 'Organic Turmeric Powder',
        buyer_company: 'Health Foods Inc',
        buyer_contact: 'Sarah Johnson',
        quantity: 500,
        unit: 'kg',
        unit_price: 8.75,
        total_value: 4375,
        status: 'shipped',
        created_at: '2024-01-10T14:30:00Z',
        expected_delivery: '2024-02-10T00:00:00Z',
        tracking_info: 'TRK-2024-SP-789',
        payment_terms: 'LC at sight',
        shipping_address: '456 Health Ave, California, USA'
      },
      {
        id: 'order-3',
        rfq_title: 'Handcrafted Wooden Furniture',
        buyer_company: 'Home Decor Ltd',
        buyer_contact: 'Mike Wilson',
        quantity: 50,
        unit: 'sets',
        unit_price: 245.00,
        total_value: 12250,
        status: 'completed',
        created_at: '2023-12-20T09:15:00Z',
        expected_delivery: '2024-01-20T00:00:00Z',
        tracking_info: 'DELIVERED',
        payment_terms: '50% advance, 50% before shipment',
        shipping_address: '789 Decor Blvd, Texas, USA'
      }
    ];
    
    setOrders(mockOrders);
    setLoading(false);
  }, [user]);

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Confirmed' },
      in_production: { color: 'bg-yellow-100 text-yellow-800', icon: Package, label: 'In Production' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck, label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Delivered' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' }
    };
    
    const badge = badges[status as keyof typeof badges] || badges.confirmed;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const stats = {
    total: orders.length,
    in_production: orders.filter(o => o.status === 'in_production').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
    total_revenue: orders.reduce((sum, order) => sum + order.total_value, 0)
  };

  if (loading) {
    return (
      <DashboardLayout title="My Orders" subtitle="Manage your order fulfillment">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Orders" subtitle="Manage your order fulfillment">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.in_production}</div>
            <div className="text-sm text-gray-600">In Production</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">${stats.total_revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600">Your orders will appear here once buyers accept your quotations</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{order.rfq_title}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-gray-600 mb-3">
                        Buyer: <span className="font-medium">{order.buyer_company}</span> • Contact: {order.buyer_contact}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Quantity:</span> {order.quantity.toLocaleString()} {order.unit}
                        </div>
                        <div>
                          <span className="font-medium">Unit Price:</span> ${order.unit_price}
                        </div>
                        <div>
                          <span className="font-medium">Total Value:</span> ${order.total_value.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div>
                          <span className="font-medium">Payment Terms:</span> {order.payment_terms}
                        </div>
                        <div>
                          <span className="font-medium">Expected Delivery:</span> {new Date(order.expected_delivery).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mb-3">
                        <span className="font-medium">Shipping Address:</span> {order.shipping_address}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Tracking:</span> {order.tracking_info}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="text-gray-400 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      {order.status === 'in_production' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="px-3 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Management Tips */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">📦 Order Management Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">Production Management</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Update order status regularly</li>
                <li>• Communicate any delays immediately</li>
                <li>• Maintain quality control throughout production</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-800">Shipping & Delivery</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Provide accurate tracking information</li>
                <li>• Ensure proper packaging for international shipping</li>
                <li>• Follow up on delivery confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupplierOrders;