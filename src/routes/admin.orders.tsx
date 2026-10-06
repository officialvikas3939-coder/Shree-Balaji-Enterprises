import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { inr } from "@/data/products";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statuses = ["placed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;
const statusLabels: Record<string, string> = {
  placed: "Placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function AdminOrders() {
  const qc = useQueryClient();
  const list = useServerFn(adminListOrders);
  const update = useServerFn(adminUpdateOrderStatus);
  const [filter, setFilter] = useState<"all" | (typeof statuses)[number]>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => list(),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: (typeof statuses)[number] }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Order status updated");
      void qc.invalidateQueries({ queryKey: ["admin-orders"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const [q, setQ] = useState("");
  const [product, setProduct] = useState("");
  const [range, setRange] = useState<"all" | "today" | "week" | "month" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"new" | "old" | "high" | "low">("new");

  const shown = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let min = 0;
    let max = Infinity;
    if (range === "today") min = start.getTime();
    if (range === "week") min = start.getTime() - 6 * 864e5;
    if (range === "month") min = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    if (range === "custom") {
      if (from) min = new Date(from).getTime();
      if (to) max = new Date(to).getTime() + 864e5;
    }
    const s = q.trim().toLowerCase();
    const p = product.trim().toLowerCase();
    const r = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      if (t < min || t >= max) return false;
      if (filter !== "all" && o.status !== filter) return false;
      if (s && ![o.order_no, o.customer_name, o.phone, o.email, o.city].some((v) => v?.toLowerCase().includes(s)))
        return false;
      if (p && !(o.order_items ?? []).some((i) => i.product_name.toLowerCase().includes(p))) return false;
      return true;
    });
    return r.sort((a, b) =>
      sort === "new"
        ? b.created_at.localeCompare(a.created_at)
        : sort === "old"
          ? a.created_at.localeCompare(b.created_at)
          : sort === "high"
            ? Number(b.total) - Number(a.total)
            : Number(a.total) - Number(b.total),
    );
  }, [orders, filter, q, product, range, from, to, sort]);
  const shownTotal = shown.reduce((sum, o) => sum + Number(o.total), 0);
  const countBy = (st: string) => orders.filter((o) => o.status === st).length;
  const inputCls = "rounded-md border border-border bg-background px-3 py-2 text-sm";

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order no, customer, phone, email, city" className={`${inputCls} min-w-60 flex-1`} />
        <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Product name" className={inputCls} />
        <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className={inputCls}>
          <option value="all">All dates</option>
          <option value="today">Today</option>
          <option value="week">Last 7 days</option>
          <option value="month">This month</option>
          <option value="custom">Custom range</option>
        </select>
        {range === "custom" ? (
          <>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
          </>
        ) : null}
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={inputCls}>
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
          <option value="high">Highest amount</option>
          <option value="low">Lowest amount</option>
        </select>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Showing <span className="font-semibold text-ink">{shown.length}</span> orders · Total{" "}
        <span className="font-semibold text-ink">{inr(shownTotal)}</span>
      </p>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              filter === s
                ? "btn-gold rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                : "rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {s === "all" ? `All (${orders.length})` : `${statusLabels[s]} (${countBy(s)})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-muted-foreground">Loading orders…</p>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No orders in this view.</p>
      ) : (
        <div className="grid gap-5">
          {shown.map((o) => (
            <article key={o.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">Order {o.order_no}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-IN")} · {o.payment_method.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-semibold text-ink">{inr(Number(o.total))}</p>
                  <select
                    value={o.status}
                    disabled={statusMut.isPending}
                    onChange={(e) =>
                      statusMut.mutate({ id: o.id, status: e.target.value as (typeof statuses)[number] })
                    }
                    className="mt-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-ink"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                  <p className="mt-1 font-medium text-ink">{o.customer_name}</p>
                  <p className="text-muted-foreground">{o.phone}</p>
                  {o.email ? <p className="text-muted-foreground">{o.email}</p> : null}
                  <p className="mt-1 text-muted-foreground">
                    {o.address}, {o.city} - {o.pin}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</p>
                  <ul className="mt-1 space-y-1">
                    {(o.order_items ?? []).map((it, i) => (
                      <li key={`${o.id}-${i}`} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          {it.product_name} × {it.qty}
                        </span>
                        <span>{inr(Number(it.price) * it.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
