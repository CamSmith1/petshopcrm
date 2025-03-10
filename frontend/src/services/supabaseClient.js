import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const isDevelopment = process.env.NODE_ENV === 'development';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env file');
}

// In development mode, create a mock client if needed
let supabase;

if (isDevelopment && (!supabaseUrl || !supabaseAnonKey)) {
  console.log('Using mock Supabase client for development');
  // Create a mock client with minimal implementation
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => {},
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
    }),
  };
} else {
  // Create actual Supabase client
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;