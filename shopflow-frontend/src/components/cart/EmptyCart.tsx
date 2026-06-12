import { ArrowRight, ShoppingBag } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const EmptyCart = () => {
  const navigate = useNavigate();
  const { closeCart } = useCartStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <div className="w-16 h-16 bg-bg-elevated rounded-2xl flex items-center justify-center mb-4">
        <ShoppingBag size={24} className="text-text-muted" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">Your cart is empty</h3>
      <p className="text-sm text-text-muted mb-6 max-w-xs">Looks like you haven't added anything yet. Let's fix that.</p>
      <Button
        variant="accent"
        onClick={() => {
          closeCart();
          navigate("/products");
        }}
        rightIcon={<ArrowRight size={16} />}
      >
        Start Shopping
      </Button>
    </div>
  );
};

export default EmptyCart;
