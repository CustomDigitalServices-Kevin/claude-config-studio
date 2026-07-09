import { pick } from "../types";
import {
  AGENT_ENTRIES,
  AGENT_CATEGORIES,
  AGENT_METHOD_LABELS,
  AGENT_INTRO,
  agentCategoriesInOrder,
} from "../data/agents";
import { SectionLabel, SelectableRow, Badge, ExternalLink, cn } from "./primitives";
import { toggle, type SectionProps } from "./sectionShared";

export function AgentsSection({ answers: a, setAnswers: setA }: SectionProps) {
  const lang = a.language;
  const selected = a.agents;

  function toggleAgent(id: string): void {
    setA((prev) => ({ ...prev, agents: toggle<string>(prev.agents, id) }));
  }

  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-ink-400">{pick(AGENT_INTRO, lang)}</p>

      {agentCategoriesInOrder().map((cat) => {
        const agents = AGENT_ENTRIES.filter((x) => x.category === cat);
        return (
          <section key={cat}>
            <SectionLabel title={pick(AGENT_CATEGORIES[cat], lang)} />
            <div className="space-y-1.5">
              {agents.map((x) => {
                const on = selected.includes(x.id);
                return (
                  <SelectableRow key={x.id} selected={on}>
                    <div className="flex items-start gap-2 p-2.5">
                      <button
                        type="button"
                        onClick={() => toggleAgent(x.id)}
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
                            on
                              ? "border-clay-500 bg-clay-500 text-ink-950"
                              : "border-ink-600 text-transparent",
                          )}
                        >
                          ✓
                        </span>
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium text-ink-100">
                              {x.name}
                            </span>
                            <Badge tone={x.method === "marketplace" ? "clay" : "moss"}>
                              {pick(AGENT_METHOD_LABELS[x.method], lang)}
                            </Badge>
                          </span>
                          <span className="text-xs leading-relaxed text-ink-400">
                            {pick(x.what, lang)}
                          </span>
                          <code className="mt-0.5 block truncate text-[11px] text-ink-500">
                            {x.install}
                          </code>
                        </span>
                      </button>
                      <ExternalLink href={x.source}>src</ExternalLink>
                    </div>
                  </SelectableRow>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
