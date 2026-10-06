import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useCatalog } from "@/lib/catalog";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Shree Balaji Enterprises" },
      {
        name: "description",
        content: "Shree Balaji Enterprises has supplied stainless steel architectural hardware and door fittings since 2004.",
      },
      { property: "og:title", content: "About Shree Balaji Enterprises" },
      { property: "og:description", content: "Two decades of trusted hardware supply to homes, builders and contractors." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { categories } = useCatalog();
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="Two decades of honest hardware"
        subtitle="From a single counter in the Jaipur hardware market to a catalogue of 100+ stainless steel fittings shipped across India."
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-base leading-relaxed text-ink-soft">
          Shree Balaji Enterprises began in 2004 as a family run hardware counter serving local carpenters. Today we stock
          door hardware, kitchen and bath solutions from India's leading manufacturers, plus our own Balaji Prime,
          Steelline, Gold and Heavy Duty ranges built to specification in 304 grade stainless steel.
        </p>
        <p className="mt-5 text-base leading-relaxed text-ink-soft">
          Every item is inspected before dispatch, priced transparently and invoiced with GST. Builders and interior firms
          get project kitting — one labelled carton per door — so site work never stops for a missing screw.
        </p>

        <h2 className="mt-14 font-display text-3xl font-semibold text-ink">What we stock</h2>
        <div className="gold-rule mt-4" />
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <li key={c.slug} className="rounded-md border border-border bg-card p-4">
              <p className="font-semibold text-ink">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.tagline}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 font-display text-3xl font-semibold text-ink">Our promise</h2>
        <div className="gold-rule mt-4" />
        <ul className="mt-6 grid gap-3 text-sm text-ink-soft">
          <li>• Genuine 304 grade steel — never re-branded seconds.</li>
          <li>• Same price for one piece or one hundred, with slab discounts declared upfront.</li>
          <li>• 12 month replacement warranty on manufacturing defects.</li>
          <li>• Free technical guidance on door weight, closer capacity and hinge selection.</li>
        </ul>
      </div>
    </>
  );
}
