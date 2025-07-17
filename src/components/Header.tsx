import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="glass-effect border-b border-blue-100 px-4 md:px-6 py-2 animate-fade-in md:ml-80">
      <div className="flex items-center justify-between ml-16 md:ml-0">
        {/* Logo with white rounded container */}
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          <img
            src="/rbfcu-logo.svg"
            alt="RBFCU  Online Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Logout - Desktop only */}
        <button
          onClick={onLogout}
          className="hidden md:flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all-smooth transform hover:scale-105"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </header>
  );
};