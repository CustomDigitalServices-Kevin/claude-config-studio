import type { ReactNode } from "react";
import type { ProfileId, DepthId, SectorId } from "../types";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** Icones par profil (extraites du design Profils Usage). */
export const PROFILE_ICONS: Record<ProfileId, ReactNode> = {
  dev: (
    <Svg>
      <polyline points="8.5 8 5 12 8.5 16" />
      <polyline points="15.5 8 19 12 15.5 16" />
      <line x1="13" y1="6.5" x2="11" y2="17.5" />
    </Svg>
  ),
  audit: (
    <Svg>
      <rect x="4.5" y="3.5" width="11" height="14" rx="2" />
      <line x1="7.5" y1="7.5" x2="12.5" y2="7.5" />
      <line x1="7.5" y1="10.5" x2="10.5" y2="10.5" />
      <circle cx="14.6" cy="15" r="3.2" />
      <line x1="16.9" y1="17.3" x2="19.5" y2="20" />
    </Svg>
  ),
  business: (
    <Svg>
      <path d="M8 14.6a5 5 0 1 1 8 0c-.65.8-1.05 1.45-1.15 2.6H9.15C9.05 16.05 8.65 15.4 8 14.6z" />
      <line x1="9.6" y1="19.6" x2="14.4" y2="19.6" />
      <polyline points="9.4 12.2 11 10.2 13 11.7 15 8.6" />
    </Svg>
  ),
  "data-ml": (
    <Svg>
      <ellipse cx="11.5" cy="5.5" rx="6" ry="2.5" />
      <path d="M5.5 5.5v5.5c0 1.38 2.69 2.5 6 2.5" />
      <path d="M5.5 11c0 1.38 2.69 2.5 6 2.5" />
      <path d="M17.5 5.5v4" />
      <path d="M14.5 17.5h3.6M16.3 15.5l2 2-2 2" />
    </Svg>
  ),
  "power-platform": (
    <Svg>
      <rect x="3.5" y="4" width="6" height="6" rx="1.7" />
      <rect x="14.5" y="4" width="6" height="6" rx="1.7" />
      <rect x="14.5" y="14" width="6" height="6" rx="1.7" />
      <path d="M9.5 7h5" />
      <path d="M17.5 10v4" />
    </Svg>
  ),
  agents: (
    <Svg>
      <rect x="4.5" y="8" width="15" height="11" rx="3.5" />
      <line x1="12" y1="4.3" x2="12" y2="8" />
      <circle cx="12" cy="3.3" r="1.3" />
      <circle cx="9.4" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="13" r="1.25" fill="currentColor" stroke="none" />
      <line x1="2.6" y1="12.5" x2="2.6" y2="15.5" />
      <line x1="21.4" y1="12.5" x2="21.4" y2="15.5" />
    </Svg>
  ),
  infra: (
    <Svg>
      <rect x="3.5" y="4" width="13" height="5.5" rx="1.7" />
      <rect x="3.5" y="12.5" width="8.5" height="5.5" rx="1.7" />
      <circle cx="6.6" cy="6.75" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="6.6" cy="15.25" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="17.6" cy="15.8" r="2.5" />
      <line x1="17.6" y1="11.9" x2="17.6" y2="13.3" />
      <line x1="17.6" y1="18.3" x2="17.6" y2="19.7" />
      <line x1="13.7" y1="15.8" x2="15.1" y2="15.8" />
      <line x1="20.1" y1="15.8" x2="21.5" y2="15.8" />
    </Svg>
  ),
  generic: (
    <Svg>
      <path d="M11.5 3.5l1.7 4.9 4.9 1.7-4.9 1.7-1.7 4.9-1.7-4.9-4.9-1.7 4.9-1.7z" />
      <path d="M18.6 4l.55 1.6 1.6.55-1.6.55-.55 1.6-.55-1.6-1.6-.55 1.6-.55z" />
      <path d="M6.2 16.4l.5 1.45 1.45.5-1.45.5-.5 1.45-.5-1.45-1.45-.5 1.45-.5z" />
    </Svg>
  ),
};

/** Teinte d'accent par profil (oklch hue), du design. */
export const PROFILE_HUE: Record<ProfileId, number> = {
  dev: 30,
  audit: 46,
  business: 62,
  "data-ml": 78,
  "power-platform": 94,
  agents: 22,
  infra: 38,
  generic: 110,
};

/** Icones par profondeur (D24) : racine seule, racine+secteurs, arbre complet. */
export const DEPTH_ICONS: Record<DepthId, ReactNode> = {
  n0: (
    <Svg>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9h6M9 12h6M9 15h3" />
    </Svg>
  ),
  n0n1: (
    <Svg>
      <rect x="9" y="3" width="6" height="4.5" rx="1.2" />
      <rect x="3" y="15.5" width="6" height="4.5" rx="1.2" />
      <rect x="15" y="15.5" width="6" height="4.5" rx="1.2" />
      <path d="M12 7.5v4M6 15.5v-2h12v2" />
    </Svg>
  ),
  n0n1n2: (
    <Svg>
      <path d="M12 4 3 8l9 4 9-4-9-4z" />
      <path d="M3 12l9 4 9-4" />
      <path d="M3 16l9 4 9-4" />
    </Svg>
  ),
};

export const DEPTH_HUE: Record<DepthId, number> = {
  n0: 220,
  n0n1: 195,
  n0n1n2: 265,
};

/** Icones par secteur (D24), meme langage stroke que les profils. */
export const SECTOR_ICONS: Record<SectorId, ReactNode> = {
  web: (
    <Svg>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="3.5" y1="12" x2="20.5" y2="12" />
      <path d="M12 3.5a13 13 0 0 1 0 17 13 13 0 0 1 0-17" />
    </Svg>
  ),
  "power-platform": (
    <Svg>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
    </Svg>
  ),
  "data-ml": (
    <Svg>
      <line x1="4" y1="19" x2="20" y2="19" />
      <rect x="5.5" y="11" width="3" height="8" rx="0.6" />
      <rect x="10.5" y="7.5" width="3" height="11.5" rx="0.6" />
      <rect x="15.5" y="4" width="3" height="15" rx="0.6" />
    </Svg>
  ),
  infra: (
    <Svg>
      <rect x="4" y="4.5" width="16" height="4" rx="1.3" />
      <rect x="4" y="10" width="16" height="4" rx="1.3" />
      <rect x="4" y="15.5" width="16" height="4" rx="1.3" />
      <circle cx="7" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="12" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  ),
  mobile: (
    <Svg>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <line x1="10.5" y1="18" x2="13.5" y2="18" />
    </Svg>
  ),
  "bots-agents": (
    <Svg>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <line x1="9" y1="3.5" x2="9" y2="6.5" />
      <line x1="15" y1="3.5" x2="15" y2="6.5" />
      <line x1="9" y1="17.5" x2="9" y2="20.5" />
      <line x1="15" y1="17.5" x2="15" y2="20.5" />
      <line x1="3.5" y1="9" x2="6.5" y2="9" />
      <line x1="3.5" y1="15" x2="6.5" y2="15" />
      <line x1="17.5" y1="9" x2="20.5" y2="9" />
      <line x1="17.5" y1="15" x2="20.5" y2="15" />
    </Svg>
  ),
  other: (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="9" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </Svg>
  ),
};

/** Teinte d'accent par secteur (oklch hue), spectre distinct pour differencier les cartes. */
export const SECTOR_HUE: Record<SectorId, number> = {
  web: 240,
  "power-platform": 285,
  "data-ml": 200,
  infra: 150,
  mobile: 330,
  "bots-agents": 30,
  other: 110,
};
