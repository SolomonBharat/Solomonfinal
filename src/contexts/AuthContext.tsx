import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, using mock authentication');
      const mockAuth = localStorage.getItem('mock_auth');
      if (mockAuth) {
        try {
          const { user: mockUser, profile: mockProfile } = JSON.parse(mockAuth);
          setUser(mockUser);
          setProfile(mockProfile);
        } catch (error) {
          console.error('Error parsing mock auth:', error);
          localStorage.removeItem('mock_auth');
        }
      }
      setLoading(false);
      return;
    }

    // Initialize Supabase auth
    initializeSupabaseAuth();
  }, []);

  const initializeSupabaseAuth = async () => {
    if (!supabase) {
      console.error('Supabase client not available');
      setLoading(false);
      return;
    }

    
    try {
      console.log('Initializing Supabase auth...');

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing Supabase auth:', error);
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    if (!supabase) {
      console.log('No Supabase client available for profile fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user, this is normal for new users');
        } else {
          console.error('Error fetching profile:', error);
        }
      } else {
        console.log('Profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      return { error };
    } catch (error) {
      setLoading(false);
      return { error };
    }
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
    if (!supabase) {
      // Mock authentication for demo purposes
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        email,
        name: userData.fullName,
        company: userData.companyName
      };
      
      const mockProfile = {
        id: mockUser.id,
        user_type: userData.userType,
        full_name: userData.fullName,
        company_name: userData.companyName,
        phone: userData.phone || null,
        country: userData.country || null,
        website: userData.website || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser as any);
      setProfile(mockProfile);
      localStorage.setItem('mock_auth', JSON.stringify({ user: mockUser, profile: mockProfile }));
      return { error: null };
    }
    
    setLoading(true);
    
    try {
      console.log('Starting signup process for:', email);
      
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: userData.fullName,
            company_name: userData.companyName,
            user_type: userData.userType
          }
        }
      });

      if (authError) {
        setLoading(false);
        return { error: authError };
      }

      if (authData.user && authData.user.id) {
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

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Create role-specific record
        if (userData.userType === 'buyer') {
          const { data: buyerData, error: buyerError } = await supabase
            .from('buyers')
            .insert({ id: authData.user.id })
            .select()
            .single();
          
          if (buyerError) {
            console.error('Buyer creation error:', buyerError);
          }
        } else if (userData.userType === 'supplier') {
          const { data: supplierData, error: supplierError } = await supabase
            .from('suppliers')
            .insert({ 
              id: authData.user.id,
              product_categories: [],
              certifications: []
            })
            .select()
            .single();
          
          if (supplierError) {
            console.error('Supplier creation error:', supplierError);
          }
        }

        if (profileData) {
          setProfile(profileData);
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
    if (!supabase) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mock_auth');
      return;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabase) {
      if (profile) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        const mockAuth = JSON.parse(localStorage.getItem('mock_auth') || '{}');
        localStorage.setItem('mock_auth', JSON.stringify({ ...mockAuth, profile: updatedProfile }));
      }
      return { error: null };
    }

    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
      }

      return { error };
    } catch (error) {
      return { error };
    }
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