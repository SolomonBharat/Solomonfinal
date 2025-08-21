import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type { Profile } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country?: string;
  phone?: string;
  user_type?: 'buyer' | 'supplier' | 'admin';
}

interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'admin' | 'supplier' | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  company: string;
  country: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'buyer' | 'admin' | 'supplier' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const profile = await api.getCurrentProfile();
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            company: '', // Will be loaded from company table
            country: profile.country || '',
            phone: profile.phone || '',
            user_type: profile.user_type
          });
          setUserType(profile.user_type);
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await api.getCurrentProfile();
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            company: '', // Will be loaded from company table
            country: profile.country || '',
            phone: profile.phone || '',
            user_type: profile.user_type
          });
          setUserType(profile.user_type);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const result = await api.signIn(email.trim().toLowerCase(), password.trim());
      
      if (result.success) {
        // Profile will be loaded by the auth state change listener
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      
      const result = await api.signUp(data.email, data.password, {
        name: data.name,
        user_type: 'buyer',
        company: data.company,
        country: data.country,
        phone: data.phone
      });
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.signOut();
      setUser(null);
      setUserType(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userType,
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};