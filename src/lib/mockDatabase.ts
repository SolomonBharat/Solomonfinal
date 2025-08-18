// Mock database for persistent storage when Supabase is not configured
interface MockUser {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

interface MockProfile {
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

interface MockBuyer {
  id: string;
  business_type: string | null;
  annual_volume: string | null;
  preferred_categories: string[];
  created_at: string;
}

interface MockSupplier {
  id: string;
  product_categories: string[];
  certifications: string[];
  years_in_business: number | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

class MockDatabase {
  private users: MockUser[] = [];
  private profiles: MockProfile[] = [];
  private buyers: MockBuyer[] = [];
  private suppliers: MockSupplier[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeTestAccounts();
  }

  private loadFromStorage() {
    try {
      const users = localStorage.getItem('mock_users');
      const profiles = localStorage.getItem('mock_profiles');
      const buyers = localStorage.getItem('mock_buyers');
      const suppliers = localStorage.getItem('mock_suppliers');

      if (users) this.users = JSON.parse(users);
      if (profiles) this.profiles = JSON.parse(profiles);
      if (buyers) this.buyers = JSON.parse(buyers);
      if (suppliers) this.suppliers = JSON.parse(suppliers);
    } catch (error) {
      console.error('Error loading mock data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('mock_users', JSON.stringify(this.users));
      localStorage.setItem('mock_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('mock_buyers', JSON.stringify(this.buyers));
      localStorage.setItem('mock_suppliers', JSON.stringify(this.suppliers));
    } catch (error) {
      console.error('Error saving mock data to storage:', error);
    }
  }

  private initializeTestAccounts() {
    // Only create test accounts if they don't exist
    const testAccounts = [
      {
        email: 'admin@example.com',
        password: 'password',
        userType: 'admin' as const,
        fullName: 'Admin User',
        companyName: 'Solomon Bharat Admin'
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
        this.createUser(
          account.email,
          account.password,
          {
            userType: account.userType,
            fullName: account.fullName,
            companyName: account.companyName,
            phone: '+1234567890',
            country: account.userType === 'supplier' ? 'India' : 'USA'
          }
        );
      }
    });
  }

  async signIn(email: string, password: string): Promise<{ user: any; profile: MockProfile } | null> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) return null;

    const profile = this.profiles.find(p => p.id === user.id);
    if (!profile) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name,
        company: profile.company_name
      },
      profile
    };
  }

  async createUser(
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
  ): Promise<{ user: any; profile: MockProfile }> {
    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const userId = 'mock-user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    // Create user
    const user: MockUser = {
      id: userId,
      email,
      password,
      created_at: now
    };

    // Create profile
    const profile: MockProfile = {
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

    // Create role-specific record
    if (userData.userType === 'buyer') {
      const buyer: MockBuyer = {
        id: userId,
        business_type: null,
        annual_volume: null,
        preferred_categories: [],
        created_at: now
      };
      this.buyers.push(buyer);
    } else if (userData.userType === 'supplier') {
      const supplier: MockSupplier = {
        id: userId,
        product_categories: ['Textiles & Apparel'],
        certifications: [],
        years_in_business: null,
        verification_status: 'pending',
        created_at: now
      };
      this.suppliers.push(supplier);
    }

    this.users.push(user);
    this.profiles.push(profile);
    this.saveToStorage();

    return {
      user: {
        id: user.id,
        email: user.email,
        name: profile.full_name,
        company: profile.company_name
      },
      profile
    };
  }

  async updateProfile(userId: string, updates: Partial<MockProfile>): Promise<MockProfile | null> {
    const profileIndex = this.profiles.findIndex(p => p.id === userId);
    if (profileIndex === -1) return null;

    this.profiles[profileIndex] = {
      ...this.profiles[profileIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveToStorage();
    return this.profiles[profileIndex];
  }

  getProfile(userId: string): MockProfile | null {
    return this.profiles.find(p => p.id === userId) || null;
  }

  getAllUsers(): { users: MockUser[]; profiles: MockProfile[] } {
    return { users: this.users, profiles: this.profiles };
  }
}

export const mockDB = new MockDatabase();