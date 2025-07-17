import React, { useState } from 'react';
import { Transfer, Account } from '../types';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search, 
  Check,
  ArrowUpDown,
  Plus,
  Wallet,
  Building2,
  ChevronRight
} from 'lucide-react';

interface TransfersProps {
  transfers: Transfer[];
  accounts: Account[];
  onTransfer: (transfer: Omit<Transfer, 'id' | 'confirmationCode'>) => void;
}

export const Transfers: React.FC<TransfersProps> = ({ transfers, accounts, onTransfer }) => {
  const [currentView, setCurrentView] = useState<'main' | 'form' | 'review' | 'success'>('main');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferType, setTransferType] = useState<'internal' | 'external'>('internal');
  const [confirmationCode, setConfirmationCode] = useState('');

  // External transfer fields
  const [externalBankName, setExternalBankName] = useState('');
  const [externalAccountNumber, setExternalAccountNumber] = useState('');
  const [externalRoutingNumber, setExternalRoutingNumber] = useState('');
  const [externalAccountHolderName, setExternalAccountHolderName] = useState('');
  const [externalAccountType, setExternalAccountType] = useState('checking');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'scheduled':
        return <Calendar className="text-blue-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : accountId;
  };

  const getAccountBalance = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.balance : 0;
  };

  const handleNext = () => {
    if (currentView === 'form') {
      setCurrentView('review');
    } else if (currentView === 'review') {
      const code = `TRF${Date.now().toString().slice(-8)}`;
      setConfirmationCode(code);
      
      const newTransfer = {
        fromAccount,
        toAccount: transferType === 'internal' ? toAccount : `${externalAccountHolderName} - ${externalBankName}`,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        description: description || 'Transfer',
        type: transferType
      };

      onTransfer(newTransfer);
      setCurrentView('success');
    }
  };

  const handleReset = () => {
    setCurrentView('main');
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setDescription('');
    setConfirmationCode('');
    setExternalBankName('');
    setExternalAccountNumber('');
    setExternalRoutingNumber('');
    setExternalAccountHolderName('');
    setExternalAccountType('checking');
  };

  const isFormValid = fromAccount && amount && parseFloat(amount) > 0 && (
    transferType === 'internal'
      ? toAccount
      : externalBankName && externalAccountNumber && externalRoutingNumber && externalAccountHolderName
  );

  const scheduledAmount = transfers
    .filter(t => t.status === 'scheduled')
    .reduce((sum, t) => sum + t.amount, 0);

  const pastThirtyDays = transfers
    .filter(t => {
      const transferDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transferDate >= thirtyDaysAgo && t.status === 'completed';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Main Transfer Overview
  if (currentView === 'main') {
    return (
      <div className="p-6 pb-32 md:pb-6 space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="gradient-primary rounded-3xl p-8 text-white shadow-glow animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-black mb-2">Transfers</h1>
              <p className="opacity-90 text-lg font-medium">Move money between accounts</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <ArrowUpDown className="text-white" size={32} />
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm opacity-80 font-medium mb-1">Scheduled This Month</div>
                <div className="text-2xl font-black">{formatCurrency(scheduledAmount)}</div>
              </div>
              <div>
                <div className="text-sm opacity-80 font-medium mb-1">Past 30 Days</div>
                <div className="text-2xl font-black">{formatCurrency(pastThirtyDays)}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('form')}
            className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all-smooth transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Plus size={24} />
            <span className="text-lg">New Transfer</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setTransferType('internal');
              setCurrentView('form');
            }}
            className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all-smooth transform hover:scale-105 animate-scale-in"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">Between Accounts</div>
                <div className="text-sm text-gray-600 font-medium">Internal transfer</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setTransferType('external');
              setCurrentView('form');
            }}
            className="glass-effect rounded-2xl p-6 hover:shadow-glow transition-all-smooth transform hover:scale-105 animate-scale-in"
          >
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">External Transfer</div>
                <div className="text-sm text-gray-600 font-medium">To other Banks</div>
              </div>
            </div>
          </button>
        </div>

        {/* Transfer History */}
        <div className="glass-effect rounded-3xl overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Transfers</h2>
            <Search className="text-gray-400" size={20} />
          </div>

          <div className="divide-y divide-gray-100">
            {transfers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ArrowRight className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transfers yet</h3>
                <p className="text-gray-600 mb-6">Start by making your first transfer!</p>
                <button
                  onClick={() => setCurrentView('form')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-glow transition-all-smooth transform hover:scale-105"
                >
                  Make Transfer
                </button>
              </div>
            ) : (
              transfers.map((transfer) => {
                const fromAccountName = getAccountName(transfer.fromAccount);
                const toAccountName = transfer.type === 'internal' ? getAccountName(transfer.toAccount) : transfer.toAccount;

                return (
                  <div key={transfer.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                          {getStatusIcon(transfer.status)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{transfer.description}</div>
                          <div className="text-sm text-gray-600 font-medium">
                            {fromAccountName} → {toAccountName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {transfer.date} • {transfer.confirmationCode}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-gray-900 text-xl">
                          {formatCurrency(transfer.amount)}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full font-bold ${
                          transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                          transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {transfer.status.toUpperCase()}
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
  }

  // Transfer Form
  if (currentView === 'form') {
    return (
      <div className="p-6 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">New Transfer</h1>
            <p className="text-gray-600 font-medium">Step 1 of 3 • Enter details</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-1/3 transition-all-smooth"></div>
        </div>

        <div className="space-y-8">
          {/* Transfer Type */}
          <div className="glass-effect rounded-3xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Transfer Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTransferType('internal')}
                className={`p-6 rounded-2xl border-2 transition-all-smooth transform hover:scale-105 ${
                  transferType === 'internal'
                    ? 'border-blue-500 bg-blue-50 shadow-glow'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                    transferType === 'internal' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Wallet className={transferType === 'internal' ? 'text-white' : 'text-gray-600'} size={24} />
                  </div>
                  <div>
                    <div className={`font-bold ${transferType === 'internal' ? 'text-blue-700' : 'text-gray-900'}`}>
                      Between My Accounts
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Instant transfer</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTransferType('external')}
                className={`p-6 rounded-2xl border-2 transition-all-smooth transform hover:scale-105 ${
                  transferType === 'external'
                    ? 'border-blue-500 bg-blue-50 shadow-glow'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                    transferType === 'external' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Building2 className={transferType === 'external' ? 'text-white' : 'text-gray-600'} size={24} />
                  </div>
                  <div>
                    <div className={`font-bold ${transferType === 'external' ? 'text-blue-700' : 'text-gray-900'}`}>
                      External Transfer
                    </div>
                    <div className="text-sm text-gray-600 font-medium">1-3 business days</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Account Selection */}
          <div className="glass-effect rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Account Details</h3>
            
            {/* From Account */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">From Account</label>
              <select
                value={fromAccount}
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                required
              >
                <option value="">Select account...</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {formatCurrency(account.balance)}
                  </option>
                ))}
              </select>
            </div>

            {/* To Account */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">To Account</label>
              {transferType === 'internal' ? (
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                  required
                >
                  <option value="">Select account...</option>
                  {accounts
                    .filter(account => account.id !== fromAccount)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name} - {formatCurrency(account.balance)}
                      </option>
                    ))}
                </select>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={externalBankName}
                    onChange={(e) => setExternalBankName(e.target.value)}
                    placeholder="Bank Name (e.g., Chase Bank, Bank of America)"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                    required
                  />

                  <input
                    type="text"
                    value={externalAccountHolderName}
                    onChange={(e) => setExternalAccountHolderName(e.target.value)}
                    placeholder="Account Holder Name"
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={externalRoutingNumber}
                      onChange={(e) => setExternalRoutingNumber(e.target.value)}
                      placeholder="Routing Number (9 digits)"
                      maxLength={9}
                      pattern="[0-9]{9}"
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                      required
                    />

                    <input
                      type="text"
                      value={externalAccountNumber}
                      onChange={(e) => setExternalAccountNumber(e.target.value)}
                      placeholder="Account Number"
                      className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                      required
                    />
                  </div>

                  <select
                    value={externalAccountType}
                    onChange={(e) => setExternalAccountType(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
                  >
                    <option value="checking">Checking Account</option>
                    <option value="savings">Savings Account</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Amount and Description */}
          <div className="glass-effect rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Transfer Amount</h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Amount</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border-2 border-gray-200 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-bold text-xl"
                  required
                />
              </div>
              {fromAccount && amount && (
                <div className="mt-3 p-4 bg-blue-50 rounded-2xl">
                  <div className="text-sm font-medium text-blue-700">
                    Remaining balance: {formatCurrency(getAccountBalance(fromAccount) - parseFloat(amount || '0'))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this transfer for?"
                className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all-smooth font-medium"
              />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!isFormValid}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth transform hover:scale-105 text-lg"
          >
            Continue to Review
          </button>
        </div>
      </div>
    );
  }

  // Review Transfer
  if (currentView === 'review') {
    return (
      <div className="p-6 space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setCurrentView('form')}
            className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Review Transfer</h1>
            <p className="text-gray-600 font-medium">Step 2 of 3 • Confirm details</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-2/3 transition-all-smooth"></div>
        </div>

        {/* Transfer Summary */}
        <div className="glass-effect rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Transfer Summary</h3>
          
          <div className="text-center mb-8">
            <div className="text-4xl font-black text-gray-900 mb-2">
              {formatCurrency(parseFloat(amount))}
            </div>
            <div className="text-gray-600 font-medium">Transfer Amount</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600 font-medium">From:</span>
              <span className="font-bold text-gray-900">{getAccountName(fromAccount)}</span>
            </div>
            
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <ArrowRight className="text-white" size={20} />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600 font-medium">To:</span>
              <div className="text-right">
                {transferType === 'internal' ? (
                  <span className="font-bold text-gray-900">{getAccountName(toAccount)}</span>
                ) : (
                  <div>
                    <div className="font-bold text-gray-900">{externalAccountHolderName}</div>
                    <div className="text-sm text-gray-600">{externalBankName}</div>
                    <div className="text-xs text-gray-500">****{externalAccountNumber.slice(-4)}</div>
                  </div>
                )}
              </div>
            </div>

            {description && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-gray-600 font-medium">Description:</span>
                <span className="font-bold text-gray-900">{description}</span>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Transfer Type:</span>
              <span className="font-bold text-gray-900 capitalize">{transferType}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <span className="text-gray-600 font-medium">Processing Time:</span>
              <span className="font-bold text-gray-900">
                {transferType === 'internal' ? 'Instant' : '1-3 business days'}
              </span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">Important Notice</h4>
              <p className="text-blue-800 text-sm font-medium">
                This transfer will be processed immediately and cannot be cancelled once confirmed. 
                Please review all details carefully before proceeding.
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="mt-8">
          <button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-glow transition-all-smooth transform hover:scale-105 text-lg"
          >
            Confirm Transfer
          </button>
        </div>
      </div>
    );
  }

  // Success Page
  if (currentView === 'success') {
    return (
      <div className="p-6 space-y-8 animate-fade-in">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-full transition-all-smooth"></div>
        </div>

        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-glow animate-bounce-subtle">
            <Check className="text-white" size={40} />
          </div>
          
          {/* Success Message */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Transfer Successful!</h1>
            <p className="text-gray-600 text-lg font-medium">Your transfer has been processed successfully</p>
          </div>

          {/* Transfer Details Card */}
          <div className="glass-effect rounded-3xl p-8 space-y-6">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900 mb-2">
                {formatCurrency(parseFloat(amount))}
              </div>
              <div className="text-gray-600 font-medium">Transfer Amount</div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-sm text-blue-600 font-bold mb-2">Confirmation Code</div>
                <div className="text-2xl font-black text-blue-700 font-mono tracking-wider">
                  {confirmationCode}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">From:</span>
                <span className="font-bold text-gray-900">{getAccountName(fromAccount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">To:</span>
                <div className="text-right">
                  {transferType === 'internal' ? (
                    <span className="font-bold text-gray-900">{getAccountName(toAccount)}</span>
                  ) : (
                    <div>
                      <div className="font-bold text-gray-900">{externalAccountHolderName}</div>
                      <div className="text-xs text-gray-500">{externalBankName}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="font-bold text-gray-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className="font-bold text-green-600">COMPLETED</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('form')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-2xl hover:shadow-glow transition-all-smooth transform hover:scale-105 text-lg"
            >
              Make Another Transfer
            </button>
            
            <button
              onClick={handleReset}
              className="w-full border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all-smooth text-lg"
            >
              Back to Transfers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};