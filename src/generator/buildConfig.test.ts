import { describe, it, expect } from "vitest";
import { buildConfig, MAX_CLAUDE_MD_LINES } from "./buildConfig";
import {
  DEPTH_IDS,
  PROFILE_IDS,
  RULE_IDS,
  SECTOR_IDS,
  STACK_IDS,
  settingsSchema,
  type Answers,
  type GeneratedFile,
} from "../types";
import { defaultRulesForProfile } from "../data/profiles";
import { ruleById } from "../data/rules";

function makeAnswers(over: Partial<Answers> = {}): Answers {
  return {
    projectName: "my-project",
    author: "",
    org: "",
    authorRole: "",
    companyId: "",
    responseStyle: "",
    language: "fr",
    profiles: ["dev"],
    depth: "n0",
    sectors: [],
    stacks: ["web-ts"],
    rules: defaultRulesForProfile("dev"),
    rigor: "standard",
    hooks: [],
    tools: [],
    skills: [],
    agents: [],
    mcpServers: [],
    toolRules: [],
    ruleOptions: {},
    memoryNote: "",
    advanced: {
      model: "",
      autoMemory: true,
      outputStyle: "",
      permissionMode: "",
      fallbackModel: "",
      responseLanguage: "",
      attribution: "",
    },
    workflow: {
      defaultBehavior: "act",
      advisor: { enabled: false, model: "" },
      orchestration: false,
    },
    ...over,
  };
}

function allText(files: GeneratedFile[]): string {
  return files.map((f) => `${f.path}\n${f.content}`).join("\n");
}

function claudeMdFiles(files: GeneratedFile[]): GeneratedFile[] {
  return files.filter((f) => f.path.endsWith("CLAUDE.md"));
}

function settingsFiles(files: GeneratedFile[]): GeneratedFile[] {
  return files.filter((f) => f.path.endsWith("settings.json"));
}

/**
 * Tokens qui ne doivent JAMAIS fuiter dans la sortie generee (de-personnalisation, advisor point 1).
 * C'est ce grep qui prouve que le generateur est generique et non Kevin-specifique.
 */
const FORBIDDEN_TOKENS = [
  "903904795",
  "Custom Digital",
  "custom-digital-services",
  "Vault_Projets",
  "Memoire_projets",
  "Antigravity",
  "SIREN",
  "robzombi",
];

describe("buildConfig — conformite par profil", () => {
  for (const profile of PROFILE_IDS) {
    it(`profil ${profile} : settings valide, CLAUDE.md <= 200 lignes, zero fuite identite`, () => {
      const files = buildConfig(
        makeAnswers({ profiles: [profile], rules: defaultRulesForProfile(profile) }),
      );

      // settings.json parse + conforme au schema terrain
      for (const s of settingsFiles(files)) {
        const parsed = JSON.parse(s.content) as unknown;
        const result = settingsSchema.safeParse(parsed);
        expect(result.success, `settings invalide pour ${profile}: ${s.path}`).toBe(true);
      }

      // chaque CLAUDE.md sous le plafond
      for (const md of claudeMdFiles(files)) {
        const lines = md.content.split("\n").length;
        expect(
          lines,
          `${md.path} depasse ${MAX_CLAUDE_MD_LINES} lignes (${lines})`,
        ).toBeLessThanOrEqual(MAX_CLAUDE_MD_LINES);
      }

      // zero fuite identite (case-insensitive)
      const text = allText(files).toLowerCase();
      for (const token of FORBIDDEN_TOKENS) {
        expect(
          text.includes(token.toLowerCase()),
          `fuite identite "${token}" dans ${profile}`,
        ).toBe(false);
      }
    });
  }
});

describe("buildConfig — regles selectionnees presentes", () => {
  it("chaque regle cochee apparait (inline ou fichier rules)", () => {
    const rules = [...RULE_IDS];
    const files = buildConfig(makeAnswers({ rules, stacks: ["web-ts"] }));
    const text = allText(files);
    for (const id of rules) {
      const title = ruleById(id).title.fr;
      expect(text.includes(title), `regle absente: ${id} ("${title}")`).toBe(true);
    }
  });
});

