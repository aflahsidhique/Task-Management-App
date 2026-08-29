import { Task } from '../../services/taskService';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  handleDelete: (id: number) => void;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  handleDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const selectable = !!onToggleSelect;
  const allSelected = selectable && tasks.length > 0 && tasks.every((t) => selectedIds?.includes(t.id));

  return (
    <table className="min-w-full leading-normal">
      <thead>
        <tr>
          {selectable && (
            <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label="Select all tasks"
              />
            </th>
          )}
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Title</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Project</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Assignee</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Due Date</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Priority</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Status</th>
          <th className="px-5 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400 text-left text-xs uppercase font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            handleDelete={handleDelete}
            selected={selectedIds?.includes(task.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </tbody>
    </table>
  );
};

export default TaskList;
