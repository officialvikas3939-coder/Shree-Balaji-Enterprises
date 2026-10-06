import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placeOrder } from "@/lib/account.functions";
import { useAuth } from "@/hooks/useAuth";
import { inr } from "@/data/products";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Shree Balaji Enterprises" },
      { name: "description", content: "Enter delivery details and place your hardware order with COD or online payment." },
      { property: "og:title", content: "Checkout — Shree Balaji Enterprises" },
      { property: "og:description", content: "Secure checkout for hardware and door fittings orders." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cartLines, subtotal, clear } = useStore();
  const { user } = useAuth();
  const submitOrder = useServerFn(placeOrder);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", city: "", pin: "", pay: "cod" });
  const shipping = subtotal > 4999 || subtotal === 0 ? 0 : 149;

  const field = (key: keyof typeof form, label: string, type = "text") => (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        required
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );

  return (
    <>
      <PageHeader eyebrow="Step 2 of 2" title="Checkout" subtitle="Pay online or choose cash on delivery. GST invoice on every order." />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {cartLines.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="font-display text-2xl text-ink">Nothing to check out</p>
            <Link to="/products" className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
              Browse Products
            </Link>
          </div>
        ) : (
          <form
            className="grid gap-8 lg:grid-cols-[1fr_360px]"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!user) {
                toast.error("Please sign in to place your order");
                void navigate({ to: "/auth" });
                return;
              }
              setBusy(true);
              try {
                const order = await submitOrder({
                  data: {
                    name: form.name,
                    phone: form.phone,
                    email: form.email,
                    address: form.address,
                    city: form.city,
                    pin: form.pin,
                    payment_method: form.pay as "cod" | "upi" | "card" | "net",
                    items: cartLines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
                  },
                });
                clear();
                toast.success("Order placed", { description: `Order no. ${order.order_no}` });
                void navigate({ to: "/orders" });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Order could not be placed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid gap-6 rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Delivery Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {field("name", "Full name")}
                {field("phone", "Mobile number", "tel")}
                {field("email", "Email", "email")}
                {field("city", "City")}
              </div>
              {field("address", "Full address")}
              {field("pin", "PIN code")}

              <h2 className="mt-2 font-display text-xl font-semibold text-ink">Payment Method</h2>
              <div className="grid gap-3 text-sm">
                {[
                  { id: "cod", label: "Cash on Delivery" },
                  { id: "upi", label: "UPI / Google Pay / PhonePe" },
                  { id: "card", label: "Credit / Debit Card" },
                  { id: "net", label: "Net Banking" },
                ].map((p) => (
                  <label key={p.id} className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
                    <input
                      type="radio"
                      name="pay"
                      checked={form.pay === p.id}
                      onChange={() => setForm({ ...form, pay: p.id })}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                This is a demo storefront — online payment gateway can be connected on request.
              </p>
            </div>

            <aside className="h-max rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-ink">Your Order</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {cartLines.map((l) => (
                  <li key={l.product.slug} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {l.product.name} × {l.qty}
                    </span>
                    <span>{inr(l.product.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold">
                <span>Total</span>
                <span>{inr(subtotal + shipping)}</span>
              </div>
              <button type="submit" disabled={busy} className="btn-gold mt-6 w-full rounded-md py-3 text-sm disabled:opacity-60">
                {busy ? "Placing order…" : "Place Order"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </>
  );
}
