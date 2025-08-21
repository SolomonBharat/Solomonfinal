import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle, X, User, LogOut, Bell, Eye, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  status: 'pending' | 'approved' | 'matched' | 'quoted' | 'closed';
  created_at: string;
  quotations_count: number;
  description?: string;
  delivery_timeline?: string;
  shipping_terms?: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
  max_price?: number;
}

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showRfqModal, setShowRfqModal] = useState(false);

  useEffect(() => {
    // Load user's RFQs from localStorage and demo RFQs
    const allRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    
    // Check for quotations that have been sent to buyer
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const sentQuotations = supplierQuotations.filter((q: any) => q.status === 'sent_to_buyer');
    
    // Filter RFQs to show only the current user's RFQs
    const userRFQs = allRFQs.filter((rfq: any) => rfq.buyer_id === user?.id).map((rfq: any) => {
      // Check if this RFQ has quotations
      const rfqQuotations = sentQuotations.filter((q: any) => q.rfq_id === rfq.id);
      
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
    setShowRfqModal(true);
  };
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'matched': return <CheckCircle className="h-4 w-4" />;
      case 'quoted': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-blue-600">Solomon Bharat</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600">Buyer Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">
            Manage your sourcing requests and connect with verified Indian suppliers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active RFQs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.filter(rfq => ['approved', 'matched', 'quoted'].includes(rfq.status)).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quotations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.reduce((sum, rfq) => sum + rfq.quotations_count, 0)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <Link 
            to="/create-rfq" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm border border-blue-600 transition-colors flex items-center justify-center"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Create RFQ</p>
            </div>
          </Link>
        </div>

        {/* RFQs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your RFQs</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rfqs.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                        <p className="text-sm text-gray-500">{rfq.category}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {rfq.quantity.toLocaleString()} {rfq.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${rfq