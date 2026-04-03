"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const NUM_HEADS = 7;
const BODY_COLOR = 0x1a1a1a;
const EYE_COLOR = 0xff4400;
const BG_COLOR = 0x0c0c0c;

interface HeadGroup {
  group: THREE.Group;
  eyes: THREE.Mesh[];
  eyeLights: THREE.PointLight[];
}

interface NeckData {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  basePoints: THREE.Vector3[];
  phaseOffset: number;
  frequency: number;
  amplitude: number;
}

function createDragonMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: BODY_COLOR,
    roughness: 0.7,
    metalness: 0.4,
  });
}

function createHead(material: THREE.MeshStandardMaterial): HeadGroup {
  const group = new THREE.Group();
  const eyes: THREE.Mesh[] = [];
  const eyeLights: THREE.PointLight[] = [];

  // Skull - elongated sphere
  const skullGeo = new THREE.SphereGeometry(0.35, 12, 8);
  const skull = new THREE.Mesh(skullGeo, material);
  skull.scale.set(1, 0.8, 1.5);
  group.add(skull);

  // Snout - cone pointing forward
  const snoutGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
  const snout = new THREE.Mesh(snoutGeo, material);
  snout.rotation.x = -Math.PI / 2;
  snout.position.set(0, -0.05, 0.6);
  group.add(snout);

  // Lower jaw
  const jawGeo = new THREE.BoxGeometry(0.25, 0.1, 0.4);
  const jaw = new THREE.Mesh(jawGeo, material);
  jaw.position.set(0, -0.2, 0.35);
  group.add(jaw);

  // Horns
  const hornGeo = new THREE.ConeGeometry(0.06, 0.4, 6);
  for (let side = -1; side <= 1; side += 2) {
    const horn = new THREE.Mesh(hornGeo, material);
    horn.position.set(side * 0.2, 0.2, -0.2);
    horn.rotation.x = Math.PI * 0.75;
    horn.rotation.z = side * 0.3;
    group.add(horn);
  }

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({
    color: EYE_COLOR,
    emissive: EYE_COLOR,
    emissiveIntensity: 1.5,
    roughness: 0.3,
    metalness: 0.0,
  });
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 6);
  for (let side = -1; side <= 1; side += 2) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(side * 0.18, 0.1, 0.25);
    group.add(eye);
    eyes.push(eye);

    // Point light at each eye for glow
    const light = new THREE.PointLight(EYE_COLOR, 0.3, 2);
    light.position.copy(eye.position);
    group.add(light);
    eyeLights.push(light);
  }

  return { group, eyes, eyeLights };
}

