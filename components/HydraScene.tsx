"use client";

import AsciiRenderer from "./hydra/AsciiRenderer";

/**
 * HydraScene.tsx — Main page hydra.
 * Uses the original hydra painting. More dramatic head movement.
 */
export default function HydraScene() {
  return (
    <AsciiRenderer
      src="/hydra-source.webp"
      color="#c9a050"
      bgMode="dark"
      threshold={75}
      opacity={0.6}
      contrast={1.6}
      headRegions={[
        { x: 0.02, y: 0.0, w: 0.25, h: 0.4, swayAmountX: 0.04, swayAmountY: 0.03, swaySpeed: 0.5, phase: 0 },
        { x: 0.22, y: 0.0, w: 0.2, h: 0.35, swayAmountX: 0.03, swayAmountY: 0.035, swaySpeed: 0.45, phase: 1.2 },
        { x: 0.35, y: 0.0, w: 0.28, h: 0.4, swayAmountX: 0.02, swayAmountY: 0.025, swaySpeed: 0.35, phase: 2.4 },
        { x: 0.55, y: 0.0, w: 0.2, h: 0.35, swayAmountX: 0.03, swayAmountY: 0.035, swaySpeed: 0.48, phase: 3.6 },
        { x: 0.72, y: 0.0, w: 0.26, h: 0.4, swayAmountX: 0.04, swayAmountY: 0.03, swaySpeed: 0.52, phase: 4.8 },
      ]}
    />
  );
}
