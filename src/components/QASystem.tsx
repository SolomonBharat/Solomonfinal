import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle, Clock, User, Building, Eye, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: string;
  rfq_id: string;
  rfq_title: string;
  supplier_id: string;
  supplier_name: string;
  supplier_company: string;
  question: string;
  status: 'pending_admin' | 'approved_by_admin' | 'sent_to_buyer' | 'answered_by_buyer' | 'published';
  created_at: string;
  admin_approved_at?: string;
  buyer_answer?: string;
  buyer_answered_at?: string;
  published_at?: string;
  visible_to_all: boolean;
}

interface QASystemProps {
  rfqId?: string;
  mode: 'supplier_ask' | 'admin_review' | 'buyer_answer' | 'public_view';
  onQuestionSubmit?: (question: string) => void;
}

const QASystem: React.FC<QASystemProps> = ({ rfqId, mode, onQuestionSubmit }) => {
  const { user, userType } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [buyerAnswer, setBuyerAnswer] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [rfqId, mode]);

  const loadQuestions = () => {
    const allQuestions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    
    let filteredQuestions = allQuestions;
    
    if (mode === 'supplier_ask' && rfqId) {
      filteredQuestions = allQuestions.filter((q: Question) => q.rfq_id === rfqId);
    } else if (mode === 'admin_review') {
      filteredQuestions = allQuestions.filter((q: Question) => 
        q.status === 'pending_admin' || q.status === 'approved_by_admin'
      );
    } else if (mode === 'buyer_answer') {
      filteredQuestions = allQuestions.filter((q: Question) => 
        q.status === 'sent_to_buyer' && q.rfq_id === rfqId
      );
    } else if (mode === 'public_view' && rfqId) {
      filteredQuestions = allQuestions.filter((q: Question) => 
        q.rfq_id === rfqId && q.status === 'published'
      );
    } else if (mode === 'supplier_ask' && rfqId) {
      // Suppliers can only see their own questions and published Q&As
      filteredQuestions = allQuestions.filter((q: Question) => 
        q.rfq_id === rfqId && (
          (q.supplier_id === user?.id || q.supplier_name === user?.name) ||
          q.status === 'published'
        )
      );
    }
    
    setQuestions(filteredQuestions);
  };

  const submitQuestion = () => {
    if (!newQuestion.trim() || !rfqId) return;

    const question: Question = {
      id: `q_${Date.now()}`,
      rfq_id: rfqId,
      rfq_title: 'Product RFQ', // Would be loaded from RFQ data
      supplier_id: user?.id || '',
      supplier_name: user?.name || '',
      supplier_company: user?.company || '',
      question: newQuestion.trim(),
      status: 'pending_admin',
      created_at: new Date().toISOString(),
      visible_to_all: false
    };

    const allQuestions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    allQuestions.push(question);
    localStorage.setItem('rfq_questions', JSON.stringify(allQuestions));

    setNewQuestion('');
    loadQuestions();
    
    if (onQuestionSubmit) {
      onQuestionSubmit(newQuestion);
    }

    alert('Question submitted! It will be reviewed by admin before being sent to the buyer.');
  };

  const approveQuestion = (questionId: string) => {
    const allQuestions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    const updatedQuestions = allQuestions.map((q: Question) =>
      q.id === questionId 
        ? { ...q, status: 'sent_to_buyer', admin_approved_at: new Date().toISOString() }
        : q
    );
    localStorage.setItem('rfq_questions', JSON.stringify(updatedQuestions));
    loadQuestions();
    alert('✅ Question approved and sent to buyer for response!');
  };

  const answerQuestion = (questionId: string) => {
    if (!buyerAnswer.trim()) return;

    const allQuestions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    const updatedQuestions = allQuestions.map((q: Question) =>
      q.id === questionId 
        ? { 
            ...q, 
            status: 'published',
            buyer_answer: buyerAnswer.trim(),
            buyer_answered_at: new Date().toISOString(),
            published_at: new Date().toISOString(),
            visible_to_all: true
          }
        : q
    );
    localStorage.setItem('rfq_questions', JSON.stringify(updatedQuestions));
    
    setBuyerAnswer('');
    setSelectedQuestion(null);
    setShowQuestionModal(false);
    loadQuestions();
    alert('Answer published! All suppliers can now see this Q&A.');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending_admin: 'bg-yellow-100 text-yellow-800',
      approved_by_admin: 'bg-blue-100 text-blue-800',
      sent_to_buyer: 'bg-purple-100 text-purple-800',
      answered_by_buyer: 'bg-green-100 text-green-800',
      published: 'bg-green-100 text-green-800'
    };
    return badges[status as keyof typeof badges] || badges.pending_admin;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_admin': return <Clock className="h-4 w-4" />;
      case 'approved_by_admin': return <CheckCircle className="h-4 w-4" />;
      case 'sent_to_buyer': return <MessageCircle className="h-4 w-4" />;
      case 'answered_by_buyer': return <CheckCircle className="h-4 w-4" />;
      case 'published': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Ask Question (Supplier Mode) */}
      {mode === 'supplier_ask' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
            Ask a Question
          </h3>
          <div className="space-y-4">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask any question about this RFQ requirements, specifications, or terms..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={submitQuestion}
              disabled={!newQuestion.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Submit Question</span>
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{question.supplier_company}</span>
                  <span className="text-sm text-gray-500">• {question.supplier_name}</span>
                </div>
                <p className="text-gray-700">{question.question}</p>
              </div>
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(question.status)}`}>
                {getStatusIcon(question.status)}
                <span>{question.status.replace('_', ' ')}</span>
              </span>
            </div>

            {/* Buyer Answer */}
            {question.buyer_answer && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Buyer's Answer:</span>
                </div>
                <p className="text-blue-800">{question.buyer_answer}</p>
                <p className="text-xs text-blue-600 mt-2">
                  Answered on {new Date(question.buyer_answered_at!).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Actions based on mode */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Asked on {new Date(question.created_at).toLocaleDateString()}
              </p>
              
              <div className="flex space-x-2">
                {mode === 'admin_review' && question.status === 'pending_admin' && (
                  <button
                    onClick={() => approveQuestion(question.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Approve & Send to Buyer
                  </button>
                )}
                
                {mode === 'buyer_answer' && question.status === 'sent_to_buyer' && (
                  <button
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowQuestionModal(true);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Answer Question
                  </button>
                )}
                
                <button className="text-gray-600 hover:text-gray-800 text-sm">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Answer Modal */}
      {showQuestionModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Answer Question</h3>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Question from {selectedQuestion.supplier_company}:</p>
                <p className="text-gray-900">{selectedQuestion.question}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer (will be visible to all suppliers)
                </label>
                <textarea
                  value={buyerAnswer}
                  onChange={(e) => setBuyerAnswer(e.target.value)}
                  placeholder="Provide a detailed answer that will help all suppliers understand your requirements better..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => answerQuestion(selectedQuestion.id)}
                disabled={!buyerAnswer.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Publish Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {mode === 'supplier_ask' && 'No questions asked yet'}
            {mode === 'admin_review' && 'No questions pending review'}
            {mode === 'buyer_answer' && 'No questions to answer'}
            {mode === 'public_view' && 'No Q&A available yet'}
          </h3>
          <p className="text-gray-600">
            {mode === 'supplier_ask' && 'Ask questions to clarify requirements before submitting your quote.'}
            {mode === 'admin_review' && 'All supplier questions have been processed.'}
            {mode === 'buyer_answer' && 'No questions from suppliers at the moment.'}
            {mode === 'public_view' && 'Questions and answers will appear here once available.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QASystem;