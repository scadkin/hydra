"use client";

import AsciiRenderer from "./AsciiRenderer";

/**
 * Nexus — stipple art hydra, inverted to bright cyan. High detail.
 */
export default function HydraNexus() {
  return (
    <AsciiRenderer
      src="/hydra-stipple.gif"
      color="#22ffff"
      bgMode="light"
      threshold={190}
      opacity={0.5}
      contrast={2.0}
      brightness={1.3}
      cellW={4}
      cellH={7}
      headRegions={[
        { x: 0.0, y: 0.05, w: 0.2, h: 0.35, swayAmountX: 0.06, swayAmountY: 0.04, swaySpeed: 0.65, phase: 0 },
        { x: 0.1, y: 0.0, w: 0.18, h: 0.3, swayAmountX: 0.05, swayAmountY: 0.045, swaySpeed: 0.55, phase: 0.8 },
        { x: 0.25, y: 0.0, w: 0.16, h: 0.28, swayAmountX: 0.04, swayAmountY: 0.05, swaySpeed: 0.5, phase: 1.6 },
        { x: 0.38, y: 0.0, w: 0.22, h: 0.3, swayAmountX: 0.025, swayAmountY: 0.035, swaySpeed: 0.45, phase: 2.4 },
        { x: 0.55, y: 0.0, w: 0.16, h: 0.28, swayAmountX: 0.04, swayAmountY: 0.05, swaySpeed: 0.5, phase: 3.2 },
        { x: 0.65, y: 0.0, w: 0.18, h: 0.3, swayAmountX: 0.05, swayAmountY: 0.045, swaySpeed: 0.55, phase: 4.0 },
        { x: 0.78, y: 0.05, w: 0.22, h: 0.35, swayAmountX: 0.06, swayAmountY: 0.04, swaySpeed: 0.65, phase: 4.8 },
      ]}
    />
  );
}
