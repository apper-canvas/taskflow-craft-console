import { useMemo } from "react"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const TaskStats = ({ tasks = [] }) => {
const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(task => task.completed).length
    const pending = total - completed
    const high = tasks.filter(task => task.priority === "High" && !task.completed).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, pending, high, completionRate }
  }, [tasks])
  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: "CheckSquare",
      color: "from-primary-500 to-primary-600",
      bgColor: "from-primary-50 to-primary-100"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: "CheckCircle",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: "Clock",
      color: "from-amber-500 to-amber-600",
      bgColor: "from-amber-50 to-amber-100"
    },
    {
      title: "High Priority",
      value: stats.high,
      icon: "AlertCircle",
      color: "from-red-500 to-red-600",
      bgColor: "from-red-50 to-red-100"
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
              <ApperIcon name={stat.icon} className="w-6 h-6 text-white" />
            </div>
            {stat.title === "Completed" && stats.total > 0 && (
              <div className="text-right">
                <div className="text-sm text-slate-600">Progress</div>
                <div className="text-lg font-bold text-slate-900">{stats.completionRate}%</div>
              </div>
            )}
          </div>
          
          <div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stat.value}
            </div>
            <div className="text-sm font-medium text-slate-600">
              {stat.title}
            </div>
          </div>

          {stat.title === "Completed" && stats.total > 0 && (
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full`}
                />
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

export default TaskStats