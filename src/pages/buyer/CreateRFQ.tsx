@@ .. @@
 import React from 'react';
 import { useNavigate } from 'react-router-dom';
 import { useForm } from 'react-hook-form';
 import { zodResolver } from '@hookform/resolvers/zod';
 import { Loader2 } from 'lucide-react';
 import { useAuth } from '../../contexts/AuthContext';
 import { useCategories, useCreateRFQ } from '../../lib/queries';
 import { rfqSchema, RFQFormData } from '../../schemas';
 import DashboardLayout from '../../components/DashboardLayout';
 import { toast } from 'sonner';

 const CreateRFQ = () => {
   const { profile } = useAuth();
   const navigate = useNavigate();
   const { data: categories } = useCategories();
   const createRFQMutation = useCreateRFQ();

   const {
     register,
     handleSubmit,
     formState: { errors, isSubmitting },
   } = useForm<RFQFormData>({
     resolver: zodResolver(rfqSchema),
   });

   const onSubmit = async (data: RFQFormData) => {
     if (!profile) return;

     try {
       await createRFQMutation.mutateAsync({
         ...data,
         buyer_id: profile.id,
         expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
       });
       
       toast.success('RFQ created successfully', {
         description: 'Your RFQ is pending admin approval.',
       });
       navigate('/buyer/dashboard');
     } catch (error: any) {
       toast.error('Failed to create RFQ', {
         description: error.message,
       });
     }
   };

   const units = [
     'pieces', 'kg', 'tons', 'meters', 'liters', 'boxes', 'cartons', 'sets', 'pairs', 'dozens'
   ];

   return (
     <DashboardLayout title="Create RFQ" subtitle="Submit a new sourcing request">
       <div className="p-6">
         <div className="max-w-4xl mx-auto">
           <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200">
             <div className="p-6 space-y-6">
               {/* Product Information */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                       Product Title *
                     </label>
                     <input
                       {...register('title')}
                       type="text"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="e.g., Organic Cotton T-Shirts"
                     />
                     {errors.title && (
                       <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                       Category *
                     </label>
                     <select
                       {...register('category')}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">Select Category</option>
                       {categories?.map(category => (
                         <option key={category.id} value={category.name}>{category.name}</option>
                       ))}
                     </select>
                     {errors.category && (
                       <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                     )}
                   </div>
                 </div>

                 <div className="mt-4">
                   <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                     Product Description *
                   </label>
                   <textarea
                     {...register('description')}
                     rows={4}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Provide detailed specifications, materials, colors, sizes, etc."
                   />
                   {errors.description && (
                     <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                   )}
                 </div>
               </div>

               {/* Quantity & Pricing */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantity & Pricing</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                     <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                       Quantity *
                     </label>
                     <input
                       {...register('quantity', { valueAsNumber: true })}
                       type="number"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="5000"
                     />
                     {errors.quantity && (
                       <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                       Unit *
                     </label>
                     <select
                       {...register('unit')}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">Select Unit</option>
                       {units.map(unit => (
                         <option key={unit} value={unit}>{unit}</option>
                       ))}
                     </select>
                     {errors.unit && (
                       <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="target_price" className="block text-sm font-medium text-gray-700 mb-2">
                       Target Price (USD)
                     </label>
                     <input
                       {...register('target_price', { valueAsNumber: true })}
                       type="number"
                       step="0.01"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="8.50"
                     />
                     {errors.target_price && (
                       <p className="mt-1 text-sm text-red-600">{errors.target_price.message}</p>
                     )}
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                   <div>
                     <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-2">
                       Maximum Price (USD)
                     </label>
                     <input
                       {...register('max_price', { valueAsNumber: true })}
                       type="number"
                       step="0.01"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="10.00"
                     />
                     {errors.max_price && (
                       <p className="mt-1 text-sm text-red-600">{errors.max_price.message}</p>
                     )}
                   </div>

                   <div>
                     <label htmlFor="delivery_timeline" className="block text-sm font-medium text-gray-700 mb-2">
                       Delivery Timeline
                     </label>
                     <select
                       {...register('delivery_timeline')}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">Select Timeline</option>
                       <option value="30 days">30 days</option>
                       <option value="45 days">45 days</option>
                       <option value="60 days">60 days</option>
                       <option value="90 days">90 days</option>
                       <option value="Negotiable">Negotiable</option>
                     </select>
                   </div>
                 </div>
               </div>

               {/* Additional Requirements */}
               <div>
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Standards</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label htmlFor="shipping_terms" className="block text-sm font-medium text-gray-700 mb-2">
                       Shipping Terms
                     </label>
                     <select
                       {...register('shipping_terms')}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     >
                       <option value="">Select Terms</option>
                       <option value="FOB">FOB (Free on Board)</option>
                       <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                       <option value="CFR">CFR (Cost & Freight)</option>
                       <option value="EXW">EXW (Ex Works)</option>
                     </select>
                   </div>

                   <div>
                     <label htmlFor="quality_standards" className="block text-sm font-medium text-gray-700 mb-2">
                       Quality Standards
                     </label>
                     <input
                       {...register('quality_standards')}
                       type="text"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="e.g., ISO 9001, GOTS, BIS"
                     />
                   </div>

                   <div>
                     <label htmlFor="certifications_needed" className="block text-sm font-medium text-gray-700 mb-2">
                       Required Certifications
                     </label>
                     <input
                       {...register('certifications_needed')}
                       type="text"
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       placeholder="e.g., CE, FDA, CPSIA"
                     />
                   </div>

                   <div className="flex items-center">
                     <input
                       {...register('open_for_bidding')}
                       type="checkbox"
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                     />
                     <label htmlFor="open_for_bidding" className="ml-2 text-sm text-gray-700">
                       Open for bidding (allow all qualified suppliers to quote)
                     </label>
                   </div>
                 </div>

                 <div className="mt-4">
                   <label htmlFor="additional_requirements" className="block text-sm font-medium text-gray-700 mb-2">
                     Additional Requirements
                   </label>
                   <textarea
                     {...register('additional_requirements')}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     placeholder="Any other specific requirements, packaging details, special instructions..."
                   />
                 </div>
               </div>
             </div>

             {/* Form Actions */}
             <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
               <button
                 type="button"
                 onClick={() => navigate('/buyer/dashboard')}
                 className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={isSubmitting}
                 className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
               >
                 {isSubmitting ? (
                   <>
                     <Loader2 className="animate-spin h-4 w-4" />
                     <span>Submitting...</span>
                   </>
                 ) : (
                   <span>Submit RFQ</span>
                 )}
               </button>
             </div>
           </form>
         </div>
       </div>
     </DashboardLayout>
   );
 };

 export default CreateRFQ;