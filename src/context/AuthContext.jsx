import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, signInWithOtp, verifyOtp, signOut, getSession, signInWithGoogle } from '../services/supabase'
import { verifyGoogleCredential } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check saved session or local storage
    async function initAuth() {
      try {
        const savedUser = localStorage.getItem('app_user') || localStorage.getItem('app_guest_user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          setUser(parsed)
          setLoading(false)
          return
        }

        if (isSupabaseConfigured && supabase) {
          const { data } = await getSession()
          if (data?.session) {
            setSession(data.session)
            setUser(data.session.user)
            localStorage.setItem('auth_token', data.session.access_token)
          }

          const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setUser(newSession?.user ?? null)
            if (newSession?.access_token) {
              localStorage.setItem('auth_token', newSession.access_token)
            } else {
              localStorage.removeItem('auth_token')
            }
          })

          return () => {
            authListener?.subscription?.unsubscribe?.()
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Send OTP email
  const sendOtp = async (email) => {
    return await signInWithOtp(email)
  }

  // Verify OTP code
  const verifyCode = async (email, code) => {
    const res = await verifyOtp(email, code)
    if (res.data?.session) {
      setSession(res.data.session)
      setUser(res.data.user)
      localStorage.setItem('auth_token', res.data.session.access_token)
    }
    return res
  }

  // Demo / guest login
  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest-' + Math.random().toString(36).substring(7),
      email: 'guest@workspace.local',
      user_metadata: { name: 'Demo Explorer' },
      isGuest: true,
    }
    setUser(guestUser)
    localStorage.setItem('app_guest_user', JSON.stringify(guestUser))
    localStorage.setItem('auth_token', 'demo-guest-jwt-token')
  }

  // Google OAuth Login
  const loginWithGoogle = async () => {
    const res = await signInWithGoogle()
    if (res?.data?.session) {
      setSession(res.data.session)
      setUser(res.data.user)
      localStorage.setItem('auth_token', res.data.session.access_token)
      localStorage.setItem('app_user', JSON.stringify(res.data.user))
    }
    return res
  }

  // Official Google Identity Services Credential Verification
  const handleGoogleCredential = async (credential) => {
    try {
      const res = await verifyGoogleCredential(credential)
      if (res && res.verified && res.user) {
        setUser(res.user)
        setSession(res.session)
        localStorage.setItem('auth_token', res.session?.access_token || credential)
        localStorage.setItem('app_user', JSON.stringify(res.user))
        return { success: true, user: res.user }
      }
      return { success: false, error: res?.error || 'Verification failed with Google tokeninfo.' }
    } catch (err) {
      console.error('Google verification error:', err)
      return { success: false, error: err.message || 'Verification error' }
    }
  }

  // Logout
  const logout = async () => {
    await signOut()
    setUser(null)
    setSession(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('app_guest_user')
    localStorage.removeItem('app_user')
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect?.()
      } catch (e) {
        // ignore
      }
    }
  }

  const value = {
    user,
    session,
    isAuthenticated: Boolean(user),
    loading,
    sendOtp,
    verifyCode,
    loginAsGuest,
    loginWithGoogle,
    handleGoogleCredential,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
