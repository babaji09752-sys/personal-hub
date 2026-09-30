import { useState, useEffect, useRef } from 'react'
import { 
  Mail, 
  Sparkles, 
  KeyRound, 
  ShieldAlert, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Settings2,
  Lock,
  ExternalLink
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../services/supabase'
import { sound } from '../../services/sound'

export function LoginCard({ onOtpRequested }) {
  const { sendOtp, loginAsGuest, loginWithGoogle, handleGoogleCredential } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [clientIdInput, setClientIdInput] = useState('')
  const [activeClientId, setActiveClientId] = useState('')

  const googleBtnRef = useRef(null)

  // Load configured Google Client ID from localStorage or env
  useEffect(() => {
    const savedId = localStorage.getItem('google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    setActiveClientId(savedId)
    setClientIdInput(savedId)
  }, [])

  // Initialize official Google Identity Services (GIS) if client ID is set
  useEffect(() => {
    if (!activeClientId) return

    function initGis() {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response) => {
              sound.click()
              setGoogleLoading(true)
              setError('')
              try {
                // Official server-side token verification on Cloudflare Edge
                const res = await handleGoogleCredential(response.credential)
                if (res.success) {
                  sound.success()
                } else {
                  setError(res.error || 'Google token verification failed.')
                }
              } catch (err) {
                setError(err.message || 'Error verifying Google credential.')
              } finally {
                setGoogleLoading(false)
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          googleBtnRef.current.innerHTML = ''
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 340,
            text: 'continue_with',
            logo_alignment: 'left',
          })
        } catch (e) {
          console.warn('GIS initialization error:', e)
        }
      }
    }

    // Try immediately, or retry after script load
    if (window.google?.accounts?.id) {
      initGis()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          initGis()
        }
      }, 300)
      return () => clearInterval(interval)
    }
  }, [activeClientId, handleGoogleCredential])

  const handleGoogleSubmit = async () => {
    sound.click()
    setError('')
    setGoogleLoading(true)
    try {
      if (activeClientId && window.google?.accounts?.id) {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            loginWithGoogle()
          }
        })
      } else {
        const res = await loginWithGoogle()
        if (res?.error) {
          setError(res.error.message || 'Google sign-in failed.')
        } else {
          sound.success()
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSaveClientId = (e) => {
    e.preventDefault()
    sound.click()
    const trimmed = clientIdInput.trim()
    localStorage.setItem('google_client_id', trimmed)
    setActiveClientId(trimmed)
    setShowConfig(false)
    sound.success()
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    sound.click()
    setError('')
    setLoading(true)

    try {
      const { error: err } = await sendOtp(email)
      if (err) {
        setError(err.message || 'Failed to send OTP code.')
      } else {
        sound.success()
        onOtpRequested?.(email)
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-slate-900/85 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10 rounded-3xl p-8">
      <CardHeader className="text-center items-center pb-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 mb-3 animate-bounce [animation-duration:3s]">
          <Sparkles className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-white">
          Personal Workspace
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1 max-w-xs">
          Edge AI Workspace with Official Google Verification & Cloudflare D1
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Verification Status Pill */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[11px] text-emerald-300">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Official Google Tokeninfo Verification
          </span>
          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
            title="Configure Google OAuth Client ID"
          >
            <Settings2 className="h-3 w-3" />
            {activeClientId ? 'Client ID Set' : 'Configure'}
          </button>
        </div>

        {/* Google Client ID Configuration Drawer */}
        {showConfig && (
          <form onSubmit={handleSaveClientId} className="space-y-2 p-3.5 rounded-2xl border border-white/10 bg-black/40 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-semibold text-slate-200 flex items-center justify-between">
              <span>Google OAuth 2.0 Client ID</span>
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                GCP Console <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Paste your Web Client ID from Google Cloud to enable official One-Tap login.
            </p>
            <input
              type="text"
              placeholder="e.g. 123456789-xyz.apps.googleusercontent.com"
              value={clientIdInput}
              onChange={(e) => setClientIdInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <div className="flex gap-2 justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowConfig(false)}
                className="text-[11px] h-7 px-2.5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-[11px] h-7 px-3 bg-indigo-600 hover:bg-indigo-500"
              >
                Save & Initialize
              </Button>
            </div>
          </form>
        )}

        {/* Official Google Button Render Container (if Client ID set) */}
        {activeClientId && (
          <div className="flex justify-center w-full">
            <div ref={googleBtnRef} className="w-full flex justify-center" />
          </div>
        )}

        {/* Standard / Fallback Google Button */}
        {(!activeClientId || !googleBtnRef.current?.hasChildNodes()) && (
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSubmit}
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 active:scale-[0.98] py-3 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:border-white/25"
          >
            {googleLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            )}
            <span>{googleLoading ? 'Verifying with Google...' : 'Continue with Google'}</span>
          </button>
        )}

        <div className="relative my-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900/90 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <Input
            label="Email Address"
            placeholder="name@example.com"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Button
            type="submit"
            className="w-full rounded-xl py-3 shadow-lg shadow-indigo-600/25"
            loading={loading}
            icon={KeyRound}
          >
            Send Verification Code
          </Button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            or explore instantly
          </span>
        </div>

        <Button
          variant="secondary"
          className="w-full justify-between rounded-xl py-2.5 border-white/10 hover:border-white/20"
          onClick={() => {
            sound.success()
            loginAsGuest()
          }}
          iconRight={ArrowRight}
        >
          <span className="font-semibold text-slate-200">Continue as Guest Explorer</span>
        </Button>
      </CardContent>

      <CardFooter className="justify-center border-t border-white/5 pt-4 text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        <span>Cryptographically Verified ID Token Handshake</span>
      </CardFooter>
    </Card>
  )
}
