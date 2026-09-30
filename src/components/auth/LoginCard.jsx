import { useState } from 'react'
import { Mail, Sparkles, KeyRound, ShieldAlert, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../services/supabase'
import { sound } from '../../services/sound'

export function LoginCard({ onOtpRequested }) {
  const { sendOtp, loginAsGuest, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSubmit = async () => {
    sound.click()
    setError('')
    setGoogleLoading(true)
    try {
      const res = await loginWithGoogle()
      if (res?.error) {
        setError(res.error.message || 'Google sign-in failed.')
      } else {
        sound.success()
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate with Google.')
    } finally {
      setGoogleLoading(false)
    }
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
    <Card className="w-full max-w-md border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 rounded-3xl p-8">
      <CardHeader className="text-center items-center pb-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 mb-3 animate-bounce [animation-duration:3s]">
          <Sparkles className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black tracking-tight text-white">
          Personal Workspace
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 mt-1 max-w-xs">
          Decoupled edge architecture with Cloudflare Workers & Supabase Auth
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {!isSupabaseConfigured && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="leading-relaxed">
              <span className="font-bold">Instant Preview Mode:</span> Click <span className="font-semibold text-white">Continue as Guest</span> to explore immediately, or enter any email and use code <span className="font-mono font-bold text-amber-100 bg-slate-950/80 px-1.5 py-0.5 rounded">123456</span>.
            </div>
          </div>
        )}

        {/* Google Sign-In */}
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
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

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
            error={error}
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
        <span>End-to-End Encrypted Sessions</span>
      </CardFooter>
    </Card>
  )
}
