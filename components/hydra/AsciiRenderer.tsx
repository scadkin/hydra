"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * AsciiRenderer — Converts source images to animated ASCII art.
 *
 * v2: Instead of moving rectangular image chunks (which creates seams),
 * we apply WAVE DISTORTION to the ASCII sampling grid. The distortion
 * is stronger in the "head" areas, creating organic movement without
 * cutting the image into pieces.
 *
 * Think of it like looking at the creature through rippling water —
 * the heads appear to sway because the sampling coordinates shift.
 */

interface HeadRegion {
  x: number; y: number; w: number; h: number;
  swayAmountX: number; swayAmountY: number;
  swaySpeed: number; phase: number;
}

interface Props {
  src: string;
  color?: string;
  bgMode?: "dark" | "light";
  threshold?: number;
  opacity?: number;
  contrast?: number;
  brightness?: number;
  headRegions?: HeadRegion[];
  cellW?: number;
  cellH?: number;
}

const CHARS = " .,:;+*?%S#@$";

export default function AsciiRenderer({
  src,
  color = "#c9a050",
  bgMode = "dark",
  threshold = 85,
  opacity = 0.55,
  contrast = 1.3,
  brightness = 1.0,
  headRegions = [],
  cellW = 5,
  cellH = 8,
}: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const processedRef = useRef<HTMLCanvasElement | null>(null);
  const readyRef = useRef(false);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  const renderFrame = useCallback(() => {
    const pre = preRef.current;
    if (!pre || !readyRef.current || !processedRef.current) {
      animRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = Math.floor(W / cellW);
    const rows = Math.floor(H / cellH);
    const processed = processedRef.current;

    // Render the processed image to a temp canvas at screen resolution
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const cv = canvasRef.current;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Draw processed image scaled to fill screen
    const imgAspect = processed.width / processed.height;
    let drawW: number, drawH: number;
    drawH = H * 0.98;
    drawW = drawH * imgAspect;
    if (drawW < W * 0.85) { drawW = W * 0.85; drawH = drawW / imgAspect; }
    const baseX = (W - drawW) / 2;
    const baseY = (H - drawH) / 2;

    // Subtle breathing on the whole image
    const t = frameRef.current * 0.014;
    frameRef.current++;
    const breathe = 1.0 + Math.sin(t * 0.3) * 0.005;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(breathe, breathe);
    ctx.translate(-W / 2, -H / 2);
    ctx.drawImage(processed, baseX, baseY, drawW, drawH);
    ctx.restore();

    // Read pixels
    const imgData = ctx.getImageData(0, 0, W, H);
    const px = imgData.data;

    // ─── Convert to ASCII (static, no distortion) ───
    let ascii = "";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const sampleX = col * cellW;
        const sampleY = row * cellH;

        // Average brightness of the cell
        let totalBright = 0;
        let count = 0;

        for (let py = sampleY; py < Math.min(sampleY + cellH, H); py++) {
          for (let px2 = sampleX; px2 < Math.min(sampleX + cellW, W); px2++) {
            if (px2 >= 0 && px2 < W && py >= 0 && py < H) {
              const i = (py * W + px2) * 4;
              if (px[i + 3] > 10) {
                totalBright += px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
                count++;
              }
            }
          }
        }

        if (count === 0) {
          ascii += " ";
        } else {
          let avg = (totalBright / count) * brightness;
          // Shimmer
          avg += Math.sin(t * 0.6 + row * 0.05 + col * 0.03) * 8;
          avg = Math.max(0, Math.min(255, avg));
          const ci = Math.floor((avg / 255) * (CHARS.length - 1));
          ascii += CHARS[ci];
        }
      }
      ascii += "\n";
    }

    pre.textContent = ascii;
    animRef.current = requestAnimationFrame(renderFrame);
  }, [cellW, cellH, headRegions, brightness]);

  useEffect(() => {
    const processed = document.createElement("canvas");
    processedRef.current = processed;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      processed.width = img.width;
      processed.height = img.height;
      const pCtx = processed.getContext("2d", { willReadFrequently: true })!;
      pCtx.drawImage(img, 0, 0);

      const imgData = pCtx.getImageData(0, 0, img.width, img.height);
      const px = imgData.data;

      for (let i = 0; i < px.length; i += 4) {
        const bright = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;

        if (bgMode === "dark") {
          if (bright > threshold) {
            px[i + 3] = 0;
          } else {
            px[i] = Math.min(255, px[i] * contrast);
            px[i + 1] = Math.min(255, px[i + 1] * contrast);
            px[i + 2] = Math.min(255, px[i + 2] * contrast);
          }
        } else {
          // Light mode: invert dark pixels, remove light background
          if (bright > threshold) {
            px[i + 3] = 0;
          } else {
            px[i] = Math.min(255, (255 - px[i]) * contrast);
            px[i + 1] = Math.min(255, (255 - px[i + 1]) * contrast);
            px[i + 2] = Math.min(255, (255 - px[i + 2]) * contrast);
          }
        }
      }

      pCtx.putImageData(imgData, 0, 0);
      readyRef.current = true;
    };

    animRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [src, bgMode, threshold, contrast, renderFrame]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <pre
        ref={preRef}
        style={{
          margin: 0, padding: 0,
          fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
          fontSize: `${cellH}px`,
          lineHeight: `${cellH}px`,
          letterSpacing: `${cellW - 3.5}px`,
          color,
          opacity,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
