"use client";

import { useEffect, useRef } from "react";

/**
 * HydraAscii.tsx
 *
 * Animated ASCII art of a multi-headed Hydra dragon.
 * 7 serpentine dragon heads with horns, fangs, and scales.
 * Rendered on <canvas> with a flowing color wave animation
 * that makes the creature appear to breathe and sway.
 *
 * Inspired by Ghostty's homepage ASCII ghost effect.
 */

const HYDRA_ART = `\

                  ,/|                                                                      |\\,
                ,/ /##\\                            /|\\                             /##\\ \\,
               / /#####\\          ,/|             / | \\            |\\,            /#####\\ \\
              | |#######|        / /##\\           /  |  \\          /##\\ \\         |#######| |
              | |##@>##/        | |####|         /   |   \\        |####| |         \\##<@##| |
               \\ \\####/    ,/|  | |#@>>/        /    |    \\       \\<<@#| |  |\\,     \\####/ /
                \\ \\##/    / /##\\ \\ \\##/        /     |     \\       \\##/ / /##\\ \\     \\##/ /
                 \\ \\/    | |####\\ \\ \\/   ,/|  / ,/|  |  |\\, \\  |\\,  \\/ / /####| |     \\/ /
                  | |    | |#@>>/  | |  / /#|/ / /## \\|/ ##\\ \\ \\|#\\ \\  | |\\<<@#| |     | |
                  | |     \\ \\##/   | | | |##/ | |####||####| | \\##| | |  \\##/ /      | |
                  | |      \\ \\/    | | | |#@> | |#@>>||<<@#| | <@#| | |   \\/ /       | |
                  | |       | |    | |  \\ \\#/  \\ \\##/  \\##/ /  \\#/ /  |    | |        | |
                   \\ \\      | |     \\ \\  \\ \\/    \\  \\  /  /    \\/ /  / /    | |       / /
                    \\ \\     | |      \\ \\  | |     \\  \\/  /     | |  / /     | |      / /
                     \\ \\    | |       \\ \\ | |      \\    /      | | / /      | |     / /
                      \\ \\    \\ \\       \\ \\| |       \\  /       | |/ /       / /    / /
                       \\ \\    \\ \\       \\\\| |        \\/        | |//       / /    / /
                        \\ \\    \\ \\       \\  |        /\\        |  /       / /    / /
                         \\ \\    \\ \\       \\ |       /  \\       | /       / /    / /
                          \\ \\    \\ \\       \\|      /    \\      |/       / /    / /
                           \\ \\    \\ \\       |     / \\  / \\     |       / /    / /
                            \\ \\    \\ \\      |    / ,\\\\// ,\\    |      / /    / /
                             \\ \\    \\ \\     |   / /  \\/  \\ \\   |     / /    / /
                              \\ \\    \\_\\    |  / /   /\\   \\ \\  |    /_/    / /
                               \\ \\         _| / /   /  \\   \\ \\ |_         / /
                                \\ \\       / |/ /   / /\\ \\   \\ \\| \\       / /
                                 \\_\\     /  | /   / /  \\ \\   \\ |  \\     /_/
                                        /   |/   / /    \\ \\   \\|   \\
                                       /    |   / /      \\ \\   |    \\
                                      /     |  / / ~~~~~~ \\ \\  |     \\
                                     /      | / / ~~~~~~~~ \\ \\ |      \\
                                    /       |/ / ~~~~~~~~~~ \\ \\|       \\
                                   /________|/ /~~~~~~~~~~~~\\ \\|________\\
                                        |     /~~~~~~~~~~~~~~\\     |
                                        |    /~~~~~~~~~~~~~~~~\\    |
                                        |   / ~~ ~~~~~~~~ ~~~ \\   |
                                        |  /~~~~~~~~~~~~~~~~~~~~\\  |
                                        | /  ~~~~ ~~~~~~~~ ~~~~  \\ |
                                        |/ ~~~~~~~~~~~~~~~~~~~~~~ \\|
                                        |~~~~~~~~~~~~~~~~~~~~~~~~~ |
                                        \\_________________________/
`;

export default function HydraAscii() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lines = HYDRA_ART.split("\n");
    const maxWidth = Math.max(...lines.map((l) => l.length));

    const charW = 7;
    const charH = 13;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = maxWidth * charW * dpr;
    canvas.height = lines.length * charH * dpr;
    canvas.style.width = `${maxWidth * charW}px`;
    canvas.style.height = `${lines.length * charH}px`;
    ctx.scale(dpr, dpr);

    /* Build character array with position data */
    interface CharInfo { char: string; x: number; y: number; row: number; col: number; }
    const chars: CharInfo[] = [];
    lines.forEach((line, row) => {
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch && ch !== " ") {
          chars.push({ char: ch, x: col * charW, y: row * charH, row, col });
        }
      }
    });

    /* Color palette — warm amber/gold with depth */
    const palette = [
      [212, 165, 116],  // amber
      [196, 149, 106],  // darker amber
      [180, 140, 100],  // bronze
      [160, 130, 90],   // deep bronze
    ];

    let frame = 0;
    let animId: number;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width / dpr, canvas!.height / dpr);
      ctx!.font = "10px 'Geist Mono', 'SF Mono', monospace";
      ctx!.textBaseline = "top";

      const time = frame * 0.015;

      chars.forEach(({ char, x, y, row, col }) => {
        /* Multiple overlapping waves for organic movement */
        const wave1 = Math.sin(time + row * 0.06 + col * 0.03);
        const wave2 = Math.sin(time * 0.7 + row * 0.04 - col * 0.02);
        const combined = (wave1 + wave2) / 2; // -1 to 1

        /* Map to opacity (0.08 to 0.45) — the creature breathes */
        const opacity = 0.08 + ((combined + 1) / 2) * 0.37;

        /* Pick color from palette based on a slower wave */
        const colorWave = Math.sin(time * 0.5 + row * 0.03 + col * 0.015);
        const ci = Math.floor(((colorWave + 1) / 2) * (palette.length - 0.01));
        const [r, g, b] = palette[ci];

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx!.fillText(char, x, y);
      });

      frame++;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-start justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="mt-4"
        style={{ maxWidth: "95vw", opacity: 1 }}
      />
      {/* Bottom fade so hydra doesn't clash with content below */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%]"
        style={{ background: "linear-gradient(to top, #0c0c0c 0%, transparent 100%)" }}
      />
    </div>
  );
}
