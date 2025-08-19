@@ .. @@
 import React from 'react';
 import { CheckCircle, X, Eye, DollarSign, Clock } from 'lucide-react';
 import { usePendingQuotations, useAdminSetQuotationStatus } from '../../lib/queries';
 import DashboardLayout from '../../components/DashboardLayout';
 import { toast } from 'sonner';

 const AdminQuotationModeration = () => {
   const { data: quotations, isLoading } = usePendingQuotations();
   const setQuotationStatusMutation = useAdminSetQuotationStatus();

   const handleSetQuotationStatus = async (quoteId: string, status: 'approved_for_buyer' | 'rejected') => {
     try {
       await setQuotationStatusMutation.mutateAsync({ quoteId, status });
       toast.success(`Quotation ${status === 'approved_for_buyer' ? 'approved' : 'rejected'} successfully`);
     } catch (error: any) {
       toast.error('Failed to update quotation status', {
         description: error.message,
       });
     }
   };

   if (isLoading) {
     return (
       <DashboardLayout title="Quotation Moderation" subtitle="Review and approve quotations">
         <div className="p-6 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
       </DashboardLayout>
     );
   }

   return (
     <DashboardLayout title="Quotation Moderation" subtitle="Review and approve quotations">
       <div className="p-6 space-y-6">
         {/* Quotations Table */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">Pending Quotations</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     RFQ
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Supplier
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Price/Unit
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     MOQ
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Lead Time
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Submitted
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {quotations?.map((quotation: any) => (
                   <tr key={quotation.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4">
                       <div>
                         <p className="text-sm font-medium text-gray-900">{quotation.rfqs?.title}</p>
                         <p className="text-xs text-gray-500">{quotation.rfqs?.category}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {quotation.profiles?.company_name}
                         </p>
                         <p className="text-xs text-gray-500">{quotation.profiles?.full_name}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex items-center">
                         <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                         <span className="text-sm font-medium text-gray-900">
                           {quotation.price_per_unit.toFixed(2)}
                         </span>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">
                       {quotation.moq?.toLocaleString() || 'N/A'}
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">
                       {quotation.lead_time_days ? `${quotation.lead_time_days} days` : 'N/A'}
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-500">
                       {new Date(quotation.submitted_at).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex space-x-2">
                         <button
                           onClick={() => handleSetQuotationStatus(quotation.id, 'approved_for_buyer')}
                           disabled={setQuotationStatusMutation.isPending}
                           className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                         >
                           <CheckCircle className="h-4 w-4 inline mr-1" />
                           Approve
                         </button>
                         <button
                           onClick={() => handleSetQuotationStatus(quotation.id, 'rejected')}
                           disabled={setQuotationStatusMutation.isPending}
                           className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                         >
                           <X className="h-4 w-4 inline mr-1" />
                           Reject
                         </button>
                         <button className="text-gray-600 hover:text-gray-800">
                           <Eye className="h-4 w-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>

         {quotations?.length === 0 && (
           <div className="text-center py-12">
             <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No pending quotations</h3>
             <p className="text-gray-600">Quotations awaiting review will appear here.</p>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

 export default AdminQuotationModeration;