'use client';

import { useState } from 'react';
import { TaskPriority, TaskStatus } from '../../services/taskService';

interface BulkActionBarProps {
  count: number;
  onApply: (changes: { status?: TaskStatus; priority?: TaskPriority }) => void;
  onClear: () => void;
  applying?: boolean;
}

export default function BulkActionBar({ count, onApply, onClear, applying }: BulkActionBarProps) {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  if (count === 0) return null;

  const handleApply = () => {
    const changes: { status?: TaskStatus; priority?: TaskPriority } = {};
    if (status) changes.status = status as TaskStatus;
    if (priority) changes.priority = priority as TaskPriority;
    if (Object.keys(changes).length === 0) return;
    onApply(changes);
    setStatus('');
    setPriority('');
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 rounded-lg px-4 py-3 mb-3">
      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
        {count} task{count > 1 ? 's' : ''} selected
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-2 py-1.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 rounded-lg text-sm"
      >
        <option value="">Set status...</option>
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="DONE">Done</option>
      </select>
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="px-2 py-1.5 border border-gray-200 dark:border-slate-600 dark:bg-slate-900 dark:text-gray-100 rounded-lg text-sm"
      >
        <option value="">Set priority...</option>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <button
        onClick={handleApply}
        disabled={applying || (!status && !priority)}
        className="bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        {applying ? 'Applying...' : 'Apply'}
      </button>
      <button
        onClick={onClear}
        className="text-sm text-gray-500 dark:text-gray-400 hover:underline ml-auto"
      >
        Clear selection
      </button>
    </div>
  );
}
