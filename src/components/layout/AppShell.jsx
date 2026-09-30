import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { CommandPalette } from './CommandPalette'
import { useView } from '../../context/ViewContext'

export function AppShell({ children }) {
  const { themeAccent } = useView()

  // Dynamic ambient glow color based on current accent
  const glowColors = {
    indigo: 'from-indigo-600/10 via-purple-600/5 to-transparent',
    emerald: 'from-emerald-600/10 via-teal-600/5 to-transparent',
    rose: 'from-rose-600/10 via-pink-600/5 to-transparent',
    amber: 'from-amber-600/10 via-orange-600/5 to-transparent',
    cyan: 'from-cyan-600/10 via-blue-600/5 to-transparent',
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#090d16] text-slate-100">
      {/* Ambient background glow gradient */}
      <div 
        className={`pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-gradient-to-br ${glowColors[themeAccent] || glowColors.indigo} blur-[140px] opacity-70`}
      />
      <div 
        className={`pointer-events-none absolute -bottom-40 right-10 h-96 w-96 rounded-full bg-gradient-to-tl ${glowColors[themeAccent] || glowColors.indigo} blur-[140px] opacity-50`}
      />

      {/* Global Command Palette */}
      <CommandPalette />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
