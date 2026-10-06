import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { inr } from "@/data/products";
import { adminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchStats = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });

  if (isLoading || !data) return <p className="py-16 text-center text-muted-foreground">Loading overview…</p>;

  const cards = [
    { label: "Active Products", value: String(data.products) },
    { label: "Total Orders", value: String(data.orders) },
    { label: "Order Value", value: inr(data.revenue) },
    { label: "New Enquiries", value: String(data.newEnquiries) },
    { label: "Low Stock (<10)", value: String(data.lowStock) },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-lg border border-border bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{c.label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-ink">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
