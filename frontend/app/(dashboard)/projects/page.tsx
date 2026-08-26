'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';
import ProjectService, { Project } from '../../../services/projectService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge, { statusLabel, statusToVariant } from '../../../components/ui/Badge';
import ProgressBar from '../../../components/ui/ProgressBar';
import AvatarGroup from '../../../components/ui/AvatarGroup';
import LoadingDots from '../../../components/ui/LoadingDots';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProjectService.getProjects()
      .then(setProjects)
      .catch((err) => console.error('Failed to load projects:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Projects"
        right={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <FaPlus /> New Project
          </Link>
        }
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingDots />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <Badge variant={statusToVariant(project.status)}>{statusLabel(project.status)}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <ProgressBar percent={project.progressPercent} />
                  <span className="text-xs text-gray-500 shrink-0">{project.progressPercent}%</span>
                </div>
                <AvatarGroup
                  members={project.members.map((m) => ({ id: m.id, name: m.fullName, avatarUrl: m.avatarUrl }))}
                />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
