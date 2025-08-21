import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, User } from '../lib/database';

// Authentication Context
interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'supplier' | 'admin' | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Demo credentials for testing
const demoCredentials = [
  { email: 'buyer@example.com', password: 'buyer123', user_type: 'buyer' },
  { email: 'supplier@example.com', password: 'supplier123', user_type: 'supplier' },
  { email: 'admin@solomonbharat.com', password: 'admin123', user_type: 'admin' }
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'buyer' | 'supplier' | 'admin' | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('Checking session...');
        setLoading(true);
        
        // Check localStorage first
        const savedUser = localStorage.getItem('solomon_user');
        if (savedUser) {
          console.log('Found saved user:', savedUser);
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserType(userData.user_type);
          setLoading(false);
          return;
        }

        // Initialize with demo data if no saved user
        console.log('No saved user found, setting loading to false');
        setLoading(false);
      } catch (error) {
        console.error('Error in checkSession:', error);
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      // Check demo credentials first
      const demoUser = demoCredentials.find(cred => cred.email === email && cred.password === password);
      if (demoUser) {
        // Find or create demo user
        let user = await db.getUserByEmail(email);
        if (!user) {
          user = await db.createUser({
            id: `demo-${demoUser.user_type}`,
            email: demoUser.email,
            name: demoUser.user_type === 'buyer' ? 'Demo Buyer' : 
                  demoUser.user_type === 'supplier' ? 'Demo Supplier' : 'Admin User',
            company: demoUser.user_type === 'buyer' ? 'Demo Company' : 
                     demoUser.user_type === 'supplier' ? 'Demo Supplier Ltd' : 'Solomon Bharat',
            country: demoUser.user_type === 'supplier' ? 'India' : 'United States',
            user_type: demoUser.user_type as any,
            profile_completed: true,
            verification_status: 'verified'
          });
        }
        
        if (user) {
          setUser(user);
          setUserType(user.user_type);
          localStorage.setItem('solomon_user', JSON.stringify(user));
          setLoading(false);
          return { success: true };
        }
      }

      // Try Supabase authentication if configured
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const profile = await db.getUserById(data.user.id);
          if (profile) {
            setUser(profile);
            setUserType(profile.user_type);
            localStorage.setItem('solomon_user', JSON.stringify(profile));
            setLoading(false);
            return { success: true };
          } else {
            setLoading(false);
            return { success: false, error: 'User profile not found' };
          }
        }
      }

      setLoading(false);
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);

      // Try Supabase registration if configured
      if (isSupabaseConfigured && supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email!,
          password: userData.password
        });

        if (authError) {
          setLoading(false);
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          const newUserProfile: Partial<User> = {
            id: authData.user.id,
            email: userData.email!,
            name: userData.name!,
            company: userData.company!,
            country: userData.country!,
            phone: userData.phone,
            user_type: userData.user_type || 'buyer',
            profile_completed: true,
            verification_status: 'verified'
          };

          const createdUser = await db.createUser(newUserProfile);

          if (!createdUser) {
            setLoading(false);
            return { success: false, error: 'Failed to create user profile' };
          }

          setUser(createdUser);
          setUserType(createdUser.user_type);
          localStorage.setItem('solomon_user', JSON.stringify(createdUser));
          setLoading(false);
          return { success: true, user: createdUser };
        }
      } else {
        // Fallback to localStorage registration
        const newUser = await db.createUser({
          id: this.generateId(),
          email: userData.email!,
          name: userData.name!,
          company: userData.company!,
          country: userData.country!,
          phone: userData.phone,
          user_type: userData.user_type || 'buyer',
          profile_completed: true,
          verification_status: 'verified'
        });

        if (newUser) {
          setUser(newUser);
          setUserType(newUser.user_type);
          localStorage.setItem('solomon_user', JSON.stringify(newUser));
          setLoading(false);
          return { success: true, user: newUser };
        }
      }

      setLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
        }
      }
      
      // Clear local storage
      localStorage.removeItem('solomon_user');
      setUser(null);
      setUserType(null);
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const value: AuthContextType = {
    user,
    userType,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};