import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useStore } from "./products-store";
import type { Product } from "./products";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  detailedItems: Array<CartItem & { product: Product }>;
  count: number;
  total: number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bandittz-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useStore();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const detailedItems = items
      .map((i) => {
        const product = products.find((p) => p.id === i.productId);
        return product ? { ...i, product } : null;
      })
      .filter((v): v is CartItem & { product: Product } => v !== null);

    const count = detailedItems.reduce((sum, i) => sum + i.quantity, 0);
    const total = detailedItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

    return {
      items,
      detailedItems,
      count,
      total,
      add: (productId) => {
        setItems((prev) => {
          const product = products.find((p) => p.id === productId);
          if (!product || product.stock <= 0 || product.active === false) return prev;
          const existing = prev.find((i) => i.productId === productId);
          if (existing) {
            if (existing.quantity >= product.stock) return prev;
            return prev.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i,
            );
          }
          return [...prev, { productId, quantity: 1 }];
        });
      },
      remove: (productId) => {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      },
      setQuantity: (productId, quantity) => {
        setItems((prev) => {
          if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
          const product = products.find((p) => p.id === productId);
          const capped = product ? Math.min(quantity, product.stock) : quantity;
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity: capped } : i,
          );
        });
      },
      clear: () => setItems([]),
    };
  }, [items, products]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
