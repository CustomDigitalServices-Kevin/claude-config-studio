import type { ProfileId } from "../types";
import type { MarketplaceTopicId } from "./generalMarketplaces";
import type { McpCategoryId } from "./mcpServers";

/**
 * Mapping profil d'usage -> sujets de marketplaces et categories MCP pertinents.
 * Permet d'afficher en premier (et de signaler) ce qui correspond aux profils coches au ch2.
 */
export const PROFILE_MARKETPLACE_TOPICS: Record<ProfileId, MarketplaceTopicId[]> = {
  dev: ["ide", "packages"],
  audit: [],
  business: [],
  "data-ml": ["packages"],
  "power-platform": ["power-platform"],
  agents: ["packages"],
  infra: [],
  generic: [],
};

export const PROFILE_MCP_CATEGORIES: Record<ProfileId, McpCategoryId[]> = {
  dev: ["dev-git", "browser", "docs", "files-web", "repo"],
  audit: ["files-web", "observability", "repo"],
  business: ["productivity", "knowledge", "search"],
  "data-ml": ["db", "docs", "files-web"],
  "power-platform": ["docs", "cloud"],
  agents: ["planning", "docs", "files-web", "knowledge"],
  infra: ["cloud", "observability", "dev-git"],
  generic: [],
};

export function relevantMarketplaceTopics(profiles: ProfileId[]): Set<MarketplaceTopicId> {
  const out = new Set<MarketplaceTopicId>();
  for (const p of profiles) {
    for (const t of PROFILE_MARKETPLACE_TOPICS[p]) {
      out.add(t);
    }
  }
  return out;
}

export function relevantMcpCategories(profiles: ProfileId[]): Set<McpCategoryId> {
  const out = new Set<McpCategoryId>();
  for (const p of profiles) {
    for (const c of PROFILE_MCP_CATEGORIES[p]) {
      out.add(c);
    }
  }
  return out;
}
