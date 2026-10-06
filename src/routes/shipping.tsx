import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery — Shree Balaji Enterprises" },
      { name: "description", content: "Dispatch timelines, delivery charges, COD limits and all-India shipping details." },
      { property: "og:title", content: "Shipping & Delivery — Shree Balaji Enterprises" },
      { property: "og:description", content: "24 hour dispatch and free delivery above ₹4,999 across India." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <>
      <PageHeader eyebrow="Policy" title="Shipping & Delivery" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-ink-soft">
        <h2 className="font-display text-2xl font-semibold text-ink">Dispatch</h2>
        <p className="mt-3">Orders placed before 4 PM on working days are dispatched the same day; all others within 24 working hours.</p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Charges</h2>
        <ul className="mt-3 grid gap-2">
          <li>• Free delivery on orders above ₹4,999.</li>
          <li>• Flat ₹149 for orders below ₹4,999.</li>
          <li>• Heavy items such as floor springs and kitchen baskets may attract actual freight for remote pin codes.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Timelines</h2>
        <table className="mt-3 w-full border-collapse text-sm">
          <tbody>
            {[
              ["Rajasthan", "1 – 2 working days"],
              ["Delhi, Mumbai, Ahmedabad, Bengaluru", "2 – 4 working days"],
              ["Rest of India", "3 – 6 working days"],
              ["North East / J&K / Islands", "5 – 9 working days"],
            ].map(([k, v]) => (
              <tr key={k} className="border-b border-border">
                <th className="py-2 text-left font-medium text-muted-foreground">{k}</th>
                <td className="py-2 text-ink">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Cash on delivery</h2>
        <p className="mt-3">COD is available up to ₹20,000 per order in serviceable pin codes. A ₹49 handling fee applies.</p>
      </div>
    </>
  );
}
