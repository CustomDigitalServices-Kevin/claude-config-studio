import type { Language, Rigor, StackId } from "../types";
import { pick } from "../types";
import { STACK_PRESETS } from "../data/stacks";
import { FIELD_HELP } from "../data/fieldHelp";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { LearnMore } from "./LearnMore";
import { toggle, type SectionProps } from "./sectionShared";

const LANGS: { value: Language; label: string; sub: string }[] = [
  { value: "fr", label: "Français", sub: "Fichiers générés en français" },
  { value: "en", label: "English", sub: "Generated files in English" },
];

const RIGORS: { value: Rigor; label: string; sub: string }[] = [
  { value: "strict", label: "Strict", sub: "Exigence maximale, seuils durcis" },
  { value: "standard", label: "Standard", sub: "Équilibre par défaut" },
  { value: "light", label: "Light", sub: "Souple, contraintes relâchées" },
];

export function PreferencesSection({ answers: a, setAnswers: setA }: SectionProps) {
  return (
    <div className="space-y-7">
      <section>
        <SectionLabel
          title="Langue des fichiers"
          hint="Langue de la prose générée dans les fichiers .claude."
        />
        <div className="grid grid-cols-2 gap-2.5">
          {LANGS.map((l) => (
            <OptionCard
              key={l.value}
              title={l.label}
              subtitle={l.sub}
              selected={a.language === l.value}
              onClick={() => setA((prev) => ({ ...prev, language: l.value }))}
            />
          ))}
        </div>
        <LearnMore lang={a.language}>{pick(FIELD_HELP.language, a.language)}</LearnMore>
      </section>

      <section>
        <SectionLabel title="Rigueur" hint="Pilote les défauts des paramètres des garde-fous." />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {RIGORS.map((r) => (
            <OptionCard
              key={r.value}
              title={r.label}
              subtitle={r.sub}
              selected={a.rigor === r.value}
              onClick={() => setA((prev) => ({ ...prev, rigor: r.value }))}
            />
          ))}
        </div>
        <LearnMore lang={a.language}>{pick(FIELD_HELP.rigor, a.language)}</LearnMore>
      </section>

      <section>
        <SectionLabel
          title="Stack"
          hint="Définit les permissions allow et les libs à vérifier (context7)."
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {STACK_PRESETS.map((s) => (
            <OptionCard
              key={s.id}
              title={s.label.fr}
              subtitle={s.summary.fr}
              selected={a.stacks.includes(s.id)}
              onClick={() =>
                setA((prev) => ({ ...prev, stacks: toggle<StackId>(prev.stacks, s.id) }))
              }
            />
          ))}
        </div>
        <LearnMore lang={a.language}>{pick(FIELD_HELP.stack, a.language)}</LearnMore>
      </section>
    </div>
  );
}
