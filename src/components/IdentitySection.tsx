import { useState, type ReactNode } from "react";
import type { Answers, ResponseStyle } from "../types";
import type { SectionProps } from "./sectionShared";
import { OptionCard } from "./OptionCard";

function CubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.6l7.5 4.2v8.4L12 19.4l-7.5-4.2V6.8z" />
      <path d="M4.5 6.9l7.5 4.2 7.5-4.2" />
      <path d="M12 11.1V19.4" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.4a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="3.5" width="13" height="17" rx="1.6" />
      <path d="M9 7.8h0M14 7.8h0M9 11.3h0M14 11.3h0" />
      <path d="M10.5 20.5v-3.2a1.5 1.5 0 0 1 3 0v3.2" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3.5 12.5h17" />
    </svg>
  );
}
function HashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4.5L7 19.5M17 4.5l-2 15M4.5 9h15M4 15h15" />
    </svg>
  );
}

const STYLE_OPTIONS: { value: ResponseStyle; label: string; sub: string }[] = [
  { value: "", label: "Par défaut", sub: "Aucune directive de ton" },
  { value: "concise", label: "Concis", sub: "Court et direct" },
  { value: "detailed", label: "Détaillé", sub: "Explique le raisonnement" },
];

function Field({
  label,
  required,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.trim().length > 0;
  const accentText = focused || filled;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          className="text-[12.5px] font-bold tracking-wide transition-colors"
          style={{ color: accentText ? "oklch(0.83 0.13 75)" : "oklch(0.74 0.02 285)" }}
        >
          {label}
        </label>
        <span
          className="rounded-full px-2 py-[3px] text-[10.5px] font-bold uppercase tracking-wider"
          style={
            required
              ? { color: "oklch(0.82 0.13 75)", background: "oklch(0.78 0.15 70 / 0.13)", border: "1px solid oklch(0.78 0.15 70 / 0.28)" }
              : { color: "oklch(0.58 0.012 75)", background: "oklch(0.30 0.006 65)", border: "1px solid oklch(0.36 0.008 65)" }
          }
        >
          {required ? "Requis" : "Optionnel"}
        </span>
      </div>
      <div
        className="relative flex h-[50px] items-center rounded-[14px] transition-all"
        style={{
          background: focused ? "oklch(0.225 0.008 68)" : "oklch(0.19 0.006 65)",
          border: `1px solid ${focused ? "oklch(0.80 0.15 72 / 0.9)" : filled ? "oklch(0.78 0.15 72 / 0.45)" : "oklch(0.31 0.008 65)"}`,
          boxShadow: focused ? "0 0 0 3px oklch(0.78 0.15 72 / 0.15), 0 10px 26px -16px oklch(0.78 0.15 72 / 0.5)" : "none",
        }}
      >
        <span
          className="pointer-events-none absolute left-[15px] flex transition-colors"
          style={{ color: accentText ? "oklch(0.82 0.14 75)" : "oklch(0.6 0.012 75)" }}
        >
          {icon}
        </span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-full w-full bg-transparent pl-[45px] pr-[44px] text-[14.5px] font-semibold outline-none"
          style={{ color: "oklch(0.96 0.004 75)" }}
        />
        <span
          className="absolute right-[14px] flex h-5 w-5 items-center justify-center rounded-full transition-all"
          style={{ background: "oklch(0.80 0.15 72)", opacity: filled ? 1 : 0, transform: filled ? "scale(1)" : "scale(0.5)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="oklch(0.2 0.012 65)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export function IdentitySection({ answers, setAnswers }: SectionProps) {
  const a = answers;
  const [showAdvanced, setShowAdvanced] = useState(false);
  const set = (patch: Partial<Answers>): void => setAnswers((prev) => ({ ...prev, ...patch }));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Nom du dossier de travail" required icon={<CubeIcon />} value={a.projectName} onChange={(v) => set({ projectName: v })} placeholder="mon-dossier" />
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
            Le nom du dossier de travail (celui qui contient le dossier .claude). Sert d'identité projet dans les fichiers générés.
          </p>
        </div>
        <Field label="Auteur" icon={<UserIcon />} value={a.author} onChange={(v) => set({ author: v })} placeholder="Votre nom" />
        <Field label="Organisation" icon={<BuildingIcon />} value={a.org} onChange={(v) => set({ org: v })} placeholder="Votre organisation" />
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((s) => !s)}
        className="rounded px-2 py-1 text-xs font-semibold text-ink-400 transition-colors hover:text-clay-300"
      >
        Options avancées {showAdvanced ? "▲" : "▼"}
      </button>

      {showAdvanced && (
        <div className="grid grid-cols-1 gap-x-[18px] gap-y-5 sm:grid-cols-2">
          <Field label="Rôle / métier" icon={<BriefcaseIcon />} value={a.authorRole} onChange={(v) => set({ authorRole: v })} placeholder="Ex : Freelance, Data engineer" />
          {a.org.trim().length > 0 && (
            <Field label="Numéro d'entreprise" icon={<HashIcon />} value={a.companyId} onChange={(v) => set({ companyId: v })} placeholder="SIREN, TVA, EIN..." />
          )}
          <div className="sm:col-span-2">
            <p className="mb-2 text-[12.5px] font-bold tracking-wide" style={{ color: "oklch(0.74 0.02 285)" }}>
              Style de réponses
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {STYLE_OPTIONS.map((o) => (
                <OptionCard
                  key={o.value || "default"}
                  title={o.label}
                  subtitle={o.sub}
                  selected={a.responseStyle === o.value}
                  onClick={() => set({ responseStyle: o.value })}
                />
              ))}
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
              Ton et longueur, injecté dans la posture du CLAUDE.md. Distinct du « Style de sortie » des Settings (Explanatory/Learning).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
