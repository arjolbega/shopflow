import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import type { CartTotal, CheckoutStep } from "../../types";
import { ArrowLeft } from "lucide-react";
import PaymentForm from "./PaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutPaymentStepProps {
  orderId: number | null;
  setStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
  clientSecret: string;
  orderTotals: CartTotal;
}

const CheckoutPaymentStep = ({ orderId, setStep, clientSecret, orderTotals }: CheckoutPaymentStepProps) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#f59e0b",
            colorBackground: "#332e26",
            colorText: "#f5f0e8",
            colorDanger: "#f87171",
            fontFamily: "var(--font-family)",
            borderRadius: "10px"
          }
        }
      }}
    >
      <div className="flex flex-col gap-4">
        <button onClick={() => setStep("address")} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer w-fit">
          <ArrowLeft size={14} />
          Edit shipping address
        </button>

        <PaymentForm orderId={orderId!} setStep={setStep} {...orderTotals} />
      </div>
    </Elements>
  );
};

export default CheckoutPaymentStep;
