"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * HydraArena — For "The Arena" design.
 * Uses the dark purple/teal glowing hydra (variant-1).
 * Aggressive, menacing, with wide head sway.
 */
export default function HydraArena() {
  return (
    <AsciiRenderer
      src="/hydra-variant-1.jpg"
      color="#aa3333"
      bgMode="dark"
      threshold={65}
      opacity={0.45}
      contrast={1.6}
      headRegions={[
        // Left head
        { x: 0.0, y: 0.05, w: 0.22, h: 0.45, swayAmountX: 0.02, swayAmountY: 0.015, swaySpeed: 0.5, phase: 0 },
        // Center-left head
        { x: 0.2, y: 0.0, w: 0.2, h: 0.4, swayAmountX: 0.012, swayAmountY: 0.018, swaySpeed: 0.4, phase: 1.5 },
        // Center head (top)
        { x: 0.35, y: 0.0, w: 0.3, h: 0.4, swayAmountX: 0.008, swayAmountY: 0.012, swaySpeed: 0.35, phase: 3.0 },
        // Center-right head
        { x: 0.6, y: 0.0, w: 0.2, h: 0.4, swayAmountX: 0.012, swayAmountY: 0.018, swaySpeed: 0.45, phase: 4.2 },
        // Right head
        { x: 0.78, y: 0.05, w: 0.22, h: 0.45, swayAmountX: 0.02, swayAmountY: 0.015, swaySpeed: 0.48, phase: 5.5 },
      ]}
    />
  );
}
