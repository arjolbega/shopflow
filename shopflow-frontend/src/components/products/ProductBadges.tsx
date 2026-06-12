import { formatDiscount } from "../../utils/formatPrice";
import { priceToString } from "../../utils/helpers";
import Badge from "../ui/Badge";

interface ProductBadgesProps {
  isOnSale: boolean | 0 | null;
  is_featured: boolean;
  isOutOfStock: boolean;
  price: number;
  compare_price: number | null;
}

const ProductBadges = ({ isOnSale, is_featured, isOutOfStock, price, compare_price }: ProductBadgesProps) => {
  const discount = isOnSale ? formatDiscount(parseFloat(priceToString(compare_price!)), parseFloat(priceToString(price))) : 0;

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
      {!!isOnSale && <Badge variant="error">-{discount}%</Badge>}
      {!!is_featured && <Badge variant="accent">Featured</Badge>}
      {!!isOutOfStock && <Badge variant="muted">Out of stock</Badge>}
    </div>
  );
};

export default ProductBadges;
