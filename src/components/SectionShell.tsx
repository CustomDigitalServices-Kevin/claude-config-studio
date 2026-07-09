import type { ReactNode } from "react";

/**
 * Coque premium d'une section (design ch1 DesignSync) : carte gradient + glow,
 * header cercle numerote ambre + titre + sous-titre, divider, puis le contenu.
 * Applique a TOUTES les sections du generateur pour un langage visuel homogene.
 */
export function SectionShell({
  index,
  title,
  subtitle,
  accessory,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  /** Element optionnel aligne a droite du header (ex. pill compteur). */
  accessory?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-[26px]"
      style={{
        background: "linear-gradient(180deg, oklch(0.213 0.006 65), oklch(0.183 0.006 65))",
        border: "1px solid oklch(0.29 0.008 65)",
        boxShadow: "0 28px 64px -36px rgba(0,0,0,0.9), inset 0 1px 0 oklch(0.45 0.01 75 / 0.16)",
      }}
    >
      <div
        className="pointer-events-none absolute -left-8 -top-16 h-[140px] w-[240px]"
        style={{
          background: "radial-gradient(closest-side, oklch(0.78 0.15 70 / 0.13), transparent 75%)",
        }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13.5px] font-extrabold"
          style={{
            background: "oklch(0.78 0.15 70 / 0.14)",
            border: "1.5px solid oklch(0.78 0.15 70 / 0.6)",
            color: "oklch(0.85 0.14 75)",
            boxShadow: "0 0 18px -4px oklch(0.78 0.15 70 / 0.5)",
          }}
        >
          {index}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2
            className="text-[17px] font-extrabold tracking-tight"
            style={{ color: "oklch(0.97 0.004 75)" }}
          >
            {title}
          </h2>
          <p className="text-[12.5px] font-medium" style={{ color: "oklch(0.62 0.012 75)" }}>
            {subtitle}
          </p>
        </div>
        {accessory && <div className="relative shrink-0">{accessory}</div>}
      </div>

      <div
        className="my-[22px] h-px"
        style={{
          background: "linear-gradient(90deg, oklch(0.34 0.008 65), oklch(0.34 0.008 65 / 0))",
        }}
      />

      {children}
    </div>
  );
}
