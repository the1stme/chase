# Design Document

## Overview

This design outlines the complete migration from Supabase to Convex for a Banking application. The migration will maintain identical functionality while leveraging Convex's real-time capabilities, type safety, and improved developer experience. The approach prioritizes incremental migration with Git version control to ensure safe rollback at any stage.

The application currently uses Supabase for:
- User authentication (both regular users and admin users)
- Database operations (users, accounts, transactions, transfers, sessions)
- Custom SQL functions for complex operations like transfers
- Admin dashboard functionality (user management, account management, statistics)
- Admin authentication using Supabase Auth

Convex will replace these with:
- Convex Auth for authentication (both user and admin)
- Convex database with schema validation
- Convex functions for business logic
- Real-time subscriptions for live updates
- Admin functions for user/account management
- Dashboard statistics and analytics functions

## Architecture

### Current Supabase Architecture
```
Frontend (React/TypeScript)
    ↓
Supabase Client Library
    ↓
Supabase Database (PostgreSQL)
    ↓
Custom SQL Functions & Triggers
```

### Target Convex Architecture
```
Frontend (React/TypeScript)
    ↓
Convex Client Library
    ↓
Convex Functions (TypeScript)
    ↓
Convex Database (with Schema Validation)
```

### Migration Strategy
The migration will follow a phased approach:

1. **Setup Phase**: Install Convex, configure project structure
2. **Schema Phase**: Define Convex schema matching Supabase tables
3. **Functions Phase**: Implement Convex functions for all database operations
4. **Authentication Phase**: Migrate authentication system
5. **Frontend Phase**: Update frontend to use Convex instead of Supabase
6. **Data Migration Phase**: Transfer existing data from Supabase to Convex
7. **Testing Phase**: Comprehensive testing and validation
8. **Cleanup Phase**: Remove Supabase dependencies

## Components and Interfaces

### 1. Convex Schema Definition

The schema will mirror the existing Supabase structure:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    password: v.string(), // Will be hashed
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    })),
    is_admin: v.boolean(),
  })
  .index("by_username", ["username"])
  .index("by_email", ["email"]),

  sessions: defineTable({
    user_id: v.id("users"),
    token: v.string(),
    expires_at: v.number(), // Unix timestamp
  })
  .index("by_token", ["token"])
  .index("by_user", ["user_id"]),

  accounts: defineTable({
    user_id: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("credit"),
      v.literal("investment"),
      v.literal("loan")
    ),
    balance: v.number(),
    account_number: v.string(),
    routing_number: v.optional(v.string()),
    credit_limit: v.optional(v.number()),
    available_credit: v.optional(v.number()),
    due_date: v.optional(v.string()),
    minimum_payment: v.optional(v.number()),
    apr: v.optional(v.number()),
    ytd_contributions: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("closed")
    ),
  })
  .index("by_user", ["user_id"])
  .index("by_account_number", ["account_number"]),

  transactions: defineTable({
    account_id: v.id("accounts"),
    amount: v.number(),
    type: v.union(v.literal("credit"), v.literal("debit")),
    description: v.string(),
    date: v.string(), // ISO date string
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    location: v.optional(v.string()),
    reference: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    pending: v.boolean(),
    batch_id: v.optional(v.string()),
  })
  .index("by_account", ["account_id"])
  .index("by_date", ["date"])
  .index("by_account_date", ["account_id", "date"]),

  transfers: defineTable({
    from_account_id: v.optional(v.id("accounts")),
    to_account_id: v.optional(v.id("accounts")),
    amount: v.number(),
    date: v.string(), // ISO date string
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    description: v.optional(v.string()),
    reference_code: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("internal"),
      v.literal("external")
    )),
  })
  .index("by_from_account", ["from_account_id"])
  .index("by_to_account", ["to_account_id"])
  .index("by_date", ["date"]),

  account_balance_history: defineTable({
    account_id: v.id("accounts"),
    balance: v.number(),
    change_amount: v.number(),
    change_type: v.string(),
    reference_id: v.optional(v.string()),
    reference_type: v.optional(v.string()),
  })
  .index("by_account", ["account_id"]),
});
```

### 2. Convex Functions

#### Authentication Functions
```typescript
// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Implement login logic with password hashing
  },
});

export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Validate session token
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Remove session
  },
});
```

#### Account Functions
```typescript
// convex/accounts.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserAccounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all accounts for a user
  },
});

export const getAccountById = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    // Get specific account details
  },
});
```

#### Transaction Functions
```typescript
// convex/transactions.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAccountTransactions = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    // Get transactions for an account
  },
});

