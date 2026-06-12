import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useCartStore } from "../../store/cartStore";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useState } from "react";
import Button from "../ui/Button";
import { formatPrice } from "../../utils/formatPrice";
import type { CheckoutStep } from "../../types";

interface PaymentFormProps {
  orderId: number;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;

  setStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
}

const PaymentForm = ({ orderId, total, setStep }: PaymentFormProps) => {
  const navigate = useNavigate();

  const { clearCart } = useCartStore();

  const handlePaymentSuccess = (paidOrderId: number) => {
    clearCart();
    setStep("success");
    setTimeout(() => navigate(`/orders/${paidOrderId}`), 3000);
  };

  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setPaymentError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment=success`
      },
      redirect: "if_required"
    });

    if (error) {
      setPaymentError(error.message ?? "Payment failed");
      setIsProcessing(false);
    } else {
      toast.success("Payment successful! Order confirmed.");
      handlePaymentSuccess(orderId);
    }
  };

  return (
    <form onSubmit={handlePayment} className="flex flex-col gap-6">
      <div className="bg-bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-accent" />
          <h3 className="text-base font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
            Payment Details
          </h3>
        </div>

        {/* Stripe Payment Element */}
        <PaymentElement
          options={{
            layout: "tabs"
          }}
        />

        {paymentError && <div className="mt-4 px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{paymentError}</div>}
      </div>

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
        <ShieldCheck size={14} className="text-success" />
        <span>Secured by Stripe. Your card details are never stored.</span>
      </div>

      <Button type="submit" variant="accent" fullWidth size="lg" isLoading={isProcessing} disabled={!stripe || !elements}>
        Pay {formatPrice(total)}
      </Button>
    </form>
  );
};

export default PaymentForm;
