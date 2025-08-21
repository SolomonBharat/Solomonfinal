import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'buyer' | 'supplier' | 'admin' | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Fetch user profile from public.users table
          const profile = await db.getUserById(session.user.id);
          if (profile) {
            setUser(profile);
            setUserType(profile.user_type);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await db.getUserById(session.user.id);
        if (profile) {
          setUser(profile);
          setUserType(profile.user_type);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserType(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        // Fetch user profile
        const profile = await db.getUserById(data.user.id);
        if (profile) {
          setUser(profile);
          setUserType(profile.user_type);
          setLoading(false);
          return { success: true };
        } else {
          setLoading(false);
          return { success: false, error: 'User profile not found' };
        }
      }

      setLoading(false);
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      setLoading(true);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password
      });

      if (authError) {
        setLoading(false);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        // Create user profile in public.users table
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
        setLoading(false);
        return { success: true, user: createdUser };
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
      setUserType(null);
      setLoading(false);
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
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