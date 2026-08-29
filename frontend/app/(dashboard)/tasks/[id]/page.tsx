'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaCog } from 'react-icons/fa';
import { useTaskQuery } from '../../../../hooks/useTasks';
import { useUsersQuery } from '../../../../hooks/useUsers';
import PageHeader from '../../../../components/layout/PageHeader';
import Card from '../../../../components/ui/Card';
import Badge, { statusLabel, statusToVariant } from '../../../../components/ui/Badge';
import Avatar from '../../../../components/ui/Avatar';
import { SkeletonCard } from '../../../../components/ui/Skeleton';
import CommentThread from '../../../../components/comments/CommentThread';
import TaskAttachments from '../../../../components/task/TaskAttachments';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 text-sm border-b border-gray-100 dark:border-slate-700 last:border-0">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-gray-900 dark:text-gray-100 font-medium">{value}</span>
    </div>
  );
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = Number(params.id);

  const { data: task, isLoading, isError } = useTaskQuery(taskId);
  const { data: usersResult } = useUsersQuery({ limit: 1000 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SkeletonCard className="xl:col-span-2" />
        <SkeletonCard />
      </div>
    );
  }

  if (isError || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
        <p className="text-sm text-danger">Task not found or failed to load.</p>
        <Link href="/tasks" className="text-sm text-primary hover:underline">
          Back to tasks
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        extra={
          <>
            <Badge variant={statusToVariant(task.status)}>{statusLabel(task.status)}</Badge>
            <Badge variant={statusToVariant(task.priority)}>{task.priority}</Badge>
          </>
        }
        right={
          <Link
            href={`/tasks/${task.id}/edit`}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <FaCog size={12} /> Edit
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card title="Description">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </Card>
          <Card title="Comments">
            <CommentThread taskId={task.id} users={usersResult?.items ?? []} />
          </Card>
          <Card title="Attachments">
            <TaskAttachments taskId={task.id} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Details">
            <InfoRow
              label="Project"
              value={
                task.project ? (
                  <Link href={`/projects/${task.project.id}`} className="text-primary hover:underline">
                    {task.project.name}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
            <InfoRow
              label="Assignee"
              value={
                task.assignee ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={task.assignee.fullName} avatarUrl={task.assignee.avatarUrl} size="sm" />
                    {task.assignee.fullName}
                  </span>
                ) : (
                  'Unassigned'
                )
              }
            />
            <InfoRow
              label="Reporter"
              value={
                task.reporter ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={task.reporter.fullName} avatarUrl={task.reporter.avatarUrl} size="sm" />
                    {task.reporter.fullName}
                  </span>
                ) : (
                  '—'
                )
              }
            />
            <InfoRow
              label="Due Date"
              value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
            />
            <InfoRow label="Estimated Hours" value={task.estimatedHours ?? '—'} />
            <InfoRow label="Actual Hours" value={task.actualHours ?? '—'} />
            <InfoRow
              label="Completed"
              value={task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
