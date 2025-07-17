import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all transactions for an account
 */
export const getAccountTransactions = query({
  args: { 
    accountId: v.id("accounts"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      let query = ctx.db
        .query("transactions")
        .withIndex("by_account", (q) => q.eq("account_id", args.accountId))
        .order("desc");

      if (args.limit) {
        const transactions = await query.take(args.limit);
        // Skip offset if provided
        const result = args.offset ? transactions.slice(args.offset) : transactions;
        return result.map(transaction => ({
          ...transaction,
          created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
        }));
      }

      const transactions = await query.collect();

      // Skip offset if provided
      const result = args.offset ? transactions.slice(args.offset) : transactions;

      return result.map(transaction => ({
        ...transaction,
        created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get account transactions error:", error);
      return [];
    }
  },
});

/**
 * Get transactions by date range
 */
export const getTransactionsByDateRange = query({
  args: {
    accountId: v.id("accounts"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_account_date", (q) => 
          q.eq("account_id", args.accountId)
           .gte("date", args.startDate)
           .lte("date", args.endDate)
        )
        .order("desc")
        .collect();

      return transactions.map(transaction => ({
        ...transaction,
        created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get transactions by date range error:", error);
      return [];
    }
  },
});

/**
 * Create a new transaction and update account balance
 */
export const createTransaction = mutation({
  args: {
    account_id: v.id("accounts"),
    amount: v.number(),
    type: v.union(v.literal("credit"), v.literal("debit")),
    description: v.string(),
    date: v.string(),
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    location: v.optional(v.string()),
    reference: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    pending: v.optional(v.boolean()),
    batch_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Verify account exists
      const account = await ctx.db.get(args.account_id);
      if (!account) {
        throw new Error("Account not found");
      }

      const now = Date.now();
      const pending = args.pending || false;

      // Determine the actual amount change based on type
      // For debit transactions, amount should be negative
      // For credit transactions, amount should be positive
      let actualAmount = Math.abs(args.amount);
      if (args.type === "debit") {
        actualAmount = -actualAmount;
      }

      // Create transaction
      const transactionId = await ctx.db.insert("transactions", {
        account_id: args.account_id,
        amount: actualAmount,
        type: args.type,
        description: args.description,
        date: args.date,
        category: args.category,
        merchant: args.merchant,
        location: args.location,
        reference: args.reference,
        receipt_number: args.receipt_number,
        pending,
        batch_id: args.batch_id,
        created_at: now,
      });

      // Update account balance if not pending
      if (!pending) {
        const newBalance = account.balance + actualAmount;
        await ctx.db.patch(args.account_id, { 
          balance: newBalance,
          updated_at: now,
        });

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: args.account_id,
          balance: newBalance,
          change_amount: actualAmount,
          change_type: "transaction",
          reference_id: transactionId,
          reference_type: "transaction",
          created_at: now,
        });
      }

      // Return created transaction
      const transaction = await ctx.db.get(transactionId);
      return {
        success: true,
        transaction: {
          ...transaction!,
          created_at: new Date(transaction!.created_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Create transaction error:", error);
      return {
        success: false,
        transaction: null,
        error: error instanceof Error ? error.message : "Failed to create transaction",
      };
    }
  },
});

/**
 * Update transaction (mainly for changing pending status)
 */
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    amount: v.optional(v.number()),
    type: v.optional(v.union(v.literal("credit"), v.literal("debit"))),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    location: v.optional(v.string()),
    reference: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    pending: v.optional(v.boolean()),
    batch_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { transactionId, ...updateData } = args;
      
      // Get existing transaction
      const existingTransaction = await ctx.db.get(transactionId);
      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      // Get account
      const account = await ctx.db.get(existingTransaction.account_id);
      if (!account) {
        throw new Error("Account not found");
      }

      const now = Date.now();
      let balanceUpdate = false;
      let balanceChange = 0;

      // Handle pending status change
      if (updateData.pending !== undefined && updateData.pending !== existingTransaction.pending) {
        if (existingTransaction.pending && !updateData.pending) {
          // Transaction is being cleared (pending -> not pending)
          balanceUpdate = true;
          balanceChange = existingTransaction.amount;
        } else if (!existingTransaction.pending && updateData.pending) {
          // Transaction is being made pending (not pending -> pending)
          balanceUpdate = true;
          balanceChange = -existingTransaction.amount;
        }
      }

      // Handle amount or type changes (only if not pending)
      if (!existingTransaction.pending && (updateData.amount !== undefined || updateData.type !== undefined)) {
        const newType = updateData.type || existingTransaction.type;
        const newAmount = updateData.amount !== undefined ? updateData.amount : Math.abs(existingTransaction.amount);
        
        let newActualAmount = Math.abs(newAmount);
        if (newType === "debit") {
          newActualAmount = -newActualAmount;
        }

        if (newActualAmount !== existingTransaction.amount) {
          balanceUpdate = true;
          balanceChange = newActualAmount - existingTransaction.amount;
        }
      }

      // Prepare update object
      const updateObject: any = {};
      
      if (updateData.amount !== undefined) {
        let actualAmount = Math.abs(updateData.amount);
        const type = updateData.type || existingTransaction.type;
        if (type === "debit") {
          actualAmount = -actualAmount;
        }
        updateObject.amount = actualAmount;
      }
      
      if (updateData.type !== undefined) updateObject.type = updateData.type;
      if (updateData.description !== undefined) updateObject.description = updateData.description;
      if (updateData.date !== undefined) updateObject.date = updateData.date;
      if (updateData.category !== undefined) updateObject.category = updateData.category;
      if (updateData.merchant !== undefined) updateObject.merchant = updateData.merchant;
      if (updateData.location !== undefined) updateObject.location = updateData.location;
      if (updateData.reference !== undefined) updateObject.reference = updateData.reference;
      if (updateData.receipt_number !== undefined) updateObject.receipt_number = updateData.receipt_number;
      if (updateData.pending !== undefined) updateObject.pending = updateData.pending;
      if (updateData.batch_id !== undefined) updateObject.batch_id = updateData.batch_id;

      // Update transaction
      await ctx.db.patch(transactionId, updateObject);

      // Update account balance if needed
      if (balanceUpdate && balanceChange !== 0) {
        const newBalance = account.balance + balanceChange;
        await ctx.db.patch(existingTransaction.account_id, { 
          balance: newBalance,
          updated_at: now,
        });

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: existingTransaction.account_id,
          balance: newBalance,
          change_amount: balanceChange,
          change_type: "transaction_update",
          reference_id: transactionId,
          reference_type: "transaction",
          created_at: now,
        });
      }

      // Return updated transaction
      const updatedTransaction = await ctx.db.get(transactionId);
      return {
        success: true,
        transaction: {
          ...updatedTransaction!,
          created_at: new Date(updatedTransaction!.created_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Update transaction error:", error);
      return {
        success: false,
        transaction: null,
        error: error instanceof Error ? error.message : "Failed to update transaction",
      };
    }
  },
});

/**
 * Delete transaction and adjust account balance
 */
export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    try {
      // Get transaction
      const transaction = await ctx.db.get(args.transactionId);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Get account
      const account = await ctx.db.get(transaction.account_id);
      if (!account) {
        throw new Error("Account not found");
      }

      const now = Date.now();

      // Reverse the transaction's effect on balance if it wasn't pending
      if (!transaction.pending) {
        const newBalance = account.balance - transaction.amount;
        await ctx.db.patch(transaction.account_id, { 
          balance: newBalance,
          updated_at: now,
        });

        // Create balance history record
        await ctx.db.insert("account_balance_history", {
          account_id: transaction.account_id,
          balance: newBalance,
          change_amount: -transaction.amount,
          change_type: "transaction_deletion",
          reference_id: args.transactionId,
          reference_type: "transaction",
          created_at: now,
        });
      }

      // Delete the transaction
      await ctx.db.delete(args.transactionId);

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Delete transaction error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete transaction",
      };
    }
  },
});

/**
 * Get pending transactions for an account
 */
export const getPendingTransactions = query({
  args: { accountId: v.id("accounts") },
  handler: async (ctx, args) => {
    try {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("by_pending", (q) => q.eq("pending", true))
        .filter((q) => q.eq(q.field("account_id"), args.accountId))
        .order("desc")
        .collect();

      return transactions.map(transaction => ({
        ...transaction,
        created_at: transaction.created_at ? new Date(transaction.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get pending transactions error:", error);
      return [];
    }
  },
});
