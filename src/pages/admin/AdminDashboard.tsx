import React from 'react';
import { Users, CreditCard, DollarSign, Activity, Plus } from 'lucide-react';
import { useRealtimeDashboardStats } from '../../hooks/useConvexData';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  // Get real-time dashboard stats from Convex
  const stats = useRealtimeDashboardStats();

  const dashboardStats = {
    totalUsers: stats?.totalUsers || 0,
    totalAccounts: stats?.totalAccounts || 0,
    totalBalance: stats?.totalBalance || 0,
    recentTransactions: stats?.recentTransactions || 0,
  };
  const StatCard = ({ icon: Icon, title, value, subtitle, color }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Remove the loading spinner - show UI immediately

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage users, accounts, and system overview</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate('users')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
          <button
            onClick={() => onNavigate('accounts')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            <span>Manage Accounts</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={dashboardStats.totalUsers}
          subtitle="Registered users"
          color="text-blue-600"
        />
        <StatCard
          icon={CreditCard}
          title="Total Accounts"
          value={dashboardStats.totalAccounts}
          subtitle="Active accounts"
          color="text-green-600"
        />
        <StatCard
          icon={DollarSign}
          title="Total Balance"
          value={`$${dashboardStats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="Across all accounts"
          color="text-blue-600"
        />
        <StatCard
          icon={Activity}
          title="Recent Transactions"
          value={dashboardStats.recentTransactions}
          subtitle="Last 7 days"
          color="text-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('users')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Manage Users</p>
            <p className="text-xs text-gray-500">Create, edit, or delete user accounts</p>
          </button>
          
          <button
            onClick={() => onNavigate('accounts')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Account Management</p>
            <p className="text-xs text-gray-500">Add/remove money, manage balances</p>
          </button>
          
          <button
            onClick={() => onNavigate('transactions')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
          >
            <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">View Transactions</p>
            <p className="text-xs text-gray-500">Monitor all system transactions</p>
          </button>
        </div>
      </div>
    </div>
  );
};
