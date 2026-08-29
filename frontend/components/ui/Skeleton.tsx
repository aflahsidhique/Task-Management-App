interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-slate-700 ${className}`} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 1,
  className = '',
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`bg-white dark:bg-slate-800 rounded-card shadow-card p-5 space-y-4 ${className}`}
  >
    <Skeleton className="h-5 w-1/3" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-card shadow-card p-5">
    <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-2/3" />
      ))}
    </div>
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
