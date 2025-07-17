import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

/**
 * Real-time hooks for Convex data subscriptions
 * These hooks provide automatic real-time updates when data changes
 */

/**
 * Hook to get user accounts with real-time updates
 */
export const useRealtimeAccounts = (userId: Id<"users"> | null) => {
  return useQuery(
    api.accounts.getUserAccounts,
    userId ? { userId } : "skip"
  );
};

/**
 * Hook to get account transactions with real-time updates
 */
export const useRealtimeTransactions = (
  accountId: Id<"accounts"> | null,
  limit?: number,
  offset?: number
) => {
  return useQuery(
    api.transactions.getAccountTransactions,
    accountId ? { accountId, limit, offset } : "skip"
  );
};

/**
 * Hook to get account transfers with real-time updates
 */
export const useRealtimeTransfers = (
  accountId: Id<"accounts"> | null,
  limit?: number
) => {
  return useQuery(
    api.transfers.getAccountTransfers,
    accountId ? { accountId, limit } : "skip"
  );
};

/**
 * Hook to get account by ID with real-time updates
 */
export const useRealtimeAccount = (accountId: Id<"accounts"> | null) => {
  return useQuery(
    api.accounts.getAccountById,
    accountId ? { accountId } : "skip"
  );
};

/**
 * Hook to get user by ID with real-time updates
 */
export const useRealtimeUser = (userId: Id<"users"> | null) => {
  return useQuery(
    api.users.getUserById,
    userId ? { userId } : "skip"
  );
};

/**
 * Hook to get dashboard stats with real-time updates (for admin)
 */
export const useRealtimeDashboardStats = () => {
  return useQuery(api.admin.getDashboardStats);
};

/**
 * Hook to get all users with real-time updates (for admin)
 */
export const useRealtimeAllUsers = (searchTerm?: string, limit?: number) => {
  return useQuery(api.admin.getAllUsers, { searchTerm, limit });
};

/**
 * Hook to get all accounts with users with real-time updates (for admin)
 */
export const useRealtimeAllAccountsWithUsers = (searchTerm?: string, limit?: number) => {
  return useQuery(api.admin.getAllAccountsWithUsers, { searchTerm, limit });
};

/**
 * Hook to get account balance history with real-time updates
 */
export const useRealtimeBalanceHistory = (accountId: Id<"accounts"> | null) => {
  return useQuery(
    api.accounts.getAccountBalanceHistory,
    accountId ? { accountId } : "skip"
  );
};

/**
 * Hook to get pending transactions with real-time updates
 */
export const useRealtimePendingTransactions = (accountId: Id<"accounts"> | null) => {
  return useQuery(
    api.transactions.getPendingTransactions,
    accountId ? { accountId } : "skip"
  );
};

/**
 * Hook to get all transfers with real-time updates (for admin)
 */
export const useRealtimeAllTransfers = (limit?: number, status?: string) => {
  return useQuery(api.transfers.getAllTransfers, { limit, status });
};

/**
 * Mutation hooks for common operations
 */

/**
 * Hook for user login mutation
 */
export const useLogin = () => {
  return useMutation(api.auth.login);
};

/**
 * Hook for user logout mutation
 */
export const useLogout = () => {
  return useMutation(api.auth.logout);
};

/**
 * Hook for admin login mutation
 */
export const useAdminLogin = () => {
  return useMutation(api.auth.adminLogin);
};

/**
 * Hook for admin logout mutation
 */
export const useAdminLogout = () => {
  return useMutation(api.auth.adminLogout);
};

/**
 * Hook for creating transactions
 */
export const useCreateTransaction = () => {
  return useMutation(api.transactions.createTransaction);
};

/**
 * Hook for executing transfers
 */
export const useExecuteTransfer = () => {
  return useMutation(api.transfers.executeTransfer);
};

/**
 * Hook for creating accounts
 */
