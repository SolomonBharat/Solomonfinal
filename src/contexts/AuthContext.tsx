import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, userData: {
    userType: 'buyer' | 'supplier';
    fullName: string;
    companyName: string;
    phone?: string;
    country?: string;
    website?: string;
  }) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: any }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  userType: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error };
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      userType: 'buyer' | 'supplier';
      fullName: string;
      companyName: string;
      phone?: string;
      country?: string;
      website?: string;
    }
  ) => {
    setLoading(true);
    
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirm: false
          }
        }
      });

      if (authError) {
        setLoading(false);
        return { error: authError };
      }

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userData.userType,
            full_name: userData.fullName,
            company_name: userData.companyName,
            phone: userData.phone,
            country: userData.country,
            website: userData.website,
          });

        if (profileError) {
          setLoading(false);
          return { error: profileError };
        }

        // Create role-specific record
        if (userData.userType === 'buyer') {
          const { error: buyerError } = await supabase
            .from('buyers')
            .insert({ id: authData.user.id });
          
          if (buyerError) {
            setLoading(false);
            return { error: buyerError };
          }
        } else if (userData.userType === 'supplier') {
          const { error: supplierError } = await supabase
            .from('suppliers')
            .insert({ 
              id: authData.user.id,
              product_categories: [],
              years_in_business: null,
              certifications: []
            });
          
          if (supplierError) {
            setLoading(false);
            return { error: supplierError };
          }
        }

        // Automatically sign in the user after successful registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setLoading(false);
          return { error: signInError };
        }
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  // Legacy login function for compatibility
  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    return { success: true };
  };

  // Legacy logout function for compatibility
  const logout = async () => {
    await signOut();
  };
  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    login,
    logout,
    userType: profile?.user_type || null,
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