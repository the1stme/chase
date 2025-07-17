import React from 'react';
import { AccountCard } from '../components/AccountCard';
import { Account, Transaction, User } from '../types';
import { ArrowUpDown, TrendingUp, Eye, Plus, ArrowRightLeft, Building2, ShoppingCart, Wallet } from 'lucide-react';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
  user: User;
  onAccountClick: (accountId: string) => void;
  onTabChange: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  accounts,
  transactions,
  user,
  onAccountClick,
  onTabChange
}) => {
  const totalBalance = accounts
    .filter(acc => acc.type !== 'credit')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get recent transactions (last 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getAccountName = (transaction: any) => {
    // Handle both accountId (TypeScript interface) and account_id (database)
    const accountId = transaction.accountId || transaction.account_id;
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name.toUpperCase() : 'UNKNOWN';
  };

  const getTransactionIcon = (category: string, type: string) => {
    if (category === 'Transfer') return ArrowRightLeft;
    if (category === 'Admin') return Building2;
    if (type === 'credit') return Wallet;
    return ShoppingCart;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-6 pb-32 md:pb-6 space-y-6 md:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="gradient-primary rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-glow animate-slide-up">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-1 md:mb-2">
              {getGreeting()}, {user.name || user.username}!
            </h1>
            <p className="opacity-90 text-base md:text-lg font-medium">Here's your financial overview</p>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center">
            <TrendingUp className="text-white" size={24} />
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="text-white/80" size={18} />
            <div className="text-xs md:text-sm opacity-80 font-medium">Total Available Balance</div>
          </div>
          <div className="text-2xl md:text-4xl font-black">{formatCurrency(totalBalance)}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1 md:mt-2">+2.4% from last month</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <button
          onClick={() => onTabChange('transfers')}
          className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-glow transition-all-smooth transform hover:scale-105 animate-scale-in"
        >
          <div className="flex flex-col md:flex-row items-center md:justify-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center">
              <ArrowUpDown className="text-white" size={20} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm md:text-lg font-bold text-gray-900">Transfer</div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">Send money</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onTabChange('transactions')}
          className="glass-effect rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-glow transition-all-smooth transform hover:scale-105 animate-scale-in"
        >
          <div className="flex flex-col md:flex-row items-center md:justify-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl md:rounded-2xl flex items-center justify-center">
              <Plus className="text-white" size={20} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm md:text-lg font-bold text-gray-900">Activity</div>
              <div className="text-xs md:text-sm text-gray-600 font-medium">View all</div>
            </div>
          </div>
        </button>
      </div>

      {/* Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Your Accounts</h2>
          <div className="text-xs md:text-sm text-blue-600 font-semibold">{accounts.length} accounts</div>
        </div>
        
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {accounts.map((account, index) => (
            <div key={account.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-slide-up">
              <AccountCard
                account={account}
                onClick={onAccountClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="glass-effect rounded-2xl md:rounded-3xl p-4 md:p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Recent Activity</h3>
          <button 
            onClick={() => onTabChange('transactions')}
            className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-bold transition-colors"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between py-3 md:py-4 ${
                  index < recentTransactions.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className={`${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {React.createElement(getTransactionIcon(transaction.category || '', transaction.type), {
                        size: 20
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                      {transaction.description}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 font-medium">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm md:text-lg ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {getAccountName(transaction)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">💳</div>
              <p className="text-gray-500 text-sm">No recent transactions</p>
              <p className="text-gray-400 text-xs">Your activity will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};