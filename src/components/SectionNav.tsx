export interface NavItem {
  id: string;
  label: string;
}

/** Rail de navigation vertical : une entree numerotee par section, accent ambre sur l'active. */
export function SectionNav({
  items,
  active,
  onSelect,
}: {
  items: NavItem[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Sections" className="flex flex-col gap-1.5 p-3">
      {items.map((item, i) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={on ? "step" : undefined}
            className="flex w-full select-none items-center gap-2.5 rounded-[12px] border px-3 py-2.5 text-left transition-all duration-150 hover:-translate-y-px"
            style={{
              background: on ? "oklch(0.78 0.155 70 / 0.12)" : "oklch(0.215 0.006 65)",
              borderColor: on ? "oklch(0.78 0.155 70 / 0.5)" : "oklch(0.30 0.008 65)",
            }}
          >
            <span
              className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold transition-colors"
              style={{
                background: on ? "oklch(0.78 0.155 70 / 0.18)" : "oklch(0.27 0.006 65)",
                border: `1.5px solid ${on ? "oklch(0.78 0.155 70 / 0.6)" : "oklch(0.33 0.008 65)"}`,
                color: on ? "oklch(0.85 0.14 75)" : "oklch(0.66 0.012 75)",
              }}
            >
              {i + 1}
            </span>
            <span
              className="min-w-0 truncate text-[13px] font-semibold tracking-tight transition-colors"
              style={{ color: on ? "oklch(0.95 0.01 75)" : "oklch(0.72 0.012 75)" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
