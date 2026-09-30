import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
)

// Fallback dummy client if credentials aren't provided yet
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Sign in using OTP (One-Time Password / Magic Link)
 * @param {string} email 
 */
export async function signInWithOtp(email) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing. Simulating OTP dispatch.')
    return { data: { message: 'Simulation OTP sent (use 123456 in demo mode)' }, error: null }
  }

  return await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })
}

/**
 * Verify OTP token
 * @param {string} email 
 * @param {string} token 
 */
export async function verifyOtp(email, token) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase credentials missing. Simulating OTP verification.')
    if (token === '123456' || token.length === 6) {
      return {
        data: {
          session: {
            access_token: 'mock-jwt-token-12345',
            user: {
              id: 'mock-user-id-001',
              email,
              user_metadata: { name: email.split('@')[0] },
            },
          },
          user: {
            id: 'mock-user-id-001',
            email,
            user_metadata: { name: email.split('@')[0] },
          },
        },
        error: null,
      }
    }
    return { data: null, error: new Error('Invalid demo code. Try 123456.') }
  }

  return await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
}

/**
 * Sign out current session
 */
export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null }
  }
  return await supabase.auth.signOut()
}

/**
 * Get the current active session
 */
export async function getSession() {
  if (!isSupabaseConfigured) {
    return { data: { session: null }, error: null }
  }
  return await supabase.auth.getSession()
}
