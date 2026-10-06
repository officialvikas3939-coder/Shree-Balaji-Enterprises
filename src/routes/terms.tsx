import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — Shree Balaji Enterprises" },
      { name: "description", content: "Terms governing purchases, pricing, warranty and use of the Shree Balaji Enterprises store." },
      { property: "og:title", content: "Terms of Use — Shree Balaji Enterprises" },
      { property: "og:description", content: "Purchase terms, pricing rules and liability limits." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Use" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-ink-soft">
        <h2 className="font-display text-2xl font-semibold text-ink">Pricing</h2>
        <p className="mt-3">
          All prices are in Indian Rupees and inclusive of GST unless stated otherwise. Prices may change without notice;
          the price shown at the time of order confirmation applies.
        </p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Product images</h2>
        <p className="mt-3">
          Images are representative. Minor variation in shade, polish or packaging may occur between production batches.
        </p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Installation</h2>
        <p className="mt-3">
          Hardware must be installed by a qualified carpenter following the enclosed template. Warranty does not cover
          damage caused by incorrect installation or corrosive cleaning agents.
        </p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Liability</h2>
        <p className="mt-3">Our liability is limited to the value of the goods supplied.</p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Jurisdiction</h2>
        <p className="mt-3">All disputes are subject to the jurisdiction of courts in Jaipur, Rajasthan.</p>
      </div>
    </>
  );
}
