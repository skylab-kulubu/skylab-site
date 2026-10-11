"use client";

import { useCmsPanelSwitch } from "@/components/providers/SkylabCmsProvider";

// Shown to signed-in editors only: puts the editing panel away to see the page as visitors do.
// `compact` is the header's pill; without it, a full-width row for the mobile menu.
export function CmsPanelSwitch({ compact = false }: { compact?: boolean }) {
  const { canEdit, hidden, setHidden } = useCmsPanelSwitch();
  if (!canEdit) return null;

  const knob = (
    <span
      aria-hidden="true"
      className={`relative inline-block h-5 w-9 shrink-0 rounded-full border transition-colors duration-300 ${
        hidden ? "border-white/15 bg-white/5" : "border-purple-400/60 bg-purple-500/25"
      }`}
    >
      <span
        className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-[left,background-color] duration-300 ${
          hidden ? "left-1 bg-white/40" : "left-[19px] bg-purple-300"
        }`}
      />
    </span>
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={!hidden}
      aria-label="Düzenleme paneli"
      onClick={() => setHidden(!hidden)}
      className={
        compact
          ? "liquid-glass pointer-events-auto flex items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-4 text-xs font-semibold tracking-wider text-white/70 uppercase transition-colors hover:text-white"
          : "flex w-full items-center justify-between gap-4 rounded-xl p-3 text-sm font-semibold tracking-wider text-white/60 uppercase transition-colors hover:bg-white/4 hover:text-white"
      }
    >
      {compact ? "Panel" : "Düzenleme paneli"}
      {knob}
    </button>
  );
}
