/**
 * Migration helpers to ease the transition from Supabase to Convex
 * These utilities help maintain compatibility during the migration process
 */

import { database, auth } from '../lib/convex';

/**
 * Helper to convert Supabase-style responses to Convex format
 */
export const formatSupabaseResponse = <T>(data: T | null, error: Error | null = null) => {
  return {
    data,
    error,
    status: error ? 400 : 200,
    statusText: error ? 'Error' : 'OK',
  };
};

/**
 * Helper to convert Convex results to Supabase-style format
 */
export const toSupabaseFormat = async <T>(convexPromise: Promise<T>) => {
  try {
    const data = await convexPromise;
    return formatSupabaseResponse(data);
  } catch (error) {
    return formatSupabaseResponse(null, error as Error);
  }
};

/**
 * Migration wrapper for user operations
 */
export const userMigrationHelpers = {
  /**
   * Get user by ID with Supabase-compatible response
   */
  getUserById: async (userId: string) => {
    return toSupabaseFormat(database.users.getUserById(userId));
  },

  /**
   * Get user by username with Supabase-compatible response
   */
  getUserByUsername: async (username: string) => {
    return toSupabaseFormat(database.users.getUserByUsername(username));
  },

  /**
   * Create user with Supabase-compatible response
   */
  createUser: async (userData: any) => {
    return toSupabaseFormat(database.users.createUser(userData));
  },

  /**
   * Update user with Supabase-compatible response
   */
  updateUser: async (userId: string, updateData: any) => {
    return toSupabaseFormat(database.users.updateUser(userId, updateData));
  },

  /**
   * Delete user with Supabase-compatible response
   */
  deleteUser: async (userId: string) => {
    return toSupabaseFormat(database.users.deleteUser(userId));
  },
};

/**
 * Migration wrapper for account operations
 */
export const accountMigrationHelpers = {
  /**
   * Get user accounts with Supabase-compatible response
   */
  getUserAccounts: async (userId: string) => {
    return toSupabaseFormat(database.accounts.getUserAccounts(userId));
  },

  /**
   * Get account by ID with Supabase-compatible response
   */
  getAccountById: async (accountId: string) => {
    return toSupabaseFormat(database.accounts.getById(accountId));
  },

  /**
   * Create account with Supabase-compatible response
   */
  createAccount: async (accountData: any) => {
    return toSupabaseFormat(database.accounts.createAccount(accountData));
  },

  /**
   * Update account with Supabase-compatible response
   */
  updateAccount: async (accountId: string, updateData: any) => {
    return toSupabaseFormat(database.accounts.updateAccount(accountId, updateData));
  },

  /**
   * Delete account with Supabase-compatible response
   */
  deleteAccount: async (accountId: string) => {
    return toSupabaseFormat(database.accounts.deleteAccount(accountId));
  },
};

/**
 * Migration wrapper for transaction operations
 */
export const transactionMigrationHelpers = {
  /**
   * Get account transactions with Supabase-compatible response
   */
  getAccountTransactions: async (accountId: string, limit?: number, offset?: number) => {
    return toSupabaseFormat(database.transactions.getByAccount(accountId, limit, offset));
  },

  /**
   * Get transactions by date range with Supabase-compatible response
   */
  getTransactionsByDateRange: async (accountId: string, startDate: string, endDate: string) => {
    return toSupabaseFormat(database.transactions.getByDateRange(accountId, startDate, endDate));
  },

  /**
   * Create transaction with Supabase-compatible response
   */
  createTransaction: async (transactionData: any) => {
    return toSupabaseFormat(database.transactions.create(transactionData));
  },

  /**
   * Update transaction with Supabase-compatible response
   */
  updateTransaction: async (transactionId: string, updateData: any) => {
    return toSupabaseFormat(database.transactions.update(transactionId, updateData));
  },

  /**
   * Delete transaction with Supabase-compatible response
   */
  deleteTransaction: async (transactionId: string) => {
    return toSupabaseFormat(database.transactions.delete(transactionId));
  },
};

/**
 * Migration wrapper for transfer operations
 */
export const transferMigrationHelpers = {
  /**
   * Execute transfer with Supabase-compatible response
   */
  executeTransfer: async (transferData: any) => {
    return toSupabaseFormat(database.transfers.execute(transferData));
  },

  /**
   * Get account transfers with Supabase-compatible response
   */
  getAccountTransfers: async (accountId: string, limit?: number) => {
    return toSupabaseFormat(database.transfers.getByAccount(accountId, limit));
  },

  /**
   * Get transfer by ID with Supabase-compatible response
   */
  getTransferById: async (transferId: string) => {
    return toSupabaseFormat(database.transfers.getById(transferId));
  },

  /**
   * Cancel transfer with Supabase-compatible response
   */
  cancelTransfer: async (transferId: string) => {
    return toSupabaseFormat(database.transfers.cancel(transferId));
  },
};

/**
 * Migration wrapper for authentication operations
 */
