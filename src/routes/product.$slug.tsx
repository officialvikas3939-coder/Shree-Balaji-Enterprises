import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Heart, ShieldCheck, Truck } from "lucide-react";
import { inr } from "@/data/products";
import { buildCatalog, catalogQueryOptions, useCatalog } from "@/lib/catalog";
import { ProductCard, Stars } from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(catalogQueryOptions);
    const { products } = buildCatalog(data);
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — Shree Balaji Enterprises" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Shree Balaji Enterprises` },
        { name: "description", content: `${p.name} at ${inr(p.price)}. ${p.material}, ${p.finish} finish. Free delivery above ₹4,999.` },
        { property: "og:title", content: `${p.name} — Shree Balaji Enterprises` },
        { property: "og:description", content: p.description.slice(0, 150) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { products } = useCatalog();
  const { add, toggleWish, wishlist } = useStore();
  const [qty, setQty] = useState(1);
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-accent">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/category/$slug" params={{ slug: product.category }} className="hover:text-accent">
          {product.categoryName}
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="w-full rounded-lg border border-border bg-muted object-cover"
          />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <img
                key={i}
                src={product.image}
                alt={`${product.name} view ${i + 1}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-md border border-border object-cover opacity-80 hover:opacity-100"
              />
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-accent">{product.brand}</span>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">{product.name}</h1>
          <div className="mt-3">
            <Stars rating={product.rating} reviews={product.reviews} />
          </div>

          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-4xl font-semibold text-ink">{inr(product.price)}</span>
            <span className="text-muted-foreground line-through">{inr(product.mrp)}</span>
            <span className="rounded bg-success/12 px-2 py-1 text-xs font-bold text-success">{off}% OFF</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes · per {product.unit.toLowerCase()}</p>

          <p className="mt-6 text-sm leading-relaxed text-ink-soft">{product.description}</p>

          <ul className="mt-6 space-y-2 text-sm text-ink-soft">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button className="px-3 py-2" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button className="px-3 py-2" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button
              className="btn-gold rounded-md px-8 py-3 text-sm"
              onClick={() => {
                add(product.slug, qty);
                toast.success("Added to cart", { description: product.name });
              }}
            >
              Add to Cart
            </button>
            <Link
              to="/cart"
              onClick={() => add(product.slug, qty)}
              className="btn-ink rounded-md px-8 py-3 text-sm font-semibold"
            >
              Buy Now
            </Link>
            <button
              onClick={() => toggleWish(product.slug)}
              className="rounded-md border border-border p-3 hover:text-accent"
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" fill={wishlist.includes(product.slug) ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-lg border border-border bg-card p-5 text-sm">
            <p className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" /> Dispatch within 24 hours · Free delivery above ₹4,999
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" /> 12 month replacement warranty · GST invoice included
            </p>
          </div>

          <table className="mt-8 w-full border-collapse text-sm">
            <caption className="pb-3 text-left font-display text-xl font-semibold text-ink">Specifications</caption>
            <tbody>
              {[
                ["Material", product.material],
                ["Finish", product.finish],
                ["Category", product.categoryName],
                ["Packing Unit", product.unit],
                ["SKU", product.id.toUpperCase()],
                ["Availability", `${product.stock} in stock`],
              ].map(([k, v]) => (
                <tr key={k} className="border-b border-border">
                  <th className="w-40 py-2 text-left font-medium text-muted-foreground">{k}</th>
                  <td className="py-2 text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-2xl font-semibold text-ink">Customers also bought</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
