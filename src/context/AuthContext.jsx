import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured, signInWithOtp, verifyOtp, signOut, getSession } from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check saved session or local storage
    async function initAuth() {
      try {
        const savedGuest = localStorage.getItem('app_guest_user')
        if (savedGuest) {
          setUser(JSON.parse(savedGuest))
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

  // Logout
  const logout = async () => {
    await signOut()
    setUser(null)
    setSession(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('app_guest_user')
  }

  const value = {
    user,
    session,
    isAuthenticated: Boolean(user),
    loading,
    sendOtp,
    verifyCode,
    loginAsGuest,
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
