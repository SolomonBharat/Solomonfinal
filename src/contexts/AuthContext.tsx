import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { demoCredentials, demoUsers, storage, User } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  userType: 'buyer' | 'supplier' | 'admin' | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<{ success: boolean; user?: User; error?: string }>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<{ success: boolean; user?: User; error?: string }>;
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
    // Simple session check
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem('solomon_current_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserType(userData.user_type);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Add small delay to prevent flash
    setTimeout(checkSession, 100);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check demo credentials
      const demoUser = demoCredentials.find(cred => cred.email === email && cred.password === password);
      if (demoUser) {
        const userData = demoUsers.find(u => u.email === email);
        if (userData) {
          setUser(userData);
          setUserType(userData.user_type);
          localStorage.setItem('solomon_current_user', JSON.stringify(userData));
          return { success: true };
        }
      }

      // Check registered users
      const users = storage.get('users');
      const registeredUser = users.find((u: User) => u.email === email);
      if (registeredUser) {
        setUser(registeredUser);
        setUserType(registeredUser.user_type);
        localStorage.setItem('solomon_current_user', JSON.stringify(registeredUser));
        return { success: true };
      }

      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const users = storage.get('users');
      
      // Check if email already exists
      if (users.find((u: User) => u.email === userData.email)) {
        return { success: false, error: 'Email already exists' };
      }

      const newUser: User = {
        id: storage.generateId(),
        email: userData.email!,
        name: userData.name!,
        company: userData.company!,
        country: userData.country!,
        phone: userData.phone,
        user_type: userData.user_type || 'buyer'
      };

      users.push(newUser);
      storage.set('users', users);

      setUser(newUser);
      setUserType(newUser.user_type);
      localStorage.setItem('solomon_current_user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('solomon_current_user');
    setUser(null);
    setUserType(null);
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      const users = storage.get('users');
      const userIndex = users.findIndex((u: User) => u.id === userId);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }

      const updatedUser = { ...users[userIndex], ...userData };
      users[userIndex] = updatedUser;
      storage.set('users', users);

      // Update current user if it's the same user
      if (user?.id === userId) {
        setUser(updatedUser);
        localStorage.setItem('solomon_current_user', JSON.stringify(updatedUser));
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, error: 'Failed to update user' };
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    login,
    logout,
    register,
    updateUser,
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