import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

/**
 * Get user by ID
 */
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        return null;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Get user by ID error:", error);
      return null;
    }
  },
});

/**
 * Get user by username
 */
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (!user) {
        return null;
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error("Get user by username error:", error);
      return null;
    }
  },
});

/**
 * Create a new user
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

      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10);
      const now = Date.now();

      // Create user
      const userId = await ctx.db.insert("users", {
        username: args.username,
        password: hashedPassword,
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
        user: userWithoutPassword,
        error: null,
      };
    } catch (error) {
      console.error("Create user error:", error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to create user",
      };
    }
  },
});

/**
 * Update user information
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

      // Hash password if updating
      if (updateData.password) {
        updateObject.password = await bcrypt.hash(updateData.password, 10);
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
        user: userWithoutPassword,
        error: null,
      };
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        user: null,
        error: error instanceof Error ? error.message : "Failed to update user",
      };
    }
  },
});

/**
 * Delete user and all associated data
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
      console.error("Delete user error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  },
});
