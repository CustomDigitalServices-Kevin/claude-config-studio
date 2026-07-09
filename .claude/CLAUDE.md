# Claude Config Studio

Générateur web statique de configurations `.claude` pour Claude Code, avec catalogue
vérifié des marketplaces de plugins et des serveurs MCP. 100% client, aucun backend,
aucun secret. Dépôt public sous licence MIT.

## Stack lockée

- Vite 7 + React 19 + TypeScript strict + Tailwind v4 (CSS-first, `@tailwindcss/vite`).
- JSZip (import dynamique) pour l'archive ZIP côté client.
- Zod pour les schémas (Answers, settings.json).
- Vitest (unitaire / intégration) + Playwright (E2E navigateur).
- `base: "./"` dans vite.config : déploiement statique relatif.

## Invariants à ne jamais casser

- Dé-personnalisation : aucune donnée personnelle codée en dur dans `src/data/` ni dans
  la sortie générée. L'identité est un champ de formulaire. Le grep `FORBIDDEN_TOKENS`
  de `buildConfig.test.ts` et `e2e.test.ts` doit rester vert.
- Plafond 200 lignes : `buildConfig` garde chaque CLAUDE.md généré sous 200 lignes ; les
  garde-fous `core0` ne sont jamais déportés.
- Sources vérifiées : tout ajout dans un catalogue (`marketplaces`, `mcpServers`, `skills`,
  `agents`, `tools`) exige un champ `source` réel. `npm run verify:catalogs` contrôle les
  sources et les counts en direct.
- settings.json conforme : la sortie reste validée par `settingsSchema` (Zod), aligné sur
  le schéma officiel schemastore.
- Zéro em dash dans le texte français (ni tiret long ni `--`). Le test `no-em-dash.test.ts`
  garde le code source ; les textes FR portent les accents complets.
- TypeScript strict : zéro `any`, zéro `@ts-ignore`, zéro `!` non-null, aucun TODO ni stub.

## Architecture

Transformation pure `Answers -> GeneratedFile[]` :

- `src/types.ts` : types + schémas Zod (Answers, settings.json).
- `src/data/` : base de connaissances typée (catalogues sourcés).
- `src/generator/` : fonctions pures (buildConfig + plafond, CLAUDE.md, settings, hooks, INSTALL, INITIALIZE).
- `src/lib/` : ZIP client, persistance localStorage, permalien, manifeste d'import.
- `src/components/` : UI React (wizard, onglets catalogue, preview live).

## Avant de livrer

```bash
npm run typecheck     # tsc strict
npm test              # Vitest
npm run lint          # ESLint
npm run format:check  # Prettier
npm run build         # build statique
npm run test:e2e      # Playwright (navigateur)
```

Tout doit être vert. Si un catalogue est modifié : citer la source dans le champ `source`
et relancer `npm run verify:catalogs`.
