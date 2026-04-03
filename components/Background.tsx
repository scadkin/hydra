"use client";

import { motion } from "motion/react";

/**
 * Background.tsx
 * ASCII art Hydra — the mythological multi-headed serpent.
 * Multiple heads = multiple AI models. Thematic and distinctive.
 * Fades in subtly behind the hero content.
 */

const HYDRA_ASCII = `
                                          ___
                                        /   \\
                              ___      / o o \\      ___
                            /   \\    |  \\_/  |    /   \\
                           / o o \\    \\     /    / o o \\
                          |  \\_/  |    |   |    |  \\_/  |
                           \\     /     |   |     \\     /
                     ___    |   |      |   |      |   |    ___
                   /   \\   |   |      |   |      |   |   /   \\
                  / o o \\  |   |     /     \\     |   |  / o o \\
                 |  \\_/  |  \\   \\   /       \\   /   /  |  \\_/  |
                  \\     /    \\   \\_/         \\_/   /    \\     /
                   |   |      \\                   /      |   |
                   |   |       \\                 /       |   |
                   |   |        \\               /        |   |
                    \\   \\        |             |        /   /
                     \\   \\       |             |       /   /
                      \\   \\      |             |      /   /
                       \\   \\     |             |     /   /
                        \\   \\____|             |____/   /
                         \\                             /
                          \\___________________________/
                                    |     |
                                    |     |
                                    |     |
                                   /       \\
                                  /  ~~~~~  \\
                                 /  ~~~~~~~  \\
                                /_____________\\
`;

export default function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Warm gradient atmosphere — subtle but present */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(212,165,116,0.06) 0%, transparent 70%)",
        }}
      />

      {/* ASCII Hydra — centered behind the hero */}
      <motion.pre
        className="absolute top-[2%] left-1/2 -translate-x-1/2 font-mono text-[10px] sm:text-[11px] md:text-[12px] leading-[1.2] text-[#1a1a1a] select-none whitespace-pre"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        aria-hidden="true"
      >
        {HYDRA_ASCII}
      </motion.pre>

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
