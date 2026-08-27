import { Task } from '../../services/taskService';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  handleDelete: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, handleDelete }) => {
  return (
    <table className="min-w-full leading-normal">
      <thead>
        <tr>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Title</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Project</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Assignee</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Due Date</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Priority</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Status</th>
          <th className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-left text-xs uppercase font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} handleDelete={handleDelete} />
        ))}
      </tbody>
    </table>
  );
};

export default TaskList;
