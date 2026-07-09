import { useMemo, useState } from "react";
import {
  listSnapshots,
  saveSnapshot,
  deleteSnapshot,
  MAX_SNAPSHOTS,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  type Snapshot,
} from "../lib/snapshots";
import { diffLines } from "../lib/diffLines";
import { buildConfig } from "../generator/buildConfig";
import { pick, type Answers, type Language } from "../types";
import { CHROME } from "../i18n/chrome";
import { Badge, cn } from "./primitives";

type Status = "added" | "removed" | "modified" | "same";

interface FileDiffEntry {
  path: string;
  status: Status;
  contentA: string;
  contentB: string;
}

/**
 * Compare les fichiers generes par deux jeux de reponses. Retourne null si buildConfig
 * jette (protege le panneau d'un crash sur une config invalide).
 */
function compareFiles(a: Answers, b: Answers): FileDiffEntry[] | null {
  try {
    const mapA = new Map(buildConfig(a).map((f) => [f.path, f.content]));
    const mapB = new Map(buildConfig(b).map((f) => [f.path, f.content]));
    const paths = [...new Set([...mapA.keys(), ...mapB.keys()])].sort();
    return paths.map((path) => {
      const ca = mapA.get(path);
      const cb = mapB.get(path);
      if (ca === undefined) {
        return { path, status: "added", contentA: "", contentB: cb ?? "" };
      }
      if (cb === undefined) {
        return { path, status: "removed", contentA: ca, contentB: "" };
      }
      return { path, status: ca === cb ? "same" : "modified", contentA: ca, contentB: cb };
    });
  } catch (err) {
    console.error("[snapshots] compare buildConfig failed", err);
    return null;
  }
}

function formatSavedAt(iso: string, lang: Language): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(lang === "fr" ? "fr-FR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_TONE: Record<Exclude<Status, "same">, "moss" | "amber" | "clay"> = {
  added: "moss",
  removed: "amber",
  modified: "clay",
};

function DiffView({ contentA, contentB }: { contentA: string; contentB: string }) {
  const lines = useMemo(() => diffLines(contentA, contentB), [contentA, contentB]);
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-800 bg-ink-950 font-mono text-[11px] leading-relaxed">
      {lines.map((l, idx) => (
        <div
          key={idx}
          className={cn(
            "whitespace-pre px-3 py-0.5",
            l.type === "added" && "bg-moss-500/15 text-moss-500",
            l.type === "removed" && "bg-amber-flag/15 text-amber-flag",
            l.type === "same" && "text-ink-400",
          )}
        >
          <span className="mr-2 select-none text-ink-600">
            {l.type === "added" ? "+" : l.type === "removed" ? "-" : " "}
          </span>
          {l.line === "" ? " " : l.line}
        </div>
      ))}
    </div>
  );
}

