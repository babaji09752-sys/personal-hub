import { useState } from 'react'
import { Mail, Sparkles, KeyRound, ShieldAlert, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { isSupabaseConfigured } from '../../services/supabase'
import { sound } from '../../services/sound'

export function LoginCard({ onOtpRequested }) {
  const { sendOtp, loginAsGuest } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
