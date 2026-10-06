import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCatalog } from "./catalog";
import { useAuth } from "@/hooks/useAuth";
import { getMyCart, getMyWishlist, saveMyCart, saveMyWishlist } from "./account.functions";
import type { Product } from "@/data/products";

export type CartLine = { slug: string; qty: number };

type StoreValue = {
  cart: CartLine[];
  wishlist: string[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  toggleWish: (slug: string) => void;
  cartCount: number;
  cartLines: { product: Product; qty: number }[];
  subtotal: number;
  products: Product[];
};

const StoreContext = createContext<StoreValue | null>(null);

function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { products } = useCatalog();
  const { user } = useAuth();
  const [cart, setCart, cartReady] = useLocal<CartLine[]>("sbe.cart", []);
  const [wishlist, setWishlist, wishReady] = useLocal<string[]>("sbe.wishlist", []);
  const mergedFor = useRef<string | null>(null);
  const [synced, setSynced] = useState(false);

  // On sign-in: merge the guest cart/wishlist with the account's stored data.
  useEffect(() => {
    if (!user || !cartReady || !wishReady) return;
    if (mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    let active = true;

    (async () => {
      try {
        const [dbCart, dbWish] = await Promise.all([getMyCart(), getMyWishlist()]);
        if (!active) return;
        setCart((local) => {
          const map = new Map(dbCart.map((l) => [l.slug, l.qty]));
          for (const line of local) map.set(line.slug, Math.max(map.get(line.slug) ?? 0, line.qty));
          return [...map.entries()].map(([slug, qty]) => ({ slug, qty }));
        });
        setWishlist((local) => [...new Set([...dbWish, ...local])]);
      } catch {
        /* offline or not yet authorised — keep local data */
      } finally {
        if (active) setSynced(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, cartReady, wishReady, setCart, setWishlist]);

  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      setSynced(false);
    }
  }, [user]);

  // Persist to the account whenever the cart/wishlist changes.
  useEffect(() => {
    if (!user || !synced) return;
    const timer = setTimeout(() => {
      void saveMyCart({ data: { lines: cart } }).catch(() => undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [cart, user, synced]);

  useEffect(() => {
    if (!user || !synced) return;
    const timer = setTimeout(() => {
      void saveMyWishlist({ data: { slugs: wishlist } }).catch(() => undefined);
    }, 400);
    return () => clearTimeout(timer);
  }, [wishlist, user, synced]);

  const value = useMemo<StoreValue>(() => {
    const cartLines = cart
      .map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        return product ? { product, qty: l.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);

    return {
      cart,
      wishlist,
      products,
      cartLines,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      subtotal: cartLines.reduce((s, l) => s + l.product.price * l.qty, 0),
      add: (slug, qty = 1) =>
        setCart((c) =>
          c.some((l) => l.slug === slug)
            ? c.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l))
            : [...c, { slug, qty }],
        ),
      setQty: (slug, qty) =>
        setCart((c) =>
          qty <= 0 ? c.filter((l) => l.slug !== slug) : c.map((l) => (l.slug === slug ? { ...l, qty } : l)),
        ),
      remove: (slug) => setCart((c) => c.filter((l) => l.slug !== slug)),
      clear: () => setCart([]),
      toggleWish: (slug) => setWishlist((w) => (w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug])),
    };
  }, [cart, wishlist, products, setCart, setWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