describe("buildConfig — plafond 200 lignes (pire cas)", () => {
  for (const depth of DEPTH_IDS) {
    it(`profondeur ${depth} : toutes regles + stacks + 7 secteurs + skills/agents reste <= 200 lignes`, () => {
      // Pire cas volontairement charge : exerce la RACINE avec Hierarchie (7 secteurs) ET la
      // directive INITIALIZE (skills + agents coches), sections non deportables par le cap.
      const files = buildConfig(
        makeAnswers({
          depth,
          profiles: [...PROFILE_IDS],
          sectors: [...SECTOR_IDS],
          rules: [...RULE_IDS],
          stacks: STACK_IDS.filter((s) => s !== "none"),
          hooks: ["session-start-reminder", "stop-checklist", "block-dangerous-bash"],
          skills: ["document-skills"],
          agents: ["cct-code-reviewer"],
          tools: ["obsidian"],
          toolRules: ["obsidian"],
          author: "Alex",
          authorRole: "Freelance developer",
          org: "Acme",
          companyId: "123456789",
          responseStyle: "detailed",
        }),
      );
      for (const md of claudeMdFiles(files)) {
        const lines = md.content.split("\n").length;
        expect(lines, `${md.path}: ${lines} lignes`).toBeLessThanOrEqual(MAX_CLAUDE_MD_LINES);
      }
    });
  }
});

describe("buildConfig — settings garde-fous", () => {
  it("deny de base present sur tout profil", () => {
    const files = buildConfig(makeAnswers());
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      permissions?: { deny?: string[] };
    };
    expect(settings.permissions?.deny).toContain("Bash(rm -rf /)");
    expect(settings.permissions?.deny).toContain("Bash(sudo *)");
  });

  it("profil audit : deny git destructifs + directive lecture seule", () => {
    const files = buildConfig(
      makeAnswers({ profiles: ["audit"], rules: defaultRulesForProfile("audit") }),
    );
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      permissions?: { deny?: string[] };
    };
    expect(settings.permissions?.deny).toContain("Bash(git push --force*)");
    const md = claudeMdFiles(files)[0]!.content;
    expect(md.toLowerCase()).toContain("lecture seule");
  });
});

describe("buildConfig — deny durci (variantes contournables)", () => {
  it("le deny inclut les variantes compactes curl|bash et wget", () => {
    const files = buildConfig(makeAnswers());
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      permissions?: { deny?: string[] };
    };
    const deny = settings.permissions?.deny ?? [];
    for (const p of [
      "Bash(curl *|bash)",
      "Bash(curl *|sh)",
      "Bash(wget -O- *)",
      "Bash(wget *|bash)",
      "Bash(wget *|sh)",
    ]) {
      expect(deny, `variante manquante: ${p}`).toContain(p);
    }
  });
});

describe("buildConfig — settings v2 (fallbackModel / language / attribution)", () => {
  it("emet les cles v2 reglees et reste conforme au schema", () => {
    const files = buildConfig(
      makeAnswers({
        advanced: {
          model: "",
          autoMemory: true,
          outputStyle: "",
          permissionMode: "",
          fallbackModel: "sonnet",
          responseLanguage: "french",
          attribution: "none",
        },
      }),
    );
    const parsed = JSON.parse(settingsFiles(files)[0]!.content) as {
      fallbackModel?: string[];
      language?: string;
      attribution?: { commit?: string; pr?: string };
    };
    expect(parsed.fallbackModel).toEqual(["sonnet"]);
    expect(parsed.language).toBe("french");
    expect(parsed.attribution).toEqual({ commit: "", pr: "" });
    expect(settingsSchema.safeParse(parsed).success).toBe(true);
  });

  it("defauts : aucune cle v2 ecrite (settings minimal)", () => {
    const parsed = JSON.parse(settingsFiles(buildConfig(makeAnswers()))[0]!.content) as Record<
      string,
      unknown
    >;
    expect("fallbackModel" in parsed).toBe(false);
    expect("language" in parsed).toBe(false);
    expect("attribution" in parsed).toBe(false);
  });
});

describe("buildConfig — multi-profils", () => {
  it("union des regles et des deny pour dev + audit", () => {
    const rules = defaultRulesForProfile("dev").concat(defaultRulesForProfile("audit"));
    const files = buildConfig(makeAnswers({ profiles: ["dev", "audit"], rules }));
    const text = allText(files);
    // regle dev (tests) ET regle audit (lecture seule) presentes
    expect(text).toContain(ruleById("tests-required").title.fr);
    expect(text).toContain(ruleById("audit-readonly").title.fr);
    // deny audit cumule avec le deny de base
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      permissions?: { deny?: string[] };
    };
    expect(settings.permissions?.deny).toContain("Bash(rm -rf /)");
    expect(settings.permissions?.deny).toContain("Bash(git push --force*)");
    // les deux postures listees dans CLAUDE.md
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("Profil développement");
    expect(md.toLowerCase()).toContain("lecture seule");
  });

  it("aucun profil selectionne : fallback generique sans crash", () => {
    const files = buildConfig(makeAnswers({ profiles: [], rules: [] }));
    expect(claudeMdFiles(files).length).toBeGreaterThan(0);
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as unknown;
    expect(settingsSchema.safeParse(settings).success).toBe(true);
  });
});

