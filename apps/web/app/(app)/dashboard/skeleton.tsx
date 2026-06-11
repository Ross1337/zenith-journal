import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[104px]" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Skeleton className="h-[340px] xl:col-span-3" />
        <Skeleton className="h-[340px] xl:col-span-2" />
      </div>
    </>
  );
}
