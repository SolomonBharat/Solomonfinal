import React from 'react';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerification } = useAuth();

  if (!user || user.email_confirmed) {
    return null;
  }

  const handleResendVerification = async () => {
    const result = await resendVerification();
    if (result.success) {
      alert('✅ Verification email sent! Please check your inbox and spam folder.');
    } else {
      alert(`❌ Failed to send verification email: ${result.error}`);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address ({user.email}) to access all features. 
              Check your inbox for a verification email.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <button
                onClick={handleResendVerification}
                className="bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <Mail className="h-4 w-4 inline mr-1" />
                Resend Verification Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;