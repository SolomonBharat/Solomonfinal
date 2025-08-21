import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Bell,
  User,
  LogOut,
  Settings,
  Eye,
  X,
  Star,
  MapPin,
  Award,
  Building,
  Phone,
  Mail,
  Globe,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const demoRFQs: RFQ[] = [];

interface RFQ {
  id: string;
  title: string;
  buyer: {
    name: string;
    company: string;
    country: string;
  };
  category: string;
  quantity: number;
  unit: string;
  budget: number;
  status: 'pending_approval' | 'approved' | 'matched' | 'quoted' | 'closed' | 'rejected';
  created_at: string;
  urgency: 'low' | 'medium' | 'high';
  matched_suppliers: number;
}

interface Quotation {
  id: string;
  rfq_id: string;
  rfq_title: string;
  supplier_name: string;
  supplier_location: string;
  buyer_company: string;
  buyer_country: string;
  quoted_price: number;
  moq: number;
  lead_time: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'sent_to_buyer';
  submitted_at: string;
  notes: string;
  total_value: number;
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [showRFQModal, setShowRFQModal] = useState(false);

  useEffect(() => {
    // Load RFQs
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    
    const convertedUserRFQs = userRFQs.map((rfq: any) => ({
      id: rfq.id,
      title: rfq.title,
      buyer: {
        name: rfq.buyer_name || 'User',
        company: rfq.buyer_company || 'Company',
        country: rfq.buyer_country || 'Country'
      },
      category: rfq.category,
      quantity: parseInt(rfq.quantity) || 0,
      unit: rfq.unit,
      budget: (parseFloat(rfq.target_price) || 0) * (parseInt(rfq.quantity) || 0),
      status: rfq.status || 'pending_approval',
      created_at: rfq.created_at,
      urgency: 'medium',
      matched_suppliers: 0
    }));
    
    setRFQs([...demoRFQs, ...convertedUserRFQs]);
    // Load Quotations
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    
    setQuotations(supplierQuotations);
  }, []);

  const [stats] = useState({
    total_rfqs: 156,
    pending_rfqs: 12,
    active_suppliers: 847,
    monthly_gmv: 2450000,
    quotations_pending: 23,
    monthly_growth: 18.5
  });

