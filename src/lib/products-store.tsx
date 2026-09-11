import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./products";
import {
  adminAddTag,
  adminDeleteProduct,
  adminRemoveTag,
  adminRenameTag,
  adminSaveProduct,
  adminSetActive,
} from "./admin.functions";

const CREDS_KEY = "bandittz-admin-creds-v1";

export function saveAdminCreds(user: string, password: string) {
  localStorage.setItem(CREDS_KEY, JSON.stringify({ user, password }));
}
export function clearAdminCreds() {
  localStorage.removeItem(CREDS_KEY);
}
export function getAdminCreds(): { user: string; password: string } {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { user: "", password: "" };
}

interface StoreContextValue {
  products: Product[];
  types: string[];
  hydrated: boolean;
  whatsappNumber: string;
  visibleProducts: Product[];
  refresh: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductActive: (id: string) => Promise<void>;
  addType: (t: string) => Promise<void>;
  renameType: (oldT: string, newT: string) => Promise<void>;
  removeType: (t: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("584129912415");

  const refresh = useCallback(async () => {
    const [prodRes, typeRes, settingsRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: true }),
      supabase.from("product_types").select("name").order("created_at", { ascending: true }),
      supabase.from("settings").select("key, value").eq("key", "whatsapp_number").maybeSingle(),
    ]);

    if (settingsRes.data?.value) setWhatsappNumber(settingsRes.data.value);

    if (prodRes.data) {
      setProducts(
        prodRes.data.map((row) => ({
          id: row.id,
          name: row.name,
          price: Number(row.price),
          image: row.image ?? "",
          images: (row as { images?: string[] }).images ?? [],
          type: row.type ?? "",
          tagline: row.tagline ?? "",
          description: row.description ?? "",
          usage: row.usage ?? "",
          stock: row.stock ?? 0,
          active: row.active !== false,
          related: row.related ?? [],
        })),
      );
    }
    if (typeRes.data) setTypes(typeRes.data.map((r) => r.name));
    setHydrated(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<StoreContextValue>(() => {
    const creds = () => getAdminCreds();
    const after = async () => {
      await refresh();
    };

    return {
      products,
      types,
      hydrated,
      whatsappNumber,
      visibleProducts: products.filter((p) => p.active !== false),
      refresh,
      getProduct: (id) => products.find((p) => p.id === id),
      saveProduct: async (p) => {
        await adminSaveProduct({ data: { ...creds(), product: p } });
        await after();
      },
      deleteProduct: async (id) => {
        await adminDeleteProduct({ data: { ...creds(), id } });
        await after();
      },
      toggleProductActive: async (id) => {
        const current = products.find((p) => p.id === id);
        await adminSetActive({
          data: { ...creds(), id, active: current?.active === false },
        });
        await after();
      },
      addType: async (t) => {
        await adminAddTag({ data: { ...creds(), kind: "type", name: t } });
        await after();
      },
      renameType: async (oldT, newT) => {
        await adminRenameTag({ data: { ...creds(), kind: "type", oldName: oldT, newName: newT } });
        await after();
      },
      removeType: async (t) => {
        await adminRemoveTag({ data: { ...creds(), kind: "type", name: t } });
        await after();
      },
    };
  }, [products, types, hydrated, whatsappNumber, refresh]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within ProductsProvider");
  return ctx;
}
