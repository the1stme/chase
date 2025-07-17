import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Get total users
      const users = await ctx.db.query("users").collect();
      const totalUsers = users.length;

      // Get total accounts
      const accounts = await ctx.db.query("accounts").collect();
      const totalAccounts = accounts.length;

      // Calculate total balance across all accounts
      const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

      // Get recent transactions (last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentTransactions = await ctx.db
        .query("transactions")
        .filter((q) => q.gte(q.field("created_at"), sevenDaysAgo))
        .collect();

      return {
        totalUsers,
        totalAccounts,
        totalBalance,
        recentTransactions: recentTransactions.length,
      };
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return {
        totalUsers: 0,
        totalAccounts: 0,
        totalBalance: 0,
        recentTransactions: 0,
      };
    }
  },
});

/**
 * Get all users for admin management
 */
export const getAllUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      let users = await ctx.db.query("users").order("desc").collect();

      // Filter by search term if provided
      if (args.searchTerm) {
        const searchLower = args.searchTerm.toLowerCase();
        users = users.filter(user => 
          user.username.toLowerCase().includes(searchLower) ||
          (user.name && user.name.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower))
        );
      }

      // Apply limit if provided
      if (args.limit) {
        users = users.slice(0, args.limit);
      }

      // Return users without passwords
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
          updated_at: user.updated_at ? new Date(user.updated_at).toISOString() : new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error("Get all users error:", error);
      return [];
    }
  },
});

/**
 * Get all accounts with user information for admin
 */
export const getAllAccountsWithUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      let accounts = await ctx.db.query("accounts").order("desc").collect();

      // Get user information for each account
      const accountsWithUsers = await Promise.all(
        accounts.map(async (account) => {
          const user = await ctx.db.get(account.user_id);
          return {
            ...account,
            user: user ? {
              id: user._id,
              username: user.username,
              name: user.name,
              email: user.email,
              phone: user.phone,
              is_admin: user.is_admin,
            } : null,
            created_at: account.created_at ? new Date(account.created_at).toISOString() : new Date().toISOString(),
            updated_at: account.updated_at ? new Date(account.updated_at).toISOString() : new Date().toISOString(),
          };
        })
      );

      // Filter by search term if provided
      let filteredAccounts = accountsWithUsers;
      if (args.searchTerm) {
        const searchLower = args.searchTerm.toLowerCase();
        filteredAccounts = accountsWithUsers.filter(account => 
          account.name.toLowerCase().includes(searchLower) ||
          account.account_number.includes(searchLower) ||
          (account.user?.username && account.user.username.toLowerCase().includes(searchLower)) ||
          (account.user?.name && account.user.name.toLowerCase().includes(searchLower))
        );
      }

      // Apply limit if provided
      if (args.limit) {
        filteredAccounts = filteredAccounts.slice(0, args.limit);
      }

      return filteredAccounts;
    } catch (error) {
      console.error("Get all accounts with users error:", error);
      return [];
    }
  },
});

/**
 * Admin function to create a new user
 */
export const createUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    })),
    is_admin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if username already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Check if email already exists (if provided)
      if (args.email) {
        const existingEmail = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", args.email))
          .first();

        if (existingEmail) {
          throw new Error("Email already exists");
        }
      }

      const now = Date.now();

      // Create user (plain text password)
      const userId = await ctx.db.insert("users", {
        username: args.username,
        password: args.password, // Plain text password
        name: args.name,
        email: args.email,
        phone: args.phone,
        address: args.address,
        is_admin: args.is_admin || false,
        created_at: now,
        updated_at: now,
      });

      // Return user without password
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("Failed to create user");
      }

      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: {
          ...userWithoutPassword,
          created_at: new Date(userWithoutPassword.created_at || now).toISOString(),
          updated_at: new Date(userWithoutPassword.updated_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Admin create user error:", error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  },
});

