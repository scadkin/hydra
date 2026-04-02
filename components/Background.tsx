"use client";

/**
 * Background.tsx
 * Animated atmospheric background with overlapping radial gradients.
 * Sits behind all content at z-0, purely decorative (pointer-events-none).
 */
export default function Background() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base dark layer */}
      <div className="absolute inset-0 bg-[#0a0a0f]" />

      {/* Purple nebula — top-left drift */}
      <div
        className="absolute -top-1/4 -left-1/4 w-[80vw] h-[80vh] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(139,92,246,0.35) 0%, transparent 70%)",
          animation: "aurora-pulse 12s ease-in-out infinite",
        }}
      />

      {/* Blue glow — center-right */}
      <div
        className="absolute top-1/4 -right-1/4 w-[70vw] h-[70vh] rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.3) 0%, transparent 70%)",
          animation: "aurora-pulse-alt 15s ease-in-out infinite",
        }}
      />

      {/* Teal accent — bottom */}
      <div
        className="absolute -bottom-1/4 left-1/3 w-[60vw] h-[60vh] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(20,184,166,0.25) 0%, transparent 70%)",
          animation: "float-slow 10s ease-in-out infinite",
        }}
      />

      {/* Deep indigo wash — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 60%)",
          animation: "aurora-pulse 18s ease-in-out infinite reverse",
        }}
      />

      {/* Subtle grain overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
