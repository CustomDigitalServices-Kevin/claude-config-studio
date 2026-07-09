import type { ProfileId, SectorId } from "../types";
import { pick } from "../types";
import { CHROME } from "../i18n/chrome";
import { PROFILES, defaultRulesForProfiles, recommendedStacksForProfiles } from "../data/profiles";
import { DEPTH_OPTIONS, hasSectorLayer } from "../data/depths";
import { SECTORS } from "../data/sectors";
import { SectionLabel } from "./primitives";
import { OptionCard } from "./OptionCard";
import { HierarchySchema } from "./HierarchySchema";
import {
  PROFILE_ICONS,
  PROFILE_HUE,
  DEPTH_ICONS,
  DEPTH_HUE,
  SECTOR_ICONS,
  SECTOR_HUE,
} from "./icons";
import { toggle, type SectionProps } from "./sectionShared";

export function ProfilesSection({ answers: a, setAnswers: setA, lang }: SectionProps) {
  function toggleProfile(p: ProfileId) {
    setA((prev) => {
      const profiles = toggle<ProfileId>(prev.profiles, p);
      const recommended = recommendedStacksForProfiles(profiles);
      return {
        ...prev,
        profiles,
        rules: defaultRulesForProfiles(profiles),
        stacks: recommended.length > 0 ? recommended : prev.stacks,
      };
    });
  }

  function toggleSector(id: SectorId) {
    setA((prev) => ({ ...prev, sectors: toggle<SectorId>(prev.sectors, id) }));
  }

  const showSectors = hasSectorLayer(a.depth);

  return (
    <div className="space-y-7">
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <SectionLabel
            title={pick(CHROME.profiles.profilesTitle, lang)}
            hint={pick(CHROME.profiles.profilesHint, lang)}
          />
          {a.profiles.length > 0 && (
            <span
              className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: "oklch(0.78 0.15 70 / 0.12)",
                border: "1px solid oklch(0.78 0.15 70 / 0.32)",
              }}
            >
              <span className="text-[13px] font-extrabold" style={{ color: "oklch(0.84 0.14 75)" }}>
                {a.profiles.length}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: "oklch(0.78 0.09 75)" }}>
                {pick(CHROME.common.selected, lang)}
              </span>
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {PROFILES.map((p) => (
            <OptionCard
              key={p.id}
              icon={PROFILE_ICONS[p.id]}
              hue={PROFILE_HUE[p.id]}
              selected={a.profiles.includes(p.id)}
              onClick={() => toggleProfile(p.id)}
              title={pick(p.label, lang)}
              subtitle={pick(p.tagline, lang)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionLabel
          title={pick(CHROME.profiles.depthTitle, lang)}
          hint={pick(CHROME.profiles.depthHint, lang)}
        />
        <div className="grid grid-cols-1 gap-2.5">
          {DEPTH_OPTIONS.map((d) => (
            <OptionCard
              key={d.id}
              icon={DEPTH_ICONS[d.id]}
              hue={DEPTH_HUE[d.id]}
              selected={a.depth === d.id}
              onClick={() => setA((prev) => ({ ...prev, depth: d.id }))}
              title={`${pick(d.label, lang)} · ${d.level}`}
              subtitle={pick(d.summary, lang)}
            />
          ))}
        </div>
      </section>

      {showSectors && (
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <SectionLabel
              title={pick(CHROME.profiles.sectorsTitle, lang)}
              hint={pick(CHROME.profiles.sectorsHint, lang)}
            />
            {a.sectors.length > 0 && (
              <span
                className="mb-0.5 flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: "oklch(0.78 0.15 70 / 0.12)",
                  border: "1px solid oklch(0.78 0.15 70 / 0.32)",
                }}
              >
                <span
                  className="text-[13px] font-extrabold"
                  style={{ color: "oklch(0.84 0.14 75)" }}
                >
                  {a.sectors.length}
                </span>
                <span
                  className="text-[12px] font-semibold"
                  style={{ color: "oklch(0.78 0.09 75)" }}
                >
                  {pick(CHROME.common.selected, lang)}
                </span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SECTORS.map((s) => (
              <OptionCard
                key={s.id}
                icon={SECTOR_ICONS[s.id]}
                hue={SECTOR_HUE[s.id]}
                selected={a.sectors.includes(s.id)}
                onClick={() => toggleSector(s.id)}
                title={pick(s.label, lang)}
                subtitle={pick(s.tagline, lang)}
              />
            ))}
          </div>
          {a.sectors.length === 0 && (
            <p className="mt-2 text-xs" style={{ color: "oklch(0.72 0.09 60)" }}>
              {pick(CHROME.profiles.sectorsEmpty, lang)}
            </p>
          )}
        </section>
      )}

      <section>
        <SectionLabel
          title={pick(CHROME.profiles.schemaTitle, lang)}
          hint={pick(CHROME.profiles.schemaHint, lang)}
        />
        <HierarchySchema lang={lang} />
      </section>
    </div>
  );
}
