import { motion, AnimatePresence } from "framer-motion"
import TaskCard from "@/components/molecules/TaskCard"
import Empty from "@/components/ui/Empty"

const TaskList = ({ 
  tasks, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  title,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  onEmptyAction
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        {title && (
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          </div>
        )}
        <Empty
          title={emptyTitle}
          description={emptyDescription}
          icon={emptyIcon}
          action={emptyAction}
          onAction={onEmptyAction}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl shadow-lg border border-slate-200"
    >
      {title && (
        <motion.div 
          variants={itemVariants}
          className="p-6 border-b border-slate-200"
        >
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            {title}
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </h2>
        </motion.div>
      )}

      <div className="p-6">
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
        >
          <AnimatePresence mode="popLayout">
{tasks.map(task => (
              <motion.div
                key={task.Id}
                variants={itemVariants}
                layout
              >
                <TaskCard
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default TaskList