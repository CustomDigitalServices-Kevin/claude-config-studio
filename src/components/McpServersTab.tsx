import type { Dispatch, SetStateAction } from "react";
import { MCP_SERVERS, MCP_CATEGORIES, MCP_INTRO, type McpServer } from "../data/mcpServers";
import { relevantMcpCategories } from "../data/relevance";
import { pick, type Answers, type Language } from "../types";
import { CHROME } from "../i18n/chrome";
import { Badge, CatalogCard, ExternalLink, cn } from "./primitives";
import { VerifiedBadge } from "./VerifiedBadge";
import { toggle } from "./sectionShared";

const T = {
  fr: {
    title: "Connecter un serveur MCP",
    does: "Permet",
    official: "officiel",
    community: "communauté",
    reco: "Recommandé pour vos profils",
  },
  en: {
    title: "Connect an MCP server",
    does: "Lets you",
    official: "official",
    community: "community",
    reco: "Recommended for your profiles",
  },
};

function Code({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto rounded bg-ink-950 px-3 py-1.5 font-mono text-[11px] text-clay-300">
      {children}
    </code>
  );
}

function ServerCard({
  s,
  lang,
  selectable,
  selected,
  onToggle,
}: {
  s: McpServer;
  lang: Language;
  selectable: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const t = T[lang];
  return (
    <CatalogCard hover className="flex flex-col p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-ink-100">{s.name}</h3>
        <Badge tone={s.official ? "moss" : "neutral"}>
          {s.official ? t.official : t.community}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(s.what, lang)}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-400">
        <span className="text-ink-300">{t.does} : </span>
        {pick(s.does, lang)}
      </p>
      <div className="mt-2 space-y-1.5">
        {s.addCommand && <Code>{s.addCommand}</Code>}
        {s.mcpJson && <Code>{`"${s.id}": ${s.mcpJson}`}</Code>}
      </div>
      {s.note && (
        <p className="mt-2 rounded border border-amber-flag/30 bg-amber-flag/10 px-2 py-1.5 text-[11px] text-amber-flag">
          {pick(s.note, lang)}
        </p>
      )}
      {selectable && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-3 flex items-center gap-2 self-start rounded-lg border px-2.5 py-1.5 text-left text-xs transition"
          style={{
            background: selected ? "oklch(0.78 0.155 70 / 0.12)" : "oklch(0.215 0.006 65)",
            borderColor: selected ? "oklch(0.78 0.155 70 / 0.55)" : "oklch(0.30 0.008 65)",
          }}
        >
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px]",
              selected
                ? "border-clay-500 bg-clay-500 text-ink-950"
                : "border-ink-600 text-transparent",
            )}
          >
            ✓
          </span>
          <span className={selected ? "text-clay-300" : "text-ink-300"}>
            {pick(CHROME.mcp.add, lang)}
          </span>
        </button>
      )}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink-800 pt-2 text-xs">
        <ExternalLink href={s.source}>{s.source}</ExternalLink>
        <VerifiedBadge verifiedAt={s.verifiedAt} lang={lang} />
      </div>
    </CatalogCard>
  );
}

export function McpServersTab({
  lang,
  answers,
  setAnswers,
}: {
  lang: Language;
  answers: Answers;
  setAnswers: Dispatch<SetStateAction<Answers>>;
}) {
  const relevant = relevantMcpCategories(answers.profiles);
  const categories = [...MCP_CATEGORIES].sort(
    (a, b) => Number(relevant.has(b.id)) - Number(relevant.has(a.id)),
  );
  const selectedIds = answers.mcpServers;

  function toggleServer(id: string): void {
    setAnswers((prev) => ({ ...prev, mcpServers: toggle<string>(prev.mcpServers, id) }));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <CatalogCard className="p-4">
        <h2 className="text-sm font-semibold text-ink-100">{T[lang].title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(MCP_INTRO, lang)}</p>
      </CatalogCard>

      <div
        className="rounded-[14px] px-4 py-3 text-xs leading-relaxed"
        style={{
          background: "oklch(0.78 0.15 70 / 0.08)",
          border: "1px solid oklch(0.78 0.15 70 / 0.28)",
          color: "oklch(0.82 0.05 75)",
        }}
      >
        <p className="text-sm font-semibold" style={{ color: "oklch(0.85 0.12 75)" }}>
          {pick(CHROME.mcp.optinTitle, lang)}
        </p>
        <p className="mt-1">{pick(CHROME.mcp.optinBody, lang)}</p>
      </div>

      {categories.map((cat) => {
        const servers = MCP_SERVERS.filter((s) => s.category === cat.id);
        if (servers.length === 0) {
          return null;
        }
        const isReco = relevant.has(cat.id);
        return (
          <section key={cat.id}>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-clay-400">
              {pick(cat.label, lang)}
              {isReco && <Badge tone="amber">{T[lang].reco}</Badge>}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {servers.map((s) => (
                <ServerCard
                  key={s.id}
                  s={s}
                  lang={lang}
                  selectable={s.mcpJson.length > 0}
                  selected={selectedIds.includes(s.id)}
                  onToggle={() => toggleServer(s.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