  const handleApproveRFQ = (rfqId: string) => {
    setRFQs(prev => prev.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'approved' as const } : rfq
    ));
    
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'approved' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
    alert('RFQ approved successfully!');
  };

  const handleRejectRFQ = (rfqId: string) => {
    setRFQs(prev => prev.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'rejected' as const } : rfq
    ));
    
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'rejected' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
    alert('❌ RFQ rejected.\n\n📋 The buyer will be notified and can resubmit with corrections if needed.');
  };

  const handleApproveQuotation = (quotationId: string) => {
    setQuotations(prev => prev.map(quote => 
      quote.id === quotationId ? { ...quote, status: 'sent_to_buyer' as const } : quote
    ));
    
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'sent_to_buyer' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    alert('Quotation approved and sent to buyer!');
  };

  const handleRejectQuotation = (quotationId: string) => {
    setQuotations(prev => prev.map(quote => 
      quote.id === quotationId ? { ...quote, status: 'rejected' as const } : quote
    ));
    
    const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    const updatedQuotations = supplierQuotations.map((quote: any) => 
      quote.id === quotationId ? { ...quote, status: 'rejected' } : quote
    );
    localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    alert('Quotation rejected.');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      matched: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
      pending_review: 'bg-yellow-100 text-yellow-800',
      sent_to_buyer: 'bg-green-100 text-green-800'
    };
    return badges[status as keyof typeof badges] || badges.pending_approval;
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[urgency as keyof typeof badges];
  };

  const pendingRFQs = rfqs.filter(rfq => rfq.status === 'pending_approval');
  const pendingQuotations = quotations.filter(q => q.status === 'pending_review');

  const handleViewRFQDetails = (rfq: RFQ) => {
    // Load full RFQ details from localStorage
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const fullRFQ = userRFQs.find((r: any) => r.id === rfq.id);
    
    if (fullRFQ) {
      setSelectedRFQ({
        ...rfq,
        fullDetails: fullRFQ
      });
    } else {
      setSelectedRFQ(rfq);
    }
    setShowRFQModal(true);
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
              <span className="text-gray-600">Admin Portal</span>
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive oversight of RFQs, quotations, and platform operations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                <p className="text-sm text-gray-600">Pending RFQs</p>
                <p className="text-2xl font-bold text-orange-600">{pendingRFQs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_suppliers}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly GMV</p>
                <p className="text-2xl font-bold text-gray-900">${(stats.monthly_gmv / 1000000).toFixed(1)}M</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Quotes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingQuotations.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth</p>
                <p className="text-2xl font-bold text-green-600">+{stats.monthly_growth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Pending RFQs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending RFQ Approvals</h3>
              <Link 
                to="/admin/rfqs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-6">
              {pendingRFQs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending RFQs</p>
              ) : (
                <div className="space-y-4">
                  {pendingRFQs.slice(0, 3).map((rfq) => (
                    <div key={rfq.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{rfq.title}</h4>
                          <p className="text-sm text-gray-600">{rfq.buyer.company}, {rfq.buyer.country}</p>
                          <p className="text-xs text-gray-500">{rfq.category}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(rfq.urgency)}`}>
                          {rfq.urgency}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>
                          <p className="font-medium">${rfq.budget.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveRFQ(rfq.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRFQ(rfq.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-medium"
                        >
                          Reject
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                          <Eye className="h-3 w-3 inline mr-1" />
                          <span onClick={() => handleViewRFQDetails(rfq)}>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Quotations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending Quotation Reviews</h3>
              <span className="text-sm text-gray-500">{pendingQuotations.length} pending</span>
            </div>
            <div className="p-6">
              {pendingQuotations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending quotations</p>
              ) : (
                <div className="space-y-4">
                  {pendingQuotations.slice(0, 3).map((quotation) => (
                    <div key={quotation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{quotation.rfq_title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Building className="h-3 w-3 mr-1" />
                            <span>{quotation.supplier_company}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span>Contact: {quotation.supplier_name}</span> • 
                            <span> {quotation.supplier_location}</span> • 
                            <span> For: {quotation.buyer_company}</span>
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            <span>📧 {quotation.supplier_email}</span> • 
                            <span>📞 {quotation.supplier_phone}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">${quotation.quoted_price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">per unit</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">MOQ:</span>
                          <p className="font-medium">{quotation.moq.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Value:</span>
                          <p className="font-medium text-green-600">${quotation.total_value.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Lead Time:</span>
                          <p className="font-medium">{quotation.lead_time}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <p className="font-medium">{new Date(quotation.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {quotation.notes && (
                        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {quotation.notes}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveQuotation(quotation.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-medium"
                        >
                          Approve & Send
                        </button>
                        <button
                          onClick={() => handleRejectQuotation(quotation.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-medium"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setShowQuotationModal(true);
                          }}
                          className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6">
          <Link 
            to="/admin/rfqs"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Manage RFQs</h3>
                <p className="text-sm text-gray-600">{pendingRFQs.length} pending approval</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/admin/suppliers"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Supplier Network</h3>
                <p className="text-sm text-gray-600">{stats.active_suppliers} active suppliers</p>
              </div>
            </div>
          </Link>
          
          <Link 
            to="/admin/onboard-supplier"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Plus className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Onboard Supplier</h3>
                <p className="text-sm text-gray-600">Add new verified supplier</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Review Quotations</h3>
                <p className="text-sm text-gray-600">{pendingQuotations.length} awaiting review</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-gray-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Platform Settings</h3>
                <p className="text-sm text-gray-600">Configure system parameters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(pendingRFQs.length > 0 || pendingQuotations.length > 0) && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Attention Required</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {pendingRFQs.length > 0 && <li>• {pendingRFQs.length} RFQs need approval</li>}
              {pendingQuotations.length > 0 && <li>• {pendingQuotations.length} quotations awaiting review</li>}
            </ul>
          </div>
        )}
      </div>

      {/* Quotation Review Modal */}
      {showQuotationModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Review Quotation</h3>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* RFQ Details */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">RFQ: {selectedQuotation.rfq_title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buyer:</span>
                    <p className="font-medium">{selectedQuotation.buyer_company}, {selectedQuotation.buyer_country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium">{new Date(selectedQuotation.submitted_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Supplier Information</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700">Company Name</label>
                      <p className="mt-1 text-sm text-green-900 font-medium">{selectedQuotation.supplier_company}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Contact Person</label>
                      <p className="mt-1 text-sm text-green-900">{selectedQuotation.supplier_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Location</label>
                      <p className="mt-1 text-sm text-green-900 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedQuotation.supplier_location}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700">Contact</label>
                      <div className="mt-1 space-y-1">
                        <p className="text-xs text-green-800 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedQuotation.supplier_email}
                        </p>
                        <p className="text-xs text-green-800 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedQuotation.supplier_phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote Details */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Quotation Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <span className="text-gray-500 text-sm">Price per Unit</span>
                    <p className="text-xl font-bold text-green-600">${selectedQuotation.quoted_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <span className="text-gray-500 text-sm">Total Value</span>
                    <p className="text-xl font-bold text-blue-600">${selectedQuotation.total_value.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">MOQ:</span>
                    <p className="font-medium">{selectedQuotation.moq.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Lead Time:</span>
                    <p className="font-medium">{selectedQuotation.lead_time}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedQuotation.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Supplier Notes</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">{selectedQuotation.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowQuotationModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleRejectQuotation(selectedQuotation.id);
                  setShowQuotationModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleApproveQuotation(selectedQuotation.id);
                  setShowQuotationModal(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve & Send to Buyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Details Modal */}
      {showRFQModal && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">🔍 Complete RFQ Analysis</h3>
                <p className="text-sm text-gray-500 mt-1">Full buyer requirements and business details</p>
              </div>
              <button
                onClick={() => setShowRFQModal(false)}
                className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)] bg-gray-50">
              {/* Buyer Information */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  👤 Buyer Information
                </h4>
                <div className="bg-white p-6 rounded-lg border-2 border-blue-300 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-blue-800 mb-2">🏢 Company Name</label>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-lg font-bold text-blue-900">{selectedRFQ.buyer.company}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-800 mb-2">👨‍💼 Contact Person</label>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-lg font-bold text-blue-900">{selectedRFQ.buyer.name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-800 mb-2">🌍 Country</label>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-blue-600" />
                        <p className="text-lg font-bold text-blue-900">{selectedRFQ.buyer.country}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-blue-800 mb-2">📧 Email</label>
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        <p className="text-lg font-bold text-blue-900">buyer@example.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RFQ Details */}
              <div className="mb-8 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
                <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📋 Product Requirements
                </h4>
                <div className="bg-white p-6 rounded-lg border-2 border-green-300 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">📦 Product Title</label>
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-lg font-bold text-green-900">{selectedRFQ.title}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">🏷️ Category</label>
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-lg font-bold text-green-900">{selectedRFQ.category}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">📊 Quantity</label>
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-lg font-bold text-green-900">{selectedRFQ.quantity.toLocaleString()} {selectedRFQ.unit}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-green-800 mb-2">💰 Total Budget</label>
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-lg font-bold text-green-900">${selectedRFQ.budget.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full RFQ Details if available */}
              {selectedRFQ.fullDetails && (
                <>
                  {/* Product Description */}
                  {selectedRFQ.fullDetails.description && (
                    <div className="mb-8 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                      <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        📝 Detailed Product Description
                      </h4>
                      <div className="bg-white p-6 rounded-lg border-2 border-purple-300 shadow-sm">
                        <p className="text-gray-800 leading-relaxed text-lg">{selectedRFQ.fullDetails.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Pricing Information */}
                  <div className="mb-8 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border-2 border-yellow-200 shadow-sm">
                    <h4 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      💵 Pricing Details
                    </h4>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-xl border-2 border-yellow-300 shadow-lg">
                        <label className="block text-sm font-bold text-yellow-800 mb-2">🎯 Target Price</label>
                        <p className="text-4xl font-bold text-yellow-900">${selectedRFQ.fullDetails.target_price}</p>
                        <p className="text-sm text-yellow-600 mt-1 font-medium">per {selectedRFQ.unit.slice(0, -1)}</p>
                      </div>
                      {selectedRFQ.fullDetails.max_price && (
                        <div className="bg-white p-6 rounded-xl border-2 border-orange-300 shadow-lg">
                          <label className="block text-sm font-bold text-orange-800 mb-2">🔺 Maximum Price</label>
                          <p className="text-4xl font-bold text-orange-900">${selectedRFQ.fullDetails.max_price}</p>
                          <p className="text-sm text-orange-600 mt-1 font-medium">per {selectedRFQ.unit.slice(0, -1)}</p>
                        </div>
                      )}
                      <div className="bg-white p-6 rounded-xl border-2 border-green-300 shadow-lg">
                        <label className="block text-sm font-bold text-green-800 mb-2">💰 Total Budget</label>
                        <p className="text-4xl font-bold text-green-900">${selectedRFQ.budget.toLocaleString()}</p>
                        <p className="text-sm text-green-600 mt-1 font-medium">estimated</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Terms */}
                  <div className="mb-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-sm">
                    <h4 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      📋 Requirements & Terms
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      {selectedRFQ.fullDetails.delivery_timeline && (
                        <div>
                          <label className="block text-sm font-bold text-orange-800 mb-2">⏰ Delivery Timeline</label>
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                            <p className="text-lg font-bold text-orange-900">{selectedRFQ.fullDetails.delivery_timeline}</p>
                          </div>
                        </div>
                      )}
                      {selectedRFQ.fullDetails.shipping_terms && (
                        <div>
                          <label className="block text-sm font-bold text-orange-800 mb-2">🚢 Shipping Terms</label>
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                            <p className="text-lg font-bold text-orange-900">{selectedRFQ.fullDetails.shipping_terms}</p>
                          </div>
                        </div>
                      )}
                      {selectedRFQ.fullDetails.quality_standards && (
                        <div>
                          <label className="block text-sm font-bold text-orange-800 mb-2">⭐ Quality Standards</label>
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                            <p className="text-lg font-bold text-orange-900">{selectedRFQ.fullDetails.quality_standards}</p>
                          </div>
                        </div>
                      )}
                      {selectedRFQ.fullDetails.certifications_needed && (
                        <div>
                          <label className="block text-sm font-bold text-orange-800 mb-2">🏆 Required Certifications</label>
                          <div className="bg-white p-4 rounded-lg border-2 border-orange-300">
                            <p className="text-lg font-bold text-orange-900">{selectedRFQ.fullDetails.certifications_needed}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Requirements */}
                  {selectedRFQ.fullDetails.additional_requirements && (
                    <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200 shadow-sm">
                      <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        📝 Additional Requirements
                      </h4>
                      <div className="bg-white p-6 rounded-lg border-2 border-red-300 shadow-sm">
                        <p className="text-gray-800 leading-relaxed text-lg">{selectedRFQ.fullDetails.additional_requirements}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status & Timeline */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  📊 Status & Timeline
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📈 Current Status</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(selectedRFQ.status)}`}>
                        {selectedRFQ.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📅 Created Date</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                      <p className="text-lg font-bold text-gray-900">{new Date(selectedRFQ.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🚨 Urgency Level</label>
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getUrgencyBadge(selectedRFQ.urgency)}`}>
                        {selectedRFQ.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-6 bg-gradient-to-r from-gray-100 to-gray-200 border-t-2 border-gray-300 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-bold">📋 RFQ ID:</span> {selectedRFQ.id} • <span className="font-bold">💰 Budget:</span> ${selectedRFQ.budget.toLocaleString()}
              </div>
              <div className="flex space-x-3">
                {selectedRFQ.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveRFQ(selectedRFQ.id);
                        setShowRFQModal(false);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                    >
                      ✅ Approve RFQ
                    </button>
                    <button
                      onClick={() => {
                        handleRejectRFQ(selectedRFQ.id);
                        setShowRFQModal(false);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                    >
                      ❌ Reject RFQ
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowRFQModal(false)}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold shadow-lg transform hover:scale-105"
                >
                  🔙 Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;