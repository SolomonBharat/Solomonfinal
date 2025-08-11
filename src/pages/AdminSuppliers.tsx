import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle, 
  X, 
  Eye, 
  Mail,
  Phone,
  Building,
  Award
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  categories: string[];
  rating: number;
  total_orders: number;
  years_experience: number;
  certifications: string[];
  verified: boolean;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joined_date: string;
  last_active: string;
}

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'Supplier 1',
      contact_person: 'Rajesh Kumar',
      email: 'supplier1@example.com',
      phone: '+91 98765 43210',
      location: {
        city: 'Tirupur',
        state: 'Tamil Nadu',
        country: 'India'
      },
      categories: ['Textiles & Apparel', 'Organic Cotton'],
      rating: 4.8,
      total_orders: 156,
      years_experience: 15,
      certifications: ['GOTS', 'OEKO-TEX', 'ISO 9001'],
      verified: true,
      status: 'active',
      joined_date: '2020-03-15',
      last_active: '2025-01-20'
    },
    {
      id: '2',
      name: 'Supplier 2',
      contact_person: 'Priya Sharma',
      email: 'supplier2@example.com',
      phone: '+91 98876 54321',
      location: {
        city: 'Cochin',
        state: 'Kerala',
        country: 'India'
      },
      categories: ['Spices & Food Products', 'Organic Products'],
      rating: 4.6,
      total_orders: 203,
      years_experience: 12,
      certifications: ['FSSAI', 'Organic India', 'ISO 22000'],
      verified: true,
      status: 'active',
      joined_date: '2019-08-20',
      last_active: '2025-01-19'
    },
    {
      id: '3',
      name: 'Supplier 3',
      contact_person: 'Amit Patel',
      email: 'supplier3@example.com',
      phone: '+91 97654 32109',
      location: {
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India'
      },
      categories: ['Handicrafts & Home Decor', 'Traditional Arts'],
      rating: 4.4,
      total_orders: 89,
      years_experience: 8,
      certifications: ['Handicrafts Export Corporation', 'GI Tagged'],
      verified: false,
      status: 'pending',
      joined_date: '2025-01-10',
      last_active: '2025-01-18'
    },
    {
      id: '4',
      name: 'Supplier 4',
      contact_person: 'Suresh Reddy',
      email: 'supplier4@example.com',
      phone: '+91 96543 21098',
      location: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India'
      },
      categories: ['Electronics & Components', 'IoT Devices'],
      rating: 4.2,
      total_orders: 67,
      years_experience: 6,
      certifications: ['CE', 'FCC', 'ISO 14001'],
      verified: true,
      status: 'inactive',
      joined_date: '2021-11-05',
      last_active: '2024-12-15'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleVerify = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, verified: true, status: 'active' as const } 
        : supplier
    ));
  };

  const handleSuspend = (supplierId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, status: 'suspended' as const } 
        : supplier
    ));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges];
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-900 font-medium">Supplier Network</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Supplier Network</h1>
            <p className="text-gray-600">
              Manage and monitor your verified supplier network
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {suppliers.filter(s => s.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Verification</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {suppliers.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <X className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>

          {/* Suppliers Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => handleSupplierSelect(supplier.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                          {supplier.verified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                        <div className="flex items-center text-gray-500 text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{supplier.location.city}, {supplier.location.state}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 ml-1">
                        {supplier.rating}
                      </span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-600">
                      {supplier.total_orders} orders
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Award className="h-3 w-3 mr-1" />
                      {supplier.years_experience} years
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.categories.map((category, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Certifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.certifications.map((cert, index) => (
                        <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center space-x-4 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{supplier.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      {!supplier.verified && supplier.status === 'pending' && (
                        <button
                          onClick={() => handleVerify(supplier.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Verify
                        </button>
                      )}
                      {supplier.status === 'active' && (
                        <button
                          onClick={() => handleSuspend(supplier.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Suspend
                        </button>
                      )}
                      <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                        <Eye className="h-3 w-3 inline mr-1" />
                        View Profile
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Active: {supplier.last_active}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedSuppliers.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-blue-800">
                  {selectedSuppliers.length} supplier{selectedSuppliers.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Bulk Verify
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700">
                    Bulk Suspend
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSuppliers;