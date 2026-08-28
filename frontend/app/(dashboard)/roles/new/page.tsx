'use client';

import { useRouter } from 'next/navigation';
import RoleForm from '../../../../components/forms/RoleForm';
import RoleService, { RoleInput } from '../../../../services/roleService';
import PageHeader from '../../../../components/layout/PageHeader';

export default function NewRolePage() {
  const router = useRouter();

  const handleSubmit = async (role: RoleInput) => {
    try {
      await RoleService.createRole(role);
      router.push('/roles');
    } catch (err) {
      console.error('Failed to create role:', err);
    }
  };

  return (
    <div>
      <PageHeader title="New Role" />
      <div className="max-w-2xl">
        <RoleForm
          initialData={{ name: '', description: '', permissions: [] }}
          onSubmit={handleSubmit}
          buttonText="Create Role"
        />
      </div>
    </div>
  );
}
