import { Card } from './Card';

interface PlaceholderPageProps {
  title: string;
  eyebrow: string;
  description: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export function PlaceholderPage({
  title,
  eyebrow,
  description,
  primaryActionLabel = 'Primary action',
  secondaryActionLabel = 'Secondary action',
}: PlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan/80">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold text-slate-50">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-slate-100">Primary action</p>
          <p className="mt-2 text-sm text-slate-300">{primaryActionLabel}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-100">Secondary action</p>
          <p className="mt-2 text-sm text-slate-300">{secondaryActionLabel}</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-100">Status</p>
          <p className="mt-2 text-sm text-slate-300">Ready for module implementation.</p>
        </Card>
      </div>
    </section>
  );
}
