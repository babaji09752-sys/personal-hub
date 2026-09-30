import { useState, useEffect, useRef } from 'react'
import { Plus, Image as ImageIcon, Heart, Upload, Camera, Download } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'
import { getPhotos, addPhoto, toggleFavorite, deletePhoto, mockData } from '../services/api'

export function Gallery() {
  const toast = useToast()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [activePhoto, setActivePhoto] = useState(null)
  
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newCategory, setNewCategory] = useState('Nature')
  const [newCamera, setNewCamera] = useState('Unknown')
  const [newColors, setNewColors] = useState('#0f172a,#4f46e5,#38bdf8')

  // Helper to ensure colors is always a clean array of strings
  const safeColors = (colors) => {
    if (!colors) return []
    if (Array.isArray(colors)) return colors
    if (typeof colors === 'string') {
      try {
        const parsed = JSON.parse(colors)
        if (Array.isArray(parsed)) return parsed
      } catch {
        return colors.split(',').map((c) => c.trim()).filter(Boolean)
      }
    }
    return []
  }

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true)
      const data = await getPhotos()
      const rawList = Array.isArray(data) ? data : (mockData.gallery || [])
      const normalized = rawList.map((p) => ({
        ...p,
        colors: Array.isArray(p.colors) ? p.colors : safeColors(p.colors),
      }))
      setPhotos(normalized)
      setLoading(false)
    }
    fetchGallery()
  }, [])

  const categories = ['All', 'Favorites', ...new Set(photos.map((p) => p.category))]

  const handleFavoriteToggle = async (id, e) => {
    e?.stopPropagation()
    sound.toggle()
    const photo = photos.find(p => p.id === id)
    if (!photo) return
    const nextFav = !photo.isFavorite

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isFavorite: nextFav, likes: nextFav ? p.likes + 1 : p.likes - 1 }
          : p
      )
    )
    if (activePhoto?.id === id) {
      setActivePhoto((prev) => ({ ...prev, isFavorite: nextFav, likes: nextFav ? prev.likes + 1 : prev.likes - 1 }))
    }
    
    await toggleFavorite(id, nextFav)
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!newUrl.trim() || !newTitle.trim()) return

    sound.success()
    const colorArray = newColors.split(',').map(c => c.trim())
    const newEntry = {
      id: Date.now(),
      title: newTitle,
      url: newUrl,
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      likes: 1,
      camera: newCamera,
      shutter: 'Auto',
      colors: Array.isArray(colorArray) && colorArray.length > 0 ? colorArray : ['#0f172a', '#4f46e5', '#38bdf8', '#e2e8f0'],
      isFavorite: true,
    }

    setPhotos((prev) => [newEntry, ...prev])
    setNewTitle('')
    setNewUrl('')
    setIsUploadOpen(false)
    toast.success('Photo Added', 'New asset added to your Cloudflare R2 gallery.')
    
    await addPhoto(newEntry)
  }

  const filteredPhotos = photos.filter((photo) => {
    return selectedCategory === 'All'
      ? true
      : selectedCategory === 'Favorites'
      ? photo.isFavorite
      : photo.category === selectedCategory
  })

  return (
    <div className="space-y-8">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-2 rounded-3xl border border-white/10">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto relative px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.click()
                setSelectedCategory(cat)
              }}
              className={`relative rounded-2xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap transition-all cursor-pointer z-10 ${
                selectedCategory === cat ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {selectedCategory === cat && (
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10 shadow-lg shadow-indigo-600/30 transition-all duration-300 layout-id-indicator" />
              )}
              {cat === 'Favorites' ? '❤️ Favorites' : cat}
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <Button onClick={() => setIsUploadOpen(true)} icon={Upload} className="rounded-2xl shadow-lg w-full md:w-auto mr-2">
          Upload
        </Button>
      </div>

      {/* Dynamic Masonry Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 bg-white/5 backdrop-blur-xl">
          <ImageIcon className="mx-auto h-16 w-16 text-slate-400/50 mb-4" />
          <h3 className="text-lg font-medium text-slate-200">No photos in this category</h3>
          <p className="text-sm text-slate-400 mt-2">Upload a new shot to enrich your portfolio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
          {filteredPhotos.map((photo, idx) => {
            // Make every 4th item span 2 columns and 2 rows if not on mobile
            const isFeatured = idx % 4 === 0
            return (
              <div
                key={photo.id}
                onClick={() => {
                  sound.click()
                  setActivePhoto(photo)
                }}
                style={{ animationDelay: `${idx * 75}ms` }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl bg-slate-900/60 shadow-xl transition-all duration-500 cursor-pointer animate-in fade-in zoom-in-95 hover:shadow-2xl hover:shadow-indigo-500/20 ${
                  isFeatured ? 'md:col-span-2 md:row-span-2' : 'row-span-1'
                }`}
              >
                {/* Image */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />

                {/* Dark Gradient Overlay (shows on hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-[-10px] group-hover:translate-y-0">
                  <span className="rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 shadow-lg">
                    {photo.category}
                  </span>

                  <button
                    onClick={(e) => handleFavoriteToggle(photo.id, e)}
                    className={`rounded-full p-2.5 backdrop-blur-md transition-all duration-300 active:scale-75 shadow-lg ${
                      photo.isFavorite
                        ? 'bg-rose-500 text-white border-rose-400/50 scale-[1.15]'
                        : 'bg-black/40 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${photo.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Info Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[20px] group-hover:translate-y-0">
                  <h4 className="font-bold text-xl text-white tracking-wide truncate shadow-black drop-shadow-md">
                    {photo.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-white/80 font-medium">
                    <span className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5"/> {photo.camera.split('•')[0]}</span>
                  </div>
                  
                  {/* Swatches */}
                  <div className="flex items-center gap-2 mt-2">
                    {(Array.isArray(photo?.colors) ? photo.colors : []).map((c, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full border border-white/20 shadow-lg transition-transform hover:scale-150"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <button onClick={() => setActivePhoto(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row gap-6 bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Image Area */}
            <div className="flex-1 flex items-center justify-center bg-black/50 overflow-hidden relative group">
               <img src={activePhoto.url} alt={activePhoto.title} className="max-h-[85vh] max-w-full object-contain" />
            </div>
            
            {/* Sidebar Details */}
            <div className="w-full md:w-80 p-8 flex flex-col gap-6 bg-black/80 backdrop-blur-2xl border-l border-white/10 overflow-y-auto">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{activePhoto.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white">{activePhoto.category}</span>
                  <span>{new Date(activePhoto.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Camera & Lens</p>
                  <p className="text-sm text-white font-medium">{activePhoto.camera}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Settings</p>
                  <p className="text-sm text-white font-mono">{activePhoto.shutter}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Dominant Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {(Array.isArray(activePhoto?.colors) ? activePhoto.colors : []).map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform" onClick={() => navigator.clipboard.writeText(c)}>
                        <div className="h-8 w-8 rounded-full border border-white/20 shadow-md" style={{ backgroundColor: c }} />
                        <span className="text-[10px] text-slate-400 font-mono uppercase">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-6 flex items-center gap-3">
                <button
                  onClick={(e) => handleFavoriteToggle(activePhoto.id, e)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                    activePhoto.isFavorite ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${activePhoto.isFavorite ? 'fill-current' : ''}`} />
                  {activePhoto.likes} Likes
                </button>
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-xl bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Add to Portfolio">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input label="Image URL" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} required />
          {newUrl && <img src={newUrl} alt="preview" className="w-full h-32 object-cover rounded-xl border border-white/10 mt-2" onError={(e) => e.target.style.display = 'none'} />}
          
          <Input label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-400">Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="Nature">Nature</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Architecture">Architecture</option>
                <option value="AI Art">AI Art</option>
                <option value="Workspace">Workspace</option>
              </select>
            </div>
            <Input label="Camera Info" value={newCamera} onChange={(e) => setNewCamera(e.target.value)} placeholder="e.g. Sony A7" />
          </div>
          <Input label="Colors (comma separated hex)" value={newColors} onChange={(e) => setNewColors(e.target.value)} placeholder="#fff, #000" />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
            <Button type="submit">Add Photo</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
