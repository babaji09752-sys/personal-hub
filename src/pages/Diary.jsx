import { useState, useEffect } from 'react'
import { Plus, Search, BookOpen, Trash2, Calendar as CalendarIcon, Pin, Clock, X } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'
import { getDiaryEntries, createDiaryEntry, deleteDiaryEntry, updateDiaryEntry, mockData } from '../services/api'

const MOODS = ['🚀 Productive', '💡 Inspired', '☕ Relaxed', '🧘 Mindful', '🎯 Focused', '🌧️ Melancholic']
const WEATHERS = ['☀️ Clear Sky', '⛅ Partly Cloudy', '🌧️ Gentle Rain', '⚡ Stormy', '🌙 Starry Night']

export function Diary() {
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewEntry, setViewEntry] = useState(null)

  // Form states
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState(MOODS[0])
  const [weather, setWeather] = useState(WEATHERS[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  // Helper to ensure tags is always a clean array of strings
  const safeTags = (tags) => {
    if (Array.isArray(tags)) return tags
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags)
        if (Array.isArray(parsed)) return parsed
      } catch {
        return tags.split(',').map((t) => t.trim()).filter(Boolean)
      }
    }
    return []
  }

  useEffect(() => {
    const fetchDiary = async () => {
      setLoading(true)
      const data = await getDiaryEntries()
      const rawList = Array.isArray(data) ? data : (mockData.diary || [])
      const normalized = rawList.map((e) => ({
        ...e,
        tags: safeTags(e.tags),
      }))
      setEntries(normalized)
      setLoading(false)
    }
    fetchDiary()
  }, [])

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
        setTagInput('')
      }
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleCreateEntry = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    sound.success()
    const newEntry = {
      id: Date.now(),
      title, mood, weather, date, content,
      tags: tags.length > 0 ? tags : ['journal'],
      isPinned: false,
    }

    setEntries((prev) => [newEntry, ...prev])
    setTitle('')
    setContent('')
    setTags([])
    setTagInput('')
    setIsModalOpen(false)
    toast.success('Journal Saved', 'New reflection recorded in your private vault.')
    
    await createDiaryEntry(newEntry)
  }

  const handleTogglePin = async (id, e) => {
    e?.stopPropagation()
    sound.toggle()
    const entry = entries.find(e => e.id === id)
    if (!entry) return
    const nextPinned = !entry.isPinned

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isPinned: nextPinned } : e))
    )
    await updateDiaryEntry(id, { isPinned: nextPinned })
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    sound.delete()
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
    if (viewEntry?.id === id) setViewEntry(null)
    toast.info('Entry Removed', 'Diary note deleted.')
    await deleteDiaryEntry(id)
  }

  const filteredEntries = entries
    .filter((entry) => {
      const query = searchQuery.toLowerCase()
      return entry.title.toLowerCase().includes(query) || entry.content.toLowerCase().includes(query)
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return (
    <div className="space-y-8">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          <input
            type="text"
            placeholder="Search thoughts, memories, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md pl-12 pr-4 py-3 text-sm text-slate-100 placeholder-white/40 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-lg hover:bg-white/10"
          />
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus} className="rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 w-full md:w-auto py-3">
          New Entry
        </Button>
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {[1,2,3].map(i => <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 bg-white/5 backdrop-blur-xl">
          <BookOpen className="mx-auto h-16 w-16 text-slate-400/50 mb-4" />
          <h3 className="text-lg font-medium text-slate-200">No reflections found</h3>
          <p className="text-sm text-slate-400 mt-2">Start writing down your ideas and memories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max items-start">
          {filteredEntries.map((entry, idx) => {
            const wordCount = entry.content.split(/\s+/).filter(Boolean).length
            return (
              <div
                key={entry.id}
                onClick={() => setViewEntry(entry)}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`group animate-in fade-in slide-in-from-bottom-4 cursor-pointer flex flex-col rounded-3xl border bg-white/5 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-white/20 relative overflow-hidden ${
                  entry.isPinned ? 'border-amber-500/30 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-gradient-to-b before:from-amber-400 before:to-amber-600' : 'border-white/10'
                }`}
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl" title="Mood">{entry.mood.split(' ')[0]}</span>
                  <div className="flex gap-2">
                    {entry.isPinned && <Pin className="h-4 w-4 text-amber-400 fill-amber-400/20" />}
                    <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1 text-[10px] text-slate-300 font-mono">
                      <Clock className="h-3 w-3" /> {wordCount}w
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">{entry.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-4 leading-relaxed flex-1 mb-6">
                  {entry.content}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarIcon className="h-3.5 w-3.5 text-indigo-400" />
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px]">{entry.weather.split(' ')[0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(entry.tags) ? entry.tags : safeTags(entry.tags)).slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-medium tracking-wide">
                        #{tag}
                      </span>
                    ))}
                    {(Array.isArray(entry.tags) ? entry.tags : safeTags(entry.tags)).length > 3 && (
                      <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-400 text-[10px]">
                        +{(Array.isArray(entry.tags) ? entry.tags : safeTags(entry.tags)).length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Write New Diary Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Diary Entry" maxWidth="max-w-3xl">
        <form onSubmit={handleCreateEntry} className="space-y-5">
          <Input label="Title" placeholder="What's on your mind?" value={title} onChange={(e) => setTitle(e.target.value)} required className="text-lg" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Mood</label>
              <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Weather</label>
              <select value={weather} onChange={(e) => setWeather(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none">
                {WEATHERS.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-1.5 text-left">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Content</label>
              <span className="text-[10px] text-slate-500">{content.length} chars • {content.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-base text-slate-100 placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 leading-relaxed transition-all"
              required
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Tags (Press Enter)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg text-xs">
                  #{t} <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => removeTag(t)} />
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. tech, personal..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-6">Save Entry</Button>
          </div>
        </form>
      </Modal>

      {/* View Full Entry Modal */}
      {viewEntry && (
        <Modal isOpen={!!viewEntry} onClose={() => setViewEntry(null)} maxWidth="max-w-4xl">
          <div className="p-4 sm:p-8 space-y-6 text-left">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-4xl bg-white/5 p-3 rounded-2xl border border-white/10">{viewEntry.mood.split(' ')[0]}</span>
                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">{viewEntry.title}</h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
                    <CalendarIcon className="h-4 w-4" /> {new Date(viewEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    <span>•</span>
                    <span>{viewEntry.weather}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleTogglePin(viewEntry.id)} className={`p-2 rounded-xl border transition-colors ${viewEntry.isPinned ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                  <Pin className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(viewEntry.id)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-a:text-indigo-400 bg-white/5 rounded-3xl p-6 md:p-10 border border-white/5 shadow-inner">
              <p className="whitespace-pre-wrap text-slate-300 font-serif">{viewEntry.content}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              {(Array.isArray(viewEntry?.tags) ? viewEntry.tags : safeTags(viewEntry?.tags)).map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-semibold">#{tag}</span>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
