'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import RoleService, { Role } from '../../../services/roleService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import LoadingDots from '../../../components/ui/LoadingDots';
import { useAuth } from '../../../context/AuthContext';

export default function RolesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'Admin';
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    RoleService.getRoles()
      .then(setRoles)
      .catch((err) => console.error('Failed to load roles:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await RoleService.deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        right={
          isAdmin && (
            <Link
              href="/roles/new"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FaPlus /> New Role
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
              <Th>Description</Th>
              <Th>Permissions</Th>
              {isAdmin && <Th>Actions</Th>}
            </Thead>
            <Tbody>
              {roles.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-medium text-gray-900">{r.name}</Td>
                  <Td>{r.description ?? '—'}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((p) => (
                        <Badge key={p} variant="neutral">{p}</Badge>
                      ))}
                    </div>
                  </Td>
                  {isAdmin && (
                    <Td>
                      <div className="flex items-center gap-2">
                        <Link href={`/roles/${r.id}/edit`} className="text-xs text-primary hover:underline">
                          Edit
                        </Link>
                        <button onClick={() => handleDelete(r.id)} className="text-danger">
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
