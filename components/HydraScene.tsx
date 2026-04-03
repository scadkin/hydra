"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * HydraScene.tsx
 *
 * Procedural 3D Hydra dragon — 7 heads, Game of Thrones inspired.
 * MUCH more menacing than v1: thicker necks, bigger heads with horns/spikes/teeth,
 * dramatic lighting, brighter glowing eyes, higher opacity.
 */

const NUM_HEADS = 7;
const BG = 0x0c0c0c;

/* Dragon scale material — dark, slightly metallic */
function scaleMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.55,
    metalness: 0.5,
  });
}

/* Glowing eye material */
function eyeMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xff2200,
    emissive: 0xff2200,
    emissiveIntensity: 3,
    roughness: 0.2,
    metalness: 0,
  });
}

interface HeadData {
  group: THREE.Group;
  eyes: THREE.MeshStandardMaterial[];
  jawPivot: THREE.Group;
}

function createDragonHead(mat: THREE.MeshStandardMaterial): HeadData {
  const group = new THREE.Group();
  const eyeMats: THREE.MeshStandardMaterial[] = [];

  // --- Skull: elongated, angular ---
  const skullGeo = new THREE.SphereGeometry(0.5, 8, 6);
  const skull = new THREE.Mesh(skullGeo, mat);
  skull.scale.set(0.9, 0.7, 1.8); // long and flat
  group.add(skull);

  // --- Upper snout: long, tapered ---
  const snoutGeo = new THREE.ConeGeometry(0.28, 1.0, 6);
  const snout = new THREE.Mesh(snoutGeo, mat);
  snout.rotation.x = -Math.PI / 2;
  snout.position.set(0, 0, 1.0);
  group.add(snout);

  // --- Brow ridge: makes it look angry ---
  const browGeo = new THREE.BoxGeometry(0.7, 0.12, 0.5);
  const brow = new THREE.Mesh(browGeo, mat);
  brow.position.set(0, 0.25, 0.15);
  group.add(brow);

  // --- Lower jaw: hinged open slightly ---
  const jawPivot = new THREE.Group();
  jawPivot.position.set(0, -0.15, 0.3);
  const jawGeo = new THREE.ConeGeometry(0.22, 0.8, 5);
  const jaw = new THREE.Mesh(jawGeo, mat);
  jaw.rotation.x = -Math.PI / 2;
  jaw.position.set(0, -0.1, 0.25);
  jawPivot.add(jaw);
  jawPivot.rotation.x = 0.15; // slightly open
  group.add(jawPivot);

  // --- Teeth: small spikes along upper and lower jaw ---
  const toothGeo = new THREE.ConeGeometry(0.03, 0.12, 4);
  const toothMat = new THREE.MeshStandardMaterial({ color: 0xccccaa, roughness: 0.4, metalness: 0.3 });
  for (let i = 0; i < 6; i++) {
    const t = (i / 5) * 0.7 + 0.3;
    const spread = (i % 2 === 0 ? 0.08 : -0.08);
    // Upper teeth
    const upper = new THREE.Mesh(toothGeo, toothMat);
    upper.position.set(spread, -0.2, t * 1.2);
    upper.rotation.x = Math.PI;
    group.add(upper);
    // Lower teeth
    const lower = new THREE.Mesh(toothGeo, toothMat);
    lower.position.set(spread, -0.3, t * 1.0);
    jawPivot.add(lower);
  }

  // --- Horns: large, curved backward ---
  const hornGeo = new THREE.ConeGeometry(0.07, 0.7, 6);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x222211, roughness: 0.5, metalness: 0.6 });
  for (let side = -1; side <= 1; side += 2) {
    // Main horn
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(side * 0.3, 0.3, -0.3);
    horn.rotation.x = Math.PI * 0.7;
    horn.rotation.z = side * 0.25;
    group.add(horn);

    // Secondary smaller horn
    const horn2 = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.4, 5),
      hornMat
    );
    horn2.position.set(side * 0.2, 0.25, 0.0);
    horn2.rotation.x = Math.PI * 0.65;
    horn2.rotation.z = side * 0.15;
    group.add(horn2);
  }

  // --- Neck spines/ridges along the top ---
  const spineGeo = new THREE.ConeGeometry(0.04, 0.2, 4);
  for (let i = 0; i < 4; i++) {
    const spine = new THREE.Mesh(spineGeo, mat);
    spine.position.set(0, 0.3, -0.3 - i * 0.25);
    spine.rotation.x = Math.PI * 0.85;
    group.add(spine);
  }

  // --- Eyes: BRIGHT, menacing, glowing ---
  const eMat = eyeMaterial();
  eyeMats.push(eMat);
  const eGeo = new THREE.SphereGeometry(0.08, 8, 6);
  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(eGeo, eMat);
    eye.position.set(side * 0.25, 0.15, 0.45);
    group.add(eye);

    // Strong point light per eye
    const light = new THREE.PointLight(0xff2200, 1.5, 4);
    light.position.copy(eye.position);
    group.add(light);
  }

  return { group, eyes: eyeMats, jawPivot };
}

