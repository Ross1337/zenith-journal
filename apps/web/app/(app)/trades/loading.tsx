import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-4">
      <header className="mb-6">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>
      <Skeleton className="h-[200px]" />
      <Skeleton className="h-[300px]" />
    </div>
  );
}
