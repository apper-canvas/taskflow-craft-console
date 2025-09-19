import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Textarea from "@/components/atoms/Textarea"
import Select from "@/components/atoms/Select"
import FormField from "@/components/molecules/FormField"

const TaskForm = ({ onSubmit, categories = [], initialTask = null, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    category: "",
    dueDate: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
if (initialTask) {
      setFormData({
        title: initialTask.title || "",
        description: initialTask.description || "",
        priority: initialTask.priority || "Medium",
        category: initialTask.category || "",
        dueDate: initialTask.dueDate ? initialTask.dueDate.split("T")[0] : ""
      })
    }
  }, [initialTask])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required"
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Task title must be at least 3 characters"
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
      }

      await onSubmit(taskData)

      if (!initialTask) {
        setFormData({
          title: "",
          description: "",
          priority: "Medium",
          category: "",
          dueDate: ""
        })
        toast.success("Task created successfully! 🎉")
      } else {
        toast.success("Task updated successfully! ✨")
      }

      if (onCancel) onCancel()
    } catch (error) {
      toast.error(error.message || "Failed to save task")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <ApperIcon name={initialTask ? "Edit2" : "Plus"} className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900">
          {initialTask ? "Edit Task" : "Create New Task"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Task Title"
          required
          error={errors.title}
        >
          <Input
            type="text"
            placeholder="Enter task title..."
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={errors.title ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
            maxLength={100}
          />
        </FormField>

        <FormField
          label="Description"
          error={errors.description}
        >
          <Textarea
            placeholder="Add task details..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            maxLength={500}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Priority"
            required
          >
            <Select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </Select>
          </FormField>

          <FormField
            label="Category"
          >
            <Select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              <option value="">Select category...</option>
              {categories.map(category => (
<option key={category.Id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          label="Due Date"
          error={errors.dueDate}
        >
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange("dueDate", e.target.value)}
            className={errors.dueDate ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}
            min={new Date().toISOString().split("T")[0]}
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                {initialTask ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <ApperIcon name={initialTask ? "Save" : "Plus"} className="w-4 h-4 mr-2" />
                {initialTask ? "Update Task" : "Create Task"}
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  )
}

export default TaskForm