import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to prevent crash when env vars are not set
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Running in demo mode.');
    return null;
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

export const supabase = getSupabase();

// Auth helpers - work in demo mode without Supabase
export const signIn = async (email: string, password: string) => {
  const client = getSupabase();
  if (!client) {
    // Demo mode - simulate successful login
    console.log('Demo mode: Simulating login for', email);
    return { data: { user: { email } }, error: null };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (email: string, password: string, metadata?: object) => {
  const client = getSupabase();
  if (!client) {
    // Demo mode - simulate successful signup
    console.log('Demo mode: Simulating signup for', email);
    return { data: { user: { email, user_metadata: metadata } }, error: null };
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const client = getSupabase();
  if (!client) {
    console.log('Demo mode: Simulating logout');
    return { error: null };
  }

  const { error } = await client.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const client = getSupabase();
  if (!client) return null;

  const { data: { user } } = await client.auth.getUser();
  return user;
};

export const getSession = async () => {
  const client = getSupabase();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  return session;
};
