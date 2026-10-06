import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugSchema = z.string().min(1).max(120);

export const getMyCart = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cart_items")
      .select("qty, products!inner(slug)")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
      slug: (r.products as unknown as { slug: string }).slug,
      qty: r.qty,
    }));
  });

export const getMyWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wishlist_items")
      .select("products!inner(slug)")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => (r.products as unknown as { slug: string }).slug);
  });

/** Replaces the stored cart with the given lines (server-side source of truth per user). */
export const saveMyCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ lines: z.array(z.object({ slug: slugSchema, qty: z.number().int().min(1).max(999) })).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const slugs = data.lines.map((l) => l.slug);

    const del = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (del.error) throw new Error(del.error.message);
    if (slugs.length === 0) return { ok: true };

    const { data: prods, error } = await supabase.from("products").select("id, slug").in("slug", slugs);
    if (error) throw new Error(error.message);
    const idBySlug = new Map((prods ?? []).map((p) => [p.slug, p.id]));

    const rows = data.lines
      .filter((l) => idBySlug.has(l.slug))
      .map((l) => ({ user_id: userId, product_id: idBySlug.get(l.slug)!, qty: l.qty }));
    if (rows.length > 0) {
      const ins = await supabase.from("cart_items").insert(rows);
      if (ins.error) throw new Error(ins.error.message);
    }
    return { ok: true };
  });

export const saveMyWishlist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ slugs: z.array(slugSchema).max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const del = await supabase.from("wishlist_items").delete().eq("user_id", userId);
    if (del.error) throw new Error(del.error.message);
    if (data.slugs.length === 0) return { ok: true };

    const { data: prods, error } = await supabase.from("products").select("id, slug").in("slug", data.slugs);
    if (error) throw new Error(error.message);
    const rows = (prods ?? []).map((p) => ({ user_id: userId, product_id: p.id }));
    if (rows.length > 0) {
      const ins = await supabase.from("wishlist_items").insert(rows);
      if (ins.error) throw new Error(ins.error.message);
    }
    return { ok: true };
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_no, created_at, status, subtotal, shipping, total, customer_name, address, city, pin, payment_method, order_items(product_name, product_slug, qty, price)",
      )
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email().max(200).or(z.literal("")),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(120),
  pin: z.string().trim().regex(/^[0-9]{6}$/, "Enter a valid 6 digit PIN"),
  payment_method: z.enum(["cod", "upi", "card", "net"]),
  items: z.array(z.object({ slug: slugSchema, qty: z.number().int().min(1).max(999) })).min(1).max(100),
});

export const placeOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.rpc("place_order", {
      _customer_name: data.name,
      _phone: data.phone,
      _email: data.email,
      _address: data.address,
      _city: data.city,
      _pin: data.pin,
      _payment_method: data.payment_method,
      _items: data.items,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row) throw new Error("Order could not be created");
    return row as { order_id: string; order_no: string; total: number };
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, phone, address, city, pin")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(120),
        phone: z.string().trim().max(15).optional().default(""),
        address: z.string().trim().max(500).optional().default(""),
        city: z.string().trim().max(120).optional().default(""),
        pin: z.string().trim().max(6).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const isAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return Boolean(data);
  });
