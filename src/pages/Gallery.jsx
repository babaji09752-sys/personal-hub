import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Image as ImageIcon, 
  Eye, 
  Download, 
  Heart, 
  Search, 
  Upload, 
  Sparkles, 
  Camera, 
  Palette, 
  Share2, 
  X,
  SlidersHorizontal
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const INITIAL_PHOTOS = [
  {
    id: 1,
    title: 'Neon Tokyo Alleyway',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    category: 'Cyberpunk',
    date: '2026-09-28',
    likes: 42,
    camera: 'Sony A7R V • 35mm f/1.4',
    shutter: '1/250s • ISO 400',
    colors: ['#0f172a', '#6366f1', '#ec4899', '#38bdf8'],
    isFavorite: true,
  },
  {
    id: 2,
    title: 'Alpine Mirror Lake',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature',
    date: '2026-09-25',
    likes: 89,
    camera: 'Fujifilm GFX 100S',
    shutter: '1/500s • ISO 100',
    colors: ['#064e3b', '#10b981', '#38bdf8', '#0284c7'],
    isFavorite: false,
  },
  {
    id: 3,
    title: 'Futuristic Architectural Void',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    category: 'Architecture',
    date: '2026-09-22',
    likes: 35,
    camera: 'Canon EOS R5 • 16-35mm',
    shutter: '1/160s • ISO 64',
    colors: ['#1e293b', '#94a3b8', '#f8fafc', '#e2e8f0'],
    isFavorite: false,
  },
  {
    id: 4,
    title: 'Orbital Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
    category: 'Nature',
    date: '2026-09-18',
    likes: 124,
    camera: 'Nikon Z9 • 14-24mm f/2.8',
    shutter: '2.5s • ISO 1600',
    colors: ['#065f46', '#34d399', '#0284c7', '#0f172a'],
    isFavorite: true,
  },
  {
    id: 5,
    title: 'Generative Neural Blooms',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    category: 'AI Art',
    date: '2026-09-15',
    likes: 77,
    camera: 'Midjourney v6.1 • Upscaled 4K',
    shutter: 'Synthesized Latent Space',
    colors: ['#7c3aed', '#ec4899', '#f43f5e', '#3b82f6'],
    isFavorite: true,
  },
  {
    id: 6,
    title: 'Minimalist Engineering Desk',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    category: 'Workspace',
    date: '2026-09-10',
    likes: 56,
    camera: 'Leica Q3 • 28mm f/1.7',
    shutter: '1/320s • ISO 200',
    colors: ['#090d16', '#334155', '#e2e8f0', '#6366f1'],
    isFavorite: false,
  },
]

