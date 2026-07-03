import type { ReactNode } from "react";

/**
 * Carte de selection (design Profils Usage) : icone optionnelle + titre + sous-titre,
 * accent par teinte oklch a la selection, badge check anime, hover lift.
 * Sans `icon`, la tuile d'icone est masquee (utilise pour les groupes de choix simples).
 */
export function OptionCard({
  icon,
  title,
  subtitle,
  selected,
  hue = 70,
  onClick,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  selected: boolean;
  hue?: number;
  onClick: () => void;
}) {
  const acc = `oklch(0.78 0.155 ${hue})`;
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex w-full select-none items-start gap-[15px] rounded-[18px] border p-[16px] text-left transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_38px_-22px_rgba(0,0,0,0.85)]"
      style={{
        background: selected ? `oklch(0.78 0.155 ${hue} / 0.10)` : "oklch(0.215 0.006 65)",
        borderColor: selected ? acc : "oklch(0.30 0.008 65)",
        boxShadow: selected
          ? `inset 0 0 0 1px ${acc}, 0 16px 40px -20px oklch(0.78 0.155 ${hue} / 0.55)`
          : undefined,
      }}
    >
      {icon && (
        <span
          className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[13px] border transition-colors duration-200"
          style={{
            color: selected ? acc : "oklch(0.74 0.012 75)",
            background: selected ? `oklch(0.78 0.155 ${hue} / 0.15)` : "oklch(0.27 0.006 65)",
            borderColor: selected ? `oklch(0.78 0.155 ${hue} / 0.40)` : "oklch(0.33 0.008 65)",
          }}
        >
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-1 pt-0.5 pr-5">
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: "oklch(0.96 0.004 75)" }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className="text-[12.5px] font-medium leading-snug"
            style={{ color: "oklch(0.66 0.012 75)" }}
          >
            {subtitle}
          </span>
        )}
      </span>
      <span
        className="absolute right-[11px] top-[11px] flex h-[22px] w-[22px] items-center justify-center rounded-[7px] transition-all duration-200"
        style={{
          background: selected ? acc : "oklch(0.30 0.006 65)",
          opacity: selected ? 1 : 0,
          transform: selected ? "scale(1)" : "scale(0.6)",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="oklch(0.20 0.012 65)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </button>
  );
}
