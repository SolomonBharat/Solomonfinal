@@ .. @@
 import React, { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { FileText, Send, Eye, MapPin, DollarSign, Clock } from 'lucide-react';
 import { useAuth } from '../../contexts/AuthContext';
 import { useSupplierRFQs, useOpenBiddingRFQs } from '../../lib/queries';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '../../lib/supabase';
 import DashboardLayout from '../../components/DashboardLayout';

 const SupplierDashboard = () => {
   const { profile } = useAuth();
   const [activeTab, setActiveTab] = useState<'assigned' | 'discover'>('assigned');

   // Get supplier data to access categories
   const { data: supplierData } = useQuery({
     queryKey: ['supplierProfile', profile?.id],
     queryFn: async () => {
       if (!profile?.id) return null;
       const { data, error } = await supabase
         .from('suppliers')
         .select('*')
         .eq('id', profile.id)
         .single();
       
       if (error) throw error;
       return data;
     },
     enabled: !!profile?.id,
   });

   // Assigned RFQs
   const { data: assignedRFQs, isLoading: loadingAssigned } = useSupplierRFQs(profile?.id);

   // Open bidding RFQs
   const { data: openRFQs, isLoading: loadingOpen } = useOpenBiddingRFQs(
     supplierData?.product_categories
   );

   const getStatusBadge = (status: string) => {
     const badges = {
       approved: 'bg-blue-100 text-blue-800',
       matched: 'bg-purple-100 text-purple-800',
       quoting: 'bg-green-100 text-green-800',
     };
     return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
   };

   const RFQCard = ({ rfq, isAssigned }: { rfq: any; isAssigned: boolean }) => (
     <div className="bg-white rounded-lg shadow-sm border border-gray-200">
       <div className="p-6">
         <div className="flex justify-between items-start mb-4">
           <div>
             <h3 className="text-lg font-semibold text-gray-900 mb-1">{rfq.title}</h3>
             <div className="flex items-center text-gray-600 text-sm">
               <MapPin className="h-4 w-4 mr-1" />
               <span>{rfq.profiles?.company_name} • {rfq.profiles?.country}</span>
             </div>
           </div>
           <div className="flex flex-col items-end space-y-2">
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rfq.status)}`}>
               {rfq.status}
             </span>
             {isAssigned && (
               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                 Assigned
               </span>
             )}
           </div>
         </div>

         {/* Key Details */}
         <div className="grid grid-cols-2 gap-4 mb-4">
           <div>
             <span className="text-gray-500 text-sm">Quantity:</span>
             <p className="font-medium text-sm">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
           </div>
           <div>
             <span className="text-gray-500 text-sm">Target Price:</span>
             <p className="font-medium text-sm">
               {rfq.target_price ? `$${rfq.target_price.toFixed(2)}` : 'Negotiable'}
             </p>
           </div>
           <div>
             <span className="text-gray-500 text-sm">Timeline:</span>
             <p className="font-medium text-sm">{rfq.delivery_timeline || 'Not specified'}</p>
           </div>
           <div>
             <span className="text-gray-500 text-sm">Category:</span>
             <p className="font-medium text-sm">{rfq.category}</p>
           </div>
         </div>

         {/* Description */}
         <div className="mb-4">
           <p className="text-sm text-gray-700 line-clamp-2">{rfq.description}</p>
         </div>

         {/* Actions */}
         <div className="flex space-x-3">
           <Link
             to={`/supplier/rfq/${rfq.id}/quote`}
             className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center justify-center space-x-1"
           >
             <Send className="h-4 w-4" />
             <span>Submit Quote</span>
           </Link>
           <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
             <Eye className="h-4 w-4" />
           </button>
         </div>
       </div>
     </div>
   );

   return (
     <DashboardLayout title="Supplier Dashboard" subtitle="Manage your quotations and opportunities">
       <div className="p-6 space-y-6">
         {/* Welcome Section */}
         <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6">
           <h2 className="text-xl font-bold text-green-900 mb-2">
             Welcome, {profile?.full_name}
           </h2>
           <p className="text-green-700 mb-2">
             {supplierData?.verification_status === 'verified' ? (
               '✅ Your account is verified. You can now participate in RFQs.'
             ) : supplierData?.verification_status === 'pending' ? (
               '⏳ Your account is pending verification. You\'ll be able to participate once approved.'
             ) : (
               '❌ Your account verification was rejected. Please contact support.'
             )}
           </p>
           {supplierData?.product_categories && (
             <p className="text-green-600 text-sm">
               Categories: {supplierData.product_categories.join(', ')}
             </p>
           )}
         </div>

         {/* Tabs */}
         <div className="border-b border-gray-200">
           <nav className="-mb-px flex space-x-8">
             <button
               onClick={() => setActiveTab('assigned')}
               className={`py-2 px-1 border-b-2 font-medium text-sm ${
                 activeTab === 'assigned'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               Assigned RFQs ({assignedRFQs?.length || 0})
             </button>
             <button
               onClick={() => setActiveTab('discover')}
               className={`py-2 px-1 border-b-2 font-medium text-sm ${
                 activeTab === 'discover'
                   ? 'border-blue-500 text-blue-600'
                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
               }`}
             >
               Open Bidding ({openRFQs?.length || 0})
             </button>
           </nav>
         </div>

         {/* Tab Content */}
         {activeTab === 'assigned' && (
           <div>
             {loadingAssigned ? (
               <div className="flex items-center justify-center py-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
             ) : assignedRFQs && assignedRFQs.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {assignedRFQs.map((rfq: any) => (
                   <RFQCard key={rfq.id} rfq={rfq} isAssigned={true} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-12">
                 <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned RFQs</h3>
                 <p className="text-gray-600">
                   RFQs assigned to you by admin will appear here.
                 </p>
               </div>
             )}
           </div>
         )}

         {activeTab === 'discover' && (
           <div>
             {loadingOpen ? (
               <div className="flex items-center justify-center py-12">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
             ) : openRFQs && openRFQs.length > 0 ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {openRFQs.map((rfq: any) => (
                   <RFQCard key={rfq.id} rfq={rfq} isAssigned={false} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-12">
                 <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No open bidding RFQs</h3>
                 <p className="text-gray-600">
                   Open bidding RFQs matching your categories will appear here.
                 </p>
               </div>
             )}
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };

 export default SupplierDashboard;