"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * HydraScene.tsx — v6: HIGH-RES canvas → ASCII downsampling
 *
 * COMPLETELY NEW APPROACH:
 * 1. Draw the hydra at FULL SCREEN RESOLUTION (1440x900+ pixels)
 *    with real illustration quality — gradients, shadows, fine detail
 * 2. For each ASCII character cell (e.g. 6x10 pixel block),
 *    average the brightness of all pixels in that block
 * 3. Map that average to an ASCII character
 *
 * This means the source illustration has ~100x more detail than before.
 * The ASCII rendering captures actual dragon anatomy, not blobs.
 *
 * Dragon anatomy based on studying Drogon from Game of Thrones:
 * - Long crocodilian skull tapering to narrow snout
 * - Crown of swept-back horns in decreasing size
 * - Heavy brow ridge overhanging deep-set eyes
 * - Wide jaw opening with rows of teeth
 * - Thick muscular necks with dorsal spine ridge
 * - Necks coil and twist around each other
 */

const CELL_W = 6;
const CELL_H = 10;
const CHARS = "  ..,::;;!!||//\\\\**++??%%$$##@@";

export default function HydraScene() {
  const preRef = useRef<HTMLPreElement>(null);
  const hiResRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  const render = useCallback(() => {
    const pre = preRef.current;
    if (!pre) return;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const cols = Math.floor(screenW / CELL_W);
    const rows = Math.floor(screenH / CELL_H);

    // ─── HIGH-RES canvas at actual screen resolution ───
    if (!hiResRef.current) hiResRef.current = document.createElement("canvas");
    const cv = hiResRef.current;
    cv.width = screenW;
    cv.height = screenH;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;

    const t = frameRef.current * 0.016;
    frameRef.current++;

    // Clear to black
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, screenW, screenH);

    // Center and scale
    const cx = screenW / 2;
    const baseY = screenH * 0.85;

    // ─── DRAW HYDRA AT FULL RESOLUTION ───
    drawFullResHydra(ctx, cx, baseY, screenW, screenH, t);

    // ─── DOWNSAMPLE to ASCII ───
    // Read the full-res image and average pixel blocks
    const imgData = ctx.getImageData(0, 0, screenW, screenH);
    const px = imgData.data;

    let ascii = "";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Average brightness of the pixel block for this character cell
        let totalBright = 0;
        let count = 0;
        const startX = col * CELL_W;
        const startY = row * CELL_H;

        for (let py = startY; py < Math.min(startY + CELL_H, screenH); py++) {
          for (let px2 = startX; px2 < Math.min(startX + CELL_W, screenW); px2++) {
            const i = (py * screenW + px2) * 4;
            totalBright += (px[i] + px[i + 1] + px[i + 2]) / 3;
            count++;
          }
        }

        const avgBright = totalBright / count;
        const charIdx = Math.floor((avgBright / 255) * (CHARS.length - 1));
        ascii += CHARS[charIdx];
      }
      ascii += "\n";
    }

    pre.textContent = ascii;
    animRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [render]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <pre
        ref={preRef}
        style={{
          margin: 0, padding: 0,
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: `${CELL_H}px`,
          lineHeight: `${CELL_H}px`,
          letterSpacing: `${CELL_W - 4}px`,
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
 * Draw the full hydra creature at HIGH RESOLUTION.
 * This is actual illustration, not low-res blobs.
 */
function drawFullResHydra(
  ctx: CanvasRenderingContext2D,
  cx: number, baseY: number,
  W: number, H: number, time: number
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ─── BODY — thick serpentine coiled mass ───
  // Main body bulk with gradient for volume
  const bodyGrad = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, W * 0.2);
  bodyGrad.addColorStop(0, "#666");
  bodyGrad.addColorStop(0.6, "#444");
  bodyGrad.addColorStop(1, "#111");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, W * 0.17, H * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Coil overlaps — gives volume and serpentine feel
  for (let i = 0; i < 6; i++) {
    const coilAngle = (i / 6) * Math.PI * 2 + time * 0.05;
    const coilX = cx + Math.cos(coilAngle) * W * 0.11;
    const coilY = baseY + Math.sin(coilAngle * 0.5) * H * 0.03 - H * 0.01;
    const g = ctx.createRadialGradient(coilX, coilY, 0, coilX, coilY, W * 0.06);
    g.addColorStop(0, "#555");
    g.addColorStop(1, "#222");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(coilX, coilY, W * 0.055, H * 0.035, coilAngle * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── 7 NECKS + DRAGON HEADS ───
  const heads = [
    { spread: -1.3, length: 0.52, phase: 0.0 },
    { spread: -0.85, length: 0.60, phase: 0.85 },
    { spread: -0.35, length: 0.68, phase: 1.8 },
    { spread: 0.0, length: 0.75, phase: 2.7 },
    { spread: 0.35, length: 0.68, phase: 3.7 },
    { spread: 0.85, length: 0.60, phase: 4.6 },
    { spread: 1.3, length: 0.52, phase: 5.5 },
  ];

  // Draw back-to-front (outer necks first, center last)
  const drawOrder = [0, 6, 1, 5, 2, 4, 3];

  for (const idx of drawOrder) {
    const h = heads[idx];
    const neckH = H * h.length;

    // Animated sway — unique per head
    const sway1 = Math.sin(time * 0.4 + h.phase) * W * 0.045;
    const sway2 = Math.cos(time * 0.28 + h.phase * 1.4) * W * 0.025;
    const vertSway = Math.sin(time * 0.22 + h.phase) * H * 0.012;

    // Intertwining — necks cross over each other
    const intertwine = Math.sin(time * 0.35 + h.phase + 1.5) * W * 0.025;

    // Bezier control points for S-curve neck
    const x0 = cx + h.spread * W * 0.04;
    const y0 = baseY - H * 0.02;
    const x1 = cx + h.spread * W * 0.08 + intertwine;
    const y1 = baseY - neckH * 0.3;
    const x2 = cx + h.spread * W * 0.18 + sway1 - intertwine * 0.5;
    const y2 = baseY - neckH * 0.65 + vertSway;
    const hx = cx + h.spread * W * 0.25 + sway1 + sway2;
    const hy = baseY - neckH + vertSway;

    // ── NECK with volume (gradient stroke) ──
    const neckThickness = W * 0.036;

    // Shadow/outline
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = neckThickness + 6;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x1, y1, x2, y2, hx, hy);
    ctx.stroke();

    // Main neck — gradient along length
    ctx.strokeStyle = "#555";
    ctx.lineWidth = neckThickness;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.bezierCurveTo(x1, y1, x2, y2, hx, hy);
    ctx.stroke();

    // Highlight stripe (top of neck = lit side)
    ctx.strokeStyle = "#777";
    ctx.lineWidth = neckThickness * 0.3;
    ctx.beginPath();
    // Offset slightly above the main path
    ctx.moveTo(x0, y0 - neckThickness * 0.25);
    ctx.bezierCurveTo(
      x1, y1 - neckThickness * 0.25,
      x2, y2 - neckThickness * 0.25,
      hx, hy - neckThickness * 0.25
    );
    ctx.stroke();

    // ── DORSAL SPINE RIDGE ──
    ctx.fillStyle = "#888";
    for (let s = 0; s < 20; s++) {
      const st = (s + 1) / 21;
      const sx = bezAt(x0, x1, x2, hx, st);
      const sy = bezAt(y0, y1, y2, hy, st);
      const spineH = (1.3 - st * 0.5) * neckThickness * 0.5;

      ctx.beginPath();
      ctx.moveTo(sx - 2, sy - neckThickness * 0.4);
      ctx.lineTo(sx, sy - neckThickness * 0.4 - spineH);
      ctx.lineTo(sx + 2, sy - neckThickness * 0.4);
      ctx.closePath();
      ctx.fill();
    }

    // ── DRAGON HEAD — Drogon-style, full detail ──
    const headAngle = Math.atan2(hy - y2, hx - x2);
    const tilt = Math.sin(time * 0.3 + h.phase * 2) * 0.1;
    const jawOpen = 0.12 + Math.sin(time * 0.2 + h.phase * 3) * 0.1;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(headAngle + tilt + Math.PI);

    const sc = Math.max(3, W * 0.026); // head scale — LARGE for visible detail

    // Shadow behind head for depth
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // ── UPPER SKULL — long tapered crocodilian shape ──
    const skullGrad = ctx.createLinearGradient(0, -sc * 3, 0, sc * 1);
    skullGrad.addColorStop(0, "#888");
    skullGrad.addColorStop(0.5, "#666");
    skullGrad.addColorStop(1, "#444");
    ctx.fillStyle = skullGrad;
    ctx.beginPath();
    ctx.moveTo(-sc * 3, 0);              // back of skull
    ctx.quadraticCurveTo(-sc * 2, -sc * 3, sc * 2, -sc * 2.2);  // dome
    ctx.quadraticCurveTo(sc * 6, -sc * 1.5, sc * 10, -sc * 0.8); // bridge
    ctx.lineTo(sc * 14, -sc * 0.3);      // snout tip top
    ctx.lineTo(sc * 14, sc * 0.2);       // snout tip bottom
    ctx.quadraticCurveTo(sc * 10, sc * 0.5, sc * 5, sc * 0.8);  // under snout
    ctx.lineTo(sc * 2, sc * 1.0);        // jaw hinge
    ctx.lineTo(-sc * 3, sc * 0.5);       // back of skull bottom
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // ── LOWER JAW — animated opening ──
    const jd = jawOpen * sc * 6;
    const jawGrad = ctx.createLinearGradient(0, sc * 1, 0, sc * 3 + jd);
    jawGrad.addColorStop(0, "#555");
    jawGrad.addColorStop(1, "#333");
    ctx.fillStyle = jawGrad;
    ctx.beginPath();
    ctx.moveTo(sc * 2, sc * 1.2);
    ctx.quadraticCurveTo(sc * 6, sc * 1.8 + jd * 0.5, sc * 10, sc * 1.0 + jd * 0.8);
    ctx.lineTo(sc * 13, sc * 0.5 + jd);
    ctx.lineTo(sc * 13, sc * 1.5 + jd);
    ctx.quadraticCurveTo(sc * 8, sc * 3.0 + jd * 0.6, sc * 2, sc * 2.5);
    ctx.closePath();
    ctx.fill();

    // ── TEETH — individual sharp fangs ──
    ctx.fillStyle = "#ddd";
    for (let ti = 0; ti < 9; ti++) {
      const tx = sc * (3.5 + ti * 1.15);
      const jBend = jd * (ti / 9);
      const tSize = sc * (0.4 - ti * 0.02);

      // Upper fang
      ctx.beginPath();
      ctx.moveTo(tx - tSize * 0.4, sc * 0.0);
      ctx.lineTo(tx, sc * 1.0 + jBend * 0.2);
      ctx.lineTo(tx + tSize * 0.4, sc * 0.0);
      ctx.closePath();
      ctx.fill();

      // Lower tooth
      ctx.beginPath();
      ctx.moveTo(tx - tSize * 0.3, sc * 1.5 + jBend);
      ctx.lineTo(tx, sc * 0.6 + jBend * 0.4);
      ctx.lineTo(tx + tSize * 0.3, sc * 1.5 + jBend);
      ctx.closePath();
      ctx.fill();
    }

    // ── HORN CROWN — 3-4 horns per side, swept back like Drogon ──
    for (let side = -1; side <= 1; side += 2) {
      ctx.fillStyle = "#999";
      // Primary horn — large, sweeping far back
      drawHorn(ctx, -sc * 1, side * sc * 2.5, -sc * 10, side * sc * 6, sc * 0.8);
      // Secondary horn
      ctx.fillStyle = "#888";
      drawHorn(ctx, sc * 0.5, side * sc * 2.2, -sc * 6, side * sc * 5, sc * 0.6);
      // Tertiary horn
      ctx.fillStyle = "#777";
      drawHorn(ctx, sc * 2, side * sc * 2.0, -sc * 3, side * sc * 4, sc * 0.45);
      // Small cheek spike
      ctx.fillStyle = "#666";
      drawHorn(ctx, sc * 3, side * sc * 1.5, sc * 1, side * sc * 3.2, sc * 0.3);
    }

    // ── BROW RIDGE — heavy armor plate ──
    ctx.fillStyle = "#777";
    ctx.beginPath();
    ctx.moveTo(sc * 0, -sc * 2.8);
    ctx.lineTo(sc * 6, -sc * 1.8);
    ctx.lineTo(sc * 6, -sc * 1.3);
    ctx.lineTo(sc * 0, -sc * 2.2);
    ctx.closePath();
    ctx.fill();

    // ── EYE — deep-set, piercing, with glow ──
    // Eye socket shadow
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(sc * 4.5, -sc * 1.0, sc * 1.0, sc * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye
    ctx.fillStyle = "#ff6600";
    ctx.beginPath();
    ctx.ellipse(sc * 4.5, -sc * 1.0, sc * 0.7, sc * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bright center
    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.ellipse(sc * 4.5, -sc * 1.0, sc * 0.4, sc * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    // Slit pupil
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(sc * 4.5, -sc * 1.0, sc * 0.1, sc * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── NOSTRIL ──
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(sc * 12, -sc * 0.4, sc * 0.4, sc * 0.25, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // ── SCALE TEXTURE — subtle lines on the skull ──
    ctx.strokeStyle = "rgba(100,100,100,0.4)";
    ctx.lineWidth = 1;
    for (let li = 0; li < 6; li++) {
      const lx = sc * (2 + li * 2);
      ctx.beginPath();
      ctx.moveTo(lx, -sc * 2);
      ctx.lineTo(lx + sc * 0.8, sc * 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/** Draw a tapered horn from base to tip */
function drawHorn(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  tx: number, ty: number,
  width: number
) {
  const angle = Math.atan2(ty - by, tx - bx);
  const perpX = Math.cos(angle + Math.PI / 2);
  const perpY = Math.sin(angle + Math.PI / 2);

  ctx.beginPath();
  ctx.moveTo(bx + perpX * width, by + perpY * width);
  ctx.quadraticCurveTo(
    (bx + tx) / 2 + perpX * width * 0.4,
    (by + ty) / 2 + perpY * width * 0.4,
    tx, ty
  );
  ctx.quadraticCurveTo(
    (bx + tx) / 2 - perpX * width * 0.4,
    (by + ty) / 2 - perpY * width * 0.4,
    bx - perpX * width, by - perpY * width
  );
  ctx.closePath();
  ctx.fill();
}

/** Cubic bezier interpolation */
function bezAt(a: number, b: number, c: number, d: number, t: number): number {
  const m = 1 - t;
  return m * m * m * a + 3 * m * m * t * b + 3 * m * t * t * c + t * t * t * d;
}
