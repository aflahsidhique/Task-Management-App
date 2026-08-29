'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSave } from 'react-icons/fa';
import Button from '../ui/Button';
import FormField, { fieldClassName } from './FormField';
import { RoleInput } from '../../services/roleService';

const KNOWN_PERMISSIONS = [
  'manage_users',
  'manage_roles',
  'manage_projects',
  'manage_tasks',
  'manage_files',
  'view_reports',
  'manage_settings',
];

const roleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  permissions: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData: { name: string; description: string; permissions: string[] };
  onSubmit: (role: RoleInput) => void;
  buttonText: string;
}

const RoleForm: React.FC<RoleFormProps> = ({ initialData, onSubmit, buttonText }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      permissions: initialData.permissions,
    },
  });

  const permissions = watch('permissions');
  const togglePermission = (perm: string) => {
    setValue(
      'permissions',
      permissions.includes(perm) ? permissions.filter((p) => p !== perm) : [...permissions, perm],
    );
  };

  const submit = (values: RoleFormValues) => {
    onSubmit({
      name: values.name,
      description: values.description,
      permissions: values.permissions,
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
      <FormField label="Description" htmlFor="description">
        <input id="description" className={fieldClassName()} {...register('description')} />
      </FormField>
      <FormField label="Permissions" htmlFor="permissions">
        <div id="permissions" className="grid grid-cols-2 gap-2">
          {KNOWN_PERMISSIONS.map((perm) => (
            <label
              key={perm}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={permissions.includes(perm)}
                onChange={() => togglePermission(perm)}
              />
              {perm}
            </label>
          ))}
        </div>
      </FormField>
      <Button type="submit" text={isSubmitting ? 'Saving...' : buttonText} icon={<FaSave />} disabled={isSubmitting} />
    </form>
  );
};

export default RoleForm;
