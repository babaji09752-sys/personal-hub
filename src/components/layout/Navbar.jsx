import { useState, useRef, useEffect } from 'react'
import { 
  Menu, 
  LogOut, 
  User, 
  Zap, 
  Search, 
  Volume2, 
  VolumeX, 
  Palette, 
  Check, 
  Command,
  ChevronDown
} from 'lucide-react'
import { useView, VIEWS } from '../../context/ViewContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { sound } from '../../services/sound'

const VIEW_METADATA = {
  [VIEWS.CHAT]: { title: 'AI Chat Assistant', subtitle: 'Edge-powered multi-model conversation engine', tag: 'LLM Active' },
  [VIEWS.GALLERY]: { title: 'Photo Gallery', subtitle: 'Cloudflare R2 visual asset vault', tag: 'R2 Bucket' },
  [VIEWS.DIARY]: { title: 'Personal Diary', subtitle: 'Encrypted daily reflections, mood & notes', tag: 'Private Vault' },
  [VIEWS.TODOS]: { title: 'Task Tracker', subtitle: 'Focus sprint, priorities & metrics', tag: 'Productivity' },
  [VIEWS.PDF]: { title: 'PDF Suite', subtitle: 'Document intelligence & executive summaries', tag: 'OCR Enabled' },
  [VIEWS.PPT]: { title: 'Slide Deck Studio', subtitle: 'Dynamic keynote generator & presenter', tag: 'Slide Engine' },
}

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-500' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
]

export function Navbar() {
  const { 
    activeView, 
    toggleSidebar, 
    setCommandPaletteOpen, 
    soundEnabled, 
    toggleSound, 
    themeAccent, 
    setThemeAccent 
  } = useView()
  const { user, logout } = useAuth()
  const toast = useToast()

  const [accentDropdownOpen, setAccentDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccentDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentInfo = VIEW_METADATA[activeView] || { title: 'Workspace', subtitle: '', tag: 'Ready' }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-slate-950/70 px-4 sm:px-6 backdrop-blur-2xl">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800/80 hover:text-white lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {currentInfo.title}
            </h1>
            <Badge variant="primary" className="hidden sm:inline-flex text-[10px] py-0 px-2">
              {currentInfo.tag}
            </Badge>
          </div>
          <p className="hidden text-xs text-slate-400 sm:block leading-none mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center">
        <button
          onClick={() => {
            sound.click()
            setCommandPaletteOpen(true)
          }}
          className="group flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400 transition-all hover:border-indigo-500/50 hover:bg-slate-900 hover:text-slate-200 cursor-pointer shadow-sm hover:shadow-indigo-500/10"
        >
          <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          <span>Search or jump to...</span>
          <kbd className="flex items-center gap-0.5 rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
            <Command className="h-2.5 w-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Sound, Theme, User & Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sound Toggle */}
        <button
          onClick={() => {
            toggleSound()
            toast.info(soundEnabled ? 'Audio Muted' : 'Audio Enabled', 'Interface feedback sound toggled.')
          }}
          className={`rounded-xl p-2 transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-indigo-400 hover:bg-indigo-500/10'
              : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute tactile sounds' : 'Enable tactile sounds'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        {/* Theme Accent Picker */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              sound.click()
              setAccentDropdownOpen((prev) => !prev)
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-300 hover:border-white/20 transition-all cursor-pointer"
            title="Customize accent color"
          >
            <div className={`h-3 w-3 rounded-full ${
              themeAccent === 'emerald' ? 'bg-emerald-400 shadow-emerald-500/50' :
              themeAccent === 'rose' ? 'bg-rose-400 shadow-rose-500/50' :
              themeAccent === 'amber' ? 'bg-amber-400 shadow-amber-500/50' :
              themeAccent === 'cyan' ? 'bg-cyan-400 shadow-cyan-500/50' :
              'bg-indigo-400 shadow-indigo-500/50'
            } shadow-sm`} />
            <span className="hidden sm:inline capitalize">{themeAccent}</span>
            <ChevronDown className="h-3 w-3 text-slate-500 hidden sm:inline" />
          </button>

          {accentDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Theme Color
              </div>
              {ACCENT_COLORS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => {
                    setThemeAccent(col.id)
                    setAccentDropdownOpen(false)
                    toast.success('Accent Changed', `Switched theme accent to ${col.name}.`)
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.bg}`} />
                    <span>{col.name}</span>
                  </div>
                  {themeAccent === col.id && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 p-1 sm:px-2.5 sm:py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 text-white font-bold text-xs shadow-sm">
            {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
              {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
              {user?.isGuest ? 'Guest Access' : user?.email}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            sound.click()
            logout()
            toast.info('Signed Out', 'You have successfully signed out.')
          }}
          className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
