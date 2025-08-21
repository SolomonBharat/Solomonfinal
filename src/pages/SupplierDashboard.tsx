import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, DollarSign, User, LogOut, Bell, Eye, Send, MapPin, Star, Award, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCT_CATEGORIES } from '../constants/categories';

interface RFQ {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  target_price: number;
  buyer_company: string;
  buyer_country: string;
  delivery_timeline: string;
  created_at: string;
  status: 'new' | 'quoted' | 'expired';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  match_score?: number;
  max_price?: number;
  shipping_terms?: string;
  quality_standards?: string;
  certifications_needed?: string;
  additional_requirements?: string;
}

const SupplierDashboard = () => {
  const { user, logout } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRfqDetailsModal, setShowRfqDetailsModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    price_per_unit: '',
    moq: '',
    lead_time: '',
    notes: '',
    images: [] as string[]
  });

  useEffect(() => {
    // Get supplier's categories from profile
    const savedUser = localStorage.getItem('solomon_user');
    let supplierCategories = [PRODUCT_CATEGORIES[0]]; // Default to first category
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.product_categories && user.product_categories.length > 0) {
        supplierCategories = user.product_categories;
      }
    }
    
    // Load ONLY APPROVED RFQs from localStorage that match supplier's categories
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const approvedRFQs = userRFQs.filter((rfq: any) => {
      // CRITICAL: Only show RFQs that are APPROVED by admin AND match supplier category
      return rfq.status === 'approved' && supplierCategories.includes(rfq.category);
    }).map((rfq: any) => ({
      ...rfq,
      target_price: parseFloat(rfq.target_price) || 0,
      buyer_company: rfq.buyer_company || 'Buyer Company',
      buyer_country: rfq.buyer_country || 'Country',
      delivery_timeline: rfq.delivery_timeline || '30 days',
      status: 'new' as const,
      urgency: 'medium' as const,
      match_score: 90
    }));
    
    setRfqs(approvedRFQs);
  }, []);

  const [stats] = useState({
    total_rfqs: 12,
    new_rfqs: 3,
    quotes_sent: 8,
    monthly_revenue: 28000
  });

  const handleQuoteSubmit = (rfqId: string) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (rfq) {
      setSelectedRfq(rfq);
      setQuoteForm({
        price_per_unit: '',
        moq: rfq.quantity.toString(),
        lead_time: '',
        notes: ''
      });
      setShowQuoteModal(true);
    }
  };

  const handleViewRfqDetails = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setShowRfqDetailsModal(true);
  };
  
  const submitQuote = () => {
    if (selectedRfq) {
      // Validate required fields
      if (!quoteForm.price_per_unit || !quoteForm.lead_time || !quoteForm.payment_terms || !quoteForm.shipping_terms || !quoteForm.validity_days) {
        alert('Please fill in all required fields (Price, Lead Time, Payment Terms, Shipping Terms, and Quote Validity)');
        return;
      }
      
      // Update RFQ status to quoted
      setRfqs(prev => prev.map(rfq => 
        rfq.id === selectedRfq.id 
          ? { ...rfq, status: 'quoted' as const }
          : rfq
      ));
      
      // Store quotation in localStorage for demo
      const quotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
      
      // Get current supplier info
      const currentUser = JSON.parse(localStorage.getItem('solomon_user') || '{}');
      
      const newQuotation = {
        id: `q-${Date.now()}`,
        rfq_id: selectedRfq.id,
        rfq_title: selectedRfq.title,
        supplier_id: currentUser.id,
        supplier_name: currentUser.name || 'Supplier User',
        supplier_company: currentUser.company || 'Supplier Company',
        supplier_location: `${currentUser.address?.split(',')[0] || 'City'}, India`,
        supplier_email: currentUser.email,
        supplier_phone: currentUser.phone || '+91 XXXXXXXXXX',
        buyer_company: selectedRfq.buyer_company,
        buyer_country: selectedRfq.buyer_country,
        quoted_price: parseFloat(quoteForm.price_per_unit),
        moq: parseInt(quoteForm.moq) || selectedRfq.quantity,
        lead_time: quoteForm.lead_time,
        payment_terms: quoteForm.payment_terms,
        shipping_terms: quoteForm.shipping_terms,
        validity_days: parseInt(quoteForm.validity_days),
        quality_guarantee: quoteForm.quality_guarantee,
        sample_available: quoteForm.sample_available,
        status: 'pending_review',
        submitted_at: new Date().toISOString().split('T')[0],
        notes: quoteForm.notes,
        total_value: parseFloat(quoteForm.price_per_unit) * (parseInt(quoteForm.moq) || selectedRfq.quantity),
        images: quoteForm.images
      };
      quotations.push(newQuotation);
      localStorage.setItem('supplier_quotations', JSON.stringify(quotations));
      
      setShowQuoteModal(false);
      setSelectedRfq(null);
      setQuoteForm({
        price_per_unit: '',
        moq: '',
        lead_time: '',
        payment_terms: '',
        shipping_terms: '',
        validity_days: '',
        quality_guarantee: true,
        sample_available: true,
        notes: '',
        images: []
      });
      alert('Quote submitted successfully! It will be reviewed by admin before being sent to the buyer.');
    }
  };

  const handleQuoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setQuoteForm(prev => ({
                ...prev,
                images: [...prev.images, ...newImages]
              }));
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeQuoteImage = (index: number) => {
    setQuoteForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: 'bg-blue-100 text-blue-800',
      quoted: 'bg-green-100 text-green-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges];
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[urgency as keyof typeof badges];
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
              <span className="text-gray-600">Supplier Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.name || 'Supplier User'}</span>
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
            Welcome, {user?.name || 'Supplier'}
          </h1>
          <p className="text-gray-600">
            Manage your quotations and connect with global buyers
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_rfqs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New RFQs</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new_rfqs}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quotes Sent</p>
                <p className="text-2xl font-bold text-green-600">{stats.quotes_sent}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${stats.monthly_revenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Available RFQs - Card Layout */}
        <div className="mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin-Approved RFQs for Your Category</h2>
            <p className="text-gray-600">
              Verified opportunities in {JSON.parse(localStorage.getItem('solomon_user') || '{}').product_categories?.[0] || PRODUCT_CATEGORIES[0]} 
              <span className="text-blue-600 font-medium"> (Admin Approved Only)</span>
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {rfqs.length === 0 && (
              <div className="lg:col-span-2 xl:col-span-3 text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved RFQs Available</h3>
                <p className="text-gray-600 mb-4">
                  There are currently no admin-approved RFQs in your category: <strong>{JSON.parse(localStorage.getItem('solomon_user') || '{}').product_categories?.[0] || PRODUCT_CATEGORIES[0]}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-800">
                    <strong>📋 How it works:</strong><br/>
                    1. Buyers submit RFQs<br/>
                    2. Admin reviews & approves<br/>
                    3. Approved RFQs appear here<br/>
                    4. You can submit quotations
                  </p>
                </div>
              </div>
            )}
            {rfqs.map((rfq) => (
              <div key={rfq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Match Score Badge */}
                <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium text-sm">
                      {rfq.match_score}% Match
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getUrgencyBadge(rfq.urgency)}`}>
                      {rfq.urgency} priority
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {rfq.title}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Buyer from {rfq.buyer_country}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>

                  {/* Product Images */}
                  {rfq.images && rfq.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">📸 Product Images:</p>
                      <div className="flex space-x-2 overflow-x-auto">
                        {rfq.images.slice(0, 3).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                          />
                        ))}
                        {rfq.images.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-gray-600">+{rfq.images.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Details */}
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
                      <span className="text-gray-500 text-sm">Timeline:</span>
                      <p className="font-medium text-sm">{rfq.delivery_timeline}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Total Value:</span>
                      <p className="font-medium text-sm text-green-600">${(rfq.target_price * rfq.quantity).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Payment & Terms Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="text-sm font-semibold text-blue-900 mb-2">💼 Buyer Requirements</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-blue-700 font-medium">Shipping Terms:</span>
                        <p className="text-blue-800">{rfq.shipping_terms || 'FOB'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Quality Standards:</span>
                        <p className="text-blue-800">{rfq.quality_standards || 'Standard Quality'}</p>
                      </div>
                      {rfq.certifications_needed && (
                        <div className="col-span-2">
                          <span className="text-blue-700 font-medium">Required Certifications:</span>
                          <p className="text-blue-800">{rfq.certifications_needed}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">{rfq.description}</p>
                    {rfq.additional_requirements && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>Special Requirements:</strong> {rfq.additional_requirements.substring(0, 100)}...
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    {rfq.status === 'new' && (
                      <button
                        onClick={() => handleQuoteSubmit(rfq.id)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-1"
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit Quote</span>
                      </button>
                    )}
                    {rfq.status === 'quoted' && (
                      <div className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-md text-sm font-medium text-center">
                        Quote Submitted
                      </div>
                    )}
                    <button 
                      onClick={() => handleViewRfqDetails(rfq)}
                      className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            to="/supplier/quotations"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">My Quotations</h3>
                <p className="text-sm text-gray-600">View all submitted quotes</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/supplier/profile"
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Company Profile</h3>
                <p className="text-sm text-gray-600">Update your business details</p>
              </div>
            </div>
          </Link>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Need Support?</h3>
                <p className="text-sm text-gray-600">Contact our team for help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Quote Modal */}
      {showQuoteModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submit Quote</h3>
              <p className="text-sm text-gray-600">{selectedRfq.title}</p>
            </div>
            
            <div className="p-6">
              {/* RFQ Summary */}
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buyer Location:</span>
                    <p className="font-medium">Buyer from {selectedRfq.buyer_country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <p className="font-medium">{selectedRfq.quantity.toLocaleString()} {selectedRfq.unit}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Target Price:</span>
                    <p className="font-medium">${selectedRfq.target_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <p className="font-medium">{selectedRfq.delivery_timeline}</p>
                  </div>
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Unit (USD) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={quoteForm.price_per_unit}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, price_per_unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="8.50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Buyer's target: ${selectedRfq.target_price.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MOQ
                    </label>
                    <input
                      type="number"
                      value={quoteForm.moq}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, moq: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Time *
                    </label>
                    <select
                      value={quoteForm.lead_time}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, lead_time: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Lead Time</option>
                      <option value="15-20 days">15-20 days</option>
                      <option value="20-25 days">20-25 days</option>
                      <option value="25-30 days">25-30 days</option>
                      <option value="30-35 days">30-35 days</option>
                      <option value="35-40 days">35-40 days</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Buyer needs: {selectedRfq.delivery_timeline}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Terms *
                    </label>
                    <select
                      value={quoteForm.payment_terms}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, payment_terms: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Payment Terms</option>
                      <option value="30% advance, 70% on shipment">30% advance, 70% on shipment</option>
                      <option value="40% advance, 60% on shipment">40% advance, 60% on shipment</option>
                      <option value="50% advance, 50% on shipment">50% advance, 50% on shipment</option>
                      <option value="25% advance, 75% against documents">25% advance, 75% against documents</option>
                      <option value="100% advance">100% advance</option>
                      <option value="LC at sight">LC at sight</option>
                      <option value="LC 30 days">LC 30 days</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Terms (Incoterms) *
                    </label>
                    <select
                      value={quoteForm.shipping_terms}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, shipping_terms: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Incoterms</option>
                      <option value="FOB">FOB (Free on Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="FCA">FCA (Free Carrier)</option>
                      <option value="CPT">CPT (Carriage Paid To)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Buyer prefers: {selectedRfq.shipping_terms || 'FOB'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quote Validity (Days) *
                    </label>
                    <select
                      value={quoteForm.validity_days}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, validity_days: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Validity</option>
                      <option value="7">7 days</option>
                      <option value="15">15 days</option>
                      <option value="30">30 days</option>
                      <option value="45">45 days</option>
                    </select>
                  </div>
                </div>

                {/* Quality & Services */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="quality_guarantee"
                      checked={quoteForm.quality_guarantee}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, quality_guarantee: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="quality_guarantee" className="text-sm text-gray-700">
                      Quality guarantee provided
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sample_available"
                      checked={quoteForm.sample_available}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, sample_available: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sample_available" className="text-sm text-gray-700">
                      Samples available for approval
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes & Negotiation Terms
                  </label>
                  <textarea
                    rows={3}
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Bulk discounts, special certifications, negotiable terms, or any other value-added services..."
                  />
                </div>

                {/* Total Calculation */}
                {quoteForm.price_per_unit && quoteForm.moq && (
                  <div className="bg-green-50 p-4 rounded-md border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-800 font-bold text-lg">
                          Total Quote Value: ${(parseFloat(quoteForm.price_per_unit) * parseInt(quoteForm.moq)).toLocaleString()}
                        </p>
                        <p className="text-green-600 text-sm">
                          {parseInt(quoteForm.moq).toLocaleString()} units × ${parseFloat(quoteForm.price_per_unit).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-sm">
                          vs Buyer Budget: ${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}
                        </p>
                        <p className={`text-sm font-medium ${
                          (parseFloat(quoteForm.price_per_unit) * parseInt(quoteForm.moq)) <= (selectedRfq.target_price * selectedRfq.quantity)
                            ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {(parseFloat(quoteForm.price_per_unit) * parseInt(quoteForm.moq)) <= (selectedRfq.target_price * selectedRfq.quantity)
                            ? '✅ Within Budget' : '⚠️ Above Budget'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitQuote}
                disabled={!quoteForm.price_per_unit || !quoteForm.lead_time || !quoteForm.payment_terms || !quoteForm.shipping_terms || !quoteForm.validity_days}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RFQ Details Modal */}
      {showRfqDetailsModal && selectedRfq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">RFQ Details</h3>
              <button
                onClick={() => setShowRfqDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Buyer Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Buyer</label>
                      <p className="mt-1 text-sm text-blue-900 font-medium">{selectedRfq.buyer_name || 'International Buyer'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700">Country</label>
                      <p className="mt-1 text-sm text-blue-900">{selectedRfq.buyer_country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Requirements</h4>
                <div className="grid md:grid-cols-2 gap-6">
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
                    <label className="block text-sm font-medium text-gray-700">Match Score</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      {selectedRfq.match_score}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-green-700">Target Price</label>
                    <p className="mt-1 text-xl font-bold text-green-900">${selectedRfq.target_price.toFixed(2)}</p>
                    <p className="text-sm text-green-600">per {selectedRfq.unit.slice(0, -1)}</p>
                  </div>
                  {selectedRfq.max_price && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-orange-700">Maximum Price</label>
                      <p className="mt-1 text-xl font-bold text-orange-900">${selectedRfq.max_price.toFixed(2)}</p>
                      <p className="text-sm text-orange-600">per {selectedRfq.unit.slice(0, -1)}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Total Budget</label>
                    <p className="mt-1 text-xl font-bold text-blue-900">${(selectedRfq.target_price * selectedRfq.quantity).toLocaleString()}</p>
                    <p className="text-sm text-blue-600">estimated</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRfq.description}</p>
                </div>
              </div>

              {/* Requirements & Terms */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Terms</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delivery Timeline</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRfq.delivery_timeline}</p>
                  </div>
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Posted Date</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedRfq.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(selectedRfq.urgency)} mt-1`}>
                      {selectedRfq.urgency} priority
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowRfqDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              {selectedRfq.status === 'new' && (
                <button
                  onClick={() => {
                    setShowRfqDetailsModal(false);
                    handleQuoteSubmit(selectedRfq.id);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Quote</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;