/**
 * Catalog drift verifier (dev/CI tool, run: `npx vite-node scripts/verify-catalogs.ts`).
 *
 * Checks, against the live network, that the catalogs shipped in src/data stay truthful:
 *  a) the schemastore claude-code-settings schema still validates a representative
 *     generated settings.json (via ajv);
 *  b) every marketplace that declares a raw marketplace.json still exposes the exact
 *     name we reference, and reports plugin-count drift as a warning;
 *  c) every source URL of the five catalogs (+ the SOURCES map + the general
 *     marketplace URLs) is reachable (404/410 = error, redirect = warning);
 *  d) every hosted MCP server endpoint answers (404 = error, anything else reachable
 *     = alive, since MCP endpoints often reject plain GET with 4xx/405).
 *
 * Output is an English text report grouped by section; exit code 1 if any error.
 * No new dependency: native fetch, ajv is already a devDependency.
 */
import Ajv from "ajv";
import Ajv2020 from "ajv/dist/2020";
import { MARKETPLACES } from "../src/data/marketplaces";
import { MCP_SERVERS } from "../src/data/mcpServers";
import { SKILL_ENTRIES } from "../src/data/skills";
import { AGENT_ENTRIES } from "../src/data/agents";
import { COMPANION_TOOLS } from "../src/data/tools";
import { GENERAL_MARKETPLACES } from "../src/data/generalMarketplaces";
import { SOURCES } from "../src/data/sources";
import { generateSettings } from "../src/generator/settings";
import type { Answers } from "../src/types";

// Browser-like User-Agent: many hosts (Microsoft, npm, VS Marketplace) return 403/404 to
// naive bot agents; the tool suffix keeps it honest without tripping those blocks.
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 claude-config-studio-catalog-verifier";
const TIMEOUT_MS = 10_000;
const PAUSE_MS = 150;
const SCHEMASTORE_URL = "https://json.schemastore.org/claude-code-settings.json";

type Level = "ok" | "warn" | "error";

let errorCount = 0;
let warnCount = 0;

function line(level: Level, message: string): void {
  if (level === "error") errorCount++;
  if (level === "warn") warnCount++;
  const tag = level === "error" ? "ERROR" : level === "warn" ? "WARN " : "OK   ";
  console.log(`  [${tag}] ${message}`);
}

function section(title: string): void {
  console.log(`\n== ${title} ==`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type StatusResult = { status: number } | { error: string };

async function httpStatus(
  url: string,
  method: "HEAD" | "GET",
  redirect: "manual" | "follow" = "manual",
): Promise<StatusResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect,
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, accept: "*/*" },
    });
    return { status: res.status };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Liveness that mirrors what a human browser sees. Fast path: HEAD 2xx = ok. For
 * anything else, confirm with a GET that follows redirects (HEAD is unreliable, bare
 * hosts often 404/405 it): only a followed GET landing on 404/410 counts as an error;
 * a redirect that resolves to 2xx is a soft warning (catalog URL slightly stale).
 */
async function checkLiveness(url: string): Promise<{ level: Level; note: string }> {
  const head = await httpStatus(url, "HEAD", "manual");
  if ("status" in head && head.status >= 200 && head.status < 300) {
    return { level: "ok", note: String(head.status) };
  }
  const wasRedirect = "status" in head && head.status >= 300 && head.status < 400;
  const full = await httpStatus(url, "GET", "follow");
  if ("error" in full) return { level: "warn", note: `network: ${full.error}` };
  if (full.status >= 200 && full.status < 300) {
    return wasRedirect
      ? { level: "warn", note: `redirect -> ${full.status}` }
      : { level: "ok", note: String(full.status) };
  }
  if (full.status === 404 || full.status === 410) {
    return { level: "error", note: `${full.status} gone` };
  }
  return { level: "warn", note: `unexpected ${full.status}` };
}

