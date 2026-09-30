-- =============================================
-- Personal Hub — Cloudflare D1 Database Schema
-- Edge SQLite for todos, diary, gallery, chat
-- =============================================

-- Todos / Task Tracker
CREATE TABLE IF NOT EXISTS todos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'Dev',
  priority   TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date   TEXT,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Todo Subtasks / Checklist Items
CREATE TABLE IF NOT EXISTS subtasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  todo_id    INTEGER NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  completed  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Diary / Journal Entries
CREATE TABLE IF NOT EXISTS diary_entries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  mood       TEXT NOT NULL DEFAULT '🚀 Productive',
  weather    TEXT DEFAULT '☀️ Clear Sky',
  date       TEXT NOT NULL DEFAULT (date('now')),
  tags       TEXT DEFAULT '[]',
  is_pinned  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Gallery / Photo Assets
CREATE TABLE IF NOT EXISTS gallery_photos (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'Nature',
  camera     TEXT DEFAULT 'Unknown Camera',
  shutter    TEXT DEFAULT '',
  colors     TEXT DEFAULT '[]',
  is_favorite INTEGER NOT NULL DEFAULT 0,
  likes      INTEGER NOT NULL DEFAULT 0,
  date       TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Chat Conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  model      TEXT DEFAULT 'Gemini 1.5 Flash',
  code_snippet TEXT,
  timestamp  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- PDF Documents Metadata
CREATE TABLE IF NOT EXISTS pdf_documents (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  size       TEXT NOT NULL DEFAULT '0 KB',
  pages      INTEGER NOT NULL DEFAULT 1,
  summary    TEXT,
  insights   TEXT DEFAULT '[]',
  actions    TEXT DEFAULT '[]',
  content    TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Presentation Decks
CREATE TABLE IF NOT EXISTS presentations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT NOT NULL,
  theme      TEXT NOT NULL DEFAULT 'Cyber Indigo',
  slides     TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- Seed Data for Initial Demo Experience
-- =============================================

INSERT INTO todos (title, category, priority, due_date, completed) VALUES
  ('Deploy Cloudflare Worker auth proxy with CORS handling', 'Dev', 'high', '2026-10-01', 1),
  ('Configure Supabase Row Level Security (RLS) policies', 'Security', 'high', '2026-10-02', 0),
  ('Polish dark glassmorphism design system & command palette', 'Design', 'medium', '2026-10-03', 0),
  ('Prepare Q4 Product Architecture slide deck in Studio', 'Strategy', 'low', '2026-10-05', 0);

INSERT INTO subtasks (todo_id, title, completed) VALUES
  (1, 'Verify TLS certificate', 1),
  (1, 'Benchmark edge response times', 1),
  (2, 'Create user isolate policies on profiles', 1),
  (2, 'Add test suite for token revocation', 0),
  (3, 'Test keyboard shortcuts (⌘K / Ctrl+K)', 1),
  (3, 'Add synthetic audio tactile clicks', 1);

INSERT INTO diary_entries (title, content, mood, weather, date, tags, is_pinned) VALUES
  ('Architecting the Cloudflare Edge Personal Hub',
   'Today I finalized the decoupled fullstack setup.

The edge worker handles all routing logic with ultra-low latency, and Supabase manages user identities with zero friction.

Designing with glassmorphism and tactile audio feedback feels so satisfying. Key takeaway: Never sacrifice responsiveness for aesthetic flair—balance both seamlessly.',
   '🚀 Productive', '🌙 Starry Night', '2026-09-30', '["engineering","design","milestone"]', 1),

  ('Reflections on Clean UI & Focused Workflows',
   'Simplicity is about eliminating the non-essential so the essential may speak.

Building out the command palette with ⌘K feels like having superpowers. Navigating between chat, gallery, and notes without taking hands off the keyboard elevates productivity exponentially.',
   '💡 Inspired', '☀️ Clear Sky', '2026-09-28', '["philosophy","productivity"]', 0);

INSERT INTO gallery_photos (title, url, category, camera, shutter, colors, is_favorite, likes, date) VALUES
  ('Neon Tokyo Alleyway',
   'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
   'Cyberpunk', 'Sony A7R V • 35mm f/1.4', '1/250s • ISO 400',
   '["#0f172a","#6366f1","#ec4899","#38bdf8"]', 1, 42, '2026-09-28'),
  ('Alpine Mirror Lake',
   'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
   'Nature', 'Fujifilm GFX 100S', '1/500s • ISO 100',
   '["#064e3b","#10b981","#38bdf8","#0284c7"]', 0, 89, '2026-09-25'),
  ('Orbital Aurora Borealis',
   'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
   'Nature', 'Nikon Z9 • 14-24mm f/2.8', '2.5s • ISO 1600',
   '["#065f46","#34d399","#0284c7","#0f172a"]', 1, 124, '2026-09-18');
