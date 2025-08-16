import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import { Package, Truck, CheckCircle, Clock, Eye, Download, MapPin, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Order {
  id: string;
  rfq_title: string;
  supplier_company: string;
  supplier_contact: string;
  supplier_location: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  status: 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'completed';
  order_date: string;
  expected_delivery: string;
  tracking_number?: string;
  payment_status: 'pending' | 'partial' | 'completed';
}

const BuyerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load buyer's orders from localStorage
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const buyerOrders = allOrders.filter((order: any) => 
      order.buyer_id === user?.id || order.buyer_email === user?.email
    );
    setOrders(buyerOrders);
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: 'bg-blue-100 text-blue-800',
      in_production: 'bg-yellow-100 text-yellow-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges];
  };

  const getPaymentBadge = (status: string) => {
    const badges = {
      pending: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800'
    };
    return badges[status as keyof typeof badges];
  };

  const columns = [
    {
      key: 'id',
      title: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'rfq_title',
      title: 'Product',
      sortable: true,
      render: (value: string, row: Order) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{row.quantity.toLocaleString()} units</p>
        </div>
      )
    },
    {
      key: 'supplier_company',
      title: 'Supplier',
      sortable: true,
      render: (value: string, row: Order) => (
        <div>
          <p className="font-medium text-gray-900">{row.supplier_contact}</p>
          <p className="text-sm text-gray-500">Verified Supplier</p>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{row.supplier_location}</span>
          </div>
        </div>
      )
    },
    {
      key: 'total_value',
      title: 'Order Value',
      sortable: true,
      render: (value: number, row: Order) => (
        <div>
          <p className="font-bold text-gray-900">${value.toLocaleString()}</p>
          <p className="text-sm text-gray-500">${row.unit_price.toFixed(2)} per unit</p>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Order Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(value)}`}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'payment_status',
      title: 'Payment',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'expected_delivery',
      title: 'Expected Delivery',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-900">{new Date(value).toLocaleDateString()}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (value: any, row: Order) => (
        <div className="flex space-x-2">
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            <Eye className="h-4 w-4" />
          </button>
          {row.tracking_number && (
            <button className="text-green-600 hover:text-green-800 text-sm">
              <Truck className="h-4 w-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout title="My Orders" subtitle="Track your orders and deliveries">
      <div className="p-6 space-y-6">
        {/* Order Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Production</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'in_production').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${orders.reduce((sum, o) => sum + o.total_value, 0).toLocaleString()}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <DataTable
          columns={columns}
          data={orders}
          searchable={true}
          exportable={true}
          pagination={true}
          pageSize={10}
        />
      </div>
    </DashboardLayout>
  );
};

export default BuyerOrders;