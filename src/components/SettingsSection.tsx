import type { AdvancedSettings } from "../types";
import { pick } from "../types";
import { FIELD_HELP } from "../data/fieldHelp";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { LearnMore } from "./LearnMore";
import type { SectionProps } from "./sectionShared";

const MODELS: { value: AdvancedSettings["model"]; label: string; sub: string }[] = [
  { value: "", label: "Par défaut", sub: "Modèle courant de Claude Code" },
  { value: "opus", label: "Opus", sub: "Le plus capable" },
  { value: "sonnet", label: "Sonnet", sub: "Équilibre capacité/vitesse" },
  { value: "haiku", label: "Haiku", sub: "Le plus rapide" },
];

const PERMS: { value: AdvancedSettings["permissionMode"]; label: string; sub: string }[] = [
  { value: "", label: "Ne pas fixer", sub: "Comportement par défaut" },
  { value: "default", label: "default", sub: "Demande à la 1re utilisation" },
  { value: "acceptEdits", label: "acceptEdits", sub: "Auto-accepte les éditions" },
  { value: "plan", label: "plan", sub: "Lecture seule stricte" },
];

const STYLES: { value: AdvancedSettings["outputStyle"]; label: string; sub: string }[] = [
  { value: "", label: "Par défaut", sub: "Style standard" },
  { value: "Explanatory", label: "Explanatory", sub: "Explications pédagogiques" },
  { value: "Learning", label: "Learning", sub: "Exercices proposés" },
];

const MEMORY: { value: boolean; label: string; sub: string }[] = [
  { value: true, label: "Activée", sub: "Mémoire inter-sessions (défaut)" },
  { value: false, label: "Désactivée", sub: "Écrit autoMemoryEnabled: false" },
];

export function SettingsSection({ answers: a, setAnswers: setA }: SectionProps) {
  const adv = a.advanced;
  const lang = a.language;
  function patchAdv(patch: Partial<AdvancedSettings>): void {
    setA((prev) => ({ ...prev, advanced: { ...prev.advanced, ...patch } }));
  }

  return (
    <div className="space-y-7">
      <p className="text-xs leading-relaxed text-ink-400">
        Réglages écrits dans <code className="text-clay-300">settings.json</code>. Chaque clé est
        validée contre le schéma officiel ; une valeur laissée au défaut n'est pas écrite (fichier
        minimal). Visibles en direct dans l'aperçu.
      </p>

      <section>
        <SectionLabel
          title="Modèle principal"
          hint="Alias écrit dans settings.json. Par défaut, Claude Code garde son modèle courant."
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {MODELS.map((m) => (
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
        <SectionLabel
          title="Mode de permission par défaut"
          hint="Limité aux valeurs sûres. plan = lecture seule ; acceptEdits = auto-accepte les éditions ; default = demande à la première utilisation."
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PERMS.map((p) => (
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
        <SectionLabel
          title="Style de sortie"
          hint="Explanatory ajoute des explications pédagogiques ; Learning propose des exercices. Par défaut, style standard."
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {STYLES.map((s) => (
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
        <SectionLabel
          title="Mémoire automatique"
          hint="Mémoire inter-sessions (activée par défaut chez Claude Code). La désactiver écrit autoMemoryEnabled:false."
        />
        <div className="grid grid-cols-2 gap-2.5">
          {MEMORY.map((m) => (
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
