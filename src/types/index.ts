// ==============================================
// TYPE DEFINITIONS
// ==============================================
// Central location for all TypeScript interfaces and types
// Updated to match Convex data structure

import { Id } from "../../convex/_generated/dataModel";

export interface Account {
  _id: Id<"accounts">;
  id: string; // For backward compatibility
  user_id: Id<"users">;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'loan';
  balance: number;
  account_number: string;
  accountNumber: string; // For backward compatibility
  routing_number?: string;
  routingNumber?: string; // For backward compatibility
  credit_limit?: number;
  creditLimit?: number; // For backward compatibility
  available_credit?: number;
  availableCredit?: number; // For backward compatibility
  due_date?: string;
  dueDate?: string; // For backward compatibility
  minimum_payment?: number;
  minimumPayment?: number; // For backward compatibility
  apr?: number;
  ytd_contributions?: number;
  ytdContributions?: number; // For backward compatibility
  status: 'active' | 'inactive' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  _id: Id<"transactions">;
  id: string; // For backward compatibility
  account_id: Id<"accounts">;
  accountId: string; // For backward compatibility
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: string;
  category?: string;
  pending: boolean;
  merchant?: string;
  location?: string;
  reference?: string;
  receipt_number?: string;
  batch_id?: string;
  created_at: string;
}

export interface Transfer {
  _id: Id<"transfers">;
  id: string; // For backward compatibility
  from_account_id?: Id<"accounts">;
  fromAccount: string; // For backward compatibility
  to_account_id?: Id<"accounts">;
  toAccount: string; // For backward compatibility
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description?: string;
  reference_code?: string;
  confirmationCode: string; // For backward compatibility
  type?: 'internal' | 'external';
  created_at: string;
}

export interface User {
  _id: Id<"users">; // Convex ID
  id: string; // Primary identifier (same as _id)
  username: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransferResult {
  success: boolean;
  transfer_id: Id<"transfers"> | null;
  transferId: string; // For backward compatibility
  from_transaction_id: Id<"transactions"> | null;
  fromTransactionId: string; // For backward compatibility
  to_transaction_id: Id<"transactions"> | null;
  toTransactionId: string; // For backward compatibility
  reference_code: string | null;
  error: string | null;
}