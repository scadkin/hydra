"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * AsciiRenderer — Shared engine for converting images to animated ASCII.
 *
 * Takes a source image, removes background, splits into head regions,
 * and animates each region independently (different sway per head).
 *
 * Props:
 * - src: path to the source image
 * - color: CSS color for the ASCII text
 * - bgMode: "dark" (remove light pixels) or "light" (remove dark pixels / invert)
 * - threshold: brightness cutoff for background removal (0-255)
 * - opacity: overall opacity of the ASCII layer
 * - headRegions: array of {x, y, w, h} normalized rects (0-1) defining where heads are
 *   Each region sways independently for the "living" animation effect
 */

interface HeadRegion {
  x: number; y: number; w: number; h: number;
  swayAmountX: number; swayAmountY: number; swaySpeed: number; phase: number;
}

interface Props {
  src: string;
  color?: string;
  bgMode?: "dark" | "light";
  threshold?: number;
  opacity?: number;
  contrast?: number;
  headRegions?: HeadRegion[];
  cellW?: number;
  cellH?: number;
}

const DEFAULT_CHARS = "  ..,,::;;!!++**??%%SS##@@$$";

export default function AsciiRenderer({
  src,
  color = "#c9a050",
  bgMode = "dark",
  threshold = 85,
  opacity = 0.55,
  contrast = 1.3,
  headRegions = [],
  cellW = 5,
  cellH = 8,
}: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const stateRef = useRef<{
    canvas: HTMLCanvasElement;
    processed: HTMLCanvasElement;
    img: HTMLImageElement | null;
    ready: boolean;
    frame: number;
    animId: number;
  }>({
    canvas: null!,
    processed: null!,
    img: null,
    ready: false,
    frame: 0,
    animId: 0,
  });

  const renderFrame = useCallback(() => {
    const pre = preRef.current;
    const s = stateRef.current;
    if (!pre || !s.ready) {
      s.animId = requestAnimationFrame(renderFrame);
      return;
    }

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = Math.floor(W / cellW);
    const rows = Math.floor(H / cellH);

    const cv = s.canvas;
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;

    const t = s.frame * 0.012;
    s.frame++;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Calculate draw dimensions — fill the screen
    const imgAspect = s.processed.width / s.processed.height;
    let drawW: number, drawH: number;
    drawH = H * 0.95;
    drawW = drawH * imgAspect;
    if (drawW < W * 0.8) { drawW = W * 0.8; drawH = drawW / imgAspect; }

    const baseX = (W - drawW) / 2;
    const baseY = (H - drawH) / 2;

    // ─── Draw the processed image with PER-REGION animation ───
    if (headRegions.length > 0) {
      // First draw the body (non-head areas) with subtle breathing
      const breathe = 1.0 + Math.sin(t * 0.3) * 0.006;
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.scale(breathe, breathe);
      ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(s.processed, baseX, baseY, drawW, drawH);
      ctx.restore();

      // Then overdraw each head region with independent movement
      for (const region of headRegions) {
        const rx = baseX + region.x * drawW;
        const ry = baseY + region.y * drawH;
        const rw = region.w * drawW;
        const rh = region.h * drawH;

        // Independent sway per head
        const swX = Math.sin(t * region.swaySpeed + region.phase) * region.swayAmountX * drawW;
        const swY = Math.cos(t * region.swaySpeed * 0.7 + region.phase) * region.swayAmountY * drawH;

        // Source region in the processed image
        const srcX = region.x * s.processed.width;
        const srcY = region.y * s.processed.height;
        const srcW = region.w * s.processed.width;
        const srcH = region.h * s.processed.height;

        // Clear the original position of this head region first
        ctx.fillStyle = "#000";
        ctx.fillRect(rx - 2, ry - 2, rw + 4, rh + 4);

        // Redraw with offset
        ctx.drawImage(
          s.processed,
          srcX, srcY, srcW, srcH,
          rx + swX, ry + swY, rw, rh
        );
      }
    } else {
      // No regions defined — just gentle breathing + wave
      const breathe = 1.0 + Math.sin(t * 0.3) * 0.008;
      const driftX = Math.sin(t * 0.12) * W * 0.005;
      const driftY = Math.cos(t * 0.1) * H * 0.004;
      ctx.save();
      ctx.translate(W / 2 + driftX, H / 2 + driftY);
      ctx.scale(breathe, breathe);
      ctx.translate(-W / 2, -H / 2);
      ctx.drawImage(s.processed, baseX, baseY, drawW, drawH);
      ctx.restore();
    }

    // ─── Convert to ASCII ───
    const imgData = ctx.getImageData(0, 0, W, H);
    const px = imgData.data;

    let ascii = "";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Slight wave distortion in sampling position
        const waveX = Math.sin(t * 0.35 + row * 0.05) * 1.5;
        const waveY = Math.cos(t * 0.28 + col * 0.04) * 1;

        let totalBright = 0;
        let count = 0;
        const startX = Math.floor(col * cellW + waveX);
        const startY = Math.floor(row * cellH + waveY);

        for (let py = startY; py < Math.min(startY + cellH, H); py++) {
          for (let px2 = startX; px2 < Math.min(startX + cellW, W); px2++) {
            if (px2 >= 0 && px2 < W && py >= 0 && py < H) {
              const i = (py * W + px2) * 4;
              const alpha = px[i + 3];
              if (alpha > 10) {
                totalBright += px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;
                count++;
              }
            }
          }
        }

        if (count === 0) {
          ascii += " ";
        } else {
          const avg = totalBright / count;
          const shimmer = Math.sin(t * 0.5 + row * 0.04 + col * 0.025) * 10;
          const final_ = Math.max(0, Math.min(255, avg + shimmer));
          const ci = Math.floor((final_ / 255) * (DEFAULT_CHARS.length - 1));
          ascii += DEFAULT_CHARS[ci];
        }
      }
      ascii += "\n";
    }

    pre.textContent = ascii;
    s.animId = requestAnimationFrame(renderFrame);
  }, [cellW, cellH, headRegions]);

  useEffect(() => {
    const s = stateRef.current;
    s.canvas = document.createElement("canvas");
    s.processed = document.createElement("canvas");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      s.img = img;

      // Pre-process: remove background
      s.processed.width = img.width;
      s.processed.height = img.height;
      const pCtx = s.processed.getContext("2d", { willReadFrequently: true })!;
      pCtx.drawImage(img, 0, 0);

      const imgData = pCtx.getImageData(0, 0, img.width, img.height);
      const px = imgData.data;

      for (let i = 0; i < px.length; i += 4) {
        const bright = px[i] * 0.299 + px[i + 1] * 0.587 + px[i + 2] * 0.114;

        if (bgMode === "dark") {
          // Remove light background pixels
          if (bright > threshold) {
            px[i + 3] = 0;
          } else {
            px[i] = Math.min(255, px[i] * contrast);
            px[i + 1] = Math.min(255, px[i + 1] * contrast);
            px[i + 2] = Math.min(255, px[i + 2] * contrast);
          }
        } else {
          // "light" mode: remove light pixels, INVERT the rest
          // Good for white-background images like the stipple art
          if (bright > threshold) {
            px[i + 3] = 0;
          } else {
            // Invert so dark dragon becomes light ASCII
            px[i] = Math.min(255, (255 - px[i]) * contrast);
            px[i + 1] = Math.min(255, (255 - px[i + 1]) * contrast);
            px[i + 2] = Math.min(255, (255 - px[i + 2]) * contrast);
          }
        }
      }

      pCtx.putImageData(imgData, 0, 0);
      s.ready = true;
    };

    s.animId = requestAnimationFrame(renderFrame);

    return () => cancelAnimationFrame(s.animId);
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