describe("buildConfig — outils selectionnes", () => {
  it("outils selectionnes : TOOLS.md + section CLAUDE.md (sans .mcp.json)", () => {
    const files = buildConfig(makeAnswers({ tools: ["obsidian", "task-master"] }));
    const paths = files.map((f) => f.path);
    expect(paths).toContain("TOOLS.md");
    expect(paths).not.toContain(".mcp.json");

    const tools = files.find((f) => f.path === "TOOLS.md")!.content;
    expect(tools).toContain("Obsidian");
    expect(tools).toContain("task-master-ai");

    const md = claudeMdFiles(files)[0]!.content;
    expect(md.toLowerCase()).toContain("outils à connecter");
  });

  it("regle 0 associee a un outil : injectee dans CLAUDE.md si activee", () => {
    const withRule = buildConfig(makeAnswers({ tools: ["obsidian"], toolRules: ["obsidian"] }));
    const md = claudeMdFiles(withRule)[0]!.content;
    expect(md).toContain("Mémoire Obsidian");
    expect(md).toContain("source de vérité");

    // outil coche mais regle non activee : pas de regle injectee
    const withoutRule = buildConfig(makeAnswers({ tools: ["obsidian"], toolRules: [] }));
    const md2 = claudeMdFiles(withoutRule)[0]!.content;
    expect(md2).not.toContain("Mémoire Obsidian");
  });

  it("parametres de regle : la valeur choisie est injectee dans CLAUDE.md", () => {
    // context-alert : seuil par defaut 90 -> "90%"
    const def = buildConfig(makeAnswers({ rules: ["context-alert"] }));
    expect(claudeMdFiles(def)[0]!.content).toContain("90%");
    // seuil regle a 70 -> "70%"
    const set = buildConfig(
      makeAnswers({ rules: ["context-alert"], ruleOptions: { "context-alert.threshold": 70 } }),
    );
    const md = claudeMdFiles(set)[0]!.content;
    expect(md).toContain("70%");
    expect(md).not.toContain("90%");
  });

  it("parametre de regle outil (Obsidian staleness) injecte avec la valeur", () => {
    const files = buildConfig(
      makeAnswers({
        tools: ["obsidian"],
        toolRules: ["obsidian"],
        ruleOptions: { "obsidian.staleness": 15 },
      }),
    );
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("15 jours");
  });

  it("aucun outil : ni TOOLS.md ni section", () => {
    const files = buildConfig(makeAnswers({ tools: [] }));
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain("TOOLS.md");
    expect(claudeMdFiles(files)[0]!.content.toLowerCase()).not.toContain("outils à connecter");
  });

  it("CLAUDE.md reste sous 200 lignes avec beaucoup d'outils selectionnes", () => {
    const files = buildConfig(
      makeAnswers({
        rules: [...RULE_IDS],
        stacks: STACK_IDS.filter((s) => s !== "none"),
        tools: ["obsidian", "notebooklm", "task-master", "spec-kit", "repomix", "ccusage"],
      }),
    );
    for (const md of claudeMdFiles(files)) {
      expect(md.content.split("\n").length).toBeLessThanOrEqual(MAX_CLAUDE_MD_LINES);
    }
  });
});

describe("buildConfig — .mcp.json opt-in", () => {
  function mcpFile(files: GeneratedFile[]): GeneratedFile | undefined {
    return files.find((f) => f.path === ".mcp.json");
  }

  it("emet un .mcp.json au format officiel, filtre l'id inconnu", () => {
    const files = buildConfig(
      makeAnswers({ mcpServers: ["github", "context7", "totally-unknown-id"] }),
    );
    const mcp = mcpFile(files);
    expect(mcp).toBeDefined();
    const parsed = JSON.parse(mcp!.content) as { mcpServers: Record<string, unknown> };
    expect(Object.keys(parsed.mcpServers).sort()).toEqual(["context7", "github"]);
    expect(parsed.mcpServers.github).toEqual({
      type: "http",
      url: "https://api.githubcopilot.com/mcp/",
    });
  });

  it("filtre les serveurs sans mcpJson (archivés)", () => {
    // sqlite a un mcpJson vide -> ignoré ; github valide -> gardé
    const files = buildConfig(makeAnswers({ mcpServers: ["sqlite", "github"] }));
    const parsed = JSON.parse(mcpFile(files)!.content) as { mcpServers: Record<string, unknown> };
    expect(Object.keys(parsed.mcpServers)).toEqual(["github"]);
  });

  it("aucun .mcp.json quand la sélection MCP est vide", () => {
    const files = buildConfig(makeAnswers({ mcpServers: [] }));
    expect(mcpFile(files)).toBeUndefined();
  });

  it("aucun .mcp.json quand seuls des ids inconnus sont sélectionnés", () => {
    const files = buildConfig(makeAnswers({ mcpServers: ["nope-1", "nope-2"] }));
    expect(mcpFile(files)).toBeUndefined();
  });
});

describe("buildConfig — profondeur (depth)", () => {
  it("n0 : une seule couche racine, ni secteur ni projet", () => {
    const files = buildConfig(makeAnswers({ depth: "n0", sectors: ["web", "infra"] }));
    const paths = files.map((f) => f.path);
    expect(paths).toContain(".claude/CLAUDE.md");
    // aucun dossier de secteur meme si des secteurs sont coches (profondeur n0)
    expect(paths.some((p) => p.startsWith("web/"))).toBe(false);
    expect(paths.some((p) => p.startsWith("infra/"))).toBe(false);
    // pas de section Hierarchie sur une racine sans couche de secteur
    const root = files.find((f) => f.path === ".claude/CLAUDE.md")!.content;
    expect(root).not.toContain("## Hiérarchie");
  });

  it("n0n1 : racine + un squelette N1 par secteur coche (deterministe, sans settings)", () => {
    const files = buildConfig(makeAnswers({ depth: "n0n1", sectors: ["web", "power-platform"] }));
    const paths = files.map((f) => f.path);
    expect(paths).toContain(".claude/CLAUDE.md");
    expect(paths).toContain("web/.claude/CLAUDE.md");
    expect(paths).toContain("power-platform/.claude/CLAUDE.md");
    // les stubs de secteur n'emettent pas de settings.json (heritent de la racine)
    expect(paths).not.toContain("web/.claude/settings.json");
    // pas de couche projet en n0n1
    expect(paths.some((p) => /^web\/[^/]+\/[^/]+\/\.claude/.test(p))).toBe(false);
    // section Hierarchie presente sur la racine, listant les slugs de secteurs
    const root = files.find((f) => f.path === ".claude/CLAUDE.md")!.content;
    expect(root).toContain("## Hiérarchie");
    expect(root).toContain("web, power-platform");
  });

  it("n0n1n2 : ajoute un projet exemple sous le premier secteur", () => {
    const files = buildConfig(
      makeAnswers({ depth: "n0n1n2", sectors: ["web", "infra"], projectName: "acme" }),
    );
    const paths = files.map((f) => f.path);
    expect(paths).toContain(".claude/CLAUDE.md");
    expect(paths).toContain("web/.claude/CLAUDE.md");
    // projet exemple sous le PREMIER secteur uniquement
    expect(paths).toContain("web/acme/.claude/CLAUDE.md");
    expect(
      paths.some(
        (p) => p.startsWith("infra/") && /\/[^/]+\/\.claude/.test(p.slice("infra/".length)),
      ),
    ).toBe(false);
  });

  it("edge case : depth n0n1 sans aucun secteur coche emet la racine seule sans planter", () => {
    const files = buildConfig(makeAnswers({ depth: "n0n1", sectors: [] }));
    const paths = files.map((f) => f.path);
    expect(paths).toContain(".claude/CLAUDE.md");
    // aucune sous-couche
    expect(paths.every((p) => p.startsWith(".claude/") || !p.includes("/.claude/"))).toBe(true);
    expect(paths).toContain("INSTALL.md");
    expect(paths).toContain("README.md");
  });
});

describe("buildConfig — INITIALIZE.md", () => {
  it("emis avec directive dans la racine quand des skills/agents/outils sont coches", () => {
    const files = buildConfig(makeAnswers({ skills: ["document-skills"] }));
    const paths = files.map((f) => f.path);
    expect(paths).toContain("INITIALIZE.md");
    const init = files.find((f) => f.path === "INITIALIZE.md")!.content;
    // porte la commande sourcee (reutilisation de generateSkillsInstall)
    expect(init).toContain("/plugin install document-skills@anthropic-agent-skills");
    // idempotence + auto-suppression finale
    expect(init.toLowerCase()).toContain("idempotence");
    expect(init.toLowerCase()).toContain("supprimer ce fichier");
    // directive de premier lancement dans la racine
    const root = claudeMdFiles(files)[0]!.content;
    expect(root).toContain("INITIALIZE.md");
    expect(root.toLowerCase()).toContain("première interaction");
  });

  it("absent (et pas de directive) quand rien a bootstrapper", () => {
    const files = buildConfig(makeAnswers({ skills: [], agents: [], tools: [] }));
    const paths = files.map((f) => f.path);
    expect(paths).not.toContain("INITIALIZE.md");
    const root = claudeMdFiles(files)[0]!.content;
    expect(root).not.toContain("INITIALIZE.md");
  });
});

describe("buildConfig — langue", () => {
  it("EN ne contient pas de directive francaise", () => {
    const files = buildConfig(makeAnswers({ language: "en" }));
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("Respond in English");
    expect(md).not.toContain("Répondre en français");
  });
});

describe("buildConfig — skills", () => {
  function installMd(files: GeneratedFile[]): string {
    return files.find((f) => f.path === "INSTALL.md")!.content;
  }

  it("commandes d'install exactes + dedup du marketplace add", () => {
    const install = installMd(
      buildConfig(makeAnswers({ skills: ["document-skills", "claude-api", "code-reviewer"] })),
    );
    // un seul `marketplace add` anthropics/skills malgre deux skills du meme repo
    expect(install.split("/plugin marketplace add anthropics/skills").length - 1).toBe(1);
    // commandes slash verbatim (gotcha @anthropic-agent-skills != slug)
    expect(install).toContain("/plugin install document-skills@anthropic-agent-skills");
    expect(install).toContain("/plugin install claude-api@anthropic-agent-skills");
    // cct-cli dans le bloc terminal
    expect(install).toContain(
      "npx claude-code-templates@latest --skill development/code-reviewer --yes",
    );
  });

  it("aucun skill : pas de section skills dans INSTALL", () => {
    const install = installMd(buildConfig(makeAnswers()));
    expect(install.toLowerCase()).not.toContain("skills à installer");
  });
});

describe("buildConfig — agents", () => {
  function installMd(files: GeneratedFile[]): string {
    return files.find((f) => f.path === "INSTALL.md")!.content;
  }

  it("commandes d'install exactes + dedup du marketplace add (meme repo)", () => {
    const install = installMd(
      buildConfig(
        makeAnswers({
          agents: [
            "wshobson-backend-development",
            "wshobson-security-scanning",
            "cct-code-reviewer",
          ],
        }),
      ),
    );
    // un seul `marketplace add wshobson/agents` malgre deux plugins du meme repo
    expect(install.split("/plugin marketplace add wshobson/agents").length - 1).toBe(1);
    // commandes slash verbatim (gotcha @claude-code-workflows != owner/repo)
    expect(install).toContain("/plugin install backend-development@claude-code-workflows");
    expect(install).toContain("/plugin install security-scanning@claude-code-workflows");
    // cct-cli dans le bloc terminal (flag --agent verbatim)
    expect(install).toContain(
      "npx claude-code-templates@latest --agent development-tools/code-reviewer --yes",
    );
  });

  it("deux repos marketplace distincts : deux marketplace add", () => {
    const install = installMd(
      buildConfig(
        makeAnswers({ agents: ["wshobson-backend-development", "anthropics-pr-review-toolkit"] }),
      ),
    );
    expect(install).toContain("/plugin marketplace add wshobson/agents");
    expect(install).toContain("/plugin marketplace add anthropics/claude-code");
    expect(install).toContain("/plugin install pr-review-toolkit@claude-code-plugins");
  });

  it("aucun agent : pas de section agents dans INSTALL", () => {
    const install = installMd(buildConfig(makeAnswers()));
    expect(install).not.toContain("Agents à installer");
  });
});

