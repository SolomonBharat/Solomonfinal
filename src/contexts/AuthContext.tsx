import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country: string;
  phone?: string;
  website?: string;
  user_type: 'buyer' | 'supplier' | 'admin';
  created_at: string;
  updated_at: string;
  profile_completed: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  email_confirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'supplier' | 'admin' | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    country: string;
    phone: string;
    website?: string;
    user_type: 'buyer' | 'supplier';
  }) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'buyer' | 'supplier' | 'admin' | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
        setUserType(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        const userData: User = {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: profile.company_name || profile.full_name || '',
          company: profile.company_name || '',
          country: profile.country || '',
          phone: profile.phone || '',
          website: profile.website || '',
          user_type: profile.user_type,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          profile_completed: !!(profile.company_name && profile.country && profile.phone),
          verification_status: 'verified',
          email_confirmed: supabaseUser.email_confirmed_at ? true : false
        };

        setUser(userData);
        setUserType(userData.user_type);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    country: string;
    phone: string;
    website?: string;
    user_type: 'buyer' | 'supplier';
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Sign up with Supabase Auth (this will send verification email automatically)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            company_name: userData.company,
            user_type: userData.user_type
          }
        }
      });

      if (authError) {
        setLoading(false);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userData.user_type,
            full_name: userData.name,
            company_name: userData.company,
            phone: userData.phone,
            country: userData.country,
            website: userData.website || null
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create user-type specific record
        if (userData.user_type === 'buyer') {
          const { error: buyerError } = await supabase
            .from('buyers')
            .insert({
              id: authData.user.id
            });

          if (buyerError) {
            console.error('Buyer record creation error:', buyerError);
          }
        } else if (userData.user_type === 'supplier') {
          const { error: supplierError } = await supabase
            .from('suppliers')
            .insert({
              id: authData.user.id
            });

          if (supplierError) {
            console.error('Supplier record creation error:', supplierError);
          }
        }
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return { success: false, error: 'Registration failed' };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user);
        return { success: true };
      }

      setLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user?.email) {
        return { success: false, error: 'No email address found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    login,
    logout,
    register,
    loading,
    resendVerification
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