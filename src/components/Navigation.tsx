import React, { useState, useRef, useEffect } from 'react';
import { Home, ArrowUpDown, Receipt, Settings, LogOut, Menu, X } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  onLogout,
  isAdmin = false
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'transfers', icon: ArrowUpDown, label: 'Transfers' },
    { id: 'transactions', icon: Receipt, label: 'Transactions' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsSidebarOpen(false); // Close sidebar when tab is selected
  };

  const handleLogout = () => {
    onLogout();
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-blue-100 z-40 animate-slide-up">
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all-smooth transform ${
                  isActive
                    ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-glow scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Mobile/Desktop Sidebar Navigation */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg flex-col z-50 transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'flex' : 'hidden md:flex'}`}
      >
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo with enhanced styling */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                <img
                  src="/rbfcu-logo.svg"
                  alt="RBFCU  Online Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center space-x-4 py-4 px-6 rounded-2xl mb-3 transition-all-smooth transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200'
                }`}
              >
                <Icon size={24} />
                <span className="font-semibold text-lg">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-4 py-4 px-6 rounded-2xl text-gray-700 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-200 transition-all-smooth transform hover:scale-105"
          >
            <LogOut size={24} />
            <span className="font-semibold text-lg">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};