import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listCatalog } from "./catalog.functions";
import { toCategory, toProduct, type Category, type Product } from "@/data/products";

export const catalogQueryOptions = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => listCatalog(),
  staleTime: 60_000,
});

export type Catalog = { categories: Category[]; products: Product[] };

export function useCatalog(): Catalog {
  const { data } = useSuspenseQuery(catalogQueryOptions);
  return buildCatalog(data);
}

export function buildCatalog(data: Awaited<ReturnType<typeof listCatalog>>): Catalog {
  const categories = data.categories.map(toCategory);
  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const products = data.products.map((row) => toProduct(row, nameBySlug.get(row.category_slug) ?? row.category_slug));
  return { categories, products };
}
