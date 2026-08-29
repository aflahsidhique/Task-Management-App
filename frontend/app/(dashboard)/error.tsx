'use client';

import { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '../../components/ui/Button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 gap-4">
      <div className="h-14 w-14 rounded-full bg-danger-bg text-danger flex items-center justify-center">
        <FaExclamationTriangle size={22} />
      </div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <div className="w-40">
        <Button text="Try again" onClick={reset} />
      </div>
    </div>
  );
}