function toRawGithub(url: string): string | null {
  const match = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  if (!match) return null;
  return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`;
}

/** Representative answers exercising many settings keys, for the ajv conformance check. */
function representativeAnswers(): Answers {
  return {
    projectName: "verify-sample",
    author: "",
    org: "",
    authorRole: "",
    companyId: "",
    responseStyle: "",
    language: "fr",
    profiles: ["dev", "audit"],
    depth: "n0",
    sectors: [],
    stacks: ["web-ts", "python", "docker-infra"],
    rules: [],
    rigor: "standard",
    hooks: ["block-dangerous-bash", "session-start-reminder", "stop-checklist", "prompt-guardrail"],
    tools: [],
    skills: [],
    agents: [],
    mcpServers: [],
    toolRules: [],
    ruleOptions: {},
    memoryNote: "",
    advanced: {
      model: "sonnet",
      autoMemory: false,
      outputStyle: "Explanatory",
      permissionMode: "plan",
      fallbackModel: "",
      responseLanguage: "",
      attribution: "",
    },
    workflow: {
      defaultBehavior: "act",
      advisor: { enabled: false, model: "" },
      orchestration: false,
    },
  };
}

async function verifySettingsSchema(): Promise<void> {
  section("Settings schema (schemastore + ajv)");
  // Follow redirects: schemastore serves the schema behind a 301.
  let schema: Record<string, unknown>;
  try {
    const res = await fetch(SCHEMASTORE_URL, {
      headers: { "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      line("error", `schemastore returned ${res.status}`);
      return;
    }
    schema = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    line("error", `schemastore fetch failed: ${err instanceof Error ? err.message : err}`);
    return;
  }

  const is2020 = typeof schema.$schema === "string" && schema.$schema.includes("2020-12");
  const AjvCtor = is2020 ? Ajv2020 : Ajv;
  const ajv = new AjvCtor({ strict: false, validateFormats: false });
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (err) {
    line("error", `schema failed to compile: ${err instanceof Error ? err.message : err}`);
    return;
  }

  const generated = generateSettings(representativeAnswers()) as Record<string, unknown>;
  // $schema is editor metadata, not config: drop it before validating the data body.
  delete generated.$schema;
  const valid = validate(generated);
  if (valid) {
    line(
      "ok",
      `generated settings.json validates against schemastore (draft ${is2020 ? "2020-12" : "default"})`,
    );
  } else {
    const messages = (validate.errors ?? [])
      .map((e) => `${e.instancePath || "/"} ${e.message ?? ""}`.trim())
      .join("; ");
    line("error", `generated settings.json rejected: ${messages}`);
  }
}

async function verifyMarketplaceManifests(): Promise<void> {
  section("Marketplace manifests (name + plugin count)");
  const withManifest = MARKETPLACES.filter((m) => /\/blob\/.+marketplace\.json$/.test(m.source));
  for (const market of withManifest) {
    const raw = toRawGithub(market.source);
    if (!raw) {
      line("warn", `${market.id}: cannot derive raw URL from ${market.source}`);
      await sleep(PAUSE_MS);
      continue;
    }
    try {
      const res = await fetch(raw, {
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 404 || res.status === 410) {
        line("error", `${market.id}: marketplace.json gone (${res.status}) at ${raw}`);
        await sleep(PAUSE_MS);
        continue;
      }
      if (!res.ok) {
        line("warn", `${market.id}: marketplace.json returned ${res.status}`);
        await sleep(PAUSE_MS);
        continue;
      }
      const parsed = (await res.json()) as { name?: unknown; plugins?: unknown };
      if (parsed.name !== market.name) {
        line(
          "error",
          `${market.id}: name drift, catalog "${market.name}" vs file "${String(parsed.name)}"`,
        );
      } else if (Array.isArray(parsed.plugins) && typeof market.pluginCount === "number") {
        const actual = parsed.plugins.length;
        const delta = actual - market.pluginCount;
        if (delta === 0) {
          line("ok", `${market.id}: name matches, ${actual} plugins`);
        } else {
          line(
            "warn",
            `${market.id}: plugin count drift, declared ${market.pluginCount} vs actual ${actual} (delta ${delta > 0 ? "+" : ""}${delta})`,
          );
        }
      } else {
        line("ok", `${market.id}: name matches (plugin count not comparable)`);
      }
    } catch (err) {
      line("warn", `${market.id}: fetch failed: ${err instanceof Error ? err.message : err}`);
    }
    await sleep(PAUSE_MS);
  }
}

async function verifySourceLiveness(): Promise<void> {
  section("Source URL liveness (5 catalogs + SOURCES + general marketplaces)");
  const entries: Array<{ label: string; url: string }> = [];
  for (const m of MARKETPLACES) entries.push({ label: `marketplace:${m.id}`, url: m.source });
  for (const s of MCP_SERVERS) entries.push({ label: `mcp:${s.id}`, url: s.source });
  for (const s of SKILL_ENTRIES) entries.push({ label: `skill:${s.id}`, url: s.source });
  for (const a of AGENT_ENTRIES) entries.push({ label: `agent:${a.id}`, url: a.source });
  for (const t of COMPANION_TOOLS) entries.push({ label: `tool:${t.id}`, url: t.source });
  for (const g of GENERAL_MARKETPLACES) entries.push({ label: `general:${g.id}`, url: g.url });
  for (const [key, url] of Object.entries(SOURCES)) entries.push({ label: `source:${key}`, url });

  // Dedupe identical URLs to spare the network (same repo referenced by several entries).
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!entry.url || seen.has(entry.url)) continue;
    seen.add(entry.url);
    const { level, note } = await checkLiveness(entry.url);
    line(level, `${entry.label} -> ${entry.url} (${note})`);
    await sleep(PAUSE_MS);
  }
}

async function verifyMcpEndpoints(): Promise<void> {
  section("Hosted MCP endpoints (reachability)");
  for (const server of MCP_SERVERS) {
    if (!server.mcpJson) continue;
    let url: string | undefined;
    try {
      const parsed = JSON.parse(server.mcpJson) as { type?: string; url?: string };
      if (parsed.type === "http" && typeof parsed.url === "string") url = parsed.url;
    } catch {
      // mcpJson may be a local stdio command (no url): skip silently.
    }
    if (!url) continue;
    // Placeholder URLs (project_ref, instance host) are not live: skip them.
    if (/<[^>]+>/.test(url)) {
      line("warn", `mcp:${server.id}: templated URL skipped (${url})`);
      await sleep(PAUSE_MS);
      continue;
    }
    const res = await httpStatus(url, "GET");
    if ("error" in res) {
      line("warn", `mcp:${server.id}: network: ${res.error} (${url})`);
    } else if (res.status === 404 || res.status === 410) {
      line("error", `mcp:${server.id}: endpoint gone (${res.status}) at ${url}`);
    } else {
      line("ok", `mcp:${server.id}: reachable (${res.status}) at ${url}`);
    }
    await sleep(PAUSE_MS);
  }
}

async function main(): Promise<void> {
  console.log("Catalog drift verification (live network checks)\n");
  await verifySettingsSchema();
  await verifyMarketplaceManifests();
  await verifySourceLiveness();
  await verifyMcpEndpoints();

  console.log(`\n== Summary ==`);
  console.log(`  errors: ${errorCount}, warnings: ${warnCount}`);
  if (errorCount > 0) {
    console.log("Result: FAIL (at least one error).");
    process.exit(1);
  }
  console.log("Result: PASS.");
}

main().catch((err) => {
  console.error("verify-catalogs crashed:", err);
  process.exit(1);
});
