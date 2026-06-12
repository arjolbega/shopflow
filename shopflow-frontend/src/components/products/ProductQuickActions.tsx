import { Eye, ShoppingCart } from "lucide-react";
import { cn } from "../../utils/cn";

interface ProductQuickActionsProps {
  handleAddToCart: (e: React.MouseEvent) => void;
  isOutOfStock: boolean;
  isAdding: boolean;
}

const ProductQuickActions = ({ handleAddToCart, isOutOfStock, isAdding }: ProductQuickActionsProps) => {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-center gap-3", "bg-black/40 backdrop-blur-[2px]", "opacity-0 group-hover:opacity-100", "transition-opacity duration-300")}>
      <button onClick={handleAddToCart} disabled={isOutOfStock || isAdding} className={cn("flex items-center gap-2 px-4 py-2.5", "bg-accent text-bg-base rounded-xl", "text-sm font-semibold", "hover:bg-accent-hover transition-colors", "disabled:opacity-50 disabled:cursor-not-allowed", "cursor-pointer")}>
        <ShoppingCart size={15} />
        {isAdding ? "Adding..." : "Add to cart"}
      </button>

      <div className={cn("p-2.5 bg-bg-elevated rounded-xl", "text-text-secondary", "border border-border", "hover:text-text-primary transition-colors")}>
        <Eye size={16} />
      </div>
    </div>
  );
};

export default ProductQuickActions;
