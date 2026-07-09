import { describe, it, expect } from "vitest";

/**
 * Garde accents (jumelle de no-em-dash.test.ts) : les chaines FR user-facing doivent etre
 * ACCENTUEES completement (LOI Kevin : jamais de substitution ASCII d'un caractere accentue).
 *
 * Perimetre : on ne scanne QUE les valeurs de cle `fr:` (objets Localized des catalogues data/
 * et des descriptors/labels localises). C'est la ou vit tout le texte FR livre a l'utilisateur.
 * Ce ciblage evite deux faux positifs structurels :
 *  - les chaines anglaises (cle `en:`), ex "verified" contient "verifie" ;
 *  - les identifiants du code, ex le champ `verifiedAt` contient "verifie".
 * Convention projet : les commentaires de code peuvent rester en ASCII ; seul le user-facing
 * (valeurs `fr:`) est tenu d'etre accentue.
 *
 * `import.meta.glob(..., '?raw')` charge le contenu brut de chaque source (feature Vite).
 */
const sources = import.meta.glob("./**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Formes FAUTIVES (desaccentuees) de mots FR frequents en contexte user-facing. La forme
 * correcte (systeme->systeme accentue, etc.) contient un caractere accentue qui BRISE ces
 * sous-chaines ASCII : une correspondance signale donc un vrai defaut d'accent. Les entrees
 * avec espace final (ex "acces ", "regle ") reduisent les collisions avec l'anglais.
 */
const DESACCENTUATED = [
  "systeme",
  "depreci",
  "deprece",
  "genere ",
  "generee",
  "etape",
  "premiere",
  "derniere",
  "numero",
  "memoire",
  "acces ",
  "verifie",
  "securite",
  "regle ",
  "regles ",
  "parametre",
  "telecharger",
  "reglage",
  "fonctionnalite",
];

describe("garde accents — chaines fr: user-facing accentuees", () => {
  for (const [path, content] of Object.entries(sources)) {
    if (path.includes(".test.")) {
      continue;
    }
    it(`${path} ne contient pas de chaine fr: desaccentuee`, () => {
      const frString = /\bfr:\s*"((?:[^"\\]|\\.)*)"/g;
      const offenders: string[] = [];
      let match: RegExpExecArray | null;
      while ((match = frString.exec(content)) !== null) {
        const value = match[1] ?? "";
        const low = value.toLowerCase();
        for (const word of DESACCENTUATED) {
          if (low.includes(word)) {
            offenders.push(`[${word}] ${value.slice(0, 80)}`);
          }
        }
      }
      expect(offenders, `chaines fr: desaccentuees dans ${path}:\n${offenders.join("\n")}`).toEqual(
        [],
      );
    });
  }
});