export const createTransaction = mutation({
  args: {
    account_id: v.id("accounts"),
    amount: v.number(),
    type: v.union(v.literal("credit"), v.literal("debit")),
    description: v.string(),
    date: v.string(),
    category: v.optional(v.string()),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Create transaction and update account balance
  },
});
```

#### Transfer Functions
```typescript
// convex/transfers.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const executeTransfer = mutation({
  args: {
    from_account_id: v.id("accounts"),
    to_account_id: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Atomic transfer operation
    // 1. Create transfer record
    // 2. Create debit transaction
    // 3. Create credit transaction
    // 4. Update account balances
    // 5. Record balance history
  },
});
```

#### Admin Functions
```typescript
// convex/admin.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getDashboardStats = query({
  args: {},
  handler: async (ctx, args) => {
    // Get total users, accounts, balance, recent transactions
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx, args) => {
    // Get all users for admin management
  },
});

export const createUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    is_admin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Create new user with validation
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Update user information
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete user and cascade to accounts/transactions
  },
});

export const getAllAccountsWithUsers = query({
  args: {},
  handler: async (ctx, args) => {
    // Get all accounts with user information for admin
  },
});

export const createAccount = mutation({
  args: {
    user_id: v.id("users"),
    name: v.string(),
    type: v.string(),
    balance: v.number(),
  },
  handler: async (ctx, args) => {
    // Create new account with generated account number
  },
});

export const updateAccountBalance = mutation({
  args: {
    accountId: v.id("accounts"),
    amount: v.number(),
    type: v.union(v.literal("add"), v.literal("remove")),
    description: v.string(),
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    reference: v.optional(v.string()),
    isBulk: v.optional(v.boolean()),
    bulkTransactions: v.optional(v.number()),
    randomAmounts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Admin balance adjustment with transaction creation
  },
});
```

### 3. Frontend Integration Layer

Create an abstraction layer to minimize frontend changes:

```typescript
// src/lib/convex.ts
import { ConvexReactClient } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.VITE_CONVEX_URL!);

// Authentication wrapper
export const auth = {
  login: async (username: string, password: string) => {
    return await convex.mutation(api.auth.login, { username, password });
  },
  
  getSession: async (token: string) => {
    return await convex.query(api.auth.getSession, { token });
  },
  
  logout: async (token: string) => {
    return await convex.mutation(api.auth.logout, { token });
  },
};

// Database operations wrapper
export const database = {
  accounts: {
    getUserAccounts: (userId: string) => 
      convex.query(api.accounts.getUserAccounts, { userId }),
    
    getById: (accountId: string) =>
      convex.query(api.accounts.getAccountById, { accountId }),
  },
  
  transactions: {
    getByAccount: (accountId: string) =>
      convex.query(api.transactions.getAccountTransactions, { accountId }),
    
    create: (transaction: any) =>
      convex.mutation(api.transactions.createTransaction, transaction),
  },
  
  transfers: {
    execute: (transfer: any) =>
      convex.mutation(api.transfers.executeTransfer, transfer),
  },
};
```

### 4. Real-time Integration

Leverage Convex's real-time capabilities:

```typescript
// src/hooks/useRealtimeData.ts
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useRealtimeAccounts = (userId: string) => {
  return useQuery(api.accounts.getUserAccounts, { userId });
};

export const useRealtimeTransactions = (accountId: string) => {
  return useQuery(api.transactions.getAccountTransactions, { accountId });
};
```

## Data Models

### Type Definitions
The existing TypeScript interfaces will be updated to match Convex's generated types:

```typescript
// src/types/convex.ts
import { Doc, Id } from "../../convex/_generated/dataModel";

export type User = Doc<"users">;
export type Account = Doc<"accounts">;
export type Transaction = Doc<"transactions">;
export type Transfer = Doc<"transfers">;
export type Session = Doc<"sessions">;

// Maintain compatibility with existing interfaces
export interface UserSession {
  id: Id<"sessions">;
  user_id: Id<"users">;
  token: string;
  expires_at: number;
}
```

## Error Handling

### Convex Error Handling Strategy
```typescript
// convex/utils/errors.ts
export class ConvexError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ConvexError";
  }
}

export const handleError = (error: any) => {
  if (error instanceof ConvexError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }
  
  return {
    success: false,
    error: {
      message: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
      statusCode: 500,
    },
  };
};
```

### Frontend Error Handling
```typescript
// src/lib/errorHandler.ts
export const handleConvexError = (error: any) => {
  console.error("Convex operation failed:", error);
  
  // Map Convex errors to user-friendly messages
  const errorMap: Record<string, string> = {
    INVALID_CREDENTIALS: "Invalid username or password",
    INSUFFICIENT_FUNDS: "Insufficient funds for this transaction",
    ACCOUNT_NOT_FOUND: "Account not found",
    SESSION_EXPIRED: "Your session has expired. Please log in again.",
  };
  
  return errorMap[error.code] || "An unexpected error occurred";
};
```

## Testing Strategy

### Unit Testing
- Test all Convex functions with mock data
- Validate schema constraints and data validation
- Test error handling scenarios

### Integration Testing
- Test complete user flows (login, transactions, transfers)
- Validate real-time updates
- Test data consistency across operations

### Migration Testing
- Compare Supabase vs Convex results for identical operations
- Validate data integrity after migration
- Performance testing for large datasets

### Test Structure
```typescript
// convex/tests/auth.test.ts
import { convexTest } from "convex-test";
import { api } from "./_generated/api";

