import type { Answers, RuleId } from "../types";
import { pick } from "../types";
import { effectiveProfiles, profileById } from "../data/profiles";
import { ruleById, ruleOptionsFor, type RuleModule } from "../data/rules";
import { applyOptions, optionValue } from "../data/options";
import { stackById } from "../data/stacks";
import { hasSectorLayer } from "../data/depths";
import { hierarchySection, initializeDirective, stubGuidance } from "./claudeMdSections";
import { advisorDirective, behaviorDirective } from "./workflowFiles";
import { SOURCES } from "../data/sources";
import { joinSections, quote } from "./text";

export type ClaudeMdVariant = "single" | "n1" | "n2" | "n3";

export interface ClaudeMdContext {
  variant: ClaudeMdVariant;
  inlineRules: RuleModule[];
  scopedRuleIds: RuleId[];
  overflowRuleIds: RuleId[];
  /** Section "connexions outils" (couche primaire uniquement), vide sinon. */
  toolsSection?: string;
  /** Couche racine : émet la section Hiérarchie (si secteurs) + la directive INITIALIZE. */
  isRoot?: boolean;
  /** Nom de la couche pour le titre d'un secteur (variant n2). */
  layerName?: string;
  /** Vrai si un INITIALIZE.md est généré : émet la directive de premier lancement. */
  initialize?: boolean;
}

function titleFor(a: Answers, ctx: ClaudeMdContext): string {
  const fr = a.language === "fr";
  switch (ctx.variant) {
    case "n1":
      return `# ${a.projectName} ${fr ? "(racine)" : "(root)"}`;
    case "n2":
      return `# ${ctx.layerName || (fr ? "secteur" : "sector")} ${fr ? "(secteur)" : "(sector)"}`;
    case "n3":
      return `# ${a.projectName} ${fr ? "(projet)" : "(project)"}`;
    case "single":
    default:
      return `# ${a.projectName}`;
  }
}

function inheritanceNote(a: Answers, variant: ClaudeMdVariant): string {
  const fr = a.language === "fr";
  if (variant === "n1") {
    return quote([
      fr
        ? "Workspace racine. Claude Code concatène ce fichier avec ~/.claude (N0) puis les .claude des sous-dossiers (N2/N3), du plus loin au plus proche."
        : "Root workspace. Claude Code concatenates this file with ~/.claude (N0) then the sub-folder .claude files (N2/N3), farthest to nearest.",
    ]);
  }
  if (variant === "n2") {
    return quote([
      fr
        ? "Hérite de ~/.claude (N0) et de la racine. N'AJOUTE que le spécifique de ce secteur, sans dupliquer les règles héritées."
        : "Inherits ~/.claude (N0) and the root. ADDS only this sector's specifics, without duplicating inherited rules.",
    ]);
  }
  if (variant === "n3") {
    return quote([
      fr
        ? "Hérite de la racine et du secteur parent. N'AJOUTE que l'identité et le spécifique de ce projet."
        : "Inherits the root and the parent sector. ADDS only this project's identity and specifics.",
    ]);
  }
  return "";
}

function identityNote(a: Answers): string {
  const fr = a.language === "fr";
  const bits: string[] = [];
  if (a.author.trim()) {
    bits.push(`${fr ? "Auteur" : "Author"} : ${a.author.trim()}`);
  }
  if (a.authorRole.trim()) {
    bits.push(`${fr ? "Rôle" : "Role"} : ${a.authorRole.trim()}`);
  }
  if (a.org.trim()) {
    bits.push(`${fr ? "Organisation" : "Organization"} : ${a.org.trim()}`);
  }
  // Libellé neutre volontaire (jamais "SIREN") : la dé-personnalisation interdit tout token identitaire.
  // Gate sur org : cohérent avec le champ UI (visible seulement si organisation renseignée).
  if (a.companyId.trim() && a.org.trim()) {
    bits.push(
      `${fr ? "Numéro d'entreprise" : "Company registration number"} : ${a.companyId.trim()}`,
    );
  }
  return bits.length > 0 ? quote([bits.join(" - ")]) : "";
}

/** Directive de ton/longueur (posture). Vide si aucun style choisi. Ne recouvre pas les garde-fous. */
function responseStyleLine(a: Answers): string {
  const fr = a.language === "fr";
  switch (a.responseStyle) {
    case "concise":
      return fr
        ? "- Style de réponses : court et direct, aller à l'essentiel."
        : "- Response style: short and direct, get to the point.";
    case "detailed":
      return fr
        ? "- Style de réponses : détaillé, expliquer le raisonnement et les alternatives."
        : "- Response style: detailed, explain the reasoning and alternatives.";
    default:
      return "";
  }
}

function postureSection(a: Answers): string {
  const fr = a.language === "fr";
  const profiles = effectiveProfiles(a.profiles).map(profileById);
  const intros = profiles.map((p) => `- ${pick(p.intro, a.language)}`);
  const lines: string[] = [`## ${fr ? "Posture" : "Posture"}`, "", intros.join("\n")];
  const langLine = fr
    ? "- Répondre en français. Code et commentaires techniques en anglais."
    : "- Respond in English. Code and technical comments in English.";
  lines.push("", langLine);
  lines.push("", behaviorDirective(a));
  const advisorLine = advisorDirective(a);
  if (advisorLine) {
    lines.push(advisorLine);
  }
  const styleLine = responseStyleLine(a);
  if (styleLine) {
    lines.push("", styleLine);
  }
  if (a.memoryNote.trim()) {
    lines.push(
      "",
      `- ${fr ? "Base de connaissances externe" : "External knowledge base"} : ${a.memoryNote.trim()}`,
    );
  }
  return lines.join("\n");
}

function stackSection(a: Answers): string {
  const fr = a.language === "fr";
  const stacks = a.stacks.map(stackById).filter((s) => s.id !== "none");
  if (stacks.length === 0) {
    return "";
  }
  const lines: string[] = [`## Stack`, ""];
  for (const s of stacks) {
    const detail = s.note ? pick(s.note, a.language) : pick(s.summary, a.language);
    lines.push(`- **${pick(s.label, a.language)}** : ${detail}`);
  }
  const wantsContext7 = a.rules.includes("research-before-code");
  const libs = stacks.flatMap((s) => s.context7Libs ?? []);
  if (wantsContext7 && libs.length > 0) {
    lines.push(
      "",
      fr
        ? `- Avant d'éditer du code touchant ${[...new Set(libs)].join(", ")} : vérifier la doc (context7 ou doc officielle).`
        : `- Before editing code touching ${[...new Set(libs)].join(", ")}: check the docs (context7 or official docs).`,
    );
  }
  return lines.join("\n");
}

function renderRuleInline(rule: RuleModule, a: Answers): string {
  let body = pick(rule.body, a.language);
  if (rule.id === "green-flag") {
    const fr = a.language === "fr";
    const name = a.author.trim() || (fr ? "[votre prénom]" : "[your name]");
    const opts = ruleOptionsFor("green-flag");
    const iconOpt = opts.find((o) => o.id === "icon");
    const textOpt = opts.find((o) => o.id === "headerText");
    const iconVal = iconOpt
      ? String(optionValue(a.ruleOptions, "green-flag", iconOpt, a.rigor))
      : "check";
    const rawHeader = textOpt
      ? String(optionValue(a.ruleOptions, "green-flag", textOpt, a.rigor))
      : "{name} - {date} :";
    const iconChars: Record<string, string> = {
      check: "✅",
      dot: "🟢",
      arrow: "▶",
      star: "⭐",
      none: "",
    };
    const iconChar = iconChars[iconVal] ?? "";
    const filledHeader = rawHeader
      .replace(/\{name\}/g, name)
      .replace(/\{project\}/g, a.projectName.trim())
      .replace(/\{date\}/g, fr ? "<date du jour au format long>" : "<today's date, long format>")
      .replace(/\{time\}/g, fr ? "<heure>" : "<time>");
    const header = iconChar ? `${iconChar} ${filledHeader}` : filledHeader;
    body = body.replace(/\{header\}/g, header);
  }
  if (rule.id === "tests-required") {
    const framework = a.stacks
      .map(stackById)
      .map((s) => s.testFramework)
      .find((f): f is string => Boolean(f));
    if (framework) {
      body += `\n- ${a.language === "fr" ? "Framework de test" : "Test framework"} : ${framework}.`;
    }
  }
  body = applyOptions(rule.id, body, ruleOptionsFor(rule.id), a.ruleOptions, a.language, a.rigor);
  return `### ${pick(rule.title, a.language)}\n\n${body}`;
}

