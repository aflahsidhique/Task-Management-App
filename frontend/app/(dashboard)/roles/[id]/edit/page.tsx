'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleForm from '../../../../../components/forms/RoleForm';
import RoleService, { Role, RoleInput } from '../../../../../services/roleService';
import PageHeader from '../../../../../components/layout/PageHeader';
import LoadingDots from '../../../../../components/ui/LoadingDots';

export default function EditRolePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RoleService.getRoleById(Number(id))
      .then(setRole)
      .catch((err) => console.error('Failed to load role:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (input: RoleInput) => {
    try {
      await RoleService.updateRole(Number(id), input);
      router.push('/roles');
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingDots />
      </div>
    );
  }
  if (!role) return <p className="text-gray-500">Role not found</p>;

  return (
    <div>
      <PageHeader title="Edit Role" />
      <div className="max-w-2xl">
        <RoleForm
          initialData={{
            name: role.name,
            description: role.description ?? '',
            permissions: role.permissions,
          }}
          onSubmit={handleSubmit}
          buttonText="Save Changes"
        />
      </div>
    </div>
  );
}
