import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

/**
 * User login function - matches Supabase implementation
 * Validates username/password and creates a session token
 */
export const login = mutation({
  args: { 
    username: v.string(), 
    password: v.string() 
  },
  handler: async (ctx, args) => {
    try {
      // Find user by username
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .first();

      if (!user) {
        throw new Error("Invalid username or password");
      }

      // Plain text password comparison (no hashing)
      const passwordValid = args.password === user.password;

      if (!passwordValid) {
        throw new Error("Invalid username or password");
      }

      // Create session token
      const token = uuidv4();
      const now = Date.now();
      const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days from now

      // Create session
      const sessionId = await ctx.db.insert("sessions", {
        user_id: user._id,
        token,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      });

      // Return session data
      const session = await ctx.db.get(sessionId);
      return {
        success: true,
        session: {
          id: session!._id,
          user_id: session!.user_id,
          token: session!.token,
          expires_at: new Date(session!.expires_at).toISOString(),
          created_at: new Date(session!.created_at || now).toISOString(),
          updated_at: new Date(session!.updated_at || now).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        session: null,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  },
});

/**
 * Get session by token - validates and returns session if valid
 */
export const getSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      const now = Date.now();
      
      // Find valid session
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .filter((q) => q.gt(q.field("expires_at"), now))
        .first();

      if (!session) {
        return null;
      }

      return {
        id: session._id,
        user_id: session.user_id,
        token: session.token,
        expires_at: new Date(session.expires_at).toISOString(),
        created_at: new Date(session.created_at || now).toISOString(),
        updated_at: new Date(session.updated_at || now).toISOString(),
      };
    } catch (error) {
      console.error("Get session error:", error);
      return null;
    }
  },
});

/**
 * Logout function - removes session token
 */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      // Find and delete session
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first();

      if (session) {
        await ctx.db.delete(session._id);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  },
});

/**
 * Admin login function - validates admin credentials
 */
export const adminLogin = mutation({
  args: { 
    username: v.string(), 
    password: v.string() 
  },
  handler: async (ctx, args) => {
    try {
      // Find admin user by username
      const user = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .filter((q) => q.eq(q.field("is_admin"), true))
        .first();

      if (!user) {
        throw new Error("Invalid admin credentials");
      }

      // Validate password (plain text comparison)
      const passwordValid = args.password === user.password;

      if (!passwordValid) {
        throw new Error("Invalid admin credentials");
      }

      // Create admin session
      const token = uuidv4();
      const now = Date.now();
      const expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours for admin sessions

      await ctx.db.insert("sessions", {
        user_id: user._id,
        token,
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      });

      return {
        success: true,
        session: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email || "",
            name: user.name || "",
            is_admin: user.is_admin,
          },
          access_token: token,
          refresh_token: token, // Using same token for simplicity
        },
        error: null,
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        session: null,
        error: error instanceof Error ? error.message : "Admin login failed",
      };
    }
  },
});

/**
 * Get admin session by token
 */
export const getAdminSession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      const now = Date.now();
      
      // Find valid session
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .filter((q) => q.gt(q.field("expires_at"), now))
        .first();

      if (!session) {
        return null;
      }

      // Get user and verify admin status
      const user = await ctx.db.get(session.user_id);
      if (!user || !user.is_admin) {
        return null;
      }

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email || "",
          name: user.name || "",
          is_admin: user.is_admin,
        },
        access_token: session.token,
        refresh_token: session.token,
      };
    } catch (error) {
      console.error("Get admin session error:", error);
      return null;
    }
  },
});

/**
 * Admin logout function
 */
export const adminLogout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      // Find and delete session
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first();

      if (session) {
        await ctx.db.delete(session._id);
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Admin logout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Admin logout failed",
      };
    }
  },
});

/**
 * Clean up expired sessions - utility function
 */
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const now = Date.now();
      
      // Find all expired sessions
      const expiredSessions = await ctx.db
        .query("sessions")
        .filter((q) => q.lt(q.field("expires_at"), now))
        .collect();

      // Delete expired sessions
      for (const session of expiredSessions) {
        await ctx.db.delete(session._id);
      }

      return { 
        success: true, 
        deletedCount: expiredSessions.length 
      };
    } catch (error) {
      console.error("Cleanup expired sessions error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Cleanup failed",
      };
    }
  },
});
