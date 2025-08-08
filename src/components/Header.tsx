import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  user: any;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  return (
    <header className="glass-effect border-b border-blue-100 px-4 md:px-6 py-1 md:py-2 animate-fade-in md:ml-80">
      <div className="relative flex items-center justify-center ml-0">
        {/* Centered App Logo (Chase) */}
        <div className="p-0">
          <img
            src="/newheaderlogo.svg"
            alt="Chase Online Banking"
            className="h-[2.6rem] md:h-[3.25rem] w-auto object-contain"
          />
        </div>

        {/* Logout - Desktop only (right aligned) */}
        <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all-smooth transform hover:scale-105"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};