function rulesSection(a: Answers, inlineRules: RuleModule[]): string {
  if (inlineRules.length === 0) {
    return "";
  }
  const fr = a.language === "fr";
  const header = `## ${fr ? "Garde-fous (règles 0)" : "Guardrails (rule zero)"}`;
  const blocks = inlineRules.map((r) => renderRuleInline(r, a));
  return [header, "", blocks.join("\n\n")].join("\n");
}

function notesSection(a: Answers, ctx: ClaudeMdContext): string {
  const fr = a.language === "fr";
  const lines: string[] = [];
  if (ctx.scopedRuleIds.length > 0) {
    const names = ctx.scopedRuleIds.map((id) => `\`rules/${id}.md\``).join(", ");
    lines.push(
      fr
        ? `- Règles à chargement cible (path-scoped) : ${names}. Chargées uniquement quand un fichier concerné est touché.`
        : `- Path-scoped rules: ${names}. Loaded only when a matching file is touched.`,
    );
  }
  if (ctx.overflowRuleIds.length > 0) {
    const names = ctx.overflowRuleIds.map((id) => `\`rules/${id}.md\``).join(", ");
    lines.push(
      fr
        ? `- Règles déportées pour garder ce fichier sous 200 lignes : ${names}.`
        : `- Rules offloaded to keep this file under 200 lines: ${names}.`,
    );
  }
  lines.push(
    fr
      ? `- Référence : doc officielle Claude Code ${SOURCES.memory} , ${SOURCES.bestPractices} .`
      : `- Reference: official Claude Code docs ${SOURCES.memory} , ${SOURCES.bestPractices} .`,
  );
  return [`## Notes`, "", lines.join("\n")].join("\n");
}

export function generateClaudeMd(a: Answers, ctx: ClaudeMdContext): string {
  // Stubs de sous-couche (secteur / projet) : minimal, tout le reste est hérité.
  if (ctx.variant === "n2" || ctx.variant === "n3") {
    return joinSections([
      titleFor(a, ctx),
      inheritanceNote(a, ctx.variant),
      stubGuidance(a, ctx.variant === "n2"),
    ]);
  }
  // Couche racine (single / global / n1) : config complète.
  const showHierarchy = ctx.isRoot === true && hasSectorLayer(a.depth);
  const showInitialize = ctx.isRoot === true && ctx.initialize === true;
  const sections = [
    titleFor(a, ctx),
    identityNote(a),
    inheritanceNote(a, ctx.variant),
    postureSection(a),
    stackSection(a),
    showHierarchy ? hierarchySection(a) : "",
    showInitialize ? initializeDirective(a) : "",
    rulesSection(a, ctx.inlineRules),
    ctx.toolsSection ?? "",
    notesSection(a, ctx),
  ];
  return joinSections(sections);
}

/** Génère le contenu d'un fichier rules/<id>.md (scoped avec paths, ou non-scoped). */
export function generateRuleFile(ruleId: RuleId, a: Answers): string {
  const rule = ruleById(ruleId);
  const fr = a.language === "fr";
  const front: string[] = ["---", `name: ${pick(rule.title, a.language)}`];
  front.push(`description: ${pick(rule.summary, a.language)}`);
  if (rule.kind === "scoped" && rule.scopedPaths && rule.scopedPaths.length > 0) {
    const globs = rule.scopedPaths.map((p) => `"${p}"`).join(", ");
    front.push(`paths: [${globs}]`);
  }
  front.push("---");

  const body = renderRuleInline(rule, a).replace(/^### /, "## ");
  const note =
    rule.kind === "scoped"
      ? fr
        ? "\n\n> Chargée uniquement quand un fichier matchant `paths` est touché (chargement cible)."
        : "\n\n> Loaded only when a file matching `paths` is touched (targeted load)."
      : fr
        ? "\n\n> Déportée depuis CLAUDE.md pour garder ce dernier sous 200 lignes."
        : "\n\n> Offloaded from CLAUDE.md to keep it under 200 lines.";

  return `${front.join("\n")}\n\n${body}${note}\n`;
}
