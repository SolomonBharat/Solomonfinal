import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

console.log('Supabase initialization:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  isPlaceholder: supabaseUrl === 'https://placeholder.supabase.co'
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Disable email confirmation
    flowType: 'pkce'
  }
})

// Database types
export interface UserProfile {
  id: string
  user_type: 'admin' | 'buyer' | 'supplier'
  full_name: string | null
  company_name: string | null
  phone: string | null
  country: string | null
  website: string | null
  created_at: string
  updated_at: string
}

// Helper function to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()
  
  return profile?.user_type === 'admin'
}