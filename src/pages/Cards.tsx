// ==============================================
// CARDS PAGE
// ==============================================
// Manage credit/debit cards with controls and details
// Customize card display based on your card types

import React, { useState } from 'react';
import { Card, Account } from '../types';
import { 
  CreditCard, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Plane, 
  RefreshCw, 
  Shield,
  Star,
  Upload,
  Puzzle
} from 'lucide-react';

interface CardsProps {
  cards: Card[];
  accounts: Account[];
  onCardToggle: (cardId: string, newStatus: 'active' | 'locked') => void;
}

export const Cards: React.FC<CardsProps> = ({ cards, accounts, onCardToggle }) => {
  const [showCardNumber, setShowCardNumber] = useState<Record<string, boolean>>({});

  const toggleCardVisibility = (cardId: string) => {
    setShowCardNumber(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const formatCardNumber = (cardNumber: string, show: boolean) => {
    if (show) {
      return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    }
    return cardNumber;
  };

  const getCardAccount = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    return accounts.find(acc => acc.id === card?.accountId);
  };

  if (cards.length === 0) {
    return (
      <div className="p-4 pb-24 md:pb-4">
        <div className="text-center py-12">
          <CreditCard className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Cards Found</h2>
          <p className="text-gray-500 mb-6">You don't have any active cards yet.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
            Request New Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 md:pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Card Services</h1>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          + New Card
        </button>
      </div>

      {cards.map((card) => {
        const account = getCardAccount(card.id);
        const isVisible = showCardNumber[card.id] || false;

        return (
          <div key={card.id} className="space-y-4">
            {/* Card Display */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-sm opacity-80 mb-1">PLATINUM REWARDS</div>
                    <div className="text-sm opacity-80">CARD</div>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                      <span className="text-xs font-bold">💳</span>
                    </div>
                  </div>
                </div>

                {/* Card Holder Name */}
                <div className="mb-6">
                  <div className="text-sm opacity-80 mb-1">PRIMARY CARD HOLDER</div>
                  <div className="text-lg font-semibold">{card.holderName}</div>
                </div>

                {/* Card Number */}
                <div className="mb-4">
                  <div className="text-sm opacity-80 mb-1">CARD NUMBER</div>
                  <div className="text-lg font-mono tracking-wider">
                    {formatCardNumber(card.cardNumber, isVisible)}
                  </div>
                </div>

                {/* Card Details */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-sm opacity-80 mb-1">VALID THRU</div>
                    <div className="text-sm">{card.expiryDate}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">VISA</div>
                  </div>
                </div>

                {/* Contactless Symbol */}
                <div className="absolute top-4 right-16 text-white opacity-60">
                  <div className="w-6 h-6 rounded-full border-2 border-current"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-current -mt-4 ml-2"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-current -mt-4 ml-4"></div>
                </div>
              </div>

              {/* Card Indicators */}
              <div className="flex justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>

            {/* Card Controls */}
            <div className="bg-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm opacity-80">LOCKED</span>
                <div className="flex items-center">
                  <button
                    onClick={() => onCardToggle(
                      card.id, 
                      card.status === 'active' ? 'locked' : 'active'
                    )}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      card.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        card.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium">
                    {card.status === 'active' ? 'ACTIVE' : 'LOCKED'}
                  </span>
                </div>
              </div>

              {/* Card Account Info */}
              {account && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">NEXT PAYMENT AMOUNT</span>
                    <span>${account.minimumPayment?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">PAYMENT DUE DATE</span>
                    <span>{account.dueDate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">CURRENT BALANCE</span>
                    <span>${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">AVAILABLE CREDIT</span>
                    <span>${account.availableCredit?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid grid-cols-1 gap-4">
                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Plane className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">TRAVEL PLANS</span>
                </button>

                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Star className="text-green-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">REWARDS</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <RefreshCw className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">REPLACE CARD</span>
                </button>

                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                    <Upload className="text-orange-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">MAKE A PAYMENT</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="text-red-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">UPDATE PIN</span>
                </button>

                <button className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                    <Puzzle className="text-indigo-600" size={20} />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700">CARD CONNECT</span>
                </button>
              </div>
            </div>

            {/* Additional Card Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Card Details</h3>
                <button
                  onClick={() => toggleCardVisibility(card.id)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="text-sm">{isVisible ? 'Hide' : 'Show'} Number</span>
                </button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Status</span>
                  <span className={`font-medium ${
                    card.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Card Type</span>
                  <span className="font-medium text-gray-900">{card.cardType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date</span>
                  <span className="font-medium text-gray-900">01/24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual Fee</span>
                  <span className="font-medium text-gray-900">$0.00</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};