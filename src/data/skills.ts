import type { Localized } from "../types";

/**
 * Catalogue de skills Claude Code installables, SOURCÉ et vérifié (sources primaires :
 * marketplace.json bruts des repos Anthropic + pages composants aitmpl, 2026-06-30).
 * Le générateur n'écrit JAMAIS le corps d'un skill : il ajoute la COMMANDE D'INSTALL dans INSTALL.md.
 *
 * Deux mécaniques canoniques :
 *  - "marketplace" : commandes slash DANS Claude Code (`/plugin marketplace add` puis `/plugin install`).
 *    Gotcha : le suffixe `@<name>` est le champ `name` du marketplace.json, parfois != owner/repo.
 *  - "cct-cli" : commande shell DANS le terminal (`npx claude-code-templates@latest --skill <cat>/<nom> --yes`).
 */
export type SkillInstallMethod = "marketplace" | "cct-cli";

export type SkillCategoryId =
  | "document"
  | "api"
  | "dev-workflow"
  | "frontend"
  | "data"
  | "security"
  | "marketing"
  | "creative"
  | "finance"
  | "product";

export interface SkillEntry {
  id: string;
  /** Date ISO (AAAA-MM-JJ) de la derniere verification de la source (audit fraicheur). */
  verifiedAt?: string;
  name: string;
  category: SkillCategoryId;
  method: SkillInstallMethod;
  what: Localized;
  why: Localized;
  /** Commande d'install VERBATIM (slash `/plugin install ...` ou shell `npx ...`). Jamais reconstruite. */
  install: string;
  /** marketplace : repo à enregistrer via `/plugin marketplace add` (dedupe à la génération). cct-cli : absent. */
  marketplaceRepo?: string;
  source: string;
}

export const SKILL_CATEGORIES: Record<SkillCategoryId, Localized> = {
  document: { fr: "Documents", en: "Documents" },
  api: { fr: "API & SDK", en: "API & SDK" },
  "dev-workflow": { fr: "Workflow dev", en: "Dev workflow" },
  frontend: { fr: "Frontend", en: "Frontend" },
  data: { fr: "Data", en: "Data" },
  security: { fr: "Sécurité", en: "Security" },
  marketing: { fr: "Marketing", en: "Marketing" },
  creative: { fr: "Créatif", en: "Creative" },
  finance: { fr: "Finance", en: "Finance" },
  product: { fr: "Produit", en: "Product" },
};

export const SKILL_METHOD_LABELS: Record<SkillInstallMethod, Localized> = {
  marketplace: { fr: "Dans Claude Code", en: "In Claude Code" },
  "cct-cli": { fr: "Terminal (npx)", en: "Terminal (npx)" },
};

export const SKILL_INTRO: Localized = {
  fr: "Catalogue de skills vérifiés. La sélection n'écrit aucun fichier de skill : elle ajoute la commande d'install exacte dans INSTALL.md. Les commandes `/plugin` se tapent dans Claude Code ; les commandes `npx` dans le terminal.",
  en: "Catalog of verified skills. Selecting one writes no skill file: it adds the exact install command to INSTALL.md. `/plugin` commands run inside Claude Code; `npx` commands in the terminal.",
};

const SKILLS_REPO = "https://github.com/anthropics/skills";
const KNOWLEDGE_REPO = "https://github.com/anthropics/knowledge-work-plugins";
const CCT_REPO = "https://github.com/davila7/claude-code-templates";

