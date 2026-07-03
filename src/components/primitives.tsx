import type { ReactNode } from "react";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-ink-700 bg-ink-850", className)}>
      {children}
    </div>
  );
}

/** Ligne selectionnable au langage visuel du ch2 (palette chaude, accent ambre a la selection, hover lift). */
export function SelectableRow({
  selected,
  children,
  className,
}: {
  selected: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border transition-all duration-200 hover:-translate-y-px hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.8)]",
        className,
      )}
      style={{
        background: selected ? "oklch(0.78 0.155 70 / 0.10)" : "oklch(0.215 0.006 65)",
        borderColor: selected ? "oklch(0.78 0.155 70 / 0.55)" : "oklch(0.30 0.008 65)",
      }}
    >
      {children}
    </div>
  );
}

/** Carte au langage visuel du ch2 (palette chaude oklch, coins 18px, hover lift optionnel). */
export function CatalogCard({
  children,
  className,
  hover,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border transition-all duration-200",
        hover && "hover:-translate-y-[3px] hover:shadow-[0_18px_38px_-22px_rgba(0,0,0,0.85)]",
        className,
      )}
      style={{ background: "oklch(0.215 0.006 65)", borderColor: "oklch(0.30 0.008 65)" }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  step,
  title,
  hint,
}: {
  step?: number | string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <h3 className="flex items-baseline text-sm font-semibold tracking-wide text-ink-200">
        {step != null && (
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-clay-500/20 text-xs text-clay-300">
            {step}
          </span>
        )}
        {title}
      </h3>
      {hint && <p className="mt-1 text-xs leading-relaxed text-ink-400">{hint}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "clay" | "moss" | "amber";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink-700 text-ink-300",
    clay: "bg-clay-500/20 text-clay-300",
    moss: "bg-moss-500/20 text-moss-500",
    amber: "bg-amber-flag/20 text-amber-flag",
  };
  return (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-clay-400 underline decoration-clay-500/40 underline-offset-2 hover:text-clay-300"
    >
      {children}
    </a>
  );
}
