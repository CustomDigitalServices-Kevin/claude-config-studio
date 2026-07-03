import type { Localized } from "../types";

/**
 * Marketplaces et galeries connues, par sujet (hors marketplaces de plugins Claude Code).
 * Source : sites officiels + Microsoft Learn (verifie 2026-06-30).
 */

export type MarketplaceTopicId = "power-platform" | "ide" | "packages";

export interface GeneralMarketplace {
  id: string;
  name: string;
  topic: MarketplaceTopicId;
  official: boolean;
  what: Localized;
  /** Ce qu'on y trouve / pour qui. */
  whatYouFind: Localized;
  url: string;
}

export const MARKETPLACE_TOPICS: ReadonlyArray<{ id: MarketplaceTopicId; label: Localized }> = [
  { id: "power-platform", label: { fr: "Power Platform / Microsoft", en: "Power Platform / Microsoft" } },
  { id: "ide", label: { fr: "Éditeurs / IDE", en: "Editors / IDE" } },
  { id: "packages", label: { fr: "Dev général / packages", en: "General dev / packages" } },
];

export const GENERAL_MARKETPLACES: readonly GeneralMarketplace[] = [
  {
    id: "appsource",
    name: "Microsoft AppSource",
    topic: "power-platform",
    official: true,
    what: {
      fr: "Marketplace officiel Microsoft des apps, add-ins et extensions de l'écosystème Microsoft cloud (M365, Azure, Dynamics 365, Power Platform, Power BI).",
      en: "Microsoft's official marketplace for apps, add-ins and extensions across the Microsoft cloud (M365, Azure, Dynamics 365, Power Platform, Power BI).",
    },
    whatYouFind: {
      fr: "Apps SaaS, add-ins Office/Teams, solutions Dynamics 365 et Power Platform, visuels Power BI, services de conseil. Gratuit, essai ou payant.",
      en: "SaaS apps, Office/Teams add-ins, Dynamics 365 and Power Platform solutions, Power BI visuals, consulting services. Free, trial or paid.",
    },
    url: "https://appsource.microsoft.com",
  },
  {
    id: "powerbi-visuals",
    name: "Visuels Power BI (AppSource)",
    topic: "power-platform",
    official: true,
    what: {
      fr: "La section AppSource dédiée aux visuels Power BI (Microsoft et communauté, dont les visuels certifiés Microsoft) packagés en .pbiviz.",
      en: "The AppSource section for Power BI visuals (Microsoft and community, including Microsoft-certified visuals) packaged as .pbiviz.",
    },
    whatYouFind: {
      fr: "Des centaines de visuels custom et certifiés (graphiques, KPI, cartes), chacun avec un rapport d'exemple. Pour les auteurs de rapports Power BI.",
      en: "Hundreds of custom and certified visuals (charts, KPIs, maps), each with a sample report. For Power BI report authors.",
    },
    url: "https://appsource.microsoft.com/marketplace/apps?product=power-bi-visuals",
  },
  {
    id: "pcf-gallery",
    name: "PCF Gallery",
    topic: "power-platform",
    official: false,
    what: {
      fr: "Galerie communautaire des composants PCF (PowerApps Component Framework) : contrôles custom réutilisables. Maintenue par Guido Preite (non-Microsoft).",
      en: "Community gallery of PCF (PowerApps Component Framework) code components: reusable custom controls. Maintained by Guido Preite (not Microsoft).",
    },
    whatYouFind: {
      fr: "Des centaines de composants code (sliders, kanban, lookups, data-viz) pour apps model-driven, canvas et mobile. Pour les devs pro-code/low-code Power Platform.",
      en: "Hundreds of code components (sliders, kanban, lookups, data-viz) for model-driven, canvas and mobile apps. For pro-code/low-code Power Platform devs.",
    },
    url: "https://pcf.gallery",
  },
  {
    id: "power-automate-templates",
    name: "Galerie de templates Power Automate",
    topic: "power-platform",
    official: true,
    what: {
      fr: "Galerie first-party de templates de cloud flows dans le portail maker Power Automate.",
      en: "First-party gallery of cloud-flow templates inside the Power Automate maker portal.",
    },
    whatYouFind: {
      fr: "Templates d'automatisation prêts à l'emploi, par app (Outlook, SharePoint, Teams) et par scénario (RH, finance, IT). Pour les makers.",
      en: "Ready-to-use automation templates, by app (Outlook, SharePoint, Teams) and scenario (HR, finance, IT). For makers.",
    },
    url: "https://make.powerautomate.com/templates",
  },
  {
    id: "powerplatform-community-galleries",
    name: "Power Platform Community Galleries",
    topic: "power-platform",
    official: true,
    what: {
      fr: "Galeries communautaires Power Platform : sample apps, templates, composants et références contribués par la communauté.",
      en: "Power Platform community galleries: sample apps, templates, components and references contributed by the community.",
    },
    whatYouFind: {
      fr: "Sample apps (Branding Template App), références de formules, générateurs d'icônes. Complément des templates in-product de make.powerapps.com.",
      en: "Sample apps (Branding Template App), formula references, icon generators. Complements the in-product templates at make.powerapps.com.",
    },
    url: "https://community.powerplatform.com/galleries/",
  },
  {
    id: "copilot-agent-store",
    name: "Agent Store (Microsoft 365 Copilot)",
    topic: "power-platform",
    official: true,
    what: {
      fr: "Store curé dans Microsoft 365 Copilot pour découvrir et installer des agents IA (Microsoft, partenaires, makers internes). Les agents Copilot Studio y publient après approbation admin.",
      en: "Curated store in Microsoft 365 Copilot to discover and install AI agents (Microsoft, partners, internal makers). Copilot Studio agents publish here after admin approval.",
    },
    whatYouFind: {
      fr: "Agents Copilot préconstruits et custom, installables dans Teams, Outlook, Word, Excel. Store in-product (pas de page publique anonyme).",
      en: "Prebuilt and custom Copilot agents, installable in Teams, Outlook, Word, Excel. In-product store (no anonymous public page).",
    },
    url: "https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-agent-store",
  },
  {
    id: "powerplatform-connectors",
    name: "Référence des connecteurs Power Platform",
    topic: "power-platform",
    official: true,
    what: {
      fr: "Référence officielle Microsoft Learn de tous les connecteurs disponibles pour Power Automate, Power Apps et Azure Logic Apps (catalogue de référence, pas transactable).",
      en: "Official Microsoft Learn reference of all connectors available to Power Automate, Power Apps and Azure Logic Apps (reference catalog, not transactable).",
    },
    whatYouFind: {
      fr: "Des centaines de connecteurs first/third-party (Salesforce, Slack, Azure, connecteurs MCP Server), filtrables par tier Standard/Premium. Pour choisir ses intégrations.",
      en: "Hundreds of first/third-party connectors (Salesforce, Slack, Azure, MCP Server connectors), filterable by Standard/Premium tier. For choosing integrations.",
    },
    url: "https://learn.microsoft.com/en-us/connectors/connector-reference/",
  },
  {
    id: "vs-marketplace",
    name: "Visual Studio Marketplace",
    topic: "ide",
    official: true,
    what: {
      fr: "Marketplace officiel Microsoft des extensions pour la famille Visual Studio.",
      en: "Microsoft's official marketplace for extensions across the Visual Studio family.",
    },
    whatYouFind: {
      fr: "Extensions VS Code, Visual Studio IDE et Azure DevOps. Canal principal de distribution des extensions VS Code.",
      en: "VS Code, Visual Studio IDE and Azure DevOps extensions. Primary distribution channel for VS Code extensions.",
    },
    url: "https://marketplace.visualstudio.com",
  },
  {
    id: "open-vsx",
    name: "Open VSX Registry",
    topic: "ide",
    official: false,
    what: {
      fr: "Registre open-source et neutre des extensions compatibles VS Code, opéré par l'Eclipse Foundation.",
      en: "Open-source, vendor-neutral registry of VS Code-compatible extensions, run by the Eclipse Foundation.",
    },
    whatYouFind: {
      fr: "Extensions compatibles VS Code pour les éditeurs alternatifs (VSCodium, Gitpod, Theia, Cursor). Pour une chaîne d'extensions ouverte.",
      en: "VS Code-compatible extensions for alternative editors (VSCodium, Gitpod, Theia, Cursor). For an open extension supply chain.",
    },
    url: "https://open-vsx.org",
  },
  {
    id: "jetbrains-marketplace",
    name: "JetBrains Marketplace",
    topic: "ide",
    official: true,
    what: {
      fr: "Marketplace officiel JetBrains des plugins étendant sa famille d'IDE.",
      en: "JetBrains' official marketplace for plugins extending its IDE family.",
    },
    whatYouFind: {
      fr: "Plugins pour IntelliJ IDEA, PyCharm, WebStorm, Rider, GoLand. Gratuits et payants.",
      en: "Plugins for IntelliJ IDEA, PyCharm, WebStorm, Rider, GoLand. Free and paid.",
    },
    url: "https://plugins.jetbrains.com",
  },
  {
    id: "npm",
    name: "npm (npm Registry)",
    topic: "packages",
    official: true,
    what: {
      fr: "Le plus grand registre logiciel au monde, registre par défaut de JavaScript / Node.js.",
      en: "The world's largest software registry, the default package registry for JavaScript / Node.js.",
    },
    whatYouFind: {
      fr: "Packages JS/TS à installer (`npm install`) ou exécuter (`npx`). Public gratuit, privé payant.",
      en: "JS/TS packages to install (`npm install`) or run (`npx`). Public free, private paid.",
    },
    url: "https://www.npmjs.com",
  },
  {
    id: "pypi",
    name: "PyPI (Python Package Index)",
    topic: "packages",
    official: true,
    what: {
      fr: "Le dépôt officiel tiers de packages pour le langage Python.",
      en: "The official third-party package repository for the Python language.",
    },
    whatYouFind: {
      fr: "Packages et librairies Python à installer (`pip install`). Pour les devs Python.",
      en: "Python packages and libraries to install (`pip install`). For Python devs.",
    },
    url: "https://pypi.org",
  },
];
