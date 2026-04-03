"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * HydraScene.tsx — v5: GoT-accurate dragon anatomy
 *
 * Based on actual visual study of Drogon and hydra art:
 * - Long crocodilian snouts
 * - Crown of swept-back horns
 * - Wide-open jaws showing teeth
 * - Heavy brow ridges
 * - Spiny frill ridge along skull and neck
 * - Thick, muscular necks that twist and coil around each other
 * - Each head faces a different direction
 */

const CHAR_W = 5;
const CHAR_H = 8;
const CHARS = " .,;:!|/\\*+?%$#@";

export default function HydraScene() {
  const preRef = useRef<HTMLPreElement>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const animRef = useRef(0);

  const draw = useCallback(() => {
    const pre = preRef.current;
    if (!pre) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const cols = Math.floor(W / CHAR_W);
    const rows = Math.floor(H / CHAR_H);

    if (!cvRef.current) cvRef.current = document.createElement("canvas");
    const cv = cvRef.current;
    cv.width = cols;
    cv.height = rows;
    const c = cv.getContext("2d")!;

    const t = frameRef.current * 0.018;
    frameRef.current++;

    c.fillStyle = "#000";
    c.fillRect(0, 0, cols, rows);

    const cx = cols / 2;
    const baseY = rows * 0.88;

    // ─── BODY — thick coiled serpentine mass ───
    c.fillStyle = "#555";
    c.beginPath();
    c.ellipse(cx, baseY, cols * 0.18, rows * 0.07, 0, 0, Math.PI * 2);
    c.fill();
    // Body coils
    c.fillStyle = "#444";
    for (let i = 0; i < 5; i++) {
      const bx = cx + Math.cos(i * 1.3 + t * 0.1) * cols * 0.12;
      const by = baseY + Math.sin(i * 1.3) * rows * 0.035;
      c.beginPath();
      c.ellipse(bx, by, cols * 0.06, rows * 0.03, i * 0.4, 0, Math.PI * 2);
      c.fill();
    }

    // ─── 7 NECKS + HEADS ───
    const heads = [
      { angle: -1.0, len: 0.48, phase: 0.0, facing: -0.4 },
      { angle: -0.65, len: 0.56, phase: 0.9, facing: -0.25 },
      { angle: -0.3, len: 0.63, phase: 1.9, facing: -0.1 },
      { angle: 0.0, len: 0.7, phase: 2.8, facing: 0.0 },
      { angle: 0.3, len: 0.63, phase: 3.9, facing: 0.1 },
      { angle: 0.65, len: 0.56, phase: 4.8, facing: 0.25 },
      { angle: 1.0, len: 0.48, phase: 5.8, facing: 0.4 },
    ];

    // Draw back-to-front for depth (center heads in front)
    const order = [0, 6, 1, 5, 2, 4, 3];

    for (const idx of order) {
      const h = heads[idx];
      drawDragon(c, cx, baseY, h, t, cols, rows, idx);
    }

    // ─── Convert to ASCII ───
    const img = c.getImageData(0, 0, cols, rows);
    const px = img.data;
    let out = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        const b = (px[i] + px[i + 1] + px[i + 2]) / 3;
        out += CHARS[Math.floor((b / 255) * (CHARS.length - 1))];
      }
      out += "\n";
    }
    pre.textContent = out;

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <pre
        ref={preRef}
        style={{
          margin: 0, padding: 0,
          fontFamily: "'Geist Mono', 'SF Mono', monospace",
          fontSize: `${CHAR_H}px`,
          lineHeight: `${CHAR_H}px`,
          letterSpacing: `${CHAR_W - 3.5}px`,
          color: "#c9a050",
          opacity: 0.5,
          whiteSpace: "pre",
          overflow: "hidden",
        }}
      />
    </div>
  );
}

