import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Save, Globe, Shield, Bell, Database } from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    platform_name: 'Solomon Bharat',
    platform_description: 'Global B2B Sourcing Marketplace',
    auto_approve_suppliers: false,
    auto_approve_rfqs: false,
    max_rfq_images: 5,
    max_quotation_validity: 45,
    default_payment_terms: '30% advance, 70% on shipment',
    platform_commission: 2.5,
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
    max_file_size: 10,
    supported_currencies: ['USD', 'EUR', 'GBP'],
    default_shipping_terms: 'FOB'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save settings to localStorage
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setLoading(false);
      alert('Platform settings saved successfully!');
    }, 1000);
  };

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
            <span className="text-gray-900 font-medium">Platform Settings</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
            <p className="text-gray-600">
              Configure global platform parameters and business rules
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-blue-600" />
                  General Platform Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="platform_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      id="platform_name"
                      name="platform_name"
                      value={settings.platform_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="platform_commission" className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      id="platform_commission"
                      name="platform_commission"
                      step="0.1"
                      value={settings.platform_commission}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="platform_description" className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Description
                  </label>
                  <textarea
                    id="platform_description"
                    name="platform_description"
                    rows={3}
                    value={settings.platform_description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Rules */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Business Rules & Automation
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-approve Suppliers</label>
                      <p className="text-xs text-gray-500">Automatically approve new supplier registrations</p>
                    </div>
                    <input
                      type="checkbox"
                      name="auto_approve_suppliers"
                      checked={settings.auto_approve_suppliers}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-approve RFQs</label>
                      <p className="text-xs text-gray-500">Automatically approve buyer RFQ submissions</p>
                    </div>
                    <input
                      type="checkbox"
                      name="auto_approve_rfqs"
                      checked={settings.auto_approve_rfqs}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="max_rfq_images" className="block text-sm font-medium text-gray-700 mb-2">
                        Max RFQ Images
                      </label>
                      <input
                        type="number"
                        id="max_rfq_images"
                        name="max_rfq_images"
                        value={settings.max_rfq_images}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="max_quotation_validity" className="block text-sm font-medium text-gray-700 mb-2">
                        Max Quotation Validity (Days)
                      </label>
                      <input
                        type="number"
                        id="max_quotation_validity"
                        name="max_quotation_validity"
                        value={settings.max_quotation_validity}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Notification Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p className="text-xs text-gray-500">Send email notifications for important events</p>
                    </div>
                    <input
                      type="checkbox"
                      name="email_notifications"
                      checked={settings.email_notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                      <p className="text-xs text-gray-500">Send SMS alerts for urgent notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      name="sms_notifications"
                      checked={settings.sms_notifications}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                      <p className="text-xs text-gray-500">Enable maintenance mode for platform updates</p>
                    </div>
                    <input
                      type="checkbox"
                      name="maintenance_mode"
                      checked={settings.maintenance_mode}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Link 
                to="/admin"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;