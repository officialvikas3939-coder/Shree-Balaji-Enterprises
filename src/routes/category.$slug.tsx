import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { buildCatalog, catalogQueryOptions, useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(catalogQueryOptions);
    const { categories } = buildCatalog(data);
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category unavailable — Shree Balaji Enterprises" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.category.name} — Shree Balaji Enterprises`;
    return {
      meta: [
        { title },
        { name: "description", content: `${loaderData.category.name}: ${loaderData.category.tagline}. Buy online at dealer prices.` },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.category.tagline },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { categories, products } = useCatalog();
  const list = products.filter((p) => p.category === category.slug);

  return (
    <>
      <section className="surface-ink">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Category</p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{category.name}</h1>
            <p className="mt-4 max-w-xl text-sm text-primary-foreground/75">{category.tagline}</p>
            <p className="mt-4 text-sm text-primary-foreground/60">{list.length} products · in stock · ships in 24 hours</p>
          </div>
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <h2 className="mt-16 font-display text-2xl font-semibold text-ink">Explore other categories</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== category.slug)
            .map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-accent hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
        </div>
      </div>
    </>
  );
}
