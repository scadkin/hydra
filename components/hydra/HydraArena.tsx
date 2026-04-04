"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * Arena — dark purple glowing hydra. Crimson red, high contrast.
 */
export default function HydraArena() {
  return (
    <AsciiRenderer
      src="/hydra-variant-1.jpg"
      color="#ee5555"
      bgMode="dark"
      threshold={110}
      opacity={0.6}
      contrast={2.2}
      brightness={1.6}
      headRegions={[
        { x: 0.0, y: 0.0, w: 0.25, h: 0.5, swayAmountX: 0.07, swayAmountY: 0.05, swaySpeed: 0.55, phase: 0 },
        { x: 0.18, y: 0.0, w: 0.22, h: 0.45, swayAmountX: 0.05, swayAmountY: 0.055, swaySpeed: 0.45, phase: 1.3 },
        { x: 0.35, y: 0.0, w: 0.3, h: 0.45, swayAmountX: 0.03, swayAmountY: 0.04, swaySpeed: 0.38, phase: 2.6 },
        { x: 0.6, y: 0.0, w: 0.22, h: 0.45, swayAmountX: 0.05, swayAmountY: 0.055, swaySpeed: 0.5, phase: 3.9 },
        { x: 0.77, y: 0.0, w: 0.23, h: 0.5, swayAmountX: 0.07, swayAmountY: 0.05, swaySpeed: 0.53, phase: 5.2 },
      ]}
    />
  );
}
