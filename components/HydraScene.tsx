"use client";

import { useEffect, useRef } from "react";

/**
 * HydraScene.tsx
 *
 * A 7-headed dragon Hydra rendered as ANIMATED ASCII ART.
 *
 * How it works:
 * 1. Build the Hydra as a 3D Three.js scene (procedural geometry)
 * 2. Render it through Three.js AsciiEffect — converts the 3D render
 *    into ASCII characters (like Ghostty's dancing ghost)
 * 3. The necks intertwine and weave around each other (helical paths)
 * 4. Style the ASCII output with warm amber coloring
 *
 * The result: a realistic dragon silhouette made entirely of text characters,
 * slowly swaying and breathing, rendered in glowing amber ASCII.
 */

export default function HydraScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Dynamic import Three.js and AsciiEffect (avoids SSR issues)
    let disposed = false;
    const cleanupFn = { current: null as (() => void) | null };

    (async () => {
      const THREE = await import("three");
      const { AsciiEffect } = await import(
        "three/examples/jsm/effects/AsciiEffect.js"
      );

      if (disposed) return;

      const NUM_HEADS = 7;

      // ─── Scene ───
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c0c0c);

      // ─── Camera — looking at the creature from slightly above ───
      const cam = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        80
      );
      cam.position.set(0, 3, 12);
      cam.lookAt(0, 3, 0);

      // ─── Renderer (hidden — AsciiEffect renders on top) ───
      const renderer = new THREE.WebGLRenderer({ antialias: false });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // ─── ASCII Effect ───
      // Characters from sparse to dense — creates depth illusion
      const charset = " .:-=+*#%@$";
      const effect = new AsciiEffect(renderer, charset, {
        invert: true,
        resolution: 0.2,
      });
      effect.setSize(window.innerWidth, window.innerHeight);
      effect.domElement.style.color = "#c9a050";
      effect.domElement.style.backgroundColor = "transparent";
      effect.domElement.style.fontFamily =
        "'Geist Mono', 'SF Mono', 'Fira Code', monospace";
      effect.domElement.style.fontSize = "8px";
      effect.domElement.style.lineHeight = "8px";
      effect.domElement.style.letterSpacing = "2px";
      el.appendChild(effect.domElement);

      // ─── Lighting — dramatic for strong ASCII contrast ───
      scene.add(new THREE.AmbientLight(0x333333, 0.6));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
      keyLight.position.set(4, 10, 6);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
      rimLight.position.set(-4, 5, -6);
      scene.add(rimLight);

      // Strong bottom light so the body is visible in ASCII
      const underLight = new THREE.PointLight(0xffffff, 1.5, 20);
      underLight.position.set(0, -1, 3);
      scene.add(underLight);

      // ─── Dragon material — light colored so ASCII renders it clearly ───
      const dragonMat = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.6,
        metalness: 0.3,
      });

      const brightMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
      });

      // ─── Creature group ───
      const creature = new THREE.Group();
      creature.position.set(0, -2.5, 0);
      scene.add(creature);

      // ─── Body — thick, coiled, with bulk ───
      const bodyGeo = new THREE.TorusGeometry(1.8, 0.8, 16, 32);
      const body = new THREE.Mesh(bodyGeo, dragonMat);
      body.rotation.x = Math.PI / 2;
      body.position.y = 0.3;
      creature.add(body);

      const bulkGeo = new THREE.SphereGeometry(1.6, 16, 12);
      const bulk = new THREE.Mesh(bulkGeo, dragonMat);
      bulk.scale.set(1.6, 0.8, 1.3);
      bulk.position.y = 0.3;
      creature.add(bulk);

      // Body spines
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const sp = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.4, 4),
          dragonMat
        );
        sp.position.set(Math.cos(a) * 1.5, 1.1, Math.sin(a) * 1.2);
        sp.lookAt(Math.cos(a) * 3, 2, Math.sin(a) * 3);
        creature.add(sp);
      }

      // ─── Generate INTERTWINED neck paths ───
      // Each neck follows a helical path that weaves around neighbors
      function makeNeckPath(
        idx: number,
        total: number,
        time: number
      ) {
        const spread = ((idx - (total - 1) / 2) / ((total - 1) / 2));
        const baseAngle = spread * 1.4;
        const length = 5.0 + Math.abs(spread) * 0.8;
        const helixPhase = (idx / total) * Math.PI * 2;

        const pts: InstanceType<typeof THREE.Vector3>[] = [];
        const n = 12; // more points = smoother curves
        for (let i = 0; i <= n; i++) {
          const t = i / n;
          // Base direction
          const x = baseAngle * t * 2.0;
          const y = t * length;

          // INTERTWINING: helical component that makes necks weave
          // The helix amplitude increases from base to mid, then decreases near head
          const helixAmp =
            Math.sin(t * Math.PI) * 0.6 * (1.0 - Math.abs(spread) * 0.3);
          const helixFreq = 2.0; // number of rotations
          const helixAngle =
            t * helixFreq * Math.PI * 2 + helixPhase + time * 0.3;

          const hx = Math.cos(helixAngle) * helixAmp;
          const hz = Math.sin(helixAngle) * helixAmp;

          // Organic sway on top of helix
          const swayT = t * t; // stronger toward tip
          const swayX =
            Math.sin(time * 0.4 + helixPhase + t * 3) * 0.2 * swayT;
          const swayZ =
            Math.cos(time * 0.35 + helixPhase + t * 2.5) * 0.15 * swayT;
          const swayY = Math.sin(time * 0.3 + helixPhase) * 0.08 * swayT;

          pts.push(
            new THREE.Vector3(x + hx + swayX, y + swayY, hz + swayZ)
          );
        }
        return pts;
      }

      // ─── Dragon head geometry ───
      function createHead() {
        const g = new THREE.Group();

        // Skull — long, angular
        const skull = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 10, 8),
          dragonMat
        );
        skull.scale.set(0.85, 0.65, 1.9);
        g.add(skull);

        // Snout
        const snout = new THREE.Mesh(
          new THREE.ConeGeometry(0.25, 1.2, 6),
          dragonMat
        );
        snout.rotation.x = -Math.PI / 2;
        snout.position.z = 1.1;
        g.add(snout);

        // Brow ridge
        const brow = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 0.14, 0.5),
          dragonMat
        );
        brow.position.set(0, 0.28, 0.15);
        g.add(brow);

        // Lower jaw
        const jawGeo = new THREE.ConeGeometry(0.2, 0.9, 5);
        const jaw = new THREE.Mesh(jawGeo, dragonMat);
        jaw.rotation.x = -Math.PI / 2;
        jaw.position.set(0, -0.2, 0.7);
        g.add(jaw);

        // Teeth — sharp spikes
        const toothGeo = new THREE.ConeGeometry(0.025, 0.15, 4);
        for (let i = 0; i < 8; i++) {
          const tt = (i / 7) * 0.8 + 0.2;
          const side = i % 2 === 0 ? 0.07 : -0.07;
          const tooth = new THREE.Mesh(toothGeo, brightMat);
          tooth.position.set(side, -0.22, tt * 1.3);
          tooth.rotation.x = Math.PI;
          g.add(tooth);
        }

        // Horns — large, curved
        for (let side = -1; side <= 1; side += 2) {
          const horn = new THREE.Mesh(
            new THREE.ConeGeometry(0.08, 0.8, 6),
            dragonMat
          );
          horn.position.set(side * 0.32, 0.3, -0.3);
          horn.rotation.x = Math.PI * 0.7;
          horn.rotation.z = side * 0.3;
          g.add(horn);

          const horn2 = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.5, 5),
            dragonMat
          );
          horn2.position.set(side * 0.22, 0.25, 0.0);
          horn2.rotation.x = Math.PI * 0.65;
          horn2.rotation.z = side * 0.15;
          g.add(horn2);
        }

        // Eyes — BRIGHT for ASCII contrast
        const eyeGeo = new THREE.SphereGeometry(0.1, 8, 6);
        for (let side = -1; side <= 1; side += 2) {
          const eye = new THREE.Mesh(eyeGeo, brightMat);
          eye.position.set(side * 0.26, 0.14, 0.5);
          g.add(eye);
        }

        // Spines down the back of the head
        for (let i = 0; i < 5; i++) {
          const sp = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.25, 4),
            dragonMat
          );
          sp.position.set(0, 0.3, -0.2 - i * 0.2);
          sp.rotation.x = Math.PI * 0.85;
          g.add(sp);
        }

        return g;
      }

      // ─── Build necks and heads ───
      interface NeckState {
        mesh: any;
        head: any;
        idx: number;
        phase: number;
      }

      const neckStates: NeckState[] = [];

      for (let i = 0; i < NUM_HEADS; i++) {
        const pts = makeNeckPath(i, NUM_HEADS, 0);
        const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.5);

        // Neck — thicker with taper
        const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.28, 10, false);
        const neckMesh = new THREE.Mesh(tubeGeo, dragonMat);
        creature.add(neckMesh);

        // Spines along neck
        for (let s = 0; s < 8; s++) {
          const st = (s + 1) / 9;
          const pt = curve.getPointAt(st);
          const sp = new THREE.Mesh(
            new THREE.ConeGeometry(0.04, 0.22, 4),
            dragonMat
          );
          sp.position.copy(pt);
          sp.position.y += 0.28;
          creature.add(sp);
        }

        // Head
        const head = createHead();
        const end = curve.getPointAt(1);
        const tan = curve.getTangentAt(1);
        head.position.copy(end);
        head.lookAt(end.x + tan.x, end.y + tan.y, end.z + tan.z);
        creature.add(head);

        neckStates.push({
          mesh: neckMesh,
          head,
          idx: i,
          phase: (i / NUM_HEADS) * Math.PI * 2,
        });
      }

      // ─── Animation loop ───
      let animId = 0;

      function animate(now: number) {
        if (disposed) return;
        animId = requestAnimationFrame(animate);
        const t = now / 1000;

        // Slow creature rotation
        creature.rotation.y = Math.sin(t * 0.08) * 0.25;

        // Update each neck with intertwining paths
        for (const ns of neckStates) {
          const newPts = makeNeckPath(ns.idx, NUM_HEADS, t);
          const curve = new THREE.CatmullRomCurve3(
            newPts,
            false,
            "catmullrom",
            0.5
          );

          // Rebuild tube geometry
          const oldGeo = ns.mesh.geometry;
          ns.mesh.geometry = new THREE.TubeGeometry(
            curve,
            32,
            0.28,
            10,
            false
          );
          oldGeo.dispose();

          // Update head position + orientation
          const end = curve.getPointAt(1);
          const tan = curve.getTangentAt(1);
          ns.head.position.copy(end);
          ns.head.lookAt(end.x + tan.x, end.y + tan.y, end.z + tan.z);

          // Head personality
          ns.head.rotation.y +=
            Math.sin(t * 0.6 + ns.phase) * 0.04;
          ns.head.rotation.z +=
            Math.cos(t * 0.4 + ns.phase) * 0.03;
        }

        // Render through ASCII effect
        effect.render(scene, cam);
      }

      animId = requestAnimationFrame(animate);

      // ─── Resize ───
      function onResize() {
        if (disposed) return;
        cam.aspect = window.innerWidth / window.innerHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        effect.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onResize);

      // Store cleanup references
      cleanupFn.current = () => {
        disposed = true;
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        scene.traverse((obj) => {
          if ((obj as any).isMesh) {
            const m = obj as any;
            m.geometry.dispose();
            const mat = m.material;
            if (Array.isArray(mat)) mat.forEach((x: any) => x.dispose());
            else mat.dispose();
          }
        });
        renderer.dispose();
        if (el.contains(effect.domElement)) {
          el.removeChild(effect.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      if (cleanupFn.current) cleanupFn.current();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
        overflow: "hidden",
      }}
    />
  );
}
