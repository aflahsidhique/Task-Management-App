'use client';

import { useRouter } from 'next/navigation';
import ProjectForm from '../../../../components/forms/ProjectForm';
import ProjectService, { ProjectInput } from '../../../../services/projectService';
import PageHeader from '../../../../components/layout/PageHeader';
import { useAuth } from '../../../../context/AuthContext';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (project: ProjectInput) => {
    try {
      await ProjectService.createProject(project);
      router.push('/projects');
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  return (
    <div>
      <PageHeader title="New Project" />
      <div className="max-w-2xl">
        <ProjectForm
          initialData={{
            name: '',
            description: '',
            status: 'ON_TRACK',
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
            ownerId: user?.id ?? 0,
            memberIds: [],
          }}
          onSubmit={handleSubmit}
          buttonText="Create Project"
        />
      </div>
    </div>
  );
}
