import type { ReactNode } from "react";

/**
 * Schema pedagogique STATIQUE (D24) : illustre la profondeur d'une arborescence .claude
 * sur 3 niveaux (Racine / Secteur / Projet). Conversion fidele du design
 * "Arborescence 3 Niveaux" (DesignSync a814a862), theme ambre dark. Contenu fixe et volontaire :
 * il explique le concept, il ne reflete pas la selection en cours (choix advisor 2026-07-01).
 */

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

function LevelBadge({ text, tone }: { text: string; tone: "root" | "sector" | "project" }) {
  const styles: Record<typeof tone, { color: string; bg: string; border: string }> = {
    root: { color: "#f4b968", bg: "rgba(232,163,85,0.16)", border: "rgba(232,163,85,0.4)" },
    sector: { color: "#e6c07a", bg: "rgba(224,178,96,0.12)", border: "rgba(224,178,96,0.3)" },
    project: { color: "#8f877a", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.08)" },
  };
  const s = styles[tone];
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: s.color,
        background: s.bg,
        border: `1px solid ${s.border}`,
        padding: "2.5px 8px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

/** Guide d'arbre : trait vertical + coude horizontal a gauche du noeud. */
function Branch({ children, last }: { children: ReactNode; last?: boolean }) {
  return (
    <div style={{ position: "relative", marginBottom: last ? 0 : 8 }}>
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -30,
          top: 0,
          bottom: last ? "auto" : -8,
          height: last ? 26 : "auto",
          width: 28,
          borderLeft: "2px solid #322c24",
          borderBottom: "2px solid #322c24",
          borderBottomLeftRadius: 12,
        }}
      />
      {children}
    </div>
  );
}

function RootNode() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 16,
        background: "linear-gradient(135deg,#2c2317 0%,#231c12 100%)",
        border: "1px solid rgba(232,163,85,0.34)",
        boxShadow: "0 0 0 1px rgba(232,163,85,0.06), 0 18px 40px -26px rgba(232,163,85,0.5)",
      }}
    >
      <div
        style={{
          flex: "none",
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "linear-gradient(140deg,#f2b25f 0%,#d0842f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px -8px rgba(232,163,85,0.7)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4.6a1.5 1.5 0 0 1 1.06.44l1.2 1.2a1.5 1.5 0 0 0 1.06.44H19.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-11Z"
            fill="#2a1c08"
            fillOpacity="0.9"
            stroke="#3a2708"
            strokeWidth="1.2"
          />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#fbf5ec", letterSpacing: "-0.01em" }}>
            Configuration racine
          </span>
          <LevelBadge text="Niveau 0" tone="root" />
        </div>
        <div style={{ fontSize: 12.5, color: "#b7ac9b", marginTop: 3 }}>
          Le contenant global : règles transverses à tous les projets
        </div>
      </div>
    </div>
  );
}

function SectorNode({ name, children, last }: { name: string; children: ReactNode; last?: boolean }) {
  return (
    <Branch last={last}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 13,
          background: "#241e15",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            flex: "none",
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(224,178,96,0.14)",
            border: "1px solid rgba(224,178,96,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9a1.5 1.5 0 0 1 1.06.44l1.2 1.2a1.5 1.5 0 0 0 1.06.44h6.68A1.5 1.5 0 0 1 20.5 8.5"
              stroke="#e6c07a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M2.6 9.5h18.8l-1.7 8.1a1.5 1.5 0 0 1-1.47 1.19H5.77A1.5 1.5 0 0 1 4.3 17.6L2.6 9.5Z"
              fill="rgba(224,178,96,0.12)"
              stroke="#e6c07a"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, fontSize: 15.5, color: "#f2ebde" }}>{name}</span>
            <LevelBadge text="Niveau 1" tone="sector" />
          </div>
          <div style={{ fontSize: 12, color: "#a49a89", marginTop: 2 }}>
            Un secteur : regroupe les projets du meme domaine
          </div>
        </div>
      </div>
      <div style={{ marginLeft: 20, paddingLeft: 28, borderLeft: "2px solid #2b2620", marginTop: 6, paddingTop: 6 }}>
        {children}
      </div>
    </Branch>
  );
}

