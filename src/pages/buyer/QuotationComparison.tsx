import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Package, CheckCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuotations } from '../../lib/queries';
import DashboardLayout from '../../components/DashboardLayout';
import { toast } from 'sonner';

const QuotationComparison = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const queryClient = useQueryClient();
  
  const { data: quotations, isLoading } = useQuotations(rfqId);

  // Fetch RFQ details
  const { data: rfq } = useQuery({
    queryKey: ['rfq', rfqId],
    queryFn: async () => {
      if (!rfqId) throw new Error('RFQ ID is required');
      
      const { data, error } = await supabase
        .from('rfqs')
        .select('*')
        .eq('id', rfqId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!rfqId,
  });

  // Request sample mutation
  const requestSampleMutation = useMutation({
    mutationFn: async ({ quotationId, supplierId }: { quotationId: string; supplierId: string }) => {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert({
          rfq_id: rfqId!,
          quotation_id: quotationId,
          buyer_id: rfq?.buyer_id!,
          supplier_id: supplierId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Sample request submitted', {
        description: 'Admin will review and approve your sample request.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to request sample', {
        description: error.message,
      });
    },
  });

  // Accept quotation mutation (creates order)
  const acceptQuotationMutation = useMutation({
    mutationFn: async (quotation: any) => {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          rfq_id: rfqId!,
          quotation_id: quotation.id,
          buyer_id: rfq?.buyer_id!,
          supplier_id: quotation.supplier_id,
          quantity: quotation.moq || rfq?.quantity!,
          unit_price: quotation.price_per_unit,
          payment_terms: quotation.payment_terms,
          delivery_terms: quotation.shipping_terms,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Close RFQ
      const { error: rfqError } = await supabase
        .from('rfqs')
        .update({ status: 'closed' })
        .eq('id', rfqId!);
      
      if (rfqError) throw rfqError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('Quotation accepted', {
        description: 'Order has been created and RFQ closed.',
      });
    },
    onError: (error: any) => {
      toast.error('Failed to accept quotation', {
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Compare Quotations" subtitle="Review and compare supplier quotes">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Compare Quotations" subtitle="Review and compare supplier quotes">
      <div className="p-6 space-y-6">
        {/* RFQ Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ: {rfq?.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-500">Category:</span>
              <p className="font-medium">{rfq?.category}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Quantity:</span>
              <p className="font-medium">{rfq?.quantity.toLocaleString()} {rfq?.unit}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Target Price:</span>
              <p className="font-medium">
                {rfq?.target_price ? `$${rfq.target_price.toFixed(2)}` : 'Negotiable'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Timeline:</span>
              <p className="font-medium">{rfq?.delivery_timeline || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Quotations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quotations?.map((quotation: any) => (
            <div key={quotation.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                {/* Supplier Info */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {quotation.profiles?.company_name}
                    </h4>
                    <p className="text-sm text-gray-600">{quotation.profiles?.full_name}</p>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.8</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${quotation.price_per_unit.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">per unit</p>
                  </div>
                </div>

                {/* Quote Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">MOQ:</span>
                    <span className="text-sm font-medium">{quotation.moq?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Lead Time:</span>
                    <span className="text-sm font-medium">
                      {quotation.lead_time_days ? `${quotation.lead_time_days} days` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Payment Terms:</span>
                    <span className="text-sm font-medium">{quotation.payment_terms || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Value:</span>
                    <span className="text-sm font-bold text-green-600">
                      ${((quotation.moq || rfq?.quantity || 0) * quotation.price_per_unit).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="flex space-x-4 mb-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      quotation.quality_guarantee ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">Quality Guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      quotation.sample_available ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">Sample Available</span>
                  </div>
                </div>

                {/* Notes */}
                {quotation.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{quotation.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3">
                  {quotation.sample_available && (
                    <button
                      onClick={() => requestSampleMutation.mutate({
                        quotationId: quotation.id,
                        supplierId: quotation.supplier_id,
                      })}
                      disabled={requestSampleMutation.isPending}
                      className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-md text-sm hover:bg-orange-700 disabled:opacity-50"
                    >
                      Request Sample
                    </button>
                  )}
                  <button
                    onClick={() => acceptQuotationMutation.mutate(quotation)}
                    disabled={acceptQuotationMutation.isPending}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {quotations?.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations available</h3>
            <p className="text-gray-600">
              Approved quotations for this RFQ will appear here.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuotationComparison;