import { useState } from "react";
import type { HookId } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { HOOK_DESCRIPTORS } from "../generator/hooks";
import { SelectableRow, cn } from "./primitives";
import { toggle, type SectionProps } from "./sectionShared";

export function HooksSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  const [expandedHook, setExpandedHook] = useState<HookId | null>(null);

  return (
    <div>
      <div
        className="mb-4 rounded-[14px] px-4 py-3 text-xs leading-relaxed"
        style={{
          background: "oklch(0.78 0.15 70 / 0.08)",
          border: "1px solid oklch(0.78 0.15 70 / 0.28)",
          color: "oklch(0.82 0.05 75)",
        }}
      >
        {pick(CHROME.hooks.note, lang)}
      </div>

      <div className="space-y-1.5">
        {HOOK_DESCRIPTORS.map((h) => {
          const on = a.hooks.includes(h.id);
          const open = expandedHook === h.id;
          return (
            <SelectableRow key={h.id} selected={on}>
              <div className="flex items-center gap-2 p-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setA((prev) => ({ ...prev, hooks: toggle<HookId>(prev.hooks, h.id) }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
                      on
                        ? "border-clay-500 bg-clay-500 text-ink-950"
                        : "border-ink-600 text-transparent",
                    )}
                  >
                    ✓
                  </span>
                  <span className="truncate text-sm font-medium text-ink-100">
                    {pick(h.label, lang)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedHook((p) => (p === h.id ? null : h.id))}
                  className="rounded px-2 py-0.5 text-xs text-ink-400 hover:text-clay-300"
                >
                  {pick(CHROME.common.learnMore, lang)} {open ? "▲" : "▼"}
                </button>
              </div>
              {open && (
                <div className="space-y-1.5 border-t border-ink-700 px-3 py-2.5 text-xs leading-relaxed">
                  <p className="text-ink-300">{pick(h.detail, lang)}</p>
                  <p className="text-amber-flag">{pick(h.caveat, lang)}</p>
                </div>
              )}
            </SelectableRow>
          );
        })}
      </div>
    </div>
  );
}
