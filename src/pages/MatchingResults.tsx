import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Award, Star, MessageCircle, CheckCircle } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  years_experience: number;
  moq: string;
  lead_time: string;
  specialization: string[];
  certifications: string[];
  match_score: number;
  verified: boolean;
}

const MatchingResults = () => {
  const { rfqId } = useParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    // Load onboarded suppliers that match the RFQ category
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const currentRFQ = userRFQs.find((rfq: any) => 
      rfq.id === rfqId
    );
    
    if (currentRFQ) {
      const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
      const matchingSuppliers = onboardedSuppliers
        .filter((supplier: any) => {
          const categories = supplier.productCategories || supplier.product_categories || [];
          return categories.includes(currentRFQ.category);
        }
        )
        .map((supplier: any) => ({
          id: supplier.id,
          name: supplier.contactPerson || supplier.contact_person,
          location: supplier.address?.split(',').slice(0, 2).join(', ') || 'India',
          rating: 4.5,
          years_experience: parseInt(supplier.yearsInBusiness || supplier.years_in_business) || 0,
          moq: supplier.minimumOrderQuantity || supplier.minimum_order_quantity || '1,000 pieces',
          lead_time: '25-30 days',
          specialization: supplier.productCategories || supplier.product_categories || [],
          certifications: supplier.certifications || [],
          match_score: 85 + Math.floor(Math.random() * 15), // 85-100% match
          verified: supplier.verified || false
        }));
      
      setSuppliers(matchingSuppliers);
    }
  }, [rfqId]);

  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleRequestQuotes = () => {
    // In real app, this would send quote requests to selected suppliers
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier to request quotes from.');
      return;
    }
    
    // Update RFQ status to show quotations are being requested
    const userRFQs = JSON.parse(localStorage.getItem('user_rfqs') || '[]');
    const updatedRFQs = userRFQs.map((rfq: any) => 
      rfq.id === rfqId ? { ...rfq, status: 'quoted', quotations_count: selectedSuppliers.length } : rfq
    );
    localStorage.setItem('user_rfqs', JSON.stringify(updatedRFQs));
    
    alert(`Quote requests sent to ${selectedSuppliers.length} supplier${selectedSuppliers.length > 1 ? 's' : ''}! You'll receive quotations within 2-3 business days.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Matched Suppliers</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Matched Suppliers</h1>
            <p className="text-gray-600">
              We found {suppliers.length} verified suppliers that match your requirements for <strong>Organic Cotton T-Shirts</strong>
            </p>
          </div>

          {/* RFQ Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your RFQ Summary</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Product:</span>
                <p className="font-medium">Organic Cotton T-Shirts</p>
              </div>
              <div>
                <span className="text-gray-500">Quantity:</span>
                <p className="font-medium">5,000 pieces</p>
              </div>
              <div>
                <span className="text-gray-500">Target Price:</span>
                <p className="font-medium">$8.50 per piece</p>
              </div>
              <div>
                <span className="text-gray-500">Delivery:</span>
                <p className="font-medium">30 days</p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {selectedSuppliers.length > 0 && 
                `${selectedSuppliers.length} supplier${selectedSuppliers.length > 1 ? 's' : ''} selected`
              }
            </p>
            <button
              onClick={handleRequestQuotes}
              disabled={selectedSuppliers.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Request Quotes ({selectedSuppliers.length})
            </button>
          </div>

          {/* Suppliers Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Match Score Badge */}
                <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800 font-medium text-sm">
                      {supplier.match_score}% Match
                    </span>
                    {supplier.verified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {supplier.name.split(' ')[0]}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {supplier.location}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSupplierSelect(supplier.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {/* Rating & Experience */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">
                        {supplier.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Award className="h-4 w-4 mr-1" />
                      {supplier.years_experience} years exp.
                    </div>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-500 text-sm">MOQ:</span>
                      <p className="font-medium text-sm">{supplier.moq}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Lead Time:</span>
                      <p className="font-medium text-sm">{supplier.lead_time}</p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Specialization:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supplier.specialization.map((spec, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Certifications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {supplier.certifications.map((cert, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => alert(`📋 SUPPLIER DETAILS\n\n👤 Supplier: ${supplier.name.split(' ')[0]}\n📍 Location: ${supplier.location}\n⭐ Rating: ${supplier.rating}/5\n🏆 Experience: ${supplier.years_experience} years\n📦 MOQ: ${supplier.moq}\n⏰ Lead Time: ${supplier.lead_time}\n\n🎯 Specializations:\n${supplier.specialization.join(', ')}\n\n🏅 Certifications:\n${supplier.certifications.join(', ')}\n\n💬 Contact through platform messaging only`)}
                      className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-100"
                    >
                      View Details
                    </button>
                    <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select the suppliers you're interested in and click "Request Quotes"</li>
              <li>• Our team will facilitate the quotation process with selected suppliers</li>
              <li>• You'll receive detailed quotations within 2-3 business days</li>
              <li>• Compare quotes and proceed with your preferred supplier</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchingResults;