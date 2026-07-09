import type { Language, Localized, Rigor, StackId } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { STACK_PRESETS } from "../data/stacks";
import { FIELD_HELP } from "../data/fieldHelp";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { LearnMore } from "./LearnMore";
import { toggle, type SectionProps } from "./sectionShared";

const LANGS: { value: Language; label: string; sub: Localized }[] = [
  { value: "fr", label: "Français", sub: CHROME.preferences.langFrSub },
  { value: "en", label: "English", sub: CHROME.preferences.langEnSub },
];

const RIGORS: { value: Rigor; label: Localized; sub: Localized }[] = [
  { value: "strict", label: CHROME.preferences.rigorStrict, sub: CHROME.preferences.rigorStrictSub },
  {
    value: "standard",
    label: CHROME.preferences.rigorStandard,
    sub: CHROME.preferences.rigorStandardSub,
  },
  { value: "light", label: CHROME.preferences.rigorLight, sub: CHROME.preferences.rigorLightSub },
];

export function PreferencesSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  return (
    <div className="space-y-7">
      <section>
        <SectionLabel
          title={pick(CHROME.preferences.langTitle, lang)}
          hint={pick(CHROME.preferences.langHint, lang)}
        />
        <div className="grid grid-cols-2 gap-2.5">
          {LANGS.map((l) => (
            <OptionCard
              key={l.value}
              title={l.label}
              subtitle={pick(l.sub, lang)}
              selected={a.language === l.value}
              onClick={() => setA((prev) => ({ ...prev, language: l.value }))}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.language, lang)}</LearnMore>
      </section>

      <section>
        <SectionLabel
          title={pick(CHROME.preferences.rigorTitle, lang)}
          hint={pick(CHROME.preferences.rigorHint, lang)}
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {RIGORS.map((r) => (
            <OptionCard
              key={r.value}
              title={pick(r.label, lang)}
              subtitle={pick(r.sub, lang)}
              selected={a.rigor === r.value}
              onClick={() => setA((prev) => ({ ...prev, rigor: r.value }))}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.rigor, lang)}</LearnMore>
      </section>

      <section>
        <SectionLabel
          title={pick(CHROME.preferences.stackTitle, lang)}
          hint={pick(CHROME.preferences.stackHint, lang)}
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {STACK_PRESETS.map((s) => (
            <OptionCard
              key={s.id}
              title={pick(s.label, lang)}
              subtitle={pick(s.summary, lang)}
              selected={a.stacks.includes(s.id)}
              onClick={() =>
                setA((prev) => ({ ...prev, stacks: toggle<StackId>(prev.stacks, s.id) }))
              }
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.stack, lang)}</LearnMore>
      </section>
    </div>
  );
}
