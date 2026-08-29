'use client';

import { useCallback, useMemo, useState } from 'react';
import { FaColumns, FaList } from 'react-icons/fa';
import { utils, writeFile } from 'xlsx';
import TaskService, { TaskFilters, TaskPriority, TaskStatus } from '../../../services/taskService';
import {
  useAllTasksQuery,
  useBulkUpdateTasks,
  useDeleteTask,
  useTasksQuery,
} from '../../../hooks/useTasks';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import TaskList from '../../../components/task/TaskList';
import TaskBoard from '../../../components/task/TaskBoard';
import BulkActionBar from '../../../components/task/BulkActionBar';
import ConfirmModal from '../../../components/modals/ConfirmModal';
import Pagination from '../../../components/ui/Pagination';
import Header from '../../../components/layout/Header';
import { SkeletonTable } from '../../../components/ui/Skeleton';

const TASKS_PER_PAGE = 8;

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;

const TasksPage = () => {
  const [view, setView] = useState<'table' | 'board'>('table');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const debouncedSearch = useDebouncedValue(search);

  const filters: TaskFilters = useMemo(
    () => ({
      page,
      limit: TASKS_PER_PAGE,
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
    }),
    [page, debouncedSearch, status, priority],
  );

  const tableQuery = useTasksQuery(filters);
  const boardQuery = useAllTasksQuery({
    search: debouncedSearch || undefined,
    priority: priority || undefined,
  });
  const { isLoading, isError } = view === 'table' ? tableQuery : boardQuery;
  const hasData = view === 'table' ? !!tableQuery.data : !!boardQuery.data;

  const deleteTask = useDeleteTask();
  const bulkUpdate = useBulkUpdateTasks();

  const handleDelete = (id: number) => {
    setTaskToDelete(id);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete !== null) {
      await deleteTask.mutateAsync(taskToDelete);
      setShowModal(false);
      setTaskToDelete(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTaskToDelete(null);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const currentPageTasks = tableQuery.data?.items ?? [];
  const toggleSelectAll = () => {
    const pageIds = currentPageTasks.map((t) => t.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : Array.from(new Set([...selectedIds, ...pageIds])));
  };

  const applyBulkChanges = async (changes: { status?: TaskStatus; priority?: TaskPriority }) => {
    await bulkUpdate.mutateAsync({ ids: selectedIds, changes });
    setSelectedIds([]);
  };

  const exportToExcel = useCallback(async () => {
    const allMatching = await TaskService.getTasks({
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
    });
    const ws = utils.json_to_sheet(
      allMatching.map((t) => ({
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
  }, [debouncedSearch, status, priority]);

  const totalPages = view === 'table' ? (tableQuery.data?.meta.totalPages ?? 1) : 1;

  return (
    <div>
      <Header onExport={exportToExcel} />

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search tasks..."
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {view === 'table' && (
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
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg text-sm"
        >
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="flex rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === 'table' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}
          >
            <FaList size={12} /> Table
          </button>
          <button
            onClick={() => setView('board')}
            className={`px-3 py-2 text-sm flex items-center gap-1.5 ${view === 'board' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400'}`}
          >
            <FaColumns size={12} /> Board
          </button>
        </div>
      </div>

      {view === 'table' && (
        <div className="mt-4">
          <BulkActionBar
            count={selectedIds.length}
            onApply={applyBulkChanges}
            onClear={() => setSelectedIds([])}
            applying={bulkUpdate.isPending}
          />
        </div>
      )}

      {isLoading && !hasData ? (
        <div className="mt-4">
          <SkeletonTable rows={TASKS_PER_PAGE} columns={7} />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-center">
          <p className="text-sm text-danger">Failed to load tasks. Please try again.</p>
        </div>
      ) : view === 'board' ? (
        <div className="mt-4">
          <TaskBoard tasks={boardQuery.data ?? []} />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 shadow-card rounded-card overflow-hidden mt-4">
          <TaskList
            tasks={currentPageTasks}
            handleDelete={handleDelete}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
          />
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
      <ConfirmModal show={showModal} onClose={closeModal} onConfirm={confirmDelete} />
    </div>
  );
};

export default TasksPage;
