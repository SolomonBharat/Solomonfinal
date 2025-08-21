import { api } from './api';
import { supabase } from './supabase';
import type { RFQ, Quotation, Order, SampleRequest, SampleQuote } from './supabase';

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
  // RFQ Management
  async createRFQ(rfqData: Omit<RFQ, 'id' | 'created_at' | 'updated_at'>): Promise<RFQ | null> {
    const result = await api.createRFQ(rfqData);
    return result.success ? result.data || null : null;
  }

  async getRFQs(filters?: { status?: string; buyer_id?: string; category?: string }): Promise<RFQ[]> {
    return await api.getRFQs(filters);
  }

  async updateRFQ(id: string, updates: Partial<RFQ>): Promise<boolean> {
    const result = await api.updateRFQ(id, updates);
    return result.success;
  }

  // Quotation Management
  async createQuotation(quotationData: Omit<Quotation, 'id' | 'created_at' | 'updated_at'>): Promise<Quotation | null> {
    const result = await api.createQuotation(quotationData);
    return result.success ? result.data || null : null;
  }

  async getQuotations(filters?: { rfq_id?: string; supplier_id?: string; status?: string }): Promise<Quotation[]> {
    return await api.getQuotations(filters);
  }

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<boolean> {
    const result = await api.updateQuotation(id, updates);
    return result.success;
  }

  // Order Management
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> {
    const result = await api.createOrder(orderData);
    return result.success ? result.data || null : null;
  }

  async getOrders(filters?: { buyer_id?: string; supplier_id?: string; status?: string }): Promise<Order[]> {
    return await api.getOrders(filters);
  }

  // Sample Request Management
  async createSampleRequest(requestData: Omit<SampleRequest, 'id' | 'created_at'>): Promise<SampleRequest | null> {
    const result = await api.createSampleRequest(requestData);
    return result.success ? result.data || null : null;
  }

  async getSampleRequests(filters?: { buyer_id?: string; status?: string }): Promise<SampleRequest[]> {
    return await api.getSampleRequests(filters);
  }

  async updateSampleRequest(id: string, updates: Partial<SampleRequest>): Promise<boolean> {
    const result = await api.updateSampleRequest(id, updates);
    return result.success;
  }

  // Sample Quote Management
  async createSampleQuote(quoteData: Omit<SampleQuote, 'id' | 'created_at' | 'total_cost'>): Promise<SampleQuote | null> {
    const result = await api.createSampleQuote(quoteData);
    return result.success ? result.data || null : null;
  }

  async getSampleQuotes(filters?: { supplier_id?: string; sample_request_id?: string }): Promise<SampleQuote[]> {
    return await api.getSampleQuotes(filters);
  }

  // RFQ Questions Management
  async createRFQQuestion(question: Omit<RFQQuestion, 'id' | 'created_at' | 'status'>): Promise<RFQQuestion> {
    // For now, keep using localStorage for RFQ questions
    // In a future migration, these can be moved to Supabase
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

  async getRFQQuestions(rfqId?: string): Promise<RFQQuestion[]> {
    const questions = JSON.parse(localStorage.getItem('rfq_questions') || '[]');
    return rfqId ? questions.filter((q: RFQQuestion) => q.rfq_id === rfqId) : questions;
  }

  async updateRFQQuestion(questionId: string, updates: Partial<RFQQuestion>): Promise<void> {
    const questions = this.getRFQQuestions();
    const updatedQuestions = questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    localStorage.setItem('rfq_questions', JSON.stringify(updatedQuestions));
    
    // Create notification for supplier when answer is provided
    if (updates.buyer_answer && updates.status === 'answered_by_buyer') {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        await api.createNotification({
          user_id: question.supplier_id,
          title: 'Question Answered',
          message: `Your question about "${question.rfq_title || 'RFQ'}" has been answered by the buyer.`,
          type: 'question_answered',
          related_id: question.rfq_id
        });
      }
    }
    
    // Create notification when answer is shared with all suppliers
    if (updates.status === 'shared_with_suppliers') {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        // Notify all suppliers who can see this RFQ
        const rfqs = await this.getRFQs({ status: 'approved' });
        const rfq = rfqs.find(r => r.id === question.rfq_id);
        
        if (rfq) {
          await api.createNotification({
            user_id: question.supplier_id,
            title: 'New Q&A Available',
            message: `New Q&A available for "${rfq.title}". Check RFQ details for updated information.`,
            type: 'qa_shared',
            related_id: question.rfq_id
          });
        }
      }
    }
  }

  static async answerRFQQuestion(questionId: string, buyerAnswer: string): Promise<void> {
    const dbInstance = new DatabaseService();
    await dbInstance.updateRFQQuestion(questionId, {
      buyer_answer: buyerAnswer,
      status: 'answered_by_buyer',
      answered_at: new Date().toISOString()
    });
  }

  async shareRFQAnswer(questionId: string): Promise<void> {
    await this.updateRFQQuestion(questionId, {
      status: 'shared_with_suppliers',
      shared_at: new Date().toISOString()
    });
  }

  async getSharedRFQQuestions(rfqId: string): Promise<RFQQuestion[]> {
    const questions = await this.getRFQQuestions(rfqId);
    return questions.filter(q => q.status === 'shared_with_suppliers');
  }

  async getPendingRFQQuestions(): Promise<RFQQuestion[]> {
    const questions = await this.getRFQQuestions();
    return questions.filter(q => q.status === 'pending_admin_review');
  }

  // Mock data methods for analytics
  async getAnalytics() {
    return await api.getAnalytics();
  }

  async getRFQById(rfqId: string): Promise<RFQ | null> {
    const rfqs = await this.getRFQs();
    return rfqs.find(rfq => rfq.id === rfqId) || null;
  }

  // Notification system
  async createNotification(notification: {
    user_id: string;
    title: string;
    message: string;
    type: string;
    related_id?: string;
  }): Promise<void> {
    await api.createNotification(notification);
  }

  async getNotifications(userId: string): Promise<any[]> {
    return await api.getNotifications(userId);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Legacy methods for backward compatibility (will be migrated)
  async createSampleRequest(request: Omit<SampleRequest, 'id' | 'created_at'>): Promise<SampleRequest | null> {
    return await api.createSampleRequest(request);
  }

  async getSampleRequests(buyerId?: string): Promise<SampleRequest[]> {
    return await api.getSampleRequests(buyerId ? { buyer_id: buyerId } : undefined);
  }

  async updateSampleRequest(requestId: string, updates: Partial<SampleRequest>): Promise<boolean> {
    return await api.updateSampleRequest(requestId, updates);
  }

  async createSampleQuote(quote: Omit<SampleQuote, 'id' | 'created_at' | 'total_cost'>): Promise<SampleQuote | null> {
    return await api.createSampleQuote(quote);
  }

  async getSampleQuotes(supplierId?: string, requestId?: string): Promise<SampleQuote[]> {
    const filters: any = {};
    if (supplierId) filters.supplier_id = supplierId;
    if (requestId) filters.sample_request_id = requestId;
    
    return await api.getSampleQuotes(filters);
  }

  async updateSampleQuote(quoteId: string, updates: Partial<SampleQuote>): Promise<void> {
    const { error } = await supabase
      .from('sample_quotes')
      .update(updates)
      .eq('id', quoteId);
    
    if (error) {
      console.error('Error updating sample quote:', error);
    }
  }

  async getPendingSampleRequests(): Promise<SampleRequest[]> {
    return await api.getSampleRequests({ status: 'pending_admin_approval' });
  }
}

export const db = new DatabaseService();