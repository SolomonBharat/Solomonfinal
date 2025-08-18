import React, { useState } from 'react';
import { useCreateQuotation } from '../lib/queries';
import { toast } from 'sonner';
import { X, DollarSign, Clock, Package, FileText } from 'lucide-react';

interface SubmitQuoteModalProps {
  rfq: any;
  isOpen: boolean;
  onClose: () => void;
  supplierId: string;
}

const SubmitQuoteModal: React.FC<SubmitQuoteModalProps> = ({ rfq, isOpen, onClose, supplierId }) => {
  const createQuotation = useCreateQuotation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price_per_unit: '',
    moq: '',
    lead_time_days: '',
    payment_terms: '',
    shipping_terms: '',
    validity_days: '30',
    quality_guarantee: false,
    sample_available: false,
    notes: '',
    attachments: []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createQuotation.mutateAsync({
        rfq_id: rfq.id,
        supplier_id: supplierId,
        price_per_unit: parseFloat(formData.price_per_unit),
        moq: formData.moq ? parseInt(formData.moq) : null,
        lead_time_days: formData.lead_time_days ? parseInt(formData.lead_time_days) : null,
        payment_terms: formData.payment_terms || null,
        shipping_terms: formData.shipping_terms || null,
        validity_days: formData.validity_days ? parseInt(formData.validity_days) : null,
        quality_guarantee: formData.quality_guarantee,
        sample_available: formData.sample_available,
        notes: formData.notes || null,
        attachments: formData.attachments,
        status: 'pending_admin_review',
        reviewed_at: null,
        reviewed_by: null
      });

      toast.success('Quotation submitted successfully!');
      onClose();
      
      // Reset form
      setFormData({
        price_per_unit: '',
        moq: '',
        lead_time_days: '',
        payment_terms: '',
        shipping_terms: '',
        validity_days: '30',
        quality_guarantee: false,
        sample_available: false,
        notes: '',
        attachments: []
      });
    } catch (error: any) {
      console.error('Error submitting quotation:', error);
      toast.error('Failed to submit quotation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Submit Quotation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* RFQ Details */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">RFQ Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Title:</span>
                <p className="text-blue-900">{rfq.title}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Category:</span>
                <p className="text-blue-900">{rfq.category}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Quantity:</span>
                <p className="text-blue-900">{rfq.quantity} {rfq.unit}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Target Price:</span>
                <p className="text-blue-900">${rfq.target_price || 'Not specified'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pricing */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing & Terms
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit * (USD)
                  </label>
                  <input
                    type="number"
                    name="price_per_unit"
                    value={formData.price_per_unit}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="number"
                    name="moq"
                    value={formData.moq}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    name="lead_time_days"
                    value={formData.lead_time_days}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Validity (Days)
                  </label>
                  <input
                    type="number"
                    name="validity_days"
                    value={formData.validity_days}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Terms & Conditions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <select
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Payment Terms</option>
                    <option value="30% advance, 70% on delivery">30% advance, 70% on delivery</option>
                    <option value="50% advance, 50% on delivery">50% advance, 50% on delivery</option>
                    <option value="100% advance">100% advance</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                    <option value="LC at sight">LC at sight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Terms
                  </label>
                  <select
                    name="shipping_terms"
                    value={formData.shipping_terms}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Shipping Terms</option>
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                    <option value="EXW">EXW (Ex Works)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="FCA">FCA (Free Carrier)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Quality & Samples
              </h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="quality_guarantee"
                    checked={formData.quality_guarantee}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Quality Guarantee Provided</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="sample_available"
                    checked={formData.sample_available}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Samples Available</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional information, specifications, or terms..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.price_per_unit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Quotation</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitQuoteModal;