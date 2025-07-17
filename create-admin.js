#!/usr/bin/env node

/**
 * Script to create an initial admin user in Convex
 * Run this script after Convex is set up to create your first admin user
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

// Get the Convex URL from environment
const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ VITE_CONVEX_URL environment variable is not set");
  console.error("Make sure your .env.local file contains the Convex URL");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

async function createAdminUser() {
  console.log("🚀 Creating admin user...");
  
  // Admin user details
  const adminData = {
    username: "admin",
    name: "System Administrator", 
    email: "admin@gowise.com",
    password: "admin123", // You should change this after first login
    phone: "+1234567890",
    is_admin: true,
  };

  try {
    // Create the admin user with plain text password
    const result = await convex.mutation(api.admin.createUser, {
      ...adminData,
    });

    if (result.success) {
      console.log("✅ Admin user created successfully!");
      console.log("📋 Admin credentials:");
      console.log(`   Username: ${adminData.username}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Email: ${adminData.email}`);
      console.log("");
      console.log("🔐 Please change the password after your first login!");
      console.log("🌐 You can now access the admin panel at: http://localhost:5173/admin/login");
    } else {
      console.error("❌ Failed to create admin user:", result.error);
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    
    if (error.message.includes("already exists")) {
      console.log("ℹ️  Admin user already exists. Use these credentials:");
      console.log(`   Username: ${adminData.username}`);
      console.log(`   Password: ${adminData.password}`);
      console.log("🌐 Access admin panel at: http://localhost:5173/admin/login");
    }
  }
}

// Run the script
createAdminUser().catch(console.error);
