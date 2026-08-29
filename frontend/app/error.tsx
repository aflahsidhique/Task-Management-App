'use client';

import { useEffect } from 'react';

export default function RootError({
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface dark:bg-slate-900 text-center px-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-600"
      >
        Try again
      </button>
    </div>
  );
}
