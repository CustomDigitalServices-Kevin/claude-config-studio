import { optionKey, optionValue, type RuleOption } from "../data/options";
import { pick, type Language, type Rigor } from "../types";
import { cn } from "./primitives";

export function OptionControls({
  ownerId,
  options,
  values,
  onChange,
  lang,
  rigor = "standard",
}: {
  ownerId: string;
  options: RuleOption[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
  lang: Language;
  /** Pilote le defaut effectif des options (macro Rigueur). Defaut "standard" pour les owners hors garde-fous. */
  rigor?: Rigor;
}) {
  if (options.length === 0) {
    return null;
  }
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const key = optionKey(ownerId, opt.id);
        const val = optionValue(values, ownerId, opt, rigor);
        return (
          <div key={opt.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-ink-200">{pick(opt.label, lang)}</span>

              {opt.type === "toggle" && (
                <button
                  type="button"
                  onClick={() => onChange(key, !(val as boolean))}
                  className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                    val ? "bg-clay-500" : "bg-ink-600",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-ink-100 transition-all",
                      val ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </button>
              )}

              {opt.type === "number" && (
                <span className="font-mono text-xs text-clay-300">
                  {String(val)}
                  {opt.unit ? ` ${pick(opt.unit, lang)}` : ""}
                </span>
              )}
            </div>

            {opt.type === "select" && opt.choices && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {opt.choices.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => onChange(key, c.value)}
                    className={cn(
                      "rounded-md border px-2 py-1 text-[11px] transition",
                      val === c.value
                        ? "border-clay-500 bg-clay-500/15 text-clay-300"
                        : "border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600",
                    )}
                  >
                    {pick(c.label, lang)}
                  </button>
                ))}
              </div>
            )}

            {opt.type === "number" && (
              <input
                type="range"
                min={opt.min ?? 0}
                max={opt.max ?? 100}
                step={opt.step ?? 1}
                value={Number(val)}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className="mt-1.5 w-full accent-clay-500"
              />
            )}

            {opt.type === "text" && (
              <input
                type="text"
                value={String(val)}
                onChange={(e) => onChange(key, e.target.value)}
                className="mt-1.5 w-full rounded-md border border-ink-700 bg-ink-800 px-2.5 py-1.5 font-mono text-[11px] text-ink-100 outline-none transition focus:border-clay-500"
              />
            )}

            {opt.hint && (
              <p className="mt-1 text-[11px] leading-snug text-ink-500">{pick(opt.hint, lang)}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
