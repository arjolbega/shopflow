import { PackageX } from "lucide-react";

const NoProducts = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 bg-bg-elevated rounded-2xl flex items-center justify-center mb-4">
      <PackageX size={28} className="text-text-muted" />
    </div>
    <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
    <p className="text-sm text-text-muted max-w-xs">Try adjusting your filters or search query to find what you're looking for.</p>
  </div>
);

export default NoProducts;
