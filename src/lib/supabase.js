import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables.');
  console.warn('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
  console.warn('Auth features will be disabled.');
}

// Create Supabase client (only if credentials are provided)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!supabase;
};

// Log configuration status in development
if (import.meta.env.DEV) {
  if (supabase) {
    console.log('✅ Supabase configured successfully');
    console.log('📡 Supabase URL:', supabaseUrl?.substring(0, 30) + '...');
  } else {
    console.log('❌ Supabase not configured - using localStorage fallback');
  }
}

