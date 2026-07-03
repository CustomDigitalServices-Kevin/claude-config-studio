import { useState } from "react";
import {
  COMPANION_TOOLS,
  CONNECT_KIND_LABELS,
  TOOL_CATEGORIES,
  type CompanionTool,
} from "../data/tools";
import { pick, type Language } from "../types";
import { Badge, cn, ExternalLink, SelectableRow } from "./primitives";
import { OptionControls } from "./OptionControls";

const T = {
  fr: {
    detail: "Détail",
    adds: "Apporte",
    connect: "Connexion",
    pros: "Avantages",
    cons: "Limites",
    addRule: "Ajouter la règle 0 associée",
  },
  en: {
    detail: "Details",
    adds: "Adds",
    connect: "Connect",
    pros: "Pros",
    cons: "Cons",
    addRule: "Add the associated rule",
  },
};

function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
        on ? "border-clay-500 bg-clay-500 text-ink-950" : "border-ink-600 text-transparent",
      )}
    >
      ✓
    </span>
  );
}

function ToolRow({
  tool,
  selected,
  ruleOn,
  expanded,
  ruleOptions,
  onToggle,
  onToggleRule,
  onOptionChange,
  onExpand,
  lang,
}: {
  tool: CompanionTool;
  selected: boolean;
  ruleOn: boolean;
  expanded: boolean;
  ruleOptions: Record<string, string | number | boolean>;
  onToggle: () => void;
  onToggleRule: () => void;
  onOptionChange: (key: string, value: string | number | boolean) => void;
  onExpand: () => void;
  lang: Language;
}) {
  const t = T[lang];
  return (
    <SelectableRow selected={selected}>
      <div className="flex items-center gap-2 p-2.5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <CheckBox on={selected} />
          <span className="truncate text-sm font-medium text-ink-100">{tool.name}</span>
          {tool.official && <Badge tone="moss">{lang === "fr" ? "officiel" : "official"}</Badge>}
        </button>
        <Badge tone="neutral">{pick(CONNECT_KIND_LABELS[tool.connectKind], lang)}</Badge>
        <button
          type="button"
          onClick={onExpand}
          className="rounded px-2 py-0.5 text-xs text-ink-400 hover:text-clay-300"
        >
          {t.detail} {expanded ? "▲" : "▼"}
        </button>
      </div>

      {selected && tool.rule && (
        <div className="border-t border-ink-700/70">
          <button
            type="button"
            onClick={onToggleRule}
            className="flex w-full items-center gap-2 px-3 py-2 text-left"
          >
            <CheckBox on={ruleOn} />
            <span className="text-xs text-ink-200">
              {t.addRule} : <span className="text-clay-300">{pick(tool.rule.title, lang)}</span>
            </span>
          </button>
          {ruleOn && (
            <div className="space-y-2 px-3 pb-2.5">
              {tool.rule.detail && (
                <p className="text-[11px] leading-snug text-ink-400">{pick(tool.rule.detail, lang)}</p>
              )}
              {tool.rule.options && tool.rule.options.length > 0 && (
                <OptionControls
                  ownerId={tool.id}
                  options={tool.rule.options}
                  values={ruleOptions}
                  onChange={onOptionChange}
                  lang={lang}
                />
              )}
            </div>
          )}
        </div>
      )}

      {expanded && (
        <div className="space-y-1.5 border-t border-ink-700 px-3 py-2.5 text-xs leading-relaxed">
          <p className="text-ink-300">{pick(tool.what, lang)}</p>
          <p className="text-ink-300">
            <span className="text-ink-500">{t.adds} : </span>
            {pick(tool.adds, lang)}
          </p>
          <p className="rounded bg-ink-950 px-2 py-1.5 text-[11px] text-clay-300">
            <span className="text-ink-500">{t.connect} : </span>
            {pick(tool.howToConnect, lang)}
          </p>
          <p className="text-moss-500">
            <span className="text-ink-500">{t.pros} : </span>
            {pick(tool.advantages, lang)}
          </p>
          <p className="text-amber-flag">
            <span className="text-ink-500">{t.cons} : </span>
            {pick(tool.disadvantages, lang)}
          </p>
          <ExternalLink href={tool.source}>{tool.source}</ExternalLink>
        </div>
      )}
    </SelectableRow>
  );
}

export function ToolsSelector({
  selected,
  toolRules,
  ruleOptions,
  onToggle,
  onToggleRule,
  onOptionChange,
  lang,
}: {
  selected: string[];
  toolRules: string[];
  ruleOptions: Record<string, string | number | boolean>;
  onToggle: (id: string) => void;
  onToggleRule: (id: string) => void;
  onOptionChange: (key: string, value: string | number | boolean) => void;
  lang: Language;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {TOOL_CATEGORIES.map((cat) => {
        const tools = COMPANION_TOOLS.filter((t) => t.category === cat.id);
        if (tools.length === 0) {
          return null;
        }
        return (
          <div key={cat.id}>
            <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-clay-400">
              {pick(cat.label, lang)}
            </h4>
            <div className="space-y-1.5">
              {tools.map((tool) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  lang={lang}
                  selected={selected.includes(tool.id)}
                  ruleOn={toolRules.includes(tool.id)}
                  expanded={expanded === tool.id}
                  ruleOptions={ruleOptions}
                  onToggle={() => onToggle(tool.id)}
                  onToggleRule={() => onToggleRule(tool.id)}
                  onOptionChange={onOptionChange}
                  onExpand={() => setExpanded((prev) => (prev === tool.id ? null : tool.id))}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
