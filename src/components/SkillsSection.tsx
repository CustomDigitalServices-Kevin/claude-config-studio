import { pick } from "../types";
import {
  SKILL_ENTRIES,
  SKILL_CATEGORIES,
  SKILL_METHOD_LABELS,
  SKILL_INTRO,
  skillCategoriesInOrder,
} from "../data/skills";
import { SectionLabel, SelectableRow, Badge, ExternalLink, cn } from "./primitives";
import { VerifiedBadge } from "./VerifiedBadge";
import { toggle, type SectionProps } from "./sectionShared";

export function SkillsSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  const selected = a.skills;

  function toggleSkill(id: string): void {
    setA((prev) => ({ ...prev, skills: toggle<string>(prev.skills, id) }));
  }

  return (
    <div className="space-y-6">
      <p className="text-xs leading-relaxed text-ink-400">{pick(SKILL_INTRO, lang)}</p>

      {skillCategoriesInOrder().map((cat) => {
        const skills = SKILL_ENTRIES.filter((s) => s.category === cat);
        return (
          <section key={cat}>
            <SectionLabel title={pick(SKILL_CATEGORIES[cat], lang)} />
            <div className="space-y-1.5">
              {skills.map((s) => {
                const on = selected.includes(s.id);
                return (
                  <SelectableRow key={s.id} selected={on}>
                    <div className="flex items-start gap-2 p-2.5">
                      <button
                        type="button"
                        onClick={() => toggleSkill(s.id)}
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
                              {s.name}
                            </span>
                            <Badge tone={s.method === "marketplace" ? "clay" : "moss"}>
                              {pick(SKILL_METHOD_LABELS[s.method], lang)}
                            </Badge>
                          </span>
                          <span className="text-xs leading-relaxed text-ink-400">
                            {pick(s.what, lang)}
                          </span>
                          <code className="mt-0.5 block truncate text-[11px] text-ink-500">
                            {s.install}
                          </code>
                          <VerifiedBadge verifiedAt={s.verifiedAt} lang={lang} />
                        </span>
                      </button>
                      <ExternalLink href={s.source}>src</ExternalLink>
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
