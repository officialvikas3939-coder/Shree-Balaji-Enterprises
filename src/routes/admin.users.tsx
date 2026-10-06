import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { inr } from "@/data/products";
import { adminGetUserDetail, adminListUsers, adminUpdateCartItem } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString("en-IN") : "—");

function AdminUsers() {
  const list = useServerFn(adminListUsers);
  const { data: users = [], isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified" | "buyers" | "cart">("all");
  const [open, setOpen] = useState<string | null>(null);

  const verified = users.filter((u) => u.email_confirmed_at).length;
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === "verified" && !u.email_confirmed_at) return false;
      if (filter === "unverified" && u.email_confirmed_at) return false;
      if (filter === "buyers" && Number(u.orders_count) === 0) return false;
      if (filter === "cart" && Number(u.cart_count) === 0) return false;
      if (!s) return true;
      return [u.email, u.full_name, u.phone, u.city].some((v) => v?.toLowerCase().includes(s));
    });
  }, [users, q, filter]);

  if (isLoading) return <p className="py-16 text-center text-muted-foreground">Loading users…</p>;

  const cards = [
    { label: "Total Users", value: users.length },
    { label: "Verified", value: verified },
    { label: "Not Verified", value: users.length - verified },
    { label: "Have Ordered", value: users.filter((u) => Number(u.orders_count) > 0).length },
    { label: "Items in Cart", value: users.filter((u) => Number(u.cart_count) > 0).length },
  ];

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone, city"
          className="min-w-64 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        {(["all", "verified", "unverified", "buyers", "cart"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "btn-gold rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                : "rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {{ all: "All", verified: "Verified", unverified: "Not Verified", buyers: "Ordered", cart: "With Cart" }[f]}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {shown.length === 0 ? <p className="py-10 text-center text-muted-foreground">No users found.</p> : null}
        {shown.map((u) => (
          <article key={u.id} className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(open === u.id ? null : u.id)}
              className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
            >
              <div>
                <p className="font-medium text-ink">
                  {u.full_name || "—"} {u.is_admin ? <span className="ml-2 text-xs text-gold">ADMIN</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.email} {u.phone ? `· ${u.phone}` : ""} {u.city ? `· ${u.city}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Joined {fmt(u.created_at)} · Last login {fmt(u.last_sign_in_at)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={
                    u.email_confirmed_at
                      ? "rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground"
                      : "rounded-full bg-destructive px-3 py-1 font-semibold text-destructive-foreground"
                  }
                >
                  {u.email_confirmed_at ? "Verified" : "Not Verified"}
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  {u.orders_count} orders · {inr(Number(u.orders_total))}
                </span>
                <span className="rounded-full border border-border px-3 py-1">Cart {u.cart_count}</span>
              </div>
            </button>
            {open === u.id ? <UserDetail id={u.id} /> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function UserDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const get = useServerFn(adminGetUserDetail);
  const upd = useServerFn(adminUpdateCartItem);
  const { data, isLoading } = useQuery({ queryKey: ["admin-user", id], queryFn: () => get({ data: { id } }) });
  const mut = useMutation({
    mutationFn: (v: { id: string; qty: number }) => upd({ data: v }),
    onSuccess: () => {
      toast.success("Cart updated");
      void qc.invalidateQueries({ queryKey: ["admin-user", id] });
      void qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  if (isLoading || !data) return <p className="border-t border-border p-4 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="grid gap-6 border-t border-border p-4 md:grid-cols-2">
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cart ({data.cart.length})
        </p>
        {data.cart.length === 0 ? <p className="text-sm text-muted-foreground">Cart is empty.</p> : null}
        <ul className="space-y-2">
          {data.cart.map((c: any) => (
            <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-ink">
                {c.products?.name} <span className="text-muted-foreground">({inr(Number(c.products?.price ?? 0))})</span>
              </span>
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  defaultValue={c.qty}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (v !== c.qty) mut.mutate({ id: c.id, qty: v });
                  }}
                  className="w-16 rounded-md border border-border bg-background px-2 py-1"
                />
                <button
                  type="button"
                  onClick={() => mut.mutate({ id: c.id, qty: 0 })}
                  className="rounded-md border border-border px-2 py-1 text-xs text-destructive"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
        <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Wishlist ({data.wishlist.length})
        </p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {data.wishlist.map((w: any) => (
            <li key={w.id}>{w.products?.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Orders ({data.orders.length})
        </p>
        {data.orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : null}
        <ul className="space-y-3">
          {data.orders.map((o: any) => (
            <li key={o.id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-ink">{o.order_no}</span>
                <span>{inr(Number(o.total))}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {fmt(o.created_at)} · {o.status.replace(/_/g, " ")} · {o.payment_method.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {(o.order_items ?? []).map((i: any) => `${i.product_name} × ${i.qty}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
