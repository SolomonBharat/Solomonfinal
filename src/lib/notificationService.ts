// Enhanced Notification Service for Sample Requests and Quote Acceptance
export interface Notification {
  id: string;
  type: 'sample_request' | 'quote_accepted' | 'rfq_submitted' | 'supplier_question';
  title: string;
  message: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read: boolean;
  admin_action_required: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Sample Request Notification
  notifySampleRequest(sampleData: {
    rfq_id: string;
    rfq_title: string;
    buyer_company: string;
    buyer_email: string;
    buyer_phone: string;
    supplier_company: string;
    supplier_email: string;
    supplier_phone: string;
    quoted_price: number;
    quantity: number;
    sample_address?: string;
  }) {
    const notification: Notification = {
      id: `sample_${Date.now()}`,
      type: 'sample_request',
      title: '🚨 URGENT: Sample Request Received',
      message: `Sample requested for ${sampleData.rfq_title} by ${sampleData.buyer_company}`,
      data: {
        ...sampleData,
        workflow_step: 'sample_requested',
        admin_instructions: [
          '1. Contact supplier immediately to arrange sample shipment',
          '2. Ensure supplier provides tracking details',
          '3. Coordinate with buyer for sample delivery',
          '4. Follow up on sample feedback'
        ]
      },
      priority: 'urgent',
      created_at: new Date().toISOString(),
      read: false,
      admin_action_required: true
    };

    this.saveNotification(notification);
    this.triggerAdminAlert(notification);
    return notification;
  }

  // Quote Acceptance Notification
  notifyQuoteAcceptance(quoteData: {
    rfq_id: string;
    rfq_title: string;
    quotation_id: string;
    buyer_company: string;
    buyer_email: string;
    buyer_phone: string;
    supplier_company: string;
    supplier_email: string;
    supplier_phone: string;
    total_value: number;
    quantity: number;
    unit_price: number;
    payment_terms: string;
    delivery_timeline: string;
  }) {
    const notification: Notification = {
      id: `quote_accepted_${Date.now()}`,
      type: 'quote_accepted',
      title: '🎉 URGENT: Quote Accepted - Order Confirmed',
      message: `Quote accepted for ${quoteData.rfq_title} - Total Value: $${quoteData.total_value.toLocaleString()}`,
      data: {
        ...quoteData,
        workflow_step: 'quote_accepted',
        admin_instructions: [
          '1. Contact both buyer and supplier immediately',
          '2. Facilitate contract signing and payment terms',
          '3. Set up order tracking and milestone monitoring',
          '4. Coordinate production timeline and quality checks',
          '5. Arrange logistics and shipping coordination'
        ]
      },
      priority: 'urgent',
      created_at: new Date().toISOString(),
      read: false,
      admin_action_required: true
    };

    this.saveNotification(notification);
    this.triggerAdminAlert(notification);
    return notification;
  }

  // Save notification to localStorage
  private saveNotification(notification: Notification) {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.unshift(notification); // Add to beginning for latest first
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  }

  // Trigger immediate admin alert
  private triggerAdminAlert(notification: Notification) {
    // In a real system, this would send email/SMS/push notification
    console.log('🚨 ADMIN ALERT:', notification.title);
    
    // Store urgent alert for admin dashboard
    const urgentAlerts = JSON.parse(localStorage.getItem('urgent_admin_alerts') || '[]');
    urgentAlerts.unshift({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      created_at: notification.created_at,
      data: notification.data
    });
    localStorage.setItem('urgent_admin_alerts', JSON.stringify(urgentAlerts));
  }

  // Get admin notifications
  getAdminNotifications(): Notification[] {
    return JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  }

  // Get urgent alerts for admin
  getUrgentAlerts() {
    return JSON.parse(localStorage.getItem('urgent_admin_alerts') || '[]');
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    const notifications = this.getAdminNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
  }

  // Clear urgent alert
  clearUrgentAlert(alertId: string) {
    const alerts = this.getUrgentAlerts();
    const updated = alerts.filter((a: any) => a.id !== alertId);
    localStorage.setItem('urgent_admin_alerts', JSON.stringify(updated));
  }
}

export const notificationService = NotificationService.getInstance();