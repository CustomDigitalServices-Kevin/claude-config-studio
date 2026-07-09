# Claude Config Studio

Générateur web de configuration `.claude` pour Claude Code, avec catalogue des
marketplaces et des outils tiers. 100% statique, aucun backend, aucun secret :
le questionnaire, le moteur de templates et l'archive ZIP tournent dans le navigateur.

## Trois onglets

1. **Générateur `.claude`** - un questionnaire produit en live un `.claude/`
   (CLAUDE.md + settings.json + rules + hooks optionnels) + INSTALL.md + README.md,
   téléchargeable en `.zip`. Choix de profil (dev / audit / business / data-ml /
   power-platform / agents / infra / generic), de structure (projet simple, global
   `~/.claude`, domaine N2, projet N3, ou monorepo complet N1/N2/N3), de stack,
   de garde-fous (les « règles 0 »), de rigueur et de hooks.
2. **Marketplaces** - catalogue vérifié des marketplaces de plugins Claude Code
   (officielles + communautaires) avec, pour chaque plugin, ce que c'est, à quoi il
   sert et quand le prendre.
3. **Outils tiers** - catalogue des outils qui complètent Claude Code (Obsidian,
   NotebookLM, context7, Playwright, Sentry, task-master, repomix, ccusage,
   claude-squad, MCP officiels...) avec le mécanisme de connexion réel.

## Garanties qualité

- **Zéro improvisation** : tout le contenu est sourcé de la doc officielle
  Claude Code (`code.claude.com/docs`) et de la vérification directe des repos
  (parsing réel des `marketplace.json`).
- **Zéro fuite d'identité** : la sortie générée est testée (grep) pour ne contenir
  aucune donnée personnelle ; identité/organisation sont des champs de formulaire.
- **Plafond 200 lignes** : le générateur garde chaque CLAUDE.md sous le seuil
  d'adhérence en déportant les règles secondaires vers `rules/*.md` path-scopés,
  sans jamais déplacer les 5 garde-fous non négociables.
- **Settings conformes** : le `settings.json` généré est validé contre un schéma
  Zod dérivé des fichiers réels sur disque.

## Stack

Vite + React 19 + TypeScript strict + Tailwind v4 + JSZip + Vitest.

## Commandes

```bash
npm install      # dépendances
npm run dev      # serveur de dev (http://localhost:5173)
npm run build    # tsc strict + build statique dans dist/
npm test         # suite Vitest (générateur + pipeline ZIP)
npm run preview  # sert le build de production
```

## Architecture

```
src/
├── types.ts            # types + schémas Zod (Answers, settings.json)
├── data/               # base de connaissances typée
│   ├── profiles.ts     # 8 profils d'usage différenciés
│   ├── rules.ts        # modules de garde-fous (FR/EN, core vs path-scoped)
│   ├── stacks.ts       # presets de permissions + libs context7
│   ├── structures.ts   # N0 / N1 / N2 / N3 + monorepo
│   ├── marketplaces.ts # catalogue marketplaces (vérifié)
│   ├── tools.ts        # catalogue outils tiers (vérifié)
│   └── sources.ts      # URLs officielles
├── generator/          # fonctions pures Answers -> GeneratedFile[]
│   ├── buildConfig.ts  # orchestrateur + plafond 200 lignes + layout
│   ├── claudeMd.ts     # CLAUDE.md + fichiers rules
│   ├── settings.ts     # settings.json
│   ├── hooks.ts        # hooks opt-in (avertissement OS)
│   ├── install.ts      # INSTALL.md
│   └── readme.ts       # README.md du zip
├── lib/zip.ts          # assemblage ZIP côté client (JSZip)
└── components/         # UI React (wizard + onglets + preview)
```

Le déploiement est statique (`base: "./"` dans vite.config) : `dist/` se sert
depuis GitHub Pages, Vercel static, ou s'ouvre en `file://`.
