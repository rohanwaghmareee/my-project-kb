"use client";

import { Html, useCursor } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import * as THREE from "three";
import type { DiscoveryKey } from "@/lib/constants";
import { playSound } from "@/lib/sound";
import { useFairy, type Burst } from "@/lib/store";
import { makeRng, makeTextTexture, tmpColor, tmpObj, tmpVec } from "@/lib/three-utils";

export type ReactionKind =
  | "hop"
  | "spin"
  | "wiggle"
  | "bow"
  | "bounce"
  | "float"
  | "shake"
  | "pulse"
  | "rear"
  | "none";

type SoundKind = Parameters<typeof playSound>[0];

export type ReactiveProps = {
  id?: DiscoveryKey;
  message: string | string[];
  kind?: ReactionKind;
  duration?: number;
  burst?: Burst["kind"] | null;
  burstColor?: string;
  burstCount?: number;
  sound?: SoundKind;
  bubbleHeight?: number;
  bubbleScale?: number;
  hoverScale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  onReact?: () => void;
  ref?: Ref<THREE.Group>;
  children: ReactNode;
};

const worldScale = new THREE.Vector3();

/**
 * Wraps any 3D model and makes it come alive: hover highlight, click animation,
 * particle burst, speech bubble, sound and discovery tracking.
 */
export function Reactive({
  id,
  message,
  kind = "bounce",
  duration = 1.5,
  burst = "sparkles",
  burstColor = "#ffd6ea",
  burstCount,
  sound = "pop",
  bubbleHeight = 1.5,
  bubbleScale = 1,
  hoverScale = 1.08,
  position,
  rotation,
  scale,
  onReact,
  ref,
  children,
}: ReactiveProps) {
  const outer = useRef<THREE.Group | null>(null);
  const inner = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const clock = useRef(duration);
  const hover = useRef(1);
  const timeout = useRef<number | null>(null);
  const discover = useFairy((s) => s.discover);
  const addBurst = useFairy((s) => s.addBurst);
  useCursor(hovered);

  useEffect(
    () => () => {
      if (timeout.current) window.clearTimeout(timeout.current);
    },
    [],
  );

  const setRefs = (node: THREE.Group | null) => {
    outer.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as RefObject<THREE.Group | null>).current = node;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    clock.current = 0;
    const text = Array.isArray(message)
      ? message[Math.floor(Math.random() * message.length)]
      : message;
    setBubble(text);
    if (timeout.current) window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setBubble(null), 2800);
    if (burst && outer.current) {
      const p = outer.current.getWorldPosition(tmpVec);
      const s = outer.current.getWorldScale(worldScale).y;
      addBurst({
        position: [p.x, p.y + bubbleHeight * s * 0.5, p.z],
        color: burstColor,
        kind: burst,
        count: burstCount,
      });
    }
    if (id) discover(id);
    playSound(sound);
    onReact?.();
  };

  useFrame((_, delta) => {
    const g = inner.current;
    if (!g) return;
    clock.current = Math.min(clock.current + delta, duration);
    const p = clock.current / duration;
    const e = 1 - p;
    const target = hovered ? hoverScale : 1;
    hover.current += (target - hover.current) * Math.min(1, delta * 10);

    let py = 0;
    let rx = 0;
    let ry = 0;
    let rz = 0;
    let sx = 1;
    let sy = 1;
    let sz = 1;
    switch (kind) {
      case "hop": {
        const h = Math.abs(Math.sin(p * Math.PI * 3));
        py = h * 0.8 * e;
        sy = 1 + 0.18 * (h - 0.5) * e;
        sx = sz = 1 - 0.1 * (h - 0.5) * e;
        break;
      }
      case "spin": {
        const s = p * p * (3 - 2 * p);
        ry = Math.PI * 2 * s;
        py = Math.sin(p * Math.PI) * 0.35;
        break;
      }
      case "wiggle":
        rz = Math.sin(p * Math.PI * 8) * 0.28 * e;
        break;
      case "bow":
        rx = Math.sin(p * Math.PI) * 0.5;
        break;
      case "rear":
        rx = -Math.sin(p * Math.PI) * 0.55;
        py = Math.sin(p * Math.PI) * 0.25;
        break;
      case "bounce": {
        const h = Math.abs(Math.sin(p * Math.PI * 3)) * e;
        sy = 1 + 0.35 * h;
        sx = sz = 1 - 0.15 * h;
        break;
      }
      case "float":
        py = Math.sin(p * Math.PI) * 1.4;
        ry = Math.PI * 2 * p;
        break;
      case "shake":
        rx = Math.sin(p * Math.PI * 10) * 0.07 * e;
        rz = Math.cos(p * Math.PI * 9) * 0.07 * e;
        break;
      case "pulse": {
        const s = 1 + Math.sin(p * Math.PI * 4) * 0.18 * e;
        sx = sy = sz = s;
        break;
      }
      case "none":
        break;
    }
    const hs = hover.current;
    g.position.set(0, py, 0);
    g.rotation.set(rx, ry, rz);
    g.scale.set(sx * hs, sy * hs, sz * hs);
  });

  return (
    <group
      ref={setRefs}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={inner}>
        {children}
        {bubble && (
          <Html
            position={[0, bubbleHeight, 0]}
            center
            zIndexRange={[30, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div className="fairy-bubble" style={{ fontSize: `${15 * bubbleScale}px` }}>{bubble}</div>
          </Html>
        )}
      </group>
    </group>
  );
}

/** Gentle idle bobbing / swaying for creatures and floating things. */
export function Bob({
  children,
  amplitude = 0.05,
  speed = 2,
  sway = 0,
  offset = 0,
  spin = 0,
}: {
  children: ReactNode;
  amplitude?: number;
  speed?: number;
  sway?: number;
  offset?: number;
  spin?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.getElapsedTime() * speed + offset;
    g.position.y = Math.sin(t) * amplitude;
    g.rotation.z = Math.sin(t * 0.7) * sway;
    if (spin) g.rotation.y = clock.getElapsedTime() * spin;
  });
  return <group ref={ref}>{children}</group>;
}

