import { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AdminLayout } from './components/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { Transfers } from './pages/Transfers';
import { Transactions } from './pages/Transactions';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AccountManagement } from './pages/admin/AccountManagement';
import { ConvexProvider, useAuth } from './contexts/ConvexProvider';
import { useRealtimeAccounts, useExecuteTransfer, useRealtimeTransactions, useRealtimeAllTransfers } from './hooks/useConvexData';
import { database } from './lib/convex';
import { User, Account, Transaction, Transfer } from './types';

// Data transformation functions to convert Convex data to legacy format
const transformAccount = (convexAccount: any): Account => ({
  ...convexAccount,
  id: convexAccount._id,
  accountNumber: convexAccount.account_number,
  routingNumber: convexAccount.routing_number,
  creditLimit: convexAccount.credit_limit,
  availableCredit: convexAccount.available_credit,
  dueDate: convexAccount.due_date,
  minimumPayment: convexAccount.minimum_payment,
  ytdContributions: convexAccount.ytd_contributions,
});



// Layout component for authenticated routes
function AppLayout({ user, onLogout, onTabChange }: { user: User; onLogout: () => void; onTabChange: (tab: string) => void }) {
  const location = useLocation();
  const activeTab = location.pathname.substring(1) || 'dashboard';

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={user} onLogout={onLogout} />
      <div className="flex">
        <Navigation
          activeTab={activeTab}
          onTabChange={onTabChange}
          onLogout={onLogout}
          isAdmin={user?.is_admin}
        />
        <main className="flex-1 p-6 md:ml-80 pt-20 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout: authLogout } = useAuth();

  // Get real-time data using Convex hooks
  const convexAccounts = useRealtimeAccounts(user?.id as any || null);
  const executeTransfer = useExecuteTransfer();

  const handleLogout = useCallback(async () => {
    await authLogout();
    navigate('/login');
  }, [authLogout, navigate]);

  // Transform Convex data to legacy format
  const accounts = convexAccounts?.map(transformAccount) || [];

  // Get transactions for the first account (for now - we can expand this later)
  const firstAccountId = accounts[0]?._id || null;
  const accountTransactions = useRealtimeTransactions(firstAccountId, 50);

  const allTransfersData = useRealtimeAllTransfers(20);

  // Transform transactions and transfers to legacy format
  const allTransactions: Transaction[] = accountTransactions?.map((tx: any) => ({
    ...tx,
    id: tx._id,
    accountId: tx.account_id,
    created_at: new Date(tx.created_at || Date.now()).toISOString(),
    updated_at: new Date(tx.updated_at || Date.now()).toISOString(),
  })) || [];

  const allTransfers: Transfer[] = allTransfersData?.map((transfer: any) => ({
    ...transfer,
    id: transfer._id,
    fromAccount: transfer.from_account_id || '',
    toAccount: transfer.to_account_id || '',
    confirmationCode: transfer.reference_code || '',
    created_at: new Date(transfer.created_at || Date.now()).toISOString(),
    updated_at: new Date(transfer.updated_at || Date.now()).toISOString(),
  })) || [];

  const handleTabChange = useCallback((tab: string) => {
    navigate(tab === 'dashboard' ? '/' : `/${tab}`);
  }, [navigate]);

  const handleTransfer = async (transfer: Omit<Transfer, 'id' | 'confirmationCode'>) => {
    if (!user) return;
    try {
      const result = await executeTransfer({
        from_account_id: transfer.fromAccount as any, // Type assertion for now
        to_account_id: transfer.toAccount as any, // Type assertion for now
        amount: transfer.amount,
        description: transfer.description,
        type: transfer.type
      });

      if (result.success) {
        console.log('Transfer completed:', result);
      } else {
        console.error('Transfer failed:', result.error);
      }
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  const handleUserUpdate = async (updatedUser: Partial<User>) => {
    if (!user) return { error: 'No user logged in' };
    try {
      const result = await database.users.updateUser(user.id as any, updatedUser); // Type assertion for now
      if (result.success && result.user) {
        return { success: true, user: result.user };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error };
    }
  };

  const handleAccountClick = useCallback((accountId: string) => {
    navigate('/transactions', { state: { accountId } });
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={() => {}} />} />
      {isAuthenticated && user ? (
        <Route path="/*" element={<AppLayout user={user} onLogout={handleLogout} onTabChange={handleTabChange} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard accounts={accounts || []} transactions={allTransactions} user={user} onAccountClick={handleAccountClick} onTabChange={handleTabChange} />} />
          <Route path="transfers" element={<Transfers transfers={allTransfers} accounts={accounts || []} onTransfer={handleTransfer} />} />
          <Route path="transactions" element={<Transactions transactions={allTransactions} accounts={accounts || []} />} />
          <Route path="settings" element={<Settings user={user} onUserUpdate={handleUserUpdate} />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

// Admin Content Component
function AdminContent() {
  const navigate = useNavigate();
  const { adminUser, isAdminAuthenticated, isAdminLoading, adminLogout: authAdminLogout } = useAuth();

  const handleAdminLogout = useCallback(async () => {
    await authAdminLogout();
    navigate('/admin/login');
  }, [authAdminLogout, navigate]);

  const handleAdminNavigate = useCallback((page: string) => {
    navigate(`/admin/${page}`);
  }, [navigate]);

  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin/login" element={isAdminAuthenticated ? <Navigate to="/admin/dashboard" /> : <AdminLogin onLoginSuccess={() => {}} />} />
      {isAdminAuthenticated && adminUser ? (
        <Route path="/admin/*" element={<AdminLayout onLogout={handleAdminLogout} />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard onNavigate={handleAdminNavigate} />} />
          <Route path="users" element={<UserManagement onNavigate={handleAdminNavigate} />} />
          <Route path="accounts" element={<AccountManagement onNavigate={handleAdminNavigate} />} />
          <Route path="transactions" element={<div className="text-center py-12"><h2 className="text-2xl font-bold text-gray-900">Transaction Management</h2><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
        </Route>
      ) : (
        <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div>
      {isAdminRoute ? <AdminContent /> : <AppContent />}
    </div>
  );
}

function AppWrapper() {
  return (
    <ConvexProvider>
      <Router>
        <App />
      </Router>
    </ConvexProvider>
  );
}

export default AppWrapper;