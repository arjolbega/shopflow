import { Skeleton } from "../../ui/Skeleton";

const LoadingStats = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-36 rounded-2xl" />
    ))}
  </div>
);

export default LoadingStats;
