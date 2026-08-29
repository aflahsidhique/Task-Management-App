'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import { ListProjectsParams } from '../../../services/projectService';
import { useProjectsQuery } from '../../../hooks/useProjects';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useAuth } from '../../../context/AuthContext';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge, { statusLabel, statusToVariant } from '../../../components/ui/Badge';
import ProgressBar from '../../../components/ui/ProgressBar';
import AvatarGroup from '../../../components/ui/AvatarGroup';
import Pagination from '../../../components/ui/Pagination';
import { SkeletonCard } from '../../../components/ui/Skeleton';

const PROJECTS_PER_PAGE = 9;
const STATUS_OPTIONS = ['ON_TRACK', 'AT_RISK', 'DELAYED', 'COMPLETED', 'ON_HOLD'] as const;

export default function ProjectsPage() {
  const { hasPermission } = useAuth();
  const canManageProjects = hasPermission('manage_projects');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const debouncedSearch = useDebouncedValue(search);

  const params: ListProjectsParams = useMemo(
    () => ({
      page,
      limit: PROJECTS_PER_PAGE,
      search: debouncedSearch || undefined,
      status: (status || undefined) as ListProjectsParams['status'],
    }),
    [page, debouncedSearch, status],
  );

  const { data, isLoading, isError } = useProjectsQuery(params);
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div>
      <PageHeader
        title="Projects"
        right={
          canManageProjects && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FaPlus /> New Project
            </Link>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search projects..."
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
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
          <p className="text-sm text-danger">Failed to load projects. Please try again.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(data?.items ?? []).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {project.name}
                    </h3>
                    <Badge variant={statusToVariant(project.status)}>
                      {statusLabel(project.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <ProgressBar percent={project.progressPercent} />
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                      {project.progressPercent}%
                    </span>
                  </div>
                  <AvatarGroup
                    members={project.members.map((m) => ({
                      id: m.id,
                      name: m.fullName,
                      avatarUrl: m.avatarUrl,
                    }))}
                  />
                </Card>
              </Link>
            ))}
          </div>
          {(data?.items.length ?? 0) === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-16">
              No projects match your filters.
            </p>
          )}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
