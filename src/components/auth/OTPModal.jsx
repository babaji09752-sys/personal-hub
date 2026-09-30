import { useState, useRef, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { ShieldCheck, RefreshCw } from 'lucide-react'

export function OTPModal({ isOpen, onClose, email }) {
  const { verifyCode, sendOtp } = useAuth()
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', ''])
      setError('')
      setCountdown(60)
      setTimeout(() => {
        inputRefs.current[0]?.focus()
      }, 100)
    }
  }, [isOpen])

  useEffect(() => {
    let timer
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [isOpen, countdown])

  const handleDigitChange = (index, value) => {
    // Only accept numeric inputs or empty
    const sanitized = value.replace(/\D/g, '')
    const newDigits = [...digits]

    if (sanitized.length > 1) {
      // Pasted full code
      const pasted = sanitized.slice(0, 6).split('')
      pasted.forEach((char, i) => {
        newDigits[i] = char
      })
      setDigits(newDigits)
      const nextIndex = Math.min(pasted.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    newDigits[index] = sanitized
    setDigits(newDigits)

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (e) => {
    e?.preventDefault()
    const token = digits.join('')
    if (token.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await verifyCode(email, token)
      if (res.error) {
        setError(res.error.message || 'Invalid verification code.')
      } else {
        onClose?.()
      }
    } catch (err) {
      setError(err.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setResending(true)
    setError('')
    try {
      await sendOtp(email)
      setCountdown(60)
    } catch (err) {
      setError('Failed to resend code.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Your Account">
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div>
          <p className="text-sm text-slate-300">
            We sent a 6-digit confirmation code to:
          </p>
          <p className="mt-0.5 font-medium text-indigo-400">{email}</p>
        </div>

        <div className="flex justify-center gap-2">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-12 w-11 rounded-lg border border-slate-700 bg-slate-800/80 text-center text-lg font-bold text-slate-100 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          ))}
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="space-y-3 pt-2">
          <Button
            className="w-full"
            loading={loading}
            onClick={handleVerify}
            disabled={digits.some((d) => !d)}
          >
            Confirm & Log In
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <span>Didn't receive the code?</span>
            <button
              onClick={handleResend}
              disabled={countdown > 0 || resending}
              className="font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1"
            >
              {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
