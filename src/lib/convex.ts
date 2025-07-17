import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);

/**
 * Authentication wrapper - matches the existing auth.ts interface
 */
export const auth = {
  /**
   * User login function
   */
  login: async (username: string, password: string) => {
    try {
      const result = await convex.mutation(api.auth.login, { username, password });
      if (result.success && result.session) {
        // Store token in localStorage to match existing behavior
        localStorage.setItem('token', result.session.token);
        return { session: result.session, error: null };
      } else {
        return { session: null, error: new Error(result.error || 'Login failed') };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { session: null, error: error as Error };
    }
  },

  /**
   * Get session by token
   */
  getSession: async (token: string) => {
    try {
      return await convex.query(api.auth.getSession, { token });
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  /**
   * Logout function
   */
  logout: async () => {
    const token = localStorage.getItem('token');
    if (!token) return { error: null };
    
    try {
      const result = await convex.mutation(api.auth.logout, { token });
      localStorage.removeItem('token');
      return { error: result.success ? null : new Error(result.error || 'Logout failed') };
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token'); // Ensure token is removed on error
      return { error: error as Error };
    }
  },

  /**
   * Admin login function
   */
  adminLogin: async (username: string, password: string) => {
    try {
      const result = await convex.mutation(api.auth.adminLogin, { username, password });
      if (result.success && result.session) {
        // Store admin token in localStorage
        localStorage.setItem('adminToken', result.session.access_token);
        return { session: result.session, error: null };
      } else {
        return { session: null, error: new Error(result.error || 'Admin login failed') };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { session: null, error: error as Error };
    }
  },

  /**
   * Get admin session
   */
  getAdminSession: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return null;
    
    try {
      return await convex.query(api.auth.getAdminSession, { token });
    } catch (error) {
      console.error('Get admin session error:', error);
      return null;
    }
  },

  /**
   * Admin logout function
   */
  adminLogout: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return { error: null };
    
    try {
      const result = await convex.mutation(api.auth.adminLogout, { token });
      localStorage.removeItem('adminToken');
      return { error: result.success ? null : new Error(result.error || 'Admin logout failed') };
    } catch (error) {
      console.error('Admin logout error:', error);
      localStorage.removeItem('adminToken');
      return { error: error as Error };
    }
  },
};

/**
 * Database operations wrapper - matches existing Supabase patterns
 */
export const database = {
  /**
   * User operations
   */
  users: {
    getUserById: (userId: string) => 
      convex.query(api.users.getUserById, { userId }),
    
    getUserByUsername: (username: string) =>
      convex.query(api.users.getUserByUsername, { username }),
    
    createUser: (userData: any) =>
      convex.mutation(api.users.createUser, userData),
    
    updateUser: (userId: string, updateData: any) =>
      convex.mutation(api.users.updateUser, { userId, ...updateData }),
    
    deleteUser: (userId: string) =>
      convex.mutation(api.users.deleteUser, { userId }),
  },

  /**
   * Account operations
   */
  accounts: {
    getUserAccounts: (userId: string) => 
      convex.query(api.accounts.getUserAccounts, { userId }),
    
    getById: (accountId: string) =>
      convex.query(api.accounts.getAccountById, { accountId }),
    
    createAccount: (accountData: any) =>
      convex.mutation(api.accounts.createAccount, accountData),
    
    updateAccount: (accountId: string, updateData: any) =>
      convex.mutation(api.accounts.updateAccount, { accountId, ...updateData }),
    
    deleteAccount: (accountId: string) =>
      convex.mutation(api.accounts.deleteAccount, { accountId }),
    
    getBalanceHistory: (accountId: string) =>
      convex.query(api.accounts.getAccountBalanceHistory, { accountId }),
  },

  /**
   * Transaction operations
   */
  transactions: {
    getByAccount: (accountId: string, limit?: number, offset?: number) =>
      convex.query(api.transactions.getAccountTransactions, { accountId, limit, offset }),
    
    getByDateRange: (accountId: string, startDate: string, endDate: string) =>
      convex.query(api.transactions.getTransactionsByDateRange, { accountId, startDate, endDate }),
    
    create: (transactionData: any) =>
      convex.mutation(api.transactions.createTransaction, transactionData),
    
    update: (transactionId: string, updateData: any) =>
      convex.mutation(api.transactions.updateTransaction, { transactionId, ...updateData }),
    
    delete: (transactionId: string) =>
      convex.mutation(api.transactions.deleteTransaction, { transactionId }),
    
    getPending: (accountId: string) =>
      convex.query(api.transactions.getPendingTransactions, { accountId }),
  },

  /**
   * Transfer operations
   */
  transfers: {
    execute: (transferData: any) =>
      convex.mutation(api.transfers.executeTransfer, transferData),
    
    getByAccount: (accountId: string, limit?: number) =>
      convex.query(api.transfers.getAccountTransfers, { accountId, limit }),
    
    getById: (transferId: string) =>
      convex.query(api.transfers.getTransferById, { transferId }),
    
    getByReferenceCode: (referenceCode: string) =>
      convex.query(api.transfers.getTransferByReferenceCode, { referenceCode }),
    
    cancel: (transferId: string) =>
      convex.mutation(api.transfers.cancelTransfer, { transferId }),
    
    getAll: (limit?: number, status?: string) =>
      convex.query(api.transfers.getAllTransfers, { limit, status }),
    
    updateStatus: (transferId: string, status: string) =>
      convex.mutation(api.transfers.updateTransferStatus, { transferId, status }),
  },
};

/**
 * Admin operations wrapper
 */
export const admin = {
  /**
   * Dashboard operations
   */
  getDashboardStats: () =>
    convex.query(api.admin.getDashboardStats),

  /**
   * User management operations
   */
  users: {
    getAll: (searchTerm?: string, limit?: number) =>
      convex.query(api.admin.getAllUsers, { searchTerm, limit }),
    
    create: (userData: any) =>
      convex.mutation(api.admin.createUser, userData),
    
    update: (userId: string, updateData: any) =>
      convex.mutation(api.admin.updateUser, { userId, ...updateData }),
    
    delete: (userId: string) =>
      convex.mutation(api.admin.deleteUser, { userId }),
  },

  /**
   * Account management operations
   */
  accounts: {
    getAllWithUsers: (searchTerm?: string, limit?: number) =>
      convex.query(api.admin.getAllAccountsWithUsers, { searchTerm, limit }),
    
    create: (accountData: any) =>
      convex.mutation(api.admin.createAccount, accountData),
    
    updateBalance: (accountId: string, balanceData: any) =>
      convex.mutation(api.admin.updateAccountBalance, { accountId, ...balanceData }),
  },
};

/**
 * Supabase compatibility layer for easier migration
 * This provides a similar interface to the existing supabase client
 */
export const supabaseCompat = {
  from: (table: string) => ({
    select: (columns: string = '*', options?: any) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          // This is a simplified compatibility layer
          // In practice, you'd need to map these to appropriate Convex queries
          console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
          return { data: null, error: new Error('Not implemented in compatibility layer') };
        },
        collect: async () => {
          console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
          return { data: [], error: new Error('Not implemented in compatibility layer') };
        }
      }),
      order: (column: string, options?: any) => ({
        collect: async () => {
          console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
          return { data: [], error: new Error('Not implemented in compatibility layer') };
        }
      })
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
          return { data: null, error: new Error('Not implemented in compatibility layer') };
        }
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
            return { data: null, error: new Error('Not implemented in compatibility layer') };
          }
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        async: async () => {
          console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
          return { error: new Error('Not implemented in compatibility layer') };
        }
      })
    })
  }),
  
  rpc: async (functionName: string, params?: any) => {
    console.warn('Using supabase compatibility layer - consider migrating to direct Convex calls');
    return { data: null, error: new Error('RPC not implemented in compatibility layer') };
  }
};

// Export the convex client for direct use if needed
export { convex };
export default convex;