export const SKILL_ENTRIES: readonly SkillEntry[] = [
  {
    id: "document-skills",
    verifiedAt: "2026-07-09",
    name: "document-skills",
    category: "document",
    method: "marketplace",
    what: {
      fr: "Suite officielle Anthropic de création/édition de documents Office : docx, pdf, pptx, xlsx.",
      en: "Anthropic's official Office document creation/editing suite: docx, pdf, pptx, xlsx.",
    },
    why: {
      fr: "Laisser Claude produire de vrais fichiers Word/PDF/PowerPoint/Excel sans code maison.",
      en: "Let Claude produce real Word/PDF/PowerPoint/Excel files without custom code.",
    },
    install: "/plugin install document-skills@anthropic-agent-skills",
    marketplaceRepo: "anthropics/skills",
    source: SKILLS_REPO,
  },
  {
    id: "claude-api",
    verifiedAt: "2026-07-09",
    name: "claude-api",
    category: "api",
    method: "marketplace",
    what: {
      fr: "Référence à jour de l'API et du SDK Claude (modèles, pricing, tool use, streaming, MCP).",
      en: "Up-to-date reference for the Claude API and SDK (models, pricing, tool use, streaming, MCP).",
    },
    why: {
      fr: "Évite les hallucinations d'IDs de modèles et de params quand on code contre l'API Claude.",
      en: "Avoids hallucinated model IDs and params when coding against the Claude API.",
    },
    install: "/plugin install claude-api@anthropic-agent-skills",
    marketplaceRepo: "anthropics/skills",
    source: SKILLS_REPO,
  },
  {
    id: "example-skills",
    verifiedAt: "2026-07-09",
    name: "example-skills",
    category: "creative",
    method: "marketplace",
    what: {
      fr: "Collection de skills de référence Anthropic : canvas-design, brand-guidelines, mcp-builder, skill-creator, webapp-testing.",
      en: "Anthropic reference skill collection: canvas-design, brand-guidelines, mcp-builder, skill-creator, webapp-testing.",
    },
    why: {
      fr: "Patterns d'écriture de skills + outils créatifs/techniques prêts à l'emploi.",
      en: "Skill-authoring patterns plus ready-made creative/technical tools.",
    },
    install: "/plugin install example-skills@anthropic-agent-skills",
    marketplaceRepo: "anthropics/skills",
    source: SKILLS_REPO,
  },
  {
    id: "data",
    verifiedAt: "2026-07-09",
    name: "data",
    category: "data",
    method: "marketplace",
    what: {
      fr: "Pack Anthropic knowledge-work pour le data : requêtes SQL, visualisation, analyse.",
      en: "Anthropic knowledge-work data pack: SQL queries, visualization, analysis.",
    },
    why: {
      fr: "Donne à Claude des workflows data structurés au lieu de SQL générique.",
      en: "Gives Claude structured data workflows instead of generic SQL.",
    },
    install: "/plugin install data@knowledge-work-plugins",
    marketplaceRepo: "anthropics/knowledge-work-plugins",
    source: KNOWLEDGE_REPO,
  },
  {
    id: "finance",
    verifiedAt: "2026-07-09",
    name: "finance",
    category: "finance",
    method: "marketplace",
    what: {
      fr: "Pack Anthropic knowledge-work finance : écritures comptables, rapprochement, états financiers.",
      en: "Anthropic knowledge-work finance pack: journal entries, reconciliation, financial statements.",
    },
    why: {
      fr: "Utile pour gérer sa compta sans outil dédié.",
      en: "Useful for handling accounting without a dedicated tool.",
    },
    install: "/plugin install finance@knowledge-work-plugins",
    marketplaceRepo: "anthropics/knowledge-work-plugins",
    source: KNOWLEDGE_REPO,
  },
  {
    id: "product-management",
    verifiedAt: "2026-07-09",
    name: "product-management",
    category: "product",
    method: "marketplace",
    what: {
      fr: "Pack Anthropic knowledge-work PM : specs, roadmaps, user research.",
      en: "Anthropic knowledge-work PM pack: specs, roadmaps, user research.",
    },
    why: {
      fr: "Structure la phase de cadrage produit avant de coder.",
      en: "Structures product scoping before any code.",
    },
    install: "/plugin install product-management@knowledge-work-plugins",
    marketplaceRepo: "anthropics/knowledge-work-plugins",
    source: KNOWLEDGE_REPO,
  },
  {
    id: "code-reviewer",
    verifiedAt: "2026-07-09",
    name: "code-reviewer",
    category: "dev-workflow",
    method: "cct-cli",
    what: {
      fr: "Skill de revue de code outillée (bonnes pratiques + outils modernes).",
      en: "Tooled code-review skill (best practices + modern tooling).",
    },
    why: {
      fr: "Une passe de revue cohérente sur chaque changement.",
      en: "A consistent review pass on every change.",
    },
    install: "npx claude-code-templates@latest --skill development/code-reviewer --yes",
    source: CCT_REPO,
  },
  {
    id: "senior-security",
    verifiedAt: "2026-07-09",
    name: "senior-security",
    category: "security",
    method: "cct-cli",
    what: {
      fr: "Boîte à outils sécurité : threat modeling, audit, automatisation pentest.",
      en: "Security toolkit: threat modeling, audit, pentest automation.",
    },
    why: {
      fr: "Couche sécurité offensive/défensive sans installer un MCP dédié.",
      en: "Offensive/defensive security layer without installing a dedicated MCP.",
    },
    install: "npx claude-code-templates@latest --skill development/senior-security --yes",
    source: CCT_REPO,
  },
  {
    id: "react-best-practices",
    verifiedAt: "2026-07-09",
    name: "react-best-practices",
    category: "frontend",
    method: "cct-cli",
    what: {
      fr: "Guide d'optimisation perf React/Next.js (40+ règles classées par impact).",
      en: "React/Next.js performance optimization guide (40+ rules ranked by impact).",
    },
    why: {
      fr: "Aligne Claude sur les patterns perf React 19 / Next 16.",
      en: "Aligns Claude with React 19 / Next 16 performance patterns.",
    },
    install: "npx claude-code-templates@latest --skill web-development/react-best-practices --yes",
    source: CCT_REPO,
  },
  {
    id: "seo-optimizer",
    verifiedAt: "2026-07-09",
    name: "seo-optimizer",
    category: "marketing",
    method: "cct-cli",
    what: {
      fr: "Guidance SEO : contenu, implémentation technique, planification stratégique.",
      en: "SEO guidance: content, technical implementation, strategic planning.",
    },
    why: {
      fr: "Rendre un site généré réellement indexable et bien classé.",
      en: "Make a generated site genuinely indexable and well-ranked.",
    },
    install: "npx claude-code-templates@latest --skill business-marketing/seo-optimizer --yes",
    source: CCT_REPO,
  },
];

export function skillById(id: string): SkillEntry | undefined {
  return SKILL_ENTRIES.find((s) => s.id === id);
}

/** Catégories présentes dans le catalogue, dans l'ordre des entrées. */
export function skillCategoriesInOrder(): SkillCategoryId[] {
  const seen = new Set<SkillCategoryId>();
  const out: SkillCategoryId[] = [];
  for (const s of SKILL_ENTRIES) {
    if (!seen.has(s.category)) {
      seen.add(s.category);
      out.push(s.category);
    }
  }
  return out;
}