describe("buildConfig — settings avances", () => {
  it("ecrit les cles avancees reglees et reste conforme au schema", () => {
    const files = buildConfig(
      makeAnswers({
        advanced: {
          model: "sonnet",
          autoMemory: false,
          outputStyle: "Explanatory",
          permissionMode: "plan",
          fallbackModel: "",
          responseLanguage: "",
          attribution: "",
        },
      }),
    );
    const parsed = JSON.parse(settingsFiles(files)[0]!.content) as {
      model?: string;
      outputStyle?: string;
      autoMemoryEnabled?: boolean;
      permissions?: { defaultMode?: string };
    };
    expect(parsed.model).toBe("sonnet");
    expect(parsed.outputStyle).toBe("Explanatory");
    expect(parsed.autoMemoryEnabled).toBe(false);
    expect(parsed.permissions?.defaultMode).toBe("plan");
    expect(settingsSchema.safeParse(parsed).success).toBe(true);
  });

  it("defauts : aucune cle avancee ecrite (settings minimal)", () => {
    const files = buildConfig(makeAnswers());
    const parsed = JSON.parse(settingsFiles(files)[0]!.content) as {
      model?: string;
      outputStyle?: string;
      autoMemoryEnabled?: boolean;
      permissions?: { defaultMode?: string };
    };
    expect("model" in parsed).toBe(false);
    expect("outputStyle" in parsed).toBe(false);
    expect("autoMemoryEnabled" in parsed).toBe(false);
    expect(parsed.permissions?.defaultMode).toBeUndefined();
  });
});

describe("buildConfig — green flag", () => {
  it("prefixe injecte avec le nom de l'auteur, jamais de {name} brut", () => {
    const files = buildConfig(makeAnswers({ rules: ["green-flag"], author: "Alex" }));
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("Green Flag");
    expect(md).toContain("Alex - ");
    expect(md).not.toContain("{name}");
  });

  it("sans auteur : placeholder generique, jamais de {name} brut", () => {
    const files = buildConfig(makeAnswers({ rules: ["green-flag"] }));
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("[votre prénom]");
    expect(md).not.toContain("{name}");
  });
});

describe("buildConfig — rigueur macro", () => {
  it("standard : defauts inchanges (seuil 90, TDD strict present)", () => {
    const md = claudeMdFiles(
      buildConfig(makeAnswers({ rules: ["context-alert", "tests-required"], rigor: "standard" })),
    )[0]!.content;
    expect(md).toContain("90%");
    expect(md).toContain("TDD strict");
  });

  it("strict : seuil abaisse a 85 + incertitude stricte", () => {
    const md = claudeMdFiles(
      buildConfig(makeAnswers({ rules: ["context-alert", "zero-improvisation"], rigor: "strict" })),
    )[0]!.content;
    expect(md).toContain("85%");
    expect(md).not.toContain("90%");
    expect(md.toLowerCase()).toContain("s'arrêter");
  });

  it("light : seuil 95, TDD non impose, couverture happy, URL non exigee", () => {
    const md = claudeMdFiles(
      buildConfig(
        makeAnswers({
          rules: ["context-alert", "tests-required", "zero-improvisation"],
          rigor: "light",
        }),
      ),
    )[0]!.content;
    expect(md).toContain("95%");
    expect(md).not.toContain("TDD strict");
    expect(md).toContain("Tests après implémentation acceptés");
    expect(md).toContain("Couverture minimale : happy path");
    expect(md).not.toContain("Citer l'URL exacte");
  });

  it("override manuel d'un parametre prime sur la macro rigueur", () => {
    const md = claudeMdFiles(
      buildConfig(
        makeAnswers({
          rules: ["context-alert"],
          rigor: "strict",
          ruleOptions: { "context-alert.threshold": 70 },
        }),
      ),
    )[0]!.content;
    expect(md).toContain("70%");
    expect(md).not.toContain("85%");
  });

  it("plafond 200 lignes tenu en strict ET light (toutes regles + stacks)", () => {
    for (const rigor of ["strict", "light"] as const) {
      const files = buildConfig(
        makeAnswers({
          rules: [...RULE_IDS],
          stacks: STACK_IDS.filter((s) => s !== "none"),
          rigor,
        }),
      );
      for (const md of claudeMdFiles(files)) {
        expect(md.content.split("\n").length, `rigueur ${rigor}`).toBeLessThanOrEqual(
          MAX_CLAUDE_MD_LINES,
        );
      }
    }
  });
});

