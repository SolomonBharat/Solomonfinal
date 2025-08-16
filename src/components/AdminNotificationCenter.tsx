import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, CheckCircle, AlertTriangle, Phone, Mail, Building } from 'lucide-react';
import { notificationService } from '../lib/notificationService';

interface AdminNotificationCenterProps {
  onNotificationUpdate?: () => void;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [urgentAlerts, setUrgentAlerts] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    setNotifications(notificationService.getAdminNotifications());
    setUrgentAlerts(notificationService.getUrgentAlerts());
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    loadNotifications();
    if (onNotificationUpdate) onNotificationUpdate();
  };

  const handleClearAlert = (alertId: string) => {
    notificationService.clearUrgentAlert(alertId);
    loadNotifications();
    if (onNotificationUpdate) onNotificationUpdate();
  };

  const handleContactParties = (alertData: any) => {
    const whatsappMessage = encodeURIComponent(
      `🚨 URGENT ACTION REQUIRED\n\n` +
      `Type: ${alertData.type === 'sample_request' ? 'Sample Request' : 'Quote Accepted'}\n` +
      `RFQ: ${alertData.rfq_title}\n` +
      `Buyer: ${alertData.buyer_company}\n` +
      `Supplier: ${alertData.supplier_company}\n\n` +
      `Buyer Contact: ${alertData.buyer_email} | ${alertData.buyer_phone}\n` +
      `Supplier Contact: ${alertData.supplier_email} | ${alertData.supplier_phone}\n\n` +
      `Please coordinate immediately!`
    );
    window.open(`https://wa.me/918595135554?text=${whatsappMessage}`, '_blank');
  };

  const unreadCount = notifications.filter(n => !n.read).length + urgentAlerts.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative text-gray-400 hover:text-gray-600"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Admin Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Urgent Alerts */}
            {urgentAlerts.map((alert) => (
              <div key={alert.id} className="p-4 border-b border-red-200 bg-red-50">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900">{alert.title}</p>
                    <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleContactParties(alert.data)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Contact Parties
                      </button>
                      <button
                        onClick={() => handleClearAlert(alert.id)}
                        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                      >
                        Mark Handled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Regular Notifications */}
            {notifications.slice(0, 10).map((notification) => (
              <div key={notification.id} className={`p-4 border-b border-gray-200 ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {notification.type === 'sample_request' && <Bell className="h-4 w-4 text-orange-500" />}
                    {notification.type === 'quote_accepted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {notification.type === 'rfq_submitted' && <Clock className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && urgentAlerts.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationCenter;