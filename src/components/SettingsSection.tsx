import type { AdvancedSettings } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { FIELD_HELP } from "../data/fieldHelp";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { LearnMore } from "./LearnMore";
import type { SectionProps } from "./sectionShared";

export function SettingsSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  const adv = a.advanced;
  const c = CHROME.settings;
  function patchAdv(patch: Partial<AdvancedSettings>): void {
    setA((prev) => ({ ...prev, advanced: { ...prev.advanced, ...patch } }));
  }

  const models: { value: AdvancedSettings["model"]; label: string; sub: string }[] = [
    { value: "", label: pick(c.modelDefault, lang), sub: pick(c.modelDefaultSub, lang) },
    { value: "opus", label: "Opus", sub: pick(c.modelOpusSub, lang) },
    { value: "sonnet", label: "Sonnet", sub: pick(c.modelSonnetSub, lang) },
    { value: "haiku", label: "Haiku", sub: pick(c.modelHaikuSub, lang) },
  ];

  const perms: { value: AdvancedSettings["permissionMode"]; label: string; sub: string }[] = [
    { value: "", label: pick(c.permNone, lang), sub: pick(c.permNoneSub, lang) },
    { value: "default", label: "default", sub: pick(c.permDefaultSub, lang) },
    { value: "acceptEdits", label: "acceptEdits", sub: pick(c.permAcceptSub, lang) },
    { value: "plan", label: "plan", sub: pick(c.permPlanSub, lang) },
  ];

  const styles: { value: AdvancedSettings["outputStyle"]; label: string; sub: string }[] = [
    { value: "", label: pick(c.styleDefault, lang), sub: pick(c.styleDefaultSub, lang) },
    { value: "Explanatory", label: "Explanatory", sub: pick(c.styleExplanatorySub, lang) },
    { value: "Learning", label: "Learning", sub: pick(c.styleLearningSub, lang) },
  ];

  const memory: { value: boolean; label: string; sub: string }[] = [
    { value: true, label: pick(c.memoryOn, lang), sub: pick(c.memoryOnSub, lang) },
    { value: false, label: pick(c.memoryOff, lang), sub: pick(c.memoryOffSub, lang) },
  ];

  return (
    <div className="space-y-7">
      <p className="text-xs leading-relaxed text-ink-400">{pick(c.intro, lang)}</p>

      <section>
        <SectionLabel title={pick(c.modelTitle, lang)} hint={pick(c.modelHint, lang)} />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {models.map((m) => (
            <OptionCard
              key={m.value || "default"}
              title={m.label}
              subtitle={m.sub}
              selected={adv.model === m.value}
              onClick={() => patchAdv({ model: m.value })}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.settingsModel, lang)}</LearnMore>
      </section>

      <section>
        <SectionLabel title={pick(c.permTitle, lang)} hint={pick(c.permHint, lang)} />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {perms.map((p) => (
            <OptionCard
              key={p.value || "none"}
              title={p.label}
              subtitle={p.sub}
              selected={adv.permissionMode === p.value}
              onClick={() => patchAdv({ permissionMode: p.value })}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.settingsPermissionMode, lang)}</LearnMore>
      </section>

      <section>
        <SectionLabel title={pick(c.styleTitle, lang)} hint={pick(c.styleHint, lang)} />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {styles.map((s) => (
            <OptionCard
              key={s.value || "default"}
              title={s.label}
              subtitle={s.sub}
              selected={adv.outputStyle === s.value}
              onClick={() => patchAdv({ outputStyle: s.value })}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.settingsOutputStyle, lang)}</LearnMore>
      </section>

      <section>
        <SectionLabel title={pick(c.memoryTitle, lang)} hint={pick(c.memoryHint, lang)} />
        <div className="grid grid-cols-2 gap-2.5">
          {memory.map((m) => (
            <OptionCard
              key={String(m.value)}
              title={m.label}
              subtitle={m.sub}
              selected={adv.autoMemory === m.value}
              onClick={() => patchAdv({ autoMemory: m.value })}
            />
          ))}
        </div>
        <LearnMore lang={lang}>{pick(FIELD_HELP.settingsAutoMemory, lang)}</LearnMore>
      </section>
    </div>
  );
}