test("user login with valid credentials", async () => {
  const t = convexTest(schema);
  
  // Setup test data
  const userId = await t.mutation(api.users.create, {
    username: "testuser",
    password: "hashedpassword",
    // ...
  });
  
  // Test login
  const result = await t.mutation(api.auth.login, {
    username: "testuser",
    password: "testpassword",
  });
  
  expect(result.success).toBe(true);
  expect(result.session).toBeDefined();
});
```

## Security Considerations

### Authentication Security
- Implement proper password hashing (bcrypt)
- Secure session token generation
- Session expiration and cleanup
- Rate limiting for login attempts

### Data Access Control
- Implement user-based data filtering
- Validate user permissions for all operations
- Prevent unauthorized access to other users' data

### Input Validation
- Validate all inputs using Convex validators
- Sanitize user inputs to prevent injection attacks
- Implement business rule validation

## Performance Optimization

### Database Optimization
- Proper indexing strategy for common queries
- Efficient query patterns
- Batch operations where appropriate

### Real-time Optimization
- Selective subscriptions to minimize bandwidth
- Efficient data structures for real-time updates
- Proper cleanup of subscriptions

### Caching Strategy
- Leverage Convex's built-in caching
- Implement client-side caching for static data
- Cache invalidation strategies

## Migration Plan

### Phase 1: Setup and Schema
1. Install Convex dependencies
2. Configure Convex project
3. Define schema matching Supabase structure
4. Set up development environment

### Phase 2: Core Functions
1. Implement authentication functions
2. Implement CRUD operations for all entities
3. Implement complex business logic (transfers)
4. Add comprehensive error handling

### Phase 3: Frontend Integration
1. Create Convex client wrapper
2. Update authentication flow
3. Replace Supabase queries with Convex queries
4. Implement real-time subscriptions

### Phase 4: Data Migration
1. Create data export script for Supabase
2. Create data import script for Convex
3. Validate data integrity
4. Test with production data subset

### Phase 5: Testing and Validation
1. Run comprehensive test suite
2. Performance testing
3. User acceptance testing
4. Security audit

### Phase 6: Deployment and Cleanup
1. Deploy to production
2. Monitor for issues
3. Remove Supabase dependencies
4. Clean up unused code

## Rollback Strategy

### Git-based Rollback
- Each phase will be committed separately
- Feature branches for major changes
- Tags for stable versions
- Detailed commit messages for easy identification

### Data Rollback
- Maintain Supabase data during transition period
- Implement data synchronization if needed
- Quick switch mechanism between backends

### Monitoring and Alerts
- Real-time monitoring of Convex operations
- Error rate monitoring
- Performance metrics tracking
- Automated alerts for critical issues

## Comprehensive Supabase Removal Plan

### Files Requiring Supabase Removal

Based on the codebase analysis, the following files contain Supabase references that must be completely removed:

#### 1. Core Library Files
- `src/lib/supabase.ts` - Complete file removal
- `src/lib/auth.ts` - Replace all Supabase auth functions with Convex equivalents

#### 2. Admin Pages (Critical - Contains Heavy Supabase Usage)
- `src/pages/admin/AdminDashboard.tsx` - Replace all `supabase.from()` calls with Convex queries
- `src/pages/admin/UserManagement.tsx` - Replace user CRUD operations with Convex mutations
- `src/pages/admin/AccountManagement.tsx` - Replace account management with Convex functions
- `src/pages/AdminLogin.tsx` - Replace `adminLogin` with Convex auth

#### 3. Configuration Files
- `package.json` - Remove `@supabase/supabase-js` dependency
- `package-lock.json` - Will be updated automatically when removing dependency
- `vite.config.ts` - Remove Supabase chunk configuration
- `todo.md` - Remove or update Supabase-related todos

#### 4. Database Migration Files (Keep for Reference)
- `supabase/migrations/` - Keep for data structure reference during migration
- `migrations/001_initial_schema.sql` - Keep for reference

### Supabase Usage Patterns to Replace

#### Pattern 1: Database Queries
```typescript
// OLD (Supabase)
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false });

