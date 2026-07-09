import type { GeneratedFile } from "../types";
import { MANIFEST_FILENAME } from "./manifest";

/**
 * Assemble les fichiers generes en une archive ZIP (cote client, sans backend).
 * JSZip est importe dynamiquement : il n'entre dans le bundle que lors du premier
 * telechargement (code-split), pas au chargement initial de l'app.
 * Si `manifest` est fourni, il est ecrit a la racine sous config-studio.json pour
 * permettre la re-importation de la configuration.
 */
export async function buildZipBlob(files: GeneratedFile[], manifest?: string): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  if (manifest !== undefined) {
    zip.file(MANIFEST_FILENAME, manifest);
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

/** Declenche le telechargement d'un Blob dans le navigateur. */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function downloadZip(
  files: GeneratedFile[],
  filename: string,
  manifest?: string,
): Promise<void> {
  const blob = await buildZipBlob(files, manifest);
  triggerDownload(blob, filename);
}
