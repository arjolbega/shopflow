import { GetCart } from "../types";

export const verifyEmailUrl = (rawToken: string) => `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

export const isCartEmpty = (cartItems: GetCart[]) => cartItems.length === 0;

export const productStockIsLessThanCartQuantity = (item: GetCart) => item.stock < item.quantity;

export const formatPrice = (price: string): number => {
  return parseFloat(price);
};