function generateNeckPoints(
  index: number,
  totalHeads: number
): THREE.Vector3[] {
  // Fan the necks outward from center
  const spread = ((index - (totalHeads - 1) / 2) / ((totalHeads - 1) / 2));
  const angleX = spread * 1.2;
  const length = 3.5 + Math.abs(spread) * 0.8;

  const points: THREE.Vector3[] = [];
  const numPoints = 6;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = angleX * t * 1.5;
    const y = t * length;
    // S-curve sway baked in as base shape
    const z = Math.sin(t * Math.PI) * spread * 0.5;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

export default function HydraScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    necks: NeckData[];
    heads: HeadGroup[];
    creatureGroup: THREE.Group;
    animFrameId: number;
    disposed: boolean;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    scene.fog = new THREE.Fog(BG_COLOR, 8, 20);

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 2.5, 0);

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x222222, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffaa66, 1.2);
    dirLight.position.set(4, 8, 3);
    scene.add(dirLight);

    // --- Creature group ---
    const creatureGroup = new THREE.Group();
    creatureGroup.position.set(0, -1.5, 0);
    scene.add(creatureGroup);

    const material = createDragonMaterial();

    // --- Body ---
    const bodyGeo = new THREE.TorusGeometry(1.2, 0.5, 12, 24);
    const body = new THREE.Mesh(bodyGeo, material);
    body.rotation.x = Math.PI / 2;
    body.position.set(0, 0.3, 0);
    creatureGroup.add(body);

    // Extra body bulk
    const bulkGeo = new THREE.SphereGeometry(1.0, 12, 10);
    const bulk = new THREE.Mesh(bulkGeo, material);
    bulk.scale.set(1.3, 0.6, 1.0);
    bulk.position.set(0, 0.3, 0);
    creatureGroup.add(bulk);

    // --- Necks and Heads ---
    const necks: NeckData[] = [];
    const heads: HeadGroup[] = [];

    for (let i = 0; i < NUM_HEADS; i++) {
      const basePoints = generateNeckPoints(i, NUM_HEADS);
      const curve = new THREE.CatmullRomCurve3(basePoints, false, "catmullrom", 0.5);

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.15, 8, false);
      const neckMesh = new THREE.Mesh(tubeGeo, material);
      creatureGroup.add(neckMesh);

      const phaseOffset = (i / NUM_HEADS) * Math.PI * 2;
      const frequency = 0.4 + Math.random() * 0.3;
      const amplitude = 0.2 + Math.random() * 0.15;

      necks.push({
        mesh: neckMesh,
        curve,
        basePoints: basePoints.map((p) => p.clone()),
        phaseOffset,
        frequency,
        amplitude,
      });

      // Head at end of neck
      const headData = createHead(material);
      const endPoint = curve.getPointAt(1);
      const tangent = curve.getTangentAt(1);
      headData.group.position.copy(endPoint);
      headData.group.lookAt(
        endPoint.x + tangent.x,
        endPoint.y + tangent.y,
        endPoint.z + tangent.z
      );
      creatureGroup.add(headData.group);
      heads.push(headData);
    }

    // --- State ref ---
    const state = {
      renderer,
      scene,
      camera,
      necks,
      heads,
      creatureGroup,
      animFrameId: 0,
      disposed: false,
    };
    sceneRef.current = state;

    // --- Animation ---
    let lastTime = performance.now();

    function animate(now: number) {
      if (state.disposed) return;
      state.animFrameId = requestAnimationFrame(animate);

      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const t = now / 1000;

      // Slow creature rotation
      creatureGroup.rotation.y += 0.05 * dt;

      // Update each neck
      for (let i = 0; i < NUM_HEADS; i++) {
        const neck = necks[i];
        const newPoints: THREE.Vector3[] = [];

        for (let j = 0; j < neck.basePoints.length; j++) {
          const base = neck.basePoints[j];
          const segT = j / (neck.basePoints.length - 1);
          // More sway toward the tip
          const swayStrength = segT * segT;
          const swayX =
            Math.sin(t * neck.frequency * 2 + neck.phaseOffset + segT * 3) *
            neck.amplitude *
            swayStrength;
          const swayZ =
            Math.cos(t * neck.frequency * 1.5 + neck.phaseOffset + segT * 2) *
            neck.amplitude *
            0.7 *
            swayStrength;

          newPoints.push(
            new THREE.Vector3(base.x + swayX, base.y, base.z + swayZ)
          );
        }

        // Update curve and rebuild tube
        neck.curve.points = newPoints;

        const oldGeo = neck.mesh.geometry;
        const newGeo = new THREE.TubeGeometry(neck.curve, 20, 0.15, 8, false);
        neck.mesh.geometry = newGeo;
        oldGeo.dispose();

        // Update head position and orientation
        const head = heads[i];
        const endPoint = neck.curve.getPointAt(1);
        const tangent = neck.curve.getTangentAt(1);
        head.group.position.copy(endPoint);

        const lookTarget = new THREE.Vector3(
          endPoint.x + tangent.x,
          endPoint.y + tangent.y,
          endPoint.z + tangent.z
        );
        head.group.lookAt(lookTarget);

        // Head tilt/turn
        head.group.rotation.y +=
          Math.sin(t * 0.8 + neck.phaseOffset) * 0.02;
        head.group.rotation.z +=
          Math.cos(t * 0.6 + neck.phaseOffset) * 0.015;
      }

      // Eye glow pulse
      const glowIntensity = 1.2 + Math.sin(t * 3) * 0.4;
      for (const head of heads) {
        for (const eye of head.eyes) {
          const mat = eye.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = glowIntensity;
        }
        for (const light of head.eyeLights) {
          light.intensity = 0.2 + Math.sin(t * 3) * 0.15;
        }
      }

      renderer.render(scene, camera);
    }

    state.animFrameId = requestAnimationFrame(animate);

    // --- Resize ---
    function onResize() {
      if (state.disposed) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);

    // --- Cleanup ---
    return () => {
      state.disposed = true;
      cancelAnimationFrame(state.animFrameId);
      window.removeEventListener("resize", onResize);

      // Dispose all geometries and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
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
        opacity: 0.4,
      }}
    />
  );
}
