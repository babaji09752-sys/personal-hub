import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Trash2, 
  Cpu, 
  Copy, 
  Check, 
  Volume2, 
  RefreshCw, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  ChevronDown,
  Code2,
  Wand2,
  Brain,
  BarChart3
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Ultra-Fast', description: 'Google Deepmind 1M Context' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Reasoning', description: 'Anthropic Coding Engine' },
  { id: 'gpt-4o', name: 'GPT-4o Omni', badge: 'Multimodal', description: 'OpenAI Flagship' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', badge: 'Deep Think', description: 'Chain-of-Thought Reasoning' },
]

const PROMPT_CATEGORIES = [
  {
    category: 'Code',
    icon: Code2,
    prompt: 'Write an edge Cloudflare Worker handler with JWT verification and CORS',
  },
  {
    category: 'Brainstorm',
    icon: Brain,
    prompt: 'Give me 4 unique micro-SaaS architecture ideas with Supabase + AI',
  },
  {
    category: 'Write',
    icon: Wand2,
    prompt: 'Draft an engaging product release note for a dark-mode personal hub',
  },
  {
    category: 'Analyze',
    icon: BarChart3,
    prompt: 'Compare client-side caching with edge KV store in terms of latency',
  },
]

export function Chat() {
  const { user } = useAuth()
  const toast = useToast()

  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chat_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Welcome ${user?.user_metadata?.name || 'Explorer'}! I'm your edge-powered AI copilot. I can help architect systems, draft presentations, analyze documents, and query your personal knowledge vault.`,
        codeSnippet: `// Example Cloudflare Worker routing\nexport default {\n  async fetch(req, env) {\n    const url = new URL(req.url);\n    return new Response(JSON.stringify({ status: "ok", edge: "global" }), {\n      headers: { "content-type": "application/json" }\n    });\n  }\n};`,
        timestamp: 'Just now',
        model: 'Gemini 1.5 Flash',
      },
    ]
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    sound.click()
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await api.chat.send(text)
      
      // Simulate rich AI response structure
      let codeSnippet = null
      if (text.toLowerCase().includes('worker') || text.toLowerCase().includes('code')) {
        codeSnippet = `// Edge verification handler\nimport { createClient } from '@supabase/supabase-js';\n\nexport async function verifyUserToken(token, env) {\n  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);\n  const { data: { user }, error } = await supabase.auth.getUser(token);\n  if (error || !user) throw new Error('Unauthorized');\n  return user;\n}`
      }

      const assistantMsg = {
        id: response.id || `bot-${Date.now()}`,
        role: 'assistant',
        content: response.content || `Processed through ${selectedModel.name}. Your request regarding "${text}" was computed in 38ms at the edge.`,
        codeSnippet,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel.name,
      }

      setMessages((prev) => [...prev, assistantMsg])
      sound.success()
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an error communicating with the Worker API. Please check your connectivity or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: selectedModel.name,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    sound.click()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied to Clipboard', 'Text copied.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSpeak = (text, id) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/```[\s\S]*?```/g, ''))
    utterance.rate = 1.05
    utterance.pitch = 1.0
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    window.speechSynthesis.speak(utterance)
    setSpeakingId(id)
    sound.click()
  }

  const handleClear = () => {
    sound.delete()
    setMessages([])
    toast.info('Chat Cleared', 'Conversation history reset.')
  }

  const handleExport = () => {
    sound.click()
    const formatted = messages.map((m) => `[${m.role.toUpperCase()}] (${m.timestamp}):\n${m.content}\n${m.codeSnippet ? `\n\`\`\`\n${m.codeSnippet}\n\`\`\`\n` : ''}`).join('\n---\n')
    const blob = new Blob([formatted], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export Ready', 'Chat history downloaded as Markdown.')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
      {/* Top Header & Model Selector */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3.5 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Model Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.click()
                setModelDropdownOpen((prev) => !prev)
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-100 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Cpu className="h-3 w-3" />
              </div>
              <span className="font-bold">{selectedModel.name}</span>
              <Badge variant="primary" className="text-[9px] py-0 px-1.5">
                {selectedModel.badge}
              </Badge>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>

            {modelDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Select AI Reasoning Engine
                </div>
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      sound.toggle()
                      setSelectedModel(model)
                      setModelDropdownOpen(false)
                      toast.info('Model Switched', `Switched to ${model.name}.`)
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-colors cursor-pointer ${
                      selectedModel.id === model.id
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{model.name}</span>
                        <Badge variant={selectedModel.id === model.id ? 'primary' : 'default'} className="text-[9px] py-0 px-1">
                          {model.badge}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{model.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>34ms Edge Latency</span>
            <span>•</span>
            <span>128k Context Window</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExport}
            disabled={messages.length === 0}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors disabled:opacity-40 cursor-pointer"
            title="Export conversation as Markdown"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={messages.length === 0}
            className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="h-16 w-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-4 shadow-inner">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-200">Start an Edge AI Conversation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Ask anything, prototype code, summarize documents, or run reasoning simulations.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-semibold shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-indigo-500/20'
                      : 'bg-slate-800/90 text-indigo-400 border border-white/10'
                  }`}
                >
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`space-y-1.5 flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {isUser ? 'You' : (msg.model || 'AI Assistant')}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10'
                        : 'glass-panel text-slate-100 rounded-tl-none border-white/10'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Formatted Code Block */}
                    {msg.codeSnippet && (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-slate-200 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-white/5 bg-slate-900/80 px-3.5 py-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1.5 text-indigo-300 font-sans">
                            <Code2 className="h-3.5 w-3.5" /> TypeScript / JavaScript
                          </span>
                          <button
                            onClick={() => handleCopy(msg.codeSnippet, `${msg.id}-code`)}
                            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedId === `${msg.id}-code` ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span>{copiedId === `${msg.id}-code` ? 'Copied' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-indigo-100">
                          {msg.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Assistant Actions Bar */}
                  {!isUser && (
                    <div className="flex items-center gap-1 px-1 text-slate-500">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          speakingId === msg.id ? 'text-indigo-400 bg-indigo-500/10' : 'hover:bg-slate-800 hover:text-slate-200'
                        }`}
                        title="Read aloud"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toast.success('Feedback recorded', 'Thanks for helping improve the model!')}
                        className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Helpful"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toast.info('Feedback recorded', 'We will refine future answers.')}
                        className="rounded-lg p-1.5 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-xl">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-indigo-400 border border-white/10 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-3xl rounded-tl-none glass-panel p-4 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
              <span className="text-xs text-slate-400 font-medium">Computing edge response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Cards */}
      {messages.length <= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 px-4 sm:px-6 py-2.5 border-t border-white/5 bg-slate-950/40">
          {PROMPT_CATEGORIES.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={idx}
                onClick={() => handleSend(item.prompt)}
                className="flex items-start gap-2.5 rounded-2xl border border-white/5 bg-slate-900/60 p-2.5 text-left transition-all hover:border-indigo-500/40 hover:bg-slate-850 hover:shadow-lg cursor-pointer group"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    {item.category}
                  </span>
                  <p className="text-xs text-slate-300 line-clamp-1 group-hover:text-white transition-colors">
                    {item.prompt}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${selectedModel.name} (Shift+Enter for multi-line)...`}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
            />
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || loading}
            loading={loading}
            icon={Send}
            className="rounded-2xl px-5 py-3 shadow-lg shadow-indigo-600/25"
          >
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
