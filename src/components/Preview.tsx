import { useState } from "react";
import type { GeneratedFile, Language } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { downloadZip } from "../lib/zip";
import { slugify } from "../generator/text";
import { Badge, cn } from "./primitives";

function fileKindBadge(kind: GeneratedFile["lang"]): string {
  return kind === "json" ? "json" : kind === "bash" ? "sh" : kind === "markdown" ? "md" : "txt";
}

export function Preview({
  files,
  projectName,
  lang,
}: {
  files: GeneratedFile[];
  projectName: string;
  lang: Language;
}) {
  const [selectedPath, setSelectedPath] = useState<string>(files[0]?.path ?? "");
  const [building, setBuilding] = useState(false);

  // selection derivee : si le fichier choisi a disparu de la liste, retomber sur le premier
  // (derive plutot que synchronise par effet : evite les rendus en cascade, regle react-hooks)
  const selected = files.some((f) => f.path === selectedPath)
    ? selectedPath
    : (files[0]?.path ?? "");

  const current = files.find((f) => f.path === selected) ?? files[0];
  const claudeMd = files.find((f) => f.path.endsWith("CLAUDE.md"));
  const mdLines = claudeMd ? claudeMd.content.split("\n").length : 0;

  async function onDownload() {
    setBuilding(true);
    try {
      await downloadZip(files, `${slugify(projectName)}-claude-config.zip`);
    } finally {
      setBuilding(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-ink-700 px-4 py-3">
        <div className="text-xs text-ink-400">
          {files.length} {pick(CHROME.preview.files, lang)}
          {mdLines > 0 && (
            <>
              {" · "}CLAUDE.md{" "}
              <span className={cn(mdLines > 200 ? "text-amber-flag" : "text-moss-500")}>
                {mdLines} {pick(CHROME.preview.lines, lang)}
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={building || files.length === 0}
          className="rounded-lg bg-clay-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-clay-400 disabled:opacity-50"
        >
          {building ? pick(CHROME.preview.generating, lang) : pick(CHROME.preview.download, lang)}
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,11rem)_1fr]">
        <nav className="overflow-y-auto border-r border-ink-700 py-2">
          {files.map((f) => (
            <button
              key={f.path}
              type="button"
              onClick={() => setSelectedPath(f.path)}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[11px] transition",
                f.path === selected
                  ? "bg-clay-500/10 text-clay-300"
                  : "text-ink-400 hover:bg-ink-800 hover:text-ink-200",
              )}
            >
              <Badge tone={f.path === selected ? "clay" : "neutral"}>{fileKindBadge(f.lang)}</Badge>
              <span className="truncate">{f.path}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0 overflow-auto">
          <pre className="whitespace-pre p-4 font-mono text-[12px] leading-relaxed text-ink-200">
            {current?.content ?? ""}
          </pre>
        </div>
      </div>
    </div>
  );
}