export const useCreateAccount = () => {
  return useMutation(api.accounts.createAccount);
};

/**
 * Hook for updating accounts
 */
export const useUpdateAccount = () => {
  return useMutation(api.accounts.updateAccount);
};

/**
 * Hook for creating users (admin)
 */
export const useCreateUser = () => {
  return useMutation(api.admin.createUser);
};

/**
 * Hook for updating users (admin)
 */
export const useUpdateUser = () => {
  return useMutation(api.admin.updateUser);
};

/**
 * Hook for deleting users (admin)
 */
export const useDeleteUser = () => {
  return useMutation(api.admin.deleteUser);
};

/**
 * Hook for creating accounts (admin)
 */
export const useAdminCreateAccount = () => {
  return useMutation(api.admin.createAccount);
};

/**
 * Hook for updating account balance (admin)
 */
export const useUpdateAccountBalance = () => {
  return useMutation(api.admin.updateAccountBalance);
};

/**
 * Hook for updating user information
 */
export const useUpdateUserInfo = () => {
  return useMutation(api.users.updateUser);
};

/**
 * Hook for deleting accounts
 */
export const useDeleteAccount = () => {
  return useMutation(api.accounts.deleteAccount);
};

/**
 * Hook for updating transactions
 */
export const useUpdateTransaction = () => {
  return useMutation(api.transactions.updateTransaction);
};

/**
 * Hook for deleting transactions
 */
export const useDeleteTransaction = () => {
  return useMutation(api.transactions.deleteTransaction);
};

/**
 * Hook for canceling transfers
 */
export const useCancelTransfer = () => {
  return useMutation(api.transfers.cancelTransfer);
};

/**
 * Hook for updating transfer status (admin)
 */
export const useUpdateTransferStatus = () => {
  return useMutation(api.transfers.updateTransferStatus);
};

/**
 * Hook for cleaning up expired sessions
 */
export const useCleanupExpiredSessions = () => {
  return useMutation(api.auth.cleanupExpiredSessions);
};

/**
 * Custom hook for session management
 */
export const useSession = (token: string | null) => {
  return useQuery(
    api.auth.getSession,
    token ? { token } : "skip"
  );
};

/**
 * Custom hook for admin session management
 */
export const useAdminSession = (token: string | null) => {
  return useQuery(
    api.auth.getAdminSession,
    token ? { token } : "skip"
  );
};

/**
 * Utility hook to combine multiple account-related queries
 */
export const useAccountData = (accountId: Id<"accounts"> | null) => {
  const account = useRealtimeAccount(accountId);
  const transactions = useRealtimeTransactions(accountId, 50); // Last 50 transactions
  const transfers = useRealtimeTransfers(accountId, 20); // Last 20 transfers
  const balanceHistory = useRealtimeBalanceHistory(accountId);
  const pendingTransactions = useRealtimePendingTransactions(accountId);

  return {
    account,
    transactions,
    transfers,
    balanceHistory,
    pendingTransactions,
    isLoading: account === undefined || transactions === undefined || transfers === undefined,
  };
};

/**
 * Utility hook to combine user-related queries
 */
export const useUserData = (userId: Id<"users"> | null) => {
  const user = useRealtimeUser(userId);
  const accounts = useRealtimeAccounts(userId);

  return {
    user,
    accounts,
    isLoading: user === undefined || accounts === undefined,
  };
};

/**
 * Utility hook for admin dashboard data
 */
export const useAdminDashboardData = () => {
  const stats = useRealtimeDashboardStats();
  const users = useRealtimeAllUsers(undefined, 10); // Last 10 users
  const accounts = useRealtimeAllAccountsWithUsers(undefined, 10); // Last 10 accounts
  const transfers = useRealtimeAllTransfers(10); // Last 10 transfers

  return {
    stats,
    users,
    accounts,
    transfers,
    isLoading: stats === undefined || users === undefined || accounts === undefined,
  };
};