function ProjectNode({ name, last }: { name: string; last?: boolean }) {
  return (
    <Branch last={last}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "10px 13px",
          borderRadius: 11,
          background: "#201b15",
          border: "1px solid rgba(255,255,255,0.045)",
        }}
      >
        <div
          style={{
            flex: "none",
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "rgba(255,255,255,0.045)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 3.5h7.2L18.5 8.8V19.5A1 1 0 0 1 17.5 20.5h-11.5A1 1 0 0 1 5 19.5v-15A1 1 0 0 1 6 3.5Z"
              fill="rgba(255,255,255,0.03)"
              stroke="#8f877a"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M13 3.5V8.5A0.5 0.5 0 0 0 13.5 9H18.5" stroke="#8f877a" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500, color: "#d9d1c3" }}>{name}</span>
        <LevelBadge text="Niveau 2" tone="project" />
      </div>
    </Branch>
  );
}

function LegendRow({ swatch, title, color, desc }: { swatch: ReactNode; title: string; color: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ flex: "none", marginTop: 3 }}>{swatch}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12, lineHeight: 1.5, color: "#a79f92" }}>{desc}</div>
      </div>
    </div>
  );
}

export function HierarchySchema() {
  return (
    <div
      style={{
        background: "radial-gradient(700px 340px at 16% -20%, #24201a 0%, #17140f 62%, #131009 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20,
        padding: "26px 26px 30px",
      }}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#e2a355", marginBottom: 10 }}>
          Arborescence · 3 niveaux de profondeur
        </div>
        <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: "#f6f1e8", letterSpacing: "-0.01em" }}>
          Comprendre la profondeur d'un .claude
        </div>
        <p style={{ margin: "8px 0 0", maxWidth: 520, fontSize: 13, lineHeight: 1.55, color: "#a79f92" }}>
          Chaque niveau descend d'un cran : le contenant global, puis le secteur, puis le projet précis. Plus on descend,
          plus l'objet devient spécifique et hérite des niveaux au-dessus.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 244px", gap: 26, alignItems: "start" }}>
        {/* Arbre */}
        <div
          style={{
            background: "#1b1712",
            border: "1px solid rgba(255,255,255,0.055)",
            borderRadius: 18,
            padding: "28px 28px 30px",
            boxShadow: "0 30px 70px -40px rgba(0,0,0,0.7)",
          }}
        >
          <RootNode />
          <div style={{ marginLeft: 22, paddingLeft: 30, borderLeft: "2px solid #322c24", marginTop: 6, paddingTop: 8 }}>
            <SectorNode name="Web">
              <ProjectNode name="portail-client" />
              <ProjectNode name="site-vitrine" last />
            </SectorNode>
            <SectorNode name="Data / ML" last>
              <ProjectNode name="modele-churn" last />
            </SectorNode>
          </div>
        </div>

        {/* Legende */}
        <div style={{ background: "#1b1712", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 18, padding: "22px 20px 24px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8171", marginBottom: 8 }}>
            Le rôle de chaque niveau
          </div>
          <LegendRow
            title="Niveau 0 - Racine"
            color="#f4b968"
            desc="Le contenant global : un seul .claude qui porte les règles transverses."
            swatch={<span style={{ display: "block", width: 12, height: 12, borderRadius: 4, background: "linear-gradient(140deg,#f2b25f,#d0842f)" }} />}
          />
          <LegendRow
            title="Niveau 1 - Secteur"
            color="#e6c07a"
            desc="Le domaine : il regroupe les projets qui se ressemblent (Web, Data...)."
            swatch={<span style={{ display: "block", width: 12, height: 12, borderRadius: 4, background: "rgba(224,178,96,0.6)", border: "1px solid rgba(224,178,96,0.5)" }} />}
          />
          <div style={{ display: "flex", gap: 12, paddingTop: 14 }}>
            <div style={{ flex: "none", marginTop: 3 }}>
              <span style={{ display: "block", width: 12, height: 12, borderRadius: 4, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#cfc7ba", marginBottom: 3 }}>Niveau 2 - Projet</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#a79f92" }}>
                Le .claude precis d'un projet, au bout du chemin. Herite de tout au-dessus.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
