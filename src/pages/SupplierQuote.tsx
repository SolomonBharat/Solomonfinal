import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, DollarSign } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import QASystem from '../components/QASystem';
import { useAuth } from '../contexts/AuthContext';

const SupplierQuote = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isEdit = searchParams.get('edit') === 'true';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price_per_unit: '',
    moq: '',
    lead_time: '',
    payment_terms: '30% advance, 70% on shipment',
    shipping_terms: 'FOB',
    validity_days: '15',
    quality_guarantee: true,
    sample_available: true,
    notes: '',
    product_images: [] as File[],
    product_videos: [] as File[],
    courier_service: '',
    tracking_id: ''
  });

  // Load RFQ data
  const [rfqData, setRfqData] = useState<any>(null);

  useEffect(() => {
    // Load RFQ details
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const rfq = userRFQs.find((r: any) => r.id === rfqId);
    setRfqData(rfq);

    // If editing, load existing quotation data
    if (isEdit) {
      const supplierQuotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
      const existingQuote = supplierQuotations.find((q: any) => 
        q.rfq_id === rfqId && q.supplier_email === user?.email
      );
      
      if (existingQuote) {
        setFormData({
          price_per_unit: existingQuote.quoted_price.toString(),
          moq: existingQuote.moq.toString(),
          lead_time: existingQuote.lead_time,
          payment_terms: existingQuote.payment_terms,
          shipping_terms: existingQuote.shipping_terms,
          validity_days: existingQuote.validity_days.toString(),
          quality_guarantee: existingQuote.quality_guarantee,
          sample_available: existingQuote.sample_available,
          notes: existingQuote.notes,
          product_images: [],
          product_videos: [],
          courier_service: existingQuote.courier_service || '',
          tracking_id: existingQuote.tracking_id || ''
        });
      }
    }
  }, [rfqId, isEdit, user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Validation
    if (!formData.price_per_unit || !formData.lead_time || !formData.payment_terms || !formData.shipping_terms || !formData.validity_days) {
      alert('Please fill in all required fields (Price, Lead Time, Payment Terms, Shipping Terms, and Quote Validity)');
      setLoading(false);
      return;
    }
    
    // Get current supplier info from onboarded suppliers
    const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
    const currentSupplier = onboardedSuppliers.find((s: any) => s.email === user?.email);
    
    const quotationData = {
      id: isEdit ? 
        JSON.parse(localStorage.getItem('supplier_quotations') || '[]')
          .find((q: any) => q.rfq_id === rfqId && q.supplier_email === user?.email)?.id || `q-${Date.now()}` 
        : `q-${Date.now()}`,
      rfq_id: rfqId,
      rfq_title: rfqData?.title || 'Product RFQ',
      supplier_id: user?.id,
      supplier_name: currentSupplier?.contactPerson || user?.name || 'Supplier User',
      supplier_company: currentSupplier?.companyName || user?.company || 'Supplier Company',
      supplier_location: `${currentSupplier?.country || 'India'}`,
      supplier_email: user?.email,
      supplier_phone: currentSupplier?.phone || user?.phone || '+91 XXXXXXXXXX',
      buyer_company: rfqData?.buyer_company || 'Buyer Company',
      buyer_country: rfqData?.buyer_country || 'Country',
      quoted_price: parseFloat(formData.price_per_unit),
      moq: parseInt(formData.moq) || parseInt(rfqData?.quantity) || 0,
      lead_time: formData.lead_time,
      payment_terms: formData.payment_terms,
      shipping_terms: formData.shipping_terms,
      validity_days: parseInt(formData.validity_days),
      quality_guarantee: formData.quality_guarantee,
      sample_available: formData.sample_available,
      status: 'pending_review',
      submitted_at: new Date().toISOString(),
      notes: formData.notes,
      total_value: parseFloat(formData.price_per_unit) * (parseInt(formData.moq) || parseInt(rfqData?.quantity) || 0),
      courier_service: formData.courier_service,
      tracking_id: formData.tracking_id
    };

    // Update or create quotation
    const quotations = JSON.parse(localStorage.getItem('supplier_quotations') || '[]');
    
    if (isEdit) {
      // Update existing quotation
      const updatedQuotations = quotations.map((q: any) => 
        q.rfq_id === rfqId && q.supplier_email === user?.email ? quotationData : q
      );
      localStorage.setItem('supplier_quotations', JSON.stringify(updatedQuotations));
    } else {
      // Create new quotation
      quotations.push(quotationData);
      localStorage.setItem('supplier_quotations', JSON.stringify(quotations));
    }
    
    setTimeout(() => {
      setLoading(false);
      alert(isEdit ? 'Quotation updated successfully!' : 'Quotation submitted successfully! It will be reviewed by admin before being sent to the buyer.');
      navigate('/supplier/dashboard');
    }, 1000);
  };

  const calculateTotal = () => {
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    const moq = parseInt(formData.moq) || (rfqData?.quantity || 0);
    return pricePerUnit * moq;
  };

  if (!rfqData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">RFQ Not Found</h2>
          <p className="text-gray-600 mb-4">The requested RFQ could not be found.</p>
          <Link to="/supplier/dashboard" className="text-blue-600 hover:text-blue-800">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/supplier/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium text-sm sm:text-base">
              {isEdit ? 'Edit Quotation' : 'Submit Quotation'}
            </span>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {isEdit ? 'Edit Quotation' : 'Submit Quotation'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {isEdit ? 'Update your quotation details' : 'Provide your best quote for this RFQ. Your quotation will be reviewed by admin before being sent to the buyer.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* RFQ Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{rfqData.title}</h4>
                    <p className="text-sm text-gray-600">{rfqData.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium">{parseInt(rfqData.quantity).toLocaleString()} {rfqData.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Target Price:</span>
                      <p className="font-medium">${parseFloat(rfqData.target_price).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <p className="font-medium">{rfqData.delivery_timeline}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <p className="font-medium">{rfqData.buyer_company}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{rfqData.description}</p>
                  </div>

                  {rfqData.additional_requirements && (
                    <div>
                      <span className="text-gray-500 text-sm">Additional Requirements:</span>
                      <p className="text-sm text-gray-700 mt-1">{rfqData.additional_requirements}</p>
                    </div>
                  )}
                </div>

                {/* Sample Tracking Section */}
                <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3">📦 Sample Tracking (if sample requested)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2">
                        Courier Service Name
                      </label>
                      <input
                        type="text"
                        name="courier_service"
                        value={formData.courier_service}
                        onChange={handleChange}
                        placeholder="e.g., DHL, FedEx, Blue Dart"
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-2">
                        Tracking ID
                      </label>
                      <input
                        type="text"
                        name="tracking_id"
                        value={formData.tracking_id}
                        onChange={handleChange}
                        placeholder="Enter tracking number"
                        className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    Fill this section only if buyer has requested samples for this quotation
                  </p>
                </div>
              </div>
            </div>

            {/* Quotation Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Pricing Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Unit (USD) *
                        </label>
                        <input
                          type="number"
                          id="price_per_unit"
                          name="price_per_unit"
                          step="0.01"
                          required
                          value={formData.price_per_unit}
                          onChange={handleChange}
                          placeholder="8.50"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label htmlFor="moq" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Order Quantity *
                        </label>
                        <input
                          type="number"
                          id="moq"
                          name="moq"
                          required
                          value={formData.moq}
                          onChange={handleChange}
                          placeholder={rfqData?.quantity || "5000"}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Total Calculation */}
                    {formData.price_per_unit && formData.moq && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 font-medium">
                          Total Quote Value: ${calculateTotal().toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Terms Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Terms & Conditions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="lead_time" className="block text-sm font-medium text-gray-700 mb-2">
                          Lead Time *
                        </label>
                        <select
                          id="lead_time"
                          name="lead_time"
                          required
                          value={formData.lead_time}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="">Select Lead Time</option>
                          <option value="15-20 days">15-20 days</option>
                          <option value="20-25 days">20-25 days</option>
                          <option value="25-30 days">25-30 days</option>
                          <option value="30-35 days">30-35 days</option>
                          <option value="35-40 days">35-40 days</option>
                          <option value="40-45 days">40-45 days</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="validity_days" className="block text-sm font-medium text-gray-700 mb-2">
                          Quote Validity (Days) *
                        </label>
                        <select
                          id="validity_days"
                          name="validity_days"
                          required
                          value={formData.validity_days}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="7">7 days</option>
                          <option value="15">15 days</option>
                          <option value="30">30 days</option>
                          <option value="45">45 days</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Terms *
                        </label>
                        <select
                          id="payment_terms"
                          name="payment_terms"
                          required
                          value={formData.payment_terms}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="30% advance, 70% on shipment">30% advance, 70% on shipment</option>
                          <option value="40% advance, 60% on shipment">40% advance, 60% on shipment</option>
                          <option value="50% advance, 50% on shipment">50% advance, 50% on shipment</option>
                          <option value="25% advance, 75% against documents">25% advance, 75% against documents</option>
                          <option value="100% advance">100% advance</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="shipping_terms" className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Terms *
                        </label>
                        <select
                          id="shipping_terms"
                          name="shipping_terms"
                          required
                          value={formData.shipping_terms}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        >
                          <option value="FOB">FOB (Free on Board)</option>
                          <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                          <option value="CFR">CFR (Cost & Freight)</option>
                          <option value="EXW">EXW (Ex Works)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="quality_guarantee"
                          name="quality_guarantee"
                          checked={formData.quality_guarantee}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="quality_guarantee" className="text-sm text-gray-700">
                          Quality guarantee provided
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="sample_available"
                          name="sample_available"
                          checked={formData.sample_available}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="sample_available" className="text-sm text-gray-700">
                          Samples available for approval
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes & Specifications
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any additional information, bulk discounts, special offers, or clarifications..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    />
                  </div>

                  {/* Product Images */}
                  <div>
                    <FileUpload
                      label="Product Images"
                      description="Upload high-quality images of your products"
                      acceptedTypes="image/*"
                      maxFiles={10}
                      maxSize={10}
                      onFileSelect={(files) => setFormData(prev => ({ ...prev, product_images: files }))}
                    />
                  </div>

                  {/* Product Videos */}
                  <div>
                    <FileUpload
                      label="Product Videos"
                      description="Upload videos showcasing your products and quality"
                      acceptedTypes="video/*"
                      maxFiles={3}
                      maxSize={50}
                      onFileSelect={(files) => setFormData(prev => ({ ...prev, product_videos: files }))}
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
                  <Link 
                    to="/supplier/dashboard"
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (isEdit ? 'Updating...' : 'Submitting...') : (isEdit ? 'Update Quotation' : 'Submit Quotation')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Q&A Section */}
          <div className="mt-6 sm:mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions & Answers</h3>
              <QASystem 
                rfqId={rfqId} 
                mode="supplier_ask"
                onQuestionSubmit={(question) => console.log('Question submitted:', question)}
              />
            </div>
          </div>

          {/* Public Q&A */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Q&A</h3>
              <p className="text-sm text-gray-600 mb-4">
                Previous questions and answers that might help with your quotation:
              </p>
              <QASystem 
                rfqId={rfqId} 
                mode="public_view"
              />
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Better Quotations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be competitive with your pricing while maintaining quality standards</li>
              <li>• Clearly mention any certifications or quality standards you meet</li>
              <li>• Provide realistic lead times and stick to them</li>
              <li>• Include any value-added services or bulk discounts in your notes</li>
              <li>• Your quotation will be reviewed by our team before being sent to the buyer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierQuote;