import type { Answers } from "../types";
import { defaultRulesForProfile } from "./profiles";

/**
 * Etat initial des reponses du wizard. Deporte hors de App.tsx pour etre reutilisable
 * par les presets (data/presets.ts) sans creer de cycle d'import App -> presets -> App.
 * Aucune valeur personnelle : tout est neutre et vient ensuite de l'utilisateur.
 */
export function initialAnswers(): Answers {
  return {
    projectName: "mon-projet",
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
  };
}
