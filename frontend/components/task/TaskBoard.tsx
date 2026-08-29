'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Task, TaskStatus } from '../../services/taskService';
import { useUpdateTask } from '../../hooks/useTasks';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'IN_REVIEW', label: 'In Review' },
  { status: 'DONE', label: 'Done' },
];

function TaskCard({ task }: { task: Task }) {
  // Note: no `transform` is applied here — DragOverlay (below) is solely
  // responsible for the piece that visually follows the pointer. Also
  // translating this source node would shift its measured rect during the
  // drag and throw off dnd-kit's collision detection against the columns.
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-card p-3 mb-2 cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-50 z-10' : ''
      }`}
    >
      <Link
        href={`/tasks/${task.id}`}
        onClick={(e) => isDragging && e.preventDefault()}
        className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary line-clamp-2"
      >
        {task.title}
      </Link>
      <div className="flex items-center justify-between mt-2">
        <Badge variant={task.priority === 'HIGH' ? 'danger' : task.priority === 'MEDIUM' ? 'warning' : 'success'}>
          {task.priority}
        </Badge>
        {task.assignee && (
          <Avatar name={task.assignee.fullName} avatarUrl={task.assignee.avatarUrl} size="sm" />
        )}
      </div>
      {task.dueDate && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Due {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function BoardColumn({
  status,
  label,
  tasks,
}: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[260px] bg-surface dark:bg-slate-900 rounded-card p-3 border-2 transition-colors ${
        isOver ? 'border-primary' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">{tasks.length}</span>
      </div>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default function TaskBoard({ tasks }: { tasks: Task[] }) {
  const updateTask = useUpdateTask();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    const newStatus = over.id as TaskStatus;
    if (!task || task.status === newStatus) return;
    updateTask.mutate({ id: task.id, input: { status: newStatus } });
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <BoardColumn key={col.status} status={col.status} label={col.label} tasks={byStatus(col.status)} />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}
