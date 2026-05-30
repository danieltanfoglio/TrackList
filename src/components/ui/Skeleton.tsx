import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse rounded-lg bg-white/5 border border-white/5', className)}
      aria-hidden="true"
    />
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="flex flex-col glass-morphism overflow-hidden">
      <div className="relative aspect-[2/3] bg-white/5" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function MediaDetailSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <div className="relative w-full h-[60vh] md:h-[70vh] bg-white/5 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col gap-12">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <MediaCardSkeleton key={i} />)}
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function BrowseGridSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-12">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => <MediaCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
