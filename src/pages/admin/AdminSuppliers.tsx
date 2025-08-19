@@ .. @@
 import React from 'react';
-import { CheckCircle, X, Eye, Building, MapPin, Award } from 'lucide-react';
+import { CheckCircle, X, Eye, Building, MapPin, Award } from 'lucide-react';
 import { useSuppliers, useAdminVerifySupplier } from '../../lib/queries';
 import DashboardLayout from '../../components/DashboardLayout';
 import { toast } from 'sonner';

 const AdminSuppliers = () => {
   const { data: suppliers, isLoading } = useSuppliers();
   const verifySupplierMutation = useAdminVerifySupplier();

   const handleVerifySupplier = async (supplierId: string, status: 'verified' | 'rejected') => {
     try {
       await verifySupplierMutation.mutateAsync({ supplierId, status });
       toast.success(`Supplier ${status} successfully`);
     } catch (error: any) {
       toast.error(`Failed to ${status} supplier`, {
         description: error.message,
       });
     }
   };

   const getStatusBadge = (status: string) => {
     const badges = {
       pending: 'bg-yellow-100 text-yellow-800',
       verified: 'bg-green-100 text-green-800',
       rejected: 'bg-red-100 text-red-800',
     };
     return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
   };

   if (isLoading) {
     return (
       <DashboardLayout title="Manage Suppliers" subtitle="Review and verify suppliers">
         <div className="p-6 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
       </DashboardLayout>
     );
   }

   return (
     <DashboardLayout title="Manage Suppliers" subtitle="Review and verify suppliers">
       <div className="p-6 space-y-6">
         {/* Suppliers Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {suppliers?.map((supplier: any) => (
             <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
               <div className="p-6">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <div className="flex items-center space-x-2">
                       <h3 className="text-lg font-semibold text-gray-900">
                         {supplier.profiles?.company_name}
                       </h3>
                       {supplier.verification_status === 'verified' && (
                         <CheckCircle className="h-4 w-4 text-green-500" />
                       )}
                     </div>
                     <p className="text-sm text-gray-600">{supplier.profiles?.full_name}</p>
                     <div className="flex items-center text-gray-500 text-sm mt-1">
                       <MapPin className="h-3 w-3 mr-1" />
                       <span>{supplier.profiles?.country}</span>
                     </div>
                   </div>
                   
                   <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(supplier.verification_status)}`}>
                     {supplier.verification_status}
                   </span>
                 </div>

                 {/* Business Details */}
                 <div className="space-y-2 mb-4">
                   <div className="flex items-center text-gray-600 text-sm">
                     <Award className="h-3 w-3 mr-1" />
                     <span>{supplier.years_in_business} years experience</span>
                   </div>
                   <div className="text-sm">
                     <span className="text-gray-500">Turnover:</span>
                     <span className="ml-1 text-gray-900">{supplier.annual_turnover}</span>
                   </div>
                   <div className="text-sm">
                     <span className="text-gray-500">Employees:</span>
                     <span className="ml-1 text-gray-900">{supplier.employee_count}</span>
                   </div>
                 </div>

                 {/* Categories */}
                 <div className="mb-4">
                   <p className="text-sm text-gray-500 mb-1">Product Categories:</p>
                   <div className="flex flex-wrap gap-1">
                     {supplier.product_categories.map((category: string, index: number) => (
                       <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                         {category}
                       </span>
                     ))}
                   </div>
                 </div>

                 {/* Certifications */}
                 <div className="mb-4">
                   <p className="text-sm text-gray-500 mb-1">Certifications:</p>
                   <div className="flex flex-wrap gap-1">
                     {supplier.certifications.map((cert: string, index: number) => (
                       <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                         {cert}
                       </span>
                     ))}
                   </div>
                 </div>

                 {/* Contact */}
                 <div className="text-sm text-gray-600 mb-4">
                   <p>📧 {supplier.profiles?.email}</p>
                   <p>📞 {supplier.profiles?.phone}</p>
                 </div>

                 {/* Actions */}
                 <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                   <div className="flex space-x-2">
                     {supplier.verification_status === 'pending' && (
                       <>
                         <button
                           onClick={() => handleVerifySupplier(supplier.id, 'verified')}
                           disabled={verifySupplierMutation.isPending}
                           className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                         >
                           Verify
                         </button>
                         <button
                           onClick={() => handleVerifySupplier(supplier.id, 'rejected')}
                           disabled={verifySupplierMutation.isPending}
                           className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                         >
                           Reject
                         </button>
                       </>
                     )}
                     <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                       <Eye className="h-3 w-3 inline mr-1" />
                       View Details
                     </button>
                   </div>
                   <p className="text-xs text-gray-400">
                     Joined: {new Date(supplier.created_at).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             </div>
           ))}
         </div>

         {suppliers?.length === 0 && (
           <div className="text-center py-12">
             <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
             <p className="text-gray-600">Suppliers will appear here once they register.</p>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

 export default AdminSuppliers;