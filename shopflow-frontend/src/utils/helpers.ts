import type { Cart, CartTotal } from "../types";
import { SHIPPING_COST, SHIPPING_THRESHOLD, TAX_RATE } from "./constants";

export const priceToString = (price: number) => price.toString();

export const restOverflow = () => (document.body.style.overflow = "");

export const calculateTotals = (cart: Cart | null): CartTotal => {
  const subtotal = cart?.subtotal ?? 0;
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = parseFloat(((subtotal + shippingCost) * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));
  return { subtotal, shippingCost, tax, total };
};
