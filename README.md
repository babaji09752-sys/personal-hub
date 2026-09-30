# Personal App Project

A modern, modular React 19 workspace powered by **Vite**, **Tailwind CSS v4**, **Supabase Auth**, and **Cloudflare Worker APIs**.

---

## 📁 Project Structure

```text
src/
├── assets/          # Icons, logos, static images (logo.svg, etc.)
├── components/      # Reusable UI elements (Buttons, Inputs, Cards)
│   ├── ui/          # Atomic components (Tailwind-styled primitives: Button, Input, Card, Modal, Badge)
│   ├── layout/      # Navbar, Sidebar, AppShell
│   └── auth/        # LoginCard, OTPModal
├── pages/           # Main views (Chat, Gallery, Diary, Todos, PDF, PPT)
├── services/        # Clean API wrappers (Supabase client, Worker API calls)
│   ├── supabase.js  # Supabase Auth client initialization
│   └── api.js       # Cloudflare Worker fetch helpers
├── context/         # React Context for global state (AuthContext, ViewContext)
├── App.jsx          # Router & layout switcher
└── main.jsx         # App entry point
```

---

## ⚡ Tech Stack & Libraries

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with modern `@tailwindcss/vite`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Authentication**: [Supabase JS](https://supabase.com/) (Passwordless OTP / Magic link & instant Guest mode)
- **Edge Backend**: [Cloudflare Workers](https://workers.cloudflare.com/) fetch wrappers with offline simulation fallbacks

---

## 🚀 Getting Started

### 1. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_WORKER_API_URL=https://your-worker.your-subdomain.workers.dev
```
> *Note: If no Supabase credentials are provided, the app automatically enables demo mode (allowing OTP verification code `123456` or one-click "Continue as Guest").*

### 2. Run the Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```
