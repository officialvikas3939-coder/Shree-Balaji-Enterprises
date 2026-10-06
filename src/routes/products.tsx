import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/PageHeader";

type Search = { q?: string; category?: string; sort?: string };

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search["q"] === "string" ? search["q"] : "",
    category: typeof search["category"] === "string" ? search["category"] : "all",
    sort: typeof search["sort"] === "string" ? search["sort"] : "featured",
  }),
  head: () => ({
    meta: [
      { title: "All Hardware Products — Shree Balaji Enterprises" },
      {
        name: "description",
        content:
          "Browse 100+ hardware products: SS handles, all types of hinges, door closers, curtain holders, locks, channels and more.",
      },
      { property: "og:title", content: "All Hardware Products — Shree Balaji Enterprises" },
      { property: "og:description", content: "100+ stainless steel hardware items with live prices and dealer rates." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { categories, products } = useCatalog();
  const search = Route.useSearch();
  const q = search.q ?? "";
  const category = search.category ?? "all";
  const sort = search.sort ?? "featured";
  const navigate = useNavigate({ from: "/products" });

  const list = useMemo(() => {
    let out = products.filter((p) => (category === "all" ? true : p.category === category));
    if (q.trim()) {
      const needle = q.toLowerCase();
      out = out.filter((p) => `${p.name} ${p.categoryName} ${p.brand} ${p.finish}`.toLowerCase().includes(needle));
    }
    if (sort === "low") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "high") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "rating") out = [...out].sort((a, b) => b.rating - a.rating);
    return out;
  }, [q, category, sort]);

  return (
    <>
      <PageHeader
        eyebrow={`${products.length} products in stock`}
        title="The Complete Hardware Catalogue"
        subtitle="Every fitting we stock — stainless steel handles, hinges, closers, locks, channels, glass fittings, bath and kitchen hardware."
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-max lg:sticky lg:top-40">
            <h2 className="font-display text-lg font-semibold text-ink">Categories</h2>
            <div className="mt-3 grid gap-1 text-sm">
              <button
                onClick={() => navigate({ search: (s) => ({ ...s, category: "all" }) })}
                className={`rounded-md px-3 py-2 text-left ${category === "all" ? "btn-ink" : "hover:bg-muted"}`}
              >
                All Products ({products.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => navigate({ search: (s) => ({ ...s, category: c.slug }) })}
                  className={`rounded-md px-3 py-2 text-left ${category === c.slug ? "btn-ink" : "hover:bg-muted"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                Showing <strong className="text-ink">{list.length}</strong> item(s)
                {q && (
                  <>
                    {" "}
                    for “{q}”{" "}
                    <Link to="/products" search={{ q: "", category, sort }} className="text-accent underline">
                      clear
                    </Link>
                  </>
                )}
              </p>
              <label className="flex items-center gap-2 text-sm">
                Sort
                <select
                  value={sort}
                  onChange={(e) => navigate({ search: (s) => ({ ...s, sort: e.target.value }) })}
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </label>
            </div>

            {list.length === 0 ? (
              <p className="py-20 text-center text-muted-foreground">No products matched. Try another search.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
