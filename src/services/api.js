/**
 * Cloudflare Worker API Client and Service Wrappers
 */

const WORKER_API_URL = import.meta.env.VITE_WORKER_API_URL || 'https://worker-api.local'

/**
 * Base fetch wrapper with error handling and authorization header
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const url = `${WORKER_API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.message || `Request failed with status ${res.status}`)
    }

    return await res.json()
  } catch (error) {
    // If worker is not deployed or network error, fallback to simulated data
    console.warn(`[Worker API] Fallback for ${endpoint}:`, error.message)
    return handleSimulatedResponse(endpoint, options)
  }
}

/**
 * Fallback mock response generator for offline or pre-deployment preview
 */
function handleSimulatedResponse(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase()

  if (endpoint.includes('/chat')) {
    if (method === 'POST') {
      const body = JSON.parse(options.body || '{}')
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `I received your message: "${body.message}". (Served via Cloudflare Worker simulation).`,
        timestamp: new Date().toISOString(),
      }
    }
  }

  if (endpoint.includes('/todos')) {
    return [
      { id: 1, title: 'Configure Supabase project', completed: true, priority: 'high', category: 'Dev' },
      { id: 2, title: 'Deploy Cloudflare Worker endpoint', completed: false, priority: 'high', category: 'Dev' },
      { id: 3, title: 'Sync diary entries with vector search', completed: false, priority: 'medium', category: 'Feature' },
      { id: 4, title: 'Prepare quarterly presentation slides', completed: false, priority: 'low', category: 'Docs' },
    ]
  }

  if (endpoint.includes('/diary')) {
    return [
      {
        id: 1,
        title: 'Project Kickoff & Architecture',
        date: '2026-09-29',
        mood: '🚀 Productive',
        content: 'Scaffolded the modern clean React + Vite + Tailwind frontend architecture.',
        tags: ['architecture', 'react', 'tailwind'],
      },
      {
        id: 2,
        title: 'Exploring Cloudflare Workers & Supabase',
        date: '2026-09-28',
        mood: '💡 Inspired',
        content: 'Integrated edge worker functions for fast low-latency proxying and token auth.',
        tags: ['edge', 'supabase'],
      },
    ]
  }

  if (endpoint.includes('/gallery')) {
    return [
      {
        id: 1,
        title: 'Cyberpunk Skyline',
        url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
        category: 'Urban',
        date: '2026-09-20',
      },
      {
        id: 2,
        title: 'Northern Lights Reflections',
        url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80',
        category: 'Nature',
        date: '2026-09-22',
      },
      {
        id: 3,
        title: 'Minimalist Workspace',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
        category: 'Work',
        date: '2026-09-25',
      },
    ]
  }

  if (endpoint.includes('/pdf')) {
    return {
      status: 'ready',
      documents: [
        { id: 'doc-1', name: 'Cloud_Architecture_Whitepaper.pdf', size: '2.4 MB', pages: 14, updatedAt: '2026-09-28' },
        { id: 'doc-2', name: 'API_Specifications_v2.pdf', size: '1.1 MB', pages: 8, updatedAt: '2026-09-29' },
      ],
    }
  }

  if (endpoint.includes('/ppt')) {
    return {
      presentations: [
        { id: 'ppt-1', title: 'Product Launch Q4', slidesCount: 12, theme: 'Modern Dark', lastModified: '2026-09-29' },
        { id: 'ppt-2', title: 'Edge Computing Overview', slidesCount: 8, theme: 'Sapphire Glow', lastModified: '2026-09-27' },
      ],
    }
  }

  return { success: true }
}

export const api = {
  // Chat endpoints
  chat: {
    send: (message, conversationId = 'default') =>
      request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
      }),
  },

  // Todos endpoints
  todos: {
    list: () => request('/todos'),
    create: (todo) => request('/todos', { method: 'POST', body: JSON.stringify(todo) }),
    toggle: (id) => request(`/todos/${id}/toggle`, { method: 'PATCH' }),
    delete: (id) => request(`/todos/${id}`, { method: 'DELETE' }),
  },

  // Diary endpoints
  diary: {
    list: () => request('/diary'),
    create: (entry) => request('/diary', { method: 'POST', body: JSON.stringify(entry) }),
    delete: (id) => request(`/diary/${id}`, { method: 'DELETE' }),
  },

  // Gallery endpoints
  gallery: {
    list: () => request('/gallery'),
    upload: (formData) => request('/gallery/upload', { method: 'POST', body: formData }),
  },

  // PDF tools endpoints
  pdf: {
    list: () => request('/pdf/documents'),
    analyze: (docId) => request(`/pdf/${docId}/analyze`, { method: 'POST' }),
  },

  // Presentation endpoints
  ppt: {
    list: () => request('/ppt/decks'),
    generate: (prompt) => request('/ppt/generate', { method: 'POST', body: JSON.stringify({ prompt }) }),
  },
}
