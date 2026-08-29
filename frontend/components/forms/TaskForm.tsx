'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSave } from 'react-icons/fa';
import Button from '../ui/Button';
import FormField, { fieldClassName } from './FormField';
import { TaskInput, TaskPriority, TaskStatus } from '../../services/taskService';
import { useProjectsQuery } from '../../hooks/useProjects';
import { useUsersQuery } from '../../hooks/useUsers';

const optionalNumber = z
  .union([z.number(), z.nan(), z.undefined()])
  .transform((v) => (v === undefined || Number.isNaN(v) ? undefined : v))
  .optional();

const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().trim().min(1, 'Description is required'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
  projectId: optionalNumber,
  assigneeId: optionalNumber,
  estimatedHours: optionalNumber,
  actualHours: optionalNumber,
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  initialData: {
    title: string;
    description: string;
    status: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
    project?: { id: number } | null;
    assignee?: { id: number } | null;
    estimatedHours?: number | null;
    actualHours?: number | null;
  };
  onSubmit: (task: TaskInput) => void;
  buttonText: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const { data: projectsResult } = useProjectsQuery({ limit: 1000 });
  const { data: usersResult } = useUsersQuery({ limit: 1000 });
  const projects = projectsResult?.items ?? [];
  const users = usersResult?.items ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData.title,
      description: initialData.description,
      status: initialData.status,
      priority: initialData.priority ?? 'MEDIUM',
      dueDate: initialData.dueDate?.slice(0, 10) ?? '',
      projectId: initialData.project?.id,
      assigneeId: initialData.assignee?.id,
      estimatedHours: initialData.estimatedHours ?? undefined,
      actualHours: initialData.actualHours ?? undefined,
    },
  });

  const submit = (values: TaskFormValues) => {
    onSubmit({
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      projectId: values.projectId,
      assigneeId: values.assigneeId,
      estimatedHours: values.estimatedHours,
      actualHours: values.actualHours,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-5"
    >
      <FormField label="Title" htmlFor="title" error={errors.title?.message}>
        <input
          id="title"
          placeholder="Title"
          className={fieldClassName(!!errors.title)}
          {...register('title')}
        />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          placeholder="Description"
          rows={4}
          className={fieldClassName(!!errors.description)}
          {...register('description')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Status" htmlFor="status" error={errors.status?.message}>
          <select id="status" className={fieldClassName()} {...register('status')}>
            <option value="TODO">TO DO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="DONE">DONE</option>
          </select>
        </FormField>
        <FormField label="Priority" htmlFor="priority" error={errors.priority?.message}>
          <select id="priority" className={fieldClassName()} {...register('priority')}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Project" htmlFor="project">
          <select
            id="project"
            className={fieldClassName()}
            {...register('projectId', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          >
            <option value="">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Assignee" htmlFor="assignee">
          <select
            id="assignee"
            className={fieldClassName()}
            {...register('assigneeId', {
              setValueAs: (v) => (v === '' ? undefined : Number(v)),
            })}
          >
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Due Date" htmlFor="dueDate">
          <input
            type="date"
            id="dueDate"
            className={fieldClassName()}
            {...register('dueDate')}
          />
        </FormField>
        <FormField
          label="Estimated Hours"
          htmlFor="estimatedHours"
          error={errors.estimatedHours?.message}
        >
          <input
            type="number"
            step="0.5"
            min="0"
            id="estimatedHours"
            className={fieldClassName(!!errors.estimatedHours)}
            {...register('estimatedHours', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Actual Hours"
          htmlFor="actualHours"
          error={errors.actualHours?.message}
        >
          <input
            type="number"
            step="0.5"
            min="0"
            id="actualHours"
            className={fieldClassName(!!errors.actualHours)}
            {...register('actualHours', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <Button type="submit" text={isSubmitting ? 'Saving...' : buttonText} icon={<FaSave />} disabled={isSubmitting} />
    </form>
  );
};

export default TaskForm;
