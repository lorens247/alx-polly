'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';
import { loginSchema, registerSchema } from '@/app/lib/validations/schemas';

export async function login(data: LoginFormData) {
  const supabase = await createClient();

  try {
    // Validate input
    loginSchema.parse(data);
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "Invalid email or password" }; // Generic error message
  }

  // Success: no error
  return { error: null };
}

export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  try {
    // Validate input
    registerSchema.parse(data);
  } catch (error: any) {
    return { error: error.errors?.[0]?.message || "Invalid input data" };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    return { error: "Registration failed. Please try again." }; // Generic error message
  }

  // Success: no error
  return { error: null };
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
