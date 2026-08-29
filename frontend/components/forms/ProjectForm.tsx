'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSave } from 'react-icons/fa';
import Button from '../ui/Button';
import FormField, { fieldClassName } from './FormField';
import { ProjectInput, ProjectStatus } from '../../services/projectService';
import { useUsersQuery } from '../../hooks/useUsers';

const statuses: ProjectStatus[] = ['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'ON_HOLD'];

const projectSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(200),
    description: z.string().trim().optional(),
    status: z.enum(['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'ON_HOLD']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    ownerId: z.number({ message: 'Select an owner' }).min(1, 'Select an owner'),
    memberIds: z.array(z.number()),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData: {
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
    ownerId: number;
    memberIds: number[];
  };
  onSubmit: (project: ProjectInput) => void;
  buttonText: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const { data: usersResult } = useUsersQuery({ limit: 1000 });
  const users = usersResult?.items ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      status: initialData.status,
      startDate: initialData.startDate?.slice(0, 10) ?? '',
      endDate: initialData.endDate?.slice(0, 10) ?? '',
      ownerId: initialData.ownerId || undefined,
      memberIds: initialData.memberIds,
    },
  });

  const memberIds = watch('memberIds');
  const toggleMember = (id: number) => {
    setValue(
      'memberIds',
      memberIds.includes(id) ? memberIds.filter((m) => m !== id) : [...memberIds, id],
      { shouldValidate: true },
    );
  };

  const submit = (values: ProjectFormValues) => {
    onSubmit({
      name: values.name,
      description: values.description,
      status: values.status,
      startDate: values.startDate,
      endDate: values.endDate,
      ownerId: values.ownerId,
      memberIds: values.memberIds,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-5"
    >
      <FormField label="Name" htmlFor="name" error={errors.name?.message}>
        <input id="name" className={fieldClassName(!!errors.name)} {...register('name')} />
      </FormField>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={3}
          className={fieldClassName(!!errors.description)}
          {...register('description')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Start Date" htmlFor="startDate" error={errors.startDate?.message}>
          <input
            id="startDate"
            type="date"
            className={fieldClassName(!!errors.startDate)}
            {...register('startDate')}
          />
        </FormField>
        <FormField label="End Date" htmlFor="endDate" error={errors.endDate?.message}>
          <input
            id="endDate"
            type="date"
            className={fieldClassName(!!errors.endDate)}
            {...register('endDate')}
          />
        </FormField>
      </div>

      <FormField label="Status" htmlFor="status">
        <select id="status" className={fieldClassName()} {...register('status')}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Owner" htmlFor="owner" error={errors.ownerId?.message}>
        <select
          id="owner"
          className={fieldClassName(!!errors.ownerId)}
          {...register('ownerId', { valueAsNumber: true })}
        >
          <option value="">Select owner</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Members" htmlFor="members">
        <div id="members" className="flex flex-wrap gap-2">
          {users.map((u) => (
            <button
              type="button"
              key={u.id}
              onClick={() => toggleMember(u.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                memberIds.includes(u.id)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700'
              }`}
            >
              {u.fullName}
            </button>
          ))}
        </div>
      </FormField>

      <Button type="submit" text={isSubmitting ? 'Saving...' : buttonText} icon={<FaSave />} disabled={isSubmitting} />
    </form>
  );
};

export default ProjectForm;
