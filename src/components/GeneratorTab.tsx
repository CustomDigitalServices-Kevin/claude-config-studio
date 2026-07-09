import { useMemo, useState, type ComponentType, type Dispatch, type SetStateAction } from "react";
import type { Answers } from "../types";
import { buildConfig } from "../generator/buildConfig";
import { Card } from "./primitives";
import { Preview } from "./Preview";
import { SectionNav, type NavItem } from "./SectionNav";
import { SectionShell } from "./SectionShell";
import { IdentitySection } from "./IdentitySection";
import { ProfilesSection } from "./ProfilesSection";
import { PreferencesSection } from "./PreferencesSection";
import { GuardrailsSection } from "./GuardrailsSection";
import { HooksSection } from "./HooksSection";
import { ToolsSection } from "./ToolsSection";
import { SkillsSection } from "./SkillsSection";
import { AgentsSection } from "./AgentsSection";
import { SettingsSection } from "./SettingsSection";
import { WorkflowSection } from "./WorkflowSection";
import type { SectionProps } from "./sectionShared";

type SectionId =
  | "identity"
  | "profiles"
  | "preferences"
  | "guardrails"
  | "hooks"
  | "tools"
  | "skills"
  | "agents"
  | "workflow"
  | "settings";

interface Section extends NavItem {
  id: SectionId;
  title: string;
  subtitle: string;
  Component: ComponentType<SectionProps>;
}

const SECTIONS: Section[] = [
  {
    id: "identity",
    label: "Identité",
    title: "Identité du projet",
    subtitle: "Les informations de base de votre projet.",
    Component: IdentitySection,
  },
  {
    id: "profiles",
    label: "Profils & structure",
    title: "Profils & structure",
    subtitle: "Choisissez les usages, la profondeur de l'arborescence et les secteurs.",
    Component: ProfilesSection,
  },
  {
    id: "preferences",
    label: "Langue, rigueur & stack",
    title: "Langue, rigueur & stack",
    subtitle: "Langue des fichiers, niveau d'exigence et technologies.",
    Component: PreferencesSection,
  },
  {
    id: "guardrails",
    label: "Garde-fous",
    title: "Garde-fous (règles 0)",
    subtitle: "Les non-négociables. Chaque règle a un détail et des paramètres ajustables.",
    Component: GuardrailsSection,
  },
  {
    id: "hooks",
    label: "Hooks",
    title: "Hooks (opt-in)",
    subtitle: "Sensibles à l'OS et au shell. Limités aux hooks cross-platform surs.",
    Component: HooksSection,
  },
  {
    id: "tools",
    label: "Outils tiers",
    title: "Outils tiers à connecter",
    subtitle:
      "Boostez Claude Code. Le détail de chaque outil va dans TOOLS.md ; les serveurs MCP ont leur onglet dédié.",
    Component: ToolsSection,
  },
  {
    id: "skills",
    label: "Skills",
    title: "Skills à installer",
    subtitle:
      "Catalogue sourcé. La sélection ajoute la commande d'install dans INSTALL.md, sans générer de fichier.",
    Component: SkillsSection,
  },
  {
    id: "agents",
    label: "Agents",
    title: "Agents à installer",
    subtitle:
      "Catalogue sourcé de subagents. La sélection ajoute la commande d'install dans INSTALL.md, sans générer de fichier d'agent.",
    Component: AgentsSection,
  },
  {
    id: "workflow",
    label: "Workflow",
    title: "Workflow (posture de travail)",
    subtitle: "Comportement par défaut face à une demande, sous-agent advisor et orchestration.",
    Component: WorkflowSection,
  },
  {
    id: "settings",
    label: "Settings avancés",
    title: "Settings avancés (settings.json)",
    subtitle: "Réglages écrits dans settings.json, validés contre le schema officiel.",
    Component: SettingsSection,
  },
];

export function GeneratorTab({
  answers,
  setAnswers,
}: {
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("identity");

  const files = useMemo(() => {
    try {
      return buildConfig(answers);
    } catch {
      return [];
    }
  }, [answers]);

  const activeIndex = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === activeSection),
  );
  const active = SECTIONS[activeIndex] ?? SECTIONS[0];
  const ActiveComponent = active.Component;
  const navItems: NavItem[] = SECTIONS.map((s) => ({ id: s.id, label: s.label }));

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[208px_minmax(0,1fr)_minmax(0,1fr)]">
      {/* Rail de navigation */}
      <div className="min-h-0 overflow-y-auto border-b border-ink-700 bg-ink-900 lg:border-b-0 lg:border-r">
        <SectionNav
          items={navItems}
          active={activeSection}
          onSelect={(id) => {
            const next = SECTIONS.find((s) => s.id === id);
            if (next) setActiveSection(next.id);
          }}
        />
      </div>

      {/* Section active */}
      <div className="min-h-0 overflow-y-auto px-5 py-6">
        <SectionShell index={activeIndex + 1} title={active.title} subtitle={active.subtitle}>
          <ActiveComponent answers={answers} setAnswers={setAnswers} />
        </SectionShell>
      </div>

      {/* Preview */}
      <div className="hidden min-h-0 border-l border-ink-700 bg-ink-900 lg:block">
        <Card className="m-0 h-full rounded-none border-0">
          <Preview files={files} projectName={answers.projectName} />
        </Card>
      </div>
    </div>
  );
}
