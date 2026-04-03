"use client";

/**
 * Background.tsx
 * A single, warm, soft radial glow behind the search area.
 * NOT aurora blobs. NOT gradient mesh. Just one purposeful light source
 * that draws the eye to the search bar — like a spotlight on a stage.
 */
export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Single warm glow — centered at the top where the search bar is */}
      <div
        className="absolute top-[15%] left-1/2"
        style={{
          width: "800px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(212,165,116,0.08) 0%, transparent 70%)",
          animation: "glow-shift 8s ease-in-out infinite",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Subtle noise for texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
