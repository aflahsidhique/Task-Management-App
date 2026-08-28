'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserForm from '../../../../../components/forms/UserForm';
import UserService, { UpdateUserInput, User } from '../../../../../services/userService';
import PageHeader from '../../../../../components/layout/PageHeader';
import LoadingDots from '../../../../../components/ui/LoadingDots';

export default function EditUserPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UserService.getUserById(Number(id))
      .then(setUser)
      .catch((err) => console.error('Failed to load user:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: Partial<UpdateUserInput> & { password?: string }) => {
    try {
      const { password, ...rest } = data;
      await UserService.updateUser(Number(id), rest);
      router.push('/users');
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingDots />
      </div>
    );
  }
  if (!user) return <p className="text-gray-500">User not found</p>;

  return (
    <div>
      <PageHeader title="Edit User" />
      <div className="max-w-2xl">
        <UserForm
          initialData={{
            fullName: user.fullName,
            email: user.email,
            jobTitle: user.jobTitle ?? '',
            roleId: user.role?.id ?? 0,
          }}
          onSubmit={handleSubmit}
          buttonText="Save Changes"
        />
      </div>
    </div>
  );
}
