import Link from 'next/link';
import { FaCog, FaTrashAlt } from 'react-icons/fa';
import { Task } from '../../services/taskService';
import Badge, { statusLabel, statusToVariant } from '../ui/Badge';
import Avatar from '../ui/Avatar';

interface TaskItemProps {
  task: Task;
  handleDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, handleDelete }) => {
  return (
    <tr className="border-b border-gray-100 bg-white hover:bg-gray-50">
      <td className="px-5 py-4 text-sm text-gray-900 font-medium">{task.title}</td>
      <td className="px-5 py-4 text-sm text-gray-500">{task.project?.name ?? '—'}</td>
      <td className="px-5 py-4 text-sm text-gray-500">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar name={task.assignee.fullName} avatarUrl={task.assignee.avatarUrl} size="sm" />
            <span>{task.assignee.fullName}</span>
          </div>
        ) : (
          '—'
        )}
      </td>
      <td className="px-5 py-4 text-sm text-gray-500">
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
      </td>
      <td className="px-5 py-4 text-sm">
        <Badge variant={statusToVariant(task.priority)}>{task.priority}</Badge>
      </td>
      <td className="px-5 py-4 text-sm">
        <Badge variant={statusToVariant(task.status)}>{statusLabel(task.status)}</Badge>
      </td>
      <td className="px-5 py-4 text-sm">
        <div className="inline-flex space-x-2">
          <button
            onClick={() => handleDelete(task.id)}
            className="bg-danger text-white p-2 rounded flex items-center justify-center"
          >
            <FaTrashAlt />
          </button>
          <Link
            href={`/tasks/${task.id}/edit`}
            className="bg-primary text-white p-2 rounded flex items-center justify-center"
          >
            <FaCog />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem;
