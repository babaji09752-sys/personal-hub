const variants = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  )
}
