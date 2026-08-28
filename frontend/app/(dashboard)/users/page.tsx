'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import UserService, { User } from '../../../services/userService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../../components/ui/Table';
import Avatar from '../../../components/ui/Avatar';
import LoadingDots from '../../../components/ui/LoadingDots';
import { useAuth } from '../../../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser?.role?.name === 'Admin';

  const load = () => {
    UserService.getUsers()
      .then(setUsers)
      .catch((err) => console.error('Failed to load users:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id: number) => {
    try {
      await UserService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        right={
          isAdmin && (
            <Link
              href="/users/new"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FaPlus /> New User
            </Link>
          )
        }
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots />
          </div>
        ) : (
          <Table>
            <Thead>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Job Title</Th>
              <Th>Role</Th>
              {isAdmin && <Th>Actions</Th>}
            </Thead>
            <Tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                      <span className="font-medium text-gray-900">{u.fullName}</span>
                    </div>
                  </Td>
                  <Td>{u.email}</Td>
                  <Td>{u.jobTitle ?? '—'}</Td>
                  <Td>{u.role?.name ?? '—'}</Td>
                  {isAdmin && (
                    <Td>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/users/${u.id}/edit`}
                          className="text-xs text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-danger hover:text-danger-text"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
