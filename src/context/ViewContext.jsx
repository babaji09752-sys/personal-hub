import { createContext, useContext, useState, useEffect } from 'react'
import { sound } from '../services/sound'

const ViewContext = createContext(null)

export const VIEWS = {
  CHAT: 'chat',
  GALLERY: 'gallery',
  DIARY: 'diary',
  TODOS: 'todos',
  PDF: 'pdf',
  PPT: 'ppt',
}

export function ViewProvider({ children }) {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('last_active_view') || VIEWS.CHAT
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(!sound.isMuted())
  const [themeAccent, setThemeAccent] = useState(() => {
    return localStorage.getItem('app_accent') || 'indigo'
  })

  // Synchronize active view persistence
  const changeActiveView = (view) => {
    sound.click()
    setActiveView(view)
    localStorage.setItem('last_active_view', view)
  }

  // Toggle sound effects
  const toggleSound = () => {
    const next = !soundEnabled
    setSoundEnabled(next)
    sound.setMuted(!next)
    if (next) sound.success()
  }

  // Change theme accent
  const changeAccent = (accent) => {
    sound.toggle()
    setThemeAccent(accent)
    localStorage.setItem('app_accent', accent)
  }

  // Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
        sound.click()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleSidebar = () => {
    sound.click()
    setSidebarOpen((prev) => !prev)
  }

  const closeSidebar = () => setSidebarOpen(false)

  const toggleCollapse = () => {
    sound.click()
    setSidebarCollapsed((prev) => !prev)
  }

  const value = {
    activeView,
    setActiveView: changeActiveView,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
    closeSidebar,
    sidebarCollapsed,
    toggleCollapse,
    commandPaletteOpen,
    setCommandPaletteOpen,
    soundEnabled,
    toggleSound,
    themeAccent,
    setThemeAccent: changeAccent,
    views: VIEWS,
  }

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>
}

export function useView() {
  const context = useContext(ViewContext)
  if (!context) {
    throw new Error('useView must be used within a ViewProvider')
  }
  return context
}
