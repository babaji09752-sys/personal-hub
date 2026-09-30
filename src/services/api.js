export async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch {
    return null; // caller handles fallback
  }
}

// ---- Todos ----
export const getTodos = () => fetchAPI('/api/todos');
export const createTodo = (data) => fetchAPI('/api/todos', { method: 'POST', body: JSON.stringify(data) });
export const updateTodo = (id, data) => fetchAPI(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteTodo = (id) => fetchAPI(`/api/todos/${id}`, { method: 'DELETE' });

export const getSubtasks = (todoId) => fetchAPI(`/api/subtasks?todoId=${todoId}`);
export const createSubtask = (data) => fetchAPI('/api/subtasks', { method: 'POST', body: JSON.stringify(data) });
export const toggleSubtask = (id, completed) => fetchAPI(`/api/subtasks/${id}`, { method: 'PUT', body: JSON.stringify({ completed }) });
export const deleteSubtask = (id) => fetchAPI(`/api/subtasks/${id}`, { method: 'DELETE' });

// ---- Diary ----
export const getDiaryEntries = () => fetchAPI('/api/diary');
export const createDiaryEntry = (data) => fetchAPI('/api/diary', { method: 'POST', body: JSON.stringify(data) });
export const updateDiaryEntry = (id, data) => fetchAPI(`/api/diary/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDiaryEntry = (id) => fetchAPI(`/api/diary/${id}`, { method: 'DELETE' });

// ---- Gallery ----
export const getPhotos = () => fetchAPI('/api/gallery');
export const addPhoto = (data) => fetchAPI('/api/gallery', { method: 'POST', body: JSON.stringify(data) });
export const toggleFavorite = (id, isFavorite) => fetchAPI(`/api/gallery/${id}`, { method: 'PUT', body: JSON.stringify({ isFavorite }) });
export const deletePhoto = (id) => fetchAPI(`/api/gallery/${id}`, { method: 'DELETE' });

// ---- Chat ----
export const getChatMessages = () => fetchAPI('/api/chat');
export const sendChatMessage = (data) => fetchAPI('/api/chat', { method: 'POST', body: JSON.stringify(data) });
export const clearChat = () => fetchAPI('/api/chat', { method: 'DELETE' });

// ---- Health ----
export const getHealth = () => fetchAPI('/api/health');

// ---- Google Official Auth Verification ----
export const verifyGoogleCredential = async (credential) => {
  return await fetchAPI('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
};

export const mockData = {
  todos: [
    {
      id: 1,
      title: 'Deploy Cloudflare Worker auth proxy with CORS handling',
      category: 'Dev',
      priority: 'high',
      dueDate: '2026-10-01',
      completed: true,
      subtasks: [
        { id: 101, title: 'Verify TLS certificate', completed: true },
        { id: 102, title: 'Benchmark edge response times', completed: true },
      ],
    },
    {
      id: 2,
      title: 'Configure Supabase Row Level Security (RLS) policies',
      category: 'Security',
      priority: 'high',
      dueDate: '2026-10-02',
      completed: false,
      subtasks: [
        { id: 201, title: 'Create user isolate policies on profiles', completed: true },
        { id: 202, title: 'Add test suite for token revocation', completed: false },
      ],
    }
  ],
  diary: [
    {
      id: 1,
      title: 'Architecting the Cloudflare Edge Personal Hub',
      date: '2026-09-30',
      mood: '🚀 Productive',
      weather: '🌙 Starry Night',
      content: 'Today I finalized the decoupled fullstack setup.\n\nThe edge worker handles all routing logic with ultra-low latency, and Supabase manages user identities with zero friction.\n\nDesigning with glassmorphism and tactile audio feedback feels so satisfying. Key takeaway: Never sacrifice responsiveness for aesthetic flair—balance both seamlessly.',
      tags: ['engineering', 'design', 'milestone'],
      isPinned: true,
    }
  ],
  gallery: [
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
    }
  ],
  chat: [
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Welcome! I'm your edge-powered AI copilot. I can help architect systems, draft presentations, analyze documents, and query your personal knowledge vault.`,
      codeSnippet: `// Example Cloudflare Worker routing\nexport default {\n  async fetch(req, env) {\n    const url = new URL(req.url);\n    return new Response(JSON.stringify({ status: "ok", edge: "global" }), {\n      headers: { "content-type": "application/json" }\n    });\n  }\n};`,
      timestamp: 'Just now',
      model: 'Gemini 1.5 Flash',
    }
  ]
};
