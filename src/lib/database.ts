export interface RFQQuestion {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_company: string;
  question: string;
  buyer_answer?: string;
  status: 'pending_admin_review' | 'answered_by_buyer' | 'shared_with_suppliers';
  created_at: string;
  answered_at?: string;
  shared_at?: string;
}

export class DatabaseService {
  // RFQ Questions Management
  createRFQQuestion(question: Omit<RFQQuestion, 'id' | 'created_at' | 'status'>): RFQQuestion {
    const newQuestion: RFQQuestion = {
      ...question,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      status: 'pending_admin_review'
    };

    const existingQuestions = this.getRFQQuestions();
    const updatedQuestions = [...existingQuestions, newQuestion];
    localStorage.setItem('rfq_questions', JSON.stringify(updatedQuestions));
    
    return newQuestion;
  }

  getRFQQuestions(rfqId?: string): RFQQuestion[] {
    const questions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    return rfqId ? questions.filter((q: RFQQuestion) => q.rfq_id === rfqId) : questions;
  }

  updateRFQQuestion(questionId: string, updates: Partial<RFQQuestion>): void {
    const questions = this.getRFQQuestions();
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    localStorage.setItem('rfq_questions', JSON.stringify(updatedQuestions));
  }

  static answerRFQQuestion(questionId: string, buyerAnswer: string): void {
    this.updateRFQQuestion(questionId, {
      buyer_answer: buyerAnswer,
      status: 'answered_by_buyer',
      answered_at: new Date().toISOString()
    });
  }

  static shareRFQAnswer(questionId: string): void {
    this.updateRFQQuestion(questionId, {
      status: 'shared_with_suppliers',
      shared_at: new Date().toISOString()
    });
  }

  getSharedRFQQuestions(rfqId: string): RFQQuestion[] {
    return this.getRFQQuestions(rfqId).filter(q => q.status === 'shared_with_suppliers');
  }

  getPendingRFQQuestions(): RFQQuestion[] {
    return this.getRFQQuestions().filter(q => q.status === 'pending_admin_review');
  }

  // Mock data methods for analytics
  getAnalytics() {
    return {
      totalUsers: 1247,
      totalBuyers: 892,
      totalSuppliers: 355,
      totalRFQs: 2156,
      totalQuotations: 8924,
      totalOrders: 1847,
      totalRevenue: 12450000,
      avgOrderValue: 6742,
      conversionRate: 0.21,
      topCategories: [
        { name: 'Electronics', count: 456 },
        { name: 'Machinery', count: 342 },
        { name: 'Raw Materials', count: 289 },
        { name: 'Textiles', count: 234 },
        { name: 'Chemicals', count: 198 }
      ]
    };
  }

  getRFQs() {
    return JSON.parse(localStorage.getItem('user_rfqs') || '[]');
  }

  getOrders() {
    return [
      { id: '1', created_at: '2025-01-15', order_value: 41250, status: 'completed', buyer_id: 'buyer-1', supplier_id: 'supplier-1' },
      { id: '2', created_at: '2025-01-14', order_value: 28900, status: 'processing', buyer_id: 'buyer-2', supplier_id: 'supplier-2' },
      { id: '3', created_at: '2025-01-13', order_value: 15600, status: 'shipped', buyer_id: 'buyer-3', supplier_id: 'supplier-3' },
      { id: '4', created_at: '2025-01-12', order_value: 67800, status: 'completed', buyer_id: 'buyer-4', supplier_id: 'supplier-4' },
      { id: '5', created_at: '2025-01-11', order_value: 33400, status: 'cancelled', buyer_id: 'buyer-5', supplier_id: 'supplier-5' }
    ];
  }

  getQuotations() {
    return JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
  }

  getRFQById(rfqId: string) {
    const rfqs = this.getRFQs();
    return rfqs.find((rfq: any) => rfq.id === rfqId);
  }
}

export const db = DatabaseService;