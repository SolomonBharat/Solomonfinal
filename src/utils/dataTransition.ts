import { api } from '../lib/api';
import { db } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

/**
 * Utility functions to help transition from localStorage to Supabase
 * These functions will migrate existing localStorage data to Supabase
 */

export class DataTransitionService {
  // Migrate RFQs from localStorage to Supabase
  async migrateRFQsToSupabase(userId: string): Promise<void> {
    try {
      const localRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
      const userRFQs = localRFQs.filter((rfq: any) => rfq.buyer_id === userId);

      for (const rfq of userRFQs) {
        const rfqData = {
          buyer_id: userId,
          title: rfq.title,
          category: rfq.category,
          description: rfq.description || '',
          quantity: parseInt(rfq.quantity) || 0,
          unit: rfq.unit,
          target_price: parseFloat(rfq.target_price) || 0,
          max_price: rfq.max_price ? parseFloat(rfq.max_price) : undefined,
          delivery_timeline: rfq.delivery_timeline,
          shipping_terms: rfq.shipping_terms || 'FOB',
          quality_standards: rfq.quality_standards,
          certifications_needed: rfq.certifications_needed,
          additional_requirements: rfq.additional_requirements,
          images: rfq.images || [],
          status: rfq.status || 'pending_approval'
        };

        await api.createRFQ(rfqData);
      }

      console.log(`Migrated ${userRFQs.length} RFQs to Supabase`);
    } catch (error) {
      console.error('Error migrating RFQs:', error);
    }
  }

  // Migrate quotations from localStorage to Supabase
  async migrateQuotationsToSupabase(supplierId: string): Promise<void> {
    try {
      const localQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');

      for (const quotation of localQuotations) {
        const quotationData = {
          rfq_id: quotation.rfq_id,
          supplier_id: supplierId,
          quoted_price: parseFloat(quotation.quoted_price) || 0,
          moq: parseInt(quotation.moq) || 0,
          lead_time: quotation.lead_time,
          payment_terms: quotation.payment_terms || '30% advance, 70% on shipment',
          shipping_terms: quotation.shipping_terms || 'FOB',
          validity_days: parseInt(quotation.validity_days) || 15,
          quality_guarantee: quotation.quality_guarantee || false,
          sample_available: quotation.sample_available || false,
          notes: quotation.notes || '',
          images: quotation.images || [],
          status: quotation.status || 'pending_review'
        };

        await api.createQuotation(quotationData);
      }

      console.log(`Migrated ${localQuotations.length} quotations to Supabase`);
    } catch (error) {
      console.error('Error migrating quotations:', error);
    }
  }

  // Check if user data needs migration
  async checkMigrationNeeded(userId: string, userType: string): Promise<boolean> {
    try {
      if (userType === 'buyer') {
        const supabaseRFQs = await api.getRFQs({ buyer_id: userId });
        const localRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]')
          .filter((rfq: any) => rfq.buyer_id === userId);
        
        return localRFQs.length > 0 && supabaseRFQs.length === 0;
      }

      if (userType === 'supplier') {
        const supabaseQuotations = await api.getQuotations({ supplier_id: userId });
        const localQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
        
        return localQuotations.length > 0 && supabaseQuotations.length === 0;
      }

      return false;
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  // Perform full data migration
  async performMigration(userId: string, userType: string): Promise<void> {
    try {
      if (userType === 'buyer') {
        await this.migrateRFQsToSupabase(userId);
      } else if (userType === 'supplier') {
        await this.migrateQuotationsToSupabase(userId);
      }

      // Clear localStorage after successful migration
      if (userType === 'buyer') {
        const allRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
        const otherUserRFQs = allRFQs.filter((rfq: any) => rfq.buyer_id !== userId);
        localStorage.setItem('user_rfqs', JSON.stringify(otherUserRFQs));
      } else if (userType === 'supplier') {
        localStorage.removeItem('supplier_quotations');
      }

      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }
}

export const dataTransition = new DataTransitionService();