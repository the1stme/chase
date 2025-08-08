#!/usr/bin/env bun
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

// Your Convex deployment URL from .env.local
const CONVEX_URL = "https://intent-crane-568.convex.cloud";

async function createAdmin() {
  console.log("🔧 Creating admin user...");
  console.log("📡 Connecting to Convex:", CONVEX_URL);

  const client = new ConvexHttpClient(CONVEX_URL);

  try {
    // Create admin user with username "admin" and password "admin123"
    const result = await client.mutation(api.admin.createUser, {
      username: "admin",
      password: "admin123",
      name: "Administrator",
      email: "admin@chase.com",
      is_admin: true
    });

    if (result.success) {
      console.log("✅ Admin user created successfully!");
      console.log("👤 Username: admin");
      console.log("🔑 Password: admin123");
      console.log("📧 Email: admin@chase.com");
      console.log("🛡️  Admin privileges: enabled");
      console.log("\n🎉 You can now log in to the admin portal!");
    } else {
      console.error("❌ Failed to create admin user:");
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("❌ Script error:", error);
    
    if (error instanceof Error && error.message.includes("Username already exists")) {
      console.log("\n💡 Admin user already exists. Try logging in with:");
      console.log("👤 Username: admin");
      console.log("🔑 Password: admin123");
    }
  }
}

// Run the script
createAdmin().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
