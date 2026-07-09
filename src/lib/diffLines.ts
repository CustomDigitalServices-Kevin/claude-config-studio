/**
 * Diff de lignes minimal, PUR et sans dependance, base sur une LCS classique
 * (matrice de programmation dynamique). Sert a colorer le diff unifie entre deux
 * versions d'un meme fichier genere (buildConfig(a) vs buildConfig(b)).
 *
 * Le resultat est la sequence unifiee : les lignes communes (same), les lignes
 * presentes seulement dans `b` (added), les lignes presentes seulement dans `a`
 * (removed), dans l'ordre de lecture.
 */

export type DiffLineType = "same" | "added" | "removed";

export interface DiffLine {
  type: DiffLineType;
  line: string;
}

/**
 * Decoupe un texte en lignes. Une chaine vide ne represente aucune ligne (=> [])
 * plutot qu'une ligne vide fantome (comportement de String.split sur "").
 */
function toLines(text: string): string[] {
  return text.length === 0 ? [] : text.split("\n");
}

export function diffLines(a: string, b: string): DiffLine[] {
  const aLines = toLines(a);
  const bLines = toLines(b);
  const m = aLines.length;
  const n = bLines.length;

  // dp[i][j] = longueur de la LCS de aLines[i..] et bLines[j..].
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const row = dp[i];
      const nextRow = dp[i + 1];
      if (row && nextRow) {
        if (aLines[i] === bLines[j]) {
          row[j] = (nextRow[j + 1] ?? 0) + 1;
        } else {
          row[j] = Math.max(nextRow[j] ?? 0, row[j + 1] ?? 0);
        }
      }
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (aLines[i] === bLines[j]) {
      result.push({ type: "same", line: aLines[i] ?? "" });
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      result.push({ type: "removed", line: aLines[i] ?? "" });
      i++;
    } else {
      result.push({ type: "added", line: bLines[j] ?? "" });
      j++;
    }
  }
  while (i < m) {
    result.push({ type: "removed", line: aLines[i] ?? "" });
    i++;
  }
  while (j < n) {
    result.push({ type: "added", line: bLines[j] ?? "" });
    j++;
  }
  return result;
}
