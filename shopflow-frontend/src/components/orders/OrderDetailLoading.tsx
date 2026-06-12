import { Skeleton } from "../ui/Skeleton";

const OrderDetailLoading = () => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="flex items-center gap-4 mb-8">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="flex flex-col gap-4">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
    </div>
  </div>
);

export default OrderDetailLoading;
