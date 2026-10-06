import { createServerFn } from "@tanstack/react-start";
import { createPublicServerClient } from "./supabase-public.server";
import type { CategoryRow, ProductRow } from "@/data/products";

export const listCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicServerClient();

  const [cats, prods] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, tagline, image_key, image_url, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(
        "id, slug, name, category_slug, price, mrp, rating, reviews, image_key, image_url, brand, finish, material, unit, stock, highlights, description",
      )
      .order("created_at", { ascending: true }),
  ]);

  if (cats.error) throw new Error(cats.error.message);
  if (prods.error) throw new Error(prods.error.message);

  return {
    categories: (cats.data ?? []) as CategoryRow[],
    products: (prods.data ?? []) as ProductRow[],
  };
});
