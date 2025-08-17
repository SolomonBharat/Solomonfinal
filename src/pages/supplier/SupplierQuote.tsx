import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCreateQuotation } from '../../lib/queries';
import { quotationSchema, QuotationFormData } from '../../schemas';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'sonner';

const SupplierQuote = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const createQuotationMutation = useCreateQuotation();

  // Fetch RFQ details
  const { data: rfq, isLoading } = useQuery({
    queryKey: ['rfq', rfqId],
    queryFn: async () => {
      if (!rfqId) throw new Error('RFQ ID is required');
      
      const { data, error } = await supabase
        .from('rfqs')
        .select(`
          *,
          profiles!buyer_id(*)
        `)
        .eq('id', rfqId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!rfqId,
  });

  // Check if supplier can quote for this RFQ
  const { data: canQuote } = useQuery({
    queryKey: ['canQuote', rfqId, profile?.id],
    queryFn: async () => {
      if (!rfqId || !profile?.id) return false;
      
      // Check if assigned
      const { data: assignment } = await supabase
        .from('rfq_suppliers')
        .select('*')
        .eq('rfq_id', rfqId)
        .eq('supplier_id', profile.id)
        .single();
      
      if (assignment) return true;
      
      // Check if open bidding and category matches
      if (rfq?.open_for_bidding) {
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('product_categories')
          .eq('id', profile.id)
          .single();
        
        return supplier?.product_categories.includes(rfq.category) || false;
      }
      
      return false;
    },
    enabled: !!rfqId && !!profile?.id && !!rfq,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
  });

  const watchedPrice = watch('price_per_unit');
  const watchedMOQ = watch('moq');

  const onSubmit = async (data: QuotationFormData) => {
    if (!profile || !rfqId) return;

    try {
      await createQuotationMutation.mutateAsync({
        ...data,
        rfq_id: rfqId,
        supplier_id: profile.id,
      });
      
      toast.success('Quotation submitted successfully', {
        description: 'Your quotation is pending admin review.',
      });
      navigate('/supplier/dashboard');
    } catch (error: any) {
      toast.error('Failed to submit quotation', {
        description: error.message,
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Submit Quotation" subtitle="Provide your quote for this RFQ">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!canQuote) {
    return (
      <DashboardLayout title="Access Denied" subtitle="You cannot quote for this RFQ">
        <div className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-6">
              You are not authorized to submit a quotation for this RFQ.
            </p>
            <Link
              to="/supplier/dashboard"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Submit Quotation" subtitle="Provide your quote for this RFQ">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* RFQ Details */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{rfq?.title}</h4>
                    <p className="text-sm text-gray-600">{rfq?.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <p className="font-medium">{rfq?.quantity.toLocaleString()} {rfq?.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Target Price:</span>
                      <p className="font-medium">
                        {rfq?.target_price ? `$${rfq.target_price.toFixed(2)}` : 'Negotiable'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeline:</span>
                      <p className="font-medium">{rfq?.delivery_timeline || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>
                      <p className="font-medium">{rfq?.profiles?.company_name}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">{rfq?.description}</p>
                  </div>

                  {rfq?.additional_requirements && (
                    <div>
                      <span className="text-gray-500 text-sm">Additional Requirements:</span>
                      <p className="text-sm text-gray-700 mt-1">{rfq.additional_requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quotation Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 space-y-6">
                  {/* Pricing Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Pricing Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-700 mb-2">
                          Price per Unit (USD) *
                        </label>
                        <input
                          {...register('price_per_unit', { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="8.50"
                        />
                        {errors.price_per_unit && (
                          <p className="mt-1 text-sm text-red-600">{errors.price_per_unit.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="moq" className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Order Quantity
                        </label>
                        <input
                          {...register('moq', { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={rfq?.quantity.toString()}
                        />
                        {errors.moq && (
                          <p className="mt-1 text-sm text-red-600">{errors.moq.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Total Calculation */}
                    {watchedPrice && watchedMOQ && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <p className="text-green-800 font-medium">
                          Total Quote Value: ${(watchedPrice * watchedMOQ).toLocaleString()}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="lead_time_days" className="block text-sm font-medium text-gray-700 mb-2">
                          Lead Time (Days)
                        </label>
                        <input
                          {...register('lead_time_days', { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30"
                        />
                        {errors.lead_time_days && (
                          <p className="mt-1 text-sm text-red-600">{errors.lead_time_days.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="validity_days" className="block text-sm font-medium text-gray-700 mb-2">
                          Quote Validity (Days)
                        </label>
                        <input
                          {...register('validity_days', { valueAsNumber: true })}
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="15"
                        />
                        {errors.validity_days && (
                          <p className="mt-1 text-sm text-red-600">{errors.validity_days.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Terms
                        </label>
                        <select
                          {...register('payment_terms')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Payment Terms</option>
                          <option value="30% advance, 70% on shipment">30% advance, 70% on shipment</option>
                          <option value="50% advance, 50% on shipment">50% advance, 50% on shipment</option>
                          <option value="100% advance">100% advance</option>
                          <option value="Letter of Credit">Letter of Credit</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="shipping_terms" className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Terms
                        </label>
                        <select
                          {...register('shipping_terms')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Shipping Terms</option>
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
                          {...register('quality_guarantee')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="quality_guarantee" className="text-sm text-gray-700">
                          Quality guarantee provided
                        </label>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          {...register('sample_available')}
                          type="checkbox"
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
                      {...register('notes')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional information, bulk discounts, special offers, or clarifications..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate('/supplier/dashboard')}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !canQuote}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4" />
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
      </div>
    </DashboardLayout>
  );
};

export default SupplierQuote;