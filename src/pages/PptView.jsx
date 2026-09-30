import { useState, useEffect } from 'react'
import { 
  Presentation, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Plus, 
  Layout, 
  Palette, 
  Clock, 
  Maximize2, 
  X,
  FileCheck,
  TrendingUp,
  Shield,
  Zap,
  Columns
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const SLIDE_THEMES = [
  { id: 'indigo', name: 'Cyber Indigo', bg: 'from-slate-950 via-slate-900 to-indigo-950/60', accent: 'text-indigo-400', border: 'border-indigo-500/30' },
  { id: 'emerald', name: 'Aurora Emerald', bg: 'from-slate-950 via-slate-900 to-emerald-950/60', accent: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'rose', name: 'Midnight Rose', bg: 'from-slate-950 via-slate-900 to-rose-950/60', accent: 'text-rose-400', border: 'border-rose-500/30' },
  { id: 'amber', name: 'Solar Amber', bg: 'from-slate-950 via-slate-900 to-amber-950/60', accent: 'text-amber-400', border: 'border-amber-500/30' },
]

const DEFAULT_SLIDES = [
  {
    id: 1,
    layout: 'hero',
    badge: 'Executive Keynote',
    title: 'Modern Decoupled Edge Architecture',
    subtitle: 'Zero Cold Starts, Instant Verification & Global Edge Routing',
    notes: 'Start the keynote by introducing the shift from centralized compute to global V8 isolates.',
  },
  {
    id: 2,
    layout: 'metrics',
    badge: 'Key Metrics',
    title: 'Performance Benchmarks Across 310+ Cities',
    metrics: [
      { label: 'Time-to-First-Byte', value: '42ms', desc: 'Global median edge latency' },
      { label: 'Availability SLA', value: '99.99%', desc: 'Distributed BGP anycast' },
      { label: 'Egress Bandwidth Cost', value: '$0.00', desc: 'Zero egress with Cloudflare R2' },
    ],
    notes: 'Highlight the zero egress fees compared to AWS S3 standard rates.',
  },
  {
    id: 3,
    layout: 'features',
    badge: 'Core Capabilities',
    title: 'Tri-Pillar Security & Resilience',
    features: [
      { icon: Zap, title: 'Edge Worker Isolates', text: 'Sub-5ms initialization with ultra-lean V8 sandbox.' },
      { icon: Shield, title: 'Row-Level Database Security', text: 'Multitenant isolation via PostgreSQL policies in Supabase.' },
      { icon: TrendingUp, title: 'Autonomous Vector Sync', text: 'Real-time embedding search for documents and user notes.' },
    ],
    notes: 'Emphasize how PostgreSQL RLS prevents unauthorized data access across tenants.',
  },
]

export function PptView() {
  const toast = useToast()
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [currentTheme, setCurrentTheme] = useState(SLIDE_THEMES[0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [presenterTimer, setPresenterTimer] = useState(0)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)
  const [topicPrompt, setTopicPrompt] = useState('')
  const [generating, setGenerating] = useState(false)

  // Fullscreen timer ticker
  useEffect(() => {
    let interval
    if (isFullscreen) {
      interval = setInterval(() => setPresenterTimer((t) => t + 1), 1000)
    } else {
      setPresenterTimer(0)
    }
    return () => clearInterval(interval)
  }, [isFullscreen])

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
          handleNextSlide()
        } else if (e.key === 'ArrowLeft') {
          handlePrevSlide()
        } else if (e.key === 'Escape') {
          setIsFullscreen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, currentSlideIndex, slides.length])

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      sound.click()
      setCurrentSlideIndex((c) => c + 1)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      sound.click()
      setCurrentSlideIndex((c) => c - 1)
    }
  }

  const handleAddSlide = () => {
    sound.click()
    const newSlide = {
      id: Date.now(),
      layout: 'hero',
      badge: `Slide ${slides.length + 1}`,
      title: 'New Slide Title',
      subtitle: 'Add subtitle or description details here.',
      notes: 'Speaker notes for this newly created slide.',
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlideIndex(slides.length)
    toast.info('Slide Created', 'Appended to presentation deck.')
  }

  const handleGenerateDeck = (e) => {
    e.preventDefault()
    if (!topicPrompt.trim()) return

    setGenerating(true)
    setTimeout(() => {
      sound.success()
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      })

      const generated = [
        {
          id: Date.now(),
          layout: 'hero',
          badge: 'AI Generated Deck',
          title: topicPrompt,
          subtitle: 'Comprehensive Strategy, Architecture & Scaling Roadmap',
          notes: `Kickoff presentation for ${topicPrompt}.`,
        },
        {
          id: Date.now() + 1,
          layout: 'metrics',
          badge: 'ROI & Velocity',
          title: 'Projected Efficiency Gains',
          metrics: [
            { label: 'Deployment Velocity', value: '4.8x', desc: 'Automated CI/CD with Cloudflare' },
            { label: 'Total Cost of Ownership', value: '-65%', desc: 'Serverless operational savings' },
            { label: 'User Satisfaction', value: '98%', desc: 'Ultra-low latency experiences' },
          ],
          notes: 'Present the business return on investment.',
        },
        {
          id: Date.now() + 2,
          layout: 'features',
          badge: 'Next Milestones',
          title: 'Execution Phases',
          features: [
            { icon: Zap, title: 'Phase 1: Foundation', text: 'Establish Supabase schemas and edge proxy routines.' },
            { icon: Shield, title: 'Phase 2: Hardening', text: 'Implement comprehensive security compliance and RLS audits.' },
            { icon: TrendingUp, title: 'Phase 3: Scale', text: 'Global edge rollout with automated synthetic monitoring.' },
          ],
          notes: 'Outline sequential roadmap delivery.',
        },
      ]

      setSlides(generated)
      setCurrentSlideIndex(0)
      setGenerating(false)
      setIsGenerateOpen(false)
      setTopicPrompt('')
      toast.success('Presentation Generated! 🚀', 'AI created 3 tailored presentation slides.')
    }, 1200)
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentSlide = slides[currentSlideIndex] || slides[0]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Slide Deck Studio & Presenter
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Craft sleek presentation decks, switch visual themes, and present in cinematic fullscreen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              sound.click()
              setIsFullscreen(true)
            }}
            icon={Play}
            size="sm"
            className="rounded-xl border-white/10"
          >
            Present Fullscreen
          </Button>

          <Button
            onClick={() => {
              sound.click()
              setIsGenerateOpen(true)
            }}
            icon={Sparkles}
            size="sm"
            className="rounded-xl shadow-lg shadow-indigo-600/20"
          >
            AI Generate Deck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Thumbnails Navigator */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Slides ({slides.length})
            </span>
            <button
              onClick={handleAddSlide}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {slides.map((s, idx) => {
              const isSelected = currentSlideIndex === idx
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    sound.click()
                    setCurrentSlideIndex(idx)
                  }}
                  className={`group relative rounded-2xl border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-950/40 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                    <span>Slide {idx + 1}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{s.layout}</span>
                  </div>

                  <div className="aspect-video w-full rounded-lg bg-slate-950 p-2 flex flex-col justify-center border border-white/5 overflow-hidden">
                    <span className="text-[10px] font-semibold text-slate-200 truncate">
                      {s.title}
                    </span>
                    <span className="text-[8px] text-slate-500 truncate mt-0.5">
                      {s.subtitle || (s.metrics ? `${s.metrics.length} metrics` : `${s.features?.length} features`)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Center Presentation 16:9 Viewport */}
        <div className="lg:col-span-9 space-y-4">
          <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* Viewport Control Bar */}
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-6 py-3">
              {/* Theme Picker */}
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-400 hidden sm:inline">Theme:</span>
                <div className="flex items-center gap-1.5">
                  {SLIDE_THEMES.map((th) => (
                    <button
                      key={th.id}
                      onClick={() => {
                        sound.toggle()
                        setCurrentTheme(th)
                      }}
                      className={`h-4 w-4 rounded-full border transition-all cursor-pointer ${
                        currentTheme.id === th.id
                          ? 'border-white scale-125 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      } ${
                        th.id === 'indigo'
                          ? 'bg-indigo-500'
                          : th.id === 'emerald'
                          ? 'bg-emerald-500'
                          : th.id === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      title={th.name}
                    />
                  ))}
                </div>
              </div>

              {/* Slide Navigation Buttons */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-400">
                  {currentSlideIndex + 1} / {slides.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlideIndex === 0}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 16:9 Presentation Slide Canvas */}
            <div className={`aspect-video w-full bg-gradient-to-br ${currentTheme.bg} p-8 sm:p-12 md:p-16 flex flex-col justify-center border-b border-white/10`}>
              {currentSlide.layout === 'hero' && (
                <div className="space-y-5 max-w-2xl animate-in fade-in duration-300">
                  <div className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md">
                    {currentSlide.badge}
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {currentSlide.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    {currentSlide.subtitle}
                  </p>
                </div>
              )}

              {currentSlide.layout === 'metrics' && (
                <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
                  <div className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md">
                    {currentSlide.badge}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {currentSlide.metrics?.map((m, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md">
                        <div className={`font-mono text-2xl sm:text-3xl font-black ${currentTheme.accent}`}>
                          {m.value}
                        </div>
                        <div className="text-xs font-bold text-slate-200 mt-1">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentSlide.layout === 'features' && (
                <div className="space-y-6 max-w-3xl animate-in fade-in duration-300">
                  <div className="inline-block rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-slate-200 border border-white/15 backdrop-blur-md">
                    {currentSlide.badge}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {currentSlide.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {currentSlide.features?.map((f, idx) => {
                      const Icon = f.icon
                      return (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md space-y-2">
                          <div className={`h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center ${currentTheme.accent}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-bold text-slate-200">{f.title}</div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">{f.text}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Speaker Notes Drawer */}
            <div className="p-4 bg-slate-950/80 flex items-start gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Speaker Notes:
              </span>
              <p className="text-xs text-slate-400 flex-1 leading-relaxed">
                {currentSlide.notes || 'No speaker notes written for this slide.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Fullscreen Presenter Mode */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-in fade-in duration-200">
          {/* Top Presenter Bar */}
          <div className="flex items-center justify-between border-b border-white/10 px-8 py-4 bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Live Keynote</span>
              <span className="text-xs font-mono text-indigo-400 ml-4">
                Elapsed: {formatTimer(presenterTimer)}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-slate-400">
                {currentSlideIndex + 1} of {slides.length}
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                title="Exit fullscreen (ESC)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas Content */}
          <div className={`flex-1 flex items-center justify-center bg-gradient-to-br ${currentTheme.bg} p-12 md:p-24`}>
            {currentSlide.layout === 'hero' && (
              <div className="text-center space-y-6 max-w-4xl">
                <div className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-slate-100 border border-white/20">
                  {currentSlide.badge}
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                  {currentSlide.title}
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
                  {currentSlide.subtitle}
                </p>
              </div>
            )}

            {currentSlide.layout === 'metrics' && (
              <div className="space-y-8 max-w-5xl w-full">
                <div className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold text-slate-100 border border-white/20">
                  {currentSlide.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {currentSlide.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {currentSlide.metrics?.map((m, idx) => (
                    <div key={idx} className="rounded-3xl border border-white/15 bg-slate-950/70 p-8 text-center space-y-2">
                      <div className={`font-mono text-4xl sm:text-5xl font-black ${currentTheme.accent}`}>
                        {m.value}
                      </div>
                      <div className="text-base font-bold text-slate-200">{m.label}</div>
                      <div className="text-xs text-slate-400">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSlide.layout === 'features' && (
              <div className="space-y-8 max-w-5xl w-full">
                <div className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-semibold text-slate-100 border border-white/20">
                  {currentSlide.badge}
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  {currentSlide.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {currentSlide.features?.map((f, idx) => (
                    <div key={idx} className="rounded-3xl border border-white/15 bg-slate-950/70 p-6 space-y-3">
                      <div className="text-base font-bold text-slate-100">{f.title}</div>
                      <div className="text-xs text-slate-400 leading-relaxed">{f.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Presenter Nav Bar */}
          <div className="flex items-center justify-between border-t border-white/10 px-8 py-4 bg-slate-950/80">
            <div className="text-xs text-slate-400">
              Press <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-white">Space</kbd> or <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-white">→</kbd> to advance
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                Next Slide
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Deck Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate AI Keynote Deck"
      >
        <form onSubmit={handleGenerateDeck} className="space-y-4">
          <Input
            label="Presentation Theme / Topic"
            placeholder="e.g. Scaling Edge Compute to 100k Daily Active Users"
            value={topicPrompt}
            onChange={(e) => setTopicPrompt(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsGenerateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={generating} icon={Sparkles}>
              Generate Slides
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