function SnapshotSelect({
  label,
  value,
  snapshots,
  onChange,
}: {
  label: string;
  value: string;
  snapshots: Snapshot[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs text-ink-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-sm text-ink-200"
      >
        <option value="">-</option>
        {snapshots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompareView({ snapshots, lang }: { snapshots: Snapshot[]; lang: Language }) {
  const [selA, setSelA] = useState<string>("");
  const [selB, setSelB] = useState<string>("");
  const [openPath, setOpenPath] = useState<string | null>(null);

  const snapA = snapshots.find((s) => s.id === selA) ?? null;
  const snapB = snapshots.find((s) => s.id === selB) ?? null;
  const ready = snapA !== null && snapB !== null && snapA.id !== snapB.id;

  const entries = useMemo(
    () => (snapA && snapB ? compareFiles(snapA.answers, snapB.answers) : null),
    [snapA, snapB],
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-400">{pick(CHROME.snapshots.compareHint, lang)}</p>
      <div className="flex gap-3">
        <SnapshotSelect
          label={pick(CHROME.snapshots.versionA, lang)}
          value={selA}
          snapshots={snapshots}
          onChange={(v) => {
            setSelA(v);
            setOpenPath(null);
          }}
        />
        <SnapshotSelect
          label={pick(CHROME.snapshots.versionB, lang)}
          value={selB}
          snapshots={snapshots}
          onChange={(v) => {
            setSelB(v);
            setOpenPath(null);
          }}
        />
      </div>

      {ready && entries === null && (
        <p className="text-xs text-amber-flag">{pick(CHROME.snapshots.diffError, lang)}</p>
      )}

      {ready && entries !== null && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-clay-400">
            {pick(CHROME.snapshots.filesTitle, lang)}
          </p>
          {entries.every((e) => e.status === "same") ? (
            <p className="text-sm text-ink-300">{pick(CHROME.snapshots.identical, lang)}</p>
          ) : (
            <>
              <p className="text-xs text-ink-500">{pick(CHROME.snapshots.diffHint, lang)}</p>
              <ul className="space-y-1.5">
                {entries
                  .filter(
                    (e): e is FileDiffEntry & { status: "added" | "removed" | "modified" } =>
                      e.status !== "same",
                  )
                  .map((e) => {
                    const tone = STATUS_TONE[e.status];
                    const statusLabel =
                      e.status === "added"
                        ? CHROME.snapshots.statusAdded
                        : e.status === "removed"
                          ? CHROME.snapshots.statusRemoved
                          : CHROME.snapshots.statusModified;
                    const clickable = e.status === "modified";
                    return (
                      <li key={e.path}>
                        <button
                          type="button"
                          disabled={!clickable}
                          onClick={() => setOpenPath((prev) => (prev === e.path ? null : e.path))}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-lg border border-ink-800 px-3 py-1.5 text-left text-xs transition",
                            clickable ? "hover:bg-ink-800" : "cursor-default",
                          )}
                        >
                          <span className="truncate font-mono text-ink-200">{e.path}</span>
                          <Badge tone={tone}>{pick(statusLabel, lang)}</Badge>
                        </button>
                        {openPath === e.path && (
                          <div className="mt-1.5">
                            <DiffView contentA={e.contentA} contentB={e.contentB} />
                          </div>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SnapshotsPanel({
  lang,
  answers,
  onApply,
  onClose,
}: {
  lang: Language;
  answers: Answers;
  /** Applique un snapshot ; retourne true si l'application a eu lieu (App gere la confirmation). */
  onApply: (next: Answers) => boolean;
  onClose: () => void;
}) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => listSnapshots());
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);

  function reload(): void {
    setSnapshots(listSnapshots());
  }

  function onSave(): void {
    setError(null);
    const trimmed = name.trim();
    if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
      setError(pick(CHROME.snapshots.nameInvalid, lang));
      return;
    }
    if (snapshots.length >= MAX_SNAPSHOTS) {
      setError(pick(CHROME.snapshots.limitReached, lang));
      return;
    }
    try {
      saveSnapshot(trimmed, answers);
      setName("");
      reload();
    } catch (err) {
      console.error("[snapshots] save failed", err);
      setError(pick(CHROME.snapshots.limitReached, lang));
    }
  }

  function onDelete(snap: Snapshot): void {
    if (!window.confirm(pick(CHROME.snapshots.deleteConfirm, lang))) {
      return;
    }
    deleteSnapshot(snap.id);
    reload();
  }

  function handleApply(snap: Snapshot): void {
    if (onApply(snap.answers)) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/70 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={pick(CHROME.snapshots.title, lang)}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-ink-700 px-5 py-3">
          <div>
            <h2 className="text-base font-semibold text-ink-100">
              {pick(CHROME.snapshots.title, lang)}
            </h2>
            <p className="mt-0.5 text-xs text-ink-400">{pick(CHROME.snapshots.intro, lang)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ink-700 px-3 py-1.5 text-sm text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
          >
            {pick(CHROME.snapshots.close, lang)}
          </button>
        </header>

        <div className="space-y-5 px-5 py-4">
          {/* Sauvegarde de l'etat courant */}
          <div className="flex flex-wrap items-start gap-2">
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(e) => setName(e.target.value)}
              placeholder={pick(CHROME.snapshots.namePlaceholder, lang)}
              className="min-w-[12rem] flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-500"
            />
            <button
              type="button"
              onClick={onSave}
              className="rounded-lg bg-clay-500 px-3 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-clay-400"
            >
              {pick(CHROME.snapshots.save, lang)}
            </button>
          </div>
          {error && <p className="text-xs text-amber-flag">{error}</p>}

          {/* Bascule liste / comparaison */}
          <div className="flex items-center justify-between gap-3 border-t border-ink-800 pt-3">
            <span className="text-xs text-ink-400">
              {snapshots.length} {pick(CHROME.snapshots.count, lang)}
            </span>
            <button
              type="button"
              disabled={snapshots.length < 2}
              onClick={() => setComparing((v) => !v)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition",
                snapshots.length < 2
                  ? "cursor-not-allowed border-ink-800 text-ink-600"
                  : "border-ink-700 text-ink-300 hover:bg-ink-800 hover:text-ink-100",
              )}
            >
              {comparing
                ? pick(CHROME.snapshots.compareExit, lang)
                : pick(CHROME.snapshots.compare, lang)}
            </button>
          </div>

          {comparing ? (
            <CompareView snapshots={snapshots} lang={lang} />
          ) : snapshots.length === 0 ? (
            <p className="text-sm text-ink-400">{pick(CHROME.snapshots.empty, lang)}</p>
          ) : (
            <ul className="space-y-2">
              {snapshots.map((snap) => (
                <li
                  key={snap.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-800 bg-ink-850 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-100">{snap.name}</p>
                    <p className="text-xs text-ink-500">{formatSavedAt(snap.savedAt, lang)}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApply(snap)}
                      className="rounded-lg border border-ink-700 px-2.5 py-1 text-xs text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
                    >
                      {pick(CHROME.snapshots.apply, lang)}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(snap)}
                      className="rounded-lg border border-ink-700 px-2.5 py-1 text-xs text-ink-300 transition hover:bg-amber-flag/10 hover:text-amber-flag"
                    >
                      {pick(CHROME.snapshots.remove, lang)}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
