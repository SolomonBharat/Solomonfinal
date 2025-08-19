@@ .. @@
 import React, { useState } from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { CheckCircle, X, Users, Eye, Clock, FileText } from 'lucide-react';
 import { useRFQs, useAdminApproveRFQ, useAdminAssignSuppliers, useSuppliers } from '../../lib/queries';
 import DashboardLayout from '../../components/DashboardLayout';
 import { toast } from 'sonner';

 const AdminRFQs = () => {
   const [selectedRFQ, setSelectedRFQ] = useState<any>(null);
   const [showAssignModal, setShowAssignModal] = useState(false);
   const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

   const { data: rfqs, isLoading } = useRFQs();
   const { data: suppliers } = useSuppliers({ verificationStatus: 'verified' });
   const approveRFQMutation = useAdminApproveRFQ();
   const assignSuppliersMutation = useAdminAssignSuppliers();

   const handleApproveRFQ = async (rfqId: string) => {
     try {
       await approveRFQMutation.mutateAsync(rfqId);
       toast.success('RFQ approved successfully');
     } catch (error: any) {
       toast.error('Failed to approve RFQ', {
         description: error.message,
       });
     }
   };

   const handleAssignSuppliers = async () => {
     if (!selectedRFQ || selectedSuppliers.length === 0) {
       toast.error('Please select at least one supplier');
       return;
     }

     try {
       await assignSuppliersMutation.mutateAsync({
         rfqId: selectedRFQ.id,
         supplierIds: selectedSuppliers,
       });
       toast.success(`Assigned ${selectedSuppliers.length} suppliers to RFQ`);
       setShowAssignModal(false);
       setSelectedSuppliers([]);
       setSelectedRFQ(null);
     } catch (error: any) {
       toast.error('Failed to assign suppliers', {
         description: error.message,
       });
     }
   };

   const getStatusBadge = (status: string) => {
     const badges = {
       pending_approval: 'bg-yellow-100 text-yellow-800',
       approved: 'bg-blue-100 text-blue-800',
       matched: 'bg-purple-100 text-purple-800',
       quoting: 'bg-green-100 text-green-800',
       closed: 'bg-gray-100 text-gray-800',
     };
     return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
   };

   const filteredSuppliers = suppliers?.filter((supplier: any) => 
     supplier.product_categories.includes(selectedRFQ?.category)
   ) || [];

   if (isLoading) {
     return (
       <DashboardLayout title="Manage RFQs" subtitle="Review and approve RFQs">
         <div className="p-6 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
       </DashboardLayout>
     );
   }

   return (
     <DashboardLayout title="Manage RFQs" subtitle="Review and approve RFQs">
       <div className="p-6 space-y-6">
         {/* RFQs Table */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">All RFQs</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     RFQ Details
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Buyer
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Category
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Quantity
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Actions
                   </th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {rfqs?.map((rfq: any) => (
                   <tr key={rfq.id} className="hover:bg-gray-50">
                     <td className="px-6 py-4">
                       <div>
                         <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                         <p className="text-xs text-gray-500">
                           Created {new Date(rfq.created_at).toLocaleDateString()}
                         </p>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {rfq.profiles?.company_name}
                         </p>
                         <p className="text-xs text-gray-500">{rfq.profiles?.full_name}</p>
                       </div>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">{rfq.category}</td>
                     <td className="px-6 py-4 text-sm text-gray-900">
                       {rfq.quantity.toLocaleString()} {rfq.unit}
                     </td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                         {rfq.status.replace('_', ' ')}
                       </span>
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex space-x-2">
                         {rfq.status === 'pending_approval' && (
                           <button
                             onClick={() => handleApproveRFQ(rfq.id)}
                             disabled={approveRFQMutation.isPending}
                             className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                           >
                             <CheckCircle className="h-4 w-4 inline mr-1" />
                             Approve
                           </button>
                         )}
                         {rfq.status === 'approved' && (
                           <button
                             onClick={() => {
                               setSelectedRFQ(rfq);
                               setShowAssignModal(true);
                             }}
                             className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                           >
                             <Users className="h-4 w-4 inline mr-1" />
                             Assign Suppliers
                           </button>
                         )}
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

         {/* Assign Suppliers Modal */}
         {showAssignModal && selectedRFQ && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
               <div className="px-6 py-4 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900">
                   Assign Suppliers to: {selectedRFQ.title}
                 </h3>
                 <p className="text-sm text-gray-600">Category: {selectedRFQ.category}</p>
               </div>
               
               <div className="p-6">
                 <div className="space-y-4 max-h-96 overflow-y-auto">
                   {filteredSuppliers.map((supplier: any) => (
                     <label key={supplier.id} className="flex items-center space-x-3 cursor-pointer">
                       <input
                         type="checkbox"
                         checked={selectedSuppliers.includes(supplier.id)}
                         onChange={(e) => {
                           if (e.target.checked) {
                             setSelectedSuppliers(prev => [...prev, supplier.id]);
                           } else {
                             setSelectedSuppliers(prev => prev.filter(id => id !== supplier.id));
                           }
                         }}
                         className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       />
                       <div>
                         <p className="text-sm font-medium text-gray-900">
                           {supplier.profiles?.company_name}
                         </p>
                         <p className="text-xs text-gray-500">
                           {supplier.profiles?.full_name} • {supplier.years_in_business} years exp.
                         </p>
                       </div>
                     </label>
                   ))}
                 </div>
               </div>
               
               <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                 <button
                   onClick={() => {
                     setShowAssignModal(false);
                     setSelectedSuppliers([]);
                     setSelectedRFQ(null);
                   }}
                   className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleAssignSuppliers}
                   disabled={selectedSuppliers.length === 0 || assignSuppliersMutation.isPending}
                   className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                 >
                   Assign {selectedSuppliers.length} Supplier{selectedSuppliers.length !== 1 ? 's' : ''}
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

 export default AdminRFQs;