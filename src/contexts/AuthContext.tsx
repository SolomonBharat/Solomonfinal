import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  company?: string;
}

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

// Complete mock database with persistence
class AuthDatabase {
  private users: any[] = [];
  private profiles: Profile[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeTestAccounts();
  }

  private loadFromStorage() {
    try {
      const users = localStorage.getItem('auth_users');
      const profiles = localStorage.getItem('auth_profiles');
      if (users) this.users = JSON.parse(users);
      if (profiles) this.profiles = JSON.parse(profiles);
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('auth_users', JSON.stringify(this.users));
      localStorage.setItem('auth_profiles', JSON.stringify(this.profiles));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  private initializeTestAccounts() {
    const testAccounts = [
      {
        email: 'admin@example.com',
        password: 'password',
        userType: 'admin' as const,
        fullName: 'Admin User',
        companyName: 'Solomon Bharat'
      },
      {
        email: 'buyer@example.com',
        password: 'password',
        userType: 'buyer' as const,
        fullName: 'John Buyer',
        companyName: 'Global Trade Corp'
      },
      {
        email: 'supplier@example.com',
        password: 'password',
        userType: 'supplier' as const,
        fullName: 'Sarah Supplier',
        companyName: 'Indian Exports Ltd'
      }
    ];

    testAccounts.forEach(account => {
      if (!this.users.find(u => u.email === account.email)) {
        this.createUser(account.email, account.password, account);
      }
    });
  }

  signIn(email: string, password: string): { user: User; profile: Profile } | null {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return null;

    const profile = this.profiles.find(p => p.id === user.id);
    if (!profile) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name || undefined,
        company: profile.company_name || undefined
      },
      profile
    };
  }

  createUser(email: string, password: string, userData: any): { user: User; profile: Profile } {
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const user = {
      id: userId,
      email,
      password,
      created_at: now
    };

    const profile: Profile = {
      id: userId,
      user_type: userData.userType,
      full_name: userData.fullName,
      company_name: userData.companyName,
      phone: userData.phone || null,
      country: userData.country || null,
      website: userData.website || null,
      created_at: now,
      updated_at: now
    };

    this.users.push(user);
    this.profiles.push(profile);
    this.saveToStorage();

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name || undefined,
        company: profile.company_name || undefined
      },
      profile
    };
  }
}

const authDB = new AuthDatabase();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedAuth = localStorage.getItem('current_auth');
    if (savedAuth) {
      try {
        const { user: savedUser, profile: savedProfile } = JSON.parse(savedAuth);
        setUser(savedUser);
        setProfile(savedProfile);
      } catch (error) {
        console.error('Error loading saved auth:', error);
        localStorage.removeItem('current_auth');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = authDB.signIn(email, password);
      if (!result) {
        return { error: { message: 'Invalid email or password' } };
      }

      setUser(result.user);
      setProfile(result.profile);
      localStorage.setItem('current_auth', JSON.stringify(result));
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Login failed' } };
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
      const result = authDB.createUser(email, password, userData);
      setUser(result.user);
      setProfile(result.profile);
      localStorage.setItem('current_auth', JSON.stringify(result));
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message || 'Registration failed' } };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('current_auth');
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