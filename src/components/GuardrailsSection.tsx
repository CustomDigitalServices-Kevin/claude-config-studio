import type { RuleId } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { RulesSelector } from "./RulesSelector";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { toggle, makeSetOption, type SectionProps } from "./sectionShared";

export function GuardrailsSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  const setOption = makeSetOption(setA);
  const c = CHROME.guardrails;
  return (
    <div className="space-y-6">
      <section>
        <SectionLabel title={pick(c.skillsTitle, lang)} hint={pick(c.skillsHint, lang)} />
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            title={pick(c.skillsOn, lang)}
            subtitle={pick(c.skillsOnSub, lang)}
            selected={a.rulesAsSkills}
            onClick={() => setA((prev) => ({ ...prev, rulesAsSkills: true }))}
          />
          <OptionCard
            title={pick(c.skillsOff, lang)}
            subtitle={pick(c.skillsOffSub, lang)}
            selected={!a.rulesAsSkills}
            onClick={() => setA((prev) => ({ ...prev, rulesAsSkills: false }))}
          />
        </div>
      </section>

      <RulesSelector
        rules={a.rules}
        ruleOptions={a.ruleOptions}
        lang={lang}
        rigor={a.rigor}
        onToggle={(id) => setA((prev) => ({ ...prev, rules: toggle<RuleId>(prev.rules, id) }))}
        onOptionChange={setOption}
      />
    </div>
  );
}
