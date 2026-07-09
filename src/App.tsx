import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { GeneratorTab } from "./components/GeneratorTab";
import { MarketplacesTab } from "./components/MarketplacesTab";
import { McpServersTab } from "./components/McpServersTab";
import { cn } from "./components/primitives";
import { defaultRulesForProfile } from "./data/profiles";
import { loadAnswers, saveAnswers, clearAnswers } from "./lib/persist";
import { encodeAnswers, decodeAnswers } from "./lib/permalink";
import { parseManifestJson, parseManifestZip } from "./lib/manifest";
import type { Answers, Language } from "./types";

type Tab = "generator" | "marketplaces" | "mcp";

const TAB_LABELS: Record<Tab, Record<Language, string>> = {
  generator: { fr: "Générateur .claude", en: ".claude generator" },
  marketplaces: { fr: "Marketplaces", en: "Marketplaces" },
  mcp: { fr: "MCP Serveurs", en: "MCP Servers" },
};

const TAB_ORDER: Tab[] = ["generator", "marketplaces", "mcp"];

const SUBTITLE: Record<Language, string> = {
  fr: "Générateur de configuration .claude + catalogue marketplaces et outils Claude Code",
  en: ".claude configuration generator + catalog of Claude Code marketplaces and tools",
};

function initialAnswers(): Answers {
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

export function App() {
  const [tab, setTab] = useState<Tab>("generator");
  const [lang, setLang] = useState<Language>("fr");
  const [answers, setAnswers] = useState<Answers>(() => loadAnswers() ?? initialAnswers());
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Permalien prioritaire au montage : un lien recu (#c=...) prime sur le localStorage.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#c=")) {
      return;
    }
    let cancelled = false;
    void decodeAnswers(hash.slice(3)).then((decoded) => {
      if (!cancelled && decoded) {
        setAnswers(decoded);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave debounce 500 ms : chaque changement de reponses est persiste apres une pause.
  useEffect(() => {
    const id = setTimeout(() => saveAnswers(answers), 500);
    return () => clearTimeout(id);
  }, [answers]);

  function clearPermalinkHash() {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  function onReset() {
    if (!window.confirm("Réinitialiser toutes les réponses ? Cette action est irréversible.")) {
      return;
    }
    clearAnswers();
    clearPermalinkHash();
    setAnswers(initialAnswers());
  }

  async function onCopyLink() {
    try {
      const encoded = await encodeAnswers(answers);
      window.history.replaceState(null, "", `#c=${encoded}`);
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("[permalink] copy failed", err);
    }
  }

  async function onImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    setImportError(null);
    const imported = file.name.toLowerCase().endsWith(".zip")
      ? await parseManifestZip(await file.arrayBuffer())
      : parseManifestJson(await file.text());
    if (imported) {
      clearPermalinkHash();
      setAnswers(imported);
    } else {
      setImportError("Import invalide");
      window.setTimeout(() => setImportError(null), 3000);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-ink-700 bg-ink-900 px-5 py-3">
        <img src="./favicon.svg" alt="" className="h-7 w-7" />
        <div className="leading-tight">
          <h1 className="text-base font-semibold text-ink-100">Claude Config Studio</h1>
          <p className="text-xs text-ink-400">{SUBTITLE[lang]}</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Actions studio (persistance / permalien / import). Cluster autonome, cf B3. */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip"
            className="hidden"
            onChange={onImportFile}
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
            >
              Importer
            </button>
            <button
              type="button"
              onClick={onCopyLink}
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
            >
              {copied ? "Lien copié" : "Copier le lien"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
            >
              Réinitialiser
            </button>
            {importError && <span className="text-xs text-amber-flag">{importError}</span>}
          </div>
          <a
            href="https://custom-digital-services.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-clay-500 px-3 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-clay-400"
          >
            Custom Digital Services
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
          <div className="flex overflow-hidden rounded-lg border border-ink-700">
            {(["fr", "en"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "px-2.5 py-1 text-xs transition",
                  lang === l ? "bg-clay-500/20 text-clay-300" : "text-ink-400 hover:text-ink-200",
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <nav className="flex gap-1">
            {TAB_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  tab === id
                    ? "bg-clay-500/15 text-clay-300"
                    : "text-ink-400 hover:bg-ink-800 hover:text-ink-200",
                )}
              >
                {TAB_LABELS[id][lang]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {tab === "generator" && <GeneratorTab answers={answers} setAnswers={setAnswers} />}
        {tab === "marketplaces" && (
          <div className="h-full overflow-y-auto">
            <MarketplacesTab lang={lang} profiles={answers.profiles} />
          </div>
        )}
        {tab === "mcp" && (
          <div className="h-full overflow-y-auto">
            <McpServersTab lang={lang} profiles={answers.profiles} />
          </div>
        )}
      </main>
    </div>
  );
}
