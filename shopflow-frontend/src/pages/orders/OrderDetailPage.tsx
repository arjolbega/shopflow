import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, AlertTriangle } from "lucide-react";
import { orderApi } from "../../api/order.api";
import type { Order } from "../../types";
import { formatPrice } from "../../utils/formatPrice";
import { formatDateTime, timeAgo } from "../../utils/formatDate";
import { OrderStatusBadge } from "../../components/ui/Badge";
import { useToast } from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { cn } from "../../utils/cn";
import axios from "axios";
import type { ApiError } from "../../types";
import OrderTimeline from "../../components/orders/OrderTimeline";
import OrderDetailLoading from "../../components/orders/OrderDetailLoading";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import ResumePaymentForm from "../../components/orders/OrderDetail/ResumePaymentForm";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    if (paymentStatus === "success") {
      toast.success("Payment successful! Your order is confirmed.");
    }
  }, [toast, paymentStatus]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);

    orderApi
      .getById(parseInt(id))
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) navigate("/orders");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await orderApi.cancel(order.id);
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : null));
      toast.success("Order cancelled successfully");
      setIsCancelOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiError;
        toast.error(data?.error?.message || "Failed to cancel order");
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleResumePayment = async () => {
    if (!order) return;
    setIsLoadingPayment(true);
    try {
      // Get client secret for existing payment intent
      const result = await orderApi.getPaymentIntent(order.id);
      setClientSecret(result.clientSecret);
      setIsPaymentOpen(true);
    } catch {
      toast.error("Failed to load payment — please contact support");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  if (isLoading) {
    return <OrderDetailLoading />;
  }

  if (!order) return null;

  const canCancel = ["pending", "processing"].includes(order.status);
  const address = order.shipping_address;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-subtle transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                Order #{order.id}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-text-muted">
              Placed {formatDateTime(order.created_at)} · {timeAgo(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          {canCancel && (
            <Button variant="danger" size="sm" onClick={() => setIsCancelOpen(true)}>
              Cancel Order
            </Button>
          )}

          {order.status === "pending" && order.stripe_payment_id && (
            <Button variant="accent" size="sm" isLoading={isLoadingPayment} onClick={handleResumePayment}>
              Complete Payment
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Timeline */}
        <div className="bg-bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6">Order Status</h3>
          <OrderTimeline status={order.status} />
        </div>

        {/* Items */}
        <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-bold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
              Items Ordered
            </h3>
          </div>

          <div className="divide-y divide-border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-bg-elevated border border-border flex-shrink-0">{item.product_image ? <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl opacity-30">📦</div>}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{item.product_name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {formatPrice(item.price)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-text-primary flex-shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-border bg-bg-elevated/50 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Subtotal</span>
              <span className="text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Shipping</span>
              <span className={parseFloat(order.shipping_cost) === 0 ? "text-success text-sm" : "text-text-primary text-sm"} style={{ fontFamily: "var(--font-mono)" }}>
                {parseFloat(order.shipping_cost) === 0 ? "Free" : formatPrice(order.shipping_cost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Tax</span>
              <span className="text-text-primary" style={{ fontFamily: "var(--font-mono)" }}>
                {formatPrice(order.tax)}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="font-bold text-text-primary">Total</span>
              <span className="font-bold text-xl text-accent" style={{ fontFamily: "var(--font-mono)" }}>
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text-primary">Shipping Address</h3>
            </div>
            <div className="text-sm text-text-secondary leading-relaxed">
              <p className="font-medium text-text-primary">{address.full_name}</p>
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-accent" />
              <h3 className="text-sm font-bold text-text-primary">Payment</h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", order.status === "cancelled" || order.status === "refunded" ? "bg-error" : "bg-success")} />
                <p className="text-sm text-text-secondary capitalize">{order.status === "cancelled" ? "Refunded" : order.status === "pending" ? "Awaiting payment" : "Paid"}</p>
              </div>
              {order.stripe_payment_id && <p className="text-xs text-text-muted font-mono break-all">{order.stripe_payment_id}</p>}
            </div>
          </div>
        </div>

        {order.notes && (
          <div className="bg-bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-warning" />
              <h3 className="text-sm font-bold text-text-primary">Order Notes</h3>
            </div>
            <p className="text-sm text-text-secondary">{order.notes}</p>
          </div>
        )}
      </div>

      <Modal isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel Order" size="sm">
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to cancel <span className="text-text-primary font-medium">Order #{order.id}</span>?{order.status === "processing" && <span className="block mt-2 text-accent">Since payment has been processed, a refund will be issued.</span>}
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" fullWidth onClick={() => setIsCancelOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" fullWidth isLoading={isCancelling} onClick={handleCancel}>
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resume Payment Modal */}
      {clientSecret && (
        <Modal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} title="Complete Your Payment" size="md">
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
                  fontFamily: "DM Sans, sans-serif",
                  borderRadius: "10px"
                }
              }
            }}
          >
            <ResumePaymentForm
              orderId={order.id}
              total={order.total}
              onSuccess={() => {
                setIsPaymentOpen(false);
                setOrder((prev) => (prev ? { ...prev, status: "processing" } : null));
                toast.success("Payment successful! Order confirmed.");
              }}
            />
          </Elements>
        </Modal>
      )}
    </div>
  );
}
