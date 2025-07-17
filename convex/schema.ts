import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - matches Supabase users structure exactly
  users: defineTable({
    username: v.string(),
    password: v.string(), // Will be hashed with bcrypt
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
    created_at: v.optional(v.number()), // Unix timestamp
    updated_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_username", ["username"])
  .index("by_email", ["email"])
  .index("by_is_admin", ["is_admin"]),

  // Sessions table - for authentication token management
  sessions: defineTable({
    user_id: v.id("users"),
    token: v.string(),
    expires_at: v.number(), // Unix timestamp
    created_at: v.optional(v.number()), // Unix timestamp
    updated_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_token", ["token"])
  .index("by_user", ["user_id"])
  .index("by_expires", ["expires_at"]),

  // Accounts table - matches Supabase accounts structure exactly
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
    balance: v.number(), // Using number for decimal precision (will handle as cents internally)
    account_number: v.string(),
    routing_number: v.optional(v.string()),
    credit_limit: v.optional(v.number()),
    available_credit: v.optional(v.number()),
    due_date: v.optional(v.string()), // ISO date string
    minimum_payment: v.optional(v.number()),
    apr: v.optional(v.number()),
    ytd_contributions: v.optional(v.number()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("closed")
    ),
    created_at: v.optional(v.number()), // Unix timestamp
    updated_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_user", ["user_id"])
  .index("by_account_number", ["account_number"])
  .index("by_status", ["status"])
  .index("by_type", ["type"]),

  // Transactions table - matches Supabase transactions structure exactly
  transactions: defineTable({
    account_id: v.id("accounts"),
    amount: v.number(), // Positive for credit, negative for debit
    type: v.union(v.literal("credit"), v.literal("debit")),
    description: v.string(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    category: v.optional(v.string()),
    merchant: v.optional(v.string()),
    location: v.optional(v.string()),
    reference: v.optional(v.string()),
    receipt_number: v.optional(v.string()),
    pending: v.boolean(),
    batch_id: v.optional(v.string()),
    created_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_account", ["account_id"])
  .index("by_date", ["date"])
  .index("by_account_date", ["account_id", "date"])
  .index("by_pending", ["pending"])
  .index("by_type", ["type"])
  .index("by_category", ["category"])
  .index("by_reference", ["reference"]),

  // Transfers table - matches Supabase transfers structure exactly
  transfers: defineTable({
    from_account_id: v.optional(v.id("accounts")), // Optional for external transfers
    to_account_id: v.optional(v.id("accounts")), // Optional for external transfers
    amount: v.number(),
    date: v.string(), // ISO date string (YYYY-MM-DD)
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
    created_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_from_account", ["from_account_id"])
  .index("by_to_account", ["to_account_id"])
  .index("by_date", ["date"])
  .index("by_status", ["status"])
  .index("by_reference_code", ["reference_code"])
  .index("by_type", ["type"]),

  // Account balance history - for tracking balance changes
  account_balance_history: defineTable({
    account_id: v.id("accounts"),
    balance: v.number(), // Balance after the change
    change_amount: v.number(), // Amount of the change (positive or negative)
    change_type: v.string(), // 'transaction', 'transfer', 'adjustment', etc.
    reference_id: v.optional(v.string()), // ID of the transaction/transfer that caused the change
    reference_type: v.optional(v.string()), // 'transaction', 'transfer', etc.
    created_at: v.optional(v.number()), // Unix timestamp
  })
  .index("by_account", ["account_id"])
  .index("by_reference", ["reference_id", "reference_type"])
  .index("by_created_at", ["created_at"])
  .index("by_change_type", ["change_type"]),
});
