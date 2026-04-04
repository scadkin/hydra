"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * HydraSanctum — For "The Sanctum" design.
 * Uses the copper/bronze 7-headed hydra (variant-2).
 * Golden, regal, slower more deliberate movement.
 */
export default function HydraSanctum() {
  return (
    <AsciiRenderer
      src="/hydra-variant-2.webp"
      color="#c9a84c"
      bgMode="dark"
      threshold={90}
      opacity={0.4}
      contrast={1.3}
      headRegions={[
        // Lower-left head
        { x: 0.0, y: 0.35, w: 0.25, h: 0.3, swayAmountX: 0.012, swayAmountY: 0.01, swaySpeed: 0.3, phase: 0 },
        // Mid-left head
        { x: 0.1, y: 0.1, w: 0.2, h: 0.35, swayAmountX: 0.01, swayAmountY: 0.012, swaySpeed: 0.25, phase: 1.0 },
        // Upper-left head
        { x: 0.25, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.008, swayAmountY: 0.015, swaySpeed: 0.28, phase: 2.1 },
        // Top center head
        { x: 0.38, y: 0.0, w: 0.24, h: 0.28, swayAmountX: 0.006, swayAmountY: 0.01, swaySpeed: 0.22, phase: 3.0 },
        // Upper-right head
        { x: 0.55, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.008, swayAmountY: 0.015, swaySpeed: 0.28, phase: 4.1 },
        // Mid-right head
        { x: 0.7, y: 0.1, w: 0.2, h: 0.35, swayAmountX: 0.01, swayAmountY: 0.012, swaySpeed: 0.25, phase: 5.0 },
        // Lower-right head
        { x: 0.75, y: 0.35, w: 0.25, h: 0.3, swayAmountX: 0.012, swayAmountY: 0.01, swaySpeed: 0.3, phase: 6.0 },
      ]}
    />
  );
}
