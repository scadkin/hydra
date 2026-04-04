"use client";

import { useEffect, useRef } from "react";

/**
 * HydraScene.tsx — v7: REAL DRAGON ART → Animated ASCII
 *
 * COMPLETELY NEW APPROACH: Instead of trying to draw a dragon with code,
 * we load an ACTUAL high-quality hydra illustration and convert it to
 * ASCII characters in real-time. This is the Ghostty approach — start
 * with real art, ASCII is just the rendering style.
 *
 * The source image is a detailed multi-headed hydra painting.
 * We load it, draw it to a full-res canvas, apply subtle animation
 * (breathing, shimmer), and convert to ASCII by sampling pixel brightness.
 *
 * Animation effects:
 * - Slow subtle breathing (gentle scale pulse)
 * - Brightness shimmer wave flowing through the creature
 * - Very slow drift/sway
 */

const CELL_W = 5;
const CELL_H = 8;
// Dense character ramp for smooth gradients
const CHARS = "  ..,,::;;!!++**??%%SS##@@";

export default function HydraScene() {
  const preRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const loadedRef = useRef(false);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    // Load the hydra source image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/hydra-source.webp";
    img.onload = () => {
      imgRef.current = img;
      loadedRef.current = true;
    };
    imgRef.current = img;

    // Create hidden canvas
    canvasRef.current = document.createElement("canvas");

    // Start render loop
    function render() {
      const pre = preRef.current;
      const canvas = canvasRef.current;
      const img = imgRef.current;

      if (!pre || !canvas || !img || !loadedRef.current) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const W = window.innerWidth;
      const H = window.innerHeight;
      const cols = Math.floor(W / CELL_W);
      const rows = Math.floor(H / CELL_H);

      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      const t = frameRef.current * 0.012;
      frameRef.current++;

      // Clear to black
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);

      // ─── Draw the hydra image with animation ───
      ctx.save();

      // Center the image
      const imgAspect = img.width / img.height;
      const screenAspect = W / H;

      let drawW: number, drawH: number;
      if (imgAspect > screenAspect) {
        // Image is wider than screen — fit to width
        drawW = W * 1.1;
        drawH = drawW / imgAspect;
      } else {
        // Image is taller — fit to height
        drawH = H * 1.0;
        drawW = drawH * imgAspect;
      }

      // Center position
      const drawX = (W - drawW) / 2;
      const drawY = (H - drawH) / 2 + H * 0.05; // slightly lower

      // Animation: subtle breathing (scale pulse)
      const breathe = 1.0 + Math.sin(t * 0.3) * 0.008;
      const swayX = Math.sin(t * 0.15) * W * 0.005;
      const swayY = Math.cos(t * 0.12) * H * 0.003;

      ctx.translate(W / 2 + swayX, H / 2 + swayY);
      ctx.scale(breathe, breathe);
      ctx.translate(-W / 2, -H / 2);

      // Draw the actual hydra image
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      ctx.restore();

      // ─── Convert to ASCII ───
      const imgData = ctx.getImageData(0, 0, W, H);
      const px = imgData.data;

      let ascii = "";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Average brightness of the pixel block
          let totalBright = 0;
          let count = 0;
          const startX = col * CELL_W;
          const startY = row * CELL_H;

          for (let py = startY; py < Math.min(startY + CELL_H, H); py++) {
            for (let px2 = startX; px2 < Math.min(startX + CELL_W, W); px2++) {
              const i = (py * W + px2) * 4;
              // Weighted brightness (human perception)
              const bright = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
              totalBright += bright;
              count++;
            }
          }

          const avgBright = totalBright / count;

          // Add shimmer wave — subtle brightness modulation flowing through
          const shimmer = Math.sin(t * 0.5 + row * 0.04 + col * 0.02) * 8;
          const finalBright = Math.max(0, Math.min(255, avgBright + shimmer));

          const charIdx = Math.floor((finalBright / 255) * (CHARS.length - 1));
          ascii += CHARS[charIdx];
        }
        ascii += "\n";
      }

      pre.textContent = ascii;
      animRef.current = requestAnimationFrame(render);
    }

    animRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <pre
        ref={preRef}
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
          fontSize: `${CELL_H}px`,
          lineHeight: `${CELL_H}px`,
          letterSpacing: `${CELL_W - 3.5}px`,
          color: "#c9a050",
          opacity: 0.5,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
