import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  country?: string;
  phone?: string;
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
    // Check for existing session
    const savedUser = localStorage.getItem('solomon_user');
    const savedUserType = localStorage.getItem('solomon_user_type');
    
    if (savedUser && savedUserType) {
      setUser(JSON.parse(savedUser));
      setUserType(savedUserType as 'buyer' | 'admin' | 'supplier');
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Trim whitespace from inputs
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      
      // Check for dynamically created supplier accounts
      const onboardedSuppliers = JSON.parse(localStorage.getItem('onboarded_suppliers') || '[]');
      const supplierAccount = onboardedSuppliers.find((supplier: any) => 
        supplier.email.toLowerCase() === trimmedEmail
      );
      
      if (supplierAccount) {
        // For demo, use a simple password (in production, this would be hashed)
        const expectedPassword = 'supplier123'; // Default password for onboarded suppliers
        
        if (trimmedPassword === expectedPassword) {
          const supplierUser = {
            id: supplierAccount.id,
            email: supplierAccount.email,
            name: supplierAccount.contact_person,
            company: supplierAccount.company_name,
            country: 'India',
            phone: supplierAccount.phone,
            product_categories: supplierAccount.product_categories,
            certifications: supplierAccount.certifications,
            business_type: supplierAccount.business_type,
            years_in_business: supplierAccount.years_in_business,
            annual_turnover: supplierAccount.annual_turnover,
            employee_count: supplierAccount.employee_count,
            export_countries: supplierAccount.export_countries,
            quality_standards: supplierAccount.quality_standards,
            production_capacity: supplierAccount.production_capacity,
            minimum_order_quantity: supplierAccount.minimum_order_quantity,
            payment_terms: supplierAccount.payment_terms,
            lead_time: supplierAccount.lead_time,
            about_company: supplierAccount.about_company,
            address: supplierAccount.address,
            website: supplierAccount.website,
            gst_number: supplierAccount.gst_number,
            iec_code: supplierAccount.iec_code
          };
          setUser(supplierUser);
          setUserType('supplier');
          localStorage.setItem('solomon_user', JSON.stringify(supplierUser));
          localStorage.setItem('solomon_user_type', 'supplier');
          setLoading(false);
          // Force navigation after state update
          setTimeout(() => window.location.href = '/supplier/dashboard', 100);
          return { success: true };
        }
      }
      
      // Mock login - in production, this would call Supabase
      if (trimmedEmail === 'admin@solomonbharat.com' && trimmedPassword === 'admin123') {
        const adminUser = {
          id: 'admin-1',
          email: 'admin@solomonbharat.com',
          name: 'Admin User',
          company: 'Solomon Bharat',
          country: 'India'
        };
        setUser(adminUser);
        setUserType('admin');
        localStorage.setItem('solomon_user', JSON.stringify(adminUser));
        localStorage.setItem('solomon_user_type', 'admin');
        setLoading(false);
        // Force navigation after state update
        setTimeout(() => window.location.href = '/admin', 100);
        return { success: true };
      }
      
      if (trimmedEmail === 'buyer@example.com' && trimmedPassword === 'buyer123') {
        const buyerUser = {
          id: 'buyer-1',
          email: 'buyer@example.com',
          name: 'John Smith',
          company: 'Global Trade Corp',
          country: 'United States'
        };
        setUser(buyerUser);
        setUserType('buyer');
        localStorage.setItem('solomon_user', JSON.stringify(buyerUser));
        localStorage.setItem('solomon_user_type', 'buyer');
        setLoading(false);
        // Force navigation after state update
        setTimeout(() => window.location.href = '/dashboard', 100);
        return { success: true };
      }
      
      if (trimmedEmail === 'supplier@example.com' && trimmedPassword === 'supplier123') {
        const supplierUser = {
          id: 'supplier-1',
          email: 'supplier@example.com',
          name: 'Rajesh Kumar',
          company: 'Global Textiles Pvt Ltd',
          country: 'India',
          product_categories: ['Textiles & Apparel']
        };
        setUser(supplierUser);
        setUserType('supplier');
        localStorage.setItem('solomon_user', JSON.stringify(supplierUser));
        localStorage.setItem('solomon_user_type', 'supplier');
        setLoading(false);
        // Force navigation after state update
        setTimeout(() => window.location.href = '/supplier/dashboard', 100);
        return { success: true };
      }
      
      setLoading(false);
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      
      // Check if user already exists (mock check)
      const existingUser = localStorage.getItem('solomon_user');
      if (existingUser) {
        const user = JSON.parse(existingUser);
        if (user.email === data.email) {
          setLoading(false);
          return { success: false, error: 'User with this email already exists' };
        }
      }
      
      // Mock registration - in production, this would call Supabase
      const newUser = {
        id: `buyer-${Date.now()}`,
        email: data.email,
        name: data.name,
        company: data.company,
        country: data.country,
        phone: data.phone
      };
      
      setUser(newUser);
      setUserType('buyer');
      localStorage.setItem('solomon_user', JSON.stringify(newUser));
      localStorage.setItem('solomon_user_type', 'buyer');
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('solomon_user');
    localStorage.removeItem('solomon_user_type');
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