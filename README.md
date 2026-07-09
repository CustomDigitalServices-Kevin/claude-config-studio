# Claude Config Studio

A static web generator for Claude Code `.claude` configurations, with a verified
catalog of plugin marketplaces and companion tools. Fully client side: the wizard,
the template engine and the ZIP archive all run in the browser. No backend, no
account, no secret.

Live app: https://claude-config.custom-digital-services.fr

![CI](https://github.com/CustomDigitalServices-Kevin/claude-config-studio/actions/workflows/ci.yml/badge.svg)

<!-- screenshot -->

## What it does

The app has three tabs.

**1. `.claude` generator.** A wizard with a 10 section rail produces a downloadable
`.claude/` in real time (CLAUDE.md + settings.json + path scoped rules + optional
hooks) plus INSTALL.md and README.md. The sections are:

- Identity: project name, author and organization (never hard coded, always form input).
- Profiles and structure: eight usage profiles, tree depth (single root, sectors,
  or a full three level example) and seven predefined sectors.
- Language, rigor and stack: output language, strictness level and technologies.
- Guardrails: 17 configurable "rule 0" guardrails, each with a detail and adjustable parameters.
- Hooks: opt in, cross platform safe hooks only, with an OS caveat.
- Third party tools: companion tools whose detail lands in TOOLS.md.
- Skills: a sourced catalog; selecting one adds the exact install command to INSTALL.md.
- Agents: a sourced catalog of subagents, same install mechanic.
- Workflow: default behavior, an optional advisor subagent and an orchestration command.
- Advanced settings: keys written to settings.json, validated against the official schema.

The result downloads as a `.zip` that also carries a `config-studio.json` manifest,
so a configuration can be re imported later (drag the `.json` or the whole `.zip`).

**2. Marketplaces.** A verified catalog of Claude Code plugin marketplaces (official
and community), each plugin annotated with what it is, what it does and when to use it.

**3. MCP Servers.** A catalog of well known MCP servers with the real connection
mechanism for each.

A live preview renders the generated files as you answer.

## Quality guarantees

- Sourced content: catalog entries carry a real source URL (official docs or the
  parsed repo), checked live by a weekly drift job.
- Zero identity leak: the generated output is tested (grep) to contain no personal
  data. Identity and organization are form fields only.
- 200 line cap: the generator keeps every generated CLAUDE.md under the adherence
  threshold by offloading secondary rules to path scoped `rules/*.md`, without ever
  moving the non negotiable guardrails.
- Schema conformant settings: the generated settings.json is validated against a Zod
  schema derived from the official schemastore schema.

## Architecture

```
src/
  types.ts            types + Zod schemas (Answers, settings.json)
  data/               typed knowledge base (profiles, rules, stacks, sectors,
                      marketplaces, MCP servers, skills, agents, tools, sources)
  generator/          pure functions Answers -> GeneratedFile[]
                      (buildConfig orchestrator + 200 line cap, CLAUDE.md,
                      settings.json, hooks, INSTALL.md, INITIALIZE.md, README)
  lib/                client side ZIP, persistence, permalink, import manifest
  components/         React UI (wizard, catalog tabs, live preview)
```

The pipeline is a pure transform: `Answers -> GeneratedFile[]`. The build is static
(`base: "./"` in vite.config), so `dist/` can be served from any static host or
opened over `file://`. Generated configurations that select skills, agents or tools
also emit an `INITIALIZE.md` bootstrap file, deleted after first use.

## Development

```bash
npm install      # dependencies
npm run dev      # dev server (http://localhost:5173)
npm run build    # tsc strict + static build into dist/
npm test         # Vitest suite (generator + ZIP pipeline + lib)
npm run lint     # ESLint
npm run preview  # serve the production build
```

## Tests

- Vitest for the generator, the ZIP pipeline and the lib modules (persistence,
  permalink, manifest), including the identity leak grep and the 200 line cap.
- Playwright for end to end browser flows: live generation, real ZIP download and
  re import, and a smoke pass over every section and tab.
- A weekly job (`npm run verify:catalogs`) checks catalog sources and counts against
  the live network.

The app language switches between French and English from the header.

## License

MIT. See [LICENSE](./LICENSE).
