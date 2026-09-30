import { useState, useRef } from 'react'
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  MessageSquare, 
  ListChecks, 
  Layers,
  ArrowRight,
  Maximize2
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const INITIAL_DOCS = [
  {
    id: 'doc-1',
    name: 'Cloudflare_Edge_Architecture_v3.pdf',
    size: '3.4 MB',
    pages: 18,
    uploadedAt: '2026-09-29',
    summary: 'Comprehensive blueprint for deploying serverless edge workers, distributed KV caching, and R2 object stores with sub-50ms latency across 310 global cities.',
    insights: [
      'Edge compute cold starts benchmarked under 5ms worldwide.',
      'Cryptographic token verification performed without origin trip.',
      'Zero egress bandwidth fees achieved with Cloudflare R2.',
    ],
    actions: [
      'Implement TLS 1.3 session resumption.',
      'Configure Geo-IP routing policies for European region.',
      'Set cache-control headers on static image assets.',
    ],
    sampleContent: `CLOUDFLARE WORKERS & EDGE COMPUTING ARCHITECTURE
Revision 3.2 — Enterprise Technical Report

1. EXECUTIVE OVERVIEW
The migration from traditional centralized monoliths to edge execution models reduces median time-to-first-byte (TTFB) by 78%. By executing compute logic inside V8 isolates rather than containerized VMs, execution initialization overhead drops to near zero.

2. GLOBAL RESILIENCY
Requests are routed automatically via Anycast BGP to the geographically nearest point of presence (PoP). State synchronization leverages Supabase PostgreSQL alongside distributed Key-Value stores for immutable assets.

3. SECURITY & ZERO TRUST
Every request is evaluated with JSON Web Signature verification at the edge prior to invoking downstream worker microservices.`,
  },
  {
    id: 'doc-2',
    name: 'Supabase_Auth_Security_Protocols.pdf',
    size: '1.2 MB',
    pages: 9,
    uploadedAt: '2026-09-26',
    summary: 'Security hardening guide detailing PostgreSQL Row Level Security (RLS) policies, passwordless OTP magic links, and short-lived JWT token lifecycle.',
    insights: [
      'Row Level Security guarantees multitenant isolation at the database layer.',
      'One-time passwords invalidate within 10 minutes or upon consumption.',
      'Zero database superuser credentials exposed to clients.',
    ],
    actions: [
      'Audit existing RLS policies against privilege escalation.',
      'Enforce multi-factor verification on sensitive data mutations.',
    ],
    sampleContent: `SUPABASE AUTHENTICATION & ROW LEVEL SECURITY GUIDELINES

1. ROW LEVEL SECURITY (RLS)
PostgreSQL RLS ensures that individual tenant rows cannot be accessed across tenant boundaries even if malicious SQL queries are submitted.

2. ONE TIME PASSWORD (OTP) WORKFLOWS
Magic link tokens are cryptographically generated with SHA-256 hashes and stored in ephemeral sessions.

3. ROTATION OF SECRETS
Service role keys must never be committed to public client repositories.`,
  },
]

export function PdfView() {
  const toast = useToast()
  const [documents, setDocuments] = useState(INITIAL_DOCS)
  const [selectedDoc, setSelectedDoc] = useState(INITIAL_DOCS[0])
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'insights' | 'actions' | 'qa'
  const [zoomLevel, setZoomLevel] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchDocQuery, setSearchDocQuery] = useState('')
  const [qaInput, setQaInput] = useState('')
  const [qaAnswers, setQaAnswers] = useState([
    {
      q: 'What is the primary latency reduction reported in this paper?',
      a: 'The document reports a 78% reduction in median time-to-first-byte (TTFB) through edge V8 isolates and Anycast BGP routing.',
    },
  ])
  const fileInputRef = useRef(null)

  const handleZoomIn = () => {
    sound.click()
    setZoomLevel((z) => Math.min(z + 15, 160))
  }

  const handleZoomOut = () => {
    sound.click()
    setZoomLevel((z) => Math.max(z - 15, 70))
  }

  const handlePageNext = () => {
    if (currentPage < selectedDoc.pages) {
      sound.click()
      setCurrentPage((p) => p + 1)
    }
  }

  const handlePagePrev = () => {
    if (currentPage > 1) {
      sound.click()
      setCurrentPage((p) => p - 1)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      sound.success()
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        pages: 8,
        uploadedAt: new Date().toISOString().split('T')[0],
        summary: `Imported document analysis for ${file.name}. Parsed 8 pages with AI OCR inspection. Key themes focus on modern architectural paradigms.`,
        insights: [
          'Document structure successfully validated with high confidence score.',
          'Identified 4 section headers and corresponding metric summaries.',
        ],
        actions: ['Review highlighted executive summary items.'],
        sampleContent: `IMPORTED DOCUMENT PREVIEW: ${file.name.toUpperCase()}\n\nContent parsed through local PDF reader simulator. All text sections extracted and indexed for interactive AI question-answering.`,
      }

      setDocuments((prev) => [newDoc, ...prev])
      setSelectedDoc(newDoc)
      setCurrentPage(1)
      toast.success('Document Analyzed', `${file.name} ready for review.`)
    }
  }

  const handleAskQuestion = (e) => {
    e.preventDefault()
    if (!qaInput.trim()) return

    sound.click()
    const question = qaInput
    setQaInput('')

    setTimeout(() => {
      sound.success()
      setQaAnswers((prev) => [
        ...prev,
        {
          q: question,
          a: `According to ${selectedDoc.name}: "${question}" is addressed in Section 2, emphasizing distributed edge caching, sub-5ms cold starts, and zero trust policies.`,
        },
      ])
      toast.info('Answer Generated', 'Grounded answer extracted from document.')
    }, 600)
  }

  return (
    <div className="space-y-6">
      {/* Header and Upload Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Document Intelligence & PDF Suite
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspect, summarize, query, and extract action items from enterprise technical PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            icon={Upload}
            size="sm"
            className="rounded-xl shadow-lg shadow-indigo-600/20"
          >
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Selection Column */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Document Vault ({documents.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    sound.click()
                    setSelectedDoc(doc)
                    setCurrentPage(1)
                  }}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-950/30 shadow-lg shadow-indigo-500/10'
                      : 'border-white/10 bg-slate-900/60 hover:border-white/20'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate">
                      {doc.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.pages} pages</span>
                      <span>•</span>
                      <span>{doc.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Document Reading View & AI Analysis */}
        <div className="lg:col-span-8 space-y-4">
          {selectedDoc && (
            <div className="glass-panel overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              {/* Document View Toolbar */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 py-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {selectedDoc.name}
                  </span>
                </div>

                {/* Page Controls & Zoom */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePagePrev}
                    disabled={currentPage <= 1}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-xs text-slate-300 px-1">
                    {currentPage} / {selectedDoc.pages}
                  </span>
                  <button
                    onClick={handlePageNext}
                    disabled={currentPage >= selectedDoc.pages}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                  <button
                    onClick={handleZoomOut}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="font-mono text-[11px] text-slate-400 w-10 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* PDF Document Canvas View */}
              <div className="relative min-h-[280px] max-h-[360px] overflow-y-auto bg-slate-950 p-6 font-mono text-xs leading-relaxed text-slate-300 border-b border-white/10">
                <div
                  className="mx-auto rounded-xl bg-slate-900/90 p-6 border border-white/5 shadow-2xl transition-all max-w-xl"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2">
                    Page {currentPage} of {selectedDoc.pages}
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed">
                    {selectedDoc.sampleContent}
                  </pre>
                </div>
              </div>

              {/* AI Intelligence Workspace Tabs */}
              <div className="p-4 bg-slate-900/50">
                <div className="flex items-center gap-1 border-b border-white/10 pb-3">
                  {[
                    { id: 'summary', label: 'Executive Summary', icon: Sparkles },
                    { id: 'insights', label: 'Key Insights', icon: Layers },
                    { id: 'actions', label: 'Action Items', icon: ListChecks },
                    { id: 'qa', label: 'Q&A Chat', icon: MessageSquare },
                  ].map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          sound.click()
                          setActiveTab(tab.id)
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content Panes */}
                <div className="pt-4">
                  {activeTab === 'summary' && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedDoc.summary}
                      </p>
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="space-y-2">
                      {selectedDoc.insights?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs text-slate-200"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="space-y-2">
                      {selectedDoc.actions?.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950/40 p-3 text-xs text-slate-200"
                        >
                          <span>{act}</span>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              sound.success()
                              toast.success('Appended to Todos', `"${act}" saved to task tracker.`)
                            }}
                          >
                            + Add to Tasks
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'qa' && (
                    <div className="space-y-3">
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {qaAnswers.map((ans, idx) => (
                          <div key={idx} className="rounded-xl border border-white/5 bg-slate-950/60 p-3 text-xs space-y-1">
                            <div className="font-semibold text-indigo-300">Q: {ans.q}</div>
                            <div className="text-slate-300">A: {ans.a}</div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAskQuestion} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ask a question about this document..."
                          value={qaInput}
                          onChange={(e) => setQaInput(e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <Button type="submit" size="sm" icon={ArrowRight}>
                          Ask
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
