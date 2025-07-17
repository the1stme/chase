import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate a unique reference code for transfers
 */
function generateReferenceCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
    if (i % 4 === 3 && i < 11) {
      result += '-';
    }
  }
  
  return result;
}

/**
 * Execute a transfer between accounts atomically
 */
export const executeTransfer = mutation({
  args: {
    from_account_id: v.id("accounts"),
    to_account_id: v.id("accounts"),
    amount: v.number(),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("internal"),
      v.literal("external")
    )),
  },
  handler: async (ctx, args) => {
    try {
      // Validate amount
      if (args.amount <= 0) {
        throw new Error("Transfer amount must be positive");
      }

      // Get both accounts
      const fromAccount = await ctx.db.get(args.from_account_id);
      const toAccount = await ctx.db.get(args.to_account_id);

      if (!fromAccount) {
        throw new Error("Source account not found");
      }
      if (!toAccount) {
        throw new Error("Destination account not found");
      }

      // Check if accounts are active
      if (fromAccount.status !== "active") {
        throw new Error("Source account is not active");
      }
      if (toAccount.status !== "active") {
        throw new Error("Destination account is not active");
      }

      // Check sufficient funds
      if (fromAccount.balance < args.amount) {
        throw new Error("Insufficient funds");
      }

      // Generate reference code and set date
      const referenceCode = generateReferenceCode();
      const transferDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const now = Date.now();
      const transferType = args.type || "internal";

      // Create transfer record
      const transferId = await ctx.db.insert("transfers", {
        from_account_id: args.from_account_id,
        to_account_id: args.to_account_id,
        amount: args.amount,
        date: transferDate,
        status: "completed",
        description: args.description,
        reference_code: referenceCode,
        type: transferType,
        created_at: now,
      });

      // Create debit transaction for source account
      const fromTransactionId = await ctx.db.insert("transactions", {
        account_id: args.from_account_id,
        amount: -args.amount, // Negative for debit
        type: "debit",
        description: `Transfer to ${toAccount.account_number}`,
        date: transferDate,
        category: "Transfer",
        reference: referenceCode,
        pending: false,
        created_at: now,
      });

      // Create credit transaction for destination account
      const toTransactionId = await ctx.db.insert("transactions", {
        account_id: args.to_account_id,
        amount: args.amount, // Positive for credit
        type: "credit",
        description: `Transfer from ${fromAccount.account_number}`,
        date: transferDate,
        category: "Transfer",
        reference: referenceCode,
        pending: false,
        created_at: now,
      });

      // Update account balances
      const newFromBalance = fromAccount.balance - args.amount;
      const newToBalance = toAccount.balance + args.amount;

      await ctx.db.patch(args.from_account_id, { 
        balance: newFromBalance,
        updated_at: now,
      });

      await ctx.db.patch(args.to_account_id, { 
        balance: newToBalance,
        updated_at: now,
      });

      // Create balance history records
      await ctx.db.insert("account_balance_history", {
        account_id: args.from_account_id,
        balance: newFromBalance,
        change_amount: -args.amount,
        change_type: "transfer",
        reference_id: transferId,
        reference_type: "transfer",
        created_at: now,
      });

      await ctx.db.insert("account_balance_history", {
        account_id: args.to_account_id,
        balance: newToBalance,
        change_amount: args.amount,
        change_type: "transfer",
        reference_id: transferId,
        reference_type: "transfer",
        created_at: now,
      });

      return {
        success: true,
        transfer_id: transferId,
        from_transaction_id: fromTransactionId,
        to_transaction_id: toTransactionId,
        reference_code: referenceCode,
        error: null,
      };
    } catch (error) {
      console.error("Execute transfer error:", error);
      return {
        success: false,
        transfer_id: null,
        from_transaction_id: null,
        to_transaction_id: null,
        reference_code: null,
        error: error instanceof Error ? error.message : "Transfer failed",
      };
    }
  },
});

/**
 * Get transfers for an account (both incoming and outgoing)
 */
export const getAccountTransfers = query({
  args: { 
    accountId: v.id("accounts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Get outgoing transfers
      const outgoingTransfers = await ctx.db
        .query("transfers")
        .withIndex("by_from_account", (q) => q.eq("from_account_id", args.accountId))
        .order("desc")
        .collect();

      // Get incoming transfers
      const incomingTransfers = await ctx.db
        .query("transfers")
        .withIndex("by_to_account", (q) => q.eq("to_account_id", args.accountId))
        .order("desc")
        .collect();

      // Combine and sort by creation time
      const allTransfers = [...outgoingTransfers, ...incomingTransfers]
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0));

      // Apply limit if specified
      const result = args.limit ? allTransfers.slice(0, args.limit) : allTransfers;

      return result.map(transfer => ({
        ...transfer,
        created_at: transfer.created_at ? new Date(transfer.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get account transfers error:", error);
      return [];
    }
  },
});

/**
 * Get transfer by ID
 */
export const getTransferById = query({
  args: { transferId: v.id("transfers") },
  handler: async (ctx, args) => {
    try {
      const transfer = await ctx.db.get(args.transferId);
      if (!transfer) {
        return null;
      }

      return {
        ...transfer,
        created_at: transfer.created_at ? new Date(transfer.created_at).toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get transfer by ID error:", error);
      return null;
    }
  },
});

/**
 * Get transfer by reference code
 */
export const getTransferByReferenceCode = query({
  args: { referenceCode: v.string() },
  handler: async (ctx, args) => {
    try {
      const transfer = await ctx.db
        .query("transfers")
        .withIndex("by_reference_code", (q) => q.eq("reference_code", args.referenceCode))
        .first();

      if (!transfer) {
        return null;
      }

      return {
        ...transfer,
        created_at: transfer.created_at ? new Date(transfer.created_at).toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get transfer by reference code error:", error);
      return null;
    }
  },
});

/**
 * Cancel a pending transfer
 */
export const cancelTransfer = mutation({
  args: { transferId: v.id("transfers") },
  handler: async (ctx, args) => {
    try {
      // Get transfer
      const transfer = await ctx.db.get(args.transferId);
      if (!transfer) {
        throw new Error("Transfer not found");
      }

      // Only allow cancellation of pending transfers
      if (transfer.status !== "pending") {
        throw new Error("Only pending transfers can be cancelled");
      }

      // Update transfer status
      await ctx.db.patch(args.transferId, {
        status: "cancelled",
      });

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Cancel transfer error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel transfer",
      };
    }
  },
});

/**
 * Get all transfers (for admin purposes)
 */
export const getAllTransfers = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    try {
      let transfers;

      if (args.status) {
        let query = ctx.db
          .query("transfers")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc");

        if (args.limit) {
          transfers = await query.take(args.limit);
        } else {
          transfers = await query.collect();
        }
      } else {
        let query = ctx.db.query("transfers").order("desc");

        if (args.limit) {
          transfers = await query.take(args.limit);
        } else {
          transfers = await query.collect();
        }
      }

      return transfers.map(transfer => ({
        ...transfer,
        created_at: transfer.created_at ? new Date(transfer.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Get all transfers error:", error);
      return [];
    }
  },
});

/**
 * Update transfer status (for admin purposes)
 */
export const updateTransferStatus = mutation({
  args: {
    transferId: v.id("transfers"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    try {
      // Get transfer
      const transfer = await ctx.db.get(args.transferId);
      if (!transfer) {
        throw new Error("Transfer not found");
      }

      // Update status
      await ctx.db.patch(args.transferId, {
        status: args.status,
      });

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("Update transfer status error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update transfer status",
      };
    }
  },
});