describe("buildConfig — hygiene memoire", () => {
  it("injecte les seuils officiels (200 lignes / 25 Ko) et l'horodatage absolu", () => {
    const md = claudeMdFiles(buildConfig(makeAnswers({ rules: ["memory-hygiene"] })))[0]!.content;
    expect(md).toContain("Hygiène des fichiers mémoire");
    expect(md).toContain("200 premières lignes ou 25 Ko");
    expect(md).toContain("ABSOLU");
    expect(md.toLowerCase()).toContain("hier");
  });

  it("option datetime : date + heure par defaut, date seule si desactivee", () => {
    const withTime = claudeMdFiles(buildConfig(makeAnswers({ rules: ["memory-hygiene"] })))[0]!
      .content;
    expect(withTime).toContain("date + heure");
    const dateOnly = claudeMdFiles(
      buildConfig(
        makeAnswers({
          rules: ["memory-hygiene"],
          ruleOptions: { "memory-hygiene.datetime": false },
        }),
      ),
    )[0]!.content;
    expect(dateOnly).toContain("date seule");
    expect(dateOnly).not.toContain("date + heure");
  });
});

describe("buildConfig — identite avancee", () => {
  it("role + numero d'entreprise injectes, jamais le token SIREN", () => {
    const files = buildConfig(
      makeAnswers({ author: "Alex", authorRole: "Freelance", org: "Acme", companyId: "123456789" }),
    );
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).toContain("Freelance");
    expect(md).toContain("123456789");
    // libelle neutre : le mot SIREN ne doit jamais fuiter dans la sortie (FORBIDDEN_TOKENS)
    expect(md).not.toContain("SIREN");
    expect(md.toLowerCase()).toContain("numéro d'entreprise");
  });

  it("numero d'entreprise ignore si organisation vide (pas de valeur fantome)", () => {
    const files = buildConfig(makeAnswers({ org: "", companyId: "123456789" }));
    const md = claudeMdFiles(files)[0]!.content;
    expect(md).not.toContain("123456789");
  });

  it("style de reponses concise injecte une directive de posture, aucun style = rien", () => {
    const concise = claudeMdFiles(buildConfig(makeAnswers({ responseStyle: "concise" })))[0]!
      .content;
    expect(concise).toContain("Style de réponses");
    expect(concise.toLowerCase()).toContain("l'essentiel");
    const none = claudeMdFiles(buildConfig(makeAnswers({ responseStyle: "" })))[0]!.content;
    expect(none).not.toContain("Style de réponses");
  });
});

describe("buildConfig — green flag parametrable", () => {
  it("defaut : icone coche + nom + token date runtime dans l'en-tete", () => {
    const md = claudeMdFiles(
      buildConfig(makeAnswers({ rules: ["green-flag"], author: "Alex" })),
    )[0]!.content;
    expect(md).toContain("✅ Alex - <date du jour au format long> :");
    expect(md).not.toContain("{header}");
  });

  it("icone + gabarit personnalises + variable {project} interpolee", () => {
    const md = claudeMdFiles(
      buildConfig(
        makeAnswers({
          rules: ["green-flag"],
          author: "Bob",
          projectName: "acme",
          ruleOptions: {
            "green-flag.icon": "star",
            "green-flag.headerText": "{name} sur {project} :",
          },
        }),
      ),
    )[0]!.content;
    expect(md).toContain("⭐ Bob sur acme :");
    expect(md).not.toContain("{name}");
    expect(md).not.toContain("{project}");
  });

  it("icone (aucune) : pas de prefixe d'icone", () => {
    const md = claudeMdFiles(
      buildConfig(
        makeAnswers({
          rules: ["green-flag"],
          author: "Zoe",
          ruleOptions: { "green-flag.icon": "none", "green-flag.headerText": "{name} :" },
        }),
      ),
    )[0]!.content;
    expect(md).toContain("`Zoe :`");
    expect(md).not.toContain("✅");
  });
});

describe("buildConfig — hooks lifecycle (sourcés)", () => {
  it("les nouveaux hooks emettent les bons events dans settings.json", () => {
    const files = buildConfig(
      makeAnswers({ hooks: ["prompt-guardrail", "session-end-reminder", "precompact-note"] }),
    );
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      hooks?: Record<string, unknown>;
    };
    const keys = Object.keys(settings.hooks ?? {});
    expect(keys).toContain("UserPromptSubmit");
    expect(keys).toContain("SessionEnd");
    expect(keys).toContain("PreCompact");
    expect(settingsSchema.safeParse(settings).success).toBe(true);
  });
});

