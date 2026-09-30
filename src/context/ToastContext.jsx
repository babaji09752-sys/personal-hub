import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(({ title, message, type = 'info', duration = 3500 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6)
    const newToast = { id, title, message, type }

    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [removeToast])

  const toast = {
    success: (title, message) => addToast({ title, message, type: 'success' }),
    error: (title, message) => addToast({ title, message, type: 'error' }),
    info: (title, message) => addToast({ title, message, type: 'info' }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-bottom-3 ${
              t.type === 'success'
                ? 'border-emerald-500/30 bg-slate-900/95 text-emerald-400'
                : t.type === 'error'
                ? 'border-rose-500/30 bg-slate-900/95 text-rose-400'
                : 'border-indigo-500/30 bg-slate-900/95 text-indigo-400'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
              {t.type === 'error' && <AlertCircle className="h-5 w-5" />}
              {t.type === 'info' && <Info className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">{t.title}</h4>
              {t.message && (
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{t.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
