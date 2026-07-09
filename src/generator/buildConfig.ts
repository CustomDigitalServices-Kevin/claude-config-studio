import type { Answers, GeneratedFile, RuleId } from "../types";
import { pick } from "../types";
import { RULE_MODULES, type RuleModule } from "../data/rules";
import { hasProjectLayer, hasSectorLayer } from "../data/depths";
import { sectorById } from "../data/sectors";
import { mcpServerById } from "../data/mcpServers";
import { generateSettings, settingsToJson } from "./settings";
import { generateClaudeMd, generateRuleFile, type ClaudeMdVariant } from "./claudeMd";
import { generateInitialize } from "./initialize";
import { generateInstall } from "./install";
import { generateReadme } from "./readme";
import { generateToolsDoc, toolRulesSection, toolsClaudeMdSection } from "./toolsSetup";
import { generateAdvisorAgent, generateOrchestrateCommand } from "./workflowFiles";
import { countLines, slugify } from "./text";

export const MAX_CLAUDE_MD_LINES = 200;

/** Index canonique d'une règle (core0 d'abord, ordre de RULE_MODULES). */
function ruleOrder(id: RuleId): number {
  return RULE_MODULES.findIndex((r) => r.id === id);
}

interface ResolvedRules {
  core: RuleModule[];
  scoped: RuleModule[];
}

function resolveRules(a: Answers): ResolvedRules {
  const selected = RULE_MODULES.filter((r) => a.rules.includes(r.id)).sort(
    (x, y) => ruleOrder(x.id) - ruleOrder(y.id),
  );
  return {
    core: selected.filter((r) => r.kind === "core"),
    scoped: selected.filter((r) => r.kind === "scoped"),
  };
}

/** Options de rendu propres à une couche (racine, secteur, projet). */
interface LayerExtra {
  isRoot?: boolean;
  layerName?: string;
  initialize?: boolean;
}

/**
 * Construit le CLAUDE.md d'une couche en appliquant le plafond 200 lignes :
 * tant que le fichier dépasse, on déporte la dernière règle non-core0 vers un fichier.
 */
function buildCappedClaudeMd(
  a: Answers,
  variant: ClaudeMdVariant,
  coreRules: RuleModule[],
  scopedRuleIds: RuleId[],
  toolsSection: string,
  extra: LayerExtra,
): { content: string; inline: RuleModule[]; overflow: RuleId[] } {
  const inline = [...coreRules];
  const overflow: RuleId[] = [];

  // boucle de déport bornée (taille finie)
  for (;;) {
    const content = generateClaudeMd(a, {
      variant,
      inlineRules: inline,
      scopedRuleIds,
      overflowRuleIds: overflow,
      toolsSection,
      ...extra,
    });
    if (countLines(content) <= MAX_CLAUDE_MD_LINES) {
      return { content, inline, overflow };
    }
    // chercher la dernière règle non-core0 à déporter
    let removeAt = -1;
    for (let i = inline.length - 1; i >= 0; i--) {
      const rule = inline[i];
      if (rule && !rule.core0) {
        removeAt = i;
        break;
      }
    }
    if (removeAt === -1) {
      // plus rien de déportable : on rend l'état courant (core0 seuls)
      return { content, inline, overflow };
    }
    const removed = inline.splice(removeAt, 1)[0];
    if (removed) {
      overflow.push(removed.id);
    }
  }
}

/** Émet une couche .claude complète (CLAUDE.md + rules + settings optionnel). */
function emitLayer(
  a: Answers,
  basePath: string,
  variant: ClaudeMdVariant,
  coreRules: RuleModule[],
  scopedRules: RuleModule[],
  settingsJson: string | null,
  toolsSection: string,
  extra: LayerExtra = {},
): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const scopedIds = scopedRules.map((r) => r.id);

  const { content, overflow } = buildCappedClaudeMd(
    a,
    variant,
    coreRules,
    scopedIds,
    toolsSection,
    extra,
  );
  files.push({ path: `${basePath}/CLAUDE.md`, content, lang: "markdown" });

  for (const rule of scopedRules) {
    files.push({
      path: `${basePath}/rules/${rule.id}.md`,
      content: generateRuleFile(rule.id, a),
      lang: "markdown",
    });
  }
  for (const id of overflow) {
    files.push({
      path: `${basePath}/rules/${id}.md`,
      content: generateRuleFile(id, a),
      lang: "markdown",
    });
  }
  if (settingsJson) {
    files.push({ path: `${basePath}/settings.json`, content: settingsJson, lang: "json" });
  }
  return files;
}

