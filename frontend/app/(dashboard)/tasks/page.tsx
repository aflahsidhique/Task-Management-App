'use client';

import { useEffect, useState, useCallback } from 'react';
import TaskService, { Task } from '../../../services/taskService';
import TaskList from '../../../components/task/TaskList';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import Pagination from '../../../components/ui/Pagination';
import Header from '../../../components/layout/Header';
import LoadingDots from '../../../components/ui/LoadingDots';
import { utils, writeFile } from 'xlsx';

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 8;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await TaskService.getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDelete = (id: number) => {
    setTaskToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete !== null) {
      try {
        await TaskService.deleteTask(taskToDelete);
        setTasks(tasks.filter((task) => task.id !== taskToDelete));
        setShowModal(false);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTaskToDelete(null);
  };

  const exportToExcel = useCallback(() => {
    const ws = utils.json_to_sheet(
      tasks.map((t) => ({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        project: t.project?.name ?? '',
        assignee: t.assignee?.fullName ?? '',
        dueDate: t.dueDate ?? '',
      })),
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Tasks');
    writeFile(wb, 'tasks.xlsx');
  }, [tasks]);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  return (
    <div>
      {!loading && <Header onExport={exportToExcel} />}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <LoadingDots />
        </div>
      ) : (
        <div className="bg-white shadow-card rounded-card overflow-hidden mt-4">
          <TaskList tasks={currentTasks} handleDelete={handleDelete} />
          {tasks.length > tasksPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
      <ConfirmModal show={showModal} onClose={closeModal} onConfirm={confirmDelete} />
    </div>
  );
};

export default TasksPage;
