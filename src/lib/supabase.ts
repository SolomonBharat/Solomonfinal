import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For demo purposes, we'll use localStorage as fallback when Supabase is not configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key');

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
export { isSupabaseConfigured };