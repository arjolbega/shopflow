import { ProductCardSkeleton } from "../ui/Skeleton";

interface IsLoadingProps {
  skeletonCount: number;
}

const IsLoading = ({ skeletonCount }: IsLoadingProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: skeletonCount }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export default IsLoading;