/* ------------------------------------------------------------------ */
/* Particle bursts                                                      */
/* ------------------------------------------------------------------ */

const burstGeometries: Partial<Record<Burst["kind"], THREE.BufferGeometry>> = {};

export function getHeartGeometry() {
  return getBurstGeometry("hearts");
}

export function getBurstGeometry(kind: Burst["kind"]) {
  const cached = burstGeometries[kind];
  if (cached) return cached;
  let geo: THREE.BufferGeometry;
  if (kind === "hearts") {
    const s = new THREE.Shape();
    s.moveTo(25, 25);
    s.bezierCurveTo(25, 25, 20, 0, 0, 0);
    s.bezierCurveTo(-30, 0, -30, 35, -30, 35);
    s.bezierCurveTo(-30, 55, -10, 77, 25, 95);
    s.bezierCurveTo(60, 77, 80, 55, 80, 35);
    s.bezierCurveTo(80, 35, 80, 0, 50, 0);
    s.bezierCurveTo(35, 0, 25, 25, 25, 25);
    geo = new THREE.ShapeGeometry(s, 6);
    geo.rotateZ(Math.PI);
    geo.center();
    geo.scale(0.012, 0.012, 0.012);
  } else if (kind === "sparkles") {
    geo = new THREE.OctahedronGeometry(0.7, 0);
  } else if (kind === "petals") {
    geo = new THREE.CircleGeometry(0.7, 8);
    geo.scale(0.6, 1, 1);
  } else {
    geo = new THREE.PlaneGeometry(0.8, 0.5);
  }
  burstGeometries[kind] = geo;
  return geo;
}

function BurstFx({ burst }: { burst: Burst }) {
  const count = burst.count ?? (burst.kind === "hearts" ? 16 : 24);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const remove = useFairy((s) => s.removeBurst);
  const life = useRef(0);
  const duration = burst.kind === "hearts" ? 1.9 : 1.4;
  const geometry = useMemo(() => getBurstGeometry(burst.kind), [burst.kind]);

  const particles = useMemo(() => {
    const rng = makeRng(burst.id * 97 + 3);
    return Array.from({ length: count }, () => {
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);
      const speed = 1.2 + rng() * 2.4;
      return {
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.abs(Math.cos(phi)) * speed + 1.2,
        vz: Math.sin(phi) * Math.sin(theta) * speed,
        size: 0.6 + rng() * 0.8,
        spin: (rng() - 0.5) * 9,
        rot: rng() * Math.PI * 2,
        hue: rng(),
      };
    });
  }, [burst.id, count]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    if (burst.kind === "confetti") {
      particles.forEach((p, i) => m.setColorAt(i, tmpColor.setHSL(p.hue, 0.85, 0.62)));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }, [burst.kind, particles]);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    life.current += delta;
    const t = life.current;
    if (t >= duration) {
      remove(burst.id);
      return;
    }
    const fade = 1 - t / duration;
    const gravity = burst.kind === "hearts" ? -0.9 : burst.kind === "sparkles" ? 1.2 : 3.2;
    const k = 1 - Math.exp(-t * 2.6);
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      const x = p.vx * k;
      const z = p.vz * k;
      const y = p.vy * k - 0.5 * gravity * t * t;
      tmpObj.position.set(x, y, z);
      if (burst.kind === "hearts" || burst.kind === "petals") {
        tmpObj.quaternion.copy(state.camera.quaternion);
        tmpObj.rotateZ(p.rot + t * p.spin * 0.4);
      } else {
        tmpObj.rotation.set(p.rot + t * p.spin, p.rot * 0.5 + t * p.spin * 0.6, 0);
      }
      const s = p.size * 0.22 * (burst.kind === "hearts" ? 1.6 : 1) * Math.min(1, fade * 1.5);
      tmpObj.scale.setScalar(s);
      tmpObj.updateMatrix();
      m.setMatrixAt(i, tmpObj.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, fade * 2.2);
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, count]}
      position={burst.position}
      frustumCulled={false}
    >
      <meshBasicMaterial
        color={burst.kind === "confetti" ? "#ffffff" : burst.color}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export function Bursts() {
  const bursts = useFairy((s) => s.bursts);
  return (
    <>
      {bursts.map((b) => (
        <BurstFx key={b.id} burst={b} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Instancing helper                                                    */
/* ------------------------------------------------------------------ */

export function Instanced({
  matrices,
  colors,
  geometry,
  castShadow,
  receiveShadow,
  children,
}: {
  matrices: THREE.Matrix4[];
  colors?: THREE.Color[];
  geometry: THREE.BufferGeometry;
  castShadow?: boolean;
  receiveShadow?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
    if (colors) {
      colors.forEach((c, i) => m.setColorAt(i, c));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }
  }, [matrices, colors]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, undefined, Math.max(1, matrices.length)]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    >
      {children}
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* Text planes & signs                                                  */
/* ------------------------------------------------------------------ */

export function TextPlane({
  text,
  width = 4,
  height = 1,
  color = "#ffffff",
  background,
  font,
  stroke,
  shadow,
  position,
  rotation,
  doubleSided = true,
}: {
  text: string;
  width?: number;
  height?: number;
  color?: string;
  background?: string;
  font?: string;
  stroke?: string;
  shadow?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  doubleSided?: boolean;
}) {
  const texture = useMemo(
    () =>
      makeTextTexture(text, {
        color,
        background,
        font,
        stroke,
        shadow,
        width: 1024,
        height: Math.max(64, Math.round((1024 * height) / width)),
      }),
    [text, color, background, font, stroke, shadow, width, height],
  );
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        side={doubleSided ? THREE.DoubleSide : THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function Sign({
  text,
  position,
  rotation,
  width = 3,
}: {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 1.4, 8]} />
        <meshStandardMaterial color="#7a5235" />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[width, 0.8, 0.1]} />
        <meshStandardMaterial color="#a8764f" />
      </mesh>
      <TextPlane
        text={text}
        width={width - 0.2}
        height={0.6}
        position={[0, 1.55, 0.06]}
        color="#fff5f8"
        font='600 110px "Great Vibes", cursive'
        shadow="rgba(0,0,0,0.4)"
      />
    </group>
  );
}

/** Arched outline used for castle doors and windows. */
export function archShape(width: number, height: number) {
  const s = new THREE.Shape();
  const r = width / 2;
  s.moveTo(-r, 0);
  s.lineTo(-r, height - r);
  s.absarc(0, height - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  return s;
}

/** Arch frame (arch with an arch-shaped hole). */
export function archFrameShape(width: number, height: number, thickness: number) {
  const r = width / 2;
  const R = r + thickness;
  const outer = new THREE.Shape();
  outer.moveTo(-R, -thickness);
  outer.lineTo(-R, height - r);
  outer.absarc(0, height - r, R, Math.PI, 0, true);
  outer.lineTo(R, -thickness);
  outer.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-r, 0);
  hole.lineTo(-r, height - r);
  hole.absarc(0, height - r, r, Math.PI, 0, true);
  hole.lineTo(r, 0);
  hole.closePath();
  outer.holes.push(hole);
  return outer;
}