// NEW (Convex)
const users = useQuery(api.admin.getAllUsers);
```

#### Pattern 2: Database Mutations
```typescript
// OLD (Supabase)
const { error } = await supabase
  .from('users')
  .insert([formData]);

// NEW (Convex)
await convex.mutation(api.admin.createUser, formData);
```

#### Pattern 3: Authentication
```typescript
// OLD (Supabase Auth)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// NEW (Convex Auth)
const result = await convex.mutation(api.auth.adminLogin, {
  email,
  password,
});
```

#### Pattern 4: Real-time Subscriptions
```typescript
// OLD (Supabase Realtime)
supabase
  .channel('accounts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, 
    (payload) => { /* handle change */ })
  .subscribe();

// NEW (Convex Real-time)
const accounts = useQuery(api.accounts.getUserAccounts, { userId });
// Automatically updates when data changes
```

### Admin Functionality Migration Details

#### AdminDashboard.tsx Specific Changes
1. Replace `supabase.from('users').select('*', { count: 'exact', head: true })` with `api.admin.getDashboardStats`
2. Replace `supabase.from('accounts').select('balance')` with Convex aggregation query
3. Replace `supabase.from('transactions').select('*', { count: 'exact', head: true })` with Convex query

#### UserManagement.tsx Specific Changes
1. Replace `supabase.from('users').select('*').order('created_at', { ascending: false })` with `api.admin.getAllUsers`
2. Replace `supabase.from('users').delete().eq('id', userId)` with `api.admin.deleteUser`
3. Replace `supabase.from('users').update(updateData).eq('id', user.id)` with `api.admin.updateUser`
4. Replace `supabase.from('users').insert([formData])` with `api.admin.createUser`

#### AccountManagement.tsx Specific Changes
1. Replace complex join query with `api.admin.getAllAccountsWithUsers`
2. Replace `supabase.rpc('generate_account_number')` with Convex function
3. Replace bulk transaction insertion with `api.admin.updateAccountBalance`
4. Replace `supabase.from('accounts').insert([...])` with `api.admin.createAccount`

### Removal Checklist

#### Phase 1: Dependency Removal
- [ ] Remove `@supabase/supabase-js` from package.json
- [ ] Run `npm install` to update package-lock.json
- [ ] Remove Supabase chunk from vite.config.ts
- [ ] Delete `src/lib/supabase.ts` file

#### Phase 2: Authentication Migration
- [ ] Replace all functions in `src/lib/auth.ts` with Convex equivalents
- [ ] Update `src/pages/AdminLogin.tsx` to use Convex auth
- [ ] Test authentication flows

#### Phase 3: Admin Pages Migration
- [ ] Update `src/pages/admin/AdminDashboard.tsx` with Convex queries
- [ ] Update `src/pages/admin/UserManagement.tsx` with Convex mutations
- [ ] Update `src/pages/admin/AccountManagement.tsx` with Convex functions
- [ ] Test all admin functionality

#### Phase 4: Import Statement Cleanup
- [ ] Search and remove all `import { supabase }` statements
- [ ] Search and remove all `from '../lib/supabase'` imports
- [ ] Replace with appropriate Convex imports

#### Phase 5: Verification
- [ ] Run `grep -r "supabase" src/` to find any remaining references
- [ ] Run `grep -r "@supabase" .` to find any remaining package references
- [ ] Ensure no TypeScript errors related to missing Supabase types
- [ ] Test entire application functionality

### Terminal Commands for Supabase Audit

```bash
# Find all Supabase references in source code
find src/ -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "supabase"

# Find all Supabase imports
find src/ -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "@supabase"

# Find all Supabase function calls
find src/ -type f -name "*.ts" -o -name "*.tsx" | xargs grep -n "supabase\."

# Check package.json for Supabase dependencies
grep -n "supabase" package.json

# Check configuration files
grep -r "supabase" *.config.* *.json *.md
```

### Post-Migration Validation

#### Functional Validation
1. All user authentication works (login, logout, session management)
2. All admin authentication works (admin login, admin functions)
3. All CRUD operations work (create, read, update, delete)
4. All business logic works (transfers, balance updates)
5. Real-time updates work correctly
6. All admin dashboard statistics display correctly
7. User management functions work (create, edit, delete users)
8. Account management functions work (create accounts, update balances)

#### Technical Validation
1. No Supabase imports remain in codebase
2. No Supabase dependencies in package.json
3. No Supabase configuration in build files
4. All TypeScript types are properly defined
5. No runtime errors related to missing Supabase
6. Performance is acceptable or improved
7. Real-time functionality works as expected

#### Security Validation
1. Authentication is properly secured
2. Authorization checks are in place
3. Data access is properly restricted
4. Admin functions are properly protected
5. Session management is secure