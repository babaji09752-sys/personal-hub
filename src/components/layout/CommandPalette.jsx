import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  MessageSquare, 
  Image, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Presentation, 
  Sparkles, 
  Plus, 
  Volume2, 
  VolumeX, 
  Palette, 
  LogOut, 
  ArrowRight,
  Command
} from 'lucide-react'
import { useView, VIEWS } from '../../context/ViewContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { sound } from '../../services/sound'

export function CommandPalette() {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    setActiveView, 
    soundEnabled, 
    toggleSound, 
    themeAccent, 
    setThemeAccent 
  } = useView()
  const { logout } = useAuth()
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  if (!commandPaletteOpen) return null

  const items = [
    // Navigation
    {
      category: 'Navigate',
      id: 'nav-chat',
      title: 'Go to AI Chat Assistant',
      icon: MessageSquare,
      action: () => setActiveView(VIEWS.CHAT),
    },
    {
      category: 'Navigate',
      id: 'nav-gallery',
      title: 'Go to Photo Gallery',
      icon: Image,
      action: () => setActiveView(VIEWS.GALLERY),
    },
    {
      category: 'Navigate',
      id: 'nav-diary',
      title: 'Go to Personal Diary',
      icon: BookOpen,
      action: () => setActiveView(VIEWS.DIARY),
    },
    {
      category: 'Navigate',
      id: 'nav-todos',
      title: 'Go to Task Tracker',
      icon: CheckSquare,
      action: () => setActiveView(VIEWS.TODOS),
    },
    {
      category: 'Navigate',
      id: 'nav-pdf',
      title: 'Go to PDF Suite',
      icon: FileText,
      action: () => setActiveView(VIEWS.PDF),
    },
    {
      category: 'Navigate',
      id: 'nav-ppt',
      title: 'Go to Slide Deck Studio',
      icon: Presentation,
      action: () => setActiveView(VIEWS.PPT),
    },

    // Quick Actions
    {
      category: 'Actions',
      id: 'act-new-task',
      title: 'Quick: Add New Task',
      icon: Plus,
      action: () => {
        setActiveView(VIEWS.TODOS)
        toast.info('Switched to Tasks', 'Use the quick input bar to capture your next task.')
      },
    },
    {
      category: 'Actions',
      id: 'act-new-diary',
      title: 'Quick: Write Diary Entry',
      icon: BookOpen,
      action: () => {
        setActiveView(VIEWS.DIARY)
        toast.info('Diary Opened', 'Click "New Diary Entry" to log your thoughts.')
      },
    },
    {
      category: 'Actions',
      id: 'act-gen-deck',
      title: 'Quick: Generate AI Presentation Deck',
      icon: Sparkles,
      action: () => {
        setActiveView(VIEWS.PPT)
        toast.info('Slide Studio Ready', 'Click "Generate Deck" to produce an automated outline.')
      },
    },

    // Preferences & Themes
    {
      category: 'Appearance & System',
      id: 'pref-accent-indigo',
      title: 'Set Theme Accent: Electric Indigo',
      icon: Palette,
      badge: 'Accent',
      action: () => {
        setThemeAccent('indigo')
        toast.success('Accent Updated', 'Active theme set to Electric Indigo.')
      },
    },
    {
      category: 'Appearance & System',
      id: 'pref-accent-emerald',
      title: 'Set Theme Accent: Cyber Emerald',
      icon: Palette,
      badge: 'Accent',
      action: () => {
        setThemeAccent('emerald')
        toast.success('Accent Updated', 'Active theme set to Cyber Emerald.')
      },
    },
    {
      category: 'Appearance & System',
      id: 'pref-accent-rose',
      title: 'Set Theme Accent: Rose Sunset',
      icon: Palette,
      badge: 'Accent',
      action: () => {
        setThemeAccent('rose')
        toast.success('Accent Updated', 'Active theme set to Rose Sunset.')
      },
    },
    {
      category: 'Appearance & System',
      id: 'pref-sound',
      title: soundEnabled ? 'Mute Interface Sound Effects' : 'Enable Tactile Sound Effects',
      icon: soundEnabled ? VolumeX : Volume2,
      badge: soundEnabled ? 'Audio ON' : 'Audio OFF',
      action: () => {
        toggleSound()
        toast.info(soundEnabled ? 'Audio Muted' : 'Audio Enabled', 'Interface feedback sound toggled.')
      },
    },
    {
      category: 'Appearance & System',
      id: 'pref-logout',
      title: 'Sign Out Session',
      icon: LogOut,
      action: () => {
        logout()
        toast.info('Signed Out', 'You have been logged out.')
      },
    },
  ]

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setCommandPaletteOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      sound.click()
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      sound.click()
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = filtered[selectedIndex]
      if (selected) {
        sound.click()
        selected.action()
        setCommandPaletteOpen(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, page, or action..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.click()
                    item.action()
                    setCommandPaletteOpen(false)
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/90 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-medium">{item.title}</span>
                      <span
                        className={`ml-2 text-[10px] uppercase tracking-wider ${
                          isSelected ? 'text-indigo-200' : 'text-slate-500'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="h-3.5 w-3.5 text-white/80" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Keyboard Footer */}
        <div className="flex items-center justify-between border-t border-white/5 bg-slate-950/60 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">↑</kbd>{' '}
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700">↵</kbd> select
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Command className="h-3 w-3" />
            <span>Workspace Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  )
}
