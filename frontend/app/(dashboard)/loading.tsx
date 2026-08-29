import { SkeletonCard, SkeletonTable, Skeleton } from '../../components/ui/Skeleton';

/**
 * Shown by Next.js while a dashboard route segment's page module is being
 * loaded/mounted during navigation (App Router wraps each layout's
 * children in a Suspense boundary automatically) — a generic shape that
 * reads reasonably for most pages, since it can't know which one is
 * loading yet.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <SkeletonTable rows={6} columns={5} />
    </div>
  );
}
