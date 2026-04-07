"use client";

import React from "react";

/**
 * LayoutToggle — lets users switch between different response layout modes.
 * Sits in the action bar area, small and unobtrusive.
 */

export type LayoutMode = "grid" | "columns" | "stack";

interface LayoutToggleProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

const modes: { id: LayoutMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "grid",
    label: "Grid",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "columns",
    label: "Columns",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="5" height="18" />
        <rect x="10" y="3" width="5" height="18" />
        <rect x="17" y="3" width="5" height="18" />
      </svg>
    ),
  },
  {
    id: "stack",
    label: "Stack",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="5" />
        <rect x="3" y="10" width="18" height="5" />
        <rect x="3" y="17" width="18" height="5" />
      </svg>
    ),
  },
];

export default function LayoutToggle({ mode, onChange }: LayoutToggleProps) {
  return (
    <div
      className="flex items-center rounded-md overflow-hidden"
      style={{ border: "1px solid #222", background: "#141414" }}
    >
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.08em] transition-colors"
          style={{
            color: mode === m.id ? "#d4a574" : "#444",
            background: mode === m.id ? "#d4a57410" : "transparent",
            borderRight: "1px solid #222",
          }}
          title={m.label}
        >
          {m.icon}
        </button>
      ))}
    </div>
  );
}
