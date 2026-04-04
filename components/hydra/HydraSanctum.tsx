"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * HydraSanctum — Bronze 7-headed hydra, gold.
 * Cleaner separation, higher contrast. Regal, deliberate movement.
 */
export default function HydraSanctum() {
  return (
    <AsciiRenderer
      src="/hydra-variant-2.webp"
      color="#dab655"
      bgMode="dark"
      threshold={80}
      opacity={0.5}
      contrast={1.5}
      headRegions={[
        { x: 0.0, y: 0.3, w: 0.22, h: 0.35, swayAmountX: 0.03, swayAmountY: 0.025, swaySpeed: 0.35, phase: 0 },
        { x: 0.08, y: 0.08, w: 0.2, h: 0.35, swayAmountX: 0.025, swayAmountY: 0.03, swaySpeed: 0.3, phase: 0.9 },
        { x: 0.22, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.02, swayAmountY: 0.035, swaySpeed: 0.32, phase: 1.8 },
        { x: 0.38, y: 0.0, w: 0.24, h: 0.3, swayAmountX: 0.015, swayAmountY: 0.025, swaySpeed: 0.28, phase: 2.7 },
        { x: 0.55, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.02, swayAmountY: 0.035, swaySpeed: 0.32, phase: 3.6 },
        { x: 0.7, y: 0.08, w: 0.2, h: 0.35, swayAmountX: 0.025, swayAmountY: 0.03, swaySpeed: 0.3, phase: 4.5 },
        { x: 0.78, y: 0.3, w: 0.22, h: 0.35, swayAmountX: 0.03, swayAmountY: 0.025, swaySpeed: 0.35, phase: 5.4 },
      ]}
    />
  );
}