describe("buildConfig — hook prompt-destructive-guard (type prompt, sans shell)", () => {
  it("emet un hook PreToolUse/Bash de type prompt, structure exacte + schema conforme", () => {
    const files = buildConfig(makeAnswers({ hooks: ["prompt-destructive-guard"] }));
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      hooks?: Record<string, Array<{ matcher?: string; hooks: Array<Record<string, unknown>> }>>;
    };
    const pre = settings.hooks?.["PreToolUse"];
    expect(pre).toBeDefined();
    expect(pre!.length).toBe(1);
    expect(pre![0]!.matcher).toBe("Bash");
    const hook = pre![0]!.hooks[0]!;
    expect(hook.type).toBe("prompt");
    expect(typeof hook.prompt).toBe("string");
    expect(hook.prompt as string).toContain("$ARGUMENTS");
    expect(hook).not.toHaveProperty("command");
    expect(settingsSchema.safeParse(settings).success).toBe(true);
  });

  it("coexiste avec block-dangerous-bash : deux entrees PreToolUse (command + prompt)", () => {
    const files = buildConfig(
      makeAnswers({ hooks: ["block-dangerous-bash", "prompt-destructive-guard"] }),
    );
    const settings = JSON.parse(settingsFiles(files)[0]!.content) as {
      hooks?: Record<string, Array<{ hooks: Array<{ type: string }> }>>;
    };
    const pre = settings.hooks?.["PreToolUse"] ?? [];
    expect(pre.length).toBe(2);
    const types = pre.map((e) => e.hooks[0]!.type);
    expect(types).toContain("command");
    expect(types).toContain("prompt");
    expect(settingsSchema.safeParse(settings).success).toBe(true);
  });
});

describe("buildConfig — workflow (posture + advisor + orchestration)", () => {
  function wf(over: Partial<Answers["workflow"]>): Partial<Answers> {
    return {
      workflow: {
        defaultBehavior: "act",
        advisor: { enabled: false, model: "" },
        orchestration: false,
        ...over,
      },
    };
  }

  it("directive de posture selon le comportement par defaut", () => {
    const act = claudeMdFiles(buildConfig(makeAnswers(wf({ defaultBehavior: "act" }))))[0]!.content;
    expect(act).toContain("agir directement");
    const research = claudeMdFiles(
      buildConfig(makeAnswers(wf({ defaultBehavior: "research" }))),
    )[0]!.content;
    expect(research).toContain("consulter la doc officielle");
    const brainstorm = claudeMdFiles(
      buildConfig(makeAnswers(wf({ defaultBehavior: "brainstorm" }))),
    )[0]!.content;
    expect(brainstorm).toContain("brainstormer pour qualifier");
  });

  it("advisor active : emet .claude/agents/advisor.md avec le modele + directive CLAUDE.md", () => {
    const files = buildConfig(makeAnswers(wf({ advisor: { enabled: true, model: "opus" } })));
    const advisor = files.find((f) => f.path === ".claude/agents/advisor.md");
    expect(advisor).toBeDefined();
    expect(advisor?.content).toContain("name: advisor");
    expect(advisor?.content).toContain("model: opus");
    expect(claudeMdFiles(files)[0]!.content).toContain("sous-agent `advisor`");
  });

  it("advisor sans modele : pas de cle model dans le frontmatter", () => {
    const files = buildConfig(makeAnswers(wf({ advisor: { enabled: true, model: "" } })));
    const advisor = files.find((f) => f.path === ".claude/agents/advisor.md");
    expect(advisor?.content).not.toContain("model:");
  });

  it("advisor desactive : pas de fichier advisor.md ni de directive", () => {
    const files = buildConfig(makeAnswers());
    expect(files.some((f) => f.path === ".claude/agents/advisor.md")).toBe(false);
    expect(claudeMdFiles(files)[0]!.content).not.toContain("sous-agent `advisor`");
  });

  it("orchestration : emet .claude/commands/orchestrate.md avec $ARGUMENTS, absent sinon", () => {
    const withOrch = buildConfig(makeAnswers(wf({ orchestration: true })));
    const cmd = withOrch.find((f) => f.path === ".claude/commands/orchestrate.md");
    expect(cmd).toBeDefined();
    expect(cmd?.content).toContain("$ARGUMENTS");
    const noOrch = buildConfig(makeAnswers());
    expect(noOrch.some((f) => f.path === ".claude/commands/orchestrate.md")).toBe(false);
  });
});