export function Gallery() {
  const toast = useToast()
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('gallery_photos')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_PHOTOS
  })

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [activePhoto, setActivePhoto] = useState(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadedPreview, setUploadedPreview] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Nature')
  const fileInputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('gallery_photos', JSON.stringify(photos))
  }, [photos])

  const categories = ['All', 'Favorites', ...new Set(photos.map((p) => p.category))]

  const handleFavoriteToggle = (id, e) => {
    e?.stopPropagation()
    sound.toggle()
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isFavorite: !p.isFavorite, likes: p.isFavorite ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedPreview(url)
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
      }
    }
  }

  const handleUploadSubmit = (e) => {
    e.preventDefault()
    if (!uploadedPreview && !newTitle) return

    sound.success()
    const newEntry = {
      id: Date.now(),
      title: newTitle || 'Untitled Capture',
      url: uploadedPreview || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      likes: 1,
      camera: 'Imported Media Asset',
      shutter: 'Native Resolution',
      colors: ['#0f172a', '#4f46e5', '#38bdf8', '#e2e8f0'],
      isFavorite: true,
    }

    setPhotos((prev) => [newEntry, ...prev])
    setNewTitle('')
    setUploadedPreview(null)
    setIsUploadOpen(false)
    toast.success('Image Added', 'New asset added to your Cloudflare R2 gallery.')
  }

  const handleCopyColor = (color) => {
    sound.click()
    navigator.clipboard.writeText(color)
    toast.success('Color Copied', `${color} hex code copied.`)
  }

  const filteredPhotos = photos.filter((photo) => {
    const matchesCat =
      selectedCategory === 'All'
        ? true
        : selectedCategory === 'Favorites'
        ? photo.isFavorite
        : photo.category === selectedCategory

    const matchesQuery =
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCat && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search & Categories */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search images by title or style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.click()
                  setSelectedCategory(cat)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat === 'Favorites' ? '❤️ Favorites' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={() => {
            sound.click()
            setIsUploadOpen(true)
          }}
          icon={Plus}
          size="sm"
          className="rounded-xl shadow-lg shadow-indigo-600/20"
        >
          Upload Asset
        </Button>
      </div>

      {/* Dynamic Grid View */}
      {filteredPhotos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 glass-card">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-medium text-slate-300">No assets match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try another category or upload a new photo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => {
                sound.click()
                setActivePhoto(photo)
              }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
            >
              {/* Media Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient vignette on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Top Badge & Heart */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-950/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-slate-200 border border-white/10">
                    {photo.category}
                  </span>

                  <button
                    onClick={(e) => handleFavoriteToggle(photo.id, e)}
                    className={`rounded-full p-2 backdrop-blur-md transition-transform active:scale-125 cursor-pointer ${
                      photo.isFavorite
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-950/60 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${photo.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Info Footer */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors truncate max-w-[200px]">
                    {photo.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{photo.date}</span>
                    <span>•</span>
                    <span className="text-slate-500 font-mono text-[10px]">{photo.camera?.split('•')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1">
                    {photo.colors?.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="h-3.5 w-3.5 rounded-full border border-slate-900 shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox & EXIF Modal */}
      {activePhoto && (
        <Modal
          isOpen={Boolean(activePhoto)}
          onClose={() => setActivePhoto(null)}
          title={activePhoto.title}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5">
            {/* Fullscreen Image Preview */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 max-h-[65vh] flex items-center justify-center border border-white/10">
              <img
                src={activePhoto.url}
                alt={activePhoto.title}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Metadata, EXIF & Palette */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
              {/* Camera & Tech Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <Camera className="h-4 w-4" />
                  <span>Optics & Capture Telemetry</span>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Device:</span> {activePhoto.camera}</p>
                  <p><span className="text-slate-500">Exposure:</span> {activePhoto.shutter}</p>
                  <p><span className="text-slate-500">Date:</span> {activePhoto.date}</p>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Palette className="h-4 w-4" />
                  <span>Harmonic Color Palette (Click to copy)</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {activePhoto.colors?.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyColor(color)}
                      className="group flex flex-col items-center gap-1 cursor-pointer"
                      title={`Copy ${color}`}
                    >
                      <div
                        className="h-8 w-8 rounded-xl border border-white/20 shadow-md group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-white">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={(e) => handleFavoriteToggle(activePhoto.id, e)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  activePhoto.isFavorite
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${activePhoto.isFavorite ? 'fill-current' : ''}`} />
                <span>{activePhoto.likes} Likes</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Full Res</span>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Drag & Drop Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Image to Cloudflare R2"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/60 p-6 text-center hover:border-indigo-500/50 transition-colors cursor-pointer"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploadedPreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <img src={uploadedPreview} alt="Preview" className="h-full w-full object-cover" />
              </div>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-2">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Click to choose a file or drag & drop
                </p>
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WebP up to 25MB</p>
              </>
            )}
          </div>

          <Input
            label="Title"
            placeholder="e.g. Rainy Street in Kyoto"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="Nature">Nature</option>
              <option value="Cyberpunk">Cyberpunk</option>
              <option value="Architecture">Architecture</option>
              <option value="AI Art">AI Art</option>
              <option value="Workspace">Workspace</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Save to Gallery
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
