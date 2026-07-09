import type { WorkflowSettings } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { ADVISOR_MODEL_LABELS, BEHAVIOR_OPTIONS } from "../data/workflow";
import type { SectionProps } from "./sectionShared";

export function WorkflowSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  const w = a.workflow;
  const c = CHROME.workflow;
  function patch(p: Partial<WorkflowSettings>): void {
    setA((prev) => ({ ...prev, workflow: { ...prev.workflow, ...p } }));
  }

  return (
    <div className="space-y-7">
      <p className="text-xs leading-relaxed text-ink-400">
        {pick(c.intro, lang)} (<code className="text-clay-300">.claude/agents/advisor.md</code>,{" "}
        <code className="text-clay-300">.claude/commands/orchestrate.md</code>).
      </p>

      <section>
        <SectionLabel title={pick(c.behaviorTitle, lang)} hint={pick(c.behaviorHint, lang)} />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {BEHAVIOR_OPTIONS.map((b) => (
            <OptionCard
              key={b.value}
              title={pick(b.label, lang)}
              subtitle={pick(b.sub, lang)}
              selected={w.defaultBehavior === b.value}
              onClick={() => patch({ defaultBehavior: b.value })}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel title={pick(c.advisorTitle, lang)} hint={pick(c.advisorHint, lang)} />
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            title={pick(c.advisorOn, lang)}
            subtitle={pick(c.advisorOnSub, lang)}
            selected={w.advisor.enabled}
            onClick={() => patch({ advisor: { ...w.advisor, enabled: true } })}
          />
          <OptionCard
            title={pick(c.advisorOff, lang)}
            subtitle={pick(c.advisorOffSub, lang)}
            selected={!w.advisor.enabled}
            onClick={() => patch({ advisor: { ...w.advisor, enabled: false } })}
          />
        </div>
        {w.advisor.enabled && (
          <div className="mt-3">
            <SectionLabel
              title={pick(c.advisorModelTitle, lang)}
              hint={pick(c.advisorModelHint, lang)}
            />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {ADVISOR_MODEL_LABELS.map((m) => (
                <OptionCard
                  key={m.value || "inherit"}
                  title={pick(m.label, lang)}
                  subtitle={pick(m.sub, lang)}
                  selected={w.advisor.model === m.value}
                  onClick={() => patch({ advisor: { ...w.advisor, model: m.value } })}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <SectionLabel
          title={pick(c.orchestrationTitle, lang)}
          hint={pick(c.orchestrationHint, lang)}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            title={pick(c.orchestrationOn, lang)}
            subtitle={pick(c.orchestrationOnSub, lang)}
            selected={w.orchestration}
            onClick={() => patch({ orchestration: true })}
          />
          <OptionCard
            title={pick(c.orchestrationOff, lang)}
            subtitle={pick(c.orchestrationOffSub, lang)}
            selected={!w.orchestration}
            onClick={() => patch({ orchestration: false })}
          />
        </div>
      </section>
    </div>
  );
}