function drawDragon(
  c: CanvasRenderingContext2D,
  cx: number, baseY: number,
  cfg: { angle: number; len: number; phase: number; facing: number },
  time: number, cols: number, rows: number, idx: number
) {
  const { angle, len, phase, facing } = cfg;
  const neckLen = rows * len;

  // Animated sway — each neck moves independently
  const swX = Math.sin(time * 0.45 + phase) * cols * 0.035;
  const swX2 = Math.cos(time * 0.3 + phase * 1.5) * cols * 0.02;
  const swY = Math.sin(time * 0.25 + phase) * rows * 0.015;

  // Neck path — S-curve with intertwining
  const intertwine = Math.sin(time * 0.4 + phase + 0.5) * cols * 0.03;
  const p0x = cx + angle * cols * 0.04;
  const p0y = baseY;
  const p1x = cx + angle * cols * 0.1 + intertwine;
  const p1y = baseY - neckLen * 0.3;
  const p2x = cx + angle * cols * 0.2 + swX - intertwine;
  const p2y = baseY - neckLen * 0.6 + swY;
  const hx = cx + angle * cols * 0.3 + swX + swX2;
  const hy = baseY - neckLen + swY;

  // ─── NECK — thick, muscular ───
  const neckW = Math.max(4, cols * 0.022);
  c.lineCap = "round";
  c.lineJoin = "round";

  // Neck shadow/thickness
  c.strokeStyle = "#333";
  c.lineWidth = neckW + 2;
  c.beginPath();
  c.moveTo(p0x, p0y);
  c.bezierCurveTo(p1x, p1y, p2x, p2y, hx, hy);
  c.stroke();

  // Neck main
  c.strokeStyle = "#666";
  c.lineWidth = neckW;
  c.beginPath();
  c.moveTo(p0x, p0y);
  c.bezierCurveTo(p1x, p1y, p2x, p2y, hx, hy);
  c.stroke();

  // ─── SPINY RIDGE along the neck ───
  c.fillStyle = "#888";
  for (let s = 0; s < 16; s++) {
    const st = (s + 1) / 17;
    const sx = bz(p0x, p1x, p2x, hx, st);
    const sy = bz(p0y, p1y, p2y, hy, st);
    // Spine points upward from the neck
    const spH = (1.2 - st * 0.6) * neckW * 0.45;
    c.beginPath();
    c.moveTo(sx - neckW * 0.08, sy - neckW * 0.35);
    c.lineTo(sx, sy - neckW * 0.35 - spH);
    c.lineTo(sx + neckW * 0.08, sy - neckW * 0.35);
    c.closePath();
    c.fill();
  }

  // ─── DRAGON HEAD — GoT Drogon style ───
  const headDir = Math.atan2(hy - p2y, hx - p2x);
  const headTilt = Math.sin(time * 0.35 + phase * 2) * 0.12;
  const jawOpen = 0.15 + Math.sin(time * 0.25 + phase * 3) * 0.12; // breathing

  c.save();
  c.translate(hx, hy);
  c.rotate(headDir + headTilt + Math.PI);

  const s = Math.max(1.5, cols * 0.016); // head scale

  // ── Skull — long, flat, crocodilian ──
  c.fillStyle = "#777";
  c.beginPath();
  c.moveTo(-s * 2, -s * 2.5);        // back of skull top
  c.lineTo(s * 3, -s * 1.8);          // brow ridge
  c.lineTo(s * 8, -s * 0.8);          // bridge of snout
  c.lineTo(s * 13, -s * 0.3);         // tip of snout
  c.lineTo(s * 13, s * 0.3);          // tip bottom
  c.lineTo(s * 8, s * 0.6);           // under snout
  c.lineTo(s * 3, s * 1.0);           // under jaw hinge
  c.lineTo(-s * 2, s * 0.5);          // back of skull bottom
  c.closePath();
  c.fill();

  // ── Lower jaw — opens based on breathing ──
  c.fillStyle = "#555";
  c.beginPath();
  const jawDrop = jawOpen * s * 5;
  c.moveTo(s * 2, s * 1.0);                           // jaw hinge
  c.lineTo(s * 6, s * 1.5 + jawDrop * 0.6);           // mid jaw
  c.lineTo(s * 11, s * 0.8 + jawDrop);                 // front jaw
  c.lineTo(s * 12.5, s * 0.5 + jawDrop);               // jaw tip
  c.lineTo(s * 11, s * 1.8 + jawDrop);                 // under jaw front
  c.lineTo(s * 6, s * 2.5 + jawDrop * 0.5);           // under jaw mid
  c.lineTo(s * 2, s * 2.0);                            // under jaw back
  c.closePath();
  c.fill();

  // ── TEETH — jagged row along upper and lower jaw ──
  c.fillStyle = "#ccc";
  for (let ti = 0; ti < 8; ti++) {
    const tx = s * (4 + ti * 1.1);
    const jawBend = jawDrop * (ti / 8);
    // Upper fangs (pointing down)
    c.beginPath();
    c.moveTo(tx - s * 0.2, s * 0.1);
    c.lineTo(tx, s * 1.2 + jawBend * 0.3);
    c.lineTo(tx + s * 0.2, s * 0.1);
    c.closePath();
    c.fill();
    // Lower teeth (pointing up)
    c.beginPath();
    c.moveTo(tx - s * 0.15, s * 1.3 + jawBend);
    c.lineTo(tx, s * 0.4 + jawBend * 0.5);
    c.lineTo(tx + s * 0.15, s * 1.3 + jawBend);
    c.closePath();
    c.fill();
  }

  // ── HORN CROWN — multiple swept-back horns like Drogon ──
  c.fillStyle = "#999";
  for (let side = -1; side <= 1; side += 2) {
    // Primary horn — large, sweeping back
    c.beginPath();
    c.moveTo(-s * 0.5, side * s * 2.0);
    c.lineTo(-s * 8, side * s * 5.0);
    c.lineTo(-s * 7, side * s * 4.2);
    c.lineTo(-s * 0.3, side * s * 1.5);
    c.closePath();
    c.fill();

    // Secondary horn
    c.beginPath();
    c.moveTo(s * 1.0, side * s * 1.8);
    c.lineTo(-s * 4, side * s * 4.0);
    c.lineTo(-s * 3.5, side * s * 3.4);
    c.lineTo(s * 1.2, side * s * 1.4);
    c.closePath();
    c.fill();

    // Third horn — smaller, part of the crest
    c.beginPath();
    c.moveTo(s * 2.5, side * s * 1.6);
    c.lineTo(-s * 1.5, side * s * 3.2);
    c.lineTo(-s * 1.0, side * s * 2.7);
    c.lineTo(s * 2.6, side * s * 1.2);
    c.closePath();
    c.fill();

    // Cheek/jaw spike
    c.beginPath();
    c.moveTo(s * 1.5, side * s * 1.2);
    c.lineTo(s * 0, side * s * 2.8);
    c.lineTo(s * 0.5, side * s * 2.3);
    c.lineTo(s * 1.7, side * s * 1.0);
    c.closePath();
    c.fill();
  }

  // ── Brow ridge — heavy, armored ──
  c.fillStyle = "#888";
  c.beginPath();
  c.moveTo(s * 1, -s * 2.5);
  c.lineTo(s * 5, -s * 2.0);
  c.lineTo(s * 5, -s * 1.5);
  c.lineTo(s * 1, -s * 1.8);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(s * 1, s * 0.8);
  c.lineTo(s * 5, s * 0.5);
  c.lineTo(s * 5, s * 0.8);
  c.lineTo(s * 1, s * 1.2);
  c.closePath();
  c.fill();

  // ── EYE — bright, piercing ──
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(s * 4, -s * 0.6, s * 0.55, 0, Math.PI * 2);
  c.fill();
  // Slit pupil
  c.fillStyle = "#000";
  c.beginPath();
  c.ellipse(s * 4, -s * 0.6, s * 0.12, s * 0.4, 0, 0, Math.PI * 2);
  c.fill();

  // ── Nostril ──
  c.fillStyle = "#333";
  c.beginPath();
  c.arc(s * 11, -s * 0.5, s * 0.25, 0, Math.PI * 2);
  c.fill();

  // ── Skull ridge / texture lines ──
  c.strokeStyle = "#555";
  c.lineWidth = 0.5;
  for (let li = 0; li < 4; li++) {
    const lx = s * (3 + li * 2.5);
    c.beginPath();
    c.moveTo(lx, -s * 1.5);
    c.lineTo(lx + s * 0.5, s * 0.3);
    c.stroke();
  }

  c.restore();
}

function bz(a: number, b: number, cc: number, d: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * cc + t * t * t * d;
}
