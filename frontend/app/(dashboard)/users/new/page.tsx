'use client';

import { useRouter } from 'next/navigation';
import UserForm from '../../../../components/forms/UserForm';
import UserService, { CreateUserInput } from '../../../../services/userService';
import PageHeader from '../../../../components/layout/PageHeader';

export default function NewUserPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<CreateUserInput>) => {
    try {
      await UserService.createUser(data as CreateUserInput);
      router.push('/users');
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <div>
      <PageHeader title="New User" />
      <div className="max-w-2xl">
        <UserForm
          initialData={{ fullName: '', email: '', jobTitle: '', roleId: 0 }}
          onSubmit={handleSubmit}
          buttonText="Create User"
          requirePassword
        />
      </div>
    </div>
  );
}
