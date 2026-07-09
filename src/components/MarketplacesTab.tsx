import { MARKETPLACES, MARKETPLACE_KIND_LABELS, INSTALL_MECHANICS } from "../data/marketplaces";
import { GENERAL_MARKETPLACES, MARKETPLACE_TOPICS } from "../data/generalMarketplaces";
import { relevantMarketplaceTopics } from "../data/relevance";
import { pick, type Language, type ProfileId } from "../types";
import { Badge, CatalogCard, ExternalLink } from "./primitives";

const T = {
  fr: {
    reco: "Recommandé pour vos profils",
    byTopic: "Marketplaces par sujet",
    ccTitle: "Marketplaces de plugins Claude Code",
    howto: "Comment installer un plugin",
    find: "On y trouve",
    official: "officiel",
    community: "communauté",
    plugins: "plugins",
    colPlugin: "Plugin",
    colWhat: "Ce que c'est",
    colWhen: "Quand le prendre",
  },
  en: {
    reco: "Recommended for your profiles",
    byTopic: "Marketplaces by topic",
    ccTitle: "Claude Code plugin marketplaces",
    howto: "How to install a plugin",
    find: "You find",
    official: "official",
    community: "community",
    plugins: "plugins",
    colPlugin: "Plugin",
    colWhat: "What it is",
    colWhen: "When to use",
  },
};

function CodeLine({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto rounded bg-ink-950 px-3 py-1.5 font-mono text-[12px] text-clay-300">
      {children}
    </code>
  );
}

export function MarketplacesTab({ lang, profiles }: { lang: Language; profiles: ProfileId[] }) {
  const t = T[lang];
  const relevant = relevantMarketplaceTopics(profiles);
  const topics = [...MARKETPLACE_TOPICS].sort(
    (a, b) => Number(relevant.has(b.id)) - Number(relevant.has(a.id)),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      {/* Marketplaces par sujet (Power Platform, IDE, packages) */}
      <h2 className="text-base font-semibold text-ink-100">{t.byTopic}</h2>
      {topics.map((topic) => {
        const items = GENERAL_MARKETPLACES.filter((g) => g.topic === topic.id);
        if (items.length === 0) {
          return null;
        }
        const isReco = relevant.has(topic.id);
        return (
          <section key={topic.id}>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-clay-400">
              {pick(topic.label, lang)}
              {isReco && <Badge tone="amber">{t.reco}</Badge>}
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {items.map((g) => (
                <CatalogCard key={g.id} hover className="flex flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-ink-100">{g.name}</h4>
                    {g.official && <Badge tone="moss">{t.official}</Badge>}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(g.what, lang)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-400">
                    <span className="text-ink-300">{t.find} : </span>
                    {pick(g.whatYouFind, lang)}
                  </p>
                  <div className="mt-3 border-t border-ink-800 pt-2 text-xs">
                    <ExternalLink href={g.url}>{g.url}</ExternalLink>
                  </div>
                </CatalogCard>
              ))}
            </div>
          </section>
        );
      })}

      {/* Marketplaces de plugins Claude Code */}
      <h2 className="pt-2 text-base font-semibold text-ink-100">{t.ccTitle}</h2>
      <CatalogCard className="p-4">
        <h3 className="text-sm font-semibold text-ink-100">{t.howto}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(INSTALL_MECHANICS, lang)}</p>
      </CatalogCard>

      {MARKETPLACES.map((m) => (
        <CatalogCard key={m.id} hover className="overflow-hidden">
          <div className="border-b border-ink-700 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-ink-100">{m.name}</h3>
              <Badge tone={m.official ? "moss" : "neutral"}>
                {m.official ? t.official : t.community}
              </Badge>
              <Badge tone="clay">{pick(MARKETPLACE_KIND_LABELS[m.kind], lang)}</Badge>
              {typeof m.pluginCount === "number" && (
                <Badge>
                  {m.pluginCount} {t.plugins}
                </Badge>
              )}
              <span className="ml-auto text-xs text-ink-400">{m.maintainer}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{pick(m.what, lang)}</p>
            <div className="mt-3 space-y-1.5">
              <CodeLine>{m.addCommand}</CodeLine>
              {m.installExample && <CodeLine>{m.installExample}</CodeLine>}
            </div>
            {m.caveat && (
              <p className="mt-2 rounded border border-amber-flag/30 bg-amber-flag/10 px-3 py-2 text-xs text-amber-flag">
                {pick(m.caveat, lang)}
              </p>
            )}
          </div>

          {m.plugins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-ink-400">
                    <th className="px-4 py-2 font-medium">{t.colPlugin}</th>
                    <th className="px-4 py-2 font-medium">{t.colWhat}</th>
                    <th className="px-4 py-2 font-medium">{t.colWhen}</th>
                  </tr>
                </thead>
                <tbody>
                  {m.plugins.map((p) => (
                    <tr key={p.name} className="border-t border-ink-800 align-top">
                      <td className="px-4 py-2.5 font-mono text-[12px] text-clay-300">{p.name}</td>
                      <td className="px-4 py-2.5 text-ink-200">
                        {pick(p.what, lang)}
                        <span className="mt-0.5 block text-xs text-ink-400">
                          {pick(p.purpose, lang)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-300">{pick(p.whenToUse, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-ink-700 px-4 py-2 text-xs">
            <ExternalLink href={m.source}>{m.source}</ExternalLink>
          </div>
        </CatalogCard>
      ))}
    </div>
  );
}
