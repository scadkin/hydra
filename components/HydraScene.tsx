"use client";

import { useEffect, useRef } from "react";

/**
 * HydraScene.tsx — v8: Isolated hydra + dramatic animation
 *
 * Loads the hydra artwork, REMOVES the background by thresholding
 * out lighter pixels (the foggy/misty background), then renders
 * only the dragon creature as ASCII with dramatic animation:
 * - Slow oscillating rotation
 * - Breathing scale pulse
 * - Wave distortion flowing through the creature
 * - Brightness shimmer
 */

const CELL_W = 5;
const CELL_H = 8;
const CHARS = "  ..,,::;;!!++**??%%SS##@@$$";
// Brightness threshold — pixels brighter than this are "background"
const BG_THRESHOLD = 85;

export default function HydraScene() {
  const preRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const readyRef = useRef(false);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    // Load source image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/hydra-source.webp";

    // Create canvases
    const renderCanvas = document.createElement("canvas");
    const processedCanvas = document.createElement("canvas");
    canvasRef.current = renderCanvas;
    processedRef.current = processedCanvas;

    img.onload = () => {
      imgRef.current = img;

      // Pre-process: remove background from the source image
      // Draw the image at its natural size, then remove light pixels
      processedCanvas.width = img.width;
      processedCanvas.height = img.height;
      const pCtx = processedCanvas.getContext("2d", { willReadFrequently: true })!;

      pCtx.drawImage(img, 0, 0);
      const imgData = pCtx.getImageData(0, 0, img.width, img.height);
      const px = imgData.data;

      for (let i = 0; i < px.length; i += 4) {
        const brightness = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
        if (brightness > BG_THRESHOLD) {
          // Background — make transparent
          px[i + 3] = 0;
        } else {
          // Dragon — boost contrast to make it pop
          const boost = 1.4;
          px[i] = Math.min(255, px[i] * boost);
          px[i + 1] = Math.min(255, px[i + 1] * boost);
          px[i + 2] = Math.min(255, px[i + 2] * boost);
        }
      }

      pCtx.putImageData(imgData, 0, 0);
      readyRef.current = true;
    };

    // Render loop
    function render() {
      const pre = preRef.current;
      const canvas = canvasRef.current;
      const processed = processedRef.current;

      if (!pre || !canvas || !processed || !readyRef.current) {
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

      // ─── Calculate image dimensions to fill nicely ───
      const imgAspect = processed.width / processed.height;
      let drawW: number, drawH: number;

      // Make the creature LARGE — fill most of the screen
      drawH = H * 0.95;
      drawW = drawH * imgAspect;
      if (drawW < W * 0.7) {
        drawW = W * 0.7;
        drawH = drawW / imgAspect;
      }

      // ─── DRAMATIC ANIMATION ───
      ctx.save();
      ctx.translate(W / 2, H / 2);

      // Slow oscillating rotation (pendulum-like, ±8 degrees)
      const rotation = Math.sin(t * 0.2) * 0.14;
      ctx.rotate(rotation);

      // Breathing scale pulse (more dramatic than before)
      const breathe = 1.0 + Math.sin(t * 0.35) * 0.025;
      ctx.scale(breathe, breathe);

      // Gentle drift
      const driftX = Math.sin(t * 0.12) * W * 0.015;
      const driftY = Math.cos(t * 0.1) * H * 0.01;
      ctx.translate(driftX, driftY);

      // Draw the background-removed hydra
      ctx.drawImage(
        processed,
        -drawW / 2,
        -drawH / 2,
        drawW,
        drawH
      );

      ctx.restore();

      // ─── Convert to ASCII with wave distortion ───
      const imgData = ctx.getImageData(0, 0, W, H);
      const px = imgData.data;

      let ascii = "";
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Wave distortion — shift sample position slightly
          const waveX = Math.sin(t * 0.4 + row * 0.06) * 2;
          const waveY = Math.cos(t * 0.3 + col * 0.04) * 1.5;

          const sampleX = Math.floor(col * CELL_W + waveX);
          const sampleY = Math.floor(row * CELL_H + waveY);

          // Average brightness of the pixel block
          let totalBright = 0;
          let count = 0;

          for (let py = sampleY; py < Math.min(sampleY + CELL_H, H); py++) {
            for (let px2 = sampleX; px2 < Math.min(sampleX + CELL_W, W); px2++) {
              if (px2 >= 0 && px2 < W && py >= 0 && py < H) {
                const i = (py * W + px2) * 4;
                const alpha = px[i + 3];
                if (alpha > 0) {
                  const bright = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
                  totalBright += bright;
                  count++;
                }
              }
            }
          }

          if (count === 0) {
            // Transparent area — empty space
            ascii += " ";
          } else {
            const avgBright = totalBright / count;
            // Shimmer wave
            const shimmer = Math.sin(t * 0.6 + row * 0.05 + col * 0.03) * 12;
            const finalBright = Math.max(0, Math.min(255, avgBright + shimmer));
            const charIdx = Math.floor((finalBright / 255) * (CHARS.length - 1));
            ascii += CHARS[charIdx];
          }
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
          opacity: 0.6,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
