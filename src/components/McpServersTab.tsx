import { MCP_SERVERS, MCP_CATEGORIES, MCP_INTRO, type McpServer } from "../data/mcpServers";
import { relevantMcpCategories } from "../data/relevance";
import { pick, type Language, type ProfileId } from "../types";
import { Badge, CatalogCard, ExternalLink } from "./primitives";

const T = {
  fr: { title: "Connecter un serveur MCP", does: "Permet", official: "officiel", community: "communauté", reco: "Recommandé pour vos profils" },
  en: { title: "Connect an MCP server", does: "Lets you", official: "official", community: "community", reco: "Recommended for your profiles" },
};

function Code({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto rounded bg-ink-950 px-3 py-1.5 font-mono text-[11px] text-clay-300">
      {children}
    </code>
  );
}

function ServerCard({ s, lang }: { s: McpServer; lang: Language }) {
  const t = T[lang];
  return (
    <CatalogCard hover className="flex flex-col p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-ink-100">{s.name}</h3>
        <Badge tone={s.official ? "moss" : "neutral"}>{s.official ? t.official : t.community}</Badge>
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
      <div className="mt-3 border-t border-ink-800 pt-2 text-xs">
        <ExternalLink href={s.source}>{s.source}</ExternalLink>
      </div>
    </CatalogCard>
  );
}

export function McpServersTab({
  lang,
  profiles,
}: {
  lang: Language;
  profiles: ProfileId[];
}) {
  const relevant = relevantMcpCategories(profiles);
  const categories = [...MCP_CATEGORIES].sort(
    (a, b) => Number(relevant.has(b.id)) - Number(relevant.has(a.id)),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <CatalogCard className="p-4">
        <h2 className="text-sm font-semibold text-ink-100">{T[lang].title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(MCP_INTRO, lang)}</p>
      </CatalogCard>

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
                <ServerCard key={s.id} s={s} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
