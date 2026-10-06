export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="surface-ink">
      <div className="mx-auto max-w-7xl px-4 py-14">
        {eyebrow && <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">{eyebrow}</p>}
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-sm text-primary-foreground/75">{subtitle}</p>}
        <div className="gold-rule mt-6" />
      </div>
    </div>
  );
}
