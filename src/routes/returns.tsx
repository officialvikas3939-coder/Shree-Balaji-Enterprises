import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Warranty — Shree Balaji Enterprises" },
      { name: "description", content: "7 day returns on unused hardware and 12 month replacement warranty on manufacturing defects." },
      { property: "og:title", content: "Returns & Warranty — Shree Balaji Enterprises" },
      { property: "og:description", content: "How to return an item or claim replacement warranty." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <>
      <PageHeader eyebrow="Policy" title="Returns & Warranty" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-ink-soft">
        <h2 className="font-display text-2xl font-semibold text-ink">7 day returns</h2>
        <p className="mt-3">
          Unused items in original packing can be returned within 7 days of delivery. Raise the request from the Orders page
          or call +91 94143 14135. Reverse pickup is free for defective or wrongly shipped items.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Not returnable</h2>
        <ul className="mt-3 grid gap-2">
          <li>• Cut-to-size rods, profiles and custom drilled items.</li>
          <li>• Installed items showing fitment marks or paint.</li>
          <li>• Opened fastener boxes with missing pieces.</li>
        </ul>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">12 month warranty</h2>
        <p className="mt-3">
          All Balaji range products carry a 12 month replacement warranty against manufacturing defects such as hinge pin
          failure, closer oil leakage and coating peel-off. Share the invoice number and photos to claim.
        </p>

        <h2 className="mt-10 font-display text-2xl font-semibold text-ink">Refunds</h2>
        <p className="mt-3">Approved refunds are credited to the original payment method within 5 – 7 working days.</p>
      </div>
    </>
  );
}
