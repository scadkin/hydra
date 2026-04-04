"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * HydraArena — Dark purple glowing hydra, crimson.
 * Lower threshold to show MORE of the creature. Aggressive movement.
 */
export default function HydraArena() {
  return (
    <AsciiRenderer
      src="/hydra-variant-1.jpg"
      color="#cc4444"
      bgMode="dark"
      threshold={50}
      opacity={0.55}
      contrast={1.8}
      headRegions={[
        { x: 0.0, y: 0.0, w: 0.25, h: 0.5, swayAmountX: 0.05, swayAmountY: 0.04, swaySpeed: 0.55, phase: 0 },
        { x: 0.18, y: 0.0, w: 0.22, h: 0.45, swayAmountX: 0.035, swayAmountY: 0.04, swaySpeed: 0.45, phase: 1.3 },
        { x: 0.32, y: 0.0, w: 0.35, h: 0.45, swayAmountX: 0.02, swayAmountY: 0.03, swaySpeed: 0.38, phase: 2.6 },
        { x: 0.6, y: 0.0, w: 0.22, h: 0.45, swayAmountX: 0.035, swayAmountY: 0.04, swaySpeed: 0.5, phase: 3.9 },
        { x: 0.77, y: 0.0, w: 0.23, h: 0.5, swayAmountX: 0.05, swayAmountY: 0.04, swaySpeed: 0.53, phase: 5.2 },
      ]}
    />
  );
}
