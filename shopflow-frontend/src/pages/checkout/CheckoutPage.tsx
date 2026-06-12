import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import OrderSummary from "../../components/checkout/OrderSummary";
import CheckoutHeader from "../../components/checkout/CheckoutHeader";
import { WRAPPER_STYLES } from "../../utils/constants";
import { calculateTotals } from "../../utils/helpers";
import CheckoutAddressStep from "../../components/checkout/CheckoutAddressStep";
import type { CheckoutStep } from "../../types";
import CheckoutPaymentStep from "../../components/checkout/CheckoutPaymentStep";
import CheckoutSuccessStep from "../../components/checkout/CheckoutSuccessStep";

export default function CheckoutPage() {
  const navigate = useNavigate();

  const { cart } = useCartStore();
  console.log("cart", cart);
  console.log("\n");
  const { subtotal, shippingCost, tax, total } = calculateTotals(cart);

  const [step, setStep] = useState<CheckoutStep>("address");
  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderTotals, setOrderTotals] = useState({
    subtotal,
    shippingCost,
    tax,
    total
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      navigate("/products");
    }
  }, [cart, navigate]);

  // ── Success State ──────────────────────────────────
  if (step === "success") {
    return <CheckoutSuccessStep />;
  }

  return (
    <div className={`${WRAPPER_STYLES} max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10`}>
      <CheckoutHeader step={step} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Form ── */}
        <div className="lg:col-span-3">
          {/* Step 1 — Address */}
          {step === "address" && <CheckoutAddressStep setClientSecret={setClientSecret} setOrderId={setOrderId} setOrderTotals={setOrderTotals} setStep={setStep} />}

          {/* Step 2 — Payment */}
          {step === "payment" && clientSecret && <CheckoutPaymentStep orderId={orderId} clientSecret={clientSecret} setStep={setStep} orderTotals={orderTotals} />}
        </div>

        {/* ── Right: Summary ── */}
        <div className="lg:col-span-2">
          <OrderSummary {...orderTotals} />
        </div>
      </div>
    </div>
  );
}
