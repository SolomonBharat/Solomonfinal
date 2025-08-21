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
  static createRFQQuestion(question: Omit<RFQQuestion, 'id' | 'created_at'>): RFQQuestion {
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

  static getRFQQuestions(rfqId?: string): RFQQuestion[] {
    const questions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    return rfqId ? questions.filter((q: RFQQuestion) => q.rfq_id === rfqId) : questions;
  }

  static updateRFQQuestion(questionId: string, updates: Partial<RFQQuestion>): void {
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

  static getSharedRFQQuestions(rfqId: string): RFQQuestion[] {
    return this.getRFQQuestions(rfqId).filter(q => q.status === 'shared_with_suppliers');
  }

  static getPendingRFQQuestions(): RFQQuestion[] {
    return this.getRFQQuestions().filter(q => q.status === 'pending_admin_review');
  }
}

export const db = DatabaseService;