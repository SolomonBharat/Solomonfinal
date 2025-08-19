import React from 'react';
import { AlertTriangle, ExternalLink, Database, Key } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const SupabaseSetupBanner: React.FC = () => {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Database className="h-6 w-6 text-blue-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-blue-800">
            🚀 Supabase Setup Required
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p className="mb-4">
              To enable full functionality including real email verification, user authentication, and data persistence, 
              you need to connect your Supabase project.
            </p>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Quick Setup Steps:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>
                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:no-underline font-medium inline-flex items-center"
                  >
                    Create a Supabase project
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>Go to <strong>Project Settings → API</strong></li>
                <li>Copy your <strong>Project URL</strong> and <strong>anon public key</strong></li>
                <li>Update the <code className="bg-blue-100 px-1 rounded">.env</code> file with your credentials</li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">📋 Current Status:</h4>
              <p className="text-yellow-800">
                The application is running in <strong>demo mode</strong> with simulated data. 
                Connect Supabase to enable real authentication, email verification, and persistent data storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetupBanner;