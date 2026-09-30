export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur-xl transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-lg font-semibold tracking-tight text-slate-100 ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm text-slate-400 ${className}`} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`text-sm text-slate-300 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
