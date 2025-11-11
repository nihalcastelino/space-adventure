import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Authentication Hook
 * 
 * Manages user authentication with Supabase
 * Falls back to localStorage if Supabase is not configured
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if Supabase is configured
  const configured = isSupabaseConfigured();

  // Load user session on mount
  useEffect(() => {
    if (!configured) {
      // Fallback: Check localStorage for user
      const savedUser = localStorage.getItem('space_adventure_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  // Sign up with email and password
  const signUp = useCallback(async (email, password, displayName = null) => {
    if (!configured) {
      // Fallback: Create local user
      const localUser = {
        id: `local_${Date.now()}`,
        email,
        display_name: displayName || email.split('@')[0],
        created_at: new Date().toISOString()
      };
      localStorage.setItem('space_adventure_user', JSON.stringify(localUser));
      setUser(localUser);
      return { user: localUser, error: null };
    }

    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) {
        setError(error.message);
        return { user: null, error };
      }

      // Update user metadata if display name provided
      if (displayName && data.user) {
        await supabase.auth.updateUser({
          data: { display_name: displayName }
        });
      }

      return { user: data.user, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign up';
      setError(errorMessage);
      return { user: null, error: { message: errorMessage } };
    }
  }, [configured]);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    if (!configured) {
      // Fallback: Check localStorage
      const savedUser = localStorage.getItem('space_adventure_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.email === email) {
            setUser(user);
            return { user, error: null };
          }
        } catch (e) {
          // Ignore
        }
      }
      setError('Please configure Supabase for authentication');
      return { user: null, error: { message: 'Authentication not configured' } };
    }

    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in';
      setError(errorMessage);
      return { user: null, error: { message: errorMessage } };
    }
  }, [configured]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    if (!configured) {
      setError('Please configure Supabase for Google authentication');
      return { error: { message: 'Authentication not configured' } };
    }

    try {
      setError(null);
      
      // Get current origin (localhost:3000, localhost:3001, or production)
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname;
      const redirectTo = `${currentOrigin}${currentPath}`;
      
      console.log('OAuth redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        setError(error.message);
        return { error };
      }

      // OAuth will redirect, so we don't need to return anything
      return { error: null };
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign in with Google';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  }, [configured]);

  // Sign out
  const signOut = useCallback(async () => {
    if (!configured) {
      // Fallback: Clear localStorage
      localStorage.removeItem('space_adventure_user');
      setUser(null);
      return { error: null };
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const errorMessage = err.message || 'Failed to sign out';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  }, [configured]);

  // Get user display name
  const getDisplayName = useCallback(() => {
    if (!user) return null;
    return user.user_metadata?.display_name || 
           user.email?.split('@')[0] || 
           'Player';
  }, [user]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    getDisplayName,
    configured
  };
}

