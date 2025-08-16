import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Users, FileText, Phone } from 'lucide-react';

const WorkflowDocumentation = () => {
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
            <span className="text-gray-900 font-medium">Workflow Documentation</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sample Request & Procurement Workflow</h1>
            <p className="text-gray-600">
              Comprehensive process documentation for admin team operations
            </p>
          </div>

          {/* Process Flow Diagram */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Process Flow Diagram</h2>
            
            {/* Sample Request Flow */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-orange-900 mb-6 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
                Sample Request Workflow
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200 text-center">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-bold text-orange-900 mb-2">Buyer Requests Sample</h4>
                  <p className="text-sm text-orange-800">Buyer clicks "Request Sample" on quotation comparison page</p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-bold text-red-900 mb-2">Instant Admin Alert</h4>
                  <p className="text-sm text-red-800">System immediately notifies admin with all details</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-bold text-blue-900 mb-2">Admin Coordinates</h4>
                  <p className="text-sm text-blue-800">Admin contacts supplier to arrange sample shipment</p>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-bold text-green-900 mb-2">Sample Delivered</h4>
                  <p className="text-sm text-green-800">Supplier ships sample with tracking details</p>
                </div>
              </div>
            </div>

            {/* Quote Acceptance Flow */}
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                Quote Acceptance Workflow
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-bold text-green-900 mb-2">Quote Accepted</h4>
                  <p className="text-sm text-green-800">Buyer accepts quotation from supplier</p>
                </div>
                
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200 text-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-bold text-red-900 mb-2">Instant Admin Alert</h4>
                  <p className="text-sm text-red-800">System triggers urgent notification with all order details</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-bold text-blue-900 mb-2">Contact Parties</h4>
                  <p className="text-sm text-blue-800">Admin contacts both buyer and supplier</p>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200 text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-bold text-purple-900 mb-2">Facilitate Contract</h4>
                  <p className="text-sm text-purple-800">Admin facilitates contract and payment setup</p>
                </div>
                
                <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200 text-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">5</span>
                  </div>
                  <h4 className="font-bold text-indigo-900 mb-2">Monitor Fulfillment</h4>
                  <p className="text-sm text-indigo-800">Admin tracks production and delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Process Documentation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sample Request Process */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-orange-600" />
                Sample Request Process
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">1. Sample Request Initiation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Buyer views quotation comparison page</li>
                    <li>• Buyer clicks "Request Sample" for specific supplier</li>
                    <li>• System captures all relevant data automatically</li>
                    <li>• Sample status updated to "Sample Requested"</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">2. Immediate Admin Notification</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 🚨 Urgent alert appears on admin dashboard</li>
                    <li>• Complete buyer and supplier contact details provided</li>
                    <li>• RFQ details and quotation information included</li>
                    <li>• WhatsApp contact button for immediate action</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">3. Admin Coordination</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Admin contacts supplier via provided details</li>
                    <li>• Supplier must provide ALL details upfront:</li>
                    <li>&nbsp;&nbsp;- Sample shipping address</li>
                    <li>&nbsp;&nbsp;- Courier service name</li>
                    <li>&nbsp;&nbsp;- Tracking number</li>
                    <li>&nbsp;&nbsp;- Expected delivery date</li>
                    <li>• No additional detail requests after submission</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">4. Sample Delivery & Follow-up</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Admin coordinates sample delivery to buyer</li>
                    <li>• Tracking information shared with buyer</li>
                    <li>• Admin follows up on sample feedback</li>
                    <li>• Process completion documented</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quote Acceptance Process */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                Quote Acceptance Process
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">1. Quote Acceptance</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Buyer reviews all quotations</li>
                    <li>• Buyer clicks "Accept Quote" for preferred supplier</li>
                    <li>• System prevents multiple acceptances per RFQ</li>
                    <li>• RFQ status updated to "Closed"</li>
                  </ul>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">2. Urgent Admin Escalation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 🎉 Immediate urgent alert to admin team</li>
                    <li>• Complete order details with financial information</li>
                    <li>• Both buyer and supplier contact information</li>
                    <li>• Payment terms and delivery timeline included</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">3. Admin Facilitation</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Admin contacts both parties immediately</li>
                    <li>• Facilitate contract signing process</li>
                    <li>• Set up payment terms and milestones</li>
                    <li>• Establish communication channels</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">4. Order Management</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Set up order tracking system</li>
                    <li>• Monitor production milestones</li>
                    <li>• Coordinate quality checks</li>
                    <li>• Arrange logistics and shipping</li>
                  </ul>
                </div>

                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">5. Fulfillment Oversight</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Monitor production progress</li>
                    <li>• Ensure quality standards compliance</li>
                    <li>• Coordinate final delivery</li>
                    <li>• Handle any issues or disputes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Access Control Specifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔒 Access Control Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Admin Access */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Admin Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">View all RFQs and quotations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Access complete supplier network</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Receive urgent notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Edit any RFQ or quotation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Platform-wide oversight</span>
                  </div>
                </div>
              </div>

              {/* Buyer Access */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Buyer Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">View only own RFQs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">See quotations for own RFQs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Request samples from suppliers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Accept quotes and place orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-700">Cannot see other buyers' data</span>
                  </div>
                </div>
              </div>

              {/* Supplier Access */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Supplier Access
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">View RFQs in their categories</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Submit quotations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">View only own quotations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-700">Cannot see other suppliers' quotes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-700">Cannot access supplier network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Channels */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📞 Communication Channels</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">Primary Communication</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">WhatsApp Business</p>
                      <p className="text-sm text-green-700">+91 8595135554</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Email Support</p>
                      <p className="text-sm text-green-700">admin@solomonbharat.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Automated Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-blue-900">Sample Requests</p>
                      <p className="text-sm text-blue-700">Instant urgent alerts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-blue-900">Quote Acceptances</p>
                      <p className="text-sm text-blue-700">Immediate order notifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supplier Detail Requirements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Supplier Detail Requirements</h2>
            
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">⚠️ CRITICAL: All Details Required Upfront</h3>
              <p className="text-yellow-800 mb-4">
                Suppliers must provide ALL required information during initial quotation submission. 
                No additional details will be requested after submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Required for Quotation:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Company name and contact person</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Email and phone number</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Complete business address</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Pricing and MOQ details</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Payment and shipping terms</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Required for Sample Shipping:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Courier service name (DHL, FedEx, etc.)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Tracking number</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Expected delivery date</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Sample specifications and quantity</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Any special handling instructions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDocumentation;