# N3 — Claude Config Studio

> Hérite de `~/.claude` (N0), `Antigravity/.claude` (N1) et `web-apps/.claude` (N2).
> Ce fichier n'ajoute que le spécifique projet.

## Identité

- Générateur web de configuration `.claude` pour Claude Code + catalogue marketplaces et outils tiers.
- 100% statique côté client, aucun backend, aucun secret.

## Stack lockée

- Vite 7 + React 19 + TypeScript strict + Tailwind v4 (CSS-first, `@tailwindcss/vite`) + JSZip + Vitest.
- `base: "./"` dans vite.config (déploiement statique relatif).

## Invariants à ne jamais casser

- **Zéro fuite identité** : aucune donnée personnelle hardcodée dans `src/data/` ni dans la sortie générée. Identité = champs de formulaire. Le test `buildConfig.test.ts` grep la sortie, il doit rester vert.
- **Plafond 200 lignes** : `buildConfig` garde chaque CLAUDE.md généré sous 200 lignes ; les 5 garde-fous `core0` ne sont jamais déportés.
- **Sources vérifiées** : tout ajout dans `marketplaces.ts` / `tools.ts` exige une source réelle (repo ou doc officielle). Pas de plugin/outil inventé.
- **settings.json conforme** : toute évolution du schéma de sortie doit rester validée par `settingsSchema` (Zod) dérivé des fichiers réels.

## Avant de livrer

- `npm run build` (tsc strict) + `npm test` verts.
- Si modification d'un catalogue : citer la source dans le champ `source`.

## Mémoire Obsidian

- État : `Mémoire_projets/Claude Config Studio/état-projet.md`
- Décisions : `Mémoire_projets/Claude Config Studio/décisions.md`
- RAG best practices source : `Vault_Projets/Main/claude-code-best-practices-2026-06.md`
