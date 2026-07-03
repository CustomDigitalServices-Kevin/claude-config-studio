import { ToolsSelector } from "./ToolsSelector";
import { toggle, makeSetOption, type SectionProps } from "./sectionShared";

export function ToolsSection({ answers: a, setAnswers: setA }: SectionProps) {
  const setOption = makeSetOption(setA);
  return (
    <div>
      <ToolsSelector
        selected={a.tools}
        toolRules={a.toolRules}
        ruleOptions={a.ruleOptions}
        onOptionChange={setOption}
        lang={a.language}
        onToggle={(id) =>
          setA((prev) => {
            const willSelect = !prev.tools.includes(id);
            return {
              ...prev,
              tools: toggle<string>(prev.tools, id),
              toolRules: willSelect ? prev.toolRules : prev.toolRules.filter((r) => r !== id),
            };
          })
        }
        onToggleRule={(id) =>
          setA((prev) => ({ ...prev, toolRules: toggle<string>(prev.toolRules, id) }))
        }
      />
      <label className="mt-4 block text-xs text-ink-400">
        Autre base de connaissances (optionnel)
        <input
          value={a.memoryNote}
          onChange={(e) => setA((prev) => ({ ...prev, memoryNote: e.target.value }))}
          placeholder="ex : ./docs/knowledge ou chemin d'un vault"
          className="mt-1 w-full rounded-lg border border-ink-700 bg-ink-800 px-3 py-2 text-sm text-ink-100 outline-none focus:border-clay-500"
        />
      </label>
    </div>
  );
}
