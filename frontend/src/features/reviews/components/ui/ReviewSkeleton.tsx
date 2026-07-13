export function ReviewSkeleton() {
  return (
    <div className="kb-enterprise-card relative flex h-full min-h-96 flex-col overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--surface-primary)] p-10 border border-gray-100 shadow-sm animate-pulse">
      {/* Header Skeleton */}
      <header className="mb-6 flex items-start justify-between relative z-10">
        <div className="w-12 h-12 bg-gray-200 rounded-lg opacity-50" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded-sm opacity-50" />
          ))}
        </div>
      </header>

      {/* Body Skeleton */}
      <div className="relative z-10 flex-grow mt-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-full opacity-50" />
        <div className="h-4 bg-gray-200 rounded w-11/12 opacity-50" />
        <div className="h-4 bg-gray-200 rounded w-full opacity-50" />
        <div className="h-4 bg-gray-200 rounded w-4/5 opacity-50" />
      </div>

      {/* Separator */}
      <hr className="my-8 border-t border-gray-100" />

      {/* Footer Skeleton */}
      <footer className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 bg-gray-200 rounded-full opacity-50" />
        <div className="flex flex-col gap-2 flex-grow">
          <div className="h-5 bg-gray-200 rounded w-1/2 opacity-50" />
          <div className="h-4 bg-gray-200 rounded w-1/3 opacity-50" />
        </div>
      </footer>
    </div>
  );
}
