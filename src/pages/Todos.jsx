import { useState, useEffect } from 'react'
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  CheckSquare, 
  Calendar, 
  Flag, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ListTodo,
  Layers,
  Clock
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'

const INITIAL_TODOS = [
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
  },
  {
    id: 3,
    title: 'Polish dark glassmorphism design system & command palette',
    category: 'Design',
    priority: 'medium',
    dueDate: '2026-10-03',
    completed: false,
    subtasks: [
      { id: 301, title: 'Test keyboard shortcuts (⌘K / Ctrl+K)', completed: true },
      { id: 302, title: 'Add synthetic audio tactile clicks', completed: true },
    ],
  },
  {
    id: 4,
    title: 'Prepare Q4 Product Architecture slide deck in Studio',
    category: 'Strategy',
    priority: 'low',
    dueDate: '2026-10-05',
    completed: false,
    subtasks: [],
  },
]

export function Todos() {
  const toast = useToast()
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('app_todos')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_TODOS
  })

  const [activeTab, setActiveTab] = useState('all') // 'all' | 'active' | 'completed'
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  // New task form state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Dev')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  useEffect(() => {
    localStorage.setItem('app_todos', JSON.stringify(todos))
  }, [todos])

  const categories = ['All', ...new Set(todos.map((t) => t.category))]

  const handleToggle = (id) => {
    sound.toggle()
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed
          if (nextCompleted) {
            sound.success()
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#6366f1', '#10b981', '#38bdf8', '#ec4899'],
            })
            toast.success('Task Completed! 🎉', `"${t.title.slice(0, 30)}..." marked done.`)
          }
          return {
            ...t,
            completed: nextCompleted,
            subtasks: t.subtasks?.map((st) => ({ ...st, completed: nextCompleted })) || [],
          }
        }
        return t
      })
    )
  }

  const handleToggleSubtask = (todoId, subtaskId, e) => {
    e?.stopPropagation()
    sound.toggle()
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
          const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((st) => st.completed)
          return { ...t, subtasks: updatedSubtasks, completed: allDone }
        }
        return t
      })
    )
  }

  const handleAddSubtask = (todoId) => {
    if (!newSubtaskTitle.trim()) return
    sound.click()
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === todoId) {
          const subtasks = t.subtasks || []
          return {
            ...t,
            subtasks: [
              ...subtasks,
              { id: Date.now(), title: newSubtaskTitle.trim(), completed: false },
            ],
          }
        }
        return t
      })
    )
    setNewSubtaskTitle('')
    toast.info('Subtask Added', 'Checklist item appended.')
  }

  const handleDelete = (id, e) => {
    e?.stopPropagation()
    sound.delete()
    setTodos((prev) => prev.filter((t) => t.id !== id))
    toast.info('Task Deleted', 'Task removed from your tracker.')
  }

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    sound.click()
    const newTodo = {
      id: Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      dueDate: newDueDate || new Date().toISOString().split('T')[0],
      completed: false,
      subtasks: [],
    }

    setTodos((prev) => [newTodo, ...prev])
    setNewTitle('')
    toast.success('Task Created', 'Added to your active sprint.')
  }

  const completedCount = todos.filter((t) => t.completed).length
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  const filteredTodos = todos.filter((t) => {
    const matchesTab =
      activeTab === 'all' ? true : activeTab === 'completed' ? t.completed : !t.completed
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory
    return matchesTab && matchesCat
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Metric & Progress Dashboard Card */}
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Sprint Velocity & Progress
            </span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {completedCount} of {todos.length} Tasks Finished
            </h3>
            <p className="text-xs text-slate-400">
              {progressPercent === 100
                ? 'All tasks completed! Stellar performance.'
                : `${todos.length - completedCount} open deliverables remaining.`}
            </p>
          </div>

          {/* Radial progress representation */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-slate-800"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  className="stroke-indigo-500 transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (94.2 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold text-white">
                {progressPercent}%
              </span>
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-slate-900/80 p-1 border border-white/10">
              {['all', 'active', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    sound.click()
                    setActiveTab(tab)
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Input Card */}
      <div className="glass-card rounded-2xl p-4">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Add new objective or task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            required
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Dev">Dev</option>
              <option value="Security">Security</option>
              <option value="Design">Design</option>
              <option value="Strategy">Strategy</option>
              <option value="Personal">Personal</option>
            </select>

            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="high">Urgent</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <Button type="submit" icon={Plus} size="sm" className="rounded-xl shadow-md">
              Create
            </Button>
          </div>
        </form>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              sound.click()
              setSelectedCategory(cat)
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-800 text-white border border-white/20'
                : 'bg-slate-900/60 text-slate-500 hover:text-slate-300 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Todo Items List */}
      {filteredTodos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 glass-card">
          <ListTodo className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-medium text-slate-300">No active tasks in this view</h3>
          <p className="text-xs text-slate-500 mt-1">Add a new item to keep moving forward.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => {
            const isExpanded = expandedId === todo.id
            const subtaskCount = todo.subtasks?.length || 0
            const doneSubtasks = todo.subtasks?.filter((st) => st.completed).length || 0

            return (
              <div
                key={todo.id}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  todo.completed
                    ? 'border-white/5 bg-slate-950/40 opacity-70'
                    : 'border-white/10 bg-slate-900/70 hover:border-indigo-500/40 hover:shadow-lg'
                }`}
              >
                {/* Main Todo Row */}
                <div
                  onClick={() => handleToggle(todo.id)}
                  className="flex items-center justify-between p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-500" />
                      )}
                    </button>

                    <div className="truncate">
                      <span
                        className={`text-sm transition-all ${
                          todo.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-100 font-semibold'
                        }`}
                      >
                        {todo.title}
                      </span>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {todo.dueDate}
                        </span>
                        {subtaskCount > 0 && (
                          <span>
                            • {doneSubtasks}/{subtaskCount} Subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        todo.priority === 'high'
                          ? 'danger'
                          : todo.priority === 'medium'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[10px] capitalize"
                    >
                      {todo.priority}
                    </Badge>

                    <Badge variant="primary" className="text-[10px]">
                      {todo.category}
                    </Badge>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.click()
                        setExpandedId(isExpanded ? null : todo.id)
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                      title="Expand subtasks"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(todo.id, e)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Accordion Drawer */}
                {isExpanded && (
                  <div className="border-t border-white/5 bg-slate-950/70 p-4 space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Checklist & Sub-Deliverables
                    </div>

                    <div className="space-y-2">
                      {todo.subtasks?.map((st) => (
                        <div
                          key={st.id}
                          onClick={(e) => handleToggleSubtask(todo.id, st.id, e)}
                          className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer pl-2 py-1"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => {}}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <span className={st.completed ? 'line-through text-slate-500' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Add Subtask Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add subtask item..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSubtask(todo.id)
                          }
                        }}
                        className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddSubtask(todo.id)}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
