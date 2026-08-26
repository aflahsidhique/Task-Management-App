'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProjectForm from '../../../../../components/forms/ProjectForm';
import ProjectService, { Project, ProjectInput } from '../../../../../services/projectService';
import PageHeader from '../../../../../components/layout/PageHeader';
import LoadingDots from '../../../../../components/ui/LoadingDots';

export default function EditProjectPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProjectService.getProjectById(Number(id))
      .then(setProject)
      .catch((err) => console.error('Failed to load project:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (input: ProjectInput) => {
    try {
      await ProjectService.updateProject(Number(id), input);
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

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
      <PageHeader title="Edit Project" />
      <div className="max-w-2xl">
        <ProjectForm
          initialData={{
            name: project.name,
            description: project.description ?? '',
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            ownerId: project.owner?.id ?? 0,
            memberIds: project.members.map((m) => m.id),
          }}
          onSubmit={handleSubmit}
          buttonText="Save Changes"
        />
      </div>
    </div>
  );
}
