import React, { useState } from 'react';
import { Plus, Search, CreditCard, User, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealtimeAllAccountsWithUsers, useRealtimeAllUsers, useAdminCreateAccount, useUpdateAccountBalance } from '../../hooks/useConvexData';
import { Account, User as UserType } from '../../types';

interface AccountManagementProps {
  onNavigate: (page: string) => void;
}

interface AccountWithUser extends Account {
  user?: UserType;
}

export const AccountManagement: React.FC<AccountManagementProps> = ({ onNavigate: _onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState<AccountWithUser | null>(null);

  // Get real-time data from Convex
  const accountsWithUsers = useRealtimeAllAccountsWithUsers(searchTerm) || [];
  const users = useRealtimeAllUsers() || [];

  // Get mutation functions
  const createAccount = useAdminCreateAccount();
  const updateBalance = useUpdateAccountBalance();

  // Transform accounts to match expected format
  const accounts: AccountWithUser[] = accountsWithUsers.map(account => ({
    ...account,
    id: account._id,
    accountNumber: account.account_number,
    routingNumber: account.routing_number,
    creditLimit: account.credit_limit,
    availableCredit: account.available_credit,
    dueDate: account.due_date,
    minimumPayment: account.minimum_payment,
    ytdContributions: account.ytd_contributions,
    user: account.user ? {
      ...account.user,
      _id: account.user.id as any,
      id: account.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } : undefined,
  }));

  const filteredAccounts = accounts.filter(account =>
    account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_number?.includes(searchTerm) ||
    account.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBalanceUpdate = async (accountId: string, amount: number, type: 'add' | 'remove', details: any) => {
    try {
      const account = accounts.find(a => a.id === accountId);
      if (!account) return;

      const { isBulk, bulkTransactions, randomAmounts, description, merchant, category, reference } = details;

      // Use Convex updateAccountBalance function
      const result = await updateBalance({
        accountId: accountId as any, // Type assertion for now
        amount,
        type,
        description: description || 'Admin adjustment',
        category: category || 'Admin',
        merchant: merchant || 'System Admin',
        reference,
        isBulk,
        bulkTransactions,
        randomAmounts,
      });

      if (result.success) {
        console.log('Balance updated successfully');
        setShowBalanceModal(null);
      } else {
        throw new Error(result.error || 'Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      alert('Failed to update balance');
    }
  };

  // Remove loading spinner - show UI immediately

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and balances</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search accounts by name, number, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                account.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {account.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Account Number</p>
                <p className="font-mono text-sm">{account.account_number}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Holder</p>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{account.user?.name || 'N/A'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${parseFloat(account.balance.toString()).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  onClick={() => setShowBalanceModal(account)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-colors"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Add Money</span>
                </button>
                <button
                  onClick={() => setShowBalanceModal(account)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center space-x-1 text-sm transition-colors"
                >
                  <TrendingDown className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new account.'}
          </p>
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <CreateAccountModal
          users={users.map(user => ({ ...user, id: user._id }))}
          onClose={() => setShowCreateModal(false)}
          onSave={() => {}} // Real-time updates will handle refresh
          createAccount={createAccount}
        />
      )}

      {/* Balance Update Modal */}
      {showBalanceModal && (
        <BalanceUpdateModal
          account={showBalanceModal}
          onClose={() => setShowBalanceModal(null)}
          onUpdate={handleBalanceUpdate}
        />
      )}
    </div>
  );
};

// Create Account Modal Component
const CreateAccountModal: React.FC<{
  users: UserType[];
  onClose: () => void;
  onSave: () => void;
  createAccount: any; // Type assertion for now
}> = ({ users, onClose, onSave, createAccount }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    type: 'checking',
    balance: '0',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createAccount({
        user_id: formData.user_id as any, // Type assertion for now
        name: formData.name,
        type: formData.type as any,
        balance: parseFloat(formData.balance),
        routing_number: '123456789', // Default routing number
        status: 'active' as any,
      });

      if (result.success) {
        onSave();
        onClose();
      } else {
        throw new Error(result.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} (@{user.username})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Account Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit</option>
            <option value="investment">Investment</option>
            <option value="loan">Loan</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Initial Balance"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Balance Update Modal Component
const BalanceUpdateModal: React.FC<{
  account: AccountWithUser;
  onClose: () => void;
  onUpdate: (accountId: string, amount: number, type: 'add' | 'remove', details: any) => void;
}> = ({ account, onClose, onUpdate }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'add' | 'remove'>('add');
  const [isBulk, setIsBulk] = useState(false);
  const [bulkTransactions, setBulkTransactions] = useState('');
  const [randomAmounts, setRandomAmounts] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    description: '',
    merchant: '',
    category: 'Admin',
    reference: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numBulkTransactions = parseInt(bulkTransactions) || 1;

    if (numAmount > 0) {
      onUpdate(account.id, numAmount, type, {
        ...transactionDetails,
        isBulk,
        bulkTransactions: numBulkTransactions,
        randomAmounts
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Balance</h2>
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Account: {account.name}</p>
          <p className="text-sm text-gray-600">Current Balance: ${parseFloat(account.balance.toString()).toFixed(2)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setType('add')}
              className={`flex-1 p-2 rounded ${type === 'add' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Add Money
            </button>
            <button
              type="button"
              onClick={() => setType('remove')}
              className={`flex-1 p-2 rounded ${type === 'remove' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              Remove Money
            </button>
          </div>

          <input
            type="number"
            step="0.01"
            placeholder="Total Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isBulk}
                onChange={(e) => setIsBulk(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Split total amount into multiple transactions</span>
            </label>

            {isBulk && (
              <>
                <input
                  type="number"
                  min="2"
                  max="100"
                  placeholder="Number of transactions"
                  value={bulkTransactions}
                  onChange={(e) => setBulkTransactions(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={randomAmounts}
                    onChange={(e) => setRandomAmounts(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Random amounts (realistic distribution)</span>
                </label>
              </>
            )}
          </div>

          <div className="space-y-3 border-t pt-3">
            <h4 className="font-medium text-gray-700">Transaction Details</h4>

            <input
              type="text"
              placeholder="Description (e.g., Direct Deposit, Wire Transfer)"
              value={transactionDetails.description}
              onChange={(e) => setTransactionDetails({...transactionDetails, description: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Merchant/Source (e.g., Employer, Bank Name)"
              value={transactionDetails.merchant}
              onChange={(e) => setTransactionDetails({...transactionDetails, merchant: e.target.value})}
              className="w-full p-2 border rounded"
            />

            <select
              value={transactionDetails.category}
              onChange={(e) => setTransactionDetails({...transactionDetails, category: e.target.value})}
              className="w-full p-2 border rounded"
            >
              <option value="Admin">Admin</option>
              <option value="Deposit">Deposit</option>
              <option value="Transfer">Transfer</option>
              <option value="Payroll">Payroll</option>
              <option value="Investment">Investment</option>
              <option value="Refund">Refund</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Reference Number (optional)"
              value={transactionDetails.reference}
              onChange={(e) => setTransactionDetails({...transactionDetails, reference: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>

          {isBulk && amount && bulkTransactions && (
            <div className="bg-blue-50 p-3 rounded text-sm">
              <p><strong>Preview:</strong></p>
              {randomAmounts ? (
                <p>{bulkTransactions} transactions with random amounts totaling exactly ${parseFloat(amount).toFixed(2)}</p>
              ) : (
                <p>{bulkTransactions} transactions of approximately ${(parseFloat(amount) / parseInt(bulkTransactions)).toFixed(2)} each, totaling exactly ${parseFloat(amount).toFixed(2)}</p>
              )}
              <p className="text-gray-600 mt-1">
                Total {type === 'add' ? 'added to' : 'removed from'} account: ${parseFloat(amount).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              className={`flex-1 text-white p-2 rounded ${
                type === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {type === 'add' ? 'Add' : 'Remove'} ${amount || '0.00'}
              {isBulk && bulkTransactions ? ` (${bulkTransactions} transactions)` : ''}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
