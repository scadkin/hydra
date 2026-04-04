"use client";

import AsciiRenderer from "./hydra/AsciiRenderer";

/**
 * HydraScene.tsx — Default hydra for the main page.
 * Uses the original hydra painting (hydra-source.webp).
 * Heads sway independently.
 */
export default function HydraScene() {
  return (
    <AsciiRenderer
      src="/hydra-source.webp"
      color="#c9a050"
      bgMode="dark"
      threshold={80}
      opacity={0.5}
      contrast={1.4}
      headRegions={[
        // Top-left head
        { x: 0.05, y: 0.0, w: 0.25, h: 0.35, swayAmountX: 0.015, swayAmountY: 0.012, swaySpeed: 0.4, phase: 0 },
        // Top-center-left head
        { x: 0.25, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.01, swayAmountY: 0.015, swaySpeed: 0.35, phase: 1.2 },
        // Top-center head (tallest)
        { x: 0.38, y: 0.0, w: 0.24, h: 0.35, swayAmountX: 0.008, swayAmountY: 0.01, swaySpeed: 0.3, phase: 2.4 },
        // Top-center-right head
        { x: 0.55, y: 0.0, w: 0.2, h: 0.3, swayAmountX: 0.01, swayAmountY: 0.015, swaySpeed: 0.38, phase: 3.6 },
        // Top-right head
        { x: 0.7, y: 0.0, w: 0.25, h: 0.35, swayAmountX: 0.015, swayAmountY: 0.012, swaySpeed: 0.42, phase: 4.8 },
      ]}
    />
  );
}