function generateNeckPath(index: number, total: number): THREE.Vector3[] {
  const spread = ((index - (total - 1) / 2) / ((total - 1) / 2));
  const angleX = spread * 1.5;
  const length = 4.0 + Math.abs(spread) * 1.0;

  const pts: THREE.Vector3[] = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = angleX * t * 1.8;
    const y = t * length;
    const z = Math.sin(t * Math.PI) * spread * 0.6;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return pts;
}

interface NeckData {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  basePts: THREE.Vector3[];
  phase: number;
  freq: number;
  amp: number;
  spines: THREE.Mesh[];
}

export default function HydraScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.FogExp2(BG, 0.06);

    // Camera — closer, looking up at the creature
    const cam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 60);
    cam.position.set(0, 2, 9);
    cam.lookAt(0, 3.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;
    el.appendChild(renderer.domElement);

    // Lighting — dramatic, cinematic
    scene.add(new THREE.AmbientLight(0x111111, 0.4));

    const keyLight = new THREE.DirectionalLight(0xff6633, 1.5);
    keyLight.position.set(5, 10, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x2244ff, 0.6);
    rimLight.position.set(-5, 6, -4);
    scene.add(rimLight);

    // A dim red light from below for menace
    const underLight = new THREE.PointLight(0x660000, 1.0, 15);
    underLight.position.set(0, -2, 0);
    scene.add(underLight);

    // Creature group
    const creature = new THREE.Group();
    creature.position.set(0, -2, 0);
    scene.add(creature);

    const bodyMat = scaleMaterial();

    // Body — thick, coiled base
    const bodyGeo = new THREE.TorusGeometry(1.5, 0.7, 12, 24);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 0.4;
    creature.add(body);

    const bulkGeo = new THREE.SphereGeometry(1.4, 12, 10);
    const bulk = new THREE.Mesh(bulkGeo, bodyMat);
    bulk.scale.set(1.5, 0.7, 1.2);
    bulk.position.y = 0.4;
    creature.add(bulk);

    // Body spines
    const spineGeo = new THREE.ConeGeometry(0.06, 0.35, 4);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const spine = new THREE.Mesh(spineGeo, bodyMat);
      spine.position.set(Math.cos(angle) * 1.3, 1.0, Math.sin(angle) * 1.0);
      spine.rotation.z = Math.cos(angle) * 0.5;
      spine.rotation.x = Math.sin(angle) * 0.5;
      creature.add(spine);
    }

    // Necks + Heads
    const necks: NeckData[] = [];
    const heads: HeadData[] = [];

    for (let i = 0; i < NUM_HEADS; i++) {
      const basePts = generateNeckPath(i, NUM_HEADS);
      const curve = new THREE.CatmullRomCurve3(basePts, false, "catmullrom", 0.5);

      // Thicker necks — radius 0.25, tapers
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.25, 10, false);
      const neckMesh = new THREE.Mesh(tubeGeo, bodyMat);
      creature.add(neckMesh);

      // Spines along the neck
      const neckSpines: THREE.Mesh[] = [];
      for (let s = 0; s < 6; s++) {
        const t = (s + 1) / 7;
        const pt = curve.getPointAt(t);
        const sp = new THREE.Mesh(
          new THREE.ConeGeometry(0.04, 0.2, 4),
          bodyMat
        );
        sp.position.copy(pt);
        sp.position.y += 0.25;
        creature.add(sp);
        neckSpines.push(sp);
      }

      const phase = (i / NUM_HEADS) * Math.PI * 2;
      const freq = 0.35 + Math.random() * 0.25;
      const amp = 0.25 + Math.random() * 0.2;

      necks.push({ mesh: neckMesh, curve, basePts: basePts.map(p => p.clone()), phase, freq, amp, spines: neckSpines });

      // Dragon head
      const head = createDragonHead(bodyMat);
      const end = curve.getPointAt(1);
      const tan = curve.getTangentAt(1);
      head.group.position.copy(end);
      head.group.lookAt(end.x + tan.x, end.y + tan.y, end.z + tan.z);
      creature.add(head.group);
      heads.push(head);
    }

    // Animation
    let disposed = false;
    let animId = 0;

    function animate(now: number) {
      if (disposed) return;
      animId = requestAnimationFrame(animate);
      const t = now / 1000;

      // Slow rotation
      creature.rotation.y = Math.sin(t * 0.1) * 0.3;

      // Update necks
      for (let i = 0; i < NUM_HEADS; i++) {
        const n = necks[i];
        const newPts: THREE.Vector3[] = [];

        for (let j = 0; j < n.basePts.length; j++) {
          const base = n.basePts[j];
          const segT = j / (n.basePts.length - 1);
          const sway = segT * segT;

          const sx = Math.sin(t * n.freq * 2 + n.phase + segT * 3) * n.amp * sway;
          const sz = Math.cos(t * n.freq * 1.5 + n.phase + segT * 2.5) * n.amp * 0.8 * sway;
          // Add some vertical bobbing near the head
          const sy = Math.sin(t * n.freq + n.phase) * 0.1 * sway;

          newPts.push(new THREE.Vector3(base.x + sx, base.y + sy, base.z + sz));
        }

        n.curve.points = newPts;
        const oldGeo = n.mesh.geometry;
        n.mesh.geometry = new THREE.TubeGeometry(n.curve, 24, 0.25, 10, false);
        oldGeo.dispose();

        // Update spine positions
        for (let s = 0; s < n.spines.length; s++) {
          const st = (s + 1) / 7;
          const pt = n.curve.getPointAt(st);
          n.spines[s].position.set(pt.x, pt.y + 0.25, pt.z);
        }

        // Update head
        const h = heads[i];
        const end = n.curve.getPointAt(1);
        const tan = n.curve.getTangentAt(1);
        h.group.position.copy(end);
        h.group.lookAt(end.x + tan.x, end.y + tan.y, end.z + tan.z);

        // Head personality: slight turns and jaw movement
        h.group.rotation.y += Math.sin(t * 0.7 + n.phase) * 0.03;
        h.group.rotation.z += Math.cos(t * 0.5 + n.phase) * 0.02;
        // Jaw open/close slowly
        h.jawPivot.rotation.x = 0.1 + Math.sin(t * 0.4 + n.phase * 2) * 0.08;
      }

      // Eye glow pulse
      const glow = 2.5 + Math.sin(t * 2.5) * 1.0;
      for (const h of heads) {
        for (const m of h.eyes) {
          m.emissiveIntensity = glow;
        }
      }

      renderer.render(scene, cam);
    }

    animId = requestAnimationFrame(animate);

    // Resize
    function onResize() {
      if (disposed) return;
      cam.aspect = window.innerWidth / window.innerHeight;
      cam.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach(x => x.dispose());
          else m.dispose();
        }
      });
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
  );
}
