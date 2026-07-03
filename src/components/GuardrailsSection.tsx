import type { RuleId } from "../types";
import { RulesSelector } from "./RulesSelector";
import { toggle, makeSetOption, type SectionProps } from "./sectionShared";

export function GuardrailsSection({ answers: a, setAnswers: setA }: SectionProps) {
  const setOption = makeSetOption(setA);
  return (
    <RulesSelector
      rules={a.rules}
      ruleOptions={a.ruleOptions}
      lang={a.language}
      rigor={a.rigor}
      onToggle={(id) => setA((prev) => ({ ...prev, rules: toggle<RuleId>(prev.rules, id) }))}
      onOptionChange={setOption}
    />
  );
}
