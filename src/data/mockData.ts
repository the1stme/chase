// ==============================================
// MOCK DATA
// ==============================================
// Realistic financial data for development and demo purposes
// Replace with actual API calls in production

import { Account, Transaction, Transfer, User } from '../types';

export const mockUser: User = {
  id: 'user-001',
  name: 'Everett Wise',
  email: 'everett.wise@everwise.com',
  phone: '(555) 123-4567',
  address: {
    street: '1234 Financial Way',
    city: 'Prosperity',
    state: 'CA',
    zip: '90210'
  }
};

export const mockAccounts: Account[] = [
  {
    id: 'acc-001',
    name: 'PNCSHARE',
    type: 'checking',
    balance: 6123.00,
    accountNumber: '****1234',
    routingNumber: '321174851'
  },
  {
    id: 'acc-002',
    name: 'PLATINUM REWARDS',
    type: 'credit',
    balance: -1234.56,
    accountNumber: '****5678',
    creditLimit: 15000,
    availableCredit: 13765.44,
    dueDate: '2023-10-28',
    minimumPayment: 103.00,
    apr: 18.99
  },
  {
    id: 'acc-003',
    name: 'HEALTH SAVINGS',
    type: 'savings',
    balance: 4653.90,
    accountNumber: '****9012',
    routingNumber: '321174851',
    ytdContributions: 3165.00
  },
  {
    id: 'acc-004',
    name: 'GROWTH PORTFOLIO',
    type: 'investment',
    balance: 12847.32,
    accountNumber: '****3456'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    accountId: 'acc-001',
    amount: -45.67,
    type: 'debit',
    description: 'GROCERY MART #142',
    date: '2023-10-25',
    category: 'Groceries',
    merchant: 'Grocery Mart',
    location: 'Los Angeles, CA',
    reference: 'REF: GM142567'
  },
  {
    id: 'txn-002',
    accountId: 'acc-001',
    amount: 2840.00,
    type: 'credit',
    description: 'DIRECT DEPOSIT PAYROLL',
    date: '2023-10-24',
    category: 'Income',
    reference: 'REF: DD240567'
  },
  {
    id: 'txn-003',
    accountId: 'acc-002',
    amount: -89.99,
    type: 'debit',
    description: 'ONLINE PURCHASE - TECH STORE',
    date: '2023-10-23',
    category: 'Shopping',
    merchant: 'Tech StoreBank',
    reference: 'REF: TS789012',
    pending: true
  },
  {
    id: 'txn-004',
    accountId: 'acc-001',
    amount: -1200.00,
    type: 'debit',
    description: 'RENT PAYMENT - PROP MGMT',
    date: '2023-10-01',
    category: 'Housing',
    reference: 'REF: PM100123'
  },
  {
    id: 'txn-005',
    accountId: 'acc-003',
    amount: 500.00,
    type: 'credit',
    description: 'HSA CONTRIBUTION',
    date: '2023-09-30',
    category: 'Health',
    reference: 'REF: HSA300923'
  }
];

export const mockTransfers: Transfer[] = [
  {
    id: 'trf-001',
    fromAccount: 'acc-001',
    toAccount: 'ext-savings',
    amount: 25.00,
    date: '2023-10-24',
    status: 'completed',
    description: 'PRIMARY SHARE',
    confirmationCode: 'TRF2410241567',
    type: 'external'
  },
  {
    id: 'trf-002',
    fromAccount: 'acc-001',
    toAccount: 'ext-savings',
    amount: 1.00,
    date: '2023-10-06',
    status: 'completed',
    description: 'PRIMARY SHARE',
    confirmationCode: 'TRF0610061892',
    type: 'external'
  },
  {
    id: 'trf-003',
    fromAccount: 'acc-001',
    toAccount: 'acc-003',
    amount: 300.00,
    date: '2023-10-28',
    status: 'scheduled',
    description: 'Monthly HSA Contribution',
    confirmationCode: 'TRF2810282345',
    type: 'internal'
  }
];

// Example login credentials for testing
export const DEMO_CREDENTIALS = {
  username: 'everett.wise',
  password: 'demo123'
};