/** Point d'entrée : transforme les réponses en liste de fichiers prêts pour le ZIP. */
export function buildConfig(a: Answers): GeneratedFile[] {
  const { core, scoped } = resolveRules(a);
  const fullSettings = settingsToJson(generateSettings(a));
  const toolsSection = [toolsClaudeMdSection(a), toolRulesSection(a)]
    .filter((s) => s.length > 0)
    .join("\n\n");
  const files: GeneratedFile[] = [];

  // INITIALIZE.md : bootstrap au premier lancement (null si rien à installer).
  const initializeContent = generateInitialize(a);
  const rootExtra: LayerExtra = { isRoot: true, initialize: initializeContent !== null };

  if (!hasSectorLayer(a.depth)) {
    // Profondeur n0 : une seule couche racine, config complète.
    files.push(
      ...emitLayer(a, ".claude", "single", core, scoped, fullSettings, toolsSection, rootExtra),
    );
  } else {
    // Racine workspace : toutes les règles + settings complet + section outils + Hierarchie + directive INITIALIZE.
    files.push(
      ...emitLayer(a, ".claude", "n1", core, scoped, fullSettings, toolsSection, rootExtra),
    );

    // Squelettes N1 déterministes : un .claude minimal par secteur coché (hérite de la racine, pas de settings).
    const sectors = a.sectors.map(sectorById);
    for (const s of sectors) {
      files.push(
        ...emitLayer(a, `${s.slug}/.claude`, "n2", [], [], null, "", {
          layerName: pick(s.label, a.language),
        }),
      );
    }

    // Profondeur n0n1n2 : un projet exemple sous le premier secteur (démonstration de l'héritage 3 niveaux).
    const first = sectors[0];
    if (hasProjectLayer(a.depth) && first) {
      const proj = slugify(a.projectName);
      files.push(...emitLayer(a, `${first.slug}/${proj}/.claude`, "n3", [], [], null, ""));
    }
  }

  // Posture de travail : sous-agent advisor + commande orchestrate (fichiers séparés, hors CLAUDE.md).
  const advisorAgent = generateAdvisorAgent(a);
  if (advisorAgent) {
    files.push({ path: ".claude/agents/advisor.md", content: advisorAgent, lang: "markdown" });
  }
  const orchestrateCmd = generateOrchestrateCommand(a);
  if (orchestrateCmd) {
    files.push({
      path: ".claude/commands/orchestrate.md",
      content: orchestrateCmd,
      lang: "markdown",
    });
  }

  // Outils sélectionnés : TOOLS.md (fiche détaillée) à la racine de l'archive.
  const toolsDoc = generateToolsDoc(a);
  if (toolsDoc) {
    files.push({ path: "TOOLS.md", content: toolsDoc, lang: "markdown" });
  }

  // .mcp.json opt-in : format officiel {"mcpServers": {"<id>": <mcpJson>}} (code.claude.com/docs/en/mcp,
  // vérifié 2026-07-09). On ne garde que les ids connus au mcpJson non vide (serveurs sans secret requis) ;
  // les ids inconnus ou archivés (mcpJson vide) sont ignorés silencieusement.
  if (a.mcpServers.length > 0) {
    const mcpEntries: Record<string, unknown> = {};
    for (const id of a.mcpServers) {
      const server = mcpServerById(id);
      if (server && server.mcpJson.trim().length > 0) {
        mcpEntries[server.id] = JSON.parse(server.mcpJson) as unknown;
      }
    }
    if (Object.keys(mcpEntries).length > 0) {
      files.push({
        path: ".mcp.json",
        content: JSON.stringify({ mcpServers: mcpEntries }, null, 2) + "\n",
        lang: "json",
      });
    }
  }

  // Docs racine
  if (initializeContent) {
    files.push({ path: "INITIALIZE.md", content: initializeContent, lang: "markdown" });
  }
  files.push({ path: "INSTALL.md", content: generateInstall(a), lang: "markdown" });
  files.push({ path: "README.md", content: generateReadme(a, files), lang: "markdown" });

  return files;
}
