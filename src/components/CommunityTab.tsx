import { useEffect, useState } from "react";
import { fetchSharedConfigs, type SharedConfig, type SharedConfigsPage } from "../lib/community";
import { encodeAnswers, decodeAnswers } from "../lib/permalink";
import { pick, type Answers, type Language } from "../types";
import { CHROME } from "../i18n/chrome";
import { Badge, CatalogCard, cn } from "./primitives";

const BOARD_BASE = "https://board.custom-digital-services.fr";

/** Formate une date ISO en date courte localisee. Retourne l'entree brute si non parseable. */
function formatDate(iso: string, lang: Language): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PublishButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg bg-clay-500 px-3 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-clay-400"
    >
      {label}
    </button>
  );
}

function ConfigCard({
  config,
  lang,
  onOpen,
}: {
  config: SharedConfig;
  lang: Language;
  onOpen: () => void;
}) {
  return (
    <CatalogCard hover className="flex flex-col p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-ink-100">{config.title}</h3>
        <Badge tone="clay">{config.locale.toUpperCase()}</Badge>
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-300">{config.description}</p>
      <p className="mt-2 text-xs text-ink-400">
        {pick(CHROME.community.author, lang)} {config.authorName} ·{" "}
        {formatDate(config.createdAt, lang)}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 self-start rounded-lg border border-ink-700 px-2.5 py-1.5 text-xs text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
      >
        {pick(CHROME.community.open, lang)}
      </button>
    </CatalogCard>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <CatalogCard key={i} className="p-4">
          <div className="h-4 w-1/2 animate-pulse rounded bg-ink-700" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-ink-800" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-ink-800" />
        </CatalogCard>
      ))}
    </div>
  );
}

export function CommunityTab({
  lang,
  answers,
  onApply,
}: {
  lang: Language;
  answers: Answers;
  /** Applique une config decodee (App gere la confirmation et la bascule d'onglet). */
  onApply: (next: Answers) => void;
}) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SharedConfigsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSharedConfigs(page).then((result) => {
      if (cancelled) {
        return;
      }
      if (result) {
        setData(result);
        setFailed(false);
      } else {
        setFailed(true);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  // Le reset (skeleton + effacement de l'erreur) vit dans le handler, pas dans l'effet,
  // pour eviter un setState synchrone d'effet (cascading renders).
  function goToPage(next: number) {
    setLoading(true);
    setFailed(false);
    setPage(next);
  }

  async function onPublish() {
    const payload = await encodeAnswers(answers);
    window.open(`${BOARD_BASE}/${lang}/configs/new?c=${payload}`, "_blank", "noopener");
  }

  async function onOpen(config: SharedConfig) {
    setOpenError(false);
    const decoded = await decodeAnswers(config.permalink);
    if (decoded) {
      onApply(decoded);
    } else {
      setOpenError(true);
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const showPagination = data !== null && data.total > data.pageSize;
  const isEmpty = data !== null && data.configs.length === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-relaxed text-ink-300">
          {pick(CHROME.community.intro, lang)}
        </p>
        <PublishButton
          onClick={() => void onPublish()}
          label={pick(CHROME.community.publish, lang)}
        />
      </div>

      {openError && (
        <p className="rounded-lg border border-amber-flag/30 bg-amber-flag/10 px-3 py-2 text-xs text-amber-flag">
          {pick(CHROME.community.openError, lang)}
        </p>
      )}

      {loading && <SkeletonGrid />}

      {!loading && failed && (
        <CatalogCard className="p-5">
          <h2 className="text-sm font-semibold text-amber-flag">
            {pick(CHROME.community.errorTitle, lang)}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-300">
            {pick(CHROME.community.errorBody, lang)}
          </p>
        </CatalogCard>
      )}

      {!loading && !failed && isEmpty && (
        <CatalogCard className="flex flex-col items-start gap-3 p-5">
          <p className="text-sm text-ink-300">{pick(CHROME.community.empty, lang)}</p>
          <PublishButton
            onClick={() => void onPublish()}
            label={pick(CHROME.community.publish, lang)}
          />
        </CatalogCard>
      )}

      {!loading && !failed && data !== null && data.configs.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {data.configs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                lang={lang}
                onOpen={() => void onOpen(config)}
              />
            ))}
          </div>
          {showPagination && (
            <div className="flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => goToPage(Math.max(1, page - 1))}
                className={cn(
                  "rounded-lg border border-ink-700 px-3 py-1.5 transition",
                  page <= 1
                    ? "cursor-not-allowed text-ink-600"
                    : "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
                )}
              >
                {pick(CHROME.community.prev, lang)}
              </button>
              <span className="text-xs text-ink-400">
                {pick(CHROME.community.pageLabel, lang)} {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                className={cn(
                  "rounded-lg border border-ink-700 px-3 py-1.5 transition",
                  page >= totalPages
                    ? "cursor-not-allowed text-ink-600"
                    : "text-ink-300 hover:bg-ink-800 hover:text-ink-100",
                )}
              >
                {pick(CHROME.community.next, lang)}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
