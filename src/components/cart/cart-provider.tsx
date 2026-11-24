"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { addLine, clearCart, EMPTY_CART, removeLine, setPacks, type CartLine } from "@/lib/cart";
import { editCart, getCartSnapshot, subscribeToCart } from "@/lib/cart/storage";

const actions = {
  add: (line: CartLine): boolean => editCart((lines) => addLine(lines, line)),
  setPacks: (line: CartLine, packs: number) => editCart((lines) => setPacks(lines, line, packs)),
  remove: (line: CartLine) => editCart((lines) => removeLine(lines, line)),
  clear: () => editCart(clearCart),
};

type CartContextValue = typeof actions & { lines: readonly CartLine[]; totalLines: number };
const CartContext = createContext<CartContextValue | null>(null);
const getServerSnapshot = () => EMPTY_CART;

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerSnapshot);
  return <CartContext.Provider value={{ ...actions, lines, totalLines: lines.length }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("CartProvider is required");
  return cart;
}
