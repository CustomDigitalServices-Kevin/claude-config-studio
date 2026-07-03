/** Helpers texte purs, sans dependance DOM, pour le generateur. */

// Plage des diacritiques combinants (U+0300 a U+036F), echappee pour eviter
// tout probleme d'encodage du fichier source.
const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/** Slug ASCII sûr pour noms de dossier/fichier. */
export function slugify(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "project";
}

export function countLines(text: string): number {
  return text.split("\n").length;
}

/** Concatene des sections en collapsant les lignes vides multiples, termine par un seul \n. */
export function joinSections(sections: string[]): string {
  const body = sections
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join("\n\n");
  return body.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}

/** Bloc de citation Markdown (chaque ligne prefixee par "> "). */
export function quote(lines: string[]): string {
  return lines
    .filter((l) => l.trim().length > 0)
    .map((l) => `> ${l}`)
    .join("\n");
}
