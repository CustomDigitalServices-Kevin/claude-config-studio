import { useMemo, useState, type ComponentType, type Dispatch, type SetStateAction } from "react";
import type { Answers, GeneratedFile, Language, Localized } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { buildConfig } from "../generator/buildConfig";
import { DownloadButton } from "./DownloadButton";
import { GeneratorError } from "./GeneratorError";
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

interface Section {
  id: SectionId;
  label: Localized;
  title: Localized;
  subtitle: Localized;
  Component: ComponentType<SectionProps>;
}

const SECTIONS: Section[] = [
  { id: "identity", ...CHROME.sections.identity, Component: IdentitySection },
  { id: "profiles", ...CHROME.sections.profiles, Component: ProfilesSection },
  { id: "preferences", ...CHROME.sections.preferences, Component: PreferencesSection },
  { id: "guardrails", ...CHROME.sections.guardrails, Component: GuardrailsSection },
  { id: "hooks", ...CHROME.sections.hooks, Component: HooksSection },
  { id: "tools", ...CHROME.sections.tools, Component: ToolsSection },
  { id: "skills", ...CHROME.sections.skills, Component: SkillsSection },
  { id: "agents", ...CHROME.sections.agents, Component: AgentsSection },
  { id: "workflow", ...CHROME.sections.workflow, Component: WorkflowSection },
  { id: "settings", ...CHROME.sections.settings, Component: SettingsSection },
];

export function GeneratorTab({
  answers,
  setAnswers,
  lang,
}: {
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
  lang: Language;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("identity");

  const { files, error } = useMemo<{ files: GeneratedFile[]; error: Error | null }>(() => {
    try {
      return { files: buildConfig(answers), error: null };
    } catch (err) {
      console.error("[buildConfig] generation du .claude echouee", err);
      return { files: [], error: err instanceof Error ? err : new Error(String(err)) };
    }
  }, [answers]);

  const activeIndex = Math.max(
    0,
    SECTIONS.findIndex((s) => s.id === activeSection),
  );
  const active = SECTIONS[activeIndex] ?? SECTIONS[0];
  const ActiveComponent = active.Component;
  const navItems: NavItem[] = SECTIONS.map((s) => ({ id: s.id, label: pick(s.label, lang) }));

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
        {/* Barre compacte de telechargement, visible seulement sous lg (la colonne preview
            desktop est masquee en dessous de 1024px, donc le bouton du preview y est inaccessible). */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-ink-700 bg-ink-900 px-4 py-3 lg:hidden">
          <span className="text-xs text-ink-400">
            {files.length} {pick(CHROME.preview.files, lang)}
          </span>
          <DownloadButton
            files={files}
            projectName={answers.projectName}
            lang={lang}
            disabled={error !== null}
          />
        </div>
        {error && (
          <div className="mb-4 lg:hidden">
            <GeneratorError error={error} lang={lang} />
          </div>
        )}

        <SectionShell
          index={activeIndex + 1}
          title={pick(active.title, lang)}
          subtitle={pick(active.subtitle, lang)}
        >
          <ActiveComponent answers={answers} setAnswers={setAnswers} lang={lang} />
        </SectionShell>
      </div>

      {/* Preview */}
      <div className="hidden min-h-0 border-l border-ink-700 bg-ink-900 lg:block">
        <Card className="m-0 h-full rounded-none border-0">
          <Preview files={files} projectName={answers.projectName} lang={lang} error={error} />
        </Card>
      </div>
    </div>
  );
}
