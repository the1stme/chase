import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Shield, Users, CreditCard, Activity, LogOut, Home } from 'lucide-react';
import { adminLogout } from '../lib/auth';

interface AdminLayoutProps {
  onLogout: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await adminLogout();
    onLogout();
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Accounts',
      path: '/admin/accounts',
      icon: CreditCard,
    },
    {
      name: 'Transactions',
      path: '/admin/transactions',
      icon: Activity,
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-sm">
                  <img
                    src="/bank-of-america-logo.svg"
                    alt="Bank of America"
                    className="h-6 w-auto object-contain"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                User Portal
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
