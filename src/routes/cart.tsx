import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { inr } from "@/data/products";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Shree Balaji Enterprises" },
      { name: "description", content: "Review your selected hardware items and proceed to secure checkout." },
      { property: "og:title", content: "Your Cart — Shree Balaji Enterprises" },
      { property: "og:description", content: "Review your hardware order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cartLines, subtotal, setQty, remove } = useStore();
  const shipping = subtotal > 4999 || subtotal === 0 ? 0 : 149;

  return (
    <>
      <PageHeader eyebrow="Step 1 of 2" title="Shopping Cart" subtitle="Bulk quantities? Ask for a contractor quote at checkout." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {cartLines.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-ink">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">Add handles, hinges or closers to get started.</p>
            <Link to="/products" className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {cartLines.map(({ product, qty }) => (
                <div key={product.slug} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-28 w-28 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="font-semibold text-ink hover:underline">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.categoryName} · {product.finish} · per {product.unit.toLowerCase()}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center rounded-md border border-border">
                        <button className="px-3 py-1" onClick={() => setQty(product.slug, qty - 1)} aria-label="Decrease">
                          −
                        </button>
                        <span className="w-9 text-center text-sm">{qty}</span>
                        <button className="px-3 py-1" onClick={() => setQty(product.slug, qty + 1)} aria-label="Increase">
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(product.slug)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-semibold text-ink">{inr(product.price * qty)}</p>
                    <p className="text-xs text-muted-foreground line-through">{inr(product.mrp * qty)}</p>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-max rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Order Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{inr(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{inr(subtotal + shipping)}</dd>
                </div>
              </dl>
              <Link to="/checkout" className="btn-gold mt-6 block rounded-md py-3 text-center text-sm">
                Proceed to Checkout
              </Link>
              <Link to="/products" className="mt-3 block text-center text-xs text-muted-foreground hover:text-accent">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
