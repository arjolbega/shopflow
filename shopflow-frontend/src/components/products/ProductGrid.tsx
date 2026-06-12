import type { Product } from "../../types";
import ProductCard from "./ProductCard";
import IsLoading from "./IsLoading";
import NoProducts from "./NoProducts";

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({ products, isLoading, skeletonCount = 8 }: ProductGridProps) {
  if (isLoading) {
    return <IsLoading skeletonCount={skeletonCount} />;
  }

  if (products.length === 0) {
    return <NoProducts />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
