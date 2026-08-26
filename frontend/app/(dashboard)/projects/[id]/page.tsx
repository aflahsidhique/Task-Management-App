'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProjectService, { Project } from '../../../../services/projectService';
import TaskService, { Task } from '../../../../services/taskService';
import PageHeader from '../../../../components/layout/PageHeader';
import Card from '../../../../components/ui/Card';
import Badge, { statusLabel, statusToVariant } from '../../../../components/ui/Badge';
import ProgressBar from '../../../../components/ui/ProgressBar';
import AvatarGroup from '../../../../components/ui/AvatarGroup';
import LoadingDots from '../../../../components/ui/LoadingDots';

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ProjectService.getProjectById(Number(id)),
      TaskService.getTasks({ projectId: Number(id) }),
    ])
      .then(([p, t]) => {
        setProject(p);
        setTasks(t);
      })
      .catch((err) => console.error('Failed to load project:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingDots />
      </div>
    );
  }

  if (!project) {
    return <p className="text-gray-500">Project not found.</p>;
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        extra={<Badge variant={statusToVariant(project.status)}>{statusLabel(project.status)}</Badge>}
        right={
          <Link
            href={`/projects/${project.id}/edit`}
            className="bg-white border border-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            Edit Project
          </Link>
        }
      />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card title="Overview" className="xl:col-span-2">
          <p className="text-sm text-gray-600 mb-4">{project.description}</p>
          <div className="flex items-center gap-2 mb-4">
            <ProgressBar percent={project.progressPercent} />
            <span className="text-xs text-gray-500 shrink-0">{project.progressPercent}%</span>
          </div>
          <p className="text-xs text-gray-400">
            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
          </p>
        </Card>
        <Card title="Members">
          <AvatarGroup
            members={project.members.map((m) => ({ id: m.id, name: m.fullName, avatarUrl: m.avatarUrl }))}
            max={8}
          />
        </Card>
      </div>
      <Card title="Tasks" className="mt-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400">No tasks yet.</p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tasks.map((t) => (
              <li key={t.id} className="py-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{t.title}</span>
                <Badge variant={statusToVariant(t.status)}>{statusLabel(t.status)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
