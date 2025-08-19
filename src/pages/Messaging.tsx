import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Messaging = () => {
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
            <span className="text-gray-900 font-medium">Messages</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Messaging Feature Coming Soon
          </h1>
          <p className="text-gray-600 mb-8">
            We're working on a comprehensive messaging system to facilitate communication between buyers and suppliers. This feature will be available in a future update.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Current Communication Process</h3>
            <p className="text-blue-800">
              For now, all communication is facilitated through our admin team. When you request quotations or have questions about suppliers, our team will coordinate the conversation and keep you updated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messaging;