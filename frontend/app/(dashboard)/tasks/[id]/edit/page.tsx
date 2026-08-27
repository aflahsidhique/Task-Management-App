'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskService, { Task, TaskInput } from '../../../../../services/taskService';
import TaskForm from '../../../../../components/forms/TaskForm';
import PageHeader from '../../../../../components/layout/PageHeader';
import LoadingDots from '../../../../../components/ui/LoadingDots';

const UpdateTaskPage = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const data = await TaskService.getTaskById(id);
        setTask(data);
      } catch (err) {
        setError('Failed to fetch task data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleSubmit = async (updatedTask: TaskInput) => {
    try {
      await TaskService.updateTask(id, updatedTask);
      router.push('/tasks');
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingDots />
      </div>
    );
  }
  if (error) return <p className="text-danger">{error}</p>;
  if (!task) return <p className="text-gray-500">Task not found</p>;

  return (
    <div>
      <PageHeader title="Update Task" />
      <div className="max-w-2xl">
        <TaskForm initialData={task} onSubmit={handleSubmit} buttonText="Update" />
      </div>
    </div>
  );
};

export default UpdateTaskPage;
