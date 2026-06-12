import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderApi } from "../../api/order.api";
import type { ApiError, CartTotal, CheckoutStep } from "../../types";
import { useToast } from "../../hooks/useToast";
import axios from "axios";

const addressSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  notes: z.string().optional()
});

type AddressForm = z.infer<typeof addressSchema>;

interface CheckoutAddressStepProps {
  setClientSecret: React.Dispatch<React.SetStateAction<string>>;
  setOrderId: React.Dispatch<React.SetStateAction<number | null>>;
  setOrderTotals: React.Dispatch<React.SetStateAction<CartTotal>>;
  setStep: React.Dispatch<React.SetStateAction<CheckoutStep>>;
}

const CheckoutAddressStep = ({ setClientSecret, setOrderId, setOrderTotals, setStep }: CheckoutAddressStepProps) => {
  const toast = useToast();

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema)
  });

  const onAddressSubmit = async (data: AddressForm) => {
    setIsCreatingOrder(true);
    try {
      const { notes, ...shippingFields } = data;
      const result = await orderApi.create({
        shipping_address: shippingFields,
        notes: notes || undefined
      });
      console.log("checkout submit!");
      console.log("shippingFields", shippingFields);
      console.log("result", result);
      console.log("\n");

      setClientSecret(result.clientSecret);
      setOrderId(result.orderId);
      setOrderTotals({
        subtotal: result.subtotal,
        shippingCost: result.shippingCost,
        tax: result.tax,
        total: result.total
      });
      setStep("payment");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        toast.error(data?.error?.message || "Failed to create order");
      } else {
        toast.error("Failed to create order");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onAddressSubmit)} className="flex flex-col gap-6">
      <div className="bg-bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-base font-bold text-text-primary mb-5" style={{ fontFamily: "var(--font-display)" }}>
          Shipping Address
        </h3>

        <div className="flex flex-col gap-4">
          <Input label="Full name" placeholder="John Doe" error={errors.full_name?.message} autoComplete="name" {...register("full_name")} />

          <Input label="Address line 1" placeholder="123 Main Street" error={errors.line1?.message} autoComplete="address-line1" {...register("line1")} />

          <Input label="Address line 2 (optional)" placeholder="Apartment, suite, etc." autoComplete="address-line2" {...register("line2")} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="City" placeholder="New York" error={errors.city?.message} autoComplete="address-level2" {...register("city")} />
            <Input label="State / Province" placeholder="NY" error={errors.state?.message} autoComplete="address-level1" {...register("state")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Postal code" placeholder="10001" error={errors.postal_code?.message} autoComplete="postal-code" {...register("postal_code")} />
            <Input label="Country" placeholder="US" error={errors.country?.message} autoComplete="country" {...register("country")} />
          </div>

          <Input label="Order notes (optional)" placeholder="Special delivery instructions..." {...register("notes")} />
        </div>
      </div>

      <Button type="submit" variant="accent" fullWidth size="lg" isLoading={isCreatingOrder}>
        Continue to Payment
      </Button>
    </form>
  );
};

export default CheckoutAddressStep;
