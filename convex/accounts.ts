import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a unique account number
 */
async function generateAccountNumber(ctx: any): Promise<string> {
  let accountNumber: string;
  let attempts = 0;
  const maxAttempts = 10;
  let existing = null;

  do {
    // Generate a random 10-digit number
    accountNumber = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    attempts++;

    if (attempts > maxAttempts) {
      throw new Error("Failed to generate unique account number");
    }

    // Check if it already exists
    existing = await ctx.db
      .query("accounts")
      .withIndex("by_account_number", (q: any) => q.eq("account_number", accountNumber))
      .first();

  } while (existing !== null);

  return accountNumber;
}

/**
 * Get all accounts for a user
 */
export const getUserAccounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const accounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("user_id", args.userId))
        .collect();

      return accounts.map(account => ({
        ...account,
        created_at: account.created_at ? new Date(account.created_at).toISOString() : new Date().toISOString(),
        updated_at: account.updated_at ? new Date(account.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get user accounts error:", error);
      return [];
    }
  },
});

/**
 * Get account by ID
 */
export const getAccountById = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    try {
      const account = await ctx.db.get(args.accountId);
      if (!account) {
        return null;
      }

      return {
        ...account,
        created_at: account.created_at ? new Date(account.created_at).toISOString() : new Date().toISOString(),
        updated_at: account.updated_at ? new Date(account.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get account by ID error:", error);
      return null;
    }
  },
});

/**
 * Create a new account
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
      const accountNumber = await generateAccountNumber(ctx);
      const now = Date.now();

      // Set default values
      const balance = args.balance || 0;
      const status = args.status || "active";

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
        routing_number: args.routing_number,
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
      console.error("Create account error:", error);
      return {
        success: false,
        account: null,
        error: error instanceof Error ? error.message : "Failed to create account",
      };
    }
  },
});

/**
 * Update account information
 */
export const updateAccount = mutation({
  args: {
    accountId: v.id("accounts"),
    name: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("checking"),
      v.literal("savings"),
      v.literal("credit"),
      v.literal("investment"),
      v.literal("loan")
    )),
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
      const { accountId, ...updateData } = args;
      
      // Get existing account
      const existingAccount = await ctx.db.get(accountId);
      if (!existingAccount) {
        throw new Error("Account not found");
      }

      // Prepare update object
      const updateObject: any = {
        updated_at: Date.now(),
      };

      // Add fields to update
      if (updateData.name !== undefined) updateObject.name = updateData.name;
      if (updateData.type !== undefined) updateObject.type = updateData.type;
      if (updateData.routing_number !== undefined) updateObject.routing_number = updateData.routing_number;
      if (updateData.credit_limit !== undefined) updateObject.credit_limit = updateData.credit_limit;
      if (updateData.available_credit !== undefined) updateObject.available_credit = updateData.available_credit;
      if (updateData.due_date !== undefined) updateObject.due_date = updateData.due_date;
      if (updateData.minimum_payment !== undefined) updateObject.minimum_payment = updateData.minimum_payment;
      if (updateData.apr !== undefined) updateObject.apr = updateData.apr;
      if (updateData.ytd_contributions !== undefined) updateObject.ytd_contributions = updateData.ytd_contributions;
      if (updateData.status !== undefined) updateObject.status = updateData.status;

      // Handle balance update separately to create history record
      if (updateData.balance !== undefined && updateData.balance !== existingAccount.balance) {
        const balanceChange = updateData.balance - existingAccount.balance;
        updateObject.balance = updateData.balance;

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: accountId,
          balance: updateData.balance,
          change_amount: balanceChange,
          change_type: "adjustment",
          reference_id: accountId,
          reference_type: "manual_adjustment",
          created_at: Date.now(),
        });
      }

      // Update account
      await ctx.db.patch(accountId, updateObject);

      // Return updated account
      const updatedAccount = await ctx.db.get(accountId);
      return {
        success: true,
        account: {
          ...updatedAccount!,
          created_at: new Date(updatedAccount!.created_at || Date.now()).toISOString(),
          updated_at: new Date(updatedAccount!.updated_at || Date.now()).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Update account error:", error);
      return {
        success: false,
        account: null,
        error: error instanceof Error ? error.message : "Failed to update account",
      };
    }
  },
});

/**
 * Delete account and all associated data
 */
export const deleteAccount = mutation({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    try {
      // Get account to verify existence
      const account = await ctx.db.get(args.accountId);
      if (!account) {
        throw new Error("Account not found");
      }

      // Delete all transactions for this account
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_account", (q) => q.eq("account_id", args.accountId))
        .collect();

      for (const transaction of transactions) {
        await ctx.db.delete(transaction._id);
      }

      // Delete all balance history for this account
      const balanceHistory = await ctx.db
        .query("account_balance_history")
        .withIndex("by_account", (q) => q.eq("account_id", args.accountId))
        .collect();

      for (const history of balanceHistory) {
        await ctx.db.delete(history._id);
      }

      // Delete transfers involving this account
      const fromTransfers = await ctx.db
        .query("transfers")
        .withIndex("by_from_account", (q) => q.eq("from_account_id", args.accountId))
        .collect();

      const toTransfers = await ctx.db
        .query("transfers")
        .withIndex("by_to_account", (q) => q.eq("to_account_id", args.accountId))
        .collect();

      for (const transfer of [...fromTransfers, ...toTransfers]) {
        await ctx.db.delete(transfer._id);
      }

      // Finally, delete the account
      await ctx.db.delete(args.accountId);

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete account error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete account",
      };
    }
  },
});

/**
 * Get account balance history
 */
export const getAccountBalanceHistory = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    try {
      const history = await ctx.db
        .query("account_balance_history")
        .withIndex("by_account", (q) => q.eq("account_id", args.accountId))
        .order("desc")
        .collect();

      return history.map(record => ({
        ...record,
        created_at: record.created_at ? new Date(record.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get account balance history error:", error);
      return [];
    }
  },
});