export const authMigrationHelpers = {
  /**
   * Login with Supabase-compatible response
   */
  login: async (username: string, password: string) => {
    try {
      const result = await auth.login(username, password);
      return {
        data: result.session ? { session: result.session } : null,
        error: result.error,
        status: result.error ? 400 : 200,
        statusText: result.error ? 'Error' : 'OK',
      };
    } catch (error) {
      return formatSupabaseResponse(null, error as Error);
    }
  },

  /**
   * Logout with Supabase-compatible response
   */
  logout: async () => {
    try {
      const result = await auth.logout();
      return {
        data: null,
        error: result.error,
        status: result.error ? 400 : 200,
        statusText: result.error ? 'Error' : 'OK',
      };
    } catch (error) {
      return formatSupabaseResponse(null, error as Error);
    }
  },

  /**
   * Get session with Supabase-compatible response
   */
  getSession: async (token: string) => {
    try {
      const session = await auth.getSession(token);
      return formatSupabaseResponse(session);
    } catch (error) {
      return formatSupabaseResponse(null, error as Error);
    }
  },
};

/**
 * Utility to convert date formats between Supabase and Convex
 */
export const dateHelpers = {
  /**
   * Convert Supabase timestamp to Convex format
   */
  supabaseToConvex: (supabaseDate: string): number => {
    return new Date(supabaseDate).getTime();
  },

  /**
   * Convert Convex timestamp to Supabase format
   */
  convexToSupabase: (convexTimestamp: number): string => {
    return new Date(convexTimestamp).toISOString();
  },

  /**
   * Get current timestamp in Convex format
   */
  now: (): number => {
    return Date.now();
  },

  /**
   * Get current date in YYYY-MM-DD format
   */
  today: (): string => {
    return new Date().toISOString().split('T')[0];
  },
};

/**
 * Utility to handle ID conversions
 */
export const idHelpers = {
  /**
   * Check if an ID is a valid Convex ID format
   */
  isConvexId: (id: string): boolean => {
    // Convex IDs are typically longer and have a specific format
    return id.length > 20 && !id.includes('-');
  },

  /**
   * Check if an ID is a valid UUID format (Supabase style)
   */
  isUUID: (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },
};

/**
 * Error handling utilities
 */
export const errorHelpers = {
  /**
   * Convert Convex errors to Supabase-style errors
   */
  toSupabaseError: (error: Error) => {
    return {
      message: error.message,
      details: error.stack,
      hint: null,
      code: 'CONVEX_ERROR',
    };
  },

  /**
   * Check if an error is a network error
   */
  isNetworkError: (error: Error): boolean => {
    return error.message.includes('network') || error.message.includes('fetch');
  },

  /**
   * Check if an error is an authentication error
   */
  isAuthError: (error: Error): boolean => {
    return error.message.includes('authentication') || 
           error.message.includes('unauthorized') ||
           error.message.includes('token');
  },
};

/**
 * Validation helpers
 */
export const validationHelpers = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   */
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  /**
   * Validate account number format
   */
  isValidAccountNumber: (accountNumber: string): boolean => {
    return /^\d{10}$/.test(accountNumber);
  },

  /**
   * Validate routing number format
   */
  isValidRoutingNumber: (routingNumber: string): boolean => {
    return /^\d{9}$/.test(routingNumber);
  },
};

/**
 * Data transformation helpers
 */
export const transformHelpers = {
  /**
   * Transform user data from Supabase to Convex format
   */
  userToConvex: (supabaseUser: any) => {
    return {
      username: supabaseUser.username,
      password: supabaseUser.password,
      name: supabaseUser.name,
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      address: supabaseUser.address,
      is_admin: supabaseUser.is_admin || false,
      created_at: supabaseUser.created_at ? dateHelpers.supabaseToConvex(supabaseUser.created_at) : dateHelpers.now(),
      updated_at: supabaseUser.updated_at ? dateHelpers.supabaseToConvex(supabaseUser.updated_at) : dateHelpers.now(),
    };
  },

  /**
   * Transform account data from Supabase to Convex format
   */
  accountToConvex: (supabaseAccount: any) => {
    return {
      user_id: supabaseAccount.user_id,
      name: supabaseAccount.name,
      type: supabaseAccount.type,
      balance: supabaseAccount.balance || 0,
      account_number: supabaseAccount.account_number,
      routing_number: supabaseAccount.routing_number,
      credit_limit: supabaseAccount.credit_limit,
      available_credit: supabaseAccount.available_credit,
      due_date: supabaseAccount.due_date,
      minimum_payment: supabaseAccount.minimum_payment,
      apr: supabaseAccount.apr,
      ytd_contributions: supabaseAccount.ytd_contributions,
      status: supabaseAccount.status || 'active',
      created_at: supabaseAccount.created_at ? dateHelpers.supabaseToConvex(supabaseAccount.created_at) : dateHelpers.now(),
      updated_at: supabaseAccount.updated_at ? dateHelpers.supabaseToConvex(supabaseAccount.updated_at) : dateHelpers.now(),
    };
  },

  /**
   * Transform transaction data from Supabase to Convex format
   */
  transactionToConvex: (supabaseTransaction: any) => {
    return {
      account_id: supabaseTransaction.account_id,
      amount: supabaseTransaction.amount,
      type: supabaseTransaction.type,
      description: supabaseTransaction.description,
      date: supabaseTransaction.date,
      category: supabaseTransaction.category,
      merchant: supabaseTransaction.merchant,
      location: supabaseTransaction.location,
      reference: supabaseTransaction.reference,
      receipt_number: supabaseTransaction.receipt_number,
      pending: supabaseTransaction.pending || false,
      batch_id: supabaseTransaction.batch_id,
      created_at: supabaseTransaction.created_at ? dateHelpers.supabaseToConvex(supabaseTransaction.created_at) : dateHelpers.now(),
    };
  },
};
