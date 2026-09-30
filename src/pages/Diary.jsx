import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  Calendar as CalendarIcon, 
  Smile, 
  CloudSun, 
  Pin, 
  Clock, 
  FileText,
  Tag,
  Bold,
  Italic,
  List,
  Code,
  Flame
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const MOODS = [
  { label: '🚀 Productive', color: 'text-indigo-400 bg-indigo-500/10' },
  { label: '💡 Inspired', color: 'text-amber-400 bg-amber-500/10' },
  { label: '☕ Relaxed', color: 'text-emerald-400 bg-emerald-500/10' },
  { label: '🧘 Mindful', color: 'text-teal-400 bg-teal-500/10' },
  { label: '🎯 Focused', color: 'text-purple-400 bg-purple-500/10' },
  { label: '🌧️ Melancholic', color: 'text-slate-400 bg-slate-800' },
]

const WEATHERS = ['☀️ Clear Sky', '⛅ Partly Cloudy', '🌧️ Gentle Rain', '⚡ Stormy', '🌙 Starry Night']

const INITIAL_ENTRIES = [
  {
    id: 1,
    title: 'Architecting the Cloudflare Edge Personal Hub',
    date: '2026-09-30',
    mood: '🚀 Productive',
    weather: '🌙 Starry Night',
    content: `Today I finalized the decoupled fullstack setup.\n\nThe edge worker handles all routing logic with ultra-low latency, and Supabase manages user identities with zero friction.\n\nDesigning with glassmorphism and tactile audio feedback feels so satisfying. Key takeaway: Never sacrifice responsiveness for aesthetic flair—balance both seamlessly.`,
    tags: ['engineering', 'design', 'milestone'],
    isPinned: true,
  },
  {
    id: 2,
    title: 'Reflections on Clean UI & Focused Workflows',
    date: '2026-09-28',
    mood: '💡 Inspired',
    weather: '☀️ Clear Sky',
    content: `Simplicity is about eliminating the non-essential so the essential may speak.\n\nBuilding out the command palette with ⌘K feels like having superpowers. Navigating between chat, gallery, and notes without taking hands off the keyboard elevates productivity exponentially.`,
    tags: ['philosophy', 'productivity'],
    isPinned: false,
  },
]

export function Diary() {
  const toast = useToast()
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('diary_entries')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_ENTRIES
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState(MOODS[0].label)
  const [weather, setWeather] = useState(WEATHERS[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    localStorage.setItem('diary_entries', JSON.stringify(entries))
  }, [entries])

  const allTags = ['All', ...new Set(entries.flatMap((e) => e.tags || []))]

  const handleCreateEntry = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    sound.success()
    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)

    const newEntry = {
      id: Date.now(),
      title,
      mood,
      weather,
      date,
      content,
      tags: tags.length > 0 ? tags : ['journal'],
      isPinned: false,
    }

    setEntries((prev) => [newEntry, ...prev])
    setTitle('')
    setContent('')
    setTagInput('')
    setIsModalOpen(false)
    toast.success('Journal Saved', 'New reflection recorded in your private vault.')
  }

  const handleTogglePin = (id, e) => {
    e?.stopPropagation()
    sound.toggle()
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isPinned: !entry.isPinned } : entry
      )
    )
    toast.info('Status Updated', 'Entry pin state toggled.')
  }

  const handleDelete = (id) => {
    sound.delete()
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    toast.info('Entry Removed', 'Diary note deleted.')
  }

  const insertMarkdown = (syntax) => {
    sound.click()
    setContent((prev) => prev + syntax)
  }

  // Calculate stats
  const totalWords = entries.reduce(
    (acc, e) => acc + (e.content ? e.content.split(/\s+/).filter(Boolean).length : 0),
    0
  )

  const filteredEntries = entries
    .filter((entry) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags?.some((t) => t.toLowerCase().includes(query))

      const matchesTag = selectedTag === 'All' || entry.tags?.includes(selectedTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return (
    <div className="space-y-6">
      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card flex items-center gap-3.5 rounded-2xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{entries.length}</div>
            <div className="text-xs text-slate-400">Total Reflections</div>
          </div>
        </div>

        <div className="glass-card flex items-center gap-3.5 rounded-2xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-slate-400">Words Recorded</div>
          </div>
        </div>

        <div className="glass-card flex items-center gap-3.5 rounded-2xl p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">4 Days</div>
            <div className="text-xs text-slate-400">Journaling Streak</div>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search thoughts, memories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  sound.click()
                  setSelectedTag(tag)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
                }`}
              >
                {tag === 'All' ? 'All Tags' : `#${tag}`}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            sound.click()
            setIsModalOpen(true)
          }}
          icon={Plus}
          size="sm"
          className="rounded-xl shadow-lg shadow-indigo-600/20"
        >
          New Diary Entry
        </Button>
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 glass-card">
          <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-medium text-slate-300">No reflections found</h3>
          <p className="text-xs text-slate-500 mt-1">Start writing down your ideas and reflections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEntries.map((entry) => {
            const wordCount = entry.content.split(/\s+/).filter(Boolean).length
            const readTime = Math.ceil(wordCount / 180)

            return (
              <Card
                key={entry.id}
                className={`relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                  entry.isPinned ? 'ring-1 ring-indigo-500/50 bg-indigo-950/20' : ''
                }`}
              >
                <div>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {entry.isPinned && (
                          <span className="flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                            <Pin className="h-3 w-3 fill-current" /> Pinned
                          </span>
                        )}
                        <CardTitle className="text-lg font-bold text-slate-100 hover:text-indigo-300 transition-colors">
                          {entry.title}
                        </CardTitle>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
                          {entry.date}
                        </span>
                        <span>•</span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                          {entry.mood}
                        </span>
                        {entry.weather && (
                          <span className="text-[11px] text-slate-400">
                            {entry.weather}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleTogglePin(entry.id, e)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          entry.isPinned
                            ? 'text-indigo-400 hover:text-indigo-300'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={entry.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="mt-2">
                    <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line line-clamp-5">
                      {entry.content}
                    </p>
                  </CardContent>
                </div>

                <CardFooter className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags?.map((tag) => (
                      <Badge key={tag} variant="primary" className="text-[10px]">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{readTime} min read • {wordCount} words</span>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Write New Diary Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Compose Daily Reflection"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateEntry} className="space-y-4">
          <Input
            label="Title"
            placeholder="Key breakthrough, idea or feeling..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {MOODS.map((m) => (
                  <option key={m.label} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {WEATHERS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Quick Markdown formatting bar */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Journal Content
              </label>
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => insertMarkdown('**bold text** ')}
                  className="rounded p-1 hover:bg-slate-800 hover:text-white"
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('*italic text* ')}
                  className="rounded p-1 hover:bg-slate-800 hover:text-white"
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('\n- List item ')}
                  className="rounded p-1 hover:bg-slate-800 hover:text-white"
                  title="Bullet list"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdown('`code` ')}
                  className="rounded p-1 hover:bg-slate-800 hover:text-white"
                  title="Inline code"
                >
                  <Code className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What made today memorable? What problems did you conquer?"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/90 p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              required
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            placeholder="tech, philosophy, personal"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save to Diary
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
