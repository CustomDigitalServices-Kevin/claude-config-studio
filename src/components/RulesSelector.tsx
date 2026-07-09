import { useState } from "react";
import { RULE_MODULES, ruleDetail, ruleOptionsFor } from "../data/rules";
import { pick, type Language, type RuleId, type Rigor } from "../types";
import { Badge, SelectableRow, cn } from "./primitives";
import { OptionControls } from "./OptionControls";

const T = {
  fr: { detail: "En savoir plus", params: "Paramètres", scoped: "path-scoped" },
  en: { detail: "Learn more", params: "Parameters", scoped: "path-scoped" },
};

function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
        on ? "border-clay-500 bg-clay-500 text-ink-950" : "border-ink-600 text-transparent",
      )}
    >
      ✓
    </span>
  );
}

export function RulesSelector({
  rules,
  ruleOptions,
  onToggle,
  onOptionChange,
  lang,
  rigor,
}: {
  rules: RuleId[];
  ruleOptions: Record<string, string | number | boolean>;
  onToggle: (id: RuleId) => void;
  onOptionChange: (key: string, value: string | number | boolean) => void;
  lang: Language;
  rigor: Rigor;
}) {
  const [expanded, setExpanded] = useState<RuleId | null>(null);
  const t = T[lang];

  return (
    <div className="space-y-1.5">
      {RULE_MODULES.map((r) => {
        const selected = rules.includes(r.id);
        const opts = ruleOptionsFor(r.id);
        const isOpen = expanded === r.id;
        return (
          <SelectableRow key={r.id} selected={selected}>
            <div className="flex items-center gap-2 p-2.5">
              <button
                type="button"
                onClick={() => onToggle(r.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <CheckBox on={selected} />
                {r.core0 && <span className="text-clay-400">●</span>}
                <span className="truncate text-sm font-medium text-ink-100">
                  {pick(r.label, lang)}
                </span>
                {r.kind === "scoped" && <Badge tone="neutral">{t.scoped}</Badge>}
              </button>
              <button
                type="button"
                onClick={() => setExpanded((p) => (p === r.id ? null : r.id))}
                className="rounded px-2 py-0.5 text-xs text-ink-400 hover:text-clay-300"
              >
                {t.detail} {isOpen ? "▲" : "▼"}
              </button>
            </div>

            {isOpen && (
              <div className="border-t border-ink-700 px-3 py-2.5 text-xs leading-relaxed text-ink-300">
                {pick(ruleDetail(r.id), lang)}
              </div>
            )}

            {selected && opts.length > 0 && (
              <div className="border-t border-ink-700/70 px-3 py-2.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
                  {t.params}
                </p>
                <OptionControls
                  ownerId={r.id}
                  options={opts}
                  values={ruleOptions}
                  onChange={onOptionChange}
                  lang={lang}
                  rigor={rigor}
                />
              </div>
            )}
          </SelectableRow>
        );
      })}
    </div>
  );
}
