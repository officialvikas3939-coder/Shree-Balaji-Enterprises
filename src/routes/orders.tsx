import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { inr } from "@/data/products";
import { getMyOrders } from "@/lib/account.functions";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders & Tracking — Shree Balaji Enterprises" },
      { name: "description", content: "Track your hardware orders, view invoices and delivery status." },
      { property: "og:title", content: "My Orders & Tracking — Shree Balaji Enterprises" },
      { property: "og:description", content: "Order history and live delivery status." },
    ],
  }),
  component: OrdersPage,
});

const steps = ["placed", "packed", "shipped", "out_for_delivery", "delivered"] as const;
const stepLabels: Record<string, string> = {
  placed: "Order Placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

function OrdersPage() {
  const { user, loading } = useAuth();
  const fetchOrders = useServerFn(getMyOrders);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: () => fetchOrders(),
    enabled: Boolean(user),
  });

  if (loading) return <div className="py-24 text-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <>
        <PageHeader eyebrow="Order history" title="My Orders" />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-ink">Sign in to see your orders</p>
            <Link to="/auth" className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Order history"
        title="My Orders"
        subtitle="Every order on your account, with live tracking status."
      />
      <div className="mx-auto max-w-5xl px-4 py-12">
        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-ink">No orders yet</p>
            <Link to="/products" search={{ q: "", category: "all", sort: "featured" }} className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((o) => {
              const current = Math.max(0, steps.indexOf(o.status as (typeof steps)[number]));
              return (
                <article key={o.id} className="rounded-lg border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                      <p className="font-display text-xl font-semibold text-ink">Order {o.order_no}</p>
                      <p className="text-xs text-muted-foreground">
                        Placed on{" "}
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="font-display text-xl font-semibold text-ink">{inr(Number(o.total))}</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {(o.order_items ?? []).map((it) => (
                      <li key={`${o.id}-${it.product_slug}`} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          {it.product_name} × {it.qty}
                        </span>
                        <span>{inr(Number(it.price) * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Delivering to {o.customer_name}, {o.address}, {o.city} - {o.pin} · Payment:{" "}
                    {o.payment_method.toUpperCase()}
                  </p>
                  <ol className="mt-5 flex flex-wrap gap-2 text-[11px]">
                    {steps.map((s, i) => (
                      <li
                        key={s}
                        className={`rounded-full px-3 py-1 ${
                          i <= current ? "btn-gold" : "border border-border text-muted-foreground"
                        }`}
                      >
                        {stepLabels[s]}
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
