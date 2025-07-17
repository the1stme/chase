import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConvexProvider as BaseConvexProvider } from 'convex/react';
import { ConvexReactClient } from 'convex/react';
import { auth } from '../lib/convex';
import { api } from '../../convex/_generated/api';
import { User } from '../types';

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

// Types for authentication context (using imported User type)

interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

interface AdminSession {
  user: {
    id: string;
    username: string;
    email: string;
    name: string;
    is_admin: boolean;
  };
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  // User authentication
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Admin authentication
  adminUser: AdminSession['user'] | null;
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  isAdminLoading: boolean;
  
  // Authentication methods
  login: (username: string, password: string) => Promise<{ session: Session | null; error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; session: AdminSession | null; error: Error | null }>;
  adminLogout: () => Promise<{ error: Error | null }>;
  
  // Utility methods
  refreshSession: () => Promise<void>;
  refreshAdminSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a ConvexProvider');
  }
  return context;
};

interface ConvexProviderProps {
  children: React.ReactNode;
}

export const ConvexProvider: React.FC<ConvexProviderProps> = ({ children }) => {
  // User authentication state
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin authentication state
  const [adminUser, setAdminUser] = useState<AdminSession['user'] | null>(null);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
    initializeAdminAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const sessionData = await auth.getSession(token);
        if (sessionData) {
          setSession(sessionData);
          setIsAuthenticated(true);
          
          // Get user data
          const userData = await convex.query(api.users.getUserById, { userId: sessionData.user_id });
          if (userData) {
            // Transform to include both _id and id for compatibility
            const transformedUser = {
              ...userData,
              id: userData._id,
              _id: userData._id, // Keep _id for components that need it
              created_at: new Date(userData.created_at || Date.now()).toISOString(),
              updated_at: new Date(userData.updated_at || Date.now()).toISOString(),
            };
            setUser(transformedUser);
          }
        } else {
          // Invalid token, remove it
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeAdminAuth = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const sessionData = await auth.getAdminSession();
        if (sessionData) {
          setAdminSession(sessionData);
          setAdminUser(sessionData.user);
          setIsAdminAuthenticated(true);
        } else {
          // Invalid token, remove it
          localStorage.removeItem('adminToken');
        }
      }
    } catch (error) {
      console.error('Error initializing admin auth:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const result = await auth.login(username, password);
      
      if (result.session && !result.error) {
        setSession(result.session);
        setIsAuthenticated(true);
        
        // Get user data
        const userData = await convex.query(api.users.getUserById, { userId: result.session.user_id });
        if (userData) {
          // Transform to include both _id and id for compatibility
          const transformedUser = {
            ...userData,
            id: userData._id,
            _id: userData._id, // Keep _id for components that need it
            created_at: new Date(userData.created_at || Date.now()).toISOString(),
            updated_at: new Date(userData.updated_at || Date.now()).toISOString(),
          };
          setUser(transformedUser);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { session: null, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const result = await auth.logout();
      
      // Clear state regardless of result
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      
      return result;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even on error
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      return { error: error as Error };
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      setIsAdminLoading(true);
      const result = await auth.adminLogin(username, password);

      if (result.session && !result.error) {
        setAdminSession(result.session);
        setAdminUser(result.session.user);
        setIsAdminAuthenticated(true);
        return { success: true, session: result.session, error: null };
      } else {
        return { success: false, session: null, error: result.error };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, session: null, error: error as Error };
    } finally {
      setIsAdminLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      const result = await auth.adminLogout();
      
      // Clear admin state regardless of result
      setAdminUser(null);
      setAdminSession(null);
      setIsAdminAuthenticated(false);
      
      return result;
    } catch (error) {
      console.error('Admin logout error:', error);
      // Clear state even on error
      setAdminUser(null);
      setAdminSession(null);
      setIsAdminAuthenticated(false);
      return { error: error as Error };
    }
  };

  const refreshSession = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const sessionData = await auth.getSession(token);
        if (sessionData) {
          setSession(sessionData);
          setIsAuthenticated(true);
          
          // Get updated user data
          const userData = await convex.query(api.users.getUserById, { userId: sessionData.user_id });
          if (userData) {
            // Transform to include both _id and id for compatibility
            const transformedUser = {
              ...userData,
              id: userData._id,
              _id: userData._id, // Keep _id for components that need it
              created_at: new Date(userData.created_at || Date.now()).toISOString(),
              updated_at: new Date(userData.updated_at || Date.now()).toISOString(),
            };
            setUser(transformedUser);
          }
        } else {
          // Session expired or invalid
          await logout();
        }
      } catch (error) {
        console.error('Error refreshing session:', error);
        await logout();
      }
    }
  };

  const refreshAdminSession = async () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const sessionData = await auth.getAdminSession();
        if (sessionData) {
          setAdminSession(sessionData);
          setAdminUser(sessionData.user);
          setIsAdminAuthenticated(true);
        } else {
          // Session expired or invalid
          await adminLogout();
        }
      } catch (error) {
        console.error('Error refreshing admin session:', error);
        await adminLogout();
      }
    }
  };

  const contextValue: AuthContextType = {
    // User authentication
    user,
    session,
    isAuthenticated,
    isLoading,
    
    // Admin authentication
    adminUser,
    adminSession,
    isAdminAuthenticated,
    isAdminLoading,
    
    // Authentication methods
    login,
    logout,
    adminLogin,
    adminLogout,
    
    // Utility methods
    refreshSession,
    refreshAdminSession,
  };

  return (
    <BaseConvexProvider client={convex}>
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    </BaseConvexProvider>
  );
};

export default ConvexProvider;
