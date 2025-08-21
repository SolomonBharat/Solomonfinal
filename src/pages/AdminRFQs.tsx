import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, CheckCircle, X, Eye, Users } from 'lucide-react';
import { MessageCircle, Send } from 'lucide-react';
import { db } from '../lib/database';

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

const AdminRFQs = () => {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRfqForQuestions, setSelectedRfqForQuestions] = useState<RFQ | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [rfqQuestions, setRfqQuestions] = useState<RFQQuestion[]>([]);
  const [buyerAnswerForm, setBuyerAnswerForm] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Load all RFQs including user submitted ones
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    
    // Convert user RFQs to admin format
    const convertedUserRFQs = userRFQs.map((rfq: any) => ({
      id: rfq.id,
      title: rfq.title,
      buyer: {
        name: rfq.buyer_name || 'User',
        company: rfq.buyer_company || 'Company',
        country: rfq.buyer_country || 'Country'
      },
      category: rfq.category,
      quantity: parseInt(rfq.quantity),
      unit: rfq.unit,
      budget: parseFloat(rfq.target_price) * parseInt(rfq.quantity),
      status: rfq.status || 'pending_approval',
      created_at: rfq.created_at,
      urgency: 'medium',
      matched_suppliers: 0
    }));
    
    setRfqs(convertedUserRFQs);
    setLoading(false);
  }, []);

  const [originalRFQs] = useState<RFQ[]>([
    {
      id: '1',
      title: 'Organic Cotton T-Shirts',
      buyer: {
        name: 'John Smith',
        company: 'Global Trade Corp',
        country: 'United States'
      },
      category: 'Textiles & Apparel',
      quantity: 5000,
      unit: 'pieces',
      budget: 42500,
      status: 'pending_approval',
      created_at: '2025-01-20',
      urgency: 'medium',
      matched_suppliers: 0
    },
    {
      id: '2',
      title: 'Turmeric Powder (Curcumin 5%)',
      buyer: {
        name: 'Sarah Johnson',
        company: 'Health Foods Ltd',
        country: 'United Kingdom'
      },
      category: 'Spices & Food Products',
      quantity: 10,
      unit: 'tons',
      budget: 28000,
      status: 'matched',
      created_at: '2025-01-18',
      urgency: 'high',
      matched_suppliers: 4
    },
    {
      id: '3',
      title: 'Handwoven Carpets 4x6 ft',
      buyer: {
        name: 'Michael Brown',
        company: 'Home Decor Inc',
        country: 'Canada'
      },
      category: 'Handicrafts & Home Decor',
      quantity: 200,
      unit: 'pieces',
      budget: 15000,
      status: 'quoted',
      created_at: '2025-01-19',
      urgency: 'low',
      matched_suppliers: 2
    },
    {
      id: '4',
      title: 'Basmati Rice Premium Grade',
      buyer: {
        name: 'Ahmed Al-Rashid',
        company: 'Middle East Foods',
        country: 'UAE'
      },
      category: 'Agricultural Products',
      quantity: 50,
      unit: 'tons',
      budget: 75000,
      status: 'approved',
      created_at: '2025-01-17',
      urgency: 'medium',
      matched_suppliers: 0
    }
  ]);

  const [selectedRFQs, setSelectedRFQs] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRFQSelect = (rfqId: string) => {
    setSelectedRFQs(prev => 
      prev.includes(rfqId) 
        ? prev.filter(id => id !== rfqId)
        : [...prev, rfqId]
    );
  };

  const handleApprove = (rfqId: string) => {
    setRFQs(prev => prev.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'approved' as const } : rfq
    ));
    
    // Update localStorage for user RFQs
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'approved' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
  };

  const handleReject = (rfqId: string) => {
    setRFQs(prev => prev.map(rfq => 
      rfq.id === rfqId ? { ...rfq, status: 'rejected' as const } : rfq
    ));
    
    // Update localStorage for user RFQs
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'rejected' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
  };

  const handleAssignSuppliers = (rfqId: string) => {
    setRFQs(prev => prev.map(rfq => 
      rfq.id === rfqId 
        ? { ...rfq, status: 'matched' as const, matched_suppliers: 3 } 
        : rfq
    ));
    
    // Update localStorage for user RFQs
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedUserRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'matched' } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedUserRFQs));
  };

  const handleViewQuestions = (rfq: RFQ) => {
    setSelectedRfqForQuestions(rfq);
    const questions = db.getRFQQuestions(rfq.id);
    setRfqQuestions(questions);
    setShowQuestionsModal(true);
  };

  const handleAnswerQuestion = (questionId: string, answer: string) => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    db.updateRFQQuestion(questionId, {
      buyer_answer: answer.trim(),
      status: 'answered_by_buyer',
      answered_at: new Date().toISOString()
    });

    // Refresh questions
    if (selectedRfqForQuestions) {
      const updatedQuestions = db.getRFQQuestions(selectedRfqForQuestions.id);
      setRfqQuestions(updatedQuestions);
    }

    // Clear the answer form
    setBuyerAnswerForm(prev => ({
      ...prev,
      [questionId]: ''
    }));

    alert('Answer saved! You can now share it with suppliers.');
  };

  const handleShareAnswer = (questionId: string) => {
    db.updateRFQQuestion(questionId, {
      status: 'shared_with_suppliers',
      shared_at: new Date().toISOString()
    });

    // Refresh questions
    if (selectedRfqForQuestions) {
      const updatedQuestions = db.getRFQQuestions(selectedRfqForQuestions.id);
      setRfqQuestions(updatedQuestions);
    }

    alert('Answer shared with all suppliers! They can now see this Q&A in the RFQ details.');
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

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return badges[urgency as keyof typeof badges];
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesStatus = filterStatus === 'all' || rfq.status === filterStatus;
    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.buyer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rfq.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Manage RFQs</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage RFQs</h1>
            <p className="text-gray-600">
              Review, approve, and assign RFQs to appropriate suppliers
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search RFQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="matched">Matched</option>
                  <option value="quoted">Quoted</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredRFQs.length} RFQ{filteredRFQs.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* RFQs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFQ Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRFQs.map((rfq) => (
                    <tr key={rfq.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRFQs.includes(rfq.id)}
                          onChange={() => handleRFQSelect(rfq.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                          <p className="text-xs text-gray-500">{rfq.category}</p>
                          <p className="text-xs text-gray-400">{rfq.created_at}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rfq.buyer.name}</p>
                          <p className="text-xs text-gray-500">{rfq.buyer.company}</p>
                          <p className="text-xs text-gray-400">{rfq.buyer.country}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {rfq.quantity.toLocaleString()} {rfq.unit}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${rfq.budget.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                          {rfq.status.replace('_', ' ')}
                        </span>
                        {rfq.matched_suppliers > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {rfq.matched_suppliers} suppliers matched
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyBadge(rfq.urgency)}`}>
                          {rfq.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {rfq.status === 'pending_approval' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApprove(rfq.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(rfq.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {rfq.status === 'approved' && (
                            <button
                              onClick={() => handleAssignSuppliers(rfq.id)}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Users className="h-3 w-3" />
                              <span>Assign Suppliers</span>
                            </button>
                          )}
                          {rfq.status === 'matched' && (
                            <div className="text-sm text-purple-600">
                              Suppliers assigned
                            </div>
                          )}
                          {rfq.status === 'quoted' && (
                            <div className="text-sm text-green-600">
                              Quotations received
                            </div>
                          )}
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-sm">
                            <Eye className="h-3 w-3" />
                            <span>View Details</span>
                          </button>
                          <button 
                            onClick={() => handleViewQuestions(rfq)}
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 text-sm"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>Q&A ({db.getRFQQuestionsByRFQId(rfq.id).length})</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRFQs.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-800">
                  {selectedRFQs.length} RFQ{selectedRFQs.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Bulk Approve
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                    Bulk Reject
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid md:grid-cols-4 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800">Pending Approval</h4>
              <p className="text-2xl font-bold text-yellow-900">
                {rfqs.filter(rfq => rfq.status === 'pending_approval').length}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800">Approved</h4>
              <p className="text-2xl font-bold text-blue-900">
                {rfqs.filter(rfq => rfq.status === 'approved').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800">Matched</h4>
              <p className="text-2xl font-bold text-purple-900">
                {rfqs.filter(rfq => rfq.status === 'matched').length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800">Quoted</h4>
              <p className="text-2xl font-bold text-green-900">
                {rfqs.filter(rfq => rfq.status === 'quoted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Questions Management Modal */}
      {showQuestionsModal && selectedRfqForQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">RFQ Questions & Answers</h3>
                <p className="text-sm text-gray-600">{selectedRfqForQuestions.title}</p>
              </div>
              <button
                onClick={() => setShowQuestionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {rfqQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h4>
                  <p className="text-gray-600">Suppliers haven't asked any questions about this RFQ</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {rfqQuestions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      {/* Question */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Question from {question.supplier_company}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(question.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <strong>Q:</strong> {question.question}
                          </p>
                        </div>
                      </div>

                      {/* Answer Section */}
                      {question.status === 'pending_admin_review' && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                          <h5 className="font-medium text-yellow-900 mb-2">Provide Buyer's Answer</h5>
                          <textarea
                            rows={3}
                            value={buyerAnswerForm[question.id] || ''}
                            onChange={(e) => setBuyerAnswerForm(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            placeholder="Enter the buyer's response to this question..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                          />
                          <button
                            onClick={() => handleAnswerQuestion(question.id, buyerAnswerForm[question.id] || '')}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          >
                            Save Buyer's Answer
                          </button>
                        </div>
                      )}

                      {question.status === 'answered_by_buyer' && (
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-sm text-green-900">
                              <strong>Buyer's Answer:</strong> {question.buyer_answer}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Answered on {question.answered_at ? new Date(question.answered_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleShareAnswer(question.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Share Answer with All Suppliers</span>
                          </button>
                        </div>
                      )}

                      {question.status === 'shared_with_suppliers' && (
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="text-sm text-green-900">
                              <strong>Buyer's Answer:</strong> {question.buyer_answer}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded border border-purple-200">
                            <p className="text-xs text-purple-800 font-medium">
                              ✅ Shared with all suppliers on {question.shared_at ? new Date(question.shared_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRFQs;