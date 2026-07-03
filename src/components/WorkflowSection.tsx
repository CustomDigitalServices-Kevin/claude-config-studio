import type { WorkflowSettings } from "../types";
import { pick } from "../types";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { ADVISOR_MODEL_LABELS, BEHAVIOR_OPTIONS } from "../data/workflow";
import type { SectionProps } from "./sectionShared";

export function WorkflowSection({ answers: a, setAnswers: setA }: SectionProps) {
  const w = a.workflow;
  const lang = a.language;
  function patch(p: Partial<WorkflowSettings>): void {
    setA((prev) => ({ ...prev, workflow: { ...prev.workflow, ...p } }));
  }

  return (
    <div className="space-y-7">
      <p className="text-xs leading-relaxed text-ink-400">
        La posture pilote le comportement de Claude Code face à une demande. L'advisor et
        l'orchestration génèrent des fichiers dédiés (<code className="text-clay-300">.claude/agents/advisor.md</code>,{" "}
        <code className="text-clay-300">.claude/commands/orchestrate.md</code>).
      </p>

      <section>
        <SectionLabel
          title="Comportement par défaut"
          hint="Face à une demande : agir tout de suite, chercher la doc d'abord, ou brainstormer pour qualifier avant de commencer."
        />
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
        <SectionLabel
          title="Sous-agent advisor"
          hint="Génère un sous-agent de validation (go/no-go sourcé) + une directive : l'invoquer avant toute décision structurante."
        />
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            title="Activé"
            subtitle="Génère .claude/agents/advisor.md"
            selected={w.advisor.enabled}
            onClick={() => patch({ advisor: { ...w.advisor, enabled: true } })}
          />
          <OptionCard
            title="Désactivé"
            subtitle="Aucun sous-agent généré"
            selected={!w.advisor.enabled}
            onClick={() => patch({ advisor: { ...w.advisor, enabled: false } })}
          />
        </div>
        {w.advisor.enabled && (
          <div className="mt-3">
            <SectionLabel
              title="Modèle de l'advisor"
              hint="Écrit dans le frontmatter de l'agent (clé model). Hériter = pas de clé, l'advisor prend le modèle courant."
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
          title="Orchestration"
          hint="Génère la commande /orchestrate : décompose une tâche complexe et délègue à des sous-agents parallèles."
        />
        <div className="grid grid-cols-2 gap-2.5">
          <OptionCard
            title="Activée"
            subtitle="Génère la commande /orchestrate"
            selected={w.orchestration}
            onClick={() => patch({ orchestration: true })}
          />
          <OptionCard
            title="Désactivée"
            subtitle="Pas de commande générée"
            selected={!w.orchestration}
            onClick={() => patch({ orchestration: false })}
          />
        </div>
      </section>
    </div>
  );
}
