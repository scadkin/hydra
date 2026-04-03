"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * HydraScene.tsx — v4: Canvas-drawn dragon → ASCII conversion
 *
 * COMPLETELY NEW APPROACH. Instead of Three.js primitives that look like
 * play-doh, we DRAW a detailed dragon silhouette on a hidden canvas using
 * bezier curves (like actual illustration), then sample the brightness
 * of each region and convert to ASCII characters.
 *
 * This gives pixel-level control over the shape — resulting in a dragon
 * that actually looks like a dragon, not a blob of geometric shapes.
 *
 * Each of the 7 heads is drawn with:
 * - Serpentine neck (thick bezier curve)
 * - Angular dragon skull with elongated snout
 * - Horns sweeping backward
 * - Open jaw with visible teeth
 * - Glowing eye
 *
 * The necks intertwine by weaving in front of and behind each other.
 * Animation: sine-wave sway with unique phase per head.
 */

const CHAR_W = 6;
const CHAR_H = 10;
const CHARS = " .,:;+*?%S#@$";

export default function HydraScene() {
  const preRef = useRef<HTMLPreElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  const draw = useCallback(() => {
    const pre = preRef.current;
    if (!pre) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = Math.floor(W / CHAR_W);
    const rows = Math.floor(H / CHAR_H);

    // Create or resize hidden canvas
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext("2d")!;

    const t = frameRef.current * 0.02;
    frameRef.current++;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cols, rows);

    // Center of the creature
    const cx = cols / 2;
    const bodyY = rows * 0.85;

    // ─── Draw the body (coiled mass at the bottom) ───
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.ellipse(cx, bodyY, cols * 0.15, rows * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body texture — overlapping scales
    ctx.fillStyle = "#555";
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(
        cx + Math.cos(a) * cols * 0.1,
        bodyY + Math.sin(a) * rows * 0.03,
        cols * 0.04,
        rows * 0.025,
        a,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // ─── Draw 7 necks + heads ───
    const headConfigs = [
      { angle: -0.85, len: 0.55, phase: 0 },
      { angle: -0.55, len: 0.62, phase: 1.0 },
      { angle: -0.25, len: 0.68, phase: 2.1 },
      { angle: 0.0, len: 0.72, phase: 3.0 },   // center — tallest
      { angle: 0.25, len: 0.68, phase: 4.2 },
      { angle: 0.55, len: 0.62, phase: 5.0 },
      { angle: 0.85, len: 0.55, phase: 6.1 },
    ];

    // Sort by z-order so some necks appear in front of others
    const sorted = headConfigs.map((h, i) => ({ ...h, i }));
    // Alternate front/back for intertwining effect
    sorted.sort((a, b) => (a.i % 2) - (b.i % 2));

    for (const head of sorted) {
      drawNeckAndHead(ctx, cx, bodyY, head, t, cols, rows);
    }

    // ─── Convert canvas to ASCII ───
    const imageData = ctx.getImageData(0, 0, cols, rows);
    const pixels = imageData.data;
    let ascii = "";

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = (y * cols + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];
        const brightness = (r + g + b) / 3;
        const charIdx = Math.floor((brightness / 255) * (CHARS.length - 1));
        ascii += CHARS[charIdx];
      }
      ascii += "\n";
    }

    pre.textContent = ascii;

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
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
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: `${CHAR_H}px`,
          lineHeight: `${CHAR_H}px`,
          letterSpacing: `${CHAR_W - 4}px`,
          color: "#c9a050",
          opacity: 0.55,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

/**
 * Draws a single neck + dragon head using bezier curves.
 * This is actual ILLUSTRATION, not geometric primitives.
 */
function drawNeckAndHead(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bodyY: number,
  config: { angle: number; len: number; phase: number; i: number },
  time: number,
  cols: number,
  rows: number
) {
  const { angle, len, phase, i } = config;

  // Neck endpoint (where the head will be)
  const neckLen = rows * len;
  const sway = Math.sin(time * 0.5 + phase) * cols * 0.04;
  const sway2 = Math.cos(time * 0.35 + phase * 1.3) * cols * 0.02;

  // Neck path — 4 control points for a natural S-curve
  const p0x = cx + angle * cols * 0.05; // base at body
  const p0y = bodyY;
  const p1x = cx + angle * cols * 0.12 + sway * 0.3; // first bend
  const p1y = bodyY - neckLen * 0.33;
  const p2x = cx + angle * cols * 0.22 + sway * 0.7 + sway2; // second bend (intertwine)
  const p2y = bodyY - neckLen * 0.66;
  const headX = cx + angle * cols * 0.28 + sway + sway2; // head position
  const headY = bodyY - neckLen;

  // ─── NECK — thick bezier stroke ───
  const neckWidth = Math.max(3, cols * 0.018);
  ctx.strokeStyle = "#777";
  ctx.lineWidth = neckWidth;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p0x, p0y);
  ctx.bezierCurveTo(p1x, p1y, p2x, p2y, headX, headY);
  ctx.stroke();

  // Neck spine ridge (thinner line on top of neck)
  ctx.strokeStyle = "#999";
  ctx.lineWidth = Math.max(1, neckWidth * 0.3);
  ctx.beginPath();
  ctx.moveTo(p0x, p0y - neckWidth * 0.4);
  ctx.bezierCurveTo(
    p1x, p1y - neckWidth * 0.4,
    p2x, p2y - neckWidth * 0.4,
    headX, headY - neckWidth * 0.4
  );
  ctx.stroke();

  // Vertebrae dots along the spine
  ctx.fillStyle = "#aaa";
  for (let s = 0; s < 12; s++) {
    const st = (s + 1) / 13;
    // Approximate point on bezier
    const bx = bezierPt(p0x, p1x, p2x, headX, st);
    const by = bezierPt(p0y, p1y, p2y, headY, st);
    const spineSize = (1 - st * 0.5) * Math.max(1, neckWidth * 0.2);
    ctx.beginPath();
    ctx.arc(bx, by - neckWidth * 0.5, spineSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── DRAGON HEAD ───
  const headAngle = Math.atan2(headY - p2y, headX - p2x); // direction neck is pointing
  const headTilt = Math.sin(time * 0.4 + phase * 2) * 0.15;

  ctx.save();
  ctx.translate(headX, headY);
  ctx.rotate(headAngle + headTilt + Math.PI); // face away from body

  const scale = Math.max(1, cols * 0.012);

  // Skull — elongated oval
  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.ellipse(0, 0, scale * 5, scale * 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout — tapered triangle extending forward
  ctx.fillStyle = "#777";
  ctx.beginPath();
  ctx.moveTo(scale * 4, -scale * 1.5);
  ctx.lineTo(scale * 10, -scale * 0.3);
  ctx.lineTo(scale * 10, scale * 0.3);
  ctx.lineTo(scale * 4, scale * 2.0);
  ctx.closePath();
  ctx.fill();

  // Brow ridge — angular, aggressive
  ctx.fillStyle = "#999";
  ctx.beginPath();
  ctx.moveTo(-scale * 2, -scale * 2.8);
  ctx.lineTo(scale * 3, -scale * 2.2);
  ctx.lineTo(scale * 5, -scale * 1.5);
  ctx.lineTo(-scale * 2, -scale * 2.0);
  ctx.closePath();
  ctx.fill();

  // Lower jaw — open, showing teeth gap
  ctx.fillStyle = "#666";
  ctx.beginPath();
  ctx.moveTo(scale * 3, scale * 1.8);
  ctx.lineTo(scale * 9, scale * 1.5 + Math.sin(time * 0.3 + phase) * scale * 0.5);
  ctx.lineTo(scale * 9, scale * 2.5 + Math.sin(time * 0.3 + phase) * scale * 0.5);
  ctx.lineTo(scale * 3, scale * 2.8);
  ctx.closePath();
  ctx.fill();

  // Teeth — jagged triangles along the jaw
  ctx.fillStyle = "#ddd";
  for (let tooth = 0; tooth < 5; tooth++) {
    const tx = scale * (4 + tooth * 1.2);
    const jawOpen = Math.sin(time * 0.3 + phase) * scale * 0.3;
    // Upper teeth (hanging down)
    ctx.beginPath();
    ctx.moveTo(tx, -scale * 0.2);
    ctx.lineTo(tx + scale * 0.3, scale * 0.8);
    ctx.lineTo(tx - scale * 0.3, scale * 0.8);
    ctx.closePath();
    ctx.fill();
    // Lower teeth (pointing up)
    ctx.beginPath();
    ctx.moveTo(tx, scale * 2.0 + jawOpen);
    ctx.lineTo(tx + scale * 0.25, scale * 1.2 + jawOpen);
    ctx.lineTo(tx - scale * 0.25, scale * 1.2 + jawOpen);
    ctx.closePath();
    ctx.fill();
  }

  // Horns — large, swept backward
  ctx.fillStyle = "#aaa";
  for (let side = -1; side <= 1; side += 2) {
    // Main horn
    ctx.beginPath();
    ctx.moveTo(-scale * 1, side * scale * 2.2);
    ctx.lineTo(-scale * 7, side * scale * 4.5);
    ctx.lineTo(-scale * 6, side * scale * 3.8);
    ctx.lineTo(-scale * 0.5, side * scale * 1.8);
    ctx.closePath();
    ctx.fill();

    // Secondary horn
    ctx.beginPath();
    ctx.moveTo(scale * 1, side * scale * 2.0);
    ctx.lineTo(-scale * 3, side * scale * 3.5);
    ctx.lineTo(-scale * 2.5, side * scale * 3.0);
    ctx.lineTo(scale * 1.2, side * scale * 1.6);
    ctx.closePath();
    ctx.fill();
  }

  // Eye — bright spot
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(scale * 2, -scale * 0.8, scale * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupil — slit
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(scale * 2, -scale * 0.8, scale * 0.15, scale * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Cubic bezier interpolation for a single dimension */
function bezierPt(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}
