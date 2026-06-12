import { create } from "zustand";
import type { Cart } from "../types";

interface CartState {
  cart: Cart | null;
  isOpen: boolean; // cart drawer open/closed
  isLoading: boolean;

  setCart: (cart: Cart) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setLoading: (loading: boolean) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isOpen: false,
  isLoading: false,

  setCart: (cart) => set({ cart }),
  clearCart: () => set({ cart: null }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setLoading: (isLoading) => set({ isLoading })
}));
