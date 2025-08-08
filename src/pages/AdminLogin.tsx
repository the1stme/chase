import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../contexts/ConvexProvider';
import { useNavigate } from 'react-router-dom';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', { username, password: '***' });
      const result = await adminLogin(username, password);
      console.log('Admin login result:', result);

      if (result.success) {
        console.log('Admin login successful, navigating to dashboard');
        onLoginSuccess();
        navigate('/admin/dashboard');
      } else {
        console.log('Admin login failed:', result.error);
        setError(result.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-chase-blue-900 via-chase-blue-800 to-chase-blue-700 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-gradient-to-r from-chase-blue-600/20 to-chase-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-r from-chase-blue-800/20 to-chase-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-chase-blue-600/20 to-chase-blue-800/20 rounded-full blur-2xl animate-bounce-subtle"></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* App Admin Logo (Chase) */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-6 bg-white rounded-2xl p-6 shadow-2xl">
            <img src="/newheaderlogo.svg" alt="Chase Admin Portal" className="h-10 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Chase Admin Portal</h1>
          <p className="text-blue-100 text-lg font-medium">Secure administrative access</p>
        </div>

        {/* Admin Login Form */}
        <div className="bg-gradient-to-br from-chase-blue-800/70 to-chase-blue-900/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-chase-blue-400/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-600/80 to-red-700/80 border border-red-400/50 rounded-2xl p-4 text-white text-sm font-medium animate-scale-in backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-red-200">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Admin Username"
                  className="w-full bg-gradient-to-r from-chase-blue-900/60 to-chase-blue-800/60 border-2 border-chase-blue-400/40 rounded-2xl px-14 py-4 text-white placeholder-blue-200 focus:bg-chase-blue-800/70 focus:border-chase-blue-300/60 focus:outline-none transition-all duration-300 font-medium backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={22} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin Password"
                  className="w-full bg-gradient-to-r from-chase-blue-900/60 to-chase-blue-800/60 border-2 border-chase-blue-400/40 rounded-2xl px-14 py-4 pr-16 text-white placeholder-blue-200 focus:bg-chase-blue-800/70 focus:border-chase-blue-300/60 focus:outline-none transition-all duration-300 font-medium backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-600/50"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-chase-blue-600 to-chase-blue-800 hover:from-chase-blue-700 hover:to-chase-blue-900 text-white font-bold py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-chase-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Portal'
              )}
            </button>
          </form>

          {/* Back to User Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-600/30">
            <button 
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors hover:bg-slate-700/50 px-4 py-2 rounded-xl"
            >
              ← Back to User Login
            </button>
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-slate-400 text-sm font-medium">Administrative Access Only</p>
          <p className="text-slate-500 text-xs">
            Unauthorized access is prohibited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};
