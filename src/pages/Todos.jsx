import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, Circle, Trash2, Calendar, ChevronDown, ChevronUp, Rocket } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { useToast } from '../context/ToastContext'
import { sound } from '../services/sound'
import { getTodos, createTodo, updateTodo, deleteTodo, mockData } from '../services/api'

export function Todos() {
  const toast = useToast()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [activeTab, setActiveTab] = useState('all') 
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Dev')
  const [newPriority, setNewPriority] = useState('medium')
  const [newDueDate, setNewDueDate] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      const data = await getTodos()
      if (data) {
        setTodos(data)
      } else {
        setTodos(mockData.todos)
      }
      setLoading(false)
    }
    fetchTasks()
  }, [])

  const categories = ['All', ...new Set(todos.map((t) => t.category))]

  const handleToggle = async (id) => {
    sound.toggle()
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const nextCompleted = !todo.completed
    
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
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

    await updateTodo(id, { completed: nextCompleted })
  }

  const handleToggleSubtask = async (todoId, subtaskId, e) => {
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
  }

  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    sound.delete()
    setTodos((prev) => prev.filter((t) => t.id !== id))
    toast.info('Task Deleted', 'Task removed from your tracker.')
    await deleteTodo(id)
  }

  const handleAdd = async (e) => {
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
    setIsModalOpen(false)
    toast.success('Task Created', 'Added to your active sprint.')
    
    await createTodo(newTodo)
  }

  const completedCount = todos.filter((t) => t.completed).length
  const progressPercent = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  const filteredTodos = todos.filter((t) => {
    const matchesTab =
      activeTab === 'all' ? true : activeTab === 'completed' ? t.completed : !t.completed
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory
    return matchesTab && matchesCat
  })
  
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return dateStr;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Metric & Progress Dashboard Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Sprint Velocity & Progress
            </span>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {completedCount} of {todos.length} Tasks Finished
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" className="stroke-white/10" strokeWidth="3.5" fill="none" />
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
          </div>
        </div>
        
        {/* Status Tabs */}
        <div className="mt-6 flex items-center gap-2">
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.click()
                setActiveTab(tab)
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <Button onClick={() => setIsModalOpen(true)} icon={Plus} size="sm" className="rounded-xl shadow-md">
            New Task
          </Button>
        </div>
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
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-white/5 text-slate-400 hover:text-slate-300 border border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Todo Items List */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center text-slate-500 bg-white/5 backdrop-blur-xl">
          <Rocket className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-medium text-slate-200">You're all caught up!</h3>
          <p className="text-xs text-slate-500 mt-1">Ready for a new adventure?</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo, idx) => {
            const isExpanded = expandedId === todo.id
            const subtaskCount = todo.subtasks?.length || 0
            const doneSubtasks = todo.subtasks?.filter((st) => st.completed).length || 0

            return (
              <div
                key={todo.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className={`animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl ${
                  todo.completed
                    ? 'border-white/5 bg-white/5 opacity-60'
                    : 'border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {/* Main Todo Row */}
                <div
                  onClick={() => handleToggle(todo.id)}
                  className="flex items-center justify-between p-5 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-indigo-400 transition-colors shrink-0 group-hover:scale-110"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-500 group-hover:text-indigo-400" />
                      )}
                    </button>

                    <div className="truncate">
                      <span
                        className={`text-base transition-all ${
                          todo.completed
                            ? 'text-slate-500 line-through'
                            : 'text-slate-100 font-semibold'
                        }`}
                      >
                        {todo.title}
                      </span>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {getRelativeTime(todo.dueDate)}
                        </span>
                        {subtaskCount > 0 && (
                          <span className="font-medium text-indigo-400/80">
                            • {doneSubtasks}/{subtaskCount} Subtasks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={`text-[10px] capitalize font-bold px-2 py-1 ${
                        todo.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                        todo.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {todo.priority}
                    </Badge>

                    <Badge className="text-[10px] bg-white/10 text-white/70 border-white/10">
                      {todo.category}
                    </Badge>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        sound.click()
                        setExpandedId(isExpanded ? null : todo.id)
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(todo.id, e)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks Accordion Drawer */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden border-t border-white/5 bg-black/20`}
                  style={{ maxHeight: isExpanded ? '500px' : '0px', opacity: isExpanded ? 1 : 0 }}
                >
                  <div className="p-5 space-y-3">
                    <div className="space-y-2">
                      {todo.subtasks?.map((st) => (
                        <div
                          key={st.id}
                          onClick={(e) => handleToggleSubtask(todo.id, st.id, e)}
                          className="flex items-center gap-3 text-sm text-slate-300 hover:text-white cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => {}}
                            className="rounded-full border-slate-600 bg-white/5 text-indigo-500 focus:ring-0 cursor-pointer group-hover:scale-110 transition-transform"
                          />
                          <span className={st.completed ? 'line-through text-slate-500' : ''}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-3 px-2">
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
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                      />
                      <Button size="sm" variant="secondary" onClick={() => handleAddSubtask(todo.id)}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Design new landing page"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Dev">Dev</option>
                <option value="Security">Security</option>
                <option value="Design">Design</option>
                <option value="Strategy">Strategy</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="high">Urgent</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
