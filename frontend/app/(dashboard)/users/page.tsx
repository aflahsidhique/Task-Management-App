'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { ListUsersParams } from '../../../services/userService';
import { useDeleteUser, useSetUserStatus, useUsersQuery } from '../../../hooks/useUsers';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../../components/ui/Table';
import Avatar from '../../../components/ui/Avatar';
import Pagination from '../../../components/ui/Pagination';
import { SkeletonTable } from '../../../components/ui/Skeleton';
import { useAuth } from '../../../context/AuthContext';

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission('manage_users');

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const params: ListUsersParams = useMemo(
    () => ({
      page,
      limit: USERS_PER_PAGE,
      search: debouncedSearch || undefined,
      status: (status || undefined) as ListUsersParams['status'],
    }),
    [page, debouncedSearch, status],
  );

  const { data, isLoading, isError } = useUsersQuery(params);
  const deleteUser = useDeleteUser();
  const setUserStatus = useSetUserStatus();
  const totalPages = data?.meta.totalPages ?? 1;

  const handleDelete = (id: number) => {
    if (confirm('Delete this user? This cannot be undone from the UI.')) {
      deleteUser.mutate(id);
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

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search users by name or email..."
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <Card>
        {isLoading && !data ? (
          <SkeletonTable rows={USERS_PER_PAGE} columns={isAdmin ? 6 : 5} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <p className="text-sm text-danger">Failed to load users. Please try again.</p>
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Job Title</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                {isAdmin && <Th>Actions</Th>}
              </Thead>
              <Tbody>
                {(data?.items ?? []).map((u) => (
                  <Tr key={u.id}>
                    <Td>
                      <div className="flex items-center gap-2">
                        <Avatar name={u.fullName} avatarUrl={u.avatarUrl} size="sm" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {u.fullName}
                        </span>
                      </div>
                    </Td>
                    <Td>{u.email}</Td>
                    <Td>{u.jobTitle ?? '—'}</Td>
                    <Td>{u.role?.name ?? '—'}</Td>
                    <Td>
                      {isAdmin ? (
                        <button
                          onClick={() =>
                            setUserStatus.mutate({ id: u.id, active: u.status !== 'ACTIVE' })
                          }
                          disabled={setUserStatus.isPending}
                        >
                          <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      ) : (
                        <Badge variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}>
                          {u.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </Badge>
                      )}
                    </Td>
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
            {(data?.items.length ?? 0) === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-10">
                No users match your filters.
              </p>
            )}
          </>
        )}
      </Card>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
