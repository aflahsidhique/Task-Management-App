'use client';

import { useRouter } from 'next/navigation';
import TaskService, { TaskInput } from '../../../../services/taskService';
import TaskForm from '../../../../components/forms/TaskForm';
import PageHeader from '../../../../components/layout/PageHeader';

const CreateTaskPage = () => {
  const router = useRouter();

  const handleSubmit = async (task: TaskInput) => {
    try {
      await TaskService.createTask(task);
      router.push('/tasks');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div>
      <PageHeader title="Create Task" />
      <div className="max-w-2xl">
        <TaskForm
          initialData={{ title: '', description: '', status: 'TODO' }}
          onSubmit={handleSubmit}
          buttonText="Create"
        />
      </div>
    </div>
  );
};

export default CreateTaskPage;
