"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * HydraNexus — For "The Nexus" cyberpunk design.
 * Uses the stipple art hydra (hydra-stipple.gif) — black & white.
 * INVERTED so the dragon becomes bright on dark.
 * Cyan colored to match the cyberpunk theme. Fast, glitchy movement.
 */
export default function HydraNexus() {
  return (
    <AsciiRenderer
      src="/hydra-stipple.gif"
      color="#00e5ff"
      bgMode="light"
      threshold={200}
      opacity={0.35}
      contrast={1.5}
      cellW={4}
      cellH={7}
      headRegions={[
        // The stipple hydra has clear head positions — 7 heads in an arc
        // Left drooping head
        { x: 0.0, y: 0.1, w: 0.2, h: 0.3, swayAmountX: 0.018, swayAmountY: 0.01, swaySpeed: 0.6, phase: 0 },
        // Left-mid head
        { x: 0.12, y: 0.0, w: 0.18, h: 0.3, swayAmountX: 0.015, swayAmountY: 0.012, swaySpeed: 0.55, phase: 0.9 },
        // Left-center head
        { x: 0.28, y: 0.0, w: 0.15, h: 0.25, swayAmountX: 0.012, swayAmountY: 0.015, swaySpeed: 0.5, phase: 1.8 },
        // Center head (tallest)
        { x: 0.4, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.008, swayAmountY: 0.012, swaySpeed: 0.45, phase: 2.7 },
        // Right-center head
        { x: 0.55, y: 0.0, w: 0.15, h: 0.25, swayAmountX: 0.012, swayAmountY: 0.015, swaySpeed: 0.5, phase: 3.6 },
        // Right-mid head
        { x: 0.65, y: 0.0, w: 0.18, h: 0.3, swayAmountX: 0.015, swayAmountY: 0.012, swaySpeed: 0.55, phase: 4.5 },
        // Right head
        { x: 0.78, y: 0.05, w: 0.22, h: 0.3, swayAmountX: 0.018, swayAmountY: 0.01, swaySpeed: 0.6, phase: 5.4 },
      ]}
    />
  );
}
