import JSZip from "jszip";
import type { GeneratedFile } from "../types";

/** Assemble les fichiers generes en une archive ZIP (cote client, sans backend). */
export async function buildZipBlob(files: GeneratedFile[]): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
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

export async function downloadZip(files: GeneratedFile[], filename: string): Promise<void> {
  const blob = await buildZipBlob(files);
  triggerDownload(blob, filename);
}
