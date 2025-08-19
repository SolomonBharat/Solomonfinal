import React from 'react';
import { MapPin, Star, Award, CheckCircle, Mail, Phone, Building } from 'lucide-react';

interface SupplierCardProps {
  supplier: {
    id: string;
    name: string;
    company: string;
    location: string;
    email: string;
    phone: string;
    rating: number;
    verified: boolean;
    categories: string[];
    certifications: string[];
    years_experience: number;
    moq: string;
    lead_time: string;
  };
  onSelect?: (supplierId: string) => void;
  selected?: boolean;
  showContact?: boolean;
}

const SupplierCard: React.FC<SupplierCardProps> = ({ 
  supplier, 
  onSelect, 
  selected = false,
  showContact = false 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
    }`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(supplier.id)}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                {supplier.verified && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">Verified Supplier</p>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{supplier.location}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-900 ml-1">
                {supplier.rating}
              </span>
            </div>
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Award className="h-3 w-3 mr-1" />
              <span>{supplier.years_experience} years</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {showContact && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">📞 Contact Details</h5>
            <div className="space-y-1 text-sm">
              <div className="flex items-center text-blue-800">
                <Mail className="h-3 w-3 mr-2" />
                <span>{supplier.email}</span>
              </div>
              <div className="flex items-center text-blue-800">
                <Phone className="h-3 w-3 mr-2" />
                <span>{supplier.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* Business Details */}
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

        {/* Categories */}
        <div className="mb-4">
          <span className="text-gray-500 text-sm">Specialization:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {supplier.categories.slice(0, 3).map((category, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {category}
              </span>
            ))}
            {supplier.categories.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                +{supplier.categories.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-4">
          <span className="text-gray-500 text-sm">Certifications:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {supplier.certifications.slice(0, 3).map((cert, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {cert}
              </span>
            ))}
            {supplier.certifications.length > 3 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                +{supplier.certifications.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;