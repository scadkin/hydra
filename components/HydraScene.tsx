"use client";

import AsciiRenderer from "./hydra/AsciiRenderer";

/**
 * Main page hydra. High visibility, warm gold.
 */
export default function HydraScene() {
  return (
    <AsciiRenderer
      src="/hydra-source.webp"
      color="#dbb060"
      bgMode="dark"
      threshold={95}
      opacity={0.65}
      contrast={2.0}
      brightness={1.4}
      headRegions={[
        { x: 0.02, y: 0.0, w: 0.28, h: 0.4, swayAmountX: 0.06, swayAmountY: 0.04, swaySpeed: 0.5, phase: 0 },
        { x: 0.22, y: 0.0, w: 0.22, h: 0.35, swayAmountX: 0.045, swayAmountY: 0.05, swaySpeed: 0.42, phase: 1.2 },
        { x: 0.38, y: 0.0, w: 0.24, h: 0.4, swayAmountX: 0.03, swayAmountY: 0.035, swaySpeed: 0.35, phase: 2.4 },
        { x: 0.55, y: 0.0, w: 0.22, h: 0.35, swayAmountX: 0.045, swayAmountY: 0.05, swaySpeed: 0.45, phase: 3.6 },
        { x: 0.7, y: 0.0, w: 0.28, h: 0.4, swayAmountX: 0.06, swayAmountY: 0.04, swaySpeed: 0.48, phase: 4.8 },
      ]}
    />
  );
}
