import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../components/ui/toast';
import { Globe, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error('Login failed', {
          description: error.message,
        });
      } else {
        toast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Solomon Bharat</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Sign up as Buyer
            </Link>
            {' or '}
            <Link to="/supplier-register" className="text-blue-600 hover:text-blue-500">
              Sign up as Supplier
            </Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600 mb-2">Test Accounts:</p>
          <div className="text-xs space-y-1">
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded" onClick={() => { setEmail('admin@example.com'); setPassword('password'); }}>
              <strong>Admin:</strong> admin@example.com / password
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded" onClick={() => { setEmail('buyer@example.com'); setPassword('password'); }}>
              <strong>Buyer:</strong> buyer@example.com / password
            </div>
            <div className="cursor-pointer hover:bg-gray-100 p-1 rounded" onClick={() => { setEmail('supplier@example.com'); setPassword('password'); }}>
              <strong>Supplier:</strong> supplier@example.com / password
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click on any test account to auto-fill credentials</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;