/**
 * Admin function to update a user
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    })),
    is_admin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const { userId, ...updateData } = args;
      
      // Get existing user
      const existingUser = await ctx.db.get(userId);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Check username uniqueness if updating username
      if (updateData.username && updateData.username !== existingUser.username) {
        const usernameExists = await ctx.db
          .query("users")
          .withIndex("by_username", (q) => q.eq("username", updateData.username!))
          .first();

        if (usernameExists) {
          throw new Error("Username already exists");
        }
      }

      // Check email uniqueness if updating email
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", updateData.email!))
          .first();

        if (emailExists) {
          throw new Error("Email already exists");
        }
      }

      // Prepare update object
      const updateObject: any = {
        updated_at: Date.now(),
      };

      // Add fields to update
      if (updateData.username !== undefined) updateObject.username = updateData.username;
      if (updateData.name !== undefined) updateObject.name = updateData.name;
      if (updateData.email !== undefined) updateObject.email = updateData.email;
      if (updateData.phone !== undefined) updateObject.phone = updateData.phone;
      if (updateData.address !== undefined) updateObject.address = updateData.address;
      if (updateData.is_admin !== undefined) updateObject.is_admin = updateData.is_admin;

      // Update password if provided (plain text)
      if (updateData.password) {
        updateObject.password = updateData.password;
      }

      // Update user
      await ctx.db.patch(userId, updateObject);

      // Return updated user without password
      const updatedUser = await ctx.db.get(userId);
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }

      const { password, ...userWithoutPassword } = updatedUser;
      return {
        success: true,
        user: {
          ...userWithoutPassword,
          created_at: new Date(userWithoutPassword.created_at || Date.now()).toISOString(),
          updated_at: new Date(userWithoutPassword.updated_at || Date.now()).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Admin update user error:", error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  },
});

/**
 * Admin function to delete a user and all associated data
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      // Get user to verify existence
      const user = await ctx.db.get(args.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Delete all user sessions
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("user_id", args.userId))
        .collect();

      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }

      // Get all user accounts
      const accounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("user_id", args.userId))
        .collect();

      // Delete all transactions for user accounts
      for (const account of accounts) {
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("by_account", (q) => q.eq("account_id", account._id))
          .collect();

        for (const transaction of transactions) {
          await ctx.db.delete(transaction._id);
        }

        // Delete balance history for account
        const balanceHistory = await ctx.db
          .query("account_balance_history")
          .withIndex("by_account", (q) => q.eq("account_id", account._id))
          .collect();

        for (const history of balanceHistory) {
          await ctx.db.delete(history._id);
        }

        // Delete account
        await ctx.db.delete(account._id);
      }

      // Delete transfers involving user accounts
      const accountIds = accounts.map(a => a._id);
      for (const accountId of accountIds) {
        const fromTransfers = await ctx.db
          .query("transfers")
          .withIndex("by_from_account", (q) => q.eq("from_account_id", accountId))
          .collect();

        const toTransfers = await ctx.db
          .query("transfers")
          .withIndex("by_to_account", (q) => q.eq("to_account_id", accountId))
          .collect();

        for (const transfer of [...fromTransfers, ...toTransfers]) {
          await ctx.db.delete(transfer._id);
        }
      }

      // Finally, delete the user
      await ctx.db.delete(args.userId);

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Admin delete user error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  },
});

/**
 * Admin function to create a new account
 */
export const createAccount = mutation({
  args: {
    user_id: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("credit"),
      v.literal("investment"),
      v.literal("loan")
    ),
    balance: v.optional(v.number()),
    routing_number: v.optional(v.string()),
    credit_limit: v.optional(v.number()),
    available_credit: v.optional(v.number()),
    due_date: v.optional(v.string()),
    minimum_payment: v.optional(v.number()),
    apr: v.optional(v.number()),
    ytd_contributions: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("closed")
    )),
  },
  handler: async (ctx, args) => {
    try {
      // Verify user exists
      const user = await ctx.db.get(args.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      // Generate unique account number
      let accountNumber: string;
      let attempts = 0;
      const maxAttempts = 10;
      let existing = null;

      do {
        accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        attempts++;

        if (attempts > maxAttempts) {
          throw new Error("Failed to generate unique account number");
        }

        existing = await ctx.db
          .query("accounts")
          .withIndex("by_account_number", (q: any) => q.eq("account_number", accountNumber))
          .first();

      } while (existing !== null);

      const now = Date.now();
      const balance = args.balance || 0;
      const status = args.status || "active";
      const routingNumber = args.routing_number || "123456789"; // Default routing number

      // For credit accounts, set available credit equal to credit limit
      let availableCredit = args.available_credit;
      if (args.type === "credit" && args.credit_limit && !availableCredit) {
        availableCredit = args.credit_limit;
      }

      // Create account
      const accountId = await ctx.db.insert("accounts", {
        user_id: args.user_id,
        name: args.name,
        type: args.type,
        balance,
        account_number: accountNumber,
        routing_number: routingNumber,
        credit_limit: args.credit_limit,
        available_credit: availableCredit,
        due_date: args.due_date,
        minimum_payment: args.minimum_payment,
        apr: args.apr,
        ytd_contributions: args.ytd_contributions,
        status,
        created_at: now,
        updated_at: now,
      });

      // Create initial balance history record
      await ctx.db.insert("account_balance_history", {
        account_id: accountId,
        balance,
        change_amount: balance,
        change_type: "initial",
        reference_id: accountId,
        reference_type: "account_creation",
        created_at: now,
      });

      // Return created account
      const account = await ctx.db.get(accountId);
      return {
        success: true,
        account: {
          ...account!,
          created_at: new Date(account!.created_at || now).toISOString(),
          updated_at: new Date(account!.updated_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Admin create account error:", error);
      return {
        success: false,
        account: null,
        error: error instanceof Error ? error.message : "Failed to create account",
      };
    }
  },
});

/**
 * Admin function to update account balance with transaction logging
 */
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
    try {
      // Get account
      const account = await ctx.db.get(args.accountId);
      if (!account) {
        throw new Error("Account not found");
      }

      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];

      if (args.isBulk && args.bulkTransactions) {
        // Create multiple transactions for bulk operation
        const transactions = [];
        let totalAmount = 0;

        for (let i = 0; i < args.bulkTransactions; i++) {
          let transactionAmount = args.amount;

          if (args.randomAmounts) {
            // Generate random amount between 10% and 200% of base amount
            const multiplier = 0.1 + Math.random() * 1.9;
            transactionAmount = Math.round(args.amount * multiplier * 100) / 100;
          }

          // Determine actual amount based on type
          const actualAmount = args.type === "add" ? transactionAmount : -transactionAmount;
          const transactionType = args.type === "add" ? "credit" : "debit";
          totalAmount += actualAmount;

          // Create transaction
          const transactionId = await ctx.db.insert("transactions", {
            account_id: args.accountId,
            amount: actualAmount,
            type: transactionType,
            description: args.description,
            date: today,
            category: args.category || "Admin Adjustment",
            merchant: args.merchant,
            reference: args.reference,
            pending: false,
            created_at: now,
          });

          transactions.push(transactionId);
        }

        // Update account balance
        const newBalance = account.balance + totalAmount;
        await ctx.db.patch(args.accountId, {
          balance: newBalance,
          updated_at: now,
        });

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: args.accountId,
          balance: newBalance,
          change_amount: totalAmount,
          change_type: "bulk_adjustment",
          reference_id: args.accountId,
          reference_type: "admin_bulk_adjustment",
          created_at: now,
        });

        return {
          success: true,
          newBalance,
          transactionsCreated: transactions.length,
          error: null,
        };
      } else {
        // Single transaction
        const actualAmount = args.type === "add" ? args.amount : -args.amount;
        const transactionType = args.type === "add" ? "credit" : "debit";

        // Create transaction
        const transactionId = await ctx.db.insert("transactions", {
          account_id: args.accountId,
          amount: actualAmount,
          type: transactionType,
          description: args.description,
          date: today,
          category: args.category || "Admin Adjustment",
          merchant: args.merchant,
          reference: args.reference,
          pending: false,
          created_at: now,
        });

        // Update account balance
        const newBalance = account.balance + actualAmount;
        await ctx.db.patch(args.accountId, {
          balance: newBalance,
          updated_at: now,
        });

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: args.accountId,
          balance: newBalance,
          change_amount: actualAmount,
          change_type: "admin_adjustment",
          reference_id: transactionId,
          reference_type: "transaction",
          created_at: now,
        });

        return {
          success: true,
          newBalance,
          transactionId,
          error: null,
        };
      }
    } catch (error) {
      console.error("Admin update account balance error:", error);
      return {
        success: false,
        newBalance: null,
        error: error instanceof Error ? error.message : "Failed to update account balance",
      };
    }
  },
});

/**
 * Internal mutation to create a user with pre-hashed password
 */
export const createUserInternal = mutation({
  args: {
    username: v.string(),
    password: v.string(), // Already hashed
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zip: v.string(),
    })),
    is_admin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if username already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (existingUser) {
        throw new Error("Username already exists");
      }

      // Check if email already exists (if provided)
      if (args.email) {
        const existingEmail = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", args.email))
          .first();

        if (existingEmail) {
          throw new Error("Email already exists");
        }
      }

      const now = Date.now();

      // Create user with pre-hashed password
      const userId = await ctx.db.insert("users", {
        username: args.username,
        password: args.password, // Already hashed
        name: args.name,
        email: args.email,
        phone: args.phone,
        address: args.address,
        is_admin: args.is_admin || false,
        created_at: now,
        updated_at: now,
      });

      // Return user without password
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("Failed to create user");
      }

      const { password, ...userWithoutPassword } = user;
      return {
        success: true,
        user: {
          ...userWithoutPassword,
          created_at: new Date(userWithoutPassword.created_at || now).toISOString(),
          updated_at: new Date(userWithoutPassword.updated_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Admin create user internal error:", error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  },
});


