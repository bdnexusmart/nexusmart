import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { cartService } from "../services";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== "customer") {
      setCart({ items: [] });
      return;
    }
    try {
      const { data } = await cartService.get();
      setCart(data.cart);
    } catch {
      setCart({ items: [] });
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, itemCount, refreshCart }}>{children}</CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
