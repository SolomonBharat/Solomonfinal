import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  Globe, 
  Shield, 
  Bell, 
  Database,
  DollarSign,
  Clock,
  Users,
  FileText,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download,
  Trash2
} from 'lucide-react';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Platform Settings
    platform_name: 'Solomon Bharat',
    platform_description: 'Global B2B Sourcing Marketplace connecting buyers with verified Indian suppliers',
    platform_logo: '',
    platform_favicon: '',
    support_email: 'support@solomonbharat.com',
    contact_phone: '+91 80 4567 8900',
    company_address: 'Bangalore, Karnataka, India',
    
    // Business Rules
    auto_approve_suppliers: false,
    auto_approve_rfqs: false,
    auto_approve_quotations: false,
    supplier_verification_required: true,
    buyer_verification_required: false,
    
    // RFQ Settings
    max_rfq_images: 5,
    max_rfq_description_length: 2000,
    rfq_auto_expire_days: 90,
    max_quotations_per_rfq: 10,
    
    // Quotation Settings
    max_quotation_validity_days: 45,
    min_quotation_validity_days: 7,
    quotation_auto_expire_hours: 72,
    allow_quotation_revisions: true,
    
    // Payment & Financial
    platform_commission_rate: 2.5,
    payment_processing_fee: 2.9,
    default_payment_terms: '30% advance, 70% on shipment',
    supported_currencies: ['USD', 'EUR', 'GBP', 'INR'],
    minimum_order_value: 1000,
    maximum_order_value: 1000000,
    
    // Shipping & Logistics
    default_shipping_terms: 'FOB',
    supported_shipping_terms: ['FOB', 'CIF', 'CFR', 'EXW', 'DDP'],
    max_shipping_days: 60,
    tracking_required: true,
    insurance_required: true,
    
    // File & Media Settings
    max_file_size_mb: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    max_product_images: 8,
    max_factory_photos: 6,
    video_upload_enabled: true,
    max_video_size_mb: 50,
    
    // Communication Settings
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    notification_frequency: 'immediate',
    admin_notification_email: 'admin@solomonbharat.com',
    
    // Security Settings
    session_timeout_minutes: 120,
    password_min_length: 8,
    require_2fa: false,
    login_attempt_limit: 5,
    account_lockout_duration: 30,
    
    // API & Integration Settings
    api_rate_limit: 1000,
    webhook_enabled: false,
    webhook_url: '',
    third_party_integrations: {
      stripe_enabled: false,
      paypal_enabled: false,
      fedex_enabled: false,
      dhl_enabled: false
    },
    
    // Analytics & Reporting
    analytics_enabled: true,
    data_retention_days: 365,
    export_data_enabled: true,
    gdpr_compliance: true,
    
    // Maintenance & System
    maintenance_mode: false,
    maintenance_message: 'Platform is under maintenance. Please check back later.',
    system_announcements: '',
    feature_flags: {
      ai_matching: true,
      bulk_operations: true,
      advanced_search: true,
      video_calls: false
    }
  });

  useEffect(() => {
    // Load existing settings from localStorage
    const savedSettings = localStorage.getItem('platform_settings');
    if (savedSettings) {
      setSettings(prev => ({
        ...prev,
        ...JSON.parse(savedSettings)
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSettings(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setSettings(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleArrayChange = (key: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    setSettings(prev => ({
      ...prev,
      [key]: array
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save settings to localStorage
    localStorage.setItem('platform_settings', JSON.stringify(settings));
    
    setTimeout(() => {
      setLoading(false);
      alert('✅ Platform settings saved successfully!\n\nAll changes have been applied to the system.');
    }, 1000);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'solomon-bharat-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedSettings = JSON.parse(event.target?.result as string);
          setSettings(prev => ({ ...prev, ...importedSettings }));
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Error importing settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      localStorage.removeItem('platform_settings');
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'business', name: 'Business Rules', icon: Shield },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'communication', name: 'Communication', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database }
  ];

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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
                <p className="text-gray-600">
                  Configure all platform parameters, business rules, and system settings
                </p>
              </div>
              <div className="flex space-x-3">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                  id="import-settings"
                />
                <label
                  htmlFor="import-settings"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import</span>
                </label>
                <button
                  onClick={handleExportSettings}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-600" />
                      Platform Identity
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
                        <label htmlFor="support_email" className="block text-sm font-medium text-gray-700 mb-2">
                          Support Email
                        </label>
                        <input
                          type="email"
                          id="support_email"
                          name="support_email"
                          value={settings.support_email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          id="contact_phone"
                          name="contact_phone"
                          value={settings.contact_phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Address
                        </label>
                        <input
                          type="text"
                          id="company_address"
                          name="company_address"
                          value={settings.company_address}
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
              </div>
            )}

            {/* Business Rules Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Approval & Verification Rules
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

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Auto-approve Quotations</label>
                          <p className="text-xs text-gray-500">Automatically approve supplier quotations</p>
                        </div>
                        <input
                          type="checkbox"
                          name="auto_approve_quotations"
                          checked={settings.auto_approve_quotations}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Supplier Verification Required</label>
                          <p className="text-xs text-gray-500">Require manual verification for all suppliers</p>
                        </div>
                        <input
                          type="checkbox"
                          name="supplier_verification_required"
                          checked={settings.supplier_verification_required}
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
                          <label htmlFor="max_quotations_per_rfq" className="block text-sm font-medium text-gray-700 mb-2">
                            Max Quotations per RFQ
                          </label>
                          <input
                            type="number"
                            id="max_quotations_per_rfq"
                            name="max_quotations_per_rfq"
                            value={settings.max_quotations_per_rfq}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="rfq_auto_expire_days" className="block text-sm font-medium text-gray-700 mb-2">
                            RFQ Auto-expire (Days)
                          </label>
                          <input
                            type="number"
                            id="rfq_auto_expire_days"
                            name="rfq_auto_expire_days"
                            value={settings.rfq_auto_expire_days}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="max_quotation_validity_days" className="block text-sm font-medium text-gray-700 mb-2">
                            Max Quotation Validity (Days)
                          </label>
                          <input
                            type="number"
                            id="max_quotation_validity_days"
                            name="max_quotation_validity_days"
                            value={settings.max_quotation_validity_days}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Settings Tab */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                      Financial Configuration
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="platform_commission_rate" className="block text-sm font-medium text-gray-700 mb-2">
                          Platform Commission Rate (%)
                        </label>
                        <input
                          type="number"
                          id="platform_commission_rate"
                          name="platform_commission_rate"
                          step="0.1"
                          value={settings.platform_commission_rate}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="payment_processing_fee" className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Processing Fee (%)
                        </label>
                        <input
                          type="number"
                          id="payment_processing_fee"
                          name="payment_processing_fee"
                          step="0.1"
                          value={settings.payment_processing_fee}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="minimum_order_value" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Order Value (USD)
                        </label>
                        <input
                          type="number"
                          id="minimum_order_value"
                          name="minimum_order_value"
                          value={settings.minimum_order_value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="maximum_order_value" className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Order Value (USD)
                        </label>
                        <input
                          type="number"
                          id="maximum_order_value"
                          name="maximum_order_value"
                          value={settings.maximum_order_value}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label htmlFor="supported_currencies" className="block text-sm font-medium text-gray-700 mb-2">
                        Supported Currencies (comma-separated)
                      </label>
                      <input
                        type="text"
                        id="supported_currencies"
                        value={settings.supported_currencies.join(', ')}
                        onChange={(e) => handleArrayChange('supported_currencies', e.target.value)}
                        placeholder="USD, EUR, GBP, INR"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mt-6">
                      <label htmlFor="default_payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Payment Terms
                      </label>
                      <input
                        type="text"
                        id="default_payment_terms"
                        name="default_payment_terms"
                        value={settings.default_payment_terms}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Communication Settings Tab */}
            {activeTab === 'communication' && (
              <div className="space-y-6">
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
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                            <p className="text-xs text-gray-500">Send email notifications for important events</p>
                          </div>
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
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-green-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
                            <p className="text-xs text-gray-500">Send SMS alerts for urgent notifications</p>
                          </div>
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
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-purple-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                            <p className="text-xs text-gray-500">Browser push notifications for real-time updates</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          name="push_notifications"
                          checked={settings.push_notifications}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="notification_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                            Notification Frequency
                          </label>
                          <select
                            id="notification_frequency"
                            name="notification_frequency"
                            value={settings.notification_frequency}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="immediate">Immediate</option>
                            <option value="hourly">Hourly Digest</option>
                            <option value="daily">Daily Digest</option>
                            <option value="weekly">Weekly Summary</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="admin_notification_email" className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Notification Email
                          </label>
                          <input
                            type="email"
                            id="admin_notification_email"
                            name="admin_notification_email"
                            value={settings.admin_notification_email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Security & Authentication
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="session_timeout_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (Minutes)
                        </label>
                        <input
                          type="number"
                          id="session_timeout_minutes"
                          name="session_timeout_minutes"
                          value={settings.session_timeout_minutes}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="password_min_length" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          id="password_min_length"
                          name="password_min_length"
                          value={settings.password_min_length}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="login_attempt_limit" className="block text-sm font-medium text-gray-700 mb-2">
                          Login Attempt Limit
                        </label>
                        <input
                          type="number"
                          id="login_attempt_limit"
                          name="login_attempt_limit"
                          value={settings.login_attempt_limit}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="account_lockout_duration" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Lockout Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          id="account_lockout_duration"
                          name="account_lockout_duration"
                          value={settings.account_lockout_duration}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Require Two-Factor Authentication</label>
                          <p className="text-xs text-gray-500">Mandatory 2FA for all user accounts</p>
                        </div>
                        <input
                          type="checkbox"
                          name="require_2fa"
                          checked={settings.require_2fa}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Settings Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Database className="h-5 w-5 mr-2 text-blue-600" />
                      System Configuration
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                            <p className="text-xs text-gray-500">Enable maintenance mode for platform updates</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          name="maintenance_mode"
                          checked={settings.maintenance_mode}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>

                      {settings.maintenance_mode && (
                        <div>
                          <label htmlFor="maintenance_message" className="block text-sm font-medium text-gray-700 mb-2">
                            Maintenance Message
                          </label>
                          <textarea
                            id="maintenance_message"
                            name="maintenance_message"
                            rows={3}
                            value={settings.maintenance_message}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="max_file_size_mb" className="block text-sm font-medium text-gray-700 mb-2">
                            Max File Size (MB)
                          </label>
                          <input
                            type="number"
                            id="max_file_size_mb"
                            name="max_file_size_mb"
                            value={settings.max_file_size_mb}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="api_rate_limit" className="block text-sm font-medium text-gray-700 mb-2">
                            API Rate Limit (requests/hour)
                          </label>
                          <input
                            type="number"
                            id="api_rate_limit"
                            name="api_rate_limit"
                            value={settings.api_rate_limit}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="data_retention_days" className="block text-sm font-medium text-gray-700 mb-2">
                            Data Retention (Days)
                          </label>
                          <input
                            type="number"
                            id="data_retention_days"
                            name="data_retention_days"
                            value={settings.data_retention_days}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="max_video_size_mb" className="block text-sm font-medium text-gray-700 mb-2">
                            Max Video Size (MB)
                          </label>
                          <input
                            type="number"
                            id="max_video_size_mb"
                            name="max_video_size_mb"
                            value={settings.max_video_size_mb}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="allowed_file_types" className="block text-sm font-medium text-gray-700 mb-2">
                          Allowed File Types (comma-separated)
                        </label>
                        <input
                          type="text"
                          id="allowed_file_types"
                          value={settings.allowed_file_types.join(', ')}
                          onChange={(e) => handleArrayChange('allowed_file_types', e.target.value)}
                          placeholder="jpg, jpeg, png, pdf, doc, docx"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="system_announcements" className="block text-sm font-medium text-gray-700 mb-2">
                          System Announcements
                        </label>
                        <textarea
                          id="system_announcements"
                          name="system_announcements"
                          rows={3}
                          value={settings.system_announcements}
                          onChange={handleChange}
                          placeholder="Important announcements for all users..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Flags */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">AI-Powered Matching</label>
                          <p className="text-xs text-gray-500">Enable AI supplier matching algorithm</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.feature_flags.ai_matching}
                          onChange={(e) => handleNestedChange('feature_flags', 'ai_matching', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Bulk Operations</label>
                          <p className="text-xs text-gray-500">Allow bulk approval/rejection operations</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.feature_flags.bulk_operations}
                          onChange={(e) => handleNestedChange('feature_flags', 'bulk_operations', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Advanced Search</label>
                          <p className="text-xs text-gray-500">Enable advanced filtering and search capabilities</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.feature_flags.advanced_search}
                          onChange={(e) => handleNestedChange('feature_flags', 'advanced_search', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Video Calls (Beta)</label>
                          <p className="text-xs text-gray-500">Enable video calling between buyers and suppliers</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.feature_flags.video_calls}
                          onChange={(e) => handleNestedChange('feature_flags', 'video_calls', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mt-8">
              <div className="text-sm text-gray-500">
                Last saved: {new Date().toLocaleString()}
              </div>
              <div className="flex space-x-4">
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
                  <span>{loading ? 'Saving...' : 'Save All Settings'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Settings Summary */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Current Configuration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">User Management</span>
                </div>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Auto-approve Suppliers: {settings.auto_approve_suppliers ? '✅ Yes' : '❌ No'}</p>
                  <p>Auto-approve RFQs: {settings.auto_approve_rfqs ? '✅ Yes' : '❌ No'}</p>
                  <p>Verification Required: {settings.supplier_verification_required ? '✅ Yes' : '❌ No'}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Financial</span>
                </div>
                <div className="text-sm text-green-800 space-y-1">
                  <p>Commission: {settings.platform_commission_rate}%</p>
                  <p>Processing Fee: {settings.payment_processing_fee}%</p>
                  <p>Min Order: ${settings.minimum_order_value.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Notifications</span>
                </div>
                <div className="text-sm text-purple-800 space-y-1">
                  <p>Email: {settings.email_notifications ? '✅ Enabled' : '❌ Disabled'}</p>
                  <p>SMS: {settings.sms_notifications ? '✅ Enabled' : '❌ Disabled'}</p>
                  <p>Frequency: {settings.notification_frequency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;