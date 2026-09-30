import { 
  MessageSquare, 
  Image, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Presentation, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  X,
  Command,
  Activity
} from 'lucide-react'
import { useView, VIEWS } from '../../context/ViewContext'

const NAV_ITEMS = [
  { id: VIEWS.CHAT, label: 'Chat Assistant', icon: MessageSquare, badge: 'AI' },
  { id: VIEWS.GALLERY, label: 'Photo Gallery', icon: Image },
  { id: VIEWS.DIARY, label: 'Personal Diary', icon: BookOpen },
  { id: VIEWS.TODOS, label: 'Task Tracker', icon: CheckSquare, badge: 'Sprint' },
  { id: VIEWS.PDF, label: 'PDF Documents', icon: FileText },
  { id: VIEWS.PPT, label: 'Slide Decks', icon: Presentation },
]

export function Sidebar() {
  const { 
    activeView, 
    setActiveView, 
    sidebarOpen, 
    closeSidebar, 
    sidebarCollapsed, 
    toggleCollapse,
    themeAccent,
    setCommandPaletteOpen
  } = useView()

  // Dynamic accent style mappings
  const accentStyles = {
    indigo: {
      active: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30',
      icon: 'text-indigo-400',
      indicator: 'bg-indigo-400',
    },
    emerald: {
      active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30',
      icon: 'text-emerald-400',
      indicator: 'bg-emerald-400',
    },
    rose: {
      active: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30',
      icon: 'text-rose-400',
      indicator: 'bg-rose-400',
    },
    amber: {
      active: 'bg-amber-600 text-white shadow-lg shadow-amber-600/30',
      icon: 'text-amber-400',
      indicator: 'bg-amber-400',
    },
    cyan: {
      active: 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30',
      icon: 'text-cyan-400',
      indicator: 'bg-cyan-400',
    },
  }

  const currentTheme = accentStyles[themeAccent] || accentStyles.indigo

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-white/5 bg-slate-950/90 backdrop-blur-2xl transition-all duration-300 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-72`}
      >
        {/* Header / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white tracking-tight text-sm">
                  Personal Hub
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">
                  Edge Cloud Workspace
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={closeSidebar}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className={`px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            Workspace Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id)
                  closeSidebar()
                }}
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? `${currentTheme.active}`
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-100'
                } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : `text-slate-400 group-hover:${currentTheme.icon}`
                  }`}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-900 text-slate-400 border border-white/5'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Spotlight Hint button */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-3">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 p-2.5 text-xs text-slate-400 hover:border-white/10 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Command className="h-3.5 w-3.5 text-indigo-400" />
                <span>Command Menu</span>
              </div>
              <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Telemetry Status Strip */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-t border-white/5 bg-slate-950/40 text-[10px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-emerald-400 animate-pulse" />
              <span>Edge Mesh: 100%</span>
            </span>
            <span className="font-mono text-slate-600">v2.4.0</span>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-white/5">
          {!sidebarCollapsed && (
            <span className="text-xs text-slate-500 font-medium pl-2">
              Collapse Sidebar
            </span>
          )}
          <button
            onClick={toggleCollapse}
            className={`rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer ${
              sidebarCollapsed ? 'mx-auto' : ''
            }`}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
