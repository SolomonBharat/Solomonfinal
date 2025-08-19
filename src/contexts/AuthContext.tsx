import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../lib/supabase';

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

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Supabase Config Check:', {
      url: url ? 'Set' : 'Missing',
      key: key ? 'Set' : 'Missing',
      isPlaceholder: url === 'https://placeholder.supabase.co'
    });
    
    return url && key && url !== 'https://placeholder.supabase.co';
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock authentication');
      setLoading(false);
      return;
    }
    
    console.log('Supabase is configured, initializing...');

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
    if (!isSupabaseConfigured()) return;

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
    if (!isSupabaseConfigured()) {
      // Mock authentication for demo purposes
      const mockUser = {
        id: 'mock-user-id',
        email,
        name: email.split('@')[0],
        company: 'Demo Company'
      };
      
      const mockProfile = {
        id: 'mock-user-id',
        user_type: email.includes('admin') ? 'admin' as const : 
                   email.includes('supplier') ? 'supplier' as const : 'buyer' as const,
        full_name: email.split('@')[0],
        company_name: 'Demo Company',
        phone: null,
        country: null,
        website: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser as any);
      setProfile(mockProfile);
      localStorage.setItem('mock_auth', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }

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
    if (!isSupabaseConfigured()) {
      console.error('Supabase not configured - cannot create real account');
      return { error: new Error('Supabase not configured') };
    }
    
    setLoading(true);
    
    try {
      console.log('Starting signup process for:', email);
      console.log('User data:', userData);
      
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
          data: {
            full_name: userData.fullName,
            company_name: userData.companyName,
            user_type: userData.userType
          },
          // Explicitly disable email confirmation
          emailRedirectTo: undefined
        }
      });

      console.log('Auth signup result:', { authData, authError });

      if (authError) {
        setLoading(false);
        console.error('Auth error:', authError);
        return { error: authError };
      }

      if (authData.user && authData.user.id) {
        console.log('Creating profile for user:', authData.user.id);
        
        // Wait a moment for the user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            user_type: userData.userType,
            full_name: userData.fullName,
            company_name: userData.companyName,
            phone: userData.phone,
            country: userData.country,
            website: userData.website,
          })
          .select()
          .single();

        console.log('Profile creation result:', { profileData, profileError });

        if (profileError) {
          console.error('Profile error:', profileError);
          // Don't fail completely if profile creation fails
          console.log('Continuing despite profile error...');
        }

        // Create role-specific record
        if (userData.userType === 'buyer') {
          console.log('Creating buyer record');
          const { data: buyerData, error: buyerError } = await supabase
            .from('buyers')
            .insert({ id: authData.user.id })
            .select()
            .single();
          
          console.log('Buyer creation result:', { buyerData, buyerError });
          
          if (buyerError) {
            console.error('Buyer error:', buyerError);
          }
        } else if (userData.userType === 'supplier') {
          console.log('Creating supplier record');
          const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .insert({ 
              id: authData.user.id,
              product_categories: [],
              years_in_business: null,
              certifications: []
            })
            .select()
            .single();
          
          console.log('Supplier creation result:', { supplierData, supplierError });
          
          if (supplierError) {
            console.error('Supplier error:', supplierError);
          }
        }

        // Set the profile data if we have it
        if (profileData) {
          setProfile(profileData);
        }
        
        // Try to sign in the user immediately
        console.log('Attempting to sign in user after signup...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        console.log('Sign in after signup result:', { signInData, signInError });
        
        console.log('Signup completed successfully');
      }

      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      console.error('Signup error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mock_auth');
      return;
    }

    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!isSupabaseConfigured()) {
      if (profile) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        const mockAuth = JSON.parse(localStorage.getItem('mock_auth') || '{}');
        localStorage.setItem('mock_auth', JSON.stringify({ ...mockAuth, profile: updatedProfile }));
      }
      return { error: null };
    }

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

  // Initialize mock auth if Supabase not configured
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const mockAuth = localStorage.getItem('mock_auth');
      if (mockAuth) {
        const { user: mockUser, profile: mockProfile } = JSON.parse(mockAuth);
        setUser(mockUser);
        setProfile(mockProfile);
      }
      setLoading(false);
    }
  }, []);

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