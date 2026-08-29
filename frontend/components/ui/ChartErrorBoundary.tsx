'use client';

import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

function ChartFallback({ error }: FallbackProps) {
  const message = error instanceof Error ? error.message : undefined;
  return (
    <div className="flex items-center justify-center h-40 text-sm text-gray-400 dark:text-gray-500 text-center px-4">
      Couldn&apos;t render this chart{message ? `: ${message}` : '.'}
    </div>
  );
}

/**
 * Isolates a single chart/widget so a rendering error in it (e.g.
 * recharts choking on malformed data) doesn't take down the rest of the
 * dashboard — a component-level error boundary, distinct from the
 * route-level ones in error.tsx.
 */
export default function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ChartFallback}>{children}</ErrorBoundary>;
}
