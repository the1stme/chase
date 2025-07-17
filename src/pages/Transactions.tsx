// ==============================================
// TRANSACTIONS PAGE
// ==============================================
// View and filter transaction history
// Customize categories and transaction types as needed

import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import {
  Search,
  Filter,
  Calendar,
  Download,
  ChevronDown,
  MapPin,
  Clock,
  ShoppingCart,
  Wallet,
  Home,
  Heart,
  Car,
  Film,
  Utensils,
  Zap,
  CreditCard,
  ArrowRightLeft,
  Building2
} from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, accounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30'); // days
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category))];
    return cats.sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.merchant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => (t.accountId || (t as any).account_id) === selectedAccount);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, selectedAccount, selectedCategory, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTransactionIcon = (category: string, type: string) => {
    // Handle special categories first
    if (category === 'Transfer') return ArrowRightLeft;
    if (category === 'Admin') return Building2;
    if (category === 'Payroll' || category === 'Deposit') return Wallet;

    // Handle other categories
    const iconMap: Record<string, any> = {
      'Groceries': ShoppingCart,
      'Income': Wallet,
      'Shopping': ShoppingCart,
      'Housing': Home,
      'Health': Heart,
      'Transportation': Car,
      'Entertainment': Film,
      'Dining': Utensils,
      'Utilities': Zap,
      'Investment': Wallet,
      'Refund': Wallet,
      'Other': CreditCard,
      'Default': CreditCard
    };
    return iconMap[category] || iconMap['Default'];
  };

  const getTotalByType = () => {
    const credits = filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const debits = filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { credits, debits };
  };

  const { credits, debits } = getTotalByType();

  return (
    <div className="p-4 pb-24 md:pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
          <Download size={16} />
          <span className="text-sm font-medium">Export</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-sm text-green-600 mb-1">Money In</div>
          <div className="text-2xl font-bold text-green-700">+{formatCurrency(credits)}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-sm text-red-600 mb-1">Money Out</div>
          <div className="text-2xl font-bold text-red-700">-{formatCurrency(debits)}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <Filter size={16} />
          <span className="text-sm font-medium">Filters</span>
          <ChevronDown 
            size={16} 
            className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account</label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={24} />
              </div>
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const accountId = transaction.accountId || (transaction as any).account_id;
              const account = accounts.find(acc => acc.id === accountId);
              
              return (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Transaction Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <div className={`${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {React.createElement(getTransactionIcon(transaction.category, transaction.type), {
                          size: 20
                        })}
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {transaction.description}
                        </h3>
                        {transaction.pending && (
                          <span className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            <Clock size={12} />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{formatDate(transaction.date)}</span>
                          <span className="mx-2">•</span>
                          <span>{account?.name}</span>
                        </div>
                        
                        {transaction.merchant && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin size={12} className="mr-1" />
                            <span>{transaction.merchant}</span>
                            {transaction.location && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{transaction.location}</span>
                              </>
                            )}
                          </div>
                        )}
                        
                        {transaction.reference && (
                          <div className="text-xs text-gray-400">
                            {transaction.reference}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.category}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};