import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Shree Balaji Enterprises" },
      { name: "description", content: "How Shree Balaji Enterprises collects, uses and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — Shree Balaji Enterprises" },
      { property: "og:description", content: "Our data collection, usage and protection practices." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm leading-relaxed text-ink-soft">
        <p>
          We collect only the information needed to process and deliver your order — name, delivery address, phone number,
          email and, where applicable, GSTIN.
        </p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">How we use it</h2>
        <ul className="mt-3 grid gap-2">
          <li>• Fulfilling orders, invoicing and delivery updates.</li>
          <li>• Customer support and warranty claims.</li>
          <li>• Occasional offers, only if you opt in.</li>
        </ul>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">What we never do</h2>
        <p className="mt-3">We never sell or rent your data. Details are shared only with delivery and payment partners.</p>
        <h2 className="mt-8 font-display text-2xl font-semibold text-ink">Your control</h2>
        <p className="mt-3">
          Write to care@shreebalajienterprises.in to access, correct or delete your data. Cart and wishlist information is
          stored locally in your browser only.
        </p>
      </div>
    </>
  );
}
