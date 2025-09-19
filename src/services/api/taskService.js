import { toast } from "react-toastify"

export const taskService = {
  async getAllTasks() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "completed_at_c"}}
        ],
        orderBy: [{"fieldName": "created_at_c", "sorttype": "DESC"}]
      }

      const response = await apperClient.fetchRecords('task_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || "",
        description: task.description_c || "",
        completed: task.completed_c || false,
        priority: task.priority_c || "Medium",
        category: task.category_c?.Name || "",
        dueDate: task.due_date_c || null,
        createdAt: task.created_at_c || new Date().toISOString(),
        completedAt: task.completed_at_c || null
      }))
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error)
      return []
    }
  },

  async getTaskById(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "completed_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "completed_at_c"}}
        ]
      }

      const response = await apperClient.getRecordById('task_c', parseInt(id), params)

      if (!response?.data) {
        return null
      }

      return {
        Id: response.data.Id,
        title: response.data.title_c || "",
        description: response.data.description_c || "",
        completed: response.data.completed_c || false,
        priority: response.data.priority_c || "Medium",
        category: response.data.category_c?.Name || "",
        dueDate: response.data.due_date_c || null,
        createdAt: response.data.created_at_c || new Date().toISOString(),
        completedAt: response.data.completed_at_c || null
      }
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

  async createTask(taskData) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Get category ID if category name is provided
      let categoryId = null
      if (taskData.category) {
        const categories = await this.getAllCategories()
        const category = categories.find(c => c.name === taskData.category)
        categoryId = category ? category.Id : null
      }

      const params = {
        records: [{
          title_c: taskData.title || "",
          description_c: taskData.description || "",
          completed_c: false,
          priority_c: taskData.priority || "Medium",
          category_c: categoryId,
          due_date_c: taskData.dueDate || null,
          created_at_c: new Date().toISOString(),
          completed_at_c: null
        }]
      }

      const response = await apperClient.createRecord('task_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            }
            if (record.message) toast.error(record.message)
          })
        }

        if (successful.length > 0) {
          const created = successful[0].data
          return {
            Id: created.Id,
            title: created.title_c || "",
            description: created.description_c || "",
            completed: created.completed_c || false,
            priority: created.priority_c || "Medium",
            category: created.category_c?.Name || taskData.category || "",
            dueDate: created.due_date_c || null,
            createdAt: created.created_at_c || new Date().toISOString(),
            completedAt: created.completed_at_c || null
          }
        }
      }
      throw new Error("Failed to create task")
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async updateTask(id, updates) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      // Get category ID if category name is provided
      let categoryId = null
      if (updates.category) {
        const categories = await this.getAllCategories()
        const category = categories.find(c => c.name === updates.category)
        categoryId = category ? category.Id : null
      }

      const updateData = {
        Id: parseInt(id)
      }

      if (updates.title !== undefined) updateData.title_c = updates.title
      if (updates.description !== undefined) updateData.description_c = updates.description
      if (updates.completed !== undefined) {
        updateData.completed_c = updates.completed
        updateData.completed_at_c = updates.completed ? new Date().toISOString() : null
      }
      if (updates.priority !== undefined) updateData.priority_c = updates.priority
      if (updates.category !== undefined) updateData.category_c = categoryId
      if (updates.dueDate !== undefined) updateData.due_date_c = updates.dueDate

      const params = {
        records: [updateData]
      }

      const response = await apperClient.updateRecord('task_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            }
            if (record.message) toast.error(record.message)
          })
        }

        if (successful.length > 0) {
          const updated = successful[0].data
          return {
            Id: updated.Id,
            title: updated.title_c || "",
            description: updated.description_c || "",
            completed: updated.completed_c || false,
            priority: updated.priority_c || "Medium",
            category: updated.category_c?.Name || "",
            dueDate: updated.due_date_c || null,
            createdAt: updated.created_at_c || new Date().toISOString(),
            completedAt: updated.completed_at_c || null
          }
        }
      }
      throw new Error("Failed to update task")
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async deleteTask(id) {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = { 
        RecordIds: [parseInt(id)]
      }

      const response = await apperClient.deleteRecord('task_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }
      return false
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error)
      return false
    }
  },

  async getAllCategories() {
    try {
      const { ApperClient } = window.ApperSDK
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "task_count_c"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      }

      const response = await apperClient.fetchRecords('category_c', params)

      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }

      if (!response.data || response.data.length === 0) {
        return []
      }

      return response.data.map(category => ({
        Id: category.Id,
        name: category.name_c || category.Name || "",
        color: category.color_c || "#3b82f6",
        taskCount: category.task_count_c || 0
      }))
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error)
      return []
    }
  }
}