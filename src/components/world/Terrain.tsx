"use client";

import { Sparkles } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  LAKE,
  hillHeight,
  lakeMask,
  makeGrassTexture,
  makeRng,
  tmpObj,
} from "@/lib/three-utils";
import { Instanced, Reactive } from "./Reactive";

/* ------------------------------------------------------------------ */
/* Path                                                                 */
/* ------------------------------------------------------------------ */

export const pathCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(1.5, 0, 36),
  new THREE.Vector3(-3.5, 0, 28),
  new THREE.Vector3(3.5, 0, 21),
  new THREE.Vector3(-2.5, 0, 14),
  new THREE.Vector3(0.5, 0, 10),
  new THREE.Vector3(0, 0, 8.4),
]);

/* ------------------------------------------------------------------ */
/* Sky                                                                  */
/* ------------------------------------------------------------------ */

const skyVertex = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const skyFragment = /* glsl */ `
  varying vec3 vPos;
  uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHorizon; uniform vec3 uSun;
  void main() {
    vec3 d = normalize(vPos);
    float h = d.y;
    vec3 col = mix(uHorizon, uMid, smoothstep(-0.05, 0.18, h));
    col = mix(col, uTop, smoothstep(0.18, 0.85, h));
    float sun = pow(max(dot(d, normalize(uSun)), 0.0), 90.0);
    float glow = pow(max(dot(d, normalize(uSun)), 0.0), 6.0);
    col += vec3(1.0, 0.92, 0.75) * sun * 0.9 + vec3(1.0, 0.8, 0.7) * glow * 0.25;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTop: { value: new THREE.Color("#5d9bff") },
          uMid: { value: new THREE.Color("#bfdcff") },
          uHorizon: { value: new THREE.Color("#ffd9e9") },
          uSun: { value: new THREE.Vector3(30, 28, -60) },
        },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  return (
    <mesh material={material} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[480, 32, 16]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Ground                                                               */
/* ------------------------------------------------------------------ */

export function Ground() {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(260, 260, 120, 120);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, hillHeight(x, -y));
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const texture = useMemo(makeGrassTexture, []);
  return (
    <mesh geometry={geometry} rotation-x={-Math.PI / 2} receiveShadow>
      <meshStandardMaterial map={texture} roughness={1} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Lake                                                                 */
/* ------------------------------------------------------------------ */

const waterVertex = /* glsl */ `
  #include <fog_pars_vertex>
  uniform float uTime;
  varying vec2 vUv; varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 0.6 + uTime * 1.2) * 0.05 + cos(p.y * 0.8 - uTime * 0.9) * 0.05;
    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPos = worldPos.xyz;
    vec4 mvPosition = viewMatrix * worldPos;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;
const waterFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky;
  varying vec2 vUv; varying vec3 vWorldPos;
  void main() {
    vec2 c = (vUv - 0.5) * 2.0;
    float d = length(c);
    if (d > 1.0) discard;
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fres = pow(1.0 - clamp(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0, 1.0), 2.5);
    vec3 col = mix(uDeep, uShallow, smoothstep(0.35, 1.0, d));
    col = mix(col, uSky, fres * 0.75);
    float r1 = sin(vUv.x * 70.0 + vUv.y * 40.0 + uTime * 1.5);
    float r2 = sin(vUv.y * 80.0 - vUv.x * 30.0 - uTime * 1.1);
    float ripple = smoothstep(0.86, 1.0, r1 * r2);
    col += ripple * 0.35;
    float alpha = 0.94 * smoothstep(1.0, 0.94, d);
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

export function Lake() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uDeep: { value: new THREE.Color("#3d84b9") },
            uShallow: { value: new THREE.Color("#8fd3ea") },
            uSky: { value: new THREE.Color("#eaf3ff") },
          },
        ]),
        vertexShader: waterVertex,
        fragmentShader: waterFragment,
        transparent: true,
        fog: true,
        depthWrite: false,
      }),
    [],
  );
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh
      material={material}
      rotation-x={-Math.PI / 2}
      position={[LAKE.x, 0.09, LAKE.z]}
      renderOrder={1}
    >
      <planeGeometry args={[LAKE.rx * 2, LAKE.rz * 2, 48, 32]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Waterfall                                                            */
/* ------------------------------------------------------------------ */

const fallFragment = /* glsl */ `
  uniform float uTime; varying vec2 vUv;
  void main() {
    float s = sin((vUv.y * 24.0 + uTime * 5.0) + sin(vUv.x * 18.0 + uTime) * 1.2) * 0.5 + 0.5;
    float s2 = sin(vUv.y * 50.0 + uTime * 8.0 + vUv.x * 9.0) * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
    float top = smoothstep(1.0, 0.9, vUv.y);
    vec3 col = mix(vec3(0.72, 0.88, 1.0), vec3(1.0), s * 0.6 + s2 * 0.4);
    float a = (0.55 + 0.4 * s) * edge * top;
    gl_FragColor = vec4(col, a * 0.95);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
const fallVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

export const WATERFALL_POS: [number, number, number] = [-18, 0, -5];

export function Waterfall() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: fallVertex,
        fragmentShader: fallFragment,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
  });
  const [wx, , wz] = WATERFALL_POS;
  const rocks = useMemo(() => {
    const rng = makeRng(5);
    return Array.from({ length: 9 }, (_, i) => ({
      position: [
        wx + (rng() - 0.5) * 5,
        1.2 + i * 0.7 + rng(),
        wz - 1.4 - rng() * 2.4,
      ] as [number, number, number],
      scale: [2.2 + rng() * 1.6, 1.4 + rng() * 1.2, 2 + rng() * 1.4] as [number, number, number],
      rotation: [rng() * 0.6, rng() * Math.PI, rng() * 0.4] as [number, number, number],
      color: rng() > 0.5 ? "#7d6b5d" : "#8c7a68",
    }));
  }, [wx, wz]);

  return (
    <group>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.position} scale={r.scale} rotation={r.rotation} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={r.color} roughness={1} flatShading />
        </mesh>
      ))}
      {[
        [-1.8, 5.2, -1.2, 1.1],
        [1.7, 5.6, -1.6, 1.3],
        [0.2, 7.6, -2.2, 1.4],
        [-2.6, 2.6, 0.3, 0.9],
        [2.8, 2.2, 0.2, 1.0],
      ].map(([x, y, z, r], i) => (
        <mesh key={i} position={[wx + x, y, wz + z]} castShadow>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#3e8f3a" roughness={1} />
        </mesh>
      ))}
      <Reactive
        id="waterfall"
        kind="pulse"
        message={["💦 Splash! Fresh wishes flowing your way", "💦 The waterfall giggles: Happy Birthday Khushi!"]}
        burst="sparkles"
        burstColor="#bfe6ff"
        burstCount={30}
        sound="whoosh"
        bubbleHeight={2.4}
        position={[wx, 3.6, wz + 0.2]}
      >
        <mesh material={material} position={[0, 0, 0]}>
          <planeGeometry args={[2.6, 7.2, 1, 1]} />
        </mesh>
      </Reactive>
      <mesh rotation-x={-Math.PI / 2} position={[wx, 0.1, wz + 2.4]}>
        <circleGeometry args={[3.6, 32]} />
        <meshStandardMaterial color="#7cc4e6" roughness={0.15} metalness={0.2} transparent opacity={0.92} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[wx, 0.08, wz - 3.4]} scale={[1, 1.6, 1]}>
        <planeGeometry args={[2.4, 5]} />
        <meshStandardMaterial color="#7cc4e6" roughness={0.15} metalness={0.2} transparent opacity={0.9} />
      </mesh>
      <Sparkles count={70} scale={[4, 1.6, 3]} position={[wx, 0.7, wz + 1.2]} size={6} speed={2.2} color="#ffffff" opacity={0.85} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Stone path + hedges                                                  */
/* ------------------------------------------------------------------ */

export function StonePath() {
  const { stones, stoneColors, hedges } = useMemo(() => {
    const rng = makeRng(11);
    const stones: THREE.Matrix4[] = [];
    const stoneColors: THREE.Color[] = [];
    const hedges: THREE.Matrix4[] = [];
    const N = 110;
    const tangent = new THREE.Vector3();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const p = pathCurve.getPointAt(u);
      pathCurve.getTangentAt(u, tangent);
      const nx = -tangent.z;
      const nz = tangent.x;
      for (const side of [-0.62, 0.62]) {
        tmpObj.position.set(
          p.x + nx * side + (rng() - 0.5) * 0.3,
          0.05,
          p.z + nz * side + (rng() - 0.5) * 0.3,
        );
        tmpObj.rotation.set(0, rng() * Math.PI, 0);
        const s = 0.72 + rng() * 0.35;
        tmpObj.scale.set(s, 1, s * 0.82);
        tmpObj.updateMatrix();
        stones.push(tmpObj.matrix.clone());
        const shade = 0.68 + rng() * 0.2;
        stoneColors.push(new THREE.Color(shade, shade * 0.97, shade * 0.9));
      }
      if (i % 2 === 0 && u < 0.9) {
        for (const side of [-2.4, 2.4]) {
          tmpObj.position.set(p.x + nx * side, 0.32, p.z + nz * side);
          tmpObj.rotation.set(0, Math.atan2(tangent.x, tangent.z), 0);
          const s = 0.95 + rng() * 0.2;
          tmpObj.scale.set(s, 0.65 + rng() * 0.25, s);
          tmpObj.updateMatrix();
          hedges.push(tmpObj.matrix.clone());
        }
      }
    }
    return { stones, stoneColors, hedges };
  }, []);
  const stoneGeo = useMemo(() => new THREE.CylinderGeometry(0.75, 0.75, 0.12, 7), []);
  const hedgeGeo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.9, 0.7, 0.95);
    return g;
  }, []);
  return (
    <group>
      <Instanced matrices={stones} colors={stoneColors} geometry={stoneGeo} receiveShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </Instanced>
      <Instanced matrices={hedges} geometry={hedgeGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#2f7a36" roughness={1} />
      </Instanced>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Forest                                                               */
/* ------------------------------------------------------------------ */

function insideLake(x: number, z: number, margin = 1.15) {
  return Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz) < margin;
}

export function Forest() {
  const data = useMemo(() => {
    const rng = makeRng(99);
    const roundTrunks: THREE.Matrix4[] = [];
    const roundCanopies: THREE.Matrix4[] = [];
    const roundColors: THREE.Color[] = [];
    const pineTrunks: THREE.Matrix4[] = [];
    const pineCanopies: THREE.Matrix4[] = [];
    const pineColors: THREE.Color[] = [];
    let attempts = 0;
    while (roundTrunks.length + pineTrunks.length < 260 && attempts < 4000) {
      attempts++;
      const a = rng() * Math.PI * 2;
      const r = 30 + rng() * 55;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (insideLake(x, z, 1.12)) continue;
      if (z > 26 && Math.abs(x) < 16) continue; // keep the view corridor open
      if (z > 0 && z < 26 && Math.abs(x) < 20 && r < 36) continue;
      const y = hillHeight(x, z) - 0.15;
      const s = 0.9 + rng() * 0.9;
      tmpObj.position.set(x, y, z);
      tmpObj.rotation.set(0, rng() * Math.PI * 2, 0);
      tmpObj.scale.set(s, s * (0.9 + rng() * 0.4), s);
      tmpObj.updateMatrix();
      const pine = rng() < 0.4;
      if (pine) {
        pineTrunks.push(tmpObj.matrix.clone());
        pineCanopies.push(tmpObj.matrix.clone());
        pineColors.push(new THREE.Color().setHSL(0.36 + rng() * 0.05, 0.5, 0.26 + rng() * 0.1));
      } else {
        roundTrunks.push(tmpObj.matrix.clone());
        roundCanopies.push(tmpObj.matrix.clone());
        const blossom = rng() < 0.16;
        roundColors.push(
          blossom
            ? new THREE.Color().setHSL(0.92 + rng() * 0.05, 0.75, 0.75)
            : new THREE.Color().setHSL(0.3 + rng() * 0.08, 0.55, 0.32 + rng() * 0.14),
        );
      }
    }
    return { roundTrunks, roundCanopies, roundColors, pineTrunks, pineCanopies, pineColors };
  }, []);

  const trunkGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.22, 0.38, 2.6, 7);
    g.translate(0, 1.3, 0);
    return g;
  }, []);
  const roundCanopyGeo = useMemo(() => {
    const a = new THREE.SphereGeometry(1.5, 12, 10);
    a.translate(0, 3.3, 0);
    const b = new THREE.SphereGeometry(1.1, 10, 8);
    b.translate(0.95, 2.7, 0.4);
    const c = new THREE.SphereGeometry(1.0, 10, 8);
    c.translate(-0.85, 2.8, -0.4);
    return mergeGeometries([a, b, c], false) ?? a;
  }, []);
  const pineCanopyGeo = useMemo(() => {
    const a = new THREE.ConeGeometry(1.5, 2.4, 8);
    a.translate(0, 2.6, 0);
    const b = new THREE.ConeGeometry(1.15, 2.1, 8);
    b.translate(0, 3.9, 0);
    const c = new THREE.ConeGeometry(0.8, 1.8, 8);
    c.translate(0, 5.1, 0);
    return mergeGeometries([a, b, c], false) ?? a;
  }, []);

  return (
    <group>
      <Instanced matrices={data.roundTrunks} geometry={trunkGeo} castShadow>
        <meshStandardMaterial color="#6f4b33" roughness={1} />
      </Instanced>
      <Instanced matrices={data.roundCanopies} colors={data.roundColors} geometry={roundCanopyGeo} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </Instanced>
      <Instanced matrices={data.pineTrunks} geometry={trunkGeo} castShadow>
        <meshStandardMaterial color="#5e3f2a" roughness={1} />
      </Instanced>
      <Instanced matrices={data.pineCanopies} colors={data.pineColors} geometry={pineCanopyGeo} castShadow>
        <meshStandardMaterial color="#ffffff" roughness={0.95} />
      </Instanced>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Mountains & clouds                                                   */
/* ------------------------------------------------------------------ */

export function Mountains() {
  const peaks = useMemo(() => {
    const rng = makeRng(3);
    const list: { position: [number, number, number]; radius: number; height: number; color: string }[] = [];
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * 0.55 + (i / 8) * Math.PI * 1.9;
      const r = 150 + rng() * 60;
      list.push({
        position: [Math.cos(a) * r, -4, Math.sin(a) * r],
        radius: 55 + rng() * 40,
        height: 55 + rng() * 45,
        color: rng() > 0.5 ? "#8ea2bf" : "#7f95b3",
      });
    }
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3;
      if (a > Math.PI * 1.35 && a < Math.PI * 1.65) continue;
      const r = 95 + rng() * 30;
      list.push({
        position: [Math.cos(a) * r, -3, Math.sin(a) * r],
        radius: 30 + rng() * 22,
        height: 16 + rng() * 14,
        color: "#6f9d7c",
      });
    }
    return list;
  }, []);
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh key={i} position={p.position}>
          <coneGeometry args={[p.radius, p.height, 7]} />
          <meshStandardMaterial color={p.color} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function Cloud({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    g.position.x += delta * speed;
    if (g.position.x > 160) g.position.x = -160;
  });
  const puffs = useMemo(
    () => [
      [0, 0, 0, 3.2],
      [3, 0.6, 0.4, 2.6],
      [-3, 0.4, -0.3, 2.4],
      [1.2, 1.6, 0.2, 2.2],
      [-1.4, 1.4, 0.5, 2],
      [5.2, -0.2, 0, 1.8],
      [-5.2, -0.3, 0.2, 1.7],
    ],
    [],
  );
  return (
    <group ref={ref} position={position} scale={scale}>
      {puffs.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

export function Clouds() {
  const clouds = useMemo(() => {
    const rng = makeRng(42);
    return Array.from({ length: 9 }, () => ({
      position: [(rng() - 0.5) * 300, 34 + rng() * 22, -60 - rng() * 120] as [number, number, number],
      scale: 1.6 + rng() * 2.2,
      speed: 0.6 + rng() * 1.2,
    }));
  }, []);
  return (
    <group>
      {clouds.map((c, i) => (
        <Cloud key={i} {...c} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Lamp posts & flower bushes                                           */
/* ------------------------------------------------------------------ */

export function LampPosts() {
  const posts = useMemo(() => {
    const list: { position: [number, number, number] }[] = [];
    const tangent = new THREE.Vector3();
    for (const u of [0.12, 0.38, 0.64, 0.88]) {
      const p = pathCurve.getPointAt(u);
      pathCurve.getTangentAt(u, tangent);
      for (const side of [-3.3, 3.3]) {
        list.push({ position: [p.x - tangent.z * side, 0, p.z + tangent.x * side] });
      }
    }
    return list;
  }, []);
  return (
    <group>
      {posts.map((p, i) => (
        <group key={i} position={p.position}>
          <mesh position={[0, 1.25, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 2.5, 8]} />
            <meshStandardMaterial color="#3b3540" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 2.62, 0]}>
            <sphereGeometry args={[0.24, 14, 12]} />
            <meshStandardMaterial color="#fff2c4" emissive="#ffd27a" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
          <mesh position={[0, 2.92, 0]}>
            <coneGeometry args={[0.32, 0.25, 8]} />
            <meshStandardMaterial color="#3b3540" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function FlowerBushes() {
  const { bushes, flowers, flowerColors } = useMemo(() => {
    const rng = makeRng(77);
    const bushes: THREE.Matrix4[] = [];
    const flowers: THREE.Matrix4[] = [];
    const flowerColors: THREE.Color[] = [];
    const palette = ["#ff5c8a", "#ff8fb1", "#ffd166", "#ff6b6b", "#c77dff", "#ff9f68"];
    const spots: [number, number][] = [];
    const tangent = new THREE.Vector3();
    for (let i = 0; i < 26; i++) {
      const u = rng();
      const p = pathCurve.getPointAt(u);
      pathCurve.getTangentAt(u, tangent);
      const side = (rng() > 0.5 ? 1 : -1) * (8.2 + rng() * 3.5);
      spots.push([p.x - tangent.z * side, p.z + tangent.x * side]);
    }
    for (let i = 0; i < 14; i++) {
      spots.push([-13 + rng() * 26, 8 + rng() * 3.5]);
    }
    for (let i = 0; i < 10; i++) {
      spots.push([(rng() > 0.5 ? 1 : -1) * (12 + rng() * 6), -10 + rng() * 6]);
    }
    for (const [x, z] of spots) {
      if (Math.hypot(x - 14, z - 15) < 5) continue;
      const s = 0.8 + rng() * 0.8;
      tmpObj.position.set(x, 0.4 * s, z);
      tmpObj.rotation.set(0, rng() * Math.PI, 0);
      tmpObj.scale.set(s * (1 + rng() * 0.3), s, s * (1 + rng() * 0.3));
      tmpObj.updateMatrix();
      bushes.push(tmpObj.matrix.clone());
      const n = 5 + Math.floor(rng() * 5);
      for (let j = 0; j < n; j++) {
        const a = rng() * Math.PI * 2;
        const el = rng() * 1.1;
        const fr = 0.72 * s;
        tmpObj.position.set(
          x + Math.cos(a) * Math.cos(el) * fr * 1.1,
          0.4 * s + Math.sin(el) * fr,
          z + Math.sin(a) * Math.cos(el) * fr * 1.1,
        );
        tmpObj.rotation.set(0, 0, 0);
        const fs = 0.12 + rng() * 0.1;
        tmpObj.scale.set(fs, fs, fs);
        tmpObj.updateMatrix();
        flowers.push(tmpObj.matrix.clone());
        flowerColors.push(new THREE.Color(palette[Math.floor(rng() * palette.length)]));
      }
    }
    return { bushes, flowers, flowerColors };
  }, []);
  const bushGeo = useMemo(() => new THREE.SphereGeometry(0.75, 12, 10), []);
  const flowerGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  return (
    <group>
      <Instanced matrices={bushes} geometry={bushGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#2f7d3a" roughness={1} />
      </Instanced>
      <Instanced matrices={flowers} colors={flowerColors} geometry={flowerGeo}>
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </Instanced>
    </group>
  );
}

/** Where is it safe to plant tulips (not on the path / castle / water). */
export function plantable(x: number, z: number) {
  if (lakeMask(x, z) < 0.5) return false;
  if (Math.abs(x) < 11.5 && z > -9.5 && z < 7.6) return false; // castle plinth
  return true;
}
