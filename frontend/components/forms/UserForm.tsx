'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaSave } from 'react-icons/fa';
import Button from '../ui/Button';
import FormField, { fieldClassName } from './FormField';
import { useRolesQuery } from '../../hooks/useRoles';

interface UserFormProps {
  initialData: {
    fullName: string;
    email: string;
    jobTitle: string;
    mobile?: string;
    roleId: number;
  };
  onSubmit: (data: {
    fullName: string;
    email: string;
    password?: string;
    jobTitle?: string;
    mobile?: string;
    roleId: number;
  }) => void;
  buttonText: string;
  requirePassword?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  buttonText,
  requirePassword,
}) => {
  const { data: roles = [] } = useRolesQuery();

  const userSchema = useMemo(
    () =>
      z.object({
        fullName: z.string().trim().min(1, 'Full name is required'),
        email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
        jobTitle: z.string().trim().optional(),
        mobile: z.string().trim().optional(),
        roleId: z.number({ message: 'Select a role' }).min(1, 'Select a role'),
        password: requirePassword
          ? z.string().min(8, 'Password must be at least 8 characters')
          : z
              .string()
              .optional()
              .refine((v) => !v || v.length >= 8, 'Password must be at least 8 characters'),
      }),
    [requirePassword],
  );

  type UserFormValues = z.infer<typeof userSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: initialData.fullName,
      email: initialData.email,
      jobTitle: initialData.jobTitle,
      mobile: initialData.mobile ?? '',
      roleId: initialData.roleId || undefined,
      password: '',
    },
  });

  const submit = (values: UserFormValues) => {
    onSubmit({
      fullName: values.fullName,
      email: values.email,
      jobTitle: values.jobTitle,
      mobile: values.mobile,
      roleId: values.roleId,
      ...(values.password ? { password: values.password } : {}),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md space-y-5"
    >
      <FormField label="Full Name" htmlFor="fullName" error={errors.fullName?.message}>
        <input
          id="fullName"
          className={fieldClassName(!!errors.fullName)}
          {...register('fullName')}
        />
      </FormField>
      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          className={fieldClassName(!!errors.email)}
          {...register('email')}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Job Title" htmlFor="jobTitle">
          <input id="jobTitle" className={fieldClassName()} {...register('jobTitle')} />
        </FormField>
        <FormField label="Mobile" htmlFor="mobile">
          <input id="mobile" className={fieldClassName()} {...register('mobile')} />
        </FormField>
      </div>
      <FormField label="Role" htmlFor="role" error={errors.roleId?.message}>
        <select
          id="role"
          className={fieldClassName(!!errors.roleId)}
          {...register('roleId', { valueAsNumber: true })}
        >
          <option value="">Select role</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label={requirePassword ? 'Password' : 'Password (leave blank to keep unchanged)'}
        htmlFor="password"
        error={errors.password?.message}
      >
        <input
          id="password"
          type="password"
          className={fieldClassName(!!errors.password)}
          {...register('password')}
        />
      </FormField>
      <Button type="submit" text={isSubmitting ? 'Saving...' : buttonText} icon={<FaSave />} disabled={isSubmitting} />
    </form>
  );
};

export default UserForm;
