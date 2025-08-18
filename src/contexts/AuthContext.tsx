import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { mockDB } from '../lib/mockDatabase';

interface Profile {
  id: string;
  user_type: 'admin' | 'buyer' | 'supplier';
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  country: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: {
    userType: 'buyer' | 'supplier' | 'admin';
    fullName: string;
    companyName: string;
    phone?: string;
    country?: string;
    website?: string;
  }) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  userType: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    if (isSupabaseConfigured) {
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      if (isSupabaseConfigured) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        setProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Supabase sign in error:', error);
          return { error };
        }

        return { error: null };
      } else {
        // Fallback to mock authentication
        console.log('Using mock authentication');
        const result = await mockDB.signIn(email, password);
        
        if (!result) {
          return { error: { message: 'Invalid credentials' } };
        }

        setUser(result.user as any);
        setProfile(result.profile as any);
        return { error: null };
      }
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { error: { message: error.message || 'Sign in failed' } };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      userType: 'buyer' | 'supplier' | 'admin';
      fullName: string;
      companyName: string;
      phone?: string;
      country?: string;
      website?: string;
    }
  ) => {
    try {
      if (isSupabaseConfigured) {
        // Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          console.error('Auth signup error:', authError);
          return { error: authError };
        }

        if (!authData.user) {
          return { error: { message: 'Failed to create user' } };
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userData.userType,
            full_name: userData.fullName,
            company_name: userData.companyName,
            phone: userData.phone || null,
            country: userData.country || null,
            website: userData.website || null,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError };
        }

        // Create role-specific record
        if (userData.userType === 'buyer') {
          const { error: buyerError } = await supabase
            .from('buyers')
            .insert({
              id: authData.user.id,
              business_type: null,
              annual_volume: null,
              preferred_categories: [],
            });

          if (buyerError) {
            console.error('Buyer record creation error:', buyerError);
          }
        } else if (userData.userType === 'supplier') {
          const { error: supplierError } = await supabase
            .from('suppliers')
            .insert({
              id: authData.user.id,
              product_categories: ['Textiles & Apparel'],
              certifications: [],
              years_in_business: null,
              verification_status: 'pending',
            });

          if (supplierError) {
            console.error('Supplier record creation error:', supplierError);
          }
        }

        return { error: null };
      } else {
        // Fallback to mock authentication
        console.log('Using mock authentication for signup');
        const result = await mockDB.createUser(email, password, userData);
        
        setUser(result.user as any);
        setProfile(result.profile as any);
        return { error: null };
      }
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const logout = () => {
    signOut();
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    userType: profile?.user_type || null,
    logout,
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