import React from 'react';
import { Account } from '../types';
import { ChevronRight, DollarSign, Calendar, TrendingUp, CreditCard, PiggyBank, Wallet, BarChart3 } from 'lucide-react';

interface AccountCardProps {
  account: Account;
  onClick: (accountId: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, onClick }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return Wallet;
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return BarChart3;
      default: return Wallet;
    }
  };

  const getAccountGradient = (type: string) => {
    switch (type) {
      case 'checking': return 'from-blue-500 to-blue-600';
      case 'savings': return 'from-green-500 to-green-600';
      case 'credit': return 'from-indigo-500 to-indigo-600';
      case 'investment': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const AccountIcon = getAccountIcon(account.type);

  return (
    <div 
      className="glass-effect rounded-3xl p-6 hover:shadow-glow transition-all-smooth cursor-pointer transform hover:scale-105 animate-fade-in"
      onClick={() => onClick(account.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 bg-gradient-to-r ${getAccountGradient(account.type)} rounded-2xl flex items-center justify-center shadow-lg`}>
            <AccountIcon className="text-white" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
            <p className="text-sm text-gray-500 font-medium">{account.accountNumber}</p>
          </div>
        </div>
        <ChevronRight className="text-gray-400 transition-transform group-hover:translate-x-1" size={24} />
      </div>

      <div className="mb-6">
        <div className={`text-3xl font-black ${account.type === 'credit' && account.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {account.type === 'credit' && account.balance < 0 ? '-' : ''}
          {formatCurrency(account.balance)}
        </div>
        {account.type === 'credit' && (
          <p className="text-sm text-gray-500 font-medium mt-1">
            Available: {formatCurrency(account.availableCredit || 0)}
          </p>
        )}
      </div>

      {/* Account-specific details */}
      {account.type === 'credit' && account.dueDate && (
        <div className="flex items-center justify-between text-sm bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="text-indigo-600" size={18} />
            <span className="text-indigo-700 font-semibold">Due Date</span>
          </div>
          <div className="text-right">
            <div className="font-bold text-indigo-700">{account.dueDate}</div>
            <div className="text-indigo-600 font-medium">{formatCurrency(account.minimumPayment || 0)}</div>
          </div>
        </div>
      )}

      {account.type === 'savings' && account.ytdContributions && (
        <div className="flex items-center justify-between text-sm bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-green-600" size={18} />
            <span className="text-green-700 font-semibold">YTD Contributions</span>
          </div>
          <div className="font-bold text-green-700">
            {formatCurrency(account.ytdContributions)}
          </div>
        </div>
      )}

      {account.type === 'investment' && (
        <div className="flex items-center justify-between text-sm bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-orange-600" size={18} />
            <span className="text-orange-700 font-semibold">Portfolio</span>
          </div>
          <div className="font-bold text-orange-700">+5.2% YTD</div>
        </div>
      )}
    </div>
  );
};