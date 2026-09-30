import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Trash2, Cpu, Copy, Check, Download, ChevronDown, Code2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'
import { getChatMessages, sendChatMessage, clearChat, mockData } from '../services/api'

const MODELS = [
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Fast' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Smart' },
  { id: 'gpt-4o', name: 'GPT-4o Omni', badge: 'Flagship' }
]

export function Chat() {
  const toast = useToast()
  
  const [messages, setMessages] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const fetchChat = async () => {
      setLoadingHistory(true)
      const data = await getChatMessages()
      setMessages(data || mockData.chat)
      setLoadingHistory(false)
    }
    fetchChat()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleInput = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    sound.click()
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: 'Just now',
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setLoading(true)

    try {
      const response = await sendChatMessage({ message: input, model: selectedModel.id })
      const aiResponse = response || {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `Processed via ${selectedModel.name}. Reached edge endpoint successfully.`,
        timestamp: 'Just now'
      }
      setMessages((prev) => [...prev, aiResponse])
      sound.success()
    } catch {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Error communicating with Worker API.',
        timestamp: 'Just now'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    sound.click()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success('Copied', 'Text copied.')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleClear = async () => {
    sound.delete()
    setMessages([])
    toast.info('Chat Cleared', 'Conversation history reset.')
    await clearChat()
  }

  const handleExport = () => {
    sound.click()
    const formatted = messages.map((m) => {
      let line = '[' + m.role.toUpperCase() + '] (' + m.timestamp + '):\n' + m.content
      if (m.codeSnippet) line += '\n' + '`' + '\n' + m.codeSnippet + '\n' + '`' + '\n'
      return line
    }).join('\n---\n')
    const blob = new Blob([formatted], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat-export.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden relative">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5 backdrop-blur-md z-10">
        <div className="relative">
          <button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Cpu className="h-4 w-4 text-indigo-400" />
            {selectedModel.name}
            <Badge className="text-[10px] bg-indigo-500/20 text-indigo-300 border-none">{selectedModel.badge}</Badge>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </button>
          
          {modelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-white/10 bg-black/90 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 z-50">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m)
                    setModelDropdownOpen(false)
                  }}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-xl transition-colors ${selectedModel.id === m.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                >
                  <span className="text-sm font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={messages.length===0} className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-50"><Download className="h-4 w-4" /></button>
          <button onClick={handleClear} disabled={messages.length===0} className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-colors disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {loadingHistory ? (
          <div className="flex justify-center p-10"><div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in">
            <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-6 shadow-inner">
              <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Start a conversation</h3>
            <p className="text-sm text-slate-400 max-w-sm">I'm ready to answer questions, write code, or brainstorm ideas with you.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div key={msg.id} className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-4 ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg ${isUser ? 'bg-indigo-600 text-white' : 'bg-white/10 border border-white/20 text-indigo-300'}`}>
                  {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                
                <div className={`space-y-2 flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs font-semibold text-slate-400">{isUser ? 'You' : msg.model || 'Assistant'}</span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  
                  <div className={`rounded-3xl p-5 text-sm leading-relaxed shadow-xl backdrop-blur-xl ${isUser ? 'bg-indigo-600/20 border border-indigo-500/30 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.codeSnippet && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] text-slate-300 font-mono text-sm">
                        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2 text-xs">
                          <span className="flex items-center gap-2 text-indigo-400 font-sans font-medium"><Code2 className="h-4 w-4" /> Code</span>
                          <button onClick={() => handleCopy(msg.codeSnippet, msg.id)} className="flex items-center gap-1.5 hover:text-white transition-colors">
                            {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === msg.id ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto"><code className="text-indigo-200">{msg.codeSnippet}</code></pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {loading && (
          <div className="flex gap-4 mr-auto max-w-[85%] animate-in fade-in">
             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-indigo-300">
               <Bot className="h-5 w-5" />
             </div>
             <div className="rounded-3xl rounded-tl-sm bg-white/5 border border-white/10 p-5 flex items-center gap-2">
               <div className="flex gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 backdrop-blur-2xl border-t border-white/10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-3 bg-black/40 border border-white/10 rounded-3xl p-2 pl-4 focus-within:border-indigo-500/50 transition-colors shadow-inner">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your message..."
            className="flex-1 max-h-32 bg-transparent text-white placeholder-white/40 text-sm py-3 resize-none focus:outline-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 group"
          >
            <Send className={`h-5 w-5 ${loading ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'}`} />
          </button>
        </form>
      </div>
    </div>
  )
}
