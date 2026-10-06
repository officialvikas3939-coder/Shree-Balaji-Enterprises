import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/bulk-orders")({
  head: () => ({
    meta: [
      { title: "Bulk & Dealer Enquiry — Shree Balaji Enterprises" },
      {
        name: "description",
        content: "Slab pricing for builders, contractors and interior firms on SS hardware, hinges, closers and fittings.",
      },
      { property: "og:title", content: "Bulk & Dealer Pricing — Shree Balaji Enterprises" },
      { property: "og:description", content: "Project kitting, credit terms and dealer rates for hardware buyers." },
    ],
  }),
  component: BulkPage,
});

const slabs = [
  { qty: "25 – 99 pcs", disc: "8% off list", extra: "Free delivery in Rajasthan" },
  { qty: "100 – 499 pcs", disc: "14% off list", extra: "Dedicated account manager" },
  { qty: "500+ pcs / project", disc: "Custom quote", extra: "Project kitting + credit terms" },
];

function BulkPage() {
  return (
    <>
      <PageHeader
        eyebrow="For trade buyers"
        title="Bulk, Project & Dealer Pricing"
        subtitle="Builders, carpenters, interior designers and retailers — get factory-linked rates with one carton per door kitting."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {slabs.map((s) => (
            <div key={s.qty} className="card-elevated rounded-lg p-6">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">{s.qty}</p>
              <p className="mt-3 font-display text-3xl font-semibold text-ink">{s.disc}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.extra}</p>
            </div>
          ))}
        </div>

        <form
          className="mt-14 grid gap-4 rounded-lg border border-border bg-card p-8 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Quote request received", { description: "We will share a rate sheet within 24 hours." });
          }}
        >
          <h2 className="font-display text-2xl font-semibold text-ink md:col-span-2">Request a rate sheet</h2>
          {["Firm / company name", "Contact person", "Mobile number", "City", "GSTIN (optional)", "Monthly requirement"].map((l) => (
            <label key={l} className="block text-sm">
              <span className="text-muted-foreground">{l}</span>
              <input
                required={!l.includes("optional")}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ))}
          <label className="block text-sm md:col-span-2">
            <span className="text-muted-foreground">Items and quantities needed</span>
            <textarea
              required
              rows={4}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button type="submit" className="btn-gold rounded-md py-3 text-sm md:col-span-2">
            Request Quote
          </button>
        </form>
      </div>
    </>
  );
}
