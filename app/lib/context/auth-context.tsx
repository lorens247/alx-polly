'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication context interface defining the shape of auth state and methods.
 * 
 * This interface provides a centralized way to access authentication state across
 * the application, including the current session, user data, loading state, and
 * sign-out functionality.
 */
interface AuthContextType {
  /** Current user session, null if not authenticated */
  session: Session | null;
  /** Current user data, null if not authenticated */
  user: User | null;
  /** Function to sign out the current user */
  signOut: () => void;
  /** Loading state for authentication operations */
  loading: boolean;
}

/**
 * Authentication context for managing global auth state.
 * 
 * Provides authentication state and methods to all child components through React Context.
 * This context is initialized with default values and updated by the AuthProvider.
 */
const AuthContext = createContext<AuthContextType>({ 
  session: null, 
  user: null,
  signOut: () => {},
  loading: true,
});

/**
 * Authentication provider component that manages global authentication state.
 * 
 * This component wraps the application and provides authentication context to all child components.
 * It handles initial user loading, auth state changes, and provides methods for authentication
 * operations. The provider uses Supabase client for authentication and maintains state using React hooks.
 * 
 * @param children - React children components that will have access to auth context
 * @returns JSX element providing auth context to children
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <YourAppComponents />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Memoize Supabase client to prevent unnecessary re-creation
  const supabase = useMemo(() => createClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    /**
     * Initial user fetch on component mount.
     * This ensures we have the current user state when the app loads,
     * even if there's no active session (user might be logged out).
     */
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      if (mounted) {
        setUser(data.user ?? null);
        setSession(null); // Clear session on initial load
        setLoading(false);
        console.log('AuthContext: Initial user loaded', data.user);
      }
    };

    getUser();

    /**
     * Listen for authentication state changes.
     * This handles login, logout, and session refresh events automatically.
     * The listener updates both session and user state based on auth events.
     */
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Note: Don't set loading to false here, only after initial load
      console.log('AuthContext: Auth state changed', _event, session, session?.user);
    });

    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  /**
   * Signs out the current user by calling Supabase's signOut method.
   * This will trigger the auth state change listener and update the context.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  console.log('AuthContext: user', user);
  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * 
 * This hook provides a convenient way to access authentication state and methods
 * from any component within the AuthProvider tree. It returns the current session,
 * user data, loading state, and sign-out function.
 * 
 * @returns AuthContextType - Authentication context with session, user, signOut, and loading
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading, signOut } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = () => useContext(AuthContext);
