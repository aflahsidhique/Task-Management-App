import { FormEvent, useEffect, useState } from 'react';
import Button from '../ui/Button';
import { FaSave } from 'react-icons/fa';
import { TaskInput, TaskPriority, TaskStatus } from '../../services/taskService';
import ProjectService, { Project } from '../../services/projectService';
import UserService, { User } from '../../services/userService';

interface TaskFormProps {
  initialData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    project?: { id: number } | null;
    assignee?: { id: number } | null;
  };
  onSubmit: (task: TaskInput) => void;
  buttonText: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description);
  const [status, setStatus] = useState<TaskStatus>(initialData.status);
  const [priority, setPriority] = useState<TaskPriority>(initialData.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(initialData.dueDate?.slice(0, 10) ?? '');
  const [projectId, setProjectId] = useState<number | undefined>(initialData.project?.id);
  const [assigneeId, setAssigneeId] = useState<number | undefined>(initialData.assignee?.id);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    ProjectService.getProjects().then(setProjects).catch(() => setProjects([]));
    UserService.getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      projectId,
      assigneeId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-5">
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={4}
        ></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="TODO">TO DO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="project">Project</label>
          <select
            id="project"
            value={projectId ?? ''}
            onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="assignee">Assignee</label>
          <select
            id="assignee"
            value={assigneeId ?? ''}
            onChange={(e) => setAssigneeId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.fullName}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2" htmlFor="dueDate">Due Date</label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <Button type="submit" text={buttonText} icon={<FaSave />} />
    </form>
  );
};

export default TaskForm;
