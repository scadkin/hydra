"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * AsciiPlayer v3 — Pre-rendered canvas crossfade.
 *
 * Each ASCII frame is rendered ONCE onto an offscreen canvas at load time.
 * The animation loop then just crossfades between two pre-rendered images
 * using globalAlpha — only 2 drawImage calls per display frame instead of
 * 100,000 fillText calls. Buttery smooth.
 */

interface Props {
  src: string;
  color?: string;
  opacity?: number;
  frameDuration?: number; // ms per source frame (higher = slower)
  cellSize?: number;
}

export default function AsciiPlayer({
  src,
  color = "#dbb060",
  opacity = 0.55,
  frameDuration = 800,
  cellSize = 5,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement[]>([]);
  const frameCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  // Load frames, parse, and pre-render each to an offscreen canvas
  useEffect(() => {
    let cancelled = false;

    fetch(src)
      .then((res) => res.json())
      .then((data: string[]) => {
        if (cancelled) return;

        const CHARS = " .:-;+*?%S#@$";
        const charBright = new Map<string, number>();
        for (let i = 0; i < CHARS.length; i++) {
          charBright.set(CHARS[i], i / (CHARS.length - 1));
        }

        // Determine grid dimensions from first frame
        const firstLines = data[0].split("\n").filter((l) => l.length > 0);
        const cols = firstLines[0]?.length ?? 100;
        const rows = firstLines.length;

        // Compute font size to fill viewport
        const W = window.innerWidth;
        const H = window.innerHeight;
        const fontSize = Math.max(cellSize, Math.min(W / (cols * 0.6), H / rows));
        const charW = fontSize * 0.62;
        const canvasW = Math.ceil(cols * charW);
        const canvasH = Math.ceil(rows * fontSize);

        // Pre-render each frame onto its own offscreen canvas
        const offscreens: HTMLCanvasElement[] = [];
        const dpr = window.devicePixelRatio || 1;

        for (let f = 0; f < data.length; f++) {
          const oc = document.createElement("canvas");
          oc.width = Math.ceil(canvasW * dpr);
          oc.height = Math.ceil(canvasH * dpr);
          const ctx = oc.getContext("2d")!;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          ctx.font = `${fontSize}px 'Geist Mono','SF Mono','Fira Code',monospace`;
          ctx.textBaseline = "top";
          ctx.fillStyle = color;

          const lines = data[f].split("\n");
          for (let row = 0; row < rows; row++) {
            const line = lines[row] ?? "";
            for (let col = 0; col < cols; col++) {
              const ch = line[col] ?? " ";
              const bright = charBright.get(ch) ?? 0;
              if (bright < 0.02) continue;
              ctx.globalAlpha = bright;
              ctx.fillText(ch, col * charW, row * fontSize);
            }
          }

          offscreens.push(oc);
        }

        offscreenRef.current = offscreens;
        frameCountRef.current = offscreens.length;

        // Size the display canvas
        const display = canvasRef.current;
        if (display) {
          display.width = Math.ceil(canvasW * dpr);
          display.height = Math.ceil(canvasH * dpr);
          display.style.width = `${canvasW}px`;
          display.style.height = `${canvasH}px`;
        }

        setReady(true);
        console.log(`[AsciiPlayer] ${offscreens.length} frames pre-rendered at ${cols}x${rows}, font ${fontSize.toFixed(1)}px`);
      })
      .catch((err) => console.warn("Failed to load ASCII frames:", err));

    return () => { cancelled = true; };
  }, [src, color, cellSize]);

  // Animation loop — just crossfade between two pre-rendered canvases
  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const offscreens = offscreenRef.current;
    const count = frameCountRef.current;
    if (!canvas || count === 0) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    if (startTimeRef.current === 0) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    const ctx = canvas.getContext("2d");
    if (!ctx) { rafRef.current = requestAnimationFrame(animate); return; }

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;

    // Which two frames to blend?
    const totalDuration = count * frameDuration;
    const pos = (elapsed % totalDuration) / frameDuration;
    const idxA = Math.floor(pos) % count;
    const idxB = (idxA + 1) % count;
    const blend = pos - Math.floor(pos); // 0→1

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Draw frame A at (1 - blend) opacity
    ctx.globalAlpha = opacity * (1 - blend);
    ctx.drawImage(offscreens[idxA], 0, 0, W, H);

    // Draw frame B at blend opacity
    ctx.globalAlpha = opacity * blend;
    ctx.drawImage(offscreens[idxB], 0, 0, W, H);

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(animate);
  }, [opacity, frameDuration]);

  useEffect(() => {
    if (!ready) return;
    startTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, animate]);

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
      <canvas ref={canvasRef} />
    </div>
  );
}
