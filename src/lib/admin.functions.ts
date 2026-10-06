import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: { rpc: Function }; userId: string }) {
  const { data, error } = await (context.supabase.rpc as any)("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

const productSchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
  name: z.string().trim().min(2).max(200),
  category_slug: z.string().trim().min(2).max(120),
  price: z.number().int().min(1).max(10_000_000),
  mrp: z.number().int().min(0).max(10_000_000),
  stock: z.number().int().min(0).max(1_000_000),
  brand: z.string().trim().max(120).default("Balaji Prime"),
  finish: z.string().trim().max(120).default("Satin SS"),
  material: z.string().trim().max(160).default("Stainless Steel 304"),
  unit: z.string().trim().max(60).default("Piece"),
  description: z.string().trim().max(2000).default(""),
  image_url: z.string().trim().url().max(600).or(z.literal("")).default(""),
  is_active: z.boolean().default(true),
});

const categorySchema = z.object({
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(160),
  tagline: z.string().trim().max(300).default(""),
  image_url: z.string().trim().url().max(600).or(z.literal("")).default(""),
  sort_order: z.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
});

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("id, slug, name, category_slug, price, mrp, stock, image_url, image_key, is_active")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), values: productSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const values = { ...data.values, image_url: data.values.image_url || null };

    if (data.id) {
      const { error } = await context.supabase.from("products").update(values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: data.id };
    }
    const { data: row, error } = await context.supabase.from("products").insert(values).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Soft delete keeps historical order items intact.
    const { error } = await context.supabase.from("products").update({ is_active: false }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("categories")
      .select("id, slug, name, tagline, image_url, sort_order, is_active")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminSaveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), values: categorySchema }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const values = { ...data.values, image_url: data.values.image_url || null };
    if (data.id) {
      const { error } = await context.supabase.from("categories").update(values).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await context.supabase.from("categories").insert(values);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_no, user_id, created_at, status, total, customer_name, phone, email, address, city, pin, payment_method, order_items(product_name, qty, price)",
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["placed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("enquiries")
      .select("id, kind, name, phone, email, company, subject, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpdateEnquiryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["new", "in_progress", "closed"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("enquiries").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** One-time bootstrap: the first signed-in user can claim admin while no admin exists. */
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await (context.supabase.rpc as any)("claim_first_admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Whether the signed-in user is an admin, plus whether any admin exists yet. */
export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase.rpc as any)("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    const exists = await (context.supabase.rpc as any)("admin_exists");
    return { isAdmin: Boolean(data), adminExists: Boolean(exists.data) };
  });

/** Dashboard counters for the admin overview. */
export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [products, orders, enquiries, lowStock, revenue] = await Promise.all([
      context.supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      context.supabase.from("orders").select("id", { count: "exact", head: true }),
      context.supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      context.supabase.from("products").select("id", { count: "exact", head: true }).lt("stock", 10),
      context.supabase.from("orders").select("total"),
    ]);
    const total = (revenue.data ?? []).reduce((s: number, r: { total: number | string }) => s + Number(r.total), 0);
    return {
      products: products.count ?? 0,
      orders: orders.count ?? 0,
      newEnquiries: enquiries.count ?? 0,
      lowStock: lowStock.count ?? 0,
      revenue: total,
    };
  });

/** Quick inline stock update from the products table. */
export const adminUpdateStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), stock: z.number().int().min(0).max(1_000_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").update({ stock: data.stock }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("categories").update({ is_active: false }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** All customers with verification + activity summary (admin only, checked in the DB function). */
export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await (context.supabase.rpc as any)("admin_list_users");
    if (error) throw new Error(error.message);
    return (data ?? []) as Array<{
      id: string; email: string | null; full_name: string | null; phone: string | null; city: string | null;
      created_at: string; last_sign_in_at: string | null; email_confirmed_at: string | null;
      is_admin: boolean; orders_count: number; orders_total: number; cart_count: number;
    }>;
  });

export const adminGetUserDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const [orders, cart, wish] = await Promise.all([
      context.supabase.from("orders")
        .select("id, order_no, created_at, status, total, payment_method, order_items(product_name, qty, price)")
        .eq("user_id", data.id).order("created_at", { ascending: false }),
      context.supabase.from("cart_items")
        .select("id, qty, product_id, products(name, slug, price, stock)").eq("user_id", data.id),
      context.supabase.from("wishlist_items").select("id, products(name, slug, price)").eq("user_id", data.id),
    ]);
    for (const r of [orders, cart, wish]) if (r.error) throw new Error(r.error.message);
    return { orders: orders.data ?? [], cart: cart.data ?? [], wishlist: wish.data ?? [] };
  });

export const adminUpdateCartItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), qty: z.number().int().min(0).max(10_000) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const q = data.qty === 0
      ? context.supabase.from("cart_items").delete().eq("id", data.id)
      : context.supabase.from("cart_items").update({ qty: data.qty }).eq("id", data.id);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
