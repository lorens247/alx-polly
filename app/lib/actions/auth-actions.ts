'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';
import { loginSchema, registerSchema } from '@/app/lib/validations/schemas';

/**
 * Authenticates a user with email and password credentials.
 * 
 * This server action handles user login by validating input data against the login schema,
 * then attempting to authenticate with Supabase Auth. It returns a generic error message
 * to prevent information disclosure about whether an email exists in the system.
 * 
 * @param data - Login credentials containing email and password
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const result = await login({ email: 'user@example.com', password: 'password123' });
 * if (result.error) {
 *   console.error('Login failed:', result.error);
 * } else {
 *   console.log('Login successful');
 * }
 * ```
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  try {
    // Validate input against Zod schema to ensure data integrity
    loginSchema.parse(data);
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Attempt authentication with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // Return generic error message to prevent email enumeration attacks
    return { error: "Invalid email or password" };
  }

  // Success: no error
  return { error: null };
}

/**
 * Registers a new user account with email, password, and name.
 * 
 * This server action handles user registration by validating input data against the register schema,
 * then creating a new user account in Supabase Auth with the provided credentials and metadata.
 * Returns a generic error message to prevent information disclosure about registration failures.
 * 
 * @param data - Registration data containing email, password, and name
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const result = await register({ 
 *   email: 'user@example.com', 
 *   password: 'password123', 
 *   name: 'John Doe' 
 * });
 * if (result.error) {
 *   console.error('Registration failed:', result.error);
 * } else {
 *   console.log('Registration successful');
 * }
 * ```
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  try {
    // Validate input against Zod schema to ensure data integrity and security
    registerSchema.parse(data);
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  // Create new user account with Supabase Auth
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name, // Store user's display name in metadata
      },
    },
  });

  if (error) {
    // Return generic error message to prevent information disclosure
    return { error: "Registration failed. Please try again." };
  }

  // Success: no error
  return { error: null };
}

/**
 * Signs out the current user from their session.
 * 
 * This server action terminates the user's authentication session by calling
 * Supabase Auth's signOut method. It handles any errors that may occur during
 * the logout process and returns the appropriate error message.
 * 
 * @returns Promise<{ error: string | null }> - Returns null on success, error message on failure
 * 
 * @example
 * ```typescript
 * const result = await logout();
 * if (result.error) {
 *   console.error('Logout failed:', result.error);
 * } else {
 *   console.log('Successfully logged out');
 * }
 * ```
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the currently authenticated user.
 * 
 * This server action fetches the current user's information from Supabase Auth.
 * It's commonly used in server components and server actions to check authentication
 * status and access user data.
 * 
 * @returns Promise<User | null> - Returns the user object if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('User is authenticated:', user.email);
 * } else {
 *   console.log('User is not authenticated');
 * }
 * ```
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current user's session information.
 * 
 * This server action fetches the current session data from Supabase Auth,
 * including session tokens and expiration information. Useful for checking
 * session validity and accessing session-specific data.
 * 
 * @returns Promise<Session | null> - Returns the session object if active, null otherwise
 * 
 * @example
 * ```typescript
 * const session = await getSession();
 * if (session) {
 *   console.log('Session is active:', session.user.email);
 * } else {
 *   console.log('No active session');
 * }
 * ```
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
