import { createFileRoute, Link } from "@tanstack/react-router";
import { useCatalog } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/ProductCard";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Shree Balaji Enterprises" },
      { name: "description", content: "Saved hardware items you plan to order later." },
      { property: "og:title", content: "Wishlist — Shree Balaji Enterprises" },
      { property: "og:description", content: "Your saved hardware and door fitting products." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { products } = useCatalog();
  const { wishlist } = useStore();
  const list = products.filter((p) => wishlist.includes(p.slug));

  return (
    <>
      <PageHeader eyebrow="Saved for later" title="My Wishlist" />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {list.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-ink">No saved items yet</p>
            <Link to="/products" className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
