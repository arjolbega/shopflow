import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import { formatPrice } from "../../../utils/formatPrice";
import Button from "../../ui/Button";

const ResumePaymentForm = ({ orderId, total, onSuccess }: { orderId: number; total: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError("");

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment=success`
      },
      redirect: "if_required"
    });

    if (error) {
      setError(error.message ?? "Payment failed");
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="px-4 py-3 bg-bg-elevated border border-border rounded-xl">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Amount due</span>
          <span className="font-bold text-accent" style={{ fontFamily: "var(--font-mono)" }}>
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <PaymentElement options={{ layout: "tabs" }} />

      {error && <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm">{error}</div>}

      <Button type="submit" variant="accent" fullWidth isLoading={isProcessing} disabled={!stripe || !elements}>
        Pay {formatPrice(total)}
      </Button>
    </form>
  );
};

export default ResumePaymentForm;
