// This file is now deprecated - all auth functionality has been moved to Convex
// Import from the Convex auth module instead
import { auth } from './convex';

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
    is_admin: boolean;
  };
  access_token: string;
  refresh_token: string;
}

// Legacy wrapper functions for backward compatibility
export async function login(username: string, password: string): Promise<{ session: UserSession | null; error: Error | null }> {
  return auth.login(username, password);
}

export async function getSession(token: string): Promise<UserSession | null> {
  return auth.getSession(token);
}

export async function logout(): Promise<{ error: Error | null }> {
  return auth.logout();
}

export async function adminLogin(username: string, password: string): Promise<{ session: AdminSession | null; error: Error | null }> {
  return auth.adminLogin(username, password);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  return auth.getAdminSession();
}

export async function adminLogout(): Promise<{ error: Error | null }> {
  return auth.adminLogout();
}
