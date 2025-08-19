@@ .. @@
 import React from 'react';
 import { Link } from 'react-router-dom';
 import { Plus, FileText, Clock, CheckCircle, Eye } from 'lucide-react';
 import { useAuth } from '../../contexts/AuthContext';
 import { useRFQs } from '../../lib/queries';
 import DashboardLayout from '../../components/DashboardLayout';

 const BuyerDashboard = () => {
   const { profile } = useAuth();
   const { data: rfqs, isLoading } = useRFQs({ buyerId: profile?.id });

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

   if (isLoading) {
     return (
       <DashboardLayout title="Buyer Dashboard" subtitle="Manage your sourcing requests">
         <div className="p-6 flex items-center justify-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
       </DashboardLayout>
     );
   }

   return (
     <DashboardLayout title="Buyer Dashboard" subtitle="Manage your sourcing requests">
       <div className="p-6 space-y-6">
         {/* Welcome Section */}
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
           <h2 className="text-xl font-bold text-blue-900 mb-2">
             Welcome back, {profile?.full_name}
           </h2>
           <p className="text-blue-700 mb-4">
             Manage your sourcing requests and connect with verified Indian suppliers
           </p>
           <Link
             to="/buyer/create-rfq"
             className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
           >
             <Plus className="h-5 w-5" />
             <span>Create New RFQ</span>
           </Link>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-gray-600">Total RFQs</p>
                 <p className="text-2xl font-bold text-gray-900">{rfqs?.length || 0}</p>
               </div>
               <FileText className="h-8 w-8 text-blue-500" />
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-gray-600">Pending Approval</p>
                 <p className="text-2xl font-bold text-yellow-600">
                   {rfqs?.filter((rfq: any) => rfq.status === 'pending_approval').length || 0}
                 </p>
               </div>
               <Clock className="h-8 w-8 text-yellow-500" />
             </div>
           </div>
           
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-gray-600">Active RFQs</p>
                 <p className="text-2xl font-bold text-blue-600">
                   {rfqs?.filter((rfq: any) => ['approved', 'matched', 'quoting'].includes(rfq.status)).length || 0}
                 </p>
               </div>
               <CheckCircle className="h-8 w-8 text-blue-500" />
             </div>
           </div>

           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-gray-600">Completed</p>
                 <p className="text-2xl font-bold text-green-600">
                   {rfqs?.filter((rfq: any) => rfq.status === 'closed').length || 0}
                 </p>
               </div>
               <CheckCircle className="h-8 w-8 text-green-500" />
             </div>
           </div>
         </div>

         {/* RFQs Table */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
           <div className="px-6 py-4 border-b border-gray-200">
             <h3 className="text-lg font-semibold text-gray-900">Your RFQs</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Product
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Category
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Quantity
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Target Price
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Status
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     Created
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
                       <p className="text-sm font-medium text-gray-900">{rfq.title}</p>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">{rfq.category}</td>
                     <td className="px-6 py-4 text-sm text-gray-900">
                       {rfq.quantity.toLocaleString()} {rfq.unit}
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-900">
                       {rfq.target_price ? `$${rfq.target_price.toFixed(2)}` : 'N/A'}
                     </td>
                     <td className="px-6 py-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
                         {rfq.status.replace('_', ' ')}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-gray-500">
                       {new Date(rfq.created_at).toLocaleDateString()}
                     </td>
                     <td className="px-6 py-4">
                       <div className="flex space-x-2">
                         {rfq.status === 'quoting' && (
                           <Link
                             to={`/buyer/rfq/${rfq.id}/quotes`}
                             className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                           >
                             View Quotes
                           </Link>
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

         {rfqs?.length === 0 && (
           <div className="text-center py-12">
             <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
             <p className="text-gray-600 mb-6">
               Start by creating your first sourcing request
             </p>
             <Link
               to="/buyer/create-rfq"
               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
             >
               <Plus className="h-5 w-5" />
               <span>Create Your First RFQ</span>
             </Link>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

 export default BuyerDashboard;