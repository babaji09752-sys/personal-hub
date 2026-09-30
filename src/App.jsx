import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ViewProvider, useView, VIEWS } from './context/ViewContext'
import { ToastProvider } from './context/ToastContext'
import { AppShell } from './components/layout/AppShell'
import { LoginCard, OTPModal } from './components/auth'
import { Chat, Gallery, Diary, Todos, PdfView, PptView } from './pages'

function ViewRouter() {
  const { activeView } = useView()

  switch (activeView) {
    case VIEWS.CHAT:
      return <Chat />
    case VIEWS.GALLERY:
      return <Gallery />
    case VIEWS.DIARY:
      return <Diary />
    case VIEWS.TODOS:
      return <Todos />
    case VIEWS.PDF:
      return <PdfView />
    case VIEWS.PPT:
      return <PptView />
    default:
      return <Chat />
  }
}

function MainLayoutSwitcher() {
  const { isAuthenticated, loading } = useAuth()
  const [otpEmail, setOtpEmail] = useState('')
  const [isOtpOpen, setIsOtpOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-xs font-medium text-slate-400">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#090d16] p-4 overflow-hidden">
        {/* Subtle dynamic background glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/15 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/15 blur-[140px]" />

        <LoginCard
          onOtpRequested={(email) => {
            setOtpEmail(email)
            setIsOtpOpen(true)
          }}
        />

        <OTPModal
          isOpen={isOtpOpen}
          onClose={() => setIsOtpOpen(false)}
          email={otpEmail}
        />
      </div>
    )
  }

  return (
    <AppShell>
      <ViewRouter />
    </AppShell>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ViewProvider>
        <ToastProvider>
          <MainLayoutSwitcher />
        </ToastProvider>
      </ViewProvider>
    </AuthProvider>
  )
}
