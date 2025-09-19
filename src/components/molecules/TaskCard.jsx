import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Checkbox from "@/components/atoms/Checkbox"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"

const TaskCard = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleToggleComplete = async () => {
await onToggleComplete(task.Id, !task.completed)
  }

  const handleDelete = async () => {
setIsDeleting(true)
    await onDelete(task.Id)
    setIsDeleting(false)
    setShowDeleteConfirm(false)
  }

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "high"
      case "medium": return "medium"
      case "low": return "low"
      default: return "default"
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "AlertCircle"
      case "medium": return "Clock"
      case "low": return "CheckCircle"
      default: return "Circle"
    }
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return null
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return null
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        whileHover={{ y: -2, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
className={`card p-6 ${task.completed ? "task-completed" : ""}`}
      >
        <div className="flex items-start gap-4">
          <motion.div 
            className="flex-shrink-0 mt-1"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Checkbox
checked={task.completed}
              onChange={handleToggleComplete}
            />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <motion.h3 
className={`text-lg font-semibold mb-2 ${
                    task.completed 
                      ? "line-through text-slate-500" 
                      : "text-slate-900"
                  }`}
                  animate={{ 
                    opacity: task.completed ? 0.6 : 1,
                    textDecoration: task.completed ? "line-through" : "none"
                  }}
                >
                  {task.title}
                </motion.h3>
                
                {task.description && (
                  <p className={`text-slate-600 mb-3 leading-relaxed ${
                    task.completed ? "opacity-60" : ""
                  }`}>
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
onClick={() => onEdit(task)}
                    className="w-8 h-8 p-0 hover:bg-primary-100 hover:text-primary-600"
                  >
                    <ApperIcon name="Edit2" className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="w-8 h-8 p-0 hover:bg-red-100 hover:text-red-600"
                >
                  {isDeleting ? (
                    <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                  ) : (
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
<div className="flex items-center gap-3">
                <Badge variant={getPriorityVariant(task.priority)}>
                  <ApperIcon name={getPriorityIcon(task.priority)} className="w-3 h-3 mr-1" />
                  {task.priority}
                </Badge>
                
{task.category && (
                  <Badge variant="category">
                    <ApperIcon name="Tag" className="w-3 h-3 mr-1" />
                    {task.category}
                  </Badge>
                )}
              </div>

{task.dueDate && (
                <div className="flex items-center text-sm text-slate-500">
                  <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                  {formatDueDate(task.dueDate)}
                </div>
              )}
            </div>

{task.completed && task.completedAt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 pt-3 border-t border-slate-200"
              >
                <div className="flex items-center text-sm text-emerald-600">
                  <ApperIcon name="CheckCircle" className="w-4 h-4 mr-2" />
                  Completed on {formatDueDate(task.completedAt)}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ApperIcon name="AlertTriangle" className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Task</h3>
              </div>
              
<p className="text-slate-600 mb-6">
                Are you sure you want to delete "{task.title}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TaskCard