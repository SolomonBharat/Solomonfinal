import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  Package, 
  ShoppingCart,
  Settings, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
  children?: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [];

    if (profile?.user_type === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'RFQs', href: '/admin/rfqs', icon: FileText },
        { name: 'Suppliers', href: '/admin/suppliers', icon: Users },
        { name: 'Quotations', href: '/admin/quotations', icon: Package },
        { name: 'Samples', href: '/admin/samples', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Categories', href: '/admin/categories', icon: Settings },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ];
    }

    if (profile?.user_type === 'buyer') {
      return [
        { name: 'Dashboard', href: '/buyer/dashboard', icon: Home },
        { name: 'Create RFQ', href: '/buyer/create-rfq', icon: FileText },
        { name: 'My RFQs', href: '/buyer/rfqs', icon: FileText },
        { name: 'Samples', href: '/buyer/samples', icon: Package },
        { name: 'Orders', href: '/buyer/orders', icon: ShoppingCart },
        { name: 'Profile', href: '/buyer/profile', icon: User },
      ];
    }

    if (profile?.user_type === 'supplier') {
      return [
        { name: 'Dashboard', href: '/supplier/dashboard', icon: Home },
        { name: 'Quotations', href: '/supplier/quotations', icon: Package },
        { name: 'Samples', href: '/supplier/samples', icon: Package },
        { name: 'Orders', href: '/supplier/orders', icon: ShoppingCart },
        { name: 'Profile', href: '/supplier/profile', icon: User },
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center space-x-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Solomon Bharat</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
                {item.badge && (
                  <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {profile?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.company_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-6 w-6" />
                </button>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {profile?.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                        <p className="text-xs text-gray-500">{profile?.user_type}</p>
                      </div>
                      <Link
                        to={`/${profile?.user_type}/profile`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={signOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;