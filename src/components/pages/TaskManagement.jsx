import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import { taskService } from "@/services/api/taskService"
import ApperIcon from "@/components/ApperIcon"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import TaskForm from "@/components/organisms/TaskForm"
import TaskList from "@/components/organisms/TaskList"
import TaskStats from "@/components/organisms/TaskStats"
import SearchBar from "@/components/molecules/SearchBar"
import Button from "@/components/atoms/Button"

const TaskManagement = () => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({ category: "", priority: "" })
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAllTasks(),
        taskService.getAllCategories()
      ])
      
      setTasks(tasksData)
      setCategories(categoriesData)
    } catch (err) {
      setError(err.message || "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredTasks = useMemo(() => {
let filtered = tasks

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category)
    }

    // Apply priority filter  
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    return filtered
  }, [tasks, searchQuery, filters])

  const pendingTasks = useMemo(() => 
    filteredTasks.filter(task => !task.completed),
    [filteredTasks]
  )

  const completedTasks = useMemo(() => 
    filteredTasks.filter(task => task.completed),
    [filteredTasks]
  )

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData)
      setTasks(prev => [newTask, ...prev])
      setShowForm(false)
    } catch (err) {
      throw new Error(err.message || "Failed to create task")
    }
  }

  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return
    
    try {
const updatedTask = await taskService.updateTask(editingTask.Id, taskData)
      setTasks(prev => prev.map(task => 
        task.Id === editingTask.Id ? updatedTask : task
      ))
      setEditingTask(null)
      setShowForm(false)
    } catch (err) {
      throw new Error(err.message || "Failed to update task")
    }
  }

  const handleToggleComplete = async (taskId, completed) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, { completed })
setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ))
      
      if (completed) {
        toast.success("🎉 Task completed! Great job!", {
          icon: "✅"
        })
      } else {
        toast.info("Task moved back to pending", {
          icon: "📝"
        })
      }
    } catch (err) {
      toast.error(err.message || "Failed to update task")
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
setTasks(prev => prev.filter(task => task.Id !== taskId))
      toast.success("Task deleted successfully")
    } catch (err) {
      toast.error(err.message || "Failed to delete task")
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            TaskFlow
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Organize your productivity with effortless task management. Stay focused and get things done.
          </p>
        </motion.div>

        {/* Stats */}
        <TaskStats tasks={tasks} />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8"
        >
          <div className="flex gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" className="w-4 h-4" />
              Add New Task
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-2"
            >
              <ApperIcon name={showCompleted ? "EyeOff" : "Eye"} className="w-4 h-4" />
              {showCompleted ? "Hide" : "Show"} Completed ({completedTasks.length})
            </Button>
          </div>
        </motion.div>

        {/* Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TaskForm
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                categories={categories}
                initialTask={editingTask}
                onCancel={handleCancelForm}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchBar
            onSearch={setSearchQuery}
            onFilter={setFilters}
            categories={categories}
          />
        </div>

        {/* Task Lists */}
        <div className="space-y-8">
          {/* Pending Tasks */}
          <TaskList
            tasks={pendingTasks}
            title="Active Tasks"
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            emptyTitle="No pending tasks"
            emptyDescription="All caught up! Create a new task to stay productive."
            emptyIcon="CheckSquare"
            emptyAction="Add First Task"
            onEmptyAction={() => setShowForm(true)}
          />

          {/* Completed Tasks */}
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TaskList
                  tasks={completedTasks}
                  title="Completed Tasks"
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  emptyTitle="No completed tasks yet"
                  emptyDescription="Completed tasks will appear here. Start checking off your to-dos!"
                  emptyIcon="CheckCircle"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-slate-500 text-sm">
            Stay organized, stay productive with TaskFlow
          </p>
        </motion.footer>
      </div>
    </div>
  )
}

export default TaskManagement