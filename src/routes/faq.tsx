import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Shree Balaji Enterprises" },
      { name: "description", content: "Answers on hardware sizing, finishes, delivery, warranty, GST invoices and bulk orders." },
      { property: "og:title", content: "Frequently Asked Questions — Shree Balaji Enterprises" },
      { property: "og:description", content: "Everything about ordering hardware, finishes, delivery and warranty." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  ["Which door closer capacity should I choose?", "Match the closer to door weight: 25–45 kg for internal doors, 45–65 kg for standard main doors and 65–85 kg for heavy teak or fire doors."],
  ["Are your hinges suitable for heavy doors?", "Yes. Use SS bearing hinges 5x3.5 inch (3 per leaf) for doors above 35 kg, and parliament hinges where the door must fold flat."],
  ["Do you provide GST invoices?", "Every order ships with a GST invoice. Add your GSTIN at checkout or in the bulk enquiry form for input credit."],
  ["Which finishes are available?", "Satin SS, mirror polish, antique brass, matte black, rose gold and chrome across the core catalogue."],
  ["How long does delivery take?", "Dispatch within 24 working hours. Rajasthan 1–2 days, metros 2–4 days, rest of India 3–6 days."],
  ["Can I return an item?", "Unused items in original packing can be returned within 7 days. Manufacturing defects carry a 12 month replacement warranty."],
  ["Do you supply for full projects?", "Yes — we kit hardware door-by-door for apartment and hotel projects with slab pricing and credit terms."],
  ["Is cash on delivery available?", "COD is available up to ₹20,000 per order in serviceable pin codes."],
];

function FaqPage() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Frequently Asked Questions" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="grid gap-4">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-lg border border-border bg-card p-5">
              <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
