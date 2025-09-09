'use server';

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Checks if the current user has admin privileges.
 * 
 * This utility function verifies if the authenticated user has admin role
 * by checking the user's metadata. It's used for role-based access control
 * throughout the application to protect admin-only functionality.
 * 
 * @returns Promise<boolean> - True if user is admin, false otherwise
 * 
 * @example
 * ```typescript
 * const isUserAdmin = await isAdmin();
 * if (isUserAdmin) {
 *   // Allow access to admin features
 * }
 * ```
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  // Check if user has admin role in user metadata
  const userRole = user.user_metadata?.role;
  return userRole === 'admin';
}

/**
 * Requires admin access and throws an error if the user is not an admin.
 * 
 * This utility function combines authentication and authorization checks.
 * It first verifies the user is authenticated, then checks for admin privileges.
 * If either check fails, it throws an appropriate error. This is useful for
 * protecting admin-only server actions and API routes.
 * 
 * @returns Promise<{ user: any; isAdmin: boolean }> - User object and admin status
 * @throws Error - If user is not authenticated or not an admin
 * 
 * @example
 * ```typescript
 * try {
 *   const { user, isAdmin } = await requireAdmin();
 *   // Proceed with admin-only operations
 * } catch (error) {
 *   // Handle authentication/authorization errors
 * }
 * ```
 */
export async function requireAdmin(): Promise<{ user: User; isAdmin: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('Admin access required');
  }
  
  return { user, isAdmin: true };
}
