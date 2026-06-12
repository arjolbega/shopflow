import { useEffect, useState } from "react";
import { productApi } from "../../api/product.api";
import { categoryApi } from "../../api/category.api";
import type { Product, Category } from "../../types";
import HeroSection from "../../components/home/HeroSection";
import FeaturesSection from "../../components/home/FeaturesSection";
import CategorySection from "../../components/home/CategorySection";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";
import NewArrivalsSection from "../../components/home/NewArrivalsSection";
import CtaBannerSection from "../../components/home/CtaBannerSection";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.getAll({ featured: true, limit: 4 }), productApi.getAll({ sortBy: "created_at", order: "desc", limit: 8 }), categoryApi.getAll()])
      .then(([featured, newest, cats]) => {
        setFeaturedProducts(featured.data);
        setNewArrivals(newest.data);
        setCategories(cats.slice(0, 6));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <HeroSection />

      <FeaturesSection />

      {categories.length > 0 && <CategorySection categories={categories} />}

      {(isLoading || featuredProducts.length > 0) && <FeaturedProductsSection featuredProducts={featuredProducts} isLoading={isLoading} />}

      <NewArrivalsSection newArrivals={newArrivals} isLoading={isLoading} />

      <CtaBannerSection />
    </div>
  );